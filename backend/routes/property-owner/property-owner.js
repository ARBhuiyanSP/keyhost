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
const { verifyToken, requirePropertyOwner, requireHMSAccess, requireHMSPermission } = require('../../middleware/auth');
const { processBase64Image } = require('../../utils/imageProcessor');
const { syncPaymentToHMSAccounts } = require('../../utils/hms-sync');
const { syncHmsAccessForHost } = require('../../utils/hms-helper');
const { cache } = require('../../middleware/cache');

// Helper: instantly clear all properties cache entries
const clearPropertiesCache = () => {
  try {
    const allKeys = cache.keys();
    allKeys.forEach(key => {
      if (
        key.includes('properties') || 
        key.includes('recommended') || 
        key.includes('featured') ||
        key.includes('display-categories') ||
        key.includes('guest')
      ) {
        cache.del(key);
      }
    });
  } catch (e) { /* ignore */ }
};

// Import earnings routes
const earningsRoutes = require('./property-owner-earnings');
const hmsMgmtRoutes = require('./hms-management');

const router = express.Router();

// Apply authentication and property owner middleware to all routes
router.use(verifyToken);
router.use(requirePropertyOwner);

// Mount sub-routes
router.use('/earnings', earningsRoutes);
router.use('/hms', hmsMgmtRoutes);

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
        COALESCE(u.first_name, SUBSTRING_INDEX(b.guest_name, ' ', 1)) as first_name, 
        COALESCE(u.last_name, SUBSTRING_INDEX(b.guest_name, ' ', -1)) as last_name,
        p.title as property_title
      FROM bookings b
      LEFT JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.status != 'cancelled'
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [ownerId]);

    // Get upcoming bookings
    const [upcomingBookings] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.check_in_date, b.check_out_date,
        COALESCE(u.first_name, SUBSTRING_INDEX(b.guest_name, ' ', 1)) as first_name, 
        COALESCE(u.last_name, SUBSTRING_INDEX(b.guest_name, ' ', -1)) as last_name,
        p.title as property_title
      FROM bookings b
      LEFT JOIN users u ON b.guest_id = u.id
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
router.post('/properties', requireHMSPermission('manage_properties'), async (req, res) => {
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
      amenities = [],
      is_draft = false,
      is_non_refundable = false,
      is_hms_enabled = false,
      is_single_unit,
      auto_accept_bookings
    } = req.body;

    // Validate required fields only if not saving a draft
    if (!is_draft) {
      if (!title || !description || !address || !city || !state || !country || !base_price) {
        return res.status(400).json(
          formatResponse(false, 'Missing required fields')
        );
      }
    }

    // Get property owner ID and default auto-accept setting
    const [owners] = await pool.execute(`
      SELECT po.id, u.auto_accept_bookings 
      FROM property_owners po
      JOIN users u ON po.user_id = u.id
      WHERE po.user_id = ?
    `, [req.user.id]);

    if (owners.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property owner profile not found')
      );
    }

    const ownerId = owners[0].id;
    const defaultAutoAccept = owners[0].auto_accept_bookings;

    // Check if host has an active HMS subscription
    const [subs] = await pool.execute(
      'SELECT status FROM hms_subscriptions WHERE host_id = ? LIMIT 1',
      [req.user.id]
    );
    const hasActiveSub = subs.length > 0 && (subs[0].status === 'active' || subs[0].status === 'trialing');
    const isHmsEnabledValue = hasActiveSub ? 1 : 0;

    // Determine is_single_unit default if not provided
    let isSingleUnitValue = is_single_unit;
    if (isSingleUnitValue === undefined) {
      isSingleUnitValue = !(property_type === 'hotel' || property_type === 'hotels') ? 1 : 0;
    } else {
      isSingleUnitValue = isSingleUnitValue ? 1 : 0;
    }

    // Determine auto_accept_bookings value
    let autoAcceptValue = auto_accept_bookings;
    if (autoAcceptValue === undefined) {
      autoAcceptValue = defaultAutoAccept ? 1 : 0;
    } else {
      autoAcceptValue = autoAcceptValue ? 1 : 0;
    }

    // Create property - ensure null values for optional fields
    const [result] = await pool.execute(`
      INSERT INTO properties (
        owner_id, title, description, property_type, property_category,
        address, city, state, country, postal_code, latitude, longitude,
        bedrooms, bathrooms, max_guests, size_sqft, floor_number,
        base_price, cleaning_fee, security_deposit, extra_guest_fee,
        check_in_time, check_out_time, minimum_stay, maximum_stay,
        is_instant_book, is_non_refundable, is_hms_enabled, is_single_unit, auto_accept_bookings, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      ownerId,
      title || 'Draft Property',
      description || '',
      property_type || 'room',
      property_category || 'standard',
      address || '',
      city || '',
      state || '',
      country || 'Bangladesh',
      postal_code || '',
      latitude || null,
      longitude || null,
      bedrooms || 1,
      bathrooms || 1,
      max_guests || 2,
      size_sqft || null,
      floor_number || null,
      base_price || 0,
      cleaning_fee || 0,
      security_deposit || 0,
      extra_guest_fee || 0,
      check_in_time || '15:00:00',
      check_out_time || '11:00:00',
      minimum_stay || 1,
      maximum_stay || null,
      is_instant_book || false,
      is_non_refundable || false,
      isHmsEnabledValue,
      isSingleUnitValue,
      autoAcceptValue,
      is_draft ? 'in_progress' : 'pending_approval'
    ]);

    const propertyId = result.insertId;

    // Auto-seed room for single-unit properties when HMS is enabled
    if (isHmsEnabledValue && isSingleUnitValue) {
      try {
        const [existingRooms] = await pool.query('SELECT id FROM hms_rooms WHERE property_id = ?', [propertyId]);
        if (existingRooms.length === 0) {
          console.log(`[HMS-AUTO-ROOM] Seeding room for single-unit property ${propertyId}`);
          await pool.query(
            'INSERT INTO hms_rooms (property_id, room_number, room_type, floor, price, status, features, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [propertyId, 'Entire Place', property_type || 'Room', '1', base_price || 0, 'available', '[]', '[]']
          );
        }
      } catch (err) {
        console.error('[HMS-AUTO-ROOM] Failed to auto-seed room:', err);
      }
    }

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

    // Add images if provided - process ALL in parallel for speed
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      console.log('Processing', req.body.images.length, 'images in parallel...');

      // Process all images simultaneously instead of one-by-one
      const processedUrls = await Promise.all(
        req.body.images.map(imageUrl =>
          processBase64Image(imageUrl, 'prop').catch(err => {
            console.error('Image processing error:', err);
            return null;
          })
        )
      );

      const validUrls = processedUrls.filter(Boolean);

      // Batch insert all images in a single query
      if (validUrls.length > 0) {
        const placeholders = validUrls.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = validUrls.flatMap((url, index) => [
          propertyId,
          url,
          index === 0 ? 'main' : 'gallery',
          `Property image ${index + 1}`,
          index,
          1
        ]);
        await pool.execute(
          `INSERT INTO property_images (property_id, image_url, image_type, alt_text, sort_order, is_active) VALUES ${placeholders}`,
          values
        );
      }

      console.log('Images saved successfully:', validUrls.length, 'images');

      // Sync to Entire Place room if single unit and HMS is enabled
      if (isHmsEnabledValue && isSingleUnitValue && validUrls.length > 0) {
        try {
          await pool.execute(
            "UPDATE hms_rooms SET images = ? WHERE property_id = ? AND room_number = 'Entire Place'",
            [JSON.stringify(validUrls), propertyId]
          );
          console.log(`[HMS-IMAGE-SYNC] Synced ${validUrls.length} images to Entire Place room on creation for property ${propertyId}`);
        } catch (syncErr) {
          console.error('[HMS-IMAGE-SYNC] Failed to sync images to Entire Place room on creation:', syncErr);
        }
      }
    }

    // Return immediately without re-fetching — faster response
    res.status(201).json(
      formatResponse(true, 'Property created successfully', { property: { id: propertyId } })
    );

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create property', null, error.message)
    );
  }
});

// Update property
router.put('/properties/:id', requireHMSPermission('manage_properties'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ignore direct updates to is_hms_enabled from the frontend forms
    delete updateData.is_hms_enabled;

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
      'check_out_time', 'minimum_stay', 'maximum_stay', 'is_instant_book', 'is_non_refundable', 'is_hms_enabled',
      'is_single_unit', 'auto_accept_bookings'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        // For string fields, skip empty strings only for optional fields
        // property_type is required, so always include it
        if (typeof updateData[key] === 'string' && updateData[key].trim() === '' &&
          ['postal_code', 'description', 'latitude', 'longitude', 'size_sqft', 'floor_number', 'maximum_stay'].includes(key)) {
          // If it's explicitly a draft, don't drop empty descriptions. Replace them with whitespace to avoid DB constraints if needed, but let's allow it for draft.
          if (!updateData.is_draft || key !== 'description') return; // Skip empty strings for optional fields
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

    if (updateData.is_draft) {
      updateFields.push('status = ?');
      updateValues.push('in_progress');
    } else if (updateData.is_final_submit) {
      updateFields.push('status = ?');
      updateValues.push('pending_approval');
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

    // Clear cache
    clearPropertiesCache();

    // Auto-seed/check room for single-unit properties when HMS is enabled
    try {
      const [propRows] = await pool.execute('SELECT is_hms_enabled, is_single_unit, property_type, base_price FROM properties WHERE id = ?', [id]);
      if (propRows.length > 0) {
        const prop = propRows[0];
        if (prop.is_hms_enabled && prop.is_single_unit) {
          const [existingRooms] = await pool.query('SELECT id FROM hms_rooms WHERE property_id = ?', [id]);
          if (existingRooms.length === 0) {
            console.log(`[HMS-AUTO-ROOM] Seeding room on update for single-unit property ${id}`);
            await pool.query(
              'INSERT INTO hms_rooms (property_id, room_number, room_type, floor, price, status, features, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [id, 'Entire Place', prop.property_type || 'Room', '1', prop.base_price || 0, 'available', '[]', '[]']
            );
          } else {
            console.log(`[HMS-AUTO-ROOM] Syncing room price on update for single-unit property ${id} to ${prop.base_price}`);
            await pool.query(
              "UPDATE hms_rooms SET price = ?, room_type = ? WHERE property_id = ? AND room_number = 'Entire Place'",
              [prop.base_price || 0, prop.property_type || 'Room', id]
            );
          }
        }
      }
    } catch (err) {
      console.error('[HMS-AUTO-ROOM] Failed to auto-seed room on update:', err);
    }

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

    // Update images if provided - process ALL in parallel for speed
    if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0) {
      console.log('Processing', updateData.images.length, 'images in parallel...');

      const fs = require('fs');
      const path = require('path');

      // Fetch old image URLs and process new images IN PARALLEL
      const [[oldImages], processedResults] = await Promise.all([
        pool.execute('SELECT image_url FROM property_images WHERE property_id = ?', [id]),
        Promise.all(
          updateData.images.map(imageUrl =>
            processBase64Image(imageUrl, 'prop').catch(err => {
              console.error('Image processing error:', err);
              return null;
            })
          )
        )
      ]);

      const processedImageUrls = processedResults.filter(Boolean);

      // Delete old DB records and cleanup old files on disk IN PARALLEL
      await Promise.all([
        pool.execute('DELETE FROM property_images WHERE property_id = ?', [id]),
        ...oldImages
          .filter(img => !processedImageUrls.includes(img.image_url) && img.image_url.startsWith('/uploads/'))
          .map(img => {
            const filePath = path.join(__dirname, '../../', img.image_url);
            return fs.promises.unlink(filePath).catch(() => {}); // ignore missing files
          })
      ]);

      // Batch insert all new images in a single query
      if (processedImageUrls.length > 0) {
        const placeholders = processedImageUrls.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = processedImageUrls.flatMap((url, index) => [
          id,
          url,
          index === 0 ? 'main' : 'gallery',
          `Property image ${index + 1}`,
          index,
          1
        ]);
        await pool.execute(
          `INSERT INTO property_images (property_id, image_url, image_type, alt_text, sort_order, is_active) VALUES ${placeholders}`,
          values
        );
      }

      console.log('Images updated:', processedImageUrls.length, 'images');

      // Sync to Entire Place room if single unit
      try {
        const [propCheck] = await pool.execute('SELECT is_single_unit FROM properties WHERE id = ?', [id]);
        if (propCheck.length > 0 && propCheck[0].is_single_unit) {
          await pool.execute(
            "UPDATE hms_rooms SET images = ? WHERE property_id = ? AND room_number = 'Entire Place'",
            [JSON.stringify(processedImageUrls), id]
          );
          console.log(`[HMS-IMAGE-SYNC] Synced ${processedImageUrls.length} images to Entire Place room for property ${id}`);
        }
      } catch (syncErr) {
        console.error('[HMS-IMAGE-SYNC] Failed to sync images to Entire Place room:', syncErr);
      }
    }

    // Return success immediately - no need to re-fetch (saves 2 extra DB queries)
    res.json(
      formatResponse(true, 'Property updated successfully', { property: { id } })
    );

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property', null, error.message)
    );
  }
});

// Delete property
router.delete('/properties/:id', requireHMSPermission('manage_properties'), validateId, async (req, res) => {
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
      'SELECT id, status FROM properties WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found or access denied')
      );
    }

    const propertyStatus = properties[0].status;

    if (propertyStatus === 'active') {
      return res.status(400).json(
        formatResponse(false, 'Cannot delete an active property. Please pause or suspend it first.')
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

    // Since many things might be tied (like images, amenities), for simple draft/inactive, let's officially delete it from DB entirely to clear up space, assuming DB foreign keys use CASCADE or we delete them manually.
    // Instead of doing manual cascading, we'll try a hard delete for draft, and soft delete for others, OR just ensure we delete related amenities/images first.

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete property images
      await connection.execute('DELETE FROM property_images WHERE property_id = ?', [id]);

      // Delete property amenities
      await connection.execute('DELETE FROM property_amenities WHERE property_id = ?', [id]);

      // Delete the property itself (will fail if there are foreign keys like bookings referencing it without CASCADE, 
      // in which case soft delete is required. But Drafts/Pending usually have no bookings).
      await connection.execute('DELETE FROM properties WHERE id = ?', [id]);

      await connection.commit();
      clearPropertiesCache();
      res.json(formatResponse(true, 'Property permanently deleted'));
    } catch (dbError) {
      await connection.rollback();
      // Fallback to soft delete if hard delete fails due to strict foreign key constraints (e.g. old bookings exist)
      console.log('Hard delete failed, falling back to soft delete', dbError.message);
      await pool.execute(
        'UPDATE properties SET status = "inactive", updated_at = NOW() WHERE id = ?',
        [id]
      );
      clearPropertiesCache();
      res.json(formatResponse(true, 'Property deactivated (soft deleted)'));
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete property', null, error.message)
    );
  }
});

// Toggle/Update property status by owner
router.patch('/properties/:id/status', requireHMSPermission('manage_properties'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status. Host can only set property to active or inactive.')
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

    // Check if property exists, belongs to user, and get its current status
    const [properties] = await pool.execute(
      'SELECT id, status FROM properties WHERE id = ? AND owner_id = ?',
      [id, ownerId]
    );

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found or access denied')
      );
    }

    const currentStatus = properties[0].status;

    if (currentStatus === 'suspended') {
      return res.status(400).json(
        formatResponse(false, 'This property is suspended by administration. You cannot modify its status.')
      );
    }

    if (currentStatus === 'in_progress') {
      return res.status(400).json(
        formatResponse(false, 'This property is a draft. Please complete and publish it first.')
      );
    }

    if (currentStatus === 'pending_approval') {
      return res.status(400).json(
        formatResponse(false, 'This property is pending admin approval. You cannot toggle its status yet.')
      );
    }

    // Update status
    await pool.execute(
      'UPDATE properties SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Clear guest-side cache
    clearPropertiesCache();

    res.json(
      formatResponse(true, `Property status updated to ${status} successfully`)
    );

  } catch (error) {
    console.error('Update property status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property status', null, error.message)
    );
  }
});

// Get property owner's bookings
router.get('/bookings', requireHMSPermission('manage_reservations'), validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      property_id
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
      if (status.includes(',')) {
        const statusList = status.split(',');
        const placeholders = statusList.map(() => '?').join(', ');
        whereClause += ` AND b.status IN (${placeholders})`;
        queryParams.push(...statusList);
      } else {
        whereClause += ' AND b.status = ?';
        queryParams.push(status);
      }
    }

    if (search) {
      whereClause += ' AND (b.booking_reference LIKE ? OR p.title LIKE ? OR b.guest_name LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (property_id && property_id !== 'all') {
      whereClause += ' AND b.property_id = ?';
      queryParams.push(property_id);
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
        b.created_at, b.updated_at, b.hms_room_id,
        b.security_deposit_status, b.security_deposit_claim_amount, 
        b.security_deposit_deduction_amount,
        b.security_deposit_claim_reason, b.security_deposit_claim_at,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        p.is_hms_enabled,
        hr.room_number as hms_room_number,
        hr.room_type as hms_room_type,
        mi.image_url as property_image,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_email_from_user,
        COALESCE(
          NULLIF(NULLIF(b.guest_name, ''), 'undefined undefined'),
          CONCAT(u.first_name, ' ', u.last_name)
        ) as guest_name,
        COALESCE((
          SELECT SUM(cr_amount) 
          FROM payments 
          WHERE booking_id = b.id 
          AND status = 'completed'
        ), 0) as paid_amount,
        (b.total_amount - COALESCE((
          SELECT SUM(cr_amount) 
          FROM payments 
          WHERE booking_id = b.id 
          AND status = 'completed'
        ), 0)) as due_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN users u ON b.guest_id = u.id
      LEFT JOIN hms_rooms hr ON b.hms_room_id = hr.id
      LEFT JOIN property_images mi ON p.id = mi.property_id AND mi.image_type = 'main'
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);
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
    const { days = '30' } = req.query; // period in days
    const period = parseInt(days, 10) || 30;

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

    // 1. Total Revenue & Bookings (Current Period)
    const [currentStats] = await pool.execute(`
      SELECT 
        COUNT(b.id) as total_bookings,
        SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN b.payment_status = 'pending' THEN b.total_amount ELSE 0 END) as pending_revenue
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND b.status != 'cancelled'
    `, [ownerId, period]);

    const totalRevenue = parseFloat(currentStats[0].total_revenue) || 0;
    const pendingRevenue = parseFloat(currentStats[0].pending_revenue) || 0;
    const totalBookings = parseInt(currentStats[0].total_bookings) || 0;

    // Previous Period (for calculating change)
    const [prevStats] = await pool.execute(`
      SELECT 
        COUNT(b.id) as total_bookings,
        SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN b.payment_status = 'pending' THEN b.total_amount ELSE 0 END) as pending_revenue
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND b.created_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND b.status != 'cancelled'
    `, [ownerId, period * 2, period]);

    const prevRevenue = parseFloat(prevStats[0].total_revenue) || 0;
    const prevBookings = parseInt(prevStats[0].total_bookings) || 0;

    const revenueChange = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
    const bookingsChange = prevBookings ? ((totalBookings - prevBookings) / prevBookings * 100).toFixed(1) : 0;

    // 2. Average Rating
    const [rating] = await pool.execute(`
      SELECT AVG(r.rating) as avg_rating
      FROM reviews r
      JOIN properties p ON r.property_id = p.id
      WHERE p.owner_id = ?
        AND r.status = 'approved'
    `, [ownerId]);
    const averageRating = parseFloat(rating[0].avg_rating || 0).toFixed(1);
    const ratingChange = 0; // Simplified for now

    // 3. Occupancy Rate (simplified)
    const [occupancy] = await pool.execute(`
      SELECT COUNT(*) as total_properties
      FROM properties
      WHERE owner_id = ? AND status = 'active'
    `, [ownerId]);
    const totalProperties = occupancy[0].total_properties || 1;
    const potentialNights = totalProperties * period;

    const [bookedOutNights] = await pool.execute(`
      SELECT SUM(DATEDIFF(b.check_out_date, b.check_in_date)) as booked_nights
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND b.status NOT IN ('cancelled', 'pending')
    `, [ownerId, period]);

    const actualNights = bookedOutNights[0].booked_nights || 0;
    const occupancyRate = potentialNights > 0 ? Math.min(100, Math.round((actualNights / potentialNights) * 100)) : 0;
    const occupancyChange = 0; // Simplified

    // 4. Top Properties
    const [topProps] = await pool.execute(`
      SELECT 
        p.id, p.title, p.city,
        COUNT(b.id) as bookings,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END), 0) as revenue
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id 
        AND b.status != 'cancelled'
        AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      WHERE p.owner_id = ?
      GROUP BY p.id, p.title, p.city
      ORDER BY revenue DESC
      LIMIT 5
    `, [period, ownerId]);

    const topPropertiesList = topProps.map(p => ({
      ...p,
      bookings: parseInt(p.bookings) || 0,
      revenue: parseFloat(p.revenue) || 0
    }));

    // 5. Recent Bookings
    const [recentBooks] = await pool.execute(`
      SELECT 
        b.id,
        CONCAT(u.first_name, ' ', u.last_name) as guest_name,
        p.title as property_title,
        b.total_amount as amount,
        b.created_at
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.status != 'cancelled'
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [ownerId]);

    // 6. Charts (Revenue and Bookings)
    const [dailyData] = await pool.execute(`
      SELECT 
        DATE_FORMAT(b.created_at, '%b %d') as date_formatted,
        DATE(b.created_at) as raw_date,
        COUNT(b.id) as count,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END), 0) as amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
        AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND b.status != 'cancelled'
      GROUP BY DATE(b.created_at), DATE_FORMAT(b.created_at, '%b %d')
      ORDER BY raw_date ASC
    `, [ownerId, period]);

    const revenueChart = dailyData.map(d => ({ date: d.date_formatted, amount: parseFloat(d.amount) }));
    const bookingChart = dailyData.map(d => ({ date: d.date_formatted, count: parseInt(d.count) }));

    // 7. Today's Dashboard Stats
    const [todayStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN DATE(b.check_in_date) = CURDATE() THEN 1 END) as arrives_today,
        COUNT(CASE WHEN DATE(b.check_out_date) = CURDATE() THEN 1 END) as departs_today,
        COUNT(CASE WHEN DATE(b.check_in_date) <= CURDATE() AND DATE(b.check_out_date) > CURDATE() THEN 1 END) as stays_today
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.status IN ('confirmed', 'checked_in')
    `, [ownerId]);

    const arrivesToday = todayStats[0].arrives_today || 0;
    const departsToday = todayStats[0].departs_today || 0;
    const staysToday = todayStats[0].stays_today || 0;

    const analyticsData = {
      totalRevenue,
      pendingRevenue,
      revenueChange: parseFloat(revenueChange),
      totalBookings,
      bookingsChange: parseFloat(bookingsChange),
      averageRating,
      ratingChange,
      occupancyRate,
      occupancyChange,
      topProperties: topPropertiesList,
      recentBookings: recentBooks,
      revenueChart,
      bookingChart,
      arrivesToday,
      departsToday,
      staysToday,
      localGuests: 60, // Mocks based on typical structure
      internationalGuests: 30,
      businessTravelers: 10,
      directBookings: 50,
      otaBookings: 30,
      referralBookings: 20,
      avgStayDuration: 3,
      repeatGuestRate: 15,
      cancellationRate: 5
    };

    res.json(
      formatResponse(true, 'Analytics data retrieved successfully', analyticsData)
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
    const userId = req.user.employee_user_id || req.user.id;

    // Get user info
    const [users] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, user_type,
             email_verified_at, phone_verified_at, is_active,
             profile_image, date_of_birth, gender, address,
             city, state, country, postal_code, language,
             timezone, email_notifications, sms_notifications,
             auto_accept_bookings, last_login_at, created_at, updated_at,
             bio
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
    const userId = req.user.employee_user_id || req.user.id;
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      country,
      postal_code,
      bio,
      business_name,
      business_license,
      tax_id,
      bank_account_number,
      bank_name,
      bank_routing_number,
      auto_accept_bookings // from users table
    } = req.body;

    // Check if email is already in use
    if (email) {
      const [existingEmail] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json(formatResponse(false, 'Email is already in use by another account'));
      }
    }

    // Update users table
    const userUpdateFields = [];
    const userUpdateValues = [];
    const allowedUserFields = {
      first_name, last_name, email, phone, date_of_birth, gender,
      address, city, state, country, postal_code, bio, auto_accept_bookings
    };

    Object.keys(allowedUserFields).forEach(key => {
      if (allowedUserFields[key] !== undefined) {
        let value = allowedUserFields[key];
        if (value === '' && ['date_of_birth', 'gender'].includes(key)) {
          value = null;
        }
        if (key === 'auto_accept_bookings') {
          value = value ? 1 : 0;
        }
        userUpdateFields.push(`${key} = ?`);
        userUpdateValues.push(value);
      }
    });

    if (userUpdateFields.length > 0) {
      userUpdateValues.push(userId);
      await pool.execute(
        `UPDATE users SET ${userUpdateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        userUpdateValues
      );
    }

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
            updated_at = NOW()
        WHERE user_id = ?
      `, [
        business_name, business_license, tax_id,
        bank_account_number, bank_name, bank_routing_number,
        userId
      ]);
    } else {
      // Create new profile with default 0 commission rate (admin sets it later)
      await pool.execute(`
        INSERT INTO property_owners (
          user_id, business_name, business_license, tax_id,
          bank_account_number, bank_name, bank_routing_number,
          commission_rate, is_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())
      `, [
        userId, business_name, business_license, tax_id,
        bank_account_number, bank_name, bank_routing_number
      ]);
    }

    // Get updated user info to return in response
    const [users] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, user_type,
             email_verified_at, phone_verified_at, is_active,
             profile_image, date_of_birth, gender, address,
             city, state, country, postal_code, language,
             timezone, email_notifications, sms_notifications,
             auto_accept_bookings, last_login_at, created_at, updated_at,
             bio
      FROM users
      WHERE id = ?
    `, [userId]);

    const user = users[0];
    const [propertyOwners] = await pool.execute(`
      SELECT * FROM property_owners
      WHERE user_id = ?
    `, [userId]);

    if (propertyOwners.length > 0) {
      user.property_owner_info = propertyOwners[0];
    }

    res.json(
      formatResponse(true, 'Profile updated successfully', { user })
    );

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update profile', null, error.message)
    );
  }
});

// Confirm booking (property owner confirms pending booking)
router.patch('/bookings/:id/confirm', requireHMSPermission('manage_reservations'), validateId, async (req, res) => {
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
      SET status = 'request_accepted',
          confirmed_at = NOW(),
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
router.patch('/bookings/:id/checkin', requireHMSPermission('manage_reservations'), validateId, async (req, res) => {
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

    // Update HMS room status if applicable
    if (booking.hms_room_id) {
        await pool.execute(
            'UPDATE hms_rooms SET status = "occupied", updated_at = NOW() WHERE id = ?',
            [booking.hms_room_id]
        );
    }

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
router.patch('/bookings/:id/checkout', requireHMSPermission('manage_reservations'), validateId, async (req, res) => {
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

    // Update HMS room status if applicable
    if (booking.hms_room_id) {
        await pool.execute(
            'UPDATE hms_rooms SET status = "dirty", updated_at = NOW() WHERE id = ?',
            [booking.hms_room_id]
        );
    }

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
router.patch('/bookings/:id/cancel', requireHMSPermission('manage_reservations'), validateId, async (req, res) => {
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

    // Create a full refund record for Admin review if payment was made
    try {
      // Specifically find the guest_payment (CR) entry to correctly link payment_method
      const [payments] = await pool.execute(`
        SELECT id FROM payments 
        WHERE booking_id = ? AND transaction_type = 'guest_payment'
        AND status IN ('completed', 'processing', 'authorized')
        ORDER BY id DESC LIMIT 1
      `, [id]);

      const [paidResult] = await pool.execute(`
        SELECT SUM(amount) as paid_amount 
        FROM payments 
        WHERE booking_id = ? AND status IN ('completed', 'processing', 'authorized') AND transaction_type = 'guest_payment'
      `, [id]);
      
      const amountActuallyPaid = parseFloat(paidResult[0].paid_amount || 0);

      if (amountActuallyPaid > 0 && payments.length > 0) {
        const paymentId = payments[0].id;
        const refundReference = `REF-${Date.now()}-${id}`;

        await pool.execute(`
          INSERT INTO refunds (
            booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund, 
            refund_reason, refund_type, cancellation_policy_applied, status, requested_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'full', ?, 'pending', NOW())
        `, [
          id, 
          paymentId,
          refundReference,
          amountActuallyPaid,
          amountActuallyPaid, // Full amount
          amountActuallyPaid, // Full amount
          (reason || 'Host Cancellation').substring(0, 255), 
          'Host Cancelled. Guest receives full refund.'
        ]);
        console.log(`✅ Full Refund request generated for cancelled booking ${id}`);
      }
    } catch (refErr) {
        console.error('❌ Refund creation error on Host Cancel:', refErr);
    }

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

// Claim security deposit deduction
router.post('/bookings/:id/deduction-claim', requireHMSPermission('manage_reservations'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json(formatResponse(false, 'Amount and reason are required'));
    }

    // Get property owner ID
    const [owners] = await pool.execute('SELECT id FROM property_owners WHERE user_id = ?', [req.user.id]);
    if (owners.length === 0) return res.status(404).json(formatResponse(false, 'Property owner not found'));
    const ownerId = owners[0].id;

    // Verify booking belongs to property owner's property
    const [bookings] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND p.owner_id = ?
    `, [id, ownerId]);

    if (bookings.length === 0) return res.status(404).json(formatResponse(false, 'Booking not found'));
    const booking = bookings[0];

    if (booking.status !== 'checked_out') {
      return res.status(400).json(formatResponse(false, 'Deduction can only be requested after check-out'));
    }

    if (booking.security_deposit_status && booking.security_deposit_status !== 'pending') {
      return res.status(400).json(formatResponse(false, 'A security deposit claim has already been submitted for this booking'));
    }

    // Update booking with claim details
    await pool.execute(`
      UPDATE bookings 
      SET security_deposit_status = 'claim_requested',
          security_deposit_claim_amount = ?,
          security_deposit_claim_reason = ?,
          security_deposit_claim_at = NOW(),
          updated_at = NOW()
      WHERE id = ?
    `, [amount, reason, id]);

    // Process: create a support ticket from host to admin
    const subject = `Security Deposit Deduction Claim - Ref #${booking.booking_reference}`;
    const message = `Host has requested a security deposit deduction.\nBooking ID: ${booking.id}\nReference: ${booking.booking_reference}\nDeduction Amount: ৳${amount}\nReason: ${reason}\nPlease process this deduction.`;

    const [ticketResult] = await pool.execute(
      'INSERT INTO tickets (guest_id, property_id, host_id, subject, category, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [booking.guest_id, booking.property_id, req.user.id, subject, 'Financial', 'High', 'Open']
    );

    await pool.execute(
      'INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?)',
      [ticketResult.insertId, req.user.id, 'host', message]
    );

    res.json(formatResponse(true, 'Deduction claim submitted to Admin successfully', {
      claim_amount: amount,
      claim_reason: reason
    }));
  } catch (error) {
    console.error('Deduction claim error:', error);
    res.status(500).json(formatResponse(false, 'Failed to submit deduction claim', null, error.message));
  }
});

// Get payment history for a booking
router.get('/bookings/:id/payments', requireHMSPermission('manage_reservations'), validateId, async (req, res) => {
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
router.patch('/bookings/:id/payment', requireHMSPermission('manage_reservations'), validateId, async (req, res) => {
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

// Get property availability and special pricing
router.get('/properties/:id/calendar-rates', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if property belongs to owner
    const [owners] = await pool.execute('SELECT id FROM property_owners WHERE user_id = ?', [req.user.id]);
    if (owners.length === 0) return res.status(404).json(formatResponse(false, 'Owner not found'));
    
    const [properties] = await pool.execute('SELECT id, base_price FROM properties WHERE id = ? AND owner_id = ?', [id, owners[0].id]);
    if (properties.length === 0) return res.status(404).json(formatResponse(false, 'Property not found'));
    
    const basePrice = properties[0].base_price;
    
    const [rates] = await pool.execute('SELECT DATE_FORMAT(date, "%Y-%m-%d") as date, is_available, price, minimum_stay FROM property_availability WHERE property_id = ?', [id]);
    
    res.json(formatResponse(true, 'Rates retrieved', { base_price: basePrice, rates }));
  } catch (err) {
    console.error('Rates err:', err);
    res.status(500).json(formatResponse(false, 'Error retrieving rates', null, err.message));
  }
});

// Create or update special rate/availability for a date or date range
router.post('/properties/:id/calendar-rates', validateId, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { date, startDate, endDate, dates, is_available, price, minimum_stay } = req.body;

    if (!date && (!startDate || !endDate) && (!dates || !Array.isArray(dates))) {
      return res.status(400).json(formatResponse(false, 'Date, range, or array of dates is required'));
    }

    // Check ownership
    const [owners] = await pool.execute('SELECT id FROM property_owners WHERE user_id = ?', [req.user.id]);
    if (owners.length === 0) return res.status(404).json(formatResponse(false, 'Owner not found'));
    const [properties] = await pool.execute('SELECT id FROM properties WHERE id = ? AND owner_id = ?', [id, owners[0].id]);
    if (properties.length === 0) return res.status(404).json(formatResponse(false, 'Property not found'));

    let datesToUpdate = [];
    if (dates && Array.isArray(dates)) {
      datesToUpdate = dates;
    } else if (date) {
      datesToUpdate.push(date);
    } else {
      let current = new Date(startDate);
      const last = new Date(endDate);
      while (current < last) {
        datesToUpdate.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    if (datesToUpdate.length === 0) {
      return res.status(400).json(formatResponse(false, 'No valid dates provided'));
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const d of datesToUpdate) {
      const [existing] = await connection.execute(
        'SELECT id FROM property_availability WHERE property_id = ? AND date = ?',
        [id, d]
      );

      if (existing.length > 0) {
        await connection.execute(
          'UPDATE property_availability SET is_available = ?, price = ?, minimum_stay = ?, updated_at = NOW() WHERE id = ?',
          [
            is_available ? 1 : 0,
            price || null,
            minimum_stay || null,
            existing[0].id
          ]
        );
      } else {
        await connection.execute(
          'INSERT INTO property_availability (property_id, date, is_available, price, minimum_stay, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [
            id,
            d,
            is_available ? 1 : 0,
            price || null,
            minimum_stay || null
          ]
        );
      }
    }

    await connection.commit();
    res.json(formatResponse(true, 'Rates updated successfully for ' + datesToUpdate.length + ' dates'));
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Rate update err:', err);
    res.status(500).json(formatResponse(false, 'Error updating rates', null, err.message));
  } finally {
    if (connection) connection.release();
  }
});

// Use earnings routes
router.use('/earnings', earningsRoutes);
router.use('/hms-mgmt', hmsMgmtRoutes);

// Get available HMS packages (for property owners)
router.get('/hms/packages', async (req, res) => {
  try {
    const [packages] = await pool.execute('SELECT * FROM hms_packages WHERE is_active = true ORDER BY price ASC');
    // Ensure features is parsed JSON
    packages.forEach(pkg => {
      try {
         pkg.features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
      } catch(e) {
         pkg.features = [];
      }
    });
    res.json(formatResponse(true, 'Packages retrieved successfully', packages));
  } catch (error) {
    console.error('Get hms packages error', error);
    res.status(500).json(formatResponse(false, 'Failed to get packages', null, error.message));
  }
});

// Start Free Trial
router.post('/hms/start-trial', async (req, res) => {
  try {
    const hostId = req.user.id;

    // Check if host already has a subscription/trial
    const [existing] = await pool.execute('SELECT is_trial_used FROM hms_subscriptions WHERE host_id = ?', [hostId]);
    
    if (existing.length > 0 && existing[0].is_trial_used) {
      return res.status(400).json(formatResponse(false, 'You have already used your free trial.'));
    }

    // Find active trial package
    const [trials] = await pool.execute('SELECT id, trial_days FROM hms_packages WHERE is_trial = true AND is_active = true LIMIT 1');
    
    if (trials.length === 0) {
      return res.status(404).json(formatResponse(false, 'No active free trial package found. Please contact support.'));
    }

    const trialPkg = trials[0];
    const trialDays = trialPkg.trial_days;

    if (existing.length > 0) {
      // Update existing record
      await pool.execute(
        `UPDATE hms_subscriptions 
         SET status = 'trialing', is_trial_used = true, trial_started_at = NOW(), 
             trial_ends_at = DATE_ADD(NOW(), INTERVAL ? DAY), 
             package_id = ?, updated_at = NOW() 
         WHERE host_id = ?`,
        [trialDays, trialPkg.id, hostId]
      );
    } else {
      // Create new record
      await pool.execute(
        `INSERT INTO hms_subscriptions 
         (host_id, status, is_trial_used, trial_started_at, trial_ends_at, package_id) 
         VALUES (?, 'trialing', true, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?)`,
        [hostId, trialDays, trialPkg.id]
      );
    }

    await syncHmsAccessForHost(hostId, true);

    res.json(formatResponse(true, `Free trial of ${trialDays} days activated successfully!`));
  } catch (error) {
    console.error('Start trial error', error);
    res.status(500).json(formatResponse(false, 'Failed to start free trial', null, error.message));
  }
});

// --- HMS Room Management ---

router.get('/hms/rooms/:propertyId', requireHMSAccess, requireHMSPermission('manage_inventory'), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const propId = parseInt(propertyId);
    console.log(`[HMS] Fetching rooms for property ${propId} by user ${req.user.id}`);
    
    // Security check: Verify the host owns this property
    console.log('[HMS] Verifying property ownership...');
    const [property] = await pool.query(
      'SELECT id FROM properties WHERE id = ? AND owner_id = (SELECT id FROM property_owners WHERE user_id = ?)',
      [propId, req.user.id]
    );

    if (property.length === 0) {
      console.log(`[HMS] Ownership verification failed for property ${propId} and user ${req.user.id}`);
      return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
    }

    console.log('[HMS] Ownership verified. Querying rooms...');
    const [rooms] = await pool.query(
      'SELECT id, property_id, room_number, room_type, floor, price, status, features, images, created_at FROM hms_rooms WHERE property_id = ? ORDER BY room_number ASC',
      [propId]
    );

    console.log(`[HMS] Success: Found ${rooms.length} rooms`);
    
    // Robust JSON parser
    const safeParse = (data) => {
      if (!data) return [];
      if (typeof data !== 'string') return data;
      try {
        const parsed = JSON.parse(data);
        return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      } catch (e) {
        return [];
      }
    };

    // Parse JSON fields for each room
    const processedRooms = await Promise.all(rooms.map(async (room) => {
      let roomImages = safeParse(room.images);
      
      if (room.room_number === 'Entire Place' && roomImages.length === 0) {
        const [propImages] = await pool.query(
          'SELECT image_url FROM property_images WHERE property_id = ? AND is_active = 1 ORDER BY sort_order ASC',
          [propId]
        );
        roomImages = propImages.map(img => img.image_url);
      }

      return {
        ...room,
        features: safeParse(room.features),
        images: roomImages
      };
    }));

    res.json(formatResponse(true, 'Rooms retrieved successfully', { rooms: processedRooms }));
  } catch (error) {
    console.error('[HMS] Get HMS rooms CRASH:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve rooms', null, error.message));
  }
});

router.post('/hms/rooms/bulk', requireHMSAccess, requireHMSPermission('manage_inventory'), async (req, res) => {
  try {
    const { property_id, rooms } = req.body; 
    const propId = parseInt(property_id);

    if (!propId || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json(formatResponse(false, 'Property ID and an array of rooms are required'));
    }

    // Security check
    const [property] = await pool.query(
      'SELECT id FROM properties WHERE id = ? AND owner_id = (SELECT id FROM property_owners WHERE user_id = ?)',
      [propId, req.user.id]
    );

    if (property.length === 0) {
      return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
    }

    // Prepare data for bulk insert
    const values = rooms.map(room => [
      propId, 
      room.room_number, 
      room.room_type || 'Standard', 
      room.floor || '', 
      parseFloat(room.price) || 0, 
      room.status || 'available', 
      JSON.stringify(room.features || [])
    ]);

    await pool.query(
      'INSERT INTO hms_rooms (property_id, room_number, room_type, floor, price, status, features) VALUES ?',
      [values]
    );

    res.status(201).json(formatResponse(true, `${rooms.length} rooms added successfully`));
  } catch (error) {
    console.error('[HMS] Bulk Add HMS rooms CRASH:', error);
    res.status(500).json(formatResponse(false, 'Failed to add rooms in bulk', null, error.message));
  }
});

router.post('/hms/rooms', requireHMSAccess, requireHMSPermission('manage_inventory'), async (req, res) => {
  try {
    const { property_id, room_number, room_type, floor, price, features, status, images } = req.body;
    const propId = parseInt(property_id);
    const numPrice = parseFloat(price);

    console.log(`[HMS] Adding room ${room_number} to property ${propId}`);

    if (!propId || !room_number || isNaN(numPrice)) {
      return res.status(400).json(formatResponse(false, 'Property ID, Room Number and valid Price are required'));
    }

    // Security check
    const [property] = await pool.query(
      'SELECT id FROM properties WHERE id = ? AND owner_id = (SELECT id FROM property_owners WHERE user_id = ?)',
      [propId, req.user.id]
    );

    if (property.length === 0) {
      return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
    }

    // Process images if provided
    let finalImages = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.startsWith('data:image')) {
          const savedUrl = await processBase64Image(img, 'hms-room', 'rooms');
          finalImages.push(savedUrl);
        } else if (img.startsWith('/uploads/') || img.startsWith('http')) {
          finalImages.push(img);
        }
      }
    }

    console.log('[HMS] Inserting room...');
    await pool.query(
      'INSERT INTO hms_rooms (property_id, room_number, room_type, floor, price, status, features, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [propId, room_number, room_type, floor, numPrice, status || 'available', JSON.stringify(features || []), JSON.stringify(finalImages)]
    );

    res.status(201).json(formatResponse(true, 'Room added successfully'));
  } catch (error) {
    console.error('[HMS] Add HMS room CRASH:', error);
    res.status(500).json(formatResponse(false, 'Failed to add room', null, error.message));
  }
});

router.put('/hms/rooms/:id', requireHMSAccess, requireHMSPermission('manage_inventory'), async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, room_type, floor, price, status, features, images } = req.body;
    const numPrice = parseFloat(price);

    console.log(`[HMS] Updating room ${id}`);

    // Security check: Verify room exists and belongs to host's property
    const [check] = await pool.query(
      'SELECT r.id, r.property_id, r.room_number FROM hms_rooms r JOIN properties p ON r.property_id = p.id JOIN property_owners po ON p.owner_id = po.id WHERE r.id = ? AND po.user_id = ?',
      [id, req.user.id]
    );

    if (check.length === 0) {
      return res.status(404).json(formatResponse(false, 'Room not found or access denied.'));
    }

    // Process images if provided
    let finalImages = [];
    if (Array.isArray(images)) {
      for (const img of images) {
        if (img.startsWith('data:image')) {
          const savedUrl = await processBase64Image(img, 'hms-room', 'rooms');
          finalImages.push(savedUrl);
        } else if (img.startsWith('/uploads/') || img.startsWith('http')) {
          finalImages.push(img);
        }
      }
    }

    await pool.query(
      'UPDATE hms_rooms SET room_number = ?, room_type = ?, floor = ?, price = ?, status = ?, features = ?, images = ? WHERE id = ?',
      [room_number, room_type, floor, numPrice, status, JSON.stringify(features || []), JSON.stringify(finalImages), id]
    );

    // If it's the 'Entire Place' room, sync these images back to property_images table
    if (check[0] && check[0].room_number === 'Entire Place') {
      const propertyId = check[0].property_id;
      
      // Normalize images list (remove domain prefix if any, so we store relative path /uploads/...)
      const cleanedUrls = finalImages.map(img => {
        let cleanUrl = img;
        if (img.startsWith('http://localhost:5000/')) {
          cleanUrl = img.substring('http://localhost:5000'.length);
        } else if (img.startsWith('http') && img.includes('/uploads/')) {
          const index = img.indexOf('/uploads/');
          if (index !== -1) {
            cleanUrl = img.substring(index);
          }
        }
        return cleanUrl;
      });

      // Delete old property images
      await pool.execute('DELETE FROM property_images WHERE property_id = ?', [propertyId]);
      
      // Insert new property images
      if (cleanedUrls.length > 0) {
        const placeholders = cleanedUrls.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = cleanedUrls.flatMap((url, index) => [
          propertyId,
          url,
          index === 0 ? 'main' : 'gallery',
          `Property image ${index + 1}`,
          index,
          1
        ]);
        await pool.execute(
          `INSERT INTO property_images (property_id, image_url, image_type, alt_text, sort_order, is_active) VALUES ${placeholders}`,
          values
        );
      }
      console.log(`[HMS-IMAGE-SYNC] Synced ${cleanedUrls.length} images from Entire Place room edit back to property ${propertyId}`);
    }

    res.json(formatResponse(true, 'Room updated successfully'));
  } catch (error) {
    console.error('[HMS] Update HMS room CRASH:', error);
    res.status(500).json(formatResponse(false, 'Failed to update room', null, error.message));
  }
});

router.patch('/hms/rooms/:id/status', requireHMSAccess, requireHMSPermission('manage_inventory'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json(formatResponse(false, 'Status is required'));
    }

    // Security check: Verify room exists and belongs to host's property
    const [check] = await pool.query(
      'SELECT r.id FROM hms_rooms r JOIN properties p ON r.property_id = p.id JOIN property_owners po ON p.owner_id = po.id WHERE r.id = ? AND po.user_id = ?',
      [id, req.user.id]
    );

    if (check.length === 0) {
      return res.status(404).json(formatResponse(false, 'Room not found or access denied.'));
    }

    await pool.query('UPDATE hms_rooms SET status = ? WHERE id = ?', [status, id]);

    res.json(formatResponse(true, 'Room status updated successfully'));
  } catch (error) {
    console.error('[HMS] Update status CRASH:', error);
    res.status(500).json(formatResponse(false, 'Failed to update status', null, error.message));
  }
});

router.delete('/hms/rooms/:id', requireHMSAccess, requireHMSPermission('manage_inventory'), async (req, res) => {
  try {
    const { id } = req.params;

    // Security check
    const [check] = await pool.execute(
      'SELECT r.id FROM hms_rooms r JOIN properties p ON r.property_id = p.id JOIN property_owners po ON p.owner_id = po.id WHERE r.id = ? AND po.user_id = ?',
      [id, req.user.id]
    );

    if (check.length === 0) {
      return res.status(404).json(formatResponse(false, 'Room not found or access denied.'));
    }

    await pool.execute('DELETE FROM hms_rooms WHERE id = ?', [id]);

    res.json(formatResponse(true, 'Room deleted successfully'));
  } catch (error) {
    console.error('Delete HMS room error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete room', null, error.message));
  }
});

// Get HMS reservations for a specific property
router.get('/hms/reservations/:propertyId', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { propertyId } = req.params;
        const propId = parseInt(propertyId);

        // Security check
        const [property] = await pool.query(
            'SELECT id FROM properties WHERE id = ? AND owner_id = (SELECT id FROM property_owners WHERE user_id = ?)',
            [propId, req.user.id]
        );

        if (property.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
        }

        const [reservations] = await pool.query(`
            SELECT 
                b.*, 
                r.room_number, 
                r.room_type,
                u.first_name as guest_first_name,
                u.last_name as guest_last_name,
                u.email as guest_user_email,
                u.phone as guest_user_phone,
                (SELECT COALESCE(SUM(amount), 0) FROM hms_bills WHERE booking_id = b.id) as extra_billing_amount,
                (SELECT COALESCE(SUM(cr_amount), 0) FROM payments WHERE booking_id = b.id AND status = 'completed') as paid_amount,
                (SELECT COUNT(*) FROM hms_food_orders WHERE booking_id = b.id AND payment_status IN ('unpaid', 'billed_to_room')) as unpaid_food_count,
                (SELECT COUNT(*) FROM hms_bills WHERE booking_id = b.id) as extra_bills_count
            FROM bookings b
            LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
            LEFT JOIN users u ON b.guest_id = u.id
            WHERE b.property_id = ?
            ORDER BY b.created_at DESC
        `, [propId]);

        res.json(formatResponse(true, 'Reservations retrieved successfully', { reservations }));
    } catch (error) {
        console.error('[HMS] Get reservations error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve reservations', null, error.message));
    }
});

// Create manual HMS reservation (Walk-in/Offline)
router.post('/hms/reservations', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { 
            property_id, hms_room_id, check_in_date, check_out_date, 
            guest_name, guest_email, guest_phone, total_amount, 
            payment_status, special_requests, source 
        } = req.body;

        const propId = parseInt(property_id);
        const roomId = hms_room_id ? parseInt(hms_room_id) : null;

        // Security check
        const [property] = await pool.query(
            'SELECT id FROM properties WHERE id = ? AND owner_id = (SELECT id FROM property_owners WHERE user_id = ?)',
            [propId, req.user.id]
        );

        if (property.length === 0) {
            return res.status(403).json(formatResponse(false, 'Access denied. You do not own this property.'));
        }

        // Generate a booking reference
        const bookingReference = `HMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const [result] = await pool.query(`
            INSERT INTO bookings (
                booking_reference, property_id, hms_room_id, check_in_date, check_out_date,
                guest_name, guest_email, guest_phone, base_price, total_amount,
                status, payment_status, special_requests, source, booking_source,
                admin_commission_rate, admin_commission_amount, property_owner_earnings,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            bookingReference, propId, roomId, check_in_date, check_out_date,
            guest_name, guest_email, guest_phone, total_amount, total_amount,
            'confirmed', payment_status || 'pending', special_requests, source || 'Walk-in', 'admin',
            0, 0, total_amount
        ]);

        const bookingId = result.insertId;

        // If paid, record payment and sync to HMS accounts
        if (payment_status === 'paid') {
            try {
                const payRef = `HMS-MANUAL-${Date.now()}-${bookingId}`;
                const [pResult] = await pool.query(`
                    INSERT INTO payments (
                        booking_id, payment_reference, payment_method, payment_type, 
                        amount, cr_amount, dr_amount, transaction_type, status, notes,
                        payment_date
                    ) VALUES (?, ?, 'cash', 'booking', ?, ?, 0, 'guest_payment', 'completed', 'Manual HMS reservation creation', NOW())
                `, [bookingId, payRef, total_amount, total_amount]);

                await syncPaymentToHMSAccounts(pResult.insertId);
            } catch (accError) {
                console.error('[HMS] Failed to auto-sync reservation payment to accounts:', accError);
            }
        }

        res.status(201).json(formatResponse(true, 'Reservation created successfully'));
    } catch (error) {
        console.error('[HMS] Create reservation error:', error);
        res.status(500).json(formatResponse(false, 'Failed to create reservation', null, error.message));
    }
});

// Update HMS reservation status
router.patch('/hms/reservations/:id/status', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Security check and fetch billing info
        const [check] = await pool.query(`
            SELECT 
                b.id, b.hms_room_id, b.total_amount, b.guest_id,
                (SELECT COALESCE(SUM(amount), 0) FROM hms_bills WHERE booking_id = b.id) as extra_billing_amount,
                (SELECT COALESCE(SUM(cr_amount), 0) FROM payments WHERE booking_id = b.id AND status = 'completed') as paid_amount
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id 
            JOIN property_owners po ON p.owner_id = po.id 
            WHERE b.id = ? AND po.user_id = ?
        `, [id, req.user.id]);

        if (check.length === 0) {
            return res.status(404).json(formatResponse(false, 'Reservation not found or access denied.'));
        }

        // Validation for checkout: Must clear dues
        if (status === 'checked_out') {
            const totalDue = parseFloat(check[0].total_amount) + parseFloat(check[0].extra_billing_amount);
            const paidAmount = parseFloat(check[0].paid_amount);
            
            if (paidAmount < totalDue) {
                const remaining = totalDue - paidAmount;
                return res.status(400).json(
                    formatResponse(false, `Cannot checkout. Remaining balance of ৳${remaining.toFixed(2)} must be settled first.`)
                );
            }
        }

        if (status === 'cancelled') {
            await pool.query('UPDATE bookings SET status = ?, cancelled_at = NOW() WHERE id = ?', [status, id]);

            // Create a full refund record for Admin review if payment was made
            try {
                // Specifically find the guest_payment (CR) entry to correctly link payment_method
                const [payments] = await pool.query(`
                    SELECT id FROM payments 
                    WHERE booking_id = ? AND transaction_type = 'guest_payment'
                    AND status IN ('completed', 'processing', 'authorized')
                    ORDER BY id DESC LIMIT 1
                `, [id]);

                const [paidResult] = await pool.query(`
                    SELECT SUM(amount) as paid_amount 
                    FROM payments 
                    WHERE booking_id = ? AND status IN ('completed', 'processing', 'authorized') AND transaction_type = 'guest_payment'
                `, [id]);
                
                const amountActuallyPaid = parseFloat(paidResult[0].paid_amount || 0);

                if (amountActuallyPaid > 0 && payments.length > 0) {
                    const paymentId = payments[0].id;
                    const refundReference = `REF-${Date.now()}-${id}`;

                    await pool.query(`
                        INSERT INTO refunds (
                            booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund, 
                            refund_reason, refund_type, cancellation_policy_applied, status, requested_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'full', ?, 'pending', NOW())
                    `, [
                        id, 
                        paymentId,
                        refundReference,
                        amountActuallyPaid,
                        amountActuallyPaid, // Full amount
                        amountActuallyPaid, // Full amount
                        'Host Cancellation (via HMS Status Update)', 
                        'Host Cancelled. Guest receives full refund.'
                    ]);
                    console.log(`✅ Full Refund request generated for cancelled booking ${id} via HMS status update`);
                }
            } catch (refErr) {
                console.error('❌ Refund creation error on Host Cancel via HMS status update:', refErr);
            }

            // Refund rewards points if any were redeemed for this booking
            try {
                const { refundPointsForBooking } = require('../../utils/rewardsPoints');
                const refundResult = await refundPointsForBooking(check[0].guest_id, id);
                if (refundResult.pointsRefunded > 0) {
                    console.log(`✅ Refunded ${refundResult.pointsRefunded} points to guest ${check[0].guest_id} for cancelled booking ${id}`);
                }
            } catch (pointsError) {
                console.error('❌ Points refund error on HMS cancel:', pointsError);
            }
        } else {
            await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        }

        // Sync with room status
        if (check[0].hms_room_id) {
            if (status === 'checked_in') {
                await pool.query('UPDATE hms_rooms SET status = "occupied" WHERE id = ?', [check[0].hms_room_id]);
            } else if (status === 'checked_out') {
                await pool.query('UPDATE hms_rooms SET status = "dirty" WHERE id = ?', [check[0].hms_room_id]);
            } else if (status === 'cancelled') {
                await pool.query('UPDATE hms_rooms SET status = "available" WHERE id = ?', [check[0].hms_room_id]);
            }
        }

        res.json(formatResponse(true, 'Reservation status updated successfully'));
    } catch (error) {
        console.error('[HMS] Update reservation status error:', error);
        res.status(500).json(formatResponse(false, 'Failed to update reservation status', null, error.message));
    }
});

// Manual Payment Logging for HMS
router.patch('/hms/reservations/:id/manual-payment', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method, payment_notes, amount } = req.body;

        // Security check: Admins can see all, Owners see their own
        let query = `
            SELECT b.id, b.property_id, b.total_amount 
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id 
            JOIN property_owners po ON p.owner_id = po.id 
            WHERE b.id = ?
        `;
        let params = [id];

        if (req.user.role !== 'admin') {
            query += ' AND po.user_id = ?';
            params.push(req.user.id);
        }

        const [check] = await pool.query(query, params);

        if (check.length === 0) {
            return res.status(404).json(formatResponse(false, 'Reservation not found or access denied.'));
        }

        await pool.query(
            'UPDATE bookings SET payment_status = "paid", payment_method = ?, payment_notes = ? WHERE id = ?',
            [payment_method, payment_notes, id]
        );

        // Record in payments table for accounting
        const payRef = `HMS-MANUAL-${Date.now()}-${id}`;
        const [payInsertResult] = await pool.query(`
            INSERT INTO payments (
                booking_id, payment_reference, payment_method, payment_type, 
                amount, cr_amount, dr_amount, transaction_type, status, notes,
                payment_date
            ) VALUES (?, ?, ?, 'booking', ?, ?, 0, 'guest_payment', 'completed', ?, NOW())
        `, [id, payRef, payment_method, amount || check[0].total_amount, amount || check[0].total_amount, payment_notes || 'Manual HMS payment']);

        // --- HMS ACCOUNTS LINK ---
        try {
            await syncPaymentToHMSAccounts(payInsertResult.insertId);
        } catch (accError) {
            console.error('[HMS-ACCOUNTS] Failed to link reservation payment to accounts:', accError);
        }
        // -------------------------

        res.json(formatResponse(true, 'Payment recorded successfully'));
    } catch (error) {
        console.error('[HMS] Manual payment error:', error);
        res.status(500).json(formatResponse(false, 'Failed to record payment', null, error.message));
    }
});

// Generate/Get Payment Link for HMS
router.get('/hms/reservations/:id/payment-link', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { id } = req.params;
        const [check] = await pool.query(`
            SELECT b.id, b.payment_link_token 
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id 
            JOIN property_owners po ON p.owner_id = po.id 
            WHERE b.id = ? AND po.user_id = ?
        `, [id, req.user.id]);

        if (check.length === 0) {
            return res.status(404).json(formatResponse(false, 'Reservation not found or access denied.'));
        }

        let token = check[0].payment_link_token;
        if (!token) {
            token = require('crypto').randomBytes(32).toString('hex');
            await pool.query('UPDATE bookings SET payment_link_token = ? WHERE id = ?', [token, id]);
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const paymentLink = `${frontendUrl}/hms/pay/${token}`;

        res.json(formatResponse(true, 'Payment link generated', { paymentLink }));
    } catch (error) {
        console.error('[HMS] Payment link error:', error);
        res.status(500).json(formatResponse(false, 'Failed to generate link'));
    }
});

// Get Invoice Data
router.get('/hms/reservations/:id/invoice-data', requireHMSAccess, requireHMSPermission('manage_reservations'), async (req, res) => {
    try {
        const { id } = req.params;
        
        let query = `
            SELECT 
                b.*, 
                p.title as property_title, p.address as property_address, p.city as property_city,
                r.room_number, r.room_type,
                po.business_name as company_name,
                DATEDIFF(b.check_out_date, b.check_in_date) as nights
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN property_owners po ON p.owner_id = po.id
            LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
            WHERE b.id = ?
        `;
        let params = [id];

        if (req.user.role !== 'admin') {
            query += ' AND po.user_id = ?';
            params.push(req.user.id);
        }

        const [rows] = await pool.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json(formatResponse(false, 'Reservation not found or access denied.'));
        }

        const invoice = rows[0];
        
        // Fetch extra bills
        const [extraBills] = await pool.query('SELECT * FROM hms_bills WHERE booking_id = ?', [id]);
        invoice.extra_bills = extraBills;
        invoice.extra_total = extraBills.reduce((sum, item) => sum + parseFloat(item.amount), 0);

        res.json(formatResponse(true, 'Invoice data retrieved', { invoice }));
    } catch (error) {
        console.error('[HMS] Invoice data error:', error);
        res.status(500).json(formatResponse(false, 'Failed to fetch invoice data'));
    }
});

module.exports = router;
