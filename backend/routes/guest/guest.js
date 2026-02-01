const express = require('express');
const { pool } = require('../../config/database');
const {
  formatResponse,
  generatePagination,
  generateBookingReference,
  calculateBookingTotal,
  isPastDate,
  isValidDateRange,
  formatDate
} = require('../../utils/helpers');
const { sendSMS } = require('../../utils/sms');
const {
  validateBooking,
  validateId,
  validatePropertyId,
  validatePagination
} = require('../../middleware/validation');
const { verifyToken, requireGuest, optionalAuth } = require('../../middleware/auth');

const router = express.Router();

// Get guest dashboard
router.get('/dashboard', verifyToken, requireGuest, async (req, res) => {
  try {
    // Get recent bookings
    const [recentBookings] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.status, b.created_at,
        b.check_in_date, b.check_out_date, b.total_amount,
        p.title as property_title, p.city as property_city,
        pi.image_url as property_image
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
      WHERE b.guest_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [req.user.id]);

    // Get upcoming bookings
    const [upcomingBookings] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.check_in_date, b.check_out_date,
        p.title as property_title, p.city as property_city,
        pi.image_url as property_image
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
      WHERE b.guest_id = ? AND b.status = 'confirmed' AND b.check_in_date >= CURDATE()
      ORDER BY b.check_in_date ASC
      LIMIT 3
    `, [req.user.id]);

    // Get favorites count
    const [favoritesCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
      [req.user.id]
    );

    // Get total bookings
    const [totalBookings] = await pool.execute(
      'SELECT COUNT(*) as total FROM bookings WHERE guest_id = ?',
      [req.user.id]
    );

    res.json(
      formatResponse(true, 'Guest dashboard data retrieved successfully', {
        statistics: {
          totalBookings: totalBookings[0].total,
          totalFavorites: favoritesCount[0].total
        },
        recentBookings,
        upcomingBookings
      })
    );

  } catch (error) {
    console.error('Get guest dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve dashboard data', null, error.message)
    );
  }
});

// Get guest's bookings
router.get('/bookings', verifyToken, requireGuest, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE b.guest_id = ?';
    let queryParams = [req.user.id];

    if (status) {
      whereClause += ' AND b.status = ?';
      queryParams.push(status);
    }

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM bookings b 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get bookings
    const [bookings] = await pool.execute(`
      SELECT 
        b.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        p.base_price,
        pi.image_url as property_image,
        (SELECT COUNT(*) FROM reviews r WHERE r.booking_id = b.id) > 0 as is_reviewed
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

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

// Create new booking
router.post('/bookings', verifyToken, requireGuest, validateBooking, async (req, res) => {
  try {
    const {
      property_id,
      check_in_date,
      check_out_date,
      check_in_time,
      check_out_time,
      number_of_guests,
      number_of_children = 0,
      number_of_infants = 0,
      special_requests,
      coupon_code
    } = req.body;

    // Validate dates
    if (isPastDate(check_in_date)) {
      return res.status(400).json(
        formatResponse(false, 'Check-in date cannot be in the past')
      );
    }

    if (!isValidDateRange(check_in_date, check_out_date)) {
      return res.status(400).json(
        formatResponse(false, 'Check-out date must be after check-in date')
      );
    }

    // Get property details
    const [properties] = await pool.execute(`
      SELECT 
        p.*, 
        po.id as owner_id,         -- property_owners.id (FK target)
        po.user_id as owner_user_id -- users.id of the owner (for self-booking check)
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      WHERE p.id = ? AND p.status = 'active'
    `, [property_id]);

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found or not available')
      );
    }

    const property = properties[0];

    // Check if property owner is trying to book their own property
    if (property.owner_user_id === req.user.id) {
      return res.status(400).json(
        formatResponse(false, 'You cannot book your own property')
      );
    }

    // Check guest limit
    if (number_of_guests > property.max_guests) {
      return res.status(400).json(
        formatResponse(false, `Maximum ${property.max_guests} guests allowed`)
      );
    }

    // Check minimum stay
    const nights = Math.ceil((new Date(check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24));
    if (nights < property.minimum_stay) {
      return res.status(400).json(
        formatResponse(false, `Minimum ${property.minimum_stay} nights required`)
      );
    }

    // Check availability
    // Include bookings that are confirmed/checked_in OR pending with owner acceptance and payment deadline not expired
    const [conflicts] = await pool.execute(`
      SELECT id FROM bookings
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
    `, [property_id, check_out_date, check_in_date, check_out_date, check_in_date, check_in_date, check_out_date]);

    if (conflicts.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Property is not available for the selected dates')
      );
    }

    // Calculate pricing
    const basePrice = parseFloat(property.base_price) || 0;
    const cleaningFee = parseFloat(property.cleaning_fee) || 0;
    const securityDeposit = parseFloat(property.security_deposit) || 0;
    const extraGuestFee = number_of_guests > 1 ? (number_of_guests - 1) * (parseFloat(property.extra_guest_fee) || 0) : 0;
    const serviceFee = (basePrice * nights) * 0.1; // 10% service fee
    const taxAmount = (basePrice * nights) * 0.15; // 15% tax

    const pricing = calculateBookingTotal(
      basePrice, nights, cleaningFee, securityDeposit,
      extraGuestFee, serviceFee, taxAmount
    );

    // Apply coupon if provided
    let discountAmount = 0;
    if (coupon_code) {
      const [coupons] = await pool.execute(`
        SELECT * FROM coupons 
        WHERE code = ? AND is_active = 1 
        AND valid_from <= CURDATE() AND valid_until >= CURDATE()
        AND (usage_limit IS NULL OR used_count < usage_limit)
      `, [coupon_code]);

      if (coupons.length > 0) {
        const coupon = coupons[0];
        if (pricing.total >= coupon.minimum_amount) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (pricing.total * coupon.discount_value) / 100;
            if (coupon.maximum_discount) {
              discountAmount = Math.min(discountAmount, coupon.maximum_discount);
            }
          } else {
            discountAmount = coupon.discount_value;
          }
        }
      }
    }

    const finalTotal = Math.max(0, pricing.total - discountAmount);

    // Generate booking reference
    const bookingReference = generateBookingReference();

    // Get commission rate from system settings
    const [commissionSettings] = await pool.execute(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'admin_commission_rate'
    `);

    const commissionRate = commissionSettings.length > 0 ?
      parseFloat(commissionSettings[0].setting_value) : 10.00;

    const commissionAmount = (finalTotal * commissionRate) / 100;
    const propertyOwnerEarnings = finalTotal - commissionAmount;

    // Create booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id,
        check_in_date, check_out_date, check_in_time, check_out_time,
        number_of_guests, number_of_children, number_of_infants,
        base_price, cleaning_fee, security_deposit, extra_guest_fee,
        service_fee, tax_amount, admin_commission_rate, admin_commission_amount, property_owner_earnings,
        total_amount, currency, status, payment_status,
        special_requests, coupon_code, discount_amount,
        booking_source, guest_name, guest_email, guest_phone,
        booking_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      bookingReference, req.user.id, property_id,
      check_in_date, check_out_date, check_in_time || '15:00', check_out_time || '11:00',
      number_of_guests, number_of_children, number_of_infants,
      basePrice * nights, cleaningFee, securityDeposit, extraGuestFee,
      serviceFee, taxAmount, commissionRate, commissionAmount, propertyOwnerEarnings,
      finalTotal, property.currency || 'BDT', 'pending', 'pending',
      special_requests || null, coupon_code || null, discountAmount,
      'website', `${req.user.first_name} ${req.user.last_name}`, req.user.email, req.user.phone || null
    ]);

    const bookingId = result.insertId;

    // Create admin earnings record
    await pool.execute(`
      INSERT INTO admin_earnings (
        booking_id, property_id, property_owner_id,
        booking_total, commission_rate, commission_amount,
        net_commission, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      bookingId, property_id, property.owner_id,
      finalTotal, commissionRate, commissionAmount,
      commissionAmount, // net_commission (can be adjusted for tax later)
    ]);

    // Update coupon usage if applied
    if (coupon_code && discountAmount > 0) {
      await pool.execute(
        'UPDATE coupons SET used_count = used_count + 1 WHERE code = ?',
        [coupon_code]
      );

      await pool.execute(
        'INSERT INTO coupon_usage (coupon_id, user_id, booking_id, discount_amount) VALUES (?, ?, ?, ?)',
        [coupons[0].id, req.user.id, bookingId, discountAmount]
      );
    }

    // Get created booking with details
    const [bookings] = await pool.execute(`
      SELECT 
        b.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      WHERE b.id = ?
    `, [bookingId]);

    // Notify property owner via SMS about the new booking request
    console.log(`📱 Attempting to send SMS to owner for booking ${bookingReference}`);
    console.log(`Owner user ID: ${property.owner_user_id}`);

    try {
      const [ownerUsers] = await pool.execute(
        `SELECT first_name, last_name, phone 
         FROM users 
         WHERE id = ? 
         LIMIT 1`,
        [property.owner_user_id]
      );

      console.log(`Owner users found: ${ownerUsers.length}`);

      if (ownerUsers.length === 0) {
        console.warn(`❌ Owner user ${property.owner_user_id} not found in users table. SMS not sent for booking ${bookingReference}.`);
      } else {
        const ownerUser = ownerUsers[0];
        console.log(`Owner user found:`, {
          first_name: ownerUser.first_name,
          last_name: ownerUser.last_name,
          phone: ownerUser.phone ? '***' + ownerUser.phone.slice(-4) : 'NOT SET'
        });

        if (ownerUser?.phone) {
          const guestFirstName = req.user?.first_name || bookings[0]?.guest_name?.split(' ')[0] || 'Guest';
          const guestLastName = req.user?.last_name || '';
          const guestFullName = `${guestFirstName}${guestLastName ? ' ' + guestLastName : ''}`.trim();

          const message = `New booking request ${bookingReference} for ${property.title}. Guest: ${guestFullName}. Check-in ${formatDate(check_in_date)}. Please review and confirm.`;

          console.log(`📤 Sending SMS to owner phone: ${ownerUser.phone.slice(0, 3)}***${ownerUser.phone.slice(-4)}`);
          console.log(`Message: ${message}`);

          const smsResult = await sendSMS({
            to: ownerUser.phone,
            message
          });

          if (smsResult.success) {
            console.log(`✅ SMS sent successfully to owner for booking ${bookingReference}`);
          } else {
            if (smsResult.skipped) {
              console.warn(`⚠️ SMS skipped for booking ${bookingReference}: ${smsResult.reason || 'Unknown reason'}`);
            } else {
              console.error(`❌ SMS send failed for booking ${bookingReference}: ${smsResult.error || 'Unknown error'}`);
            }
          }
        } else {
          console.warn(`❌ Owner user ${property.owner_user_id} has no phone number. SMS not sent for booking ${bookingReference}.`);
        }
      }
    } catch (smsError) {
      console.error(`❌ Exception while sending owner SMS notification for booking ${bookingReference}:`, smsError.message || smsError);
      console.error('SMS Error Stack:', smsError.stack);
    }

    res.status(201).json(
      formatResponse(true, 'Booking created successfully', {
        booking: bookings[0],
        pricing: {
          ...pricing,
          discountAmount,
          finalTotal
        }
      })
    );

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create booking', null, error.message)
    );
  }
});

// Get single booking
router.get('/bookings/:id', verifyToken, requireGuest, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const [bookings] = await pool.execute(`
      SELECT 
        b.*,
        p.title as property_title,
        p.description as property_description,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        p.country as property_country,
        p.check_in_time as property_check_in_time,
        p.check_out_time as property_check_out_time,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    // Get property images
    const [images] = await pool.execute(`
      SELECT image_url, image_type, alt_text
      FROM property_images
      WHERE property_id = ? AND is_active = 1
      ORDER BY image_type, sort_order
    `, [booking.property_id]);
    booking.property_images = images;

    // Get additional guests if any
    const [guests] = await pool.execute(`
      SELECT first_name, last_name, email, phone, date_of_birth, gender, is_primary_guest
      FROM booking_guests
      WHERE booking_id = ?
      ORDER BY is_primary_guest DESC, created_at
    `, [id]);
    booking.additional_guests = guests;

    // Get payment details with DR/CR
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
    booking.payments = paymentsWithBalance;

    res.json(
      formatResponse(true, 'Booking retrieved successfully', { booking })
    );

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve booking', null, error.message)
    );
  }
});

// Cancel booking
router.patch('/bookings/:id/cancel', verifyToken, requireGuest, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get booking details
    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json(
        formatResponse(false, 'Booking is already cancelled')
      );
    }

    if (booking.status === 'checked_out') {
      return res.status(400).json(
        formatResponse(false, 'Cannot cancel completed booking')
      );
    }

    // Check if check-in date has passed
    const today = new Date();
    const checkInDate = new Date(booking.check_in_date);

    if (checkInDate <= today) {
      return res.status(400).json(
        formatResponse(false, 'Cannot cancel booking after check-in date')
      );
    }

    // Update booking status
    await pool.execute(
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
      [reason, id]
    );

    // Refund rewards points if any were redeemed for this booking
    try {
      const { refundPointsForBooking } = require('../../utils/rewardsPoints');
      const refundResult = await refundPointsForBooking(req.user.id, id);
      if (refundResult.pointsRefunded > 0) {
        console.log(`✅ Refunded ${refundResult.pointsRefunded} points to guest ${req.user.id} for cancelled booking ${id}`);
      }
    } catch (pointsError) {
      console.error('❌ Points refund error:', pointsError);
      // Continue even if points refund fails
    }

    // TODO: Process refund based on cancellation policy
    // This would involve calculating refund amount and creating refund record

    // Get updated booking details
    const [updatedBookings] = await pool.execute(`
      SELECT 
        b.*,
        p.title as property_title,
        p.description as property_description,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        p.country as property_country
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    res.json(
      formatResponse(true, 'Booking cancelled successfully', {
        booking: updatedBookings[0]
      })
    );

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to cancel booking', null, error.message)
    );
  }
});

// Get guest's favorites
router.get('/favorites', verifyToken, requireGuest, async (req, res) => {
  try {
    const [favorites] = await pool.execute(`
      SELECT 
        f.id, f.created_at,
        p.id as property_id, p.title, p.description, p.base_price,
        p.city, p.property_type, p.max_guests, p.average_rating,
        pi.image_url as main_image
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
      WHERE f.user_id = ? AND p.status = 'active'
      ORDER BY f.created_at DESC
    `, [req.user.id]);

    res.json(
      formatResponse(true, 'Favorites retrieved successfully', { favorites })
    );

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve favorites', null, error.message)
    );
  }
});

// Add property to favorites
router.post('/favorites/:propertyId', verifyToken, requireGuest, validatePropertyId, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const [properties] = await pool.execute(
      'SELECT id FROM properties WHERE id = ? AND status = "active"',
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Check if already in favorites
    const [existing] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, propertyId]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Property already in favorites')
      );
    }

    // Add to favorites
    await pool.execute(
      'INSERT INTO favorites (user_id, property_id, created_at) VALUES (?, ?, NOW())',
      [req.user.id, propertyId]
    );

    res.status(201).json(
      formatResponse(true, 'Property added to favorites')
    );

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to add to favorites', null, error.message)
    );
  }
});

// Remove property from favorites
router.delete('/favorites/:propertyId', verifyToken, requireGuest, validatePropertyId, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, propertyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found in favorites')
      );
    }

    res.json(
      formatResponse(true, 'Property removed from favorites')
    );

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to remove from favorites', null, error.message)
    );
  }
});

// Get available properties for booking
router.get('/properties', optionalAuth, validatePagination, async (req, res) => {
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
      recommended = false,
      is_featured = false
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.status = "active"'];
    let queryParams = [];

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

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM properties p 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get properties with owner info
    const [properties] = await pool.execute(`
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
    `, [...queryParams, parseInt(limit), offset]);

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

    // Get images for each property
    for (let property of properties) {
      // Get all images (limit to 10 for performance)
      const [allImages] = await pool.execute(`
        SELECT image_url, alt_text, image_type, sort_order
        FROM property_images
        WHERE property_id = ? AND is_active = 1
        ORDER BY 
          CASE WHEN image_type = 'main' THEN 0 ELSE 1 END,
          sort_order
        LIMIT 10
      `, [property.id]);

      property.images = allImages;

      // Set main_image for backward compatibility
      const mainImage = allImages.find(img => img.image_type === 'main') || allImages[0];
      property.main_image = mainImage || null;
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

// Get active display categories with properties
router.get('/display-categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT dc.*, COUNT(DISTINCT dcp.property_id) as property_count
      FROM display_categories dc
      LEFT JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
      LEFT JOIN properties p ON dcp.property_id = p.id AND p.status = 'active'
      WHERE dc.is_active = 1
      GROUP BY dc.id
      HAVING property_count > 0
      ORDER BY dc.sort_order ASC, dc.name ASC
    `);

    res.json(
      formatResponse(true, 'Display categories retrieved successfully', { categories })
    );

  } catch (error) {
    console.error('Get display categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve display categories', null, error.message)
    );
  }
});

// Get properties by display category
router.get('/display-categories/:id/properties', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Check if category exists and is active
    const [category] = await pool.execute(
      'SELECT * FROM display_categories WHERE id = ? AND is_active = 1',
      [id]
    );

    if (category.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found or inactive')
      );
    }

    // Get properties for this category using junction table
    const [properties] = await pool.execute(`
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND image_type = 'main' LIMIT 1) as main_image_url,
        (SELECT AVG(rating) FROM reviews WHERE property_id = p.id AND status = 'approved') as average_rating
      FROM properties p
      INNER JOIN display_category_properties dcp ON p.id = dcp.property_id
      WHERE dcp.display_category_id = ? 
        AND p.status = 'active'
      ORDER BY dcp.created_at DESC
      LIMIT ?
    `, [id, limit]);

    // Get amenities and images for each property
    for (let property of properties) {
      const [amenities] = await pool.execute(`
        SELECT a.id, a.name, a.icon, a.category
        FROM amenities a
        JOIN property_amenities pa ON a.id = pa.amenity_id
        WHERE pa.property_id = ? AND a.is_active = 1
        ORDER BY a.category, a.name
      `, [property.id]);
      property.amenities = amenities;

      // Get all images for the property
      const [allImages] = await pool.execute(`
        SELECT image_url, alt_text, image_type, sort_order
        FROM property_images
        WHERE property_id = ? AND is_active = 1
        ORDER BY 
          CASE WHEN image_type = 'main' THEN 0 ELSE 1 END,
          sort_order
        LIMIT 10
      `, [property.id]);

      property.images = allImages;

      // Set main_image for backward compatibility
      const mainImage = allImages.find(img => img.image_type === 'main') || allImages[0];
      property.main_image = mainImage || null;
    }

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        category: category[0],
        properties
      })
    );

  } catch (error) {
    console.error('Get category properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Get all amenities
router.get('/properties/amenities/list', async (req, res) => {
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

// Get recommended properties for guest
router.get('/properties/recommended', optionalAuth, async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const userId = req.user?.id;

    // Get properties with high ratings and recent bookings
    const limitNum = parseInt(limit) || 6;
    const [properties] = await pool.execute(`
      SELECT 
        p.*,
        pi.image_url as main_image
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [limitNum]);

    // Format properties
    const formattedProperties = properties.map(property => ({
      ...property,
      main_image: property.main_image ? { image_url: property.main_image } : null
    }));

    res.json(
      formatResponse(true, 'Recommended properties retrieved successfully', {
        properties: formattedProperties
      })
    );

  } catch (error) {
    console.error('Get recommended properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve recommended properties', null, error.message)
    );
  }
});

// Get single property details
router.get('/properties/:id', optionalAuth, validateId, async (req, res) => {
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

// Check property availability
router.get('/properties/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in_date, check_out_date } = req.query;

    if (!check_in_date || !check_out_date) {
      return res.status(400).json(
        formatResponse(false, 'Check-in and check-out dates are required')
      );
    }

    // Check for conflicting bookings
    // Include bookings that are confirmed/checked_in OR pending with owner acceptance and payment deadline not expired
    const [conflicts] = await pool.execute(`
      SELECT COUNT(*) as conflict_count
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

    const isAvailable = conflicts[0].conflict_count === 0;

    res.json(
      formatResponse(true, 'Availability checked successfully', {
        isAvailable,
        check_in_date,
        check_out_date
      })
    );

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to check availability', null, error.message)
    );
  }
});

// Update booking payment information (without changing booking status)
router.patch('/bookings/:id/payment', verifyToken, requireGuest, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_status, points_to_redeem } = req.body;

    console.log('=== UPDATE BOOKING PAYMENT ===');
    console.log('Booking ID:', id);
    console.log('Payment Method:', payment_method);
    console.log('Payment Status:', payment_status);
    console.log('===============================');

    // Get booking details
    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found')
      );
    }

    const booking = bookings[0];

    // Check if booking is pending and owner has accepted (confirmed_at is set)
    if (booking.status !== 'pending') {
      return res.status(400).json(
        formatResponse(false, 'Booking must be in pending status')
      );
    }

    // Check if owner has accepted the booking request
    if (!booking.confirmed_at) {
      return res.status(400).json(
        formatResponse(false, 'Property owner has not accepted this booking request yet')
      );
    }

    // If payment status is 'paid', create CR entry, payment record, and confirm booking
    if (payment_status === 'paid') {
      // Check if CR payment already exists
      const [existingCrPayments] = await pool.execute(`
        SELECT id FROM payments 
        WHERE booking_id = ? AND transaction_type = 'guest_payment' AND cr_amount > 0
      `, [id]);

      // Check if DR entry exists (owner accepted)
      const [drPayments] = await pool.execute(`
        SELECT id FROM payments 
        WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
      `, [id]);

      if (drPayments.length === 0) {
        return res.status(400).json(
          formatResponse(false, 'Owner has not accepted this booking request yet')
        );
      }

      // Check if CR entry already exists (result fetched above in existingCrPayments)

      if (existingCrPayments.length === 0) {
        // Handle rewards points redemption if applicable
        let finalAmount = booking.total_amount;
        let pointsRedeemed = 0;
        let pointsDiscount = 0;

        if (points_to_redeem && points_to_redeem > 0) {
          try {
            const { redeemPointsForBooking } = require('../utils/rewardsPoints');
            const redemptionResult = await redeemPointsForBooking(req.user.id, points_to_redeem, id);
            pointsRedeemed = redemptionResult.pointsRedeemed;
            pointsDiscount = redemptionResult.discountAmount;
            finalAmount = Math.max(0, booking.total_amount - pointsDiscount);
          } catch (pointsError) {
            console.error('Points redemption error:', pointsError);
            // Continue with payment even if points redemption fails
          }
        }

        // Create CR entry for admin (money received from guest)
        const crReference = `CR-${Date.now()}-${id}`;
        await pool.execute(`
          INSERT INTO payments (
            booking_id, payment_reference, payment_method, payment_type,
            amount, dr_amount, cr_amount, transaction_type, notes,
            status, payment_date, created_at
          ) VALUES (?, ?, ?, 'booking', ?, 0, ?, 'guest_payment', ?, 'completed', NOW(), NOW())
        `, [
          id,
          crReference,
          payment_method || 'online',
          finalAmount,
          finalAmount,
          `Guest payment received - Total: ৳${booking.total_amount}${pointsDiscount > 0 ? `, Points discount: ৳${pointsDiscount.toFixed(2)}` : ''}`
        ]);

        // Update booking with points redeemed info
        if (pointsRedeemed > 0) {
          await pool.execute(`
            UPDATE bookings 
            SET points_redeemed = ?, points_discount = ?, updated_at = NOW()
            WHERE id = ?
          `, [pointsRedeemed, pointsDiscount, id]);
        }

        // Update DR entry status to completed (balance the transaction)
        await pool.execute(`
          UPDATE payments
          SET status = 'completed',
              updated_at = NOW()
          WHERE booking_id = ? 
          AND transaction_type = 'owner_accepted'
          AND dr_amount > 0
        `, [id]);

        // Mark admin commission as paid
        await pool.execute(`
          UPDATE admin_earnings 
          SET payment_status = 'paid', 
              payment_date = NOW(),
              updated_at = NOW()
          WHERE booking_id = ? 
          AND payment_status = 'pending'
        `, [id]);

        // Update booking status to 'confirmed' after payment
        await pool.execute(`
          UPDATE bookings
          SET status = 'confirmed',
              payment_status = ?,
              updated_at = NOW()
          WHERE id = ?
        `, [payment_status, id]);

        console.log(`Booking ${id} confirmed after payment by guest`);
      }

      // Award points for completed booking (only if payment is paid)
      // Check if points were already awarded for this booking
      console.log(`=== CHECKING POINTS AWARD ===`);
      console.log(`Payment Status: ${payment_status}`);
      console.log(`Booking ID: ${id}`);
      console.log(`User ID: ${req.user.id}`);
      console.log(`Booking Total Amount: ${booking.total_amount}`);

      if (payment_status === 'paid') {
        try {
          const [existingPointsTransaction] = await pool.execute(`
            SELECT id FROM rewards_point_transactions 
            WHERE booking_id = ? AND transaction_type = 'earned'
          `, [id]);

          console.log(`Existing points transactions for booking ${id}: ${existingPointsTransaction.length}`);

          // Only award points if not already awarded
          if (existingPointsTransaction.length === 0) {
            console.log(`Awarding points for booking ${id}...`);
            const { awardPointsForBooking } = require('../utils/rewardsPoints');
            const result = await awardPointsForBooking(req.user.id, booking.total_amount, id);
            console.log(`✅ Points awarded successfully: ${result.pointsAwarded} points, New balance: ${result.newBalance}`);
          } else {
            console.log(`⚠️ Points already awarded for booking ${id}`);
          }
        } catch (pointsError) {
          console.error('❌ Points awarding error:', pointsError);
          console.error('Error stack:', pointsError.stack);
          // Continue even if points awarding fails
        }
      } else {
        console.log(`⚠️ Payment status is not 'paid', skipping points award. Status: ${payment_status}`);
      }
    } else {
      // Update only payment status (for pending payments like cash on arrival)
      await pool.execute(`
        UPDATE bookings
        SET payment_status = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [payment_status, id]);
    }

    console.log('Payment information updated. Booking will be confirmed after payment.');

    // Get updated booking to verify the payment status was set correctly
    const [updatedBookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    const updatedBooking = updatedBookings[0];

    console.log('=== FINAL STATUS CHECK ===');
    console.log('Updated Booking Status:', updatedBooking.status);
    console.log('Updated Payment Status:', updatedBooking.payment_status);
    console.log('Response will send status:', updatedBooking.status);
    console.log('Response will send payment_status:', updatedBooking.payment_status);
    console.log('========================');

    res.json(
      formatResponse(true, 'Payment information updated successfully', {
        booking: {
          ...updatedBooking,
          status: updatedBooking.status,
          payment_method,
          payment_status: updatedBooking.payment_status
        }
      })
    );

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update payment information', null, error.message)
    );
  }
});

// Confirm booking payment (DEPRECATED - kept for backward compatibility)
router.patch('/bookings/:id/confirm', verifyToken, requireGuest, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_status } = req.body;

    console.log('=== BACKEND CONFIRM BOOKING ===');
    console.log('Booking ID:', id);
    console.log('Payment Method:', payment_method);
    console.log('Payment Status:', payment_status);
    console.log('===============================');

    // Get booking details
    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found')
      );
    }

    const booking = bookings[0];

    if (booking.status !== 'pending') {
      return res.status(400).json(
        formatResponse(false, 'Booking cannot be confirmed')
      );
    }

    // All bookings should remain 'pending' until property owner confirms
    const bookingStatus = 'pending';

    console.log('=== BOOKING STATUS DEBUG ===');
    console.log('Payment Status:', payment_status);
    console.log('Payment Status Type:', typeof payment_status);
    console.log('All bookings will be pending until property owner confirms');
    console.log('Calculated Booking Status:', bookingStatus);
    console.log('============================');

    // Update booking status
    console.log('=== SQL UPDATE DEBUG ===');
    console.log('Setting status to:', bookingStatus);
    console.log('Setting payment_status to:', payment_status);
    console.log('Setting confirmed_at to:', bookingStatus === 'confirmed' ? new Date() : null);
    console.log('========================');

    await pool.execute(`
      UPDATE bookings
      SET status = ?,
          payment_status = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [bookingStatus, payment_status, id]);

    console.log('SQL UPDATE EXECUTED');

    // Check if owner_accepted DR entry already exists (owner should have accepted first)
    const [existingDrPayments] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
    `, [id]);

    // CRITICAL: Do NOT create DR entry here - owner should have already created it
    // If owner_accepted DR exists, we should NOT create another DR entry
    // This endpoint should only create CR entry when payment is made
    const paymentReference = `PAY-${Date.now()}-${id}`;

    // REMOVED: DR entry creation - owner_accepted should have already created it
    // If owner hasn't accepted, this endpoint should not be called
    if (existingDrPayments.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Owner must accept booking request first before payment can be made')
      );
    }

    // If payment is made immediately (not cash), insert CR entry
    if (payment_status === 'paid' || payment_status === 'completed') {
      // Check if CR entry already exists
      const [existingCrPayments] = await pool.execute(`
        SELECT id FROM payments 
        WHERE booking_id = ? AND transaction_type = 'guest_payment' AND cr_amount > 0
      `, [id]);

      if (existingCrPayments.length === 0) {
        // CRITICAL: Only create CR entry - NEVER create DR entry during payment
        // DR entry should already exist from owner_accepted
        const crReference = `CR-${Date.now()}-${id}`;
        await pool.execute(`
          INSERT INTO payments (
            booking_id, amount, dr_amount, cr_amount, payment_method, payment_reference,
            status, transaction_type, notes, payment_date, created_at
          ) VALUES (?, ?, 0, ?, ?, ?, 'completed', 'guest_payment', 'Payment received', NOW(), NOW())
        `, [id, booking.total_amount, booking.total_amount, payment_method, crReference]);

        // Verify: Double-check that we didn't accidentally create a DR entry
        const [verifyPayment] = await pool.execute(`
          SELECT id, dr_amount, cr_amount, transaction_type 
          FROM payments 
          WHERE booking_id = ? AND transaction_type = 'guest_payment' AND payment_reference = ?
        `, [id, crReference]);

        if (verifyPayment.length > 0 && parseFloat(verifyPayment[0].dr_amount || 0) > 0) {
          console.error('ERROR: DR entry created during payment! Fixing...');
          await pool.execute(`
            UPDATE payments 
            SET dr_amount = 0, updated_at = NOW()
            WHERE id = ?
          `, [verifyPayment[0].id]);
        }

        // Update owner_accepted DR entry status to completed if it exists
        if (existingDrPayments.length > 0) {
          await pool.execute(`
            UPDATE payments
            SET status = 'completed',
                updated_at = NOW()
            WHERE booking_id = ? 
            AND transaction_type = 'owner_accepted'
            AND dr_amount > 0
          `, [id]);
        }

        console.log(`Payment received for booking ${id}. Setting payments.status = 'completed'`);
      }
    }

    // Get updated booking to verify the status was set correctly
    const [updatedBookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    const updatedBooking = updatedBookings[0];

    console.log('=== FINAL STATUS CHECK ===');
    console.log('Updated Booking Status:', updatedBooking.status);
    console.log('Updated Payment Status:', updatedBooking.payment_status);
    console.log('Response will send status:', updatedBooking.status);
    console.log('Response will send payment_status:', updatedBooking.payment_status);
    console.log('========================');

    res.json(
      formatResponse(true, 'Booking confirmed successfully', {
        booking: {
          ...updatedBooking,
          status: updatedBooking.status,
          payment_method,
          payment_status: updatedBooking.payment_status
        }
      })
    );

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to confirm booking', null, error.message)
    );
  }
});

module.exports = router;
