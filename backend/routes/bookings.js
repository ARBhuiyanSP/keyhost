const express = require('express');
const { pool } = require('../config/database');
const {
  formatResponse,
  generatePagination,
  generateBookingReference,
  calculateBookingTotal,
  calculateRefundAmount,
  isPastDate,
  isValidDateRange,
  formatDate
} = require('../utils/helpers');
const {
  validateBooking,
  validateId,
  validatePagination
} = require('../middleware/validation');
const { verifyToken, requireGuest } = require('../middleware/auth');

const router = express.Router();

// Create new booking
router.post('/', verifyToken, requireGuest, validateBooking, async (req, res) => {
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
      coupon_code,
      hms_room_id,
      custom_price,
      booking_type = 'short_stay'  // 'short_stay' | 'monthly'
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
      SELECT p.*, po.user_id as owner_id
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

    // If HMS is enabled, handle room logic
    let hmsRoom = null;
    if (property.is_hms_enabled && hms_room_id) {
      const [rooms] = await pool.execute(`
        SELECT * FROM hms_rooms 
        WHERE id = ? AND property_id = ?
      `, [hms_room_id, property_id]);
      
      if (rooms.length === 0) {
        return res.status(404).json(
          formatResponse(false, 'Selected room not found in this property')
        );
      }
      hmsRoom = rooms[0];
    } else if (property.is_hms_enabled && !hms_room_id) {
       // If it's an HMS property, we generally expect a room selection
       // unless the entire property can be booked (we'll check business logic)
       // For now, let's allow it but log a warning or default to base price
    }

    // Check if property owner is trying to book their own property
    if (property.owner_id === req.user.id) {
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
    const isMonthly = booking_type === 'monthly';

    if (isMonthly) {
      // Monthly booking validation
      if (!property.monthly_rent_enabled || !property.monthly_approved) {
        return res.status(400).json(
          formatResponse(false, 'This property does not accept monthly bookings')
        );
      }
      if (!property.monthly_rent_amount) {
        return res.status(400).json(
          formatResponse(false, 'Monthly rent amount not set for this property')
        );
      }
      const minNights = property.monthly_min_stay_nights || 30;
      if (nights < minNights) {
        return res.status(400).json(
          formatResponse(false, `Minimum ${minNights} nights required for monthly booking`)
        );
      }
    } else {
      if (nights < property.minimum_stay) {
        return res.status(400).json(
          formatResponse(false, `Minimum ${property.minimum_stay} nights required`)
        );
      }
    }

    // Check availability
    // Include bookings that are request_accepted, confirmed, or checked_in
    let availabilityQuery = `
      SELECT id FROM bookings
      WHERE property_id = ? 
      AND status IN ('request_accepted', 'confirmed', 'checked_in')
      AND DATE(check_in_date) < DATE(?) AND DATE(check_out_date) > DATE(?)
    `;
    let availabilityParams = [property_id, check_out_date, check_in_date];

    // If it's a specific room booking, only check conflicts for THAT room
    if (hms_room_id) {
       availabilityQuery += ` AND hms_room_id = ? `;
       availabilityParams.push(hms_room_id);
    }

    const [conflicts] = await pool.execute(availabilityQuery, availabilityParams);

    if (conflicts.length > 0) {
      return res.status(409).json(
        formatResponse(false, hms_room_id ? 'This room is not available for the selected dates' : 'Property is not available for the selected dates')
      );
    }

    // Calculate pricing
    let pricing, finalTotal, totalDiscount = 0, discountAmount = 0, hostDiscount = 0;
    let monthsCount = null, extraDays = null, monthlyRateUsed = null, advanceAmount = null;

    if (isMonthly) {
      // ── Monthly pro-rated pricing ─────────────────────────────────────────
      const monthlyRate = parseFloat(property.monthly_rent_amount);
      monthsCount   = Math.floor(nights / 30);
      extraDays     = nights % 30;
      monthlyRateUsed = monthlyRate;

      const monthlySubtotal = monthsCount * monthlyRate;
      const proratedAmount  = extraDays * (monthlyRate / 30);
      const monthlySecDep   = parseFloat(property.monthly_security_deposit) || 0;
      advanceAmount         = parseFloat(property.monthly_advance_amount) || 0;

      finalTotal = monthlySubtotal + proratedAmount + monthlySecDep;
      totalDiscount = 0;

      // Build a pricing-compatible object for response
      pricing = {
        basePrice: monthlyRate,
        nights,
        monthsCount,
        extraDays,
        monthlySubtotal,
        proratedAmount,
        monthlySecurityDeposit: monthlySecDep,
        total: finalTotal
      };
    } else {
      // ── Standard nightly pricing ──────────────────────────────────────────
      const basePrice = hmsRoom ? parseFloat(hmsRoom.price) : (parseFloat(property.base_price) || 0);
      const cleaningFee = parseFloat(property.cleaning_fee) || 0;
      const securityDeposit = parseFloat(property.security_deposit) || 0;
      const extraGuestFee = number_of_guests > 1 ? (number_of_guests - 1) * (parseFloat(property.extra_guest_fee) || 0) : 0;

      // Fetch live service fee and tax percentages from settings
      const [settingsRows] = await pool.execute(
        `SELECT setting_key, setting_value FROM system_settings
         WHERE setting_key IN ('service_fee_percentage', 'tax_percentage')`
      );
      let serviceFeePercent = 0;
      let taxPercent = 0;
      settingsRows.forEach(row => {
        if (row.setting_key === 'service_fee_percentage') serviceFeePercent = parseFloat(row.setting_value) || 0;
        if (row.setting_key === 'tax_percentage') taxPercent = parseFloat(row.setting_value) || 0;
      });

      const serviceFee = (basePrice * nights) * (serviceFeePercent / 100);
      const taxAmount = (basePrice * nights) * (taxPercent / 100);

      pricing = calculateBookingTotal(
        basePrice, nights, cleaningFee, securityDeposit,
        extraGuestFee, serviceFee, taxAmount
      );

      // Custom price discount
      const parsedCustomPrice = parseFloat(custom_price);
      if (!isNaN(parsedCustomPrice) && parsedCustomPrice > 0 && parsedCustomPrice <= pricing.total) {
        hostDiscount = pricing.total - parsedCustomPrice;
      }

      // Apply coupon if provided
      if (coupon_code) {
        const [coupons] = await pool.execute(
          `SELECT * FROM coupons
           WHERE code = ? AND is_active = 1
           AND valid_from <= CURDATE() AND valid_until >= CURDATE()
           AND (usage_limit IS NULL OR used_count < usage_limit)`,
          [coupon_code]
        );
        if (coupons.length > 0) {
          const coupon = coupons[0];
          const totalForCoupon = pricing.total - hostDiscount;
          if (totalForCoupon >= coupon.minimum_amount) {
            if (coupon.discount_type === 'percentage') {
              discountAmount = (totalForCoupon * coupon.discount_value) / 100;
              if (coupon.maximum_discount) discountAmount = Math.min(discountAmount, coupon.maximum_discount);
            } else {
              discountAmount = coupon.discount_value;
            }
          }
        }
      }

      finalTotal = Math.max(0, pricing.total - hostDiscount - discountAmount);
      totalDiscount = discountAmount + hostDiscount;
    }

    // Generate booking reference
    const bookingReference = generateBookingReference();

    // Create booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id, hms_room_id,
        check_in_date, check_out_date, check_in_time, check_out_time,
        number_of_guests, number_of_children, number_of_infants,
        base_price, cleaning_fee, security_deposit, extra_guest_fee,
        service_fee, tax_amount, total_amount, currency,
        special_requests, coupon_code, discount_amount,
        guest_name, guest_email, guest_phone,
        booking_type, months_count, extra_days, monthly_rate_used, advance_amount,
        booking_source, status, is_non_refundable, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'website', 'pending', ?, NOW())
    `, [
      bookingReference, req.user.id, property_id, hms_room_id || null,
      check_in_date, check_out_date, check_in_time, check_out_time,
      number_of_guests, number_of_children, number_of_infants,
      isMonthly ? (property.monthly_rent_amount || 0) : (hmsRoom ? hmsRoom.price : property.base_price),
      isMonthly ? 0 : (parseFloat(property.cleaning_fee) || 0),
      isMonthly ? (property.monthly_security_deposit || 0) : (parseFloat(property.security_deposit) || 0),
      isMonthly ? 0 : (number_of_guests > 1 ? (number_of_guests - 1) * (parseFloat(property.extra_guest_fee) || 0) : 0),
      isMonthly ? 0 : (pricing.serviceFee || 0),
      isMonthly ? 0 : (pricing.taxAmount || 0),
      finalTotal, property.currency,
      special_requests, isMonthly ? null : coupon_code, totalDiscount,
      `${req.user.first_name} ${req.user.last_name}`, req.user.email, req.user.phone,
      booking_type,
      monthsCount, extraDays, monthlyRateUsed, advanceAmount,
      property.is_non_refundable || false
    ]);

    const bookingId = result.insertId;

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
        hr.room_number as hms_room_number,
        hr.room_type as hms_room_type,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      LEFT JOIN hms_rooms hr ON b.hms_room_id = hr.id
      WHERE b.id = ?
    `, [bookingId]);

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

// Get bookings for property owners
router.get('/', verifyToken, validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      owner = false
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];

    // Handle property owner bookings
    if (owner === 'true' && req.user) {
      whereClause = 'WHERE p.owner_id = ?';
      queryParams.push(req.user.id);
    } else {
      // Admin can see all bookings
      if (req.user.user_type === 'admin') {
        whereClause = 'WHERE 1=1';
      } else {
        return res.status(403).json(formatResponse(false, 'Access denied'));
      }
    }

    if (status) {
      whereClause += ' AND b.status = ?';
      queryParams.push(status);
    }

    if (search) {
      whereClause += ' AND (b.booking_reference LIKE ? OR p.title LIKE ? OR CONCAT(b.guest_first_name, " ", b.guest_last_name) LIKE ?)';
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
        b.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        p.main_image_id,
        mi.image_url as property_image,
        CONCAT(b.guest_first_name, ' ', b.guest_last_name) as guest_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN property_images mi ON p.main_image_id = mi.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const totalPages = Math.ceil(total / limit);

    res.json(formatResponse(true, 'Bookings retrieved successfully', {
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }));
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve bookings'));
  }
});

// Get user's bookings
router.get('/my-bookings', verifyToken, validatePagination, async (req, res) => {
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
    const [bookings] = await pool.query(`
      SELECT 
        b.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        p.base_price,
        pi.image_url as property_image,
        hr.room_number as hms_room_number,
        hr.room_type as hms_room_type
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
      LEFT JOIN hms_rooms hr ON b.hms_room_id = hr.id
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

// Get single booking
router.get('/:id', verifyToken, validateId, async (req, res) => {
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
        hr.room_number as hms_room_number,
        hr.room_type as hms_room_type,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      LEFT JOIN hms_rooms hr ON b.hms_room_id = hr.id
      WHERE b.id = ? AND (b.guest_id = ? OR u.id = ?)
    `, [id, req.user.id, req.user.id]);

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

    // Get payment details
    const [payments] = await pool.execute(`
      SELECT payment_reference, payment_method, amount, status, payment_date
      FROM payments
      WHERE booking_id = ?
      ORDER BY created_at DESC
    `, [id]);
    booking.payments = payments;

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
router.patch('/:id/cancel', verifyToken, validateId, async (req, res) => {
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

    // Calculate refund
    const refundInfo = calculateRefundAmount(
      parseFloat(booking.total_amount),
      booking.check_in_date,
      booking.is_non_refundable // This column might not exist yet, but I'll add it
    );

    // Update booking status
    await pool.execute(
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
      [reason, id]
    );

    // Create refund record for admin to review
    try {
      const [payments] = await pool.execute(`
        SELECT id, amount FROM payments 
        WHERE booking_id = ? AND status IN ('completed', 'processing', 'authorized')
        ORDER BY id DESC LIMIT 1
      `, [id]);

      if (payments.length > 0) {
        const paymentId = payments[0].id;
        const refundReference = `REF-${Date.now()}-${id}`;
        let rType = parseFloat(refundInfo.refundAmount) >= parseFloat(booking.total_amount) ? 'full' : (parseFloat(refundInfo.refundAmount) > 0 ? 'partial' : 'penalty');

        await pool.execute(`
          INSERT INTO refunds (
            booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund, 
            refund_reason, refund_type, cancellation_policy_applied, status, requested_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
          id, 
          paymentId,
          refundReference,
          parseFloat(booking.total_amount),
          parseFloat(refundInfo.refundAmount),
          parseFloat(refundInfo.refundAmount),
          (refundInfo.reason || reason || 'Admin/Host Cancellation').substring(0, 255), 
          rType,
          `Cancelled by Host/Admin. Policy: ${refundInfo.isEligible ? 'Eligible' : 'Not Eligible (Late)'}`
        ]);
      }
    } catch (refErr) {
        console.error('Refund creation error:', refErr);
    }

    res.json(
      formatResponse(true, 'Booking cancelled successfully', {
        refund: refundInfo
      })
    );

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to cancel booking', null, error.message)
    );
  }
});

// Add additional guests to booking
router.post('/:id/guests', verifyToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { guests } = req.body;

    // Check if booking exists and belongs to user
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE id = ? AND guest_id = ?',
      [id, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    // Add guests
    const guestValues = guests.map(guest => [
      id, guest.first_name, guest.last_name, guest.email,
      guest.phone, guest.date_of_birth, guest.gender, guest.is_primary_guest || false
    ]);

    await pool.execute(
      `INSERT INTO booking_guests (booking_id, first_name, last_name, email, phone, date_of_birth, gender, is_primary_guest) 
       VALUES ${guestValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`,
      guestValues.flat()
    );

    res.json(
      formatResponse(true, 'Guests added successfully')
    );

  } catch (error) {
    console.error('Add guests error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to add guests', null, error.message)
    );
  }
});

// Get booking availability for date range
router.get('/availability/check', async (req, res) => {
  try {
    const { property_id, check_in_date, check_out_date } = req.query;

    if (!property_id || !check_in_date || !check_out_date) {
      return res.status(400).json(
        formatResponse(false, 'Property ID, check-in date, and check-out date are required')
      );
    }

    if (!isValidDateRange(check_in_date, check_out_date)) {
      return res.status(400).json(
        formatResponse(false, 'Check-out date must be after check-in date')
      );
    }

    // Check for conflicts
    // Include bookings that are request_accepted, confirmed, or checked_in
    const [conflicts] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.check_in_date, b.check_out_date, b.status,
        u.first_name, u.last_name
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      WHERE b.property_id = ? 
      AND b.status IN ('request_accepted', 'confirmed', 'checked_in')
      AND DATE(b.check_in_date) < DATE(?) AND DATE(b.check_out_date) > DATE(?)
    `, [property_id, check_out_date, check_in_date]);

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
