const express = require('express');
const { pool } = require('../../config/database');
const {
  formatResponse,
  generatePagination,
  isPastDate,
  isValidDateRange
} = require('../../utils/helpers');
const { sendSMS } = require('../../utils/sms');
const {
  validateProperty,
  validateId,
  validatePagination
} = require('../../middleware/validation');
const { verifyToken, requirePropertyOwner } = require('../../middleware/auth');

// Import earnings routes
const earningsRoutes = require('./property-owner-earnings');

const router = express.Router();

// Apply authentication and property owner middleware to all routes
router.use(verifyToken);
router.use(requirePropertyOwner);

// Get property owner dashboard
router.get('/dashboard', async (req, res) => {
  try {
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

    // Get total counts
    const [propertyCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM properties WHERE owner_id = ?',
      [ownerId]
    );

    const [bookingCount] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.status != 'cancelled'
    `, [ownerId]);

    const [revenueResult] = await pool.execute(`
      SELECT SUM(b.total_amount) as total 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.payment_status = 'paid' AND b.status != 'cancelled'
    `, [ownerId]);

    // Get recent bookings
    const [recentBookings] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.total_amount, b.status, b.created_at,
        b.check_in_date, b.check_out_date,
        u.first_name, u.last_name,
        p.title as property_title
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.status != 'cancelled'
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [ownerId]);

    // Get upcoming bookings
    const [upcomingBookings] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.check_in_date, b.check_out_date,
        u.first_name, u.last_name,
        p.title as property_title
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.status = 'confirmed' AND b.check_in_date >= CURDATE()
      ORDER BY b.check_in_date ASC
      LIMIT 5
    `, [ownerId]);

    res.json(
      formatResponse(true, 'Property owner dashboard data retrieved successfully', {
        statistics: {
          totalProperties: propertyCount[0].total,
          totalBookings: bookingCount[0].total,
          totalRevenue: revenueResult[0].total || 0
        },
        recentBookings,
        upcomingBookings
      })
    );

  } catch (error) {
    console.error('Get property owner dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve dashboard data', null, error.message)
    );
  }
});

// Get property owner's properties
router.get('/properties', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

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

    let whereConditions = ['p.owner_id = ?'];
    let queryParams = [ownerId];

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.city LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM properties p 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get properties
    const [properties] = await pool.query(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM bookings WHERE property_id = p.id) as total_bookings,
        (SELECT SUM(total_amount) FROM bookings WHERE property_id = p.id AND payment_status = 'paid') as total_revenue
      FROM properties p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    // Get amenities and main image for each property
    for (let property of properties) {
      // Get amenities
      const [amenities] = await pool.execute(`
        SELECT a.id, a.name, a.icon, a.category
        FROM amenities a
        JOIN property_amenities pa ON a.id = pa.amenity_id
        WHERE pa.property_id = ? AND a.is_active = 1
        ORDER BY a.category, a.name
      `, [property.id]);
      property.amenities = amenities;

      // Get main image
      const [images] = await pool.execute(`
        SELECT image_url, alt_text
        FROM property_images
        WHERE property_id = ? AND is_active = 1
        ORDER BY 
          CASE WHEN image_type = 'main' THEN 0 ELSE 1 END,
          sort_order
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

// Get single property details
router.get('/properties/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

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

    // Get property details
    const [properties] = await pool.execute(`
      SELECT p.*
      FROM properties p
      WHERE p.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found or access denied')
      );
    }

    const property = properties[0];

    // Get amenities
    const [amenities] = await pool.execute(`
      SELECT a.id, a.name, a.icon, a.category
      FROM amenities a
      JOIN property_amenities pa ON a.id = pa.amenity_id
      WHERE pa.property_id = ?
    `, [id]);

    property.amenities = amenities;

    // Get images
    const [images] = await pool.execute(`
      SELECT id, image_url, image_type, alt_text, sort_order
      FROM property_images
      WHERE property_id = ?
      ORDER BY sort_order, id
    `, [id]);

    property.images = images;

    res.json(
      formatResponse(true, 'Property retrieved successfully', property)
    );

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property', null, error.message)
    );
  }
});

// Create new property
router.post('/properties', async (req, res) => {
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

    // Validate required fields
    if (!title || !description || !address || !city || !state || !country || !base_price) {
      return res.status(400).json(
        formatResponse(false, 'Missing required fields')
      );
    }

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

    // Create property - ensure null values for optional fields
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
      ownerId,
      title,
      description,
      property_type,
      property_category,
      address,
      city,
      state,
      country,
      postal_code || null,
      latitude || null,
      longitude || null,
      bedrooms || 1,
      bathrooms || 1,
      max_guests || 2,
      size_sqft || null,
      floor_number || null,
      base_price,
      cleaning_fee || 0,
      security_deposit || 0,
      extra_guest_fee || 0,
      check_in_time || '15:00:00',
      check_out_time || '11:00:00',
      minimum_stay || 1,
      maximum_stay || null,
      is_instant_book || false
    ]);

    const propertyId = result.insertId;

    // Add amenities
    if (amenities.length > 0) {
      const amenityValues = amenities.map(amenityId => [propertyId, amenityId]);
      const placeholders = amenityValues.map(() => '(?, ?)').join(', ');
      const values = amenityValues.flat();
      await pool.execute(
        `INSERT INTO property_amenities (property_id, amenity_id) VALUES ${placeholders}`,
        values
      );
    }

    // Add images if provided
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      console.log('Saving images:', req.body.images.length, 'images');

      // Add images one by one to avoid SQL syntax issues
      for (let index = 0; index < req.body.images.length; index++) {
        const imageUrl = req.body.images[index];
        await pool.execute(`
          INSERT INTO property_images (property_id, image_url, image_type, alt_text, sort_order, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          propertyId,
          imageUrl,
          index === 0 ? 'main' : 'gallery', // First image is main
          `Property image ${index + 1}`,
          index,
          1
        ]);
      }

      console.log('Images saved successfully');
    }

    // Get created property with images
    const [properties] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [propertyId]
    );

    // Get images
    const [propertyImages] = await pool.execute(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order',
      [propertyId]
    );

    const propertyData = {
      ...properties[0],
      images: propertyImages
    };

    res.status(201).json(
      formatResponse(true, 'Property created successfully', { property: propertyData })
    );

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create property', null, error.message)
    );
  }
});

// Update property
router.put('/properties/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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

    // Check if property exists and belongs to user
    const [properties] = await pool.execute(
      'SELECT id FROM properties WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );

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
        // For string fields, skip empty strings only for optional fields
        // property_type is required, so always include it
        if (typeof updateData[key] === 'string' && updateData[key].trim() === '' &&
          ['postal_code', 'description', 'latitude', 'longitude', 'size_sqft', 'floor_number', 'maximum_stay'].includes(key)) {
          return; // Skip empty strings for optional fields
        }
        // Always include property_type if provided (even if empty string - frontend validation should prevent this)
        if (key === 'property_type' && updateData[key] !== null) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key]);
        } else if (updateData[key] !== null) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key]);
        }
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

    // Update images if provided
    if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0) {
      console.log('Updating images:', updateData.images.length, 'images');

      // Remove existing images
      await pool.execute(
        'DELETE FROM property_images WHERE property_id = ?',
        [id]
      );

      // Add new images one by one
      for (let index = 0; index < updateData.images.length; index++) {
        const imageUrl = updateData.images[index];
        await pool.execute(`
          INSERT INTO property_images (property_id, image_url, image_type, alt_text, sort_order, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          id,
          imageUrl,
          index === 0 ? 'main' : 'gallery',
          `Property image ${index + 1}`,
          index,
          1
        ]);
      }

      console.log('Images saved successfully');
    }

    // Get updated property with images
    const [updatedProperties] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );

    // Get images
    const [propertyImages] = await pool.execute(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order',
      [id]
    );

    const propertyData = {
      ...updatedProperties[0],
      images: propertyImages
    };

    res.json(
      formatResponse(true, 'Property updated successfully', { property: propertyData })
    );

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property', null, error.message)
    );
  }
});

// Delete property
router.delete('/properties/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

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

    // Check if property exists and belongs to user
    const [properties] = await pool.execute(
      'SELECT id FROM properties WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );

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

// Get property owner's bookings
router.get('/bookings', validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;
    const offset = (page - 1) * limit;

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

    let whereClause = 'WHERE p.owner_id = ?';
    let queryParams = [ownerId];

    if (status) {
      whereClause += ' AND b.status = ?';
      queryParams.push(status);
    }

    if (search) {
      whereClause += ' AND (b.booking_reference LIKE ? OR p.title LIKE ? OR b.guest_name LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM bookings b 
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get bookings
    const [bookings] = await pool.query(`
      SELECT 
        b.id, b.booking_reference, b.guest_id, b.property_id,
        b.check_in_date, b.check_out_date, b.check_in_time, b.check_out_time,
        b.number_of_guests, b.number_of_children, b.number_of_infants,
        b.base_price, b.cleaning_fee, b.security_deposit, b.extra_guest_fee,
        b.service_fee, b.tax_amount, b.total_amount, b.currency,
        b.special_requests, b.coupon_code, b.discount_amount,
        b.guest_email, b.guest_phone,
        b.booking_source, b.status, b.payment_status,
        b.confirmed_at, b.cancelled_at, b.cancellation_reason,
        b.created_at, b.updated_at,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        mi.image_url as property_image,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_email_from_user,
        COALESCE(
          NULLIF(NULLIF(b.guest_name, ''), 'undefined undefined'),
          CONCAT(u.first_name, ' ', u.last_name)
        ) as guest_name,
        COALESCE((
          SELECT SUM(amount) 
          FROM payments 
          WHERE booking_id = b.id 
          AND payment_type = 'booking'
          AND status IN ('completed', 'processing')
        ), 0) as paid_amount,
        (b.total_amount - COALESCE((
          SELECT SUM(amount) 
          FROM payments 
          WHERE booking_id = b.id 
          AND payment_type = 'booking'
          AND status IN ('completed', 'processing')
        ), 0)) as due_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      LEFT JOIN property_images mi ON p.id = mi.property_id AND mi.image_type = 'main'
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    // Debug: Log first booking to see data structure
    if (bookings.length > 0) {
      console.log('=== PROPERTY OWNER BOOKINGS DEBUG ===');
      console.log('First booking guest_name:', bookings[0].guest_name);
      console.log('First booking guest_first_name:', bookings[0].guest_first_name);
      console.log('First booking guest_last_name:', bookings[0].guest_last_name);
      console.log('====================================');
    }

    res.json(
      formatResponse(true, 'Bookings retrieved successfully', {
        bookings,
        pagination
      })
    );

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve bookings', null, error.message)
    );
  }
});

// Get earnings summary
router.get('/earnings', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

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

    // Get total earnings (actual payments received - including pending payments with CR amounts)
    const [totalEarnings] = await pool.execute(`
      SELECT 
        COALESCE(SUM(p.cr_amount), 0) as total_earnings,
        COUNT(DISTINCT p.booking_id) as total_bookings
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties pr ON b.property_id = pr.id
      WHERE pr.owner_id = ? 
        AND p.cr_amount > 0
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
    `, [ownerId]);

    // Get earnings for the specified period (actual payments received - including pending payments with CR amounts)
    const [periodEarnings] = await pool.execute(`
      SELECT 
        COALESCE(SUM(p.cr_amount), 0) as period_earnings,
        COUNT(DISTINCT p.booking_id) as period_bookings
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties pr ON b.property_id = pr.id
      WHERE pr.owner_id = ? 
        AND p.cr_amount > 0
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [ownerId, period]);

    // Get previous period for comparison (actual payments received - including pending payments with CR amounts)
    const [prevPeriodEarnings] = await pool.execute(`
      SELECT 
        COALESCE(SUM(p.cr_amount), 0) as prev_earnings,
        COUNT(DISTINCT p.booking_id) as prev_bookings
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties pr ON b.property_id = pr.id
      WHERE pr.owner_id = ? 
        AND p.cr_amount > 0
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND p.created_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [ownerId, period * 2, period]);

    // Get monthly earnings breakdown (actual payments received - including pending payments with CR amounts)
    const [monthlyEarnings] = await pool.execute(`
      SELECT 
        DATE_FORMAT(p.created_at, '%Y-%m') as month,
        COALESCE(SUM(p.cr_amount), 0) as earnings,
        COUNT(DISTINCT p.booking_id) as bookings
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties pr ON b.property_id = pr.id
      WHERE pr.owner_id = ? 
        AND p.cr_amount > 0
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(p.created_at, '%Y-%m')
      ORDER BY month DESC
    `, [ownerId]);

    // Get property-wise earnings (actual payments received - including pending payments with CR amounts)
    const [propertyEarnings] = await pool.execute(`
      SELECT 
        pr.id,
        pr.title,
        pr.city,
        COALESCE(SUM(p.cr_amount), 0) as earnings,
        COUNT(DISTINCT p.booking_id) as bookings,
        AVG(p.cr_amount) as avg_booking_value
      FROM properties pr
      LEFT JOIN bookings b ON pr.id = b.property_id 
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      LEFT JOIN payments p ON b.id = p.booking_id 
        AND p.cr_amount > 0
      WHERE pr.owner_id = ?
      GROUP BY pr.id, pr.title, pr.city
      ORDER BY earnings DESC
    `, [ownerId]);

    // Get pending payments (remaining amounts after partial payments)
    const [pendingPayments] = await pool.execute(`
      SELECT 
        COALESCE(SUM(booking_totals.total_amount - COALESCE(payment_totals.total_received, 0)), 0) as pending_amount,
        COUNT(*) as pending_bookings
      FROM (
        SELECT b.id, b.total_amount
        FROM bookings b
        JOIN properties pr ON b.property_id = pr.id
        WHERE pr.owner_id = ? 
          AND b.status IN ('confirmed', 'checked_in')
      ) booking_totals
      LEFT JOIN (
        SELECT 
          booking_id,
          SUM(cr_amount) as total_received
        FROM payments 
        WHERE status = 'completed' AND cr_amount > 0
        GROUP BY booking_id
      ) payment_totals ON booking_totals.id = payment_totals.booking_id
      WHERE (booking_totals.total_amount - COALESCE(payment_totals.total_received, 0)) > 0
    `, [ownerId]);

    // Get recent earnings (last 10 payment transactions - including pending payments with CR amounts)
    const [recentEarnings] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        p.cr_amount as total_amount,
        p.status as payment_status,
        p.created_at,
        pr.title as property_title,
        CONCAT(u.first_name, ' ', u.last_name) as guest_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties pr ON b.property_id = pr.id
      JOIN users u ON b.guest_id = u.id
      WHERE pr.owner_id = ? 
        AND p.cr_amount > 0
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [ownerId]);

    // Calculate growth rates
    const currentEarnings = periodEarnings[0].period_earnings || 0;
    const previousEarnings = prevPeriodEarnings[0].prev_earnings || 0;
    const earningsGrowth = previousEarnings > 0
      ? ((currentEarnings - previousEarnings) / previousEarnings) * 100
      : 0;

    const currentBookings = periodEarnings[0].period_bookings || 0;
    const previousBookings = prevPeriodEarnings[0].prev_bookings || 0;
    const bookingsGrowth = previousBookings > 0
      ? ((currentBookings - previousBookings) / previousBookings) * 100
      : 0;

    const earningsSummary = {
      totalEarnings: totalEarnings[0].total_earnings || 0,
      totalBookings: totalEarnings[0].total_bookings || 0,
      periodEarnings: currentEarnings,
      periodBookings: currentBookings,
      pendingAmount: pendingPayments[0].pending_amount || 0,
      pendingBookings: pendingPayments[0].pending_bookings || 0,
      earningsGrowth: earningsGrowth.toFixed(1),
      bookingsGrowth: bookingsGrowth.toFixed(1),
      monthlyEarnings: monthlyEarnings,
      propertyEarnings: propertyEarnings,
      recentEarnings: recentEarnings
    };

    res.json(
      formatResponse(true, 'Earnings summary retrieved successfully', earningsSummary)
    );

  } catch (error) {
    console.error('Get earnings summary error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve earnings summary', null, error.message)
    );
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

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

    // Get revenue analytics
    const [revenueData] = await pool.execute(`
      SELECT 
        DATE(b.created_at) as date,
        COUNT(*) as bookings_count,
        SUM(b.total_amount) as total_revenue
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND b.payment_status = 'paid'
      GROUP BY DATE(b.created_at)
      ORDER BY date ASC
    `, [ownerId, period]);

    // Get property performance
    const [propertyPerformance] = await pool.execute(`
      SELECT 
        p.id, p.title, p.city,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_booking_value
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id AND b.payment_status = 'paid'
      WHERE p.owner_id = ?
      GROUP BY p.id, p.title, p.city
      ORDER BY total_revenue DESC
    `, [ownerId]);

    // Get booking status distribution
    const [statusDistribution] = await pool.execute(`
      SELECT 
        b.status,
        COUNT(*) as count
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
      GROUP BY b.status
    `, [ownerId]);

    res.json(
      formatResponse(true, 'Analytics data retrieved successfully', {
        revenueData,
        propertyPerformance,
        statusDistribution
      })
    );

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve analytics data', null, error.message)
    );
  }
});

// Get property owner profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const [users] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, created_at
      FROM users
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Get property owner info
    const [propertyOwners] = await pool.execute(`
      SELECT * FROM property_owners
      WHERE user_id = ?
    `, [userId]);

    const user = users[0];
    if (propertyOwners.length > 0) {
      user.property_owner_info = propertyOwners[0];
    }

    res.json(
      formatResponse(true, 'Profile retrieved successfully', { user })
    );

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve profile', null, error.message)
    );
  }
});

// Update property owner profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      business_name,
      business_license,
      tax_id,
      bank_account_number,
      bank_name,
      bank_routing_number,
      commission_rate
    } = req.body;

    // Check if property owner profile exists
    const [existing] = await pool.execute(`
      SELECT id FROM property_owners
      WHERE user_id = ?
    `, [userId]);

    if (existing.length > 0) {
      // Update existing profile
      await pool.execute(`
        UPDATE property_owners
        SET business_name = ?, business_license = ?, tax_id = ?,
            bank_account_number = ?, bank_name = ?, bank_routing_number = ?,
            commission_rate = ?, updated_at = NOW()
        WHERE user_id = ?
      `, [
        business_name, business_license, tax_id,
        bank_account_number, bank_name, bank_routing_number,
        commission_rate, userId
      ]);
    } else {
      // Create new profile
      await pool.execute(`
        INSERT INTO property_owners (
          user_id, business_name, business_license, tax_id,
          bank_account_number, bank_name, bank_routing_number,
          commission_rate, is_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
      `, [
        userId, business_name, business_license, tax_id,
        bank_account_number, bank_name, bank_routing_number,
        commission_rate
      ]);
    }

    res.json(
      formatResponse(true, 'Profile updated successfully')
    );

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update profile', null, error.message)
    );
  }
});

// Confirm booking (property owner confirms pending booking)
router.patch('/bookings/:id/confirm', validateId, async (req, res) => {
  console.log('=== PROPERTY OWNER CONFIRM BOOKING ROUTE CALLED ===');
  console.log('Booking ID:', req.params.id);
  console.log('User ID:', req.user.id);
  console.log('==================================================');

  try {
    const { id } = req.params;

    // Get property owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [req.user.id]
    );

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner not found')
      );
    }

    const ownerId = owners[0].id;

    // Verify booking belongs to property owner's property
    const [bookings] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    if (booking.status !== 'pending') {
      return res.status(400).json(
        formatResponse(false, 'Only pending bookings can be accepted')
      );
    }

    // Get payment time limit from system settings
    const [settings] = await pool.execute(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'payment_time_limit_minutes'
      LIMIT 1
    `);
    const paymentTimeLimitMinutes = settings.length > 0 ? parseInt(settings[0].setting_value) || 15 : 15;

    // Update booking: Owner accepts, but keep status as 'pending' until payment
    // Use confirmed_at field to track when owner accepted the request
    // Set payment_deadline = NOW() + payment_time_limit_minutes
    await pool.execute(`
      UPDATE bookings
      SET confirmed_at = NOW(),
          payment_deadline = DATE_ADD(NOW(), INTERVAL ? MINUTE),
          updated_at = NOW()
      WHERE id = ?
    `, [paymentTimeLimitMinutes, id]);

    // Create DR entry when owner accepts (receivable amount - admin will receive this)
    const drReference = `DR-${Date.now()}-${id}`;
    await pool.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type,
        amount, currency, dr_amount, cr_amount, transaction_type, notes,
        status, payment_date, created_at
      ) VALUES (?, ?, NULL, 'booking', ?, ?, ?, 0, 'owner_accepted', ?, 'pending', NOW(), NOW())
    `, [
      id,
      drReference,
      booking.total_amount,
      booking.currency || 'BDT',
      booking.total_amount,
      `Owner accepted booking request - Receivable amount: ৳${booking.total_amount}`
    ]);

    console.log(`Owner accepted booking request ${id}. DR entry created: ৳${booking.total_amount}`);

    // Get updated booking
    const [updatedBookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    const confirmedBooking = updatedBookings[0];

    if (confirmedBooking) {
      let guestPhone = null;
      let guestName = confirmedBooking.guest_name || '';

      try {
        const [guestUsers] = await pool.execute(
          `SELECT first_name, last_name, phone 
           FROM users 
           WHERE id = ? 
           LIMIT 1`,
          [confirmedBooking.guest_id]
        );

        if (guestUsers.length > 0) {
          const guestUser = guestUsers[0];
          guestPhone = guestUser.phone;
          const parts = [guestUser.first_name, guestUser.last_name].filter(Boolean);
          guestName = parts.join(' ') || guestName || 'Guest';
        }
      } catch (lookupError) {
        console.error('Failed to lookup guest info for SMS:', lookupError.message || lookupError);
      }

      if (guestPhone) {
        const propertyTitle = confirmedBooking.property_title || 'your booking';
        // Format deadline time
        const deadlineDate = confirmedBooking.payment_deadline ? new Date(confirmedBooking.payment_deadline) : null;
        const deadlineStr = deadlineDate ? deadlineDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : `${paymentTimeLimitMinutes} minutes`;
        const message = `Hi ${guestName || 'Guest'}, your booking request (${confirmedBooking.booking_reference}) for ${propertyTitle} has been accepted. Please complete payment within ${paymentTimeLimitMinutes} minutes (by ${deadlineStr}) to confirm your stay. Otherwise, the booking will be automatically cancelled.`;

        try {
          await sendSMS({
            to: guestPhone,
            message
          });
        } catch (smsError) {
          console.error('Failed to send booking confirmation SMS:', smsError.message || smsError);
        }
      } else {
        console.warn(`Skipping SMS for booking ${id}: missing guest phone number.`);
      }
    }

    res.json(
      formatResponse(true, 'Booking request accepted. Waiting for guest payment.', {
        booking: confirmedBooking,
        message: 'Guest will be notified to make payment to confirm the booking.'
      })
    );

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to confirm booking', null, error.message)
    );
  }
});

// Check-in booking
router.patch('/bookings/:id/checkin', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Get property owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [req.user.id]
    );

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner not found')
      );
    }

    const ownerId = owners[0].id;

    // Verify booking belongs to property owner's property
    const [bookings] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    if (booking.status !== 'confirmed') {
      return res.status(400).json(
        formatResponse(false, 'Only confirmed bookings can be checked in')
      );
    }

    // Check if payment has been completed
    if (booking.payment_status !== 'paid') {
      return res.status(400).json(
        formatResponse(false, 'Payment must be completed before check-in')
      );
    }

    // Update booking status to checked_in
    await pool.execute(`
      UPDATE bookings
      SET status = 'checked_in',
          updated_at = NOW()
      WHERE id = ?
    `, [id]);

    res.json(
      formatResponse(true, 'Guest checked in successfully')
    );

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to check in guest', null, error.message)
    );
  }
});

// Check-out booking
router.patch('/bookings/:id/checkout', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Get property owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [req.user.id]
    );

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner not found')
      );
    }

    const ownerId = owners[0].id;

    // Verify booking belongs to property owner's property
    const [bookings] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    if (booking.status !== 'checked_in') {
      return res.status(400).json(
        formatResponse(false, 'Only checked-in guests can be checked out')
      );
    }

    // Update booking status to checked_out
    await pool.execute(`
      UPDATE bookings
      SET status = 'checked_out',
          updated_at = NOW()
      WHERE id = ?
    `, [id]);

    res.json(
      formatResponse(true, 'Guest checked out successfully')
    );

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to check out guest', null, error.message)
    );
  }
});

// Cancel booking
router.patch('/bookings/:id/cancel', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get property owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [req.user.id]
    );

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner not found')
      );
    }

    const ownerId = owners[0].id;

    // Verify booking belongs to property owner's property
    const [bookings] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json(
        formatResponse(false, 'This booking cannot be cancelled')
      );
    }

    // Update booking status to cancelled
    await pool.execute(`
      UPDATE bookings
      SET status = 'cancelled',
          cancellation_reason = ?,
          cancelled_at = NOW(),
          updated_at = NOW()
      WHERE id = ?
    `, [reason || 'Cancelled by property owner', id]);

    // Refund rewards points if any were redeemed for this booking
    try {
      const { refundPointsForBooking } = require('../../utils/rewardsPoints');
      const refundResult = await refundPointsForBooking(booking.guest_id, id);
      if (refundResult.pointsRefunded > 0) {
        console.log(`✅ Refunded ${refundResult.pointsRefunded} points to guest ${booking.guest_id} for cancelled booking ${id}`);
      }
    } catch (pointsError) {
      console.error('❌ Points refund error:', pointsError);
      // Continue even if points refund fails
    }

    res.json(
      formatResponse(true, 'Booking cancelled successfully')
    );

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to cancel booking', null, error.message)
    );
  }
});

// Get payment history for a booking
router.get('/bookings/:id/payments', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Get property owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [req.user.id]
    );

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner not found')
      );
    }

    const ownerId = owners[0].id;

    // Verify booking belongs to property owner's property
    const [bookings] = await pool.execute(`
      SELECT b.id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    // Get payment history with DR/CR
    const [payments] = await pool.execute(`
      SELECT 
        id, payment_reference, payment_method, payment_type,
        amount, dr_amount, cr_amount, transaction_type, notes,
        status, payment_date, created_at
      FROM payments
      WHERE booking_id = ?
      ORDER BY created_at ASC
    `, [id]);

    // Calculate running balance for each transaction
    let runningBalance = 0;
    const paymentsWithBalance = payments.map(payment => {
      runningBalance += (parseFloat(payment.dr_amount || 0) - parseFloat(payment.cr_amount || 0));
      return {
        ...payment,
        running_balance: runningBalance
      };
    });

    res.json(
      formatResponse(true, 'Payment history retrieved successfully', {
        payments: paymentsWithBalance
      })
    );

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve payment history', null, error.message)
    );
  }
});

// Update payment status for a booking
router.patch('/bookings/:id/payment', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, partial_amount, discount_amount, discount_reason } = req.body;

    // Verify payment status is valid
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid payment status')
      );
    }

    // Get property owner ID
    const [owners] = await pool.execute(
      'SELECT id FROM property_owners WHERE user_id = ?',
      [req.user.id]
    );

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner not found')
      );
    }

    const ownerId = owners[0].id;

    // Verify booking belongs to property owner's property
    const [bookings] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    // Apply discount if provided
    if (discount_amount && parseFloat(discount_amount) > 0) {
      const finalDiscount = Math.min(parseFloat(discount_amount), booking.total_amount);
      await pool.execute(`
        UPDATE bookings
        SET discount_amount = discount_amount + ?,
            total_amount = total_amount - ?,
            updated_at = NOW()
        WHERE id = ?
      `, [finalDiscount, finalDiscount, id]);

      // Log discount (you can create a discounts table later)
      console.log(`Discount applied to booking ${id}: ৳${finalDiscount} - Reason: ${discount_reason || 'Owner discount'}`);
    }

    // Handle partial payment
    if (partial_amount && parseFloat(partial_amount) > 0) {
      const partialAmt = parseFloat(partial_amount);

      // Create a CR (credit) payment record for partial payment
      // CR entries should have status 'completed' as they represent received payments
      const paymentReference = `CR-${Date.now()}-${id}`;
      await pool.execute(`
        INSERT INTO payments (
          booking_id, amount, dr_amount, cr_amount, payment_method, payment_reference, 
          status, payment_type, transaction_type, notes, payment_date, created_at
        ) VALUES (?, ?, 0, ?, 'cash', ?, 'completed', 'booking', 'payment_received', 'Partial payment received', NOW(), NOW())
      `, [id, partialAmt, partialAmt, paymentReference]);

      console.log(`Partial payment recorded for booking ${id}: ৳${partialAmt} - payments.status = 'completed'`);
    }

    // Check if booking is fully paid by calculating DR - CR
    const [paymentsCheck] = await pool.execute(`
      SELECT 
        COALESCE(SUM(dr_amount), 0) as total_dr,
        COALESCE(SUM(cr_amount), 0) as total_cr
      FROM payments
      WHERE booking_id = ?
    `, [id]);

    const totalDR = parseFloat(paymentsCheck[0]?.total_dr || 0);
    const totalCR = parseFloat(paymentsCheck[0]?.total_cr || 0);
    const remainingAmount = totalDR - totalCR;

    // Automatically set status to 'paid' if fully paid
    let finalPaymentStatus = payment_status;
    if (remainingAmount <= 0.01 && totalDR > 0) {  // Allow small rounding differences
      finalPaymentStatus = 'paid';
      console.log(`Booking ${id} is now fully paid. Auto-updating bookings.payment_status to 'paid'`);
    }

    // Update booking payment status
    await pool.execute(`
      UPDATE bookings
      SET payment_status = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [finalPaymentStatus, id]);

    // Update existing payment records
    // If fully paid (bookings.payment_status = 'paid'), set payments.status = 'completed'
    const paymentsStatus = (finalPaymentStatus === 'paid') ? 'completed' : payment_status;
    if (finalPaymentStatus === 'paid') {
      console.log(`Setting payments.status to 'completed' for booking ${id}`);
    }
    await pool.execute(`
      UPDATE payments
      SET status = ?,
          processed_at = NOW(),
          updated_at = NOW()
      WHERE booking_id = ? AND status != ?
    `, [paymentsStatus, id, paymentsStatus]);

    // Note: Do NOT auto-mark admin_earnings as paid here. For cash-on-arrival
    // scenarios, commission remains pending until the owner remits to admin.
    // Admin will mark commission as paid via dedicated earnings endpoint.

    // Get updated booking
    const [updatedBookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    res.json(
      formatResponse(true, 'Payment updated successfully', {
        booking: updatedBookings[0]
      })
    );

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update payment', null, error.message)
    );
  }
});

// Use earnings routes
router.use('/earnings', earningsRoutes);

module.exports = router;
