const express = require('express');
const { pool } = require('../../config/database');
const {
  formatResponse,
  generatePagination,
  generateBookingReference,
  calculateBookingTotal,
  calculateRefundAmount,
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
const { verifyToken, requireGuestOrOwner, optionalAuth } = require('../../middleware/auth');
const { cacheMiddleware } = require('../../middleware/cache');

const router = express.Router();

// Get guest dashboard
router.get('/dashboard', verifyToken, requireGuestOrOwner, async (req, res) => {
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
router.get('/bookings', verifyToken, requireGuestOrOwner, validatePagination, async (req, res) => {
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
        (SELECT COUNT(*) FROM reviews r WHERE r.booking_id = b.id) > 0 as is_reviewed
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.image_type = 'main' AND pi.is_active = 1
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

// Create new booking
router.post('/bookings', verifyToken, requireGuestOrOwner, validateBooking, async (req, res) => {
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
      custom_price
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

    // Get property details (include auto_accept_bookings setting)
    const [properties] = await pool.execute(`
      SELECT 
        p.*, 
        po.id as owner_id,
        po.user_id as owner_user_id
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

    // HMS Room Handling
    const { hms_room_id } = req.body;
    let selectedRoom = null;

    if (hms_room_id) {
        const [rooms] = await pool.execute(
            'SELECT * FROM hms_rooms WHERE id = ? AND property_id = ?',
            [hms_room_id, property_id]
        );
        if (rooms.length === 0) {
            return res.status(404).json(formatResponse(false, 'Selected room not found in this property'));
        }
        selectedRoom = rooms[0];
    } else if (property.is_hms_enabled) {
        return res.status(400).json(formatResponse(false, 'Please select a room for this hotel property'));
    }

    // Check availability
    // Include bookings that are request_accepted, confirmed, or checked_in
    let conflictsQuery = `
      SELECT id FROM bookings
      WHERE property_id = ? 
      AND status IN ('request_accepted', 'confirmed', 'checked_in')
      AND DATE(check_in_date) < DATE(?) AND DATE(check_out_date) > DATE(?)
    `;
    let conflictsParams = [property_id, check_out_date, check_in_date];

    if (hms_room_id) {
        conflictsQuery += ' AND hms_room_id = ?';
        conflictsParams.push(hms_room_id);
    }

    const [conflicts] = await pool.execute(conflictsQuery, conflictsParams);

    if (conflicts.length > 0) {
      return res.status(409).json(
        formatResponse(false, hms_room_id ? 'The selected room is not available for these dates' : 'Property is not available for the selected dates')
      );
    }

    // Use room price if HMS enabled
    const basePrice = selectedRoom ? parseFloat(selectedRoom.price) : (parseFloat(property.base_price) || 0);
    const cleaningFee = parseFloat(property.cleaning_fee) || 0;
    const securityDeposit = parseFloat(property.security_deposit) || 0;
    const extraGuestFee = number_of_guests > 1 ? (number_of_guests - 1) * (parseFloat(property.extra_guest_fee) || 0) : 0;
    
    // Fetch live service fee and tax percentages from settings instead of hardcoding
    const [settingsRows] = await pool.execute(`
      SELECT setting_key, setting_value FROM system_settings 
      WHERE setting_key IN ('service_fee_percentage', 'tax_percentage')
    `);
    
    let serviceFeePercent = 0;
    let taxPercent = 0;
    
    settingsRows.forEach(row => {
      if (row.setting_key === 'service_fee_percentage') serviceFeePercent = parseFloat(row.setting_value) || 0;
      if (row.setting_key === 'tax_percentage') taxPercent = parseFloat(row.setting_value) || 0;
    });

    const serviceFee = (basePrice * nights) * (serviceFeePercent / 100);
    const taxAmount = (basePrice * nights) * (taxPercent / 100);

    const pricing = calculateBookingTotal(
      basePrice, nights, cleaningFee, securityDeposit,
      extraGuestFee, serviceFee, taxAmount
    );

    // Calculate custom price discount (Host Discount) if provided
    let hostDiscount = 0;
    const parsedCustomPrice = parseFloat(custom_price);
    if (!isNaN(parsedCustomPrice) && parsedCustomPrice > 0 && parsedCustomPrice <= pricing.total) {
      hostDiscount = pricing.total - parsedCustomPrice;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let coupons = [];
    if (coupon_code) {
      const [result] = await pool.execute(`
        SELECT * FROM coupons 
        WHERE code = ? AND is_active = 1 
        AND (valid_from IS NULL OR valid_from <= CURDATE()) 
        AND (valid_until IS NULL OR valid_until >= CURDATE())
        AND (usage_limit IS NULL OR used_count < usage_limit)
      `, [coupon_code]);
      coupons = result;

      if (coupons.length > 0) {
        const coupon = coupons[0];
        const totalForCoupon = pricing.total - hostDiscount;
        if (totalForCoupon >= coupon.minimum_amount) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (totalForCoupon * coupon.discount_value) / 100;
            if (coupon.maximum_discount) {
              discountAmount = Math.min(discountAmount, coupon.maximum_discount);
            }
          } else {
            discountAmount = coupon.discount_value;
          }
        }
      }
    }

    const finalTotal = Math.max(0, pricing.total - hostDiscount - discountAmount);
    const totalDiscount = discountAmount + hostDiscount;

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

    // Determine initial booking status based on auto_accept setting
    const autoAccept = !!property.auto_accept_bookings;
    const initialStatus = autoAccept ? 'request_accepted' : 'pending';

    // Get payment time limit from system settings
    let paymentTimeLimitMinutes = 15;
    if (autoAccept) {
      const [paymentSettings] = await pool.execute(
        `SELECT setting_value FROM system_settings WHERE setting_key = 'payment_time_limit_minutes' LIMIT 1`
      );
      if (paymentSettings.length > 0) paymentTimeLimitMinutes = parseInt(paymentSettings[0].setting_value) || 15;
    }

    // Create booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id, hms_room_id,
        check_in_date, check_out_date, check_in_time, check_out_time,
        number_of_guests, number_of_children, number_of_infants,
        base_price, cleaning_fee, security_deposit, extra_guest_fee,
        service_fee, tax_amount, admin_commission_rate, admin_commission_amount, property_owner_earnings,
        total_amount, currency, status, payment_status,
        special_requests, coupon_code, discount_amount,
        booking_source, guest_name, guest_email, guest_phone,
        confirmed_at, payment_deadline,
        booking_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      bookingReference, req.user.id, property_id, hms_room_id || null,
      check_in_date, check_out_date, check_in_time || '15:00', check_out_time || '11:00',
      number_of_guests, number_of_children, number_of_infants,
      basePrice * nights, cleaningFee, securityDeposit, extraGuestFee,
      serviceFee, taxAmount, commissionRate, commissionAmount, propertyOwnerEarnings,
      finalTotal, property.currency || 'BDT', initialStatus, 'pending',
      special_requests || null, coupon_code || null, totalDiscount,
      'website', `${req.user.first_name} ${req.user.last_name}`, req.user.email, req.user.phone || null,
      autoAccept ? new Date() : null,
      autoAccept ? new Date(Date.now() + paymentTimeLimitMinutes * 60 * 1000) : null
    ]);

    const bookingId = result.insertId;

    // Create DR entry if booking is auto-accepted (request_accepted)
    if (autoAccept) {
      const drReference = `DR-${Date.now()}-${bookingId}`;
      await pool.execute(`
        INSERT INTO payments (
          booking_id, payment_reference, payment_method, payment_type,
          amount, currency, dr_amount, cr_amount, transaction_type, notes,
          status, payment_date, created_at
        ) VALUES (?, ?, NULL, 'booking', ?, ?, ?, 0, 'owner_accepted', ?, 'completed', NOW(), NOW())
      `, [
        bookingId,
        drReference,
        finalTotal,
        property.currency || 'BDT',
        finalTotal,
        `Auto-accepted booking - Receivable amount: ৳${finalTotal}`
      ]);
    }

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

    const responseMessage = autoAccept
      ? 'Booking accepted! Please proceed to payment to confirm your stay.'
      : 'Booking request submitted successfully! Waiting for owner confirmation.';

    res.status(201).json(
      formatResponse(true, responseMessage, {
        booking: bookings[0],
        auto_accepted: autoAccept,
        pricing: {
          ...pricing,
          discountAmount,
          hostDiscount,
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

// Validate coupon
router.post('/validate-coupon', verifyToken, requireGuestOrOwner, async (req, res) => {
  try {
    const { coupon_code, total_amount } = req.body;

    if (!coupon_code) {
      return res.status(400).json(formatResponse(false, 'Coupon code is required'));
    }

    const [coupons] = await pool.execute(`
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = 1 
      AND (valid_from IS NULL OR valid_from <= CURDATE()) 
      AND (valid_until IS NULL OR valid_until >= CURDATE())
      AND (usage_limit IS NULL OR used_count < usage_limit)
    `, [coupon_code]);

    if (coupons.length === 0) {
      return res.status(404).json(formatResponse(false, 'Invalid or expired coupon code'));
    }

    const coupon = coupons[0];
    let discountAmount = 0;

    if (total_amount < coupon.minimum_amount) {
      return res.status(400).json(formatResponse(false, `Minimum amount for this coupon is ${coupon.minimum_amount}`));
    }

    if (coupon.discount_type === 'percentage') {
      discountAmount = (total_amount * coupon.discount_value) / 100;
      if (coupon.maximum_discount) {
        discountAmount = Math.min(discountAmount, coupon.maximum_discount);
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json(formatResponse(true, 'Coupon applied successfully', {
      discount_amount: discountAmount,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_amount: coupon.minimum_amount,
      maximum_discount: coupon.maximum_discount
    }));

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json(formatResponse(false, 'Failed to validate coupon', null, error.message));
  }
});

// Get single booking
router.get('/bookings/:id', verifyToken, requireGuestOrOwner, validateId, async (req, res) => {
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

    // Get rewards points earned/redeemed for this booking
    const [rewardPoints] = await pool.execute(`
      SELECT * FROM rewards_point_transactions
      WHERE booking_id = ?
      ORDER BY created_at DESC
    `, [id]);
    booking.reward_points = rewardPoints;

    // Get refund information for this booking
    const [refunds] = await pool.execute(`
      SELECT * FROM refunds
      WHERE booking_id = ?
      ORDER BY requested_at DESC
    `, [id]);
    booking.refunds = refunds;

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
router.patch('/bookings/:id/cancel', verifyToken, requireGuestOrOwner, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get booking details and calculate paid amount
    const [bookings] = await pool.execute(`
      SELECT 
        b.*, 
        p.title as property_title,
        COALESCE((
          SELECT SUM(cr_amount) 
          FROM payments 
          WHERE booking_id = b.id 
          AND status = 'completed'
        ), 0) as paid_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [parseInt(id), parseInt(req.user.id)]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    // Check if booking can be cancelled
    if (['cancelled', 'checked_out', 'checked_in'].includes(booking.status)) {
      let statusMsg = booking.status === 'cancelled' ? 'already cancelled' : 
                     booking.status === 'checked_out' ? 'completed' : 'already checked in';
      return res.status(400).json(
        formatResponse(false, `Cannot cancel booking: it is ${statusMsg}`)
      );
    }

    // Calculate refund based on what was actually PAID
    const amountToRefund = parseFloat(booking.paid_amount || 0);
    const refundInfo = calculateRefundAmount(
      amountToRefund,
      booking.check_in_date,
      booking.is_non_refundable
    );

    // Update booking status
    const cancellationReason = reason || 'Guest requested cancellation';
    await pool.execute(
      'UPDATE bookings SET status = "cancelled", cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
      [cancellationReason, parseInt(id)]
    );

    // Create refund record if they have PAID anything (even if 0 refund according to policy)
    let refundRecordCreated = false;
    try {
      const amountActuallyPaid = parseFloat(booking.paid_amount || 0);
      if (refundInfo && amountActuallyPaid > 0) {
        
        // Find the associated payment_id - specifically the guest_payment (CR) entry
        // This ensures payment_method (e.g. 'sslcommerz') is correctly linked for refunds
        const [payments] = await pool.execute(`
          SELECT id FROM payments 
          WHERE booking_id = ? AND transaction_type = 'guest_payment'
          AND status IN ('completed', 'processing', 'authorized') 
          ORDER BY created_at DESC LIMIT 1
        `, [parseInt(id)]);
        
        // Fallback: any completed payment if no guest_payment found
        let paymentId = payments.length > 0 ? payments[0].id : 0;
        if (paymentId === 0) {
          const [fallbackPayments] = await pool.execute(`
            SELECT id FROM payments WHERE booking_id = ? AND status = 'completed'
            AND cr_amount > 0 ORDER BY created_at DESC LIMIT 1
          `, [parseInt(id)]);
          paymentId = fallbackPayments.length > 0 ? fallbackPayments[0].id : 0;
        }
        const refundReference = `REF-${Date.now()}-${id}`;
        const refundType = parseFloat(refundInfo.refundAmount) >= amountActuallyPaid ? 'full' : (parseFloat(refundInfo.refundAmount) > 0 ? 'partial' : 'penalty');

        await pool.execute(`
          INSERT INTO refunds (
            booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund, 
            refund_reason, refund_type, cancellation_policy_applied, status, requested_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
          parseInt(id), 
          paymentId,
          refundReference,
          amountActuallyPaid,
          parseFloat(refundInfo.refundAmount), // Could be 0 depending on policy
          parseFloat(refundInfo.refundAmount), // net_refund
          (refundInfo.reason || 'Booking Cancellation').substring(0, 255), 
          refundType,
          `Original Paid: ৳${amountActuallyPaid}. Policy Status: ${refundInfo.isEligible ? 'Eligible' : 'Not Eligible (Late Cancellation)'}`
        ]);
        refundRecordCreated = true;
      }
    } catch (refundError) {
      console.error('❌ Refund record creation error:', refundError);
      // We don't want to fail the whole cancellation if only the refund record creation fails
      // but the user said they want it fixed, so we'll try to find why it fails.
    }

    // Refund rewards points if any were redeemed for this booking
    try {
      const rewardsPath = '../../utils/rewardsPoints';
      const rewardsPoints = require(rewardsPath);
      if (rewardsPoints && rewardsPoints.refundPointsForBooking) {
        await rewardsPoints.refundPointsForBooking(req.user.id, id);
      }
    } catch (pointsError) {
      console.error('❌ Points refund error:', pointsError);
    }

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
        booking: updatedBookings[0],
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

// Preview cancellation refund
router.get('/bookings/:id/cancel-preview', verifyToken, requireGuestOrOwner, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details and calculate paid amount
    const [bookings] = await pool.execute(`
      SELECT 
        b.*, 
        p.title as property_title,
        COALESCE((
          SELECT SUM(cr_amount) 
          FROM payments 
          WHERE booking_id = b.id 
          AND status = 'completed'
        ), 0) as paid_amount
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
    const totalPaid = parseFloat(booking.paid_amount || 0);

    // Calculate refund using KeyHost24 Policy
    const refundInfo = calculateRefundAmount(
      totalPaid,
      booking.check_in_date,
      booking.is_non_refundable
    );

    // Add breakdown
    const breakdown = {
      totalPaid: totalPaid,
      refundableAmount: refundInfo.refundAmount,
      serviceCharge: 0, // Admin can change this later if needed
      isEligible: refundInfo.isEligible && totalPaid > 0,
      reason: totalPaid <= 0 ? 'No non-zero payment found for this booking' : refundInfo.reason,
      checkInDate: booking.check_in_date,
      policyWarning: totalPaid <= 0 ? "এই বুকিংয়ের জন্য কোনো পেমেন্ট পাওয়া যায়নি।" : (!refundInfo.isEligible ? "আপনি কোনো রিফান্ড পাবেন না কারণ চেক-ইনের ৪৮ ঘণ্টার কম সময় বাকি রয়েছে বা এটি নন-রিফান্ডেবল বুকিং।" : null)
    };

    res.json(
      formatResponse(true, 'Cancellation preview retrieved', breakdown)
    );

  } catch (error) {
    console.error('Cancel preview error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve cancellation preview', null, error.message)
    );
  }
});

// Get guest's favorites
router.get('/favorites', verifyToken, requireGuestOrOwner, async (req, res) => {
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
router.post('/favorites/:propertyId', verifyToken, requireGuestOrOwner, validatePropertyId, async (req, res) => {
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
router.delete('/favorites/:propertyId', verifyToken, requireGuestOrOwner, validatePropertyId, async (req, res) => {
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
router.get('/properties', optionalAuth, validatePagination, cacheMiddleware(30), async (req, res) => {
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

    // If user is logged in, exclude their own properties from guest list
    if (req.user) {
      const [ownerRows] = await pool.execute('SELECT id FROM property_owners WHERE user_id = ?', [req.user.id]);
      if (ownerRows.length > 0) {
        whereConditions.push('p.owner_id != ?');
        queryParams.push(ownerRows[0].id);
      }
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
      whereConditions.push('LOWER(p.property_type) = LOWER(?)');
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

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

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
router.get('/display-categories', cacheMiddleware(1800), async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT dc.*, COUNT(DISTINCT p.id) as property_count
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

// Validate multiple property IDs (for cleaning client-side caches like Recently Viewed)
router.get('/properties/validate-multiple', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.json(formatResponse(true, 'No IDs to validate', { validIds: [] }));
    }

    const idList = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (idList.length === 0) {
      return res.json(formatResponse(true, 'No valid IDs to validate', { validIds: [] }));
    }

    const [rows] = await pool.query(
      `SELECT id FROM properties WHERE id IN (${idList.map(() => '?').join(',')}) AND status = 'active'`,
      idList
    );

    const validIds = rows.map(row => row.id);
    res.json(formatResponse(true, 'Properties validated successfully', { validIds }));
  } catch (error) {
    console.error('Validate multiple properties error:', error);
    res.status(500).json(formatResponse(false, 'Failed to validate properties', null, error.message));
  }
});

// Get properties by display category
router.get('/display-categories/:id/properties', optionalAuth, cacheMiddleware(300), async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    let whereClause = 'WHERE dcp.display_category_id = ? AND p.status = "active"';
    let queryParams = [parseInt(id)];

    // If user is logged in, exclude their own properties from category list (unless they are admin)
    if (req.user && req.user.role !== 'admin') {
      const [ownerRows] = await pool.execute('SELECT id FROM property_owners WHERE user_id = ?', [req.user.id]);
      if (ownerRows.length > 0) {
        whereClause += ' AND p.owner_id != ?';
        queryParams.push(ownerRows[0].id);
      }
    }

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
    const [properties] = await pool.query(`
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND image_type = 'main' LIMIT 1) as main_image_url,
        (SELECT AVG(rating) FROM reviews WHERE property_id = p.id AND status = 'approved') as average_rating
      FROM properties p
      INNER JOIN display_category_properties dcp ON p.id = dcp.property_id
      ${whereClause}
      ORDER BY dcp.created_at DESC
      LIMIT ?
    `, [...queryParams, parseInt(limit)]);

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
router.get('/properties/amenities/list', cacheMiddleware(1800), async (req, res) => {
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
router.get('/properties/recommended', optionalAuth, cacheMiddleware(600), async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const userId = req.user?.id;

    // Get properties with high ratings and recent bookings
    const limitNum = parseInt(limit) || 6;
    const [properties] = await pool.query(`
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

// Check property availability
router.get('/properties/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in_date, check_out_date, hms_room_id } = req.query;

    if (!check_in_date || !check_out_date) {
      return res.status(400).json(
        formatResponse(false, 'Check-in and check-out dates are required')
      );
    }

    // Check for conflicting bookings
    // Include bookings that are request_accepted, confirmed, or checked_in
    let conflictQuery = `
      SELECT COUNT(*) as conflict_count
      FROM bookings
      WHERE property_id = ?
        AND status IN ('request_accepted', 'confirmed', 'checked_in')
        AND DATE(check_in_date) < DATE(?) AND DATE(check_out_date) > DATE(?)
    `;
    let conflictParams = [id, check_out_date, check_in_date];

    if (hms_room_id) {
       conflictQuery += ` AND hms_room_id = ? `;
       conflictParams.push(hms_room_id);
    }

    const [conflicts] = await pool.execute(conflictQuery, conflictParams);

    // Check for explicit blocked dates in property_availability
    const [blockedDates] = await pool.execute(`
      SELECT COUNT(*) as block_count
      FROM property_availability
      WHERE property_id = ?
        AND is_available = 0
        AND date >= DATE(?) AND date < DATE(?)
    `, [id, check_in_date, check_out_date]);

    const isAvailable = conflicts[0].conflict_count === 0 && blockedDates[0].block_count === 0;

    res.json(
      formatResponse(true, 'Availability checked successfully', {
        isAvailable,
        check_in_date,
        check_out_date,
        hms_room_id: hms_room_id || null
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
router.patch('/bookings/:id/payment', verifyToken, requireGuestOrOwner, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_status, points_to_redeem, amount_paid } = req.body;

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
    const isExtensionPayment = booking.payment_status === 'pending_extra';

    // For extension payments: booking must be confirmed/checked_in with pending_extra payment
    if (isExtensionPayment) {
      if (!['confirmed', 'checked_in'].includes(booking.status)) {
        return res.status(400).json(
          formatResponse(false, 'Invalid booking status for extension payment')
        );
      }
      // Extension payment is allowed — fall through to payment processing below
    } else {
      // For original booking payment: status must be request_accepted
      if (booking.status !== 'request_accepted') {
        return res.status(400).json(
          formatResponse(false, 'Booking must be accepted by the owner before payment')
        );
      }

      // Check if owner has accepted the booking request
      if (!booking.confirmed_at) {
        return res.status(400).json(
          formatResponse(false, 'Property owner has not accepted this booking request yet')
        );
      }
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
        // For extensions: use amount_paid (extra amount only), for original: use total
        let baseAmount = (isExtensionPayment && amount_paid) ? parseFloat(amount_paid) : parseFloat(booking.total_amount);
        let finalAmount = baseAmount;
        let pointsRedeemed = 0;
        let pointsDiscount = 0;

        if (points_to_redeem && points_to_redeem > 0) {
          try {
            const { redeemPointsForBooking } = require('../utils/rewardsPoints');
            const redemptionResult = await redeemPointsForBooking(req.user.id, points_to_redeem, id);
            pointsRedeemed = redemptionResult.pointsRedeemed;
            pointsDiscount = redemptionResult.discountAmount;
            finalAmount = Math.max(0, baseAmount - pointsDiscount);
          } catch (pointsError) {
            console.error('Points redemption error:', pointsError);
            // Continue with payment even if points redemption fails
          }
        }

        // Create CR entry for admin (money received from guest)
        const crReference = `CR-${Date.now()}-${id}`;
        const crNotes = isExtensionPayment
          ? `Extension extra payment received: ৳${finalAmount}${pointsDiscount > 0 ? `, Points discount: ৳${pointsDiscount.toFixed(2)}` : ''}`
          : `Guest payment received - Total: ৳${booking.total_amount}${pointsDiscount > 0 ? `, Points discount: ৳${pointsDiscount.toFixed(2)}` : ''}`;

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
          crNotes
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
        if (isExtensionPayment) {
          // Extension: just mark payment as paid, keep booking status unchanged
          await pool.execute(`
            UPDATE bookings
            SET payment_status = 'paid',
                updated_at = NOW()
            WHERE id = ?
          `, [id]);
          console.log(`Extension payment confirmed for booking ${id}`);
        } else {
          // Original booking: set status to confirmed
          await pool.execute(`
            UPDATE bookings
            SET status = 'confirmed',
                payment_status = 'paid',
                updated_at = NOW()
            WHERE id = ?
          `, [id]);
          console.log(`Booking ${id} confirmed after payment by guest`);
        }
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
router.patch('/bookings/:id/confirm', verifyToken, requireGuestOrOwner, validateId, async (req, res) => {
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


// Calculate cost to extend booking
router.post('/bookings/:id/extend/calculate', verifyToken, requireGuestOrOwner, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_check_out_date } = req.body;

    if (!new_check_out_date) {
      return res.status(400).json(formatResponse(false, 'New check-out date is required'));
    }

    // Get original booking
    const [bookings] = await pool.execute(`
      SELECT b.*, p.base_price as property_base_price 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(formatResponse(false, 'Booking not found'));
    }

    const booking = bookings[0];
    const propertyId = booking.property_id;

    // Must be confirmed or checked in
    if (!['confirmed', 'checked_in'].includes(booking.status)) {
      return res.status(400).json(formatResponse(false, 'Cannot extend booking with current status'));
    }

    // Ensure new date is after current check-out date
    const oldCheckOutDate = new Date(booking.check_out_date);
    const newCheckOutDateObj = new Date(new_check_out_date);
    oldCheckOutDate.setHours(0,0,0,0);
    newCheckOutDateObj.setHours(0,0,0,0);

    if (newCheckOutDateObj <= oldCheckOutDate) {
      return res.status(400).json(formatResponse(false, 'New check-out date must be after current check-out date'));
    }

    // Check availability for the additional days (from old check_out to new check_out)
    // The previous check-out date becomes the check-in date for the extended period
    const [conflicts] = await pool.execute(`
      SELECT id FROM bookings 
      WHERE property_id = ? 
      AND status IN ('confirmed', 'checked_in', 'request_accepted', 'pending')
      AND id != ?
      AND (
        (DATE(check_in_date) < DATE(?) AND DATE(check_out_date) > DATE(?))
      )
    `, [propertyId, id, new_check_out_date, booking.check_out_date]);

    if (conflicts.length > 0) {
      return res.status(400).json(formatResponse(false, 'Property is not available for requested extension dates'));
    }

    // Calculate extra days
    const extraNights = Math.ceil((newCheckOutDateObj - oldCheckOutDate) / (1000 * 60 * 60 * 24));
    
    // Additional price calculation
    const extraBasePrice = parseFloat(booking.base_price) * extraNights;
    
    // Get service fee % (this might be in system_settings, assuming simplified logic based on existing booking)
    const existingNightsCount = Math.ceil((oldCheckOutDate - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24));
    let serviceFeeRate = booking.service_fee > 0 ? (parseFloat(booking.service_fee) / (parseFloat(booking.base_price) * existingNightsCount)) : 0;
    
    // Cap service fee rate around 10%
    if(serviceFeeRate > 0.15) serviceFeeRate = 0.10; 

    const extraServiceFee = extraBasePrice * serviceFeeRate;
    const additionalTotalAmount = extraBasePrice + extraServiceFee;

    // Don't add cleaning fee again, they already paid it
    
    res.json(formatResponse(true, 'Extension cost calculated', {
      original_check_out: booking.check_out_date,
      new_check_out: new_check_out_date,
      extra_nights: extraNights,
      extra_base_price: extraBasePrice,
      extra_service_fee: extraServiceFee,
      additional_total_amount: additionalTotalAmount
    }));

  } catch (error) {
    console.error('Calculate extension error:', error);
    res.status(500).json(formatResponse(false, 'Failed to calculate extension cost', null, error.message));
  }
});

// Extend booking
router.post('/bookings/:id/extend', verifyToken, requireGuestOrOwner, validateId, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { new_check_out_date } = req.body;

    if (!new_check_out_date) {
      return res.status(400).json(formatResponse(false, 'New check-out date is required'));
    }

    await connection.beginTransaction();

    // 1. Get original booking
    const [bookings] = await connection.execute(`
      SELECT b.*, p.base_price as property_base_price 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [id, req.user.id]);

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json(formatResponse(false, 'Booking not found'));
    }

    const booking = bookings[0];
    const propertyId = booking.property_id;

    if (!['confirmed', 'checked_in'].includes(booking.status)) {
      await connection.rollback();
      return res.status(400).json(formatResponse(false, 'Cannot extend booking with current status'));
    }

    const oldCheckOutDate = new Date(booking.check_out_date);
    const newCheckOutDateObj = new Date(new_check_out_date);
    oldCheckOutDate.setHours(0,0,0,0);
    newCheckOutDateObj.setHours(0,0,0,0);

    if (newCheckOutDateObj <= oldCheckOutDate) {
      await connection.rollback();
      return res.status(400).json(formatResponse(false, 'New check-out date must be after current check-out date'));
    }

    // 2. Check Availability
    const [conflicts] = await connection.execute(`
      SELECT id FROM bookings 
      WHERE property_id = ? 
      AND status IN ('confirmed', 'checked_in', 'request_accepted', 'pending')
      AND id != ?
      AND (
        (DATE(check_in_date) < DATE(?) AND DATE(check_out_date) > DATE(?))
      )
    `, [propertyId, id, new_check_out_date, booking.check_out_date]);

    if (conflicts.length > 0) {
      await connection.rollback();
      return res.status(400).json(formatResponse(false, 'Property is not available for requested extension dates'));
    }

    // 3. Math (Same as calculate)
    const extraNights = Math.ceil((newCheckOutDateObj - oldCheckOutDate) / (1000 * 60 * 60 * 24));
    const extraBasePrice = parseFloat(booking.base_price) * extraNights;
    
    const existingNightsCount = Math.ceil((oldCheckOutDate - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24));
    let serviceFeeRate = booking.service_fee > 0 ? (parseFloat(booking.service_fee) / (parseFloat(booking.base_price) * existingNightsCount)) : 0;
    if(serviceFeeRate > 0.15) serviceFeeRate = 0.10; 
    
    const extraServiceFee = extraBasePrice * serviceFeeRate;
    const extraTax = parseFloat(booking.tax_amount || 0) > 0 ? (extraBasePrice * 0.15) : 0; // Assuming 15% VAT roughly
    
    const extraTotalAmount = extraBasePrice + extraServiceFee + extraTax;
    
    const adminCommissionRate = parseFloat(booking.admin_commission_rate || 10);
    const extraAdminCommission = extraBasePrice * (adminCommissionRate / 100);
    const extraOwnerEarnings = extraTotalAmount - extraAdminCommission;

    const newTotalAmount = parseFloat(booking.total_amount) + extraTotalAmount;
    const newOwnerEarnings = parseFloat(booking.property_owner_earnings || 0) + extraOwnerEarnings;
    const newAdminCommission = parseFloat(booking.admin_commission_amount || 0) + extraAdminCommission;

    // 4. Record the Modification FIRST BEFORE UPDATING, to capture old state cleanly
    const oldValuesJSON = JSON.stringify({
      check_out_date: booking.check_out_date,
      total_amount: booking.total_amount,
      property_owner_earnings: booking.property_owner_earnings,
      admin_commission_amount: booking.admin_commission_amount,
      service_fee: booking.service_fee,
      tax_amount: booking.tax_amount
    });

    const newValuesJSON = JSON.stringify({
      check_out_date: new_check_out_date,
      total_amount: newTotalAmount,
      property_owner_earnings: newOwnerEarnings,
      admin_commission_amount: newAdminCommission,
      service_fee: parseFloat(booking.service_fee) + extraServiceFee,
      tax_amount: parseFloat(booking.tax_amount) + extraTax
    });

    await connection.execute(`
      INSERT INTO booking_modifications (
        booking_id, modified_by, modification_type, old_values, new_values, reason, additional_fee
      ) VALUES (?, ?, 'extension', ?, ?, 'Guest requested extension', ?)
    `, [id, req.user.id, oldValuesJSON, newValuesJSON, extraTotalAmount]);

    // 5. Update Bookings Table
    await connection.execute(`
      UPDATE bookings 
      SET 
        check_out_date = ?,
        total_amount = ?,
        property_owner_earnings = ?,
        admin_commission_amount = ?,
        service_fee = ?,
        tax_amount = ?,
        payment_status = 'pending_extra', 
        updated_at = NOW()
      WHERE id = ?
    `, [
      new_check_out_date, 
      newTotalAmount, 
      newOwnerEarnings, 
      newAdminCommission, 
      parseFloat(booking.service_fee) + extraServiceFee, 
      parseFloat(booking.tax_amount) + extraTax,
      id
    ]);

    // Note: We don't automatically deduct or add 'payments' ledger CR entries yet.
    // They still need to make an SSLCommerz payment for the extra amount,
    // which should update the balance. However, we DO need to add the owner DR ledger to reflect new receivables.
    
    const ownerAcceptedRef = `DR_EXT_${Date.now()}_${id}`;
    await connection.execute(`
      INSERT INTO payments (
        booking_id, amount, dr_amount, cr_amount, payment_method, payment_reference,
        status, transaction_type, notes, payment_date, created_at
      ) VALUES (?, ?, ?, 0, 'system_update', ?, 'completed', 'owner_accepted', 'Extra charge for extension', NOW(), NOW())
    `, [id, extraTotalAmount, extraTotalAmount, ownerAcceptedRef]);

    await connection.commit();

    // 6. Return response to forward to payment processor with new "extraTotalAmount"
    res.json(formatResponse(true, 'Booking extended successfully. Pending extra payment', {
      booking_id: id,
      extra_amount_due: extraTotalAmount,
      new_total: newTotalAmount
    }));

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Extension apply error:', error);
    res.status(500).json(formatResponse(false, 'Failed to apply extension', null, error.message));
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;



