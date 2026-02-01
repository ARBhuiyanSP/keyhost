const express = require('express');
const { pool } = require('../config/database');
const { 
  formatResponse, 
  generatePaymentReference 
} = require('../utils/helpers');
const { 
  validateId 
} = require('../middleware/validation');

const router = express.Router();

// Create payment
router.post('/', async (req, res) => {
  try {
    const {
      booking_id,
      payment_method,
      amount,
      gateway_transaction_id,
      gateway_response
    } = req.body;

    // Validate booking exists and belongs to user
    const [bookings] = await pool.execute(
      'SELECT id, total_amount, currency, status, payment_status FROM bookings WHERE id = ? AND guest_id = ?',
      [booking_id, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found or access denied')
      );
    }

    const booking = bookings[0];

    // Check if booking is confirmed by owner (required before payment)
    if (booking.status !== 'confirmed') {
      return res.status(400).json(
        formatResponse(false, 'Booking must be confirmed by property owner before payment')
      );
    }

    // Check if payment already completed
    if (booking.payment_status === 'paid') {
      return res.status(400).json(
        formatResponse(false, 'Booking payment has already been completed')
      );
    }

    // Generate payment reference
    const paymentReference = generatePaymentReference();

    // Create payment record
    const [result] = await pool.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type,
        amount, currency, gateway_transaction_id, gateway_response,
        status, payment_date, created_at
      ) VALUES (?, ?, ?, 'booking', ?, ?, ?, ?, 'pending', NOW(), NOW())
    `, [
      booking_id, paymentReference, payment_method, amount,
      booking.currency, gateway_transaction_id, JSON.stringify(gateway_response)
    ]);

    const paymentId = result.insertId;

    // Get created payment
    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE id = ?',
      [paymentId]
    );

    res.status(201).json(
      formatResponse(true, 'Payment created successfully', { payment: payments[0] })
    );

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create payment', null, error.message)
    );
  }
});

// Get payment by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await pool.execute(`
      SELECT 
        p.*,
        b.booking_reference,
        b.check_in_date,
        b.check_out_date,
        prop.title as property_title
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties prop ON b.property_id = prop.id
      WHERE p.id = ? AND b.guest_id = ?
    `, [id, req.user.id]);

    if (payments.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Payment not found or access denied')
      );
    }

    res.json(
      formatResponse(true, 'Payment retrieved successfully', { payment: payments[0] })
    );

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve payment', null, error.message)
    );
  }
});

// Update payment status
router.patch('/:id/status', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, gateway_response } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid payment status')
      );
    }

    // Check if payment exists and belongs to user
    const [payments] = await pool.execute(`
      SELECT p.*, b.guest_id 
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.id = ?
    `, [id]);

    if (payments.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Payment not found')
      );
    }

    if (payments[0].guest_id !== req.user.id) {
      return res.status(403).json(
        formatResponse(false, 'Access denied')
      );
    }

    // Update payment status
    const updateFields = ['status = ?'];
    const updateValues = [status];

    if (gateway_response) {
      updateFields.push('gateway_response = ?');
      updateValues.push(JSON.stringify(gateway_response));
    }

    if (status === 'completed') {
      updateFields.push('processed_at = NOW()');
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE payments SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );

    // If payment is completed, update booking status and create DR entry
    if (status === 'completed') {
      // Get booking details for DR entry
      const [bookingData] = await pool.execute(`
        SELECT b.*, p.owner_id
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE b.id = ?
      `, [payments[0].booking_id]);

      const booking = bookingData[0];

      // Update booking payment status
      await pool.execute(
        'UPDATE bookings SET payment_status = "paid", confirmed_at = NOW() WHERE id = ?',
        [payments[0].booking_id]
      );

      // Check if DR entry exists (owner accepted)
      const [drPayments] = await pool.execute(`
        SELECT id FROM payments 
        WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
      `, [payments[0].booking_id]);

      if (drPayments.length > 0) {
        // Create CR entry for admin (money received from guest)
        const crReference = `CR-${Date.now()}-${payments[0].booking_id}`;
        await pool.execute(`
          INSERT INTO payments (
            booking_id, payment_reference, payment_method, payment_type,
            amount, dr_amount, cr_amount, transaction_type, notes,
            status, payment_date, created_at
          ) VALUES (?, ?, ?, 'booking', ?, 0, ?, 'guest_payment', ?, 'completed', NOW(), NOW())
        `, [
          payments[0].booking_id,
          crReference,
          payments[0].payment_method || 'online',
          booking.total_amount,
          booking.total_amount,
          `Guest payment received - Total booking amount: ৳${booking.total_amount}`
        ]);
        
        // Update DR entry status to completed
        await pool.execute(`
          UPDATE payments
          SET status = 'completed',
              updated_at = NOW()
          WHERE booking_id = ? 
          AND transaction_type = 'owner_accepted'
          AND dr_amount > 0
        `, [payments[0].booking_id]);
      }

      // Mark admin commission as paid (all payments go to admin)
      await pool.execute(`
        UPDATE admin_earnings 
        SET payment_status = 'paid', 
            payment_date = NOW(),
            updated_at = NOW()
        WHERE booking_id = ? 
        AND payment_status = 'pending'
      `, [payments[0].booking_id]);

      // Award rewards points for completed payment
      try {
        const { awardPointsForBooking } = require('../utils/rewardsPoints');
        await awardPointsForBooking(booking.guest_id, booking.total_amount, payments[0].booking_id);
      } catch (pointsError) {
        console.error('Points awarding error:', pointsError);
        // Continue even if points awarding fails
      }
    }

    res.json(
      formatResponse(true, 'Payment status updated successfully')
    );

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update payment status', null, error.message)
    );
  }
});

// Get user's payment history
router.get('/history/list', async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT 
        p.*,
        b.booking_reference,
        b.check_in_date,
        b.check_out_date,
        prop.title as property_title,
        prop.city as property_city
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties prop ON b.property_id = prop.id
      WHERE b.guest_id = ?
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.json(
      formatResponse(true, 'Payment history retrieved successfully', { payments })
    );

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve payment history', null, error.message)
    );
  }
});

module.exports = router;
