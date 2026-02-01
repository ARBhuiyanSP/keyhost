const express = require('express');
const { pool } = require('../config/database');
const { 
  formatResponse, 
  generatePagination,
  generateBookingReference,
  calculateBookingTotal,
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
    const basePrice = property.base_price;
    const cleaningFee = property.cleaning_fee;
    const securityDeposit = property.security_deposit;
    const extraGuestFee = number_of_guests > 1 ? (number_of_guests - 1) * property.extra_guest_fee : 0;
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

    // Create booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id,
        check_in_date, check_out_date, check_in_time, check_out_time,
        number_of_guests, number_of_children, number_of_infants,
        base_price, cleaning_fee, security_deposit, extra_guest_fee,
        service_fee, tax_amount, total_amount, currency,
        special_requests, coupon_code, discount_amount,
        guest_name, guest_email, guest_phone,
        booking_source, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'website', 'pending', NOW())
    `, [
      bookingReference, req.user.id, property_id,
      check_in_date, check_out_date, check_in_time, check_out_time,
      number_of_guests, number_of_children, number_of_infants,
      basePrice, cleaningFee, securityDeposit, extraGuestFee,
      serviceFee, taxAmount, finalTotal, property.currency,
      special_requests, coupon_code, discountAmount,
      `${req.user.first_name} ${req.user.last_name}`, req.user.email, req.user.phone
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
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
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
      if (req.user.role === 'admin') {
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
    const [bookings] = await pool.execute(`
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
    `, [...queryParams, parseInt(limit), offset]);

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
    const [bookings] = await pool.execute(`
      SELECT 
        b.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        p.base_price,
        pi.image_url as property_image
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
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
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

    // Update booking status
    await pool.execute(
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
      [reason, id]
    );

    // TODO: Process refund based on cancellation policy
    // This would involve calculating refund amount and creating refund record

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
    // Include bookings that are confirmed/checked_in OR pending with owner acceptance and payment deadline not expired
    const [conflicts] = await pool.execute(`
      SELECT 
        b.id, b.booking_reference, b.check_in_date, b.check_out_date, b.status,
        u.first_name, u.last_name
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      WHERE b.property_id = ? 
      AND (
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
    `, [property_id, check_out_date, check_in_date, check_out_date, check_in_date, check_in_date, check_out_date]);

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
