const express = require('express');
const { pool } = require('../config/database');
const {
  formatResponse,
  generatePagination,
  isPastDate,
  isValidDateRange
} = require('../utils/helpers');
const {
  validateProperty,
  validateId,
  validatePagination
} = require('../middleware/validation');
const { verifyToken, requirePropertyOwner, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all properties with filters and pagination
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      property_type,
      min_price,
      max_price,
      min_guests,
      amenities,
      check_in_date,
      check_out_date,
      sort_by = 'created_at',
      sort_order = 'DESC',
      owner = false,
      status,
      recommended = false,
      is_featured = false
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    // Handle owner filter
    if (owner === 'true' && req.user) {
      whereConditions.push('p.owner_id = ?');
      queryParams.push(req.user.id);
    } else if (owner !== 'true') {
      whereConditions.push('p.status = "active"');
    }

    // Handle status filter for property owners
    if (status && owner === 'true') {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    // Handle featured properties
    if (is_featured === 'true') {
      whereConditions.push('p.is_featured = 1');
    }

    // Handle recommended properties (based on user preferences or popular)
    if (recommended === 'true') {
      whereConditions.push('p.average_rating >= 4.0');
      whereConditions.push('p.total_reviews >= 5');
    }

    // Build WHERE conditions
    if (city) {
      whereConditions.push('p.city LIKE ?');
      queryParams.push(`%${city}%`);
    }

    if (property_type) {
      whereConditions.push('p.property_type = ?');
      queryParams.push(property_type);
    }

    if (min_price) {
      whereConditions.push('p.base_price >= ?');
      queryParams.push(min_price);
    }

    if (max_price) {
      whereConditions.push('p.base_price <= ?');
      queryParams.push(max_price);
    }

    if (min_guests) {
      whereConditions.push('p.max_guests >= ?');
      queryParams.push(min_guests);
    }

    // Check availability if dates provided
    if (check_in_date && check_out_date) {
      if (!isValidDateRange(check_in_date, check_out_date)) {
        return res.status(400).json(
          formatResponse(false, 'Check-out date must be after check-in date')
        );
      }

      whereConditions.push(`
        p.id NOT IN (
          SELECT DISTINCT b.property_id 
          FROM bookings b 
          WHERE (
            b.status IN ('confirmed', 'checked_in')
            OR (
              b.status = 'pending' 
              AND b.confirmed_at IS NOT NULL 
              AND b.payment_deadline IS NOT NULL 
              AND b.payment_deadline > NOW()
            )
          )
          AND (
            (b.check_in_date <= ? AND b.check_out_date > ?) OR
            (b.check_in_date < ? AND b.check_out_date >= ?) OR
            (b.check_in_date >= ? AND b.check_out_date <= ?)
          )
        )
      `);
      queryParams.push(check_out_date, check_in_date, check_out_date, check_in_date, check_in_date, check_out_date);
    }

    // Build amenity filter
    if (amenities) {
      const amenityIds = amenities.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (amenityIds.length > 0) {
        whereConditions.push(`
          p.id IN (
            SELECT pa.property_id 
            FROM property_amenities pa 
            WHERE pa.amenity_id IN (${amenityIds.map(() => '?').join(',')})
            GROUP BY pa.property_id 
            HAVING COUNT(DISTINCT pa.amenity_id) = ?
          )
        `);
        queryParams.push(...amenityIds, amenityIds.length);
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM properties p 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get properties with owner info
    const [properties] = await pool.query(`
      SELECT 
        p.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone,
        po.business_name,
        po.is_verified as owner_verified
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
      ORDER BY p.${sort_by} ${sort_order}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    // Get amenities for each property
    for (let property of properties) {
      const [amenities] = await pool.execute(`
        SELECT a.id, a.name, a.icon, a.category
        FROM amenities a
        JOIN property_amenities pa ON a.id = pa.amenity_id
        WHERE pa.property_id = ? AND a.is_active = 1
        ORDER BY a.category, a.name
      `, [property.id]);
      property.amenities = amenities;
    }

    // Get main image for each property
    for (let property of properties) {
      const [images] = await pool.execute(`
        SELECT image_url, alt_text
        FROM property_images
        WHERE property_id = ? AND image_type = 'main' AND is_active = 1
        LIMIT 1
      `, [property.id]);
      property.main_image = images[0] || null;
    }

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        properties,
        pagination
      })
    );

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Get single property by ID
router.get('/:id', optionalAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Get property details
    const [properties] = await pool.execute(`
      SELECT 
        p.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone,
        u.profile_image as owner_profile_image,
        u.created_at as owner_joined_at,
        u.bio as owner_bio,
        u.work as owner_work,
        u.school as owner_school,
        u.is_superhost as owner_is_superhost,
        u.languages as owner_languages,
        po.business_name,
        po.is_verified as owner_verified
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      WHERE p.id = ? AND p.status = 'active'
    `, [id]);

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    const property = properties[0];

    // Get amenities
    const [amenities] = await pool.execute(`
      SELECT a.id, a.name, a.icon, a.category
      FROM amenities a
      JOIN property_amenities pa ON a.id = pa.amenity_id
      WHERE pa.property_id = ? AND a.is_active = 1
      ORDER BY a.category, a.name
    `, [id]);
    property.amenities = amenities;

    // Get all images
    const [images] = await pool.execute(`
      SELECT id, image_url, image_type, alt_text, sort_order
      FROM property_images
      WHERE property_id = ? AND is_active = 1
      ORDER BY image_type, sort_order
    `, [id]);
    property.images = images;

    // Get property rules
    const [rules] = await pool.execute(`
      SELECT rule_type, title, description, is_mandatory
      FROM property_rules
      WHERE property_id = ?
      ORDER BY rule_type
    `, [id]);
    property.rules = rules;

    // Get review statistics
    const [reviewStats] = await pool.execute(`
      SELECT 
        AVG(cleanliness_rating) as cleanliness,
        AVG(accuracy_rating) as accuracy,
        AVG(check_in_rating) as check_in,
        AVG(communication_rating) as communication,
        AVG(location_rating) as location,
        AVG(value_rating) as value
      FROM reviews
      WHERE property_id = ? AND status = 'approved' AND is_public = 1
    `, [id]);

    // Convert to numbers and handle nulls
    const stats = reviewStats[0] || {};
    property.review_scores = {
      cleanliness: stats.cleanliness !== null ? Number(stats.cleanliness) : null,
      accuracy: stats.accuracy !== null ? Number(stats.accuracy) : null,
      check_in: stats.check_in !== null ? Number(stats.check_in) : null,
      communication: stats.communication !== null ? Number(stats.communication) : null,
      location: stats.location !== null ? Number(stats.location) : null,
      value: stats.value !== null ? Number(stats.value) : null
    };

    // Get rating distribution (group by integer rating)
    const [ratingDist] = await pool.execute(`
      SELECT CAST(rating AS UNSIGNED) as star, COUNT(*) as count
      FROM reviews
      WHERE property_id = ? AND status = 'approved' AND is_public = 1
      GROUP BY star
    `, [id]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDist.forEach(row => {
      // Ensure we only map valid 1-5 ratings
      if (row.star >= 1 && row.star <= 5) {
        distribution[row.star] = row.count;
      }
    });
    property.review_distribution = distribution;

    // Get cancellation policy
    const [policies] = await pool.execute(`
      SELECT cp.name, cp.description, cp.free_cancellation_hours, 
             cp.cancellation_fee_percentage, cp.no_show_fee_percentage
      FROM cancellation_policies cp
      JOIN property_policies pp ON cp.id = pp.cancellation_policy_id
      WHERE pp.property_id = ? AND cp.is_active = 1
    `, [id]);
    property.cancellation_policy = policies[0] || null;

    // Get recent reviews
    const [reviews] = await pool.execute(`
      SELECT r.rating, r.title, r.comment, r.created_at,
             u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      WHERE r.property_id = ? AND r.status = 'approved' AND r.is_public = 1
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [id]);
    property.recent_reviews = reviews;

    res.json(
      formatResponse(true, 'Property retrieved successfully', { property })
    );

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property', null, error.message)
    );
  }
});

// Create new property (Property owners only)
router.post('/', verifyToken, requirePropertyOwner, validateProperty, async (req, res) => {
  try {
    const {
      title,
      description,
      property_type,
      property_category = 'standard',
      address,
      city,
      state,
      country,
      postal_code,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      max_guests,
      size_sqft,
      floor_number,
      base_price,
      cleaning_fee = 0,
      security_deposit = 0,
      extra_guest_fee = 0,
      check_in_time = '15:00:00',
      check_out_time = '11:00:00',
      minimum_stay = 1,
      maximum_stay,
      is_instant_book = false,
      amenities = []
    } = req.body;

    // Get property owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [req.user.id]
    );

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner profile not found')
      );
    }

    const ownerId = owners[0].id;

    // Create property
    const [result] = await pool.execute(`
      INSERT INTO properties (
        owner_id, title, description, property_type, property_category,
        address, city, state, country, postal_code, latitude, longitude,
        bedrooms, bathrooms, max_guests, size_sqft, floor_number,
        base_price, cleaning_fee, security_deposit, extra_guest_fee,
        check_in_time, check_out_time, minimum_stay, maximum_stay,
        is_instant_book, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', NOW())
    `, [
      ownerId, title, description, property_type, property_category,
      address, city, state, country, postal_code, latitude, longitude,
      bedrooms, bathrooms, max_guests, size_sqft, floor_number,
      base_price, cleaning_fee, security_deposit, extra_guest_fee,
      check_in_time, check_out_time, minimum_stay, maximum_stay,
      is_instant_book
    ]);

    const propertyId = result.insertId;

    // Add amenities
    if (amenities.length > 0) {
      const amenityValues = amenities.map(amenityId => [propertyId, amenityId]);
      await pool.execute(
        'INSERT INTO property_amenities (property_id, amenity_id) VALUES ?',
        [amenityValues]
      );
    }

    // Get created property
    const [properties] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [propertyId]
    );

    res.status(201).json(
      formatResponse(true, 'Property created successfully', { property: properties[0] })
    );

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create property', null, error.message)
    );
  }
});

// Update property (Property owners only)
router.put('/:id', verifyToken, requirePropertyOwner, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if property exists and belongs to user
    const [properties] = await pool.execute(`
      SELECT p.id FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      WHERE p.id = ? AND po.user_id = ?
    `, [id, req.user.id]);

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found or access denied')
      );
    }

    // Build update query
    const allowedFields = [
      'title', 'description', 'property_type', 'property_category',
      'address', 'city', 'state', 'country', 'postal_code',
      'latitude', 'longitude', 'bedrooms', 'bathrooms', 'max_guests',
      'size_sqft', 'floor_number', 'base_price', 'cleaning_fee',
      'security_deposit', 'extra_guest_fee', 'check_in_time',
      'check_out_time', 'minimum_stay', 'maximum_stay', 'is_instant_book'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'No valid fields to update')
      );
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE properties SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );

    // Update amenities if provided
    if (updateData.amenities) {
      // Remove existing amenities
      await pool.execute(
        'DELETE FROM property_amenities WHERE property_id = ?',
        [id]
      );

      // Add new amenities
      if (updateData.amenities.length > 0) {
        const amenityValues = updateData.amenities.map(amenityId => [id, amenityId]);
        const placeholders = amenityValues.map(() => '(?, ?)').join(', ');
        const values = amenityValues.flat();
        await pool.execute(
          `INSERT INTO property_amenities (property_id, amenity_id) VALUES ${placeholders}`,
          values
        );
      }
    }

    // Get updated property
    const [updatedProperties] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Property updated successfully', { property: updatedProperties[0] })
    );

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property', null, error.message)
    );
  }
});

// Delete property (Property owners only)
router.delete('/:id', verifyToken, requirePropertyOwner, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and belongs to user
    const [properties] = await pool.execute(`
      SELECT p.id FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      WHERE p.id = ? AND po.user_id = ?
    `, [id, req.user.id]);

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found or access denied')
      );
    }

    // Check if property has active bookings
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE property_id = ? AND status IN ("confirmed", "checked_in")',
      [id]
    );

    if (bookings.length > 0) {
      return res.status(400).json(
        formatResponse(false, 'Cannot delete property with active bookings')
      );
    }

    // Soft delete (change status to inactive)
    await pool.execute(
      'UPDATE properties SET status = "inactive", updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Property deleted successfully')
    );

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete property', null, error.message)
    );
  }
});

// Get all amenities
router.get('/amenities/list', async (req, res) => {
  try {
    const [amenities] = await pool.execute(`
      SELECT id, name, icon, category
      FROM amenities
      WHERE is_active = 1
      ORDER BY category, name
    `);

    res.json(
      formatResponse(true, 'Amenities retrieved successfully', { amenities })
    );

  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve amenities', null, error.message)
    );
  }
});

// Get all active property types
router.get('/property-types/list', async (req, res) => {
  try {
    const [propertyTypes] = await pool.execute(`
      SELECT id, name, description
      FROM property_types
      WHERE is_active = 1
      ORDER BY sort_order, name
    `);

    res.json(
      formatResponse(true, 'Property types retrieved successfully', { propertyTypes })
    );

  } catch (error) {
    console.error('Get property types error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property types', null, error.message)
    );
  }
});

// Public: distinct property locations for suggestions
router.get('/locations/list', async (_req, res) => {
  try {
    const [locations] = await pool.execute(`
      SELECT DISTINCT 
        TRIM(p.city) AS city,
        TRIM(p.state) AS state,
        TRIM(p.country) AS country
      FROM properties p
      WHERE p.status = "active" AND p.city IS NOT NULL AND p.city <> ''
      ORDER BY city ASC
    `);

    res.json(
      formatResponse(true, 'Locations retrieved successfully', { locations })
    );
  } catch (error) {
    console.error('Get locations list error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve locations', null, error.message)
    );
  }
});

// Get blocked dates for a property (for calendar display)
router.get('/:id/blocked-dates', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Get all blocked date ranges from bookings
    // Include bookings that are confirmed/checked_in OR pending with owner acceptance and payment deadline not expired
    const [bookings] = await pool.execute(`
      SELECT check_in_date, check_out_date
      FROM bookings
      WHERE property_id = ? 
      AND (
        status IN ('confirmed', 'checked_in')
        OR (
          status = 'pending' 
          AND confirmed_at IS NOT NULL 
          AND payment_deadline IS NOT NULL 
          AND payment_deadline > NOW()
        )
      )
      AND check_out_date >= CURDATE()
      ORDER BY check_in_date ASC
    `, [id]);

    // Generate array of all blocked dates
    const blockedDates = [];
    bookings.forEach(booking => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);

      // Add all dates from check_in_date to check_out_date (exclusive)
      const currentDate = new Date(checkIn);
      // Safeguard: Limit to 2 years (730 days) to prevent infinite loops or memory exhaustion
      let dayCount = 0;
      const MAX_DAYS = 730;

      while (currentDate < checkOut && dayCount < MAX_DAYS) {
        blockedDates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
      }

      if (dayCount >= MAX_DAYS) {
        console.warn(`Booking ${booking.id || 'unknown'} has an unusually long duration (> 2 years). Truncated blocked dates.`);
      }
    });

    res.json(
      formatResponse(true, 'Blocked dates retrieved successfully', {
        blockedDates: [...new Set(blockedDates)] // Remove duplicates
      })
    );

  } catch (error) {
    console.error('Get blocked dates error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve blocked dates', null, error.message)
    );
  }
});

// Check property availability
router.get('/:id/availability', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in_date, check_out_date } = req.query;

    if (!check_in_date || !check_out_date) {
      return res.status(400).json(
        formatResponse(false, 'Check-in and check-out dates are required')
      );
    }

    if (!isValidDateRange(check_in_date, check_out_date)) {
      return res.status(400).json(
        formatResponse(false, 'Check-out date must be after check-in date')
      );
    }

    // Check for conflicting bookings
    // Include bookings that are confirmed/checked_in OR pending with owner acceptance and payment deadline not expired
    const [conflicts] = await pool.execute(`
      SELECT id, check_in_date, check_out_date, status
      FROM bookings
      WHERE property_id = ? 
      AND (
        status IN ('confirmed', 'checked_in')
        OR (
          status = 'pending' 
          AND confirmed_at IS NOT NULL 
          AND payment_deadline IS NOT NULL 
          AND payment_deadline > NOW()
        )
      )
      AND (
        (check_in_date <= ? AND check_out_date > ?) OR
        (check_in_date < ? AND check_out_date >= ?) OR
        (check_in_date >= ? AND check_out_date <= ?)
      )
    `, [id, check_out_date, check_in_date, check_out_date, check_in_date, check_in_date, check_out_date]);

    const isAvailable = conflicts.length === 0;

    res.json(
      formatResponse(true, 'Availability checked successfully', {
        isAvailable,
        conflicts: conflicts.length > 0 ? conflicts : null
      })
    );

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to check availability', null, error.message)
    );
  }
});

module.exports = router;
