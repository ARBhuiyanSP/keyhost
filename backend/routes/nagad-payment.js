const express = require('express');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { syncPaymentToHMSAccounts } = require('../utils/hms-sync');
const { verifyToken } = require('../middleware/auth');
const { sendBookingPaidSms } = require('../utils/sms');
const NagadPaymentGateway = require('../utils/nagad-gateway');

const router = express.Router();

// Initialize Nagad gateway
const nagadGateway = new NagadPaymentGateway();
nagadGateway.initialize().catch(console.error);

// =============================================
// SHARED NAGAD PAYMENT COMPLETION HELPER
// Updates booking, accounting entries, sends SMS/points/HMS sync
// Then redirects browser to frontend confirmation page
// =============================================
async function completeNagadPayment(payment, verifyResult, res, bookingId) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    const [bookingData] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [bookingId]);

    if (bookingData.length === 0) {
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Booking+not+found`);
    }

    const booking = bookingData[0];

    // Idempotency: already paid
    if (booking.payment_status === 'paid') {
      return res.redirect(`${frontendUrl}/booking-confirmation/${bookingId}`);
    }

    // Require owner acceptance (DR entry)
    const [drPayments] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
    `, [bookingId]);

    if (drPayments.length === 0) {
      const autoDrRef = `DR-AUTO-${Date.now()}-${bookingId}`;
      await pool.execute(`
          INSERT INTO payments (
              booking_id, payment_reference, payment_type,
              amount, dr_amount, cr_amount, transaction_type, status, notes,
              payment_date, created_at, updated_at
          ) VALUES (?, ?, 'booking', ?, ?, 0, 'owner_accepted', 'completed', ?, NOW(), NOW(), NOW())
      `, [bookingId, autoDrRef, payment.amount, payment.amount, `Automatic DR entry for successful payment - ৳${payment.amount}`]);
    }

    // Prevent duplicate CR entries
    const [existingCr] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'guest_payment' AND cr_amount > 0
    `, [bookingId]);

    if (existingCr.length === 0) {
      // Clean up duplicate DR entries
      const [allDrPayments] = await pool.execute(`
        SELECT id, transaction_type FROM payments 
        WHERE booking_id = ? AND dr_amount > 0
      `, [bookingId]);

      const ownerAcceptedDrs = allDrPayments.filter(p => p.transaction_type === 'owner_accepted');
      for (let i = 1; i < ownerAcceptedDrs.length; i++) {
        await pool.execute(`DELETE FROM payments WHERE id = ?`, [ownerAcceptedDrs[i].id]);
      }

      // Create CR entry (money received from guest)
      const crReference = `CR-NAGAD-${Date.now()}-${bookingId}`;
      const txnNotes = verifyResult.isDemo
        ? `Guest payment received via Nagad (Demo) - Total: ৳${booking.total_amount}`
        : `Guest payment received via Nagad TXN:${verifyResult.transactionID} - Total: ৳${booking.total_amount}`;

      const [crInsertResult] = await pool.execute(`
        INSERT INTO payments SET
          booking_id = ?,
          payment_reference = ?,
          payment_method = 'nagad',
          payment_type = 'booking',
          amount = ?,
          dr_amount = 0,
          cr_amount = ?,
          transaction_type = 'guest_payment',
          notes = ?,
          status = 'completed',
          payment_date = NOW(),
          created_at = NOW()
      `, [bookingId, crReference, booking.total_amount, booking.total_amount, txnNotes]);

      // Force dr_amount = 0 in case of DB triggers
      await pool.execute(`
        UPDATE payments SET dr_amount = 0, updated_at = NOW()
        WHERE id = ? AND transaction_type = 'guest_payment'
      `, [crInsertResult.insertId]);

      // Mark DR entry as completed
      await pool.execute(`
        UPDATE payments SET status = 'completed', updated_at = NOW()
        WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
      `, [bookingId]);

      // Confirm booking as paid
      await pool.execute(`
        UPDATE bookings 
        SET payment_status = 'paid', status = 'confirmed',
            payment_method = 'nagad',
            confirmed_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [bookingId]);

      // Send SMS confirmation
      try {
        await sendBookingPaidSms(bookingId);
      } catch (smsErr) {
        console.error(`Nagad SMS error for booking ${bookingId}:`, smsErr.message);
      }

      // Mark admin commission paid
      await pool.execute(`
        UPDATE admin_earnings 
        SET payment_status = 'paid', payment_date = NOW(), updated_at = NOW()
        WHERE booking_id = ? AND payment_status = 'pending'
      `, [bookingId]);

      // Award rewards points
      try {
        const [existingPoints] = await pool.execute(`
          SELECT id FROM rewards_point_transactions 
          WHERE booking_id = ? AND transaction_type = 'earned'
        `, [bookingId]);

        if (existingPoints.length === 0) {
          const { awardPointsForBooking } = require('../utils/rewardsPoints');
          const result = await awardPointsForBooking(payment.guest_id, booking.total_amount, bookingId);
          console.log(`✅ Nagad: Points awarded: ${result.pointsAwarded} for booking ${bookingId}`);
        }
      } catch (pointsErr) {
        console.error('Nagad points awarding error:', pointsErr);
      }

      // Sync to HMS Accounts
      try {
        await syncPaymentToHMSAccounts(crInsertResult.insertId);
      } catch (hmsErr) {
        console.error('Nagad HMS Sync error:', hmsErr);
      }
    }

    return res.redirect(`${frontendUrl}/booking-confirmation/${bookingId}`);

  } catch (err) {
    console.error('completeNagadPayment error:', err);
    return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+processing+error`);
  }
}

// =============================================
// CREATE NAGAD PAYMENT
// =============================================
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { booking_id, amount, customer_info } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json(
        formatResponse(false, 'Booking ID and amount are required')
      );
    }

    // Verify booking belongs to user
    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [booking_id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(formatResponse(false, 'Booking not found'));
    }

    const booking = bookings[0];

    if (booking.payment_status === 'paid') {
      return res.status(400).json(formatResponse(false, 'Booking is already paid'));
    }

    // Require owner acceptance before payment
    const [drPayments] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
    `, [booking_id]);

    if (drPayments.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Property owner must accept booking before payment can be initiated')
      );
    }

    // Initialize and create Nagad payment
    await nagadGateway.initialize();
    const paymentResult = await nagadGateway.createPayment(amount, booking_id, customer_info || {});

    if (!paymentResult.success) {
      return res.status(400).json(
        formatResponse(false, 'Failed to create Nagad payment', null, paymentResult.error)
      );
    }

    // Skip if initiation record already exists for this paymentID
    const [existingInit] = await pool.execute(`
      SELECT id FROM payments WHERE gateway_transaction_id = ? AND transaction_type = 'payment_initiated'
    `, [paymentResult.paymentID]);

    if (existingInit.length > 0) {
      return res.json(formatResponse(true, 'Nagad payment already initiated', {
        payment_id: paymentResult.paymentID,
        nagad_url: paymentResult.nagadURL,
        amount,
        booking_reference: booking.booking_reference,
        property_title: booking.property_title,
        is_demo: paymentResult.isDemo
      }));
    }

    // Record payment_initiated tracker (no dr/cr — just a tracking entry)
    const paymentReference = `NAGAD_${paymentResult.paymentID}`;
    const [insertResult] = await pool.execute(`
      INSERT INTO payments SET
        booking_id = ?,
        amount = ?,
        dr_amount = 0,
        cr_amount = 0,
        payment_method = 'nagad',
        payment_reference = ?,
        status = 'pending',
        payment_type = 'booking',
        transaction_type = 'payment_initiated',
        notes = 'Nagad payment initiated',
        gateway_transaction_id = ?,
        created_at = NOW()
    `, [booking_id, amount, paymentReference, paymentResult.paymentID]);

    // Force dr_amount and cr_amount = 0 after insert (prevent trigger interference)
    await pool.execute(`
      UPDATE payments SET dr_amount = 0, cr_amount = 0, updated_at = NOW()
      WHERE id = ? AND transaction_type = 'payment_initiated'
    `, [insertResult.insertId]);

    res.json(formatResponse(true, 'Nagad payment created successfully', {
      payment_id: paymentResult.paymentID,
      nagad_url: paymentResult.nagadURL,
      amount,
      booking_reference: booking.booking_reference,
      property_title: booking.property_title,
      is_demo: paymentResult.isDemo
    }));

  } catch (error) {
    console.error('Create Nagad payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create Nagad payment', null, error.message)
    );
  }
});

// =============================================
// NAGAD DEMO SIMULATION ENDPOINT
// When credentials are empty, nagadURL points here instead of real Nagad
// =============================================
router.get('/simulate-demo', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    const { paymentRefId, bookingId } = req.query;

    if (!paymentRefId || !bookingId) {
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Missing+payment+parameters`);
    }

    console.log(`Nagad demo simulation: paymentRefId=${paymentRefId}, bookingId=${bookingId}`);

    // Find payment_initiated record
    const [payments] = await pool.execute(`
      SELECT p.*, b.guest_id
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.gateway_transaction_id = ? AND p.transaction_type = 'payment_initiated'
    `, [paymentRefId]);

    if (payments.length === 0) {
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+record+not+found`);
    }

    const payment = payments[0];

    // Simulate verify payment
    await nagadGateway.initialize();
    const verifyResult = await nagadGateway.verifyPayment(paymentRefId);

    if (!verifyResult.success) {
      return res.redirect(`${frontendUrl}/payment/${payment.booking_id}?payment=fail&error=Demo+verification+failed`);
    }

    await completeNagadPayment(payment, verifyResult, res, payment.booking_id);

  } catch (error) {
    console.error('Nagad demo simulation error:', error);
    res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Simulation+error`);
  }
});

// =============================================
// NAGAD PAYMENT CALLBACK (browser redirect from Nagad hosted page)
// =============================================
router.get('/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    // Nagad redirects the browser to callbackURL with these query params
    const { payment_ref_id, status, order_id } = req.query;

    console.log('Nagad browser callback received:', req.query);

    if (!payment_ref_id) {
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Missing+payment_ref_id`);
    }

    // Find payment record by gateway_transaction_id
    const [payments] = await pool.execute(`
      SELECT p.*, b.guest_id
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.gateway_transaction_id = ?
    `, [payment_ref_id]);

    if (payments.length === 0) {
      console.error(`Nagad callback: No payment record found for payment_ref_id=${payment_ref_id}`);
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+record+not+found`);
    }

    const payment = payments[0];

    // Handle failure/cancellation
    if (status === 'Failure' || status === 'Aborted' || status === 'cancel') {
      await pool.execute(`
        UPDATE payments 
        SET status = 'failed', gateway_response = ?, updated_at = NOW()
        WHERE id = ?
      `, [JSON.stringify(req.query), payment.id]);
      return res.redirect(`${frontendUrl}/payment/${payment.booking_id}?payment=fail&error=Nagad+payment+${status}`);
    }

    // Verify payment with Nagad API
    await nagadGateway.initialize();
    const verifyResult = await nagadGateway.verifyPayment(payment_ref_id);

    if (!verifyResult.success || verifyResult.status !== 'Success') {
      console.error(`Nagad verify failed for payment_ref_id=${payment_ref_id}:`, verifyResult.error);
      await pool.execute(`
        UPDATE payments 
        SET status = 'failed', gateway_response = ?, updated_at = NOW()
        WHERE id = ?
      `, [JSON.stringify({ error: verifyResult.error, query: req.query }), payment.id]);
      return res.redirect(`${frontendUrl}/payment/${payment.booking_id}?payment=fail&error=Nagad+verification+failed`);
    }

    await completeNagadPayment(payment, verifyResult, res, payment.booking_id);

  } catch (error) {
    console.error('Nagad callback error:', error);
    res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+processing+error`);
  }
});

// =============================================
// GET NAGAD SETTINGS (for frontend)
// =============================================
router.get('/settings', async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('enable_nagad', 'nagad_is_live', 'nagad_merchant_id')
    `);

    const nagadSettings = {};
    settings.forEach(s => {
      nagadSettings[s.setting_key] = s.setting_value;
    });

    res.json(formatResponse(true, 'Nagad settings retrieved', {
      enabled: nagadSettings.enable_nagad === 'true',
      is_live: nagadSettings.nagad_is_live === 'true',
      has_credentials: !!(nagadSettings.nagad_merchant_id)
    }));

  } catch (error) {
    console.error('Get Nagad settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve Nagad settings', null, error.message)
    );
  }
});

// Public HMS Nagad Payment Request
router.post('/hms/public-request', async (req, res) => {
  try {
    const { token } = req.body;
    const [bookings] = await pool.execute(`
      SELECT b.id, 
             (
                 b.total_amount 
                 + COALESCE((SELECT SUM(amount) FROM hms_bills WHERE booking_id = b.id), 0)
                 - COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id AND status = 'completed'), 0)
             ) as total_amount,
             b.guest_name, b.guest_email, b.guest_phone,
             p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.payment_link_token = ?
    `, [token]);

    if (bookings.length === 0) {
      return res.status(404).json(formatResponse(false, 'Invalid token'));
    }
    const booking = bookings[0];

    if (booking.total_amount <= 0) {
      return res.status(400).json(formatResponse(false, 'This bill has already been fully paid.'));
    }

    // Initialize and create Nagad payment
    await nagadGateway.initialize();
    const paymentResult = await nagadGateway.createPayment(
      booking.total_amount, 
      booking.id, 
      {
        name: booking.guest_name,
        email: booking.guest_email,
        phone: booking.guest_phone
      }
    );

    if (!paymentResult.success) {
      return res.status(400).json(
        formatResponse(false, 'Failed to create Nagad payment', null, paymentResult.error)
      );
    }

    // Record payment_initiated tracker (no dr/cr — just a tracking entry)
    const paymentReference = `NAGAD_${paymentResult.paymentID}`;
    const [insertResult] = await pool.execute(`
      INSERT INTO payments SET
        booking_id = ?,
        amount = ?,
        dr_amount = 0,
        cr_amount = 0,
        payment_method = 'nagad',
        payment_reference = ?,
        status = 'pending',
        payment_type = 'booking',
        transaction_type = 'payment_initiated',
        notes = 'Nagad payment initiated for HMS booking via link',
        gateway_transaction_id = ?,
        created_at = NOW()
    `, [booking.id, booking.total_amount, paymentReference, paymentResult.paymentID]);

    // Force dr_amount and cr_amount = 0 after insert (prevent trigger interference)
    await pool.execute(`
      UPDATE payments SET dr_amount = 0, cr_amount = 0, updated_at = NOW()
      WHERE id = ? AND transaction_type = 'payment_initiated'
    `, [insertResult.insertId]);

    res.json(formatResponse(true, 'Nagad payment created successfully', { nagad_url: paymentResult.nagadURL }));
  } catch (error) {
    console.error('[Nagad] HMS public-request error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
});

module.exports = router;
