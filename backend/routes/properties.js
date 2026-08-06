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
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// Helper: generate a URL-friendly slug from property title + id
function generateSlug(title, id) {
  const slug = (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')       // keep alphanumeric, spaces, hyphens
    .trim()
    .replace(/\s+/g, '-')               // spaces → hyphens
    .replace(/-+/g, '-')                // collapse double hyphens
    .substring(0, 80)                   // cap title part at 80 chars
    .replace(/-$/, '');                 // strip trailing hyphen
  return slug ? `${slug}-${id}` : `property-${id}`;
}

// Get all properties with filters and pagination
router.get('/', optionalAuth, validatePagination, cacheMiddleware(30), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      latitude,
      longitude,
      property_type,
      min_price,
      max_price,
      min_guests,
      bedrooms,
      min_rating,
      free_cancellation,
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
      const targetUserId = req.user.user_type === 'staff' ? req.user.host_id : req.user.id;
      const [ownerRows] = await pool.execute('SELECT id FROM property_owners WHERE user_id = ?', [targetUserId]);
      const ownerId = ownerRows.length > 0 ? ownerRows[0].id : -1;
      whereConditions.push('p.owner_id = ?');
      queryParams.push(ownerId);
    } else {
      whereConditions.push('p.status = "active"');
      // If user is logged in, exclude their own properties from guest search
      if (req.user) {
        const targetUserId = req.user.user_type === 'staff' ? req.user.host_id : req.user.id;
        const [ownerRows] = await pool.execute('SELECT id FROM property_owners WHERE user_id = ?', [targetUserId]);
        if (ownerRows.length > 0) {
          whereConditions.push('p.owner_id != ?');
          queryParams.push(ownerRows[0].id);
        }
      }
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
    let hasCoords = false;
    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    if (!isNaN(latVal) && !isNaN(lngVal)) {
      hasCoords = true;
      whereConditions.push(`p.latitude IS NOT NULL AND p.longitude IS NOT NULL`);
      whereConditions.push(`(6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(?)) + sin(radians(?)) * sin(radians(p.latitude)))) <= 50`);
      queryParams.push(latVal, lngVal, latVal);
    }

    let selectFields = `
      p.*,
      u.first_name as owner_first_name,
      u.last_name as owner_last_name,
      u.email as owner_email,
      u.phone as owner_phone,
      p.auto_accept_bookings as owner_auto_accept,
      po.business_name,
      po.is_verified as owner_verified
    `;
    let selectParams = [];
    let orderByClause = '';

    if (hasCoords) {
      selectFields += `, (6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(?)) + sin(radians(?)) * sin(radians(p.latitude)))) AS distance`;
      selectParams.push(latVal, lngVal, latVal);
      orderByClause = 'ORDER BY distance ASC';
    } else if (city && city !== 'Nearby') {
      const keywords = city.split(/[\s,]+/).map(t => t.trim()).filter(t => t.length > 0);
      if (keywords.length > 0) {
        let cityConditions = [];
        let cityParams = [];
        
        // Match exact phrase on title, address, city, state
        cityConditions.push('p.title LIKE ? OR p.address LIKE ? OR p.city LIKE ? OR p.state LIKE ?');
        cityParams.push(`%${city}%`, `%${city}%`, `%${city}%`, `%${city}%`);
        
        // Match individual keywords on title, address, city, state
        keywords.forEach(keyword => {
          cityConditions.push('p.title LIKE ? OR p.address LIKE ? OR p.city LIKE ? OR p.state LIKE ?');
          cityParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        });
        
        whereConditions.push(`(${cityConditions.join(' OR ')})`);
        queryParams.push(...cityParams);

        // Calculate relevance score
        let relevanceCases = [];
        let relevanceParams = [];
        
        relevanceCases.push('WHEN p.title LIKE ? OR p.address LIKE ? THEN 1');
        relevanceParams.push(`%${city}%`, `%${city}%`);
        
        relevanceCases.push('WHEN p.city LIKE ? OR p.state LIKE ? THEN 2');
        relevanceParams.push(`%${city}%`, `%${city}%`);
        
        keywords.forEach((keyword, index) => {
          const score = 3 + index;
          relevanceCases.push(`WHEN p.title LIKE ? OR p.address LIKE ? THEN ${score}`);
          relevanceParams.push(`%${keyword}%`, `%${keyword}%`);
          
          relevanceCases.push(`WHEN p.city LIKE ? OR p.state LIKE ? THEN ${score + 10}`);
          relevanceParams.push(`%${keyword}%`, `%${keyword}%`);
        });
        
        const relevanceExpression = `(CASE ${relevanceCases.join(' ')} ELSE 99 END)`;
        selectFields += `, ${relevanceExpression} AS relevance_score`;
        selectParams.push(...relevanceParams);
        
        orderByClause = `ORDER BY relevance_score ASC, p.${sort_by} ${sort_order}`;
      } else {
        orderByClause = `ORDER BY p.${sort_by} ${sort_order}`;
      }
    } else {
      orderByClause = `ORDER BY p.${sort_by} ${sort_order}`;
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

    if (bedrooms) {
      whereConditions.push('p.bedrooms >= ?');
      queryParams.push(bedrooms);
    }

    if (min_rating) {
      whereConditions.push('p.average_rating >= ?');
      queryParams.push(min_rating);
    }

    if (free_cancellation === 'true') {
      whereConditions.push('p.is_non_refundable = 0');
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
          WHERE b.status IN ('request_accepted', 'confirmed', 'checked_in')
          AND DATE(b.check_in_date) < DATE(?) AND DATE(b.check_out_date) > DATE(?)
        )
      `);
      queryParams.push(check_out_date, check_in_date);
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
        ${selectFields}
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `, [...selectParams, ...queryParams, parseInt(limit), parseInt(offset)]);

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

// Get single property by slug (SEO-friendly) or numeric ID (backward compat)
// Route accepts both: /property/peaceful-3br-68  AND  /property/68
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Determine lookup: pure numeric = legacy ID, otherwise treat as slug
    const isNumericId = /^\d+$/.test(slug);
    const whereClause = isNumericId ? 'p.id = ?' : 'p.slug = ?';
    const lookupValue = isNumericId ? parseInt(slug) : slug;

    // Get property details
    const [properties] = await pool.execute(`
      SELECT 
        p.*,
        po.user_id as po_user_id,
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
        po.is_verified as owner_verified,
        p.auto_accept_bookings as owner_auto_accept
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      WHERE ${whereClause}
    `, [lookupValue]);

    // Derive the numeric id for sub-queries below
    const id = properties.length > 0 ? properties[0].id : null;

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    const property = properties[0];

    // Access control for non-active properties
    if (property.status !== 'active') {
      const isOwner = req.user && req.user.id === property.po_user_id;
      const isAdmin = req.user && req.user.user_type === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(404).json(
          formatResponse(false, 'Property not found or is currently inactive')
        );
      }
    }

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

    // Get HMS rooms if enabled AND subscription is active
    if (property.is_hms_enabled) {
      // Check if host has an active HMS subscription
      const [subs] = await pool.execute(
        'SELECT status FROM hms_subscriptions WHERE host_id = ? LIMIT 1',
        [property.po_user_id]
      );

      const hasActiveSub = subs.length > 0 && (subs[0].status === 'active' || subs[0].status === 'trialing');

      if (hasActiveSub) {
        const { check_in_date, check_out_date } = req.query;
        
        let roomsQuery = `
          SELECT id, room_number, room_type, floor, price, status, features, images
          FROM hms_rooms
          WHERE property_id = ?
        `;
        const roomsParams = [id];

        const [rooms] = await pool.execute(roomsQuery, roomsParams);
        
        // If dates are provided, check which rooms are available
        if (check_in_date && check_out_date) {
            const [conflicts] = await pool.execute(`
                SELECT hms_room_id 
                FROM bookings 
                WHERE property_id = ? 
                AND hms_room_id IS NOT NULL
                AND status IN ('request_accepted', 'confirmed', 'checked_in')
                AND DATE(check_in_date) < DATE(?) AND DATE(check_out_date) > DATE(?)
            `, [id, check_out_date, check_in_date]);
            
            const conflictRoomIds = conflicts.map(c => c.hms_room_id);
            
            property.hms_rooms = rooms.map(room => ({
                ...room,
                is_available: !conflictRoomIds.includes(room.id),
                features: room.features ? (typeof room.features === 'string' ? JSON.parse(room.features) : room.features) : [],
                images: room.images ? (typeof room.images === 'string' ? JSON.parse(room.images) : room.images) : []
            }));
        } else {
            property.hms_rooms = rooms.map(room => ({
                ...room,
                is_available: true,
                features: room.features ? (typeof room.features === 'string' ? JSON.parse(room.features) : room.features) : [],
                images: room.images ? (typeof room.images === 'string' ? JSON.parse(room.images) : room.images) : []
            }));
        }
      } else {
        // Disable HMS features for this request if subscription is not active
        property.is_hms_enabled = 0;
        property.hms_rooms = [];
      }
    }

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
    // Get custom availability constraints
    const [availability] = await pool.execute(`
      SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, is_available, price, minimum_stay
      FROM property_availability
      WHERE property_id = ? AND date >= CURDATE()
    `, [id]);
    property.availability_data = availability;

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

    // Determine is_single_unit default if not provided
    let isSingleUnitValue = req.body.is_single_unit;
    if (isSingleUnitValue === undefined) {
      isSingleUnitValue = !(property_type === 'hotel' || property_type === 'hotels') ? 1 : 0;
    } else {
      isSingleUnitValue = isSingleUnitValue ? 1 : 0;
    }

    // Create property
    const [result] = await pool.execute(`
      INSERT INTO properties (
        owner_id, title, description, property_type, property_category,
        address, city, state, country, postal_code, latitude, longitude,
        bedrooms, bathrooms, max_guests, size_sqft, floor_number,
        base_price, cleaning_fee, security_deposit, extra_guest_fee,
        check_in_time, check_out_time, minimum_stay, maximum_stay,
        is_instant_book, is_single_unit, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', NOW())
    `, [
      ownerId, title, description, property_type, property_category,
      address, city, state, country, postal_code, latitude, longitude,
      bedrooms, bathrooms, max_guests, size_sqft, floor_number,
      base_price, cleaning_fee, security_deposit, extra_guest_fee,
      check_in_time, check_out_time, minimum_stay, maximum_stay,
      is_instant_book, isSingleUnitValue
    ]);

    const propertyId = result.insertId;

    // Generate and store slug
    const newSlug = generateSlug(title, propertyId);
    await pool.execute('UPDATE properties SET slug = ? WHERE id = ?', [newSlug, propertyId]);

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
      'check_out_time', 'minimum_stay', 'maximum_stay', 'is_instant_book',
      'is_single_unit'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    // Handle slug update
    if (updateData.slug !== undefined && updateData.slug !== null && updateData.slug.trim() !== '') {
      // Client provided a custom slug — sanitize it
      const customSlug = updateData.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 120);
      const finalSlug = customSlug || generateSlug(updateData.title || '', id);
      // Check uniqueness (exclude self)
      const [existing] = await pool.execute(
        'SELECT id FROM properties WHERE slug = ? AND id != ?',
        [finalSlug, id]
      );
      if (existing.length > 0) {
        return res.status(409).json(
          formatResponse(false, 'This URL slug is already taken. Please choose a different one.')
        );
      }
      updateFields.push('slug = ?');
      updateValues.push(finalSlug);
    } else if (updateData.title !== undefined) {
      // No custom slug provided — regenerate from title
      const newSlug = generateSlug(updateData.title, id);
      updateFields.push('slug = ?');
      updateValues.push(newSlug);
    }

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
router.get('/amenities/list', cacheMiddleware(1800), async (req, res) => {
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
router.get('/property-types/list', cacheMiddleware(10), async (req, res) => {
  try {
    // Ensure icon_url column exists
    try {
      await pool.execute(`ALTER TABLE property_types ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500) NULL`);
    } catch (e) { /* ignore */ }

    // Auto-seed default property types (including Flight and Monthly Rent) if table is empty
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM property_types');
    if (countResult[0].total === 0) {
      const defaults = [
        { name: 'Room', icon_url: '/images/nav-icon-room.png', sort_order: 1 },
        { name: 'Apartment', icon_url: '/images/nav-icon-apartment.png', sort_order: 2 },
        { name: 'Hotel', icon_url: '/images/nav-icon-hotel.png', sort_order: 3 },
        { name: 'Monthly Rent', icon_url: '/images/nav-icon-monthly.png', sort_order: 4 },
        { name: 'Flight', icon_url: '/images/flight.png', sort_order: 99 },
      ];
      for (const d of defaults) {
        try {
          await pool.execute(
            'INSERT IGNORE INTO property_types (name, icon_url, sort_order, is_active, created_at) VALUES (?, ?, ?, 1, NOW())',
            [d.name, d.icon_url, d.sort_order]
          );
        } catch (e) { /* ignore individual insert errors */ }
      }
    } else {
      // Table already has data — do NOT auto-re-seed individual types.
      // Admin may have renamed/deleted them intentionally.
    }

    // Fetch active property types
    let propertyTypes;
    try {
      [propertyTypes] = await pool.execute(`
        SELECT id, name, description, sort_order, icon_url
        FROM property_types
        WHERE is_active = 1
        ORDER BY sort_order ASC, name ASC
      `);
    } catch (e) {
      [propertyTypes] = await pool.execute(`
        SELECT id, name, description, sort_order
        FROM property_types
        WHERE is_active = 1
        ORDER BY sort_order ASC, name ASC
      `);
    }

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
router.get('/locations/list', cacheMiddleware(3600), async (_req, res) => {
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

    const { hms_room_id, exclude_booking_id } = req.query;
    
    let query = `
      SELECT 
        DATE_FORMAT(check_in_date, '%Y-%m-%d') AS check_in_date,
        DATE_FORMAT(check_out_date, '%Y-%m-%d') AS check_out_date
      FROM bookings
      WHERE property_id = ? 
      AND status IN ('request_accepted', 'confirmed', 'checked_in')
      AND check_out_date >= CURDATE()
    `;
    const params = [id];
    
    if (hms_room_id) {
        query += ' AND hms_room_id = ?';
        params.push(hms_room_id);
    }

    if (exclude_booking_id) {
        query += ' AND id != ?';
        params.push(exclude_booking_id);
    }
    
    query += ' ORDER BY check_in_date ASC';
    
    const [bookings] = await pool.execute(query, params);

    // Generate array of all blocked dates
    const blockedDates = [];
    const checkInDates = [];
    bookings.forEach(booking => {
      // Parse as local dates (YYYY-MM-DD strings from SQL) to avoid any UTC offset issues
      checkInDates.push(booking.check_in_date);
      const [ciYear, ciMonth, ciDay] = booking.check_in_date.split('-').map(Number);
      const [coYear, coMonth, coDay] = booking.check_out_date.split('-').map(Number);
      const checkIn = new Date(ciYear, ciMonth - 1, ciDay);
      const checkOut = new Date(coYear, coMonth - 1, coDay);

      // Add all dates from check_in_date up to (but not including) check_out_date
      // The checkout date itself shouldn't be blocked because a new guest can check-in that afternoon
      const currentDate = new Date(checkIn);
      // Safeguard: Limit to 2 years (730 days) to prevent infinite loops or memory exhaustion
      let dayCount = 0;
      const MAX_DAYS = 730;

      while (currentDate < checkOut && dayCount < MAX_DAYS) {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        blockedDates.push(`${y}-${m}-${d}`);
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
      }

      if (dayCount >= MAX_DAYS) {
        console.warn(`Booking has an unusually long duration (> 2 years). Truncated blocked dates.`);
      }
    });

    res.json(
      formatResponse(true, 'Blocked dates retrieved successfully', {
        blockedDates: [...new Set(blockedDates)], // Remove duplicates
        checkInDates: [...new Set(checkInDates)]
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
    const { check_in_date, check_out_date, exclude_booking_id, hms_room_id } = req.query;

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
    // Include bookings that are request_accepted, confirmed, or checked_in
    // Optional: exclude a specific booking (e.g., the one being extended)
    let conflictQuery = `
      SELECT id, check_in_date, check_out_date, status
      FROM bookings
      WHERE property_id = ? 
      AND status IN ('request_accepted', 'confirmed', 'checked_in')
      AND DATE(check_in_date) < DATE(?) AND DATE(check_out_date) > DATE(?)
    `;
    const conflictParams = [id, check_out_date, check_in_date];

    if (hms_room_id) {
      conflictQuery += ' AND hms_room_id = ?';
      conflictParams.push(hms_room_id);
    }

    if (exclude_booking_id && !isNaN(parseInt(exclude_booking_id))) {
      conflictQuery += ' AND id != ?';
      conflictParams.push(parseInt(exclude_booking_id));
    }

    const [conflicts] = await pool.execute(conflictQuery, conflictParams);

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
