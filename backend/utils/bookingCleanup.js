const { pool } = require('../config/database');
const { sendSMS } = require('./sms');

/**
 * Auto-cancel bookings where payment_deadline has passed and payment is not completed
 * This should be run periodically (e.g., every minute via cron or setInterval)
 */
const cancelExpiredBookings = async () => {
  try {
    console.log('Running booking cleanup: Checking for expired bookings...');

    // Find bookings where:
    // 1. status is 'pending'
    // 2. confirmed_at is NOT NULL (owner has accepted)
    // 3. payment_deadline < NOW() (deadline has passed)
    // 4. No completed payment exists for this booking
    const [expiredBookings] = await pool.execute(`
      SELECT 
        b.id, 
        b.booking_reference, 
        b.guest_id, 
        b.property_id, 
        b.total_amount,
        b.check_in_date,
        b.check_out_date,
        p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.status = 'pending'
        AND b.confirmed_at IS NOT NULL
        AND b.payment_deadline IS NOT NULL
        AND b.payment_deadline < NOW()
        AND NOT EXISTS (
          SELECT 1 
          FROM payments p 
          WHERE p.booking_id = b.id 
            AND p.payment_type = 'booking'
            AND p.status IN ('completed', 'paid')
        )
    `);

    if (expiredBookings.length === 0) {
      console.log('No expired bookings found.');
      return { cancelled: 0, bookings: [] };
    }

    console.log(`Found ${expiredBookings.length} expired booking(s) to cancel.`);

    const cancelledBookings = [];

    for (const booking of expiredBookings) {
      try {
        // Cancel the booking
        await pool.execute(`
          UPDATE bookings
          SET status = 'cancelled',
              cancellation_reason = 'Payment deadline expired - booking automatically cancelled',
              cancelled_at = NOW(),
              updated_at = NOW()
          WHERE id = ?
        `, [booking.id]);

        // Also cancel any pending payments for this booking
        await pool.execute(`
          UPDATE payments
          SET status = 'cancelled',
              updated_at = NOW()
          WHERE booking_id = ?
            AND status IN ('pending', 'processing')
        `, [booking.id]);

        // Get guest phone number from users table
        let guestPhone = null;
        let guestName = '';
        try {
          console.log(`Looking up guest info for booking ${booking.booking_reference} (Guest ID: ${booking.guest_id})`);
          const [guestUsers] = await pool.execute(
            `SELECT first_name, last_name, phone 
             FROM users 
             WHERE id = ? 
             LIMIT 1`,
            [booking.guest_id]
          );

          if (guestUsers.length > 0) {
            const guestUser = guestUsers[0];
            guestPhone = guestUser.phone;
            const parts = [guestUser.first_name, guestUser.last_name].filter(Boolean);
            guestName = parts.join(' ') || 'Guest';
            console.log(`Guest found: ${guestName}, Phone: ${guestPhone || 'NOT SET'}`);
          } else {
            console.warn(`Guest not found in users table for booking ${booking.booking_reference} (Guest ID: ${booking.guest_id})`);
          }
        } catch (lookupError) {
          console.error(`❌ Failed to lookup guest info for SMS (booking ${booking.id}):`, lookupError.message || lookupError);
          console.error('Lookup Error Stack:', lookupError.stack);
        }

        // Send SMS to guest about cancellation
        if (guestPhone) {
          const propertyTitle = booking.property_title || 'the property';
          const checkInDate = booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : '';
          const message = `Hi ${guestName || 'Guest'}, your booking request (${booking.booking_reference}) for ${propertyTitle}${checkInDate ? ` (Check-in: ${checkInDate})` : ''} has been automatically cancelled as payment was not completed within the deadline. The property is now available for other guests.`;

          console.log(`Attempting to send cancellation SMS to guest ${guestName} (Phone: ${guestPhone}) for booking ${booking.booking_reference}`);

          try {
            const smsResult = await sendSMS({
              to: guestPhone,
              message
            });

            if (smsResult.success) {
              console.log(`✅ SMS sent successfully to guest for cancelled booking ${booking.booking_reference} (Phone: ${guestPhone})`);
            } else {
              if (smsResult.skipped) {
                console.warn(`⚠️ SMS skipped for booking ${booking.booking_reference}: ${smsResult.reason || 'Unknown reason'}`);
              } else {
                console.error(`❌ Failed to send cancellation SMS for booking ${booking.booking_reference}: ${smsResult.error || 'Unknown error'}`);
              }
            }
          } catch (smsError) {
            console.error(`❌ Exception while sending cancellation SMS for booking ${booking.id}:`, smsError.message || smsError);
            console.error('SMS Error Stack:', smsError.stack);
          }
        } else {
          console.warn(`⚠️ Skipping SMS for cancelled booking ${booking.id} (${booking.booking_reference}): missing guest phone number. Guest ID: ${booking.guest_id}`);
        }

        cancelledBookings.push({
          id: booking.id,
          reference: booking.booking_reference
        });

        console.log(`Cancelled booking ${booking.booking_reference} (ID: ${booking.id}) - Payment deadline expired.`);
      } catch (error) {
        console.error(`Error cancelling booking ${booking.id}:`, error.message);
      }
    }

    console.log(`Successfully cancelled ${cancelledBookings.length} expired booking(s).`);

    return {
      cancelled: cancelledBookings.length,
      bookings: cancelledBookings
    };

  } catch (error) {
    console.error('Error in booking cleanup:', error);
    throw error;
  }
};

module.exports = {
  cancelExpiredBookings
};

