const express = require('express');
const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { syncPaymentToHMSAccounts } = require('../utils/hms-sync');
const { verifyToken } = require('../middleware/auth');
const { sendBookingPaidSms } = require('../utils/sms');
const BkashPaymentGateway = require('../utils/bkash-gateway');

const router = express.Router();

// Initialize bKash gateway
const bkashGateway = new BkashPaymentGateway();
bkashGateway.initialize().catch(console.error);

// =============================================
// CREATE BKASH PAYMENT
// =============================================
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { booking_id, amount, customer_info } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json(
        formatResponse(false, 'Booking ID and amount are required')
      );
    }

    // Verify booking exists and belongs to user
    const [bookings] = await pool.execute(`
      SELECT b.*, p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ? AND b.guest_id = ?
    `, [booking_id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found')
      );
    }

    const booking = bookings[0];

    // Check if booking is already paid
    if (booking.payment_status === 'paid') {
      return res.status(400).json(
        formatResponse(false, 'Booking is already paid')
      );
    }

    // CRITICAL: Check if owner has accepted booking request before allowing payment
    const [drPayments] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
    `, [booking_id]);

    if (drPayments.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Property owner must accept booking request before payment can be initiated')
      );
    }

    // Create bKash payment
    const paymentResult = await bkashGateway.createPayment(
      amount, 
      booking_id, 
      customer_info || {}
    );

    if (!paymentResult.success) {
      return res.status(400).json(
        formatResponse(false, 'Failed to create bKash payment', null, paymentResult.error)
      );
    }

    // If an initiation record already exists for this gateway transaction, skip creating another
    const [existingInit] = await pool.execute(`
      SELECT id FROM payments WHERE gateway_transaction_id = ? AND transaction_type = 'payment_initiated'
    `, [paymentResult.paymentID]);

    if (existingInit.length > 0) {
      return res.json(formatResponse(true, 'bKash payment already initiated', {
        payment_id: paymentResult.paymentID,
        bkash_url: paymentResult.bkashURL,
        amount: amount,
        booking_reference: booking.booking_reference,
        property_title: booking.property_title,
        is_demo: paymentResult.isDemo,
        bkash_token: bkashGateway.accessToken
      }));
    }

    // Store payment record - payment_initiated should NEVER create dr_amount or cr_amount
    // This is just a tracking marker, not an accounting entry
    const paymentReference = `BKASH_${paymentResult.paymentID}`;
    
    // CRITICAL: Use INSERT ... SET syntax and immediately UPDATE to force dr_amount=0
    // This ensures no database default or trigger can override our 0 value
    const [insertResult] = await pool.execute(`
      INSERT INTO payments SET
        booking_id = ?,
        amount = ?,
        dr_amount = 0,
        cr_amount = 0,
        payment_method = 'bkash',
        payment_reference = ?,
        status = 'pending',
        payment_type = 'booking',
        transaction_type = 'payment_initiated',
        notes = 'bKash payment initiated',
        gateway_transaction_id = ?,
        created_at = NOW()
    `, [booking_id, amount, paymentReference, paymentResult.paymentID]);
    
    const insertedPaymentId = insertResult.insertId;
    
    // IMMEDIATELY force dr_amount and cr_amount to 0 (in case of any trigger or default)
    await pool.execute(`
      UPDATE payments 
      SET dr_amount = 0, cr_amount = 0, updated_at = NOW()
      WHERE id = ? AND transaction_type = 'payment_initiated'
    `, [insertedPaymentId]);
    
    // IMMEDIATELY verify and fix if needed - force dr_amount and cr_amount to 0
    const [verifyPayment] = await pool.execute(`
      SELECT id, dr_amount, cr_amount, transaction_type, amount
      FROM payments 
      WHERE id = ?
    `, [insertedPaymentId]);
    
    if (verifyPayment.length > 0) {
      const payment = verifyPayment[0];
      const drAmount = parseFloat(payment.dr_amount || 0);
      const crAmount = parseFloat(payment.cr_amount || 0);
      
      // CRITICAL: Force dr_amount and cr_amount to 0 for payment_initiated
      if (drAmount > 0 || crAmount > 0) {
        console.error(`ERROR: payment_initiated entry (ID: ${payment.id}) has dr_amount=${drAmount} or cr_amount=${crAmount}! Force fixing...`);
        await pool.execute(`
          UPDATE payments 
          SET dr_amount = 0, cr_amount = 0, updated_at = NOW()
          WHERE id = ? AND transaction_type = 'payment_initiated'
        `, [payment.id]);
        console.log(`Fixed payment_initiated entry ${payment.id} - forced dr_amount and cr_amount to 0`);
      }
      
      // Double verification after fix
      const [reVerify] = await pool.execute(`
        SELECT dr_amount, cr_amount FROM payments WHERE id = ?
      `, [payment.id]);
      
      if (reVerify.length > 0 && (parseFloat(reVerify[0].dr_amount || 0) > 0 || parseFloat(reVerify[0].cr_amount || 0) > 0)) {
        console.error(`CRITICAL ERROR: Failed to fix payment_initiated entry ${payment.id}! Manual intervention required.`);
      }
    }

    res.json(formatResponse(true, 'bKash payment created successfully', {
      payment_id: paymentResult.paymentID,
      bkash_url: paymentResult.bkashURL,
      amount: amount,
      booking_reference: booking.booking_reference,
      property_title: booking.property_title,
      is_demo: paymentResult.isDemo,
      bkash_token: bkashGateway.accessToken
    }));

  } catch (error) {
    console.error('Create bKash payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create bKash payment', null, error.message)
    );
  }
});

// =============================================
// EXECUTE BKASH PAYMENT
// =============================================
router.post('/execute', verifyToken, async (req, res) => {
  try {
    const { payment_id, points_to_redeem } = req.body;

    if (!payment_id) {
      return res.status(400).json(
        formatResponse(false, 'Payment ID is required')
      );
    }

    // Execute bKash payment
    const executeResult = await bkashGateway.executePayment(payment_id);

    if (!executeResult.success) {
      return res.status(400).json(
        formatResponse(false, 'Failed to execute bKash payment', null, executeResult.error)
      );
    }

    // Find the payment record
    const [payments] = await pool.execute(`
      SELECT p.*, b.guest_id, b.total_amount
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.gateway_transaction_id = ? AND p.status = 'pending'
    `, [payment_id]);

    if (payments.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Payment record not found')
      );
    }

    const payment = payments[0];

    // If the payment is already marked as completed, return success early
    if (payment.status === 'completed') {
      return res.json(formatResponse(true, 'bKash payment executed successfully (already completed)', {
        transaction_id: payment.payment_reference,
        amount: payment.amount,
        currency: 'BDT',
        payment_status: 'completed',
        booking_id: payment.booking_id
      }));
    }

    // Verify payment belongs to user
    if (payment.guest_id !== req.user.id) {
      return res.status(403).json(
        formatResponse(false, 'Access denied')
      );
    }

    // CRITICAL: If this is payment_initiated, ensure dr_amount and cr_amount are 0
    // Fix any database trigger or default that might have set dr_amount = amount
    if (payment.transaction_type === 'payment_initiated') {
      const drAmount = parseFloat(payment.dr_amount || 0);
      const crAmount = parseFloat(payment.cr_amount || 0);
      
      if (drAmount > 0 || crAmount > 0) {
        console.error(`CRITICAL: payment_initiated entry (ID: ${payment.id}) has dr_amount=${drAmount}! Force fixing before execute...`);
        await pool.execute(`
          UPDATE payments 
          SET dr_amount = 0, cr_amount = 0, updated_at = NOW()
          WHERE id = ? AND transaction_type = 'payment_initiated'
        `, [payment.id]);
        
        // Re-fetch to verify
        const [reFetch] = await pool.execute(`SELECT dr_amount, cr_amount FROM payments WHERE id = ?`, [payment.id]);
        if (reFetch.length > 0 && (parseFloat(reFetch[0].dr_amount || 0) > 0 || parseFloat(reFetch[0].cr_amount || 0) > 0)) {
          console.error(`CRITICAL ERROR: Failed to fix payment_initiated entry ${payment.id}!`);
        }
      }
    }

    // Update payment status to completed
    // CRITICAL: If this is a payment_initiated entry, ensure dr_amount and cr_amount remain 0
    if (payment.transaction_type === 'payment_initiated') {
      await pool.execute(`
        UPDATE payments 
        SET status = 'completed', 
            processed_at = NOW(),
            gateway_response = ?,
            dr_amount = 0,
            cr_amount = 0,
            gateway_transaction_id = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [JSON.stringify(executeResult), executeResult.transactionID || null, payment.id]);
    } else {
      await pool.execute(`
        UPDATE payments 
        SET status = 'completed', 
            processed_at = NOW(),
            gateway_response = ?,
            gateway_transaction_id = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [JSON.stringify(executeResult), executeResult.transactionID || null, payment.id]);
    }

    // Get booking details and verify owner acceptance
    const [bookingData] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [payment.booking_id]);

    if (bookingData.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found')
      );
    }

    const booking = bookingData[0];

    // CRITICAL: Check if owner has accepted booking request (DR entry must exist)
    const [drPayments] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
    `, [payment.booking_id]);

    if (drPayments.length === 0) {
      return res.status(400).json(
        formatResponse(false, 'Property owner must accept booking request before payment can be processed')
      );
    }

    // Check if CR entry already exists (prevent duplicate)
    const [existingCrPayments] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'guest_payment' AND cr_amount > 0
    `, [payment.booking_id]);

    // Only create CR entry if it doesn't exist
    if (existingCrPayments.length === 0) {
      // Handle rewards points redemption if applicable
      let finalAmount = booking.total_amount;
      let pointsRedeemed = 0;
      let pointsDiscount = 0;

      if (points_to_redeem && points_to_redeem > 0) {
        try {
          const { redeemPointsForBooking } = require('../utils/rewardsPoints');
          const redemptionResult = await redeemPointsForBooking(req.user.id, points_to_redeem, payment.booking_id);
          pointsRedeemed = redemptionResult.pointsRedeemed;
          pointsDiscount = redemptionResult.discountAmount;
          finalAmount = Math.max(0, booking.total_amount - pointsDiscount);
          console.log(`Points redeemed: ${pointsRedeemed} points = BDT ${pointsDiscount}, Final amount: BDT ${finalAmount}`);
        } catch (pointsError) {
          console.error('Points redemption error:', pointsError);
          // Continue with payment even if points redemption fails
        }
      }

      // CRITICAL: Verify no duplicate DR entries exist before creating CR
      const [allDrPayments] = await pool.execute(`
        SELECT id, transaction_type, dr_amount 
        FROM payments 
        WHERE booking_id = ? AND dr_amount > 0
      `, [payment.booking_id]);
      
      // Count owner_accepted DR entries (should be exactly 1)
      const ownerAcceptedDrCount = allDrPayments.filter(p => p.transaction_type === 'owner_accepted').length;
      
      if (ownerAcceptedDrCount > 1) {
        console.error(`CRITICAL ERROR: Multiple owner_accepted DR entries found for booking ${payment.booking_id}!`);
        // Keep the first one, delete duplicates
        const ownerAcceptedDrs = allDrPayments.filter(p => p.transaction_type === 'owner_accepted');
        for (let i = 1; i < ownerAcceptedDrs.length; i++) {
          console.error(`Deleting duplicate DR entry ${ownerAcceptedDrs[i].id}`);
          await pool.execute(`DELETE FROM payments WHERE id = ?`, [ownerAcceptedDrs[i].id]);
        }
      }
      
      // Create CR entry for admin (money received from guest)
      // CRITICAL: Use INSERT ... SET and immediately UPDATE to ensure dr_amount=0
      const crReference = `CR-${Date.now()}-${payment.booking_id}`;
      const [crInsertResult] = await pool.execute(`
        INSERT INTO payments SET
          booking_id = ?,
          payment_reference = ?,
          payment_method = 'bkash',
          payment_type = 'booking',
          amount = ?,
          dr_amount = 0,
          cr_amount = ?,
          transaction_type = 'guest_payment',
          gateway_transaction_id = ?,
          notes = ?,
          status = 'completed',
          payment_date = NOW(),
          created_at = NOW()
      `, [
        payment.booking_id,
        crReference,
        finalAmount,
        finalAmount,
        executeResult.transactionID || null,
        `Guest payment received via bKash - Total: ৳${booking.total_amount}${pointsDiscount > 0 ? `, Points discount: ৳${pointsDiscount.toFixed(2)}` : ''}`
      ]);

      // Update booking with points redeemed info
      if (pointsRedeemed > 0) {
        await pool.execute(`
          UPDATE bookings 
          SET points_redeemed = ?, points_discount = ?, updated_at = NOW()
          WHERE id = ?
        `, [pointsRedeemed, pointsDiscount, payment.booking_id]);
      }
      
      // IMMEDIATELY force dr_amount to 0 (in case of any trigger or default)
      await pool.execute(`
        UPDATE payments 
        SET dr_amount = 0, updated_at = NOW()
        WHERE id = ? AND transaction_type = 'guest_payment'
      `, [crInsertResult.insertId]);
      
      // Verify CR entry doesn't have dr_amount > 0
      const [verifyCr] = await pool.execute(`
        SELECT id, dr_amount, cr_amount FROM payments WHERE id = ?
      `, [crInsertResult.insertId]);
      
      if (verifyCr.length > 0 && parseFloat(verifyCr[0].dr_amount || 0) > 0) {
        console.error(`CRITICAL: CR entry has dr_amount > 0! Fixing...`);
        await pool.execute(`
          UPDATE payments 
          SET dr_amount = 0, updated_at = NOW()
          WHERE id = ? AND transaction_type = 'guest_payment'
        `, [verifyCr[0].id]);
      }
      
      // Update DR entry status to completed
      await pool.execute(`
        UPDATE payments
        SET status = 'completed',
            updated_at = NOW()
        WHERE booking_id = ? 
        AND transaction_type = 'owner_accepted'
        AND dr_amount > 0
      `, [payment.booking_id]);

      // Update booking payment status and confirm booking
      await pool.execute(`
        UPDATE bookings 
        SET payment_status = 'paid', 
            status = 'confirmed',
            confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, [payment.booking_id]);

      try {
        await sendBookingPaidSms(payment.booking_id);
      } catch (smsErr) {
        console.error(`Failed to send payment confirmation SMS for booking ${payment.booking_id}:`, smsErr.message);
      }

      // Mark admin commission as paid (all payments go to admin)
      await pool.execute(`
        UPDATE admin_earnings 
        SET payment_status = 'paid', 
            payment_date = NOW(),
            updated_at = NOW()
        WHERE booking_id = ? 
        AND payment_status = 'pending'
      `, [payment.booking_id]);

      // Award rewards points for completed payment
      try {
        // Get booking details for guest_id
        const [bookingData] = await pool.execute(`
          SELECT guest_id, total_amount FROM bookings WHERE id = ?
        `, [payment.booking_id]);

        if (bookingData.length > 0) {
          const booking = bookingData[0];
          console.log(`=== BKASH PAYMENT: AWARDING POINTS ===`);
          console.log(`Booking ID: ${payment.booking_id}`);
          console.log(`Guest ID: ${booking.guest_id}`);
          console.log(`Booking Amount: ${booking.total_amount}`);

          // Check if points were already awarded for this booking
          const [existingPointsTransaction] = await pool.execute(`
            SELECT id FROM rewards_point_transactions 
            WHERE booking_id = ? AND transaction_type = 'earned'
          `, [payment.booking_id]);

          if (existingPointsTransaction.length === 0) {
            const { awardPointsForBooking } = require('../utils/rewardsPoints');
            const result = await awardPointsForBooking(booking.guest_id, booking.total_amount, payment.booking_id);
            console.log(`✅ Points awarded: ${result.pointsAwarded} for booking ${payment.booking_id}`);
          } else {
            console.log(`⚠️ Points already awarded for booking ${payment.booking_id}`);
          }
        }
      } catch (pointsError) {
        console.error('❌ Points awarding error in bKash execute:', pointsError);
        // Continue even if points awarding fails
      }

      // Sync to HMS Accounts
      try {
        await syncPaymentToHMSAccounts(crInsertResult.insertId);
      } catch (hmsError) {
        console.error('HMS Sync error in bKash execute:', hmsError);
      }
    }

    res.json(formatResponse(true, 'bKash payment executed successfully', {
      transaction_id: executeResult.transactionID,
      amount: executeResult.amount,
      currency: executeResult.currency,
      payment_status: 'completed',
      booking_id: payment.booking_id,
      is_demo: executeResult.isDemo,
      bkash_token: bkashGateway.accessToken
    }));

  } catch (error) {
    console.error('Execute bKash payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to execute bKash payment', null, error.message)
    );
  }
});

// =============================================
// QUERY BKASH PAYMENT STATUS
// =============================================
router.get('/status/:payment_id', verifyToken, async (req, res) => {
  try {
    const { payment_id } = req.params;

    // Query bKash payment status
    const queryResult = await bkashGateway.queryPayment(payment_id);

    if (!queryResult.success) {
      return res.status(400).json(
        formatResponse(false, 'Failed to query bKash payment', null, queryResult.error)
      );
    }

    // Get payment record from database
    const [payments] = await pool.execute(`
      SELECT p.*, b.booking_reference, b.total_amount
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.gateway_transaction_id = ? AND b.guest_id = ?
    `, [payment_id, req.user.id]);

    if (payments.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Payment record not found')
      );
    }

    const payment = payments[0];

    res.json(formatResponse(true, 'bKash payment status retrieved', {
      payment_id: payment_id,
      transaction_id: queryResult.transactionID,
      amount: queryResult.amount,
      currency: queryResult.currency,
      transaction_status: queryResult.transactionStatus,
      payment_status: payment.status,
      booking_reference: payment.booking_reference,
      is_demo: queryResult.isDemo
    }));

  } catch (error) {
    console.error('Query bKash payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to query bKash payment', null, error.message)
    );
  }
});

// =============================================
// SHARED BKASH PAYMENT COMPLETION HELPER
// Called by both /callback and /simulate-demo
// =============================================
async function completeBkashPayment(payment, executeResult, res, bookingId) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    // Get booking details
    const [bookingData] = await pool.execute(`
      SELECT b.*, p.owner_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [bookingId]);

    if (bookingData.length === 0) {
      console.error(`Callback: Booking ${bookingId} not found`);
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Booking+not+found`);
    }

    const booking = bookingData[0];

    // Check booking isn't already paid (idempotency)
    if (booking.payment_status === 'paid') {
      return res.redirect(`${frontendUrl}/booking-confirmation/${bookingId}`);
    }

    // Check owner acceptance
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

    // Check if CR entry already exists (prevent duplicate)
    const [existingCrPayments] = await pool.execute(`
      SELECT id FROM payments 
      WHERE booking_id = ? AND transaction_type = 'guest_payment' AND cr_amount > 0
    `, [bookingId]);

    if (existingCrPayments.length === 0) {
      // Clean up duplicate DR entries if any
      const [allDrPayments] = await pool.execute(`
        SELECT id, transaction_type, dr_amount 
        FROM payments 
        WHERE booking_id = ? AND dr_amount > 0
      `, [bookingId]);

      const ownerAcceptedDrs = allDrPayments.filter(p => p.transaction_type === 'owner_accepted');
      if (ownerAcceptedDrs.length > 1) {
        for (let i = 1; i < ownerAcceptedDrs.length; i++) {
          await pool.execute(`DELETE FROM payments WHERE id = ?`, [ownerAcceptedDrs[i].id]);
        }
      }

      // Create CR entry (money received from guest)
      const crReference = `CR-${Date.now()}-${bookingId}`;
      const txnNotes = executeResult.isDemo
        ? `Guest payment received via bKash (Demo) - Total: ৳${booking.total_amount}`
        : `Guest payment received via bKash TXN:${executeResult.transactionID} - Total: ৳${booking.total_amount}`;

      const [crInsertResult] = await pool.execute(`
        INSERT INTO payments SET
          booking_id = ?,
          payment_reference = ?,
          payment_method = 'bkash',
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

      // Force dr_amount = 0 in case of triggers
      await pool.execute(`
        UPDATE payments SET dr_amount = 0, updated_at = NOW()
        WHERE id = ? AND transaction_type = 'guest_payment'
      `, [crInsertResult.insertId]);

      // Update DR entry status to completed
      await pool.execute(`
        UPDATE payments
        SET status = 'completed', updated_at = NOW()
        WHERE booking_id = ? AND transaction_type = 'owner_accepted' AND dr_amount > 0
      `, [bookingId]);

      // Confirm booking as paid
      await pool.execute(`
        UPDATE bookings 
        SET payment_status = 'paid', status = 'confirmed',
            confirmed_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [bookingId]);

      // Send SMS
      try {
        await sendBookingPaidSms(bookingId);
      } catch (smsErr) {
        console.error(`SMS error for booking ${bookingId}:`, smsErr.message);
      }

      // Mark admin commission as paid
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
          console.log(`✅ Points awarded: ${result.pointsAwarded} for booking ${bookingId}`);
        }
      } catch (pointsError) {
        console.error('Points awarding error in bKash callback:', pointsError);
      }

      // Sync to HMS Accounts
      try {
        await syncPaymentToHMSAccounts(crInsertResult.insertId);
      } catch (hmsError) {
        console.error('HMS Sync error in bKash callback:', hmsError);
      }
    }

    // Redirect browser to confirmation page
    return res.redirect(`${frontendUrl}/booking-confirmation/${bookingId}`);

  } catch (err) {
    console.error('completeBkashPayment error:', err);
    return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+processing+error`);
  }
}

// =============================================
// BKASH DEMO SIMULATION ENDPOINT
// When credentials are empty, bkashURL points here instead of real bKash
// =============================================
router.get('/simulate-demo', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    const { paymentID, bookingId } = req.query;

    if (!paymentID || !bookingId) {
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Missing+payment+parameters`);
    }

    console.log(`bKash demo simulation: paymentID=${paymentID}, bookingId=${bookingId}`);

    // Find the payment_initiated record for this paymentID
    const [payments] = await pool.execute(`
      SELECT p.*, b.guest_id
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.gateway_transaction_id = ? AND p.transaction_type = 'payment_initiated'
    `, [paymentID]);

    if (payments.length === 0) {
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+record+not+found`);
    }

    const payment = payments[0];

    // Execute (simulated) payment via gateway
    await bkashGateway.initialize();
    const executeResult = await bkashGateway.executePayment(paymentID);

    if (!executeResult.success) {
      return res.redirect(`${frontendUrl}/payment/${payment.booking_id}?payment=fail&error=Demo+execution+failed`);
    }

    // Complete the booking using the shared helper
    await completeBkashPayment(payment, executeResult, res, payment.booking_id);

  } catch (error) {
    console.error('bKash demo simulation error:', error);
    res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Simulation+error`);
  }
});

// =============================================
// BKASH PAYMENT CALLBACK (browser redirect from bKash hosted page)
// =============================================
router.get('/callback', async (req, res) => {

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    // bKash sends paymentID and status as query string params on the browser redirect
    const { paymentID, status } = req.query;

    console.log('bKash browser callback received:', req.query);

    if (!paymentID) {
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Missing+paymentID`);
    }

    // Find payment record
    const [payments] = await pool.execute(`
      SELECT p.*, b.guest_id
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.gateway_transaction_id = ?
    `, [paymentID]);

    if (payments.length === 0) {
      console.error(`bKash callback: No payment record found for paymentID=${paymentID}`);
      return res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+record+not+found`);
    }

    const payment = payments[0];

    // If the payment is already marked as completed, just redirect to the success page directly
    if (payment.status === 'completed') {
      console.log(`bKash callback: Payment ${paymentID} is already completed. Redirecting to success.`);
      return res.redirect(`${frontendUrl}/payment/${payment.booking_id}?payment=success`);
    }

    // Handle failure or cancellation
    if (status === 'failure' || status === 'cancel' || status === 'failed' || status === 'cancelled') {
      await pool.execute(`
        UPDATE payments 
        SET status = 'failed', gateway_response = ?, updated_at = NOW()
        WHERE id = ?
      `, [JSON.stringify(req.query), payment.id]);
      return res.redirect(`${frontendUrl}/payment/${payment.booking_id}?payment=fail&error=bKash+payment+${status}`);
    }

    // For success, execute the payment with bKash API to confirm the transaction
    await bkashGateway.initialize();
    const executeResult = await bkashGateway.executePayment(paymentID);

    if (!executeResult.success) {
      console.error(`bKash execute failed for paymentID=${paymentID}:`, executeResult.error);
      await pool.execute(`
        UPDATE payments 
        SET status = 'failed', gateway_response = ?, updated_at = NOW()
        WHERE id = ?
      `, [JSON.stringify({ error: executeResult.error, query: req.query }), payment.id]);
      return res.redirect(`${frontendUrl}/payment/${payment.booking_id}?payment=fail&error=bKash+execution+failed`);
    }

    // Payment executed successfully — complete booking
    await completeBkashPayment(payment, executeResult, res, payment.booking_id);

  } catch (error) {
    console.error('bKash callback error:', error);
    res.redirect(`${frontendUrl}/guest/bookings?payment=fail&error=Payment+processing+error`);
  }
});


// =============================================
// GET BKASH SETTINGS (for frontend)
// =============================================
router.get('/settings', async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('bkash_enabled', 'bkash_mode', 'bkash_currency')
    `);

    const bkashSettings = {};
    settings.forEach(setting => {
      bkashSettings[setting.setting_key] = setting.setting_value;
    });

    res.json(formatResponse(true, 'bKash settings retrieved', {
      enabled: bkashSettings.bkash_enabled === 'true',
      mode: bkashSettings.bkash_mode || 'sandbox',
      currency: bkashSettings.bkash_currency || 'BDT'
    }));

  } catch (error) {
    console.error('Get bKash settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve bKash settings', null, error.message)
    );
  }
});

// Public HMS bKash Payment Request
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

    // Create bKash payment
    const paymentResult = await bkashGateway.createPayment(
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
        formatResponse(false, 'Failed to create bKash payment', null, paymentResult.error)
      );
    }

    // Store payment initiated marker
    const paymentReference = `BKASH_${paymentResult.paymentID}`;
    await pool.execute(`
      INSERT INTO payments SET
        booking_id = ?,
        payment_reference = ?,
        payment_method = 'bkash',
        payment_type = 'online',
        transaction_type = 'payment_initiated',
        status = 'pending',
        gateway_transaction_id = ?,
        notes = 'bKash payment initiated for HMS booking via link',
        payment_date = NOW(),
        cr_amount = 0,
        dr_amount = 0
    `, [booking.id, paymentReference, paymentResult.paymentID]);

    res.json(formatResponse(true, 'bKash payment initiated', { bkash_url: paymentResult.bkashURL, bkash_token: bkashGateway.accessToken }));
  } catch (error) {
    console.error('[bKash] HMS public-request error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
});

module.exports = router;
