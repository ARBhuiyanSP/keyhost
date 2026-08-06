const { pool } = require('../config/database');
const { sendSMS } = require('./sms');

/**
 * Auto-cancel bookings where payment_deadline has passed and payment is not completed
 * This should be run periodically (e.g., every minute via cron or setInterval)
 */
const cancelExpiredBookings = async () => {
  try {
    console.log('Running booking cleanup: Checking for expired bookings...');

    const [expiredBookings] = await pool.execute(`
      SELECT 
        b.id, 
        b.booking_reference, 
        b.guest_id, 
        b.property_id, 
        b.total_amount,
        b.check_in_date,
        b.check_out_date,
        b.guest_name,
        b.guest_phone,
        p.title as property_title,
        po_u.first_name as owner_first_name,
        po_u.last_name as owner_last_name,
        po_u.phone as owner_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users po_u ON po.user_id = po_u.id
      WHERE b.status = 'request_accepted'
        AND b.confirmed_at IS NOT NULL
        AND b.payment_deadline IS NOT NULL
        AND b.payment_deadline < NOW()
        AND NOT EXISTS (
          SELECT 1 
          FROM payments p 
          WHERE p.booking_id = b.id 
            AND p.transaction_type = 'guest_payment'
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
        await pool.execute(`
          UPDATE bookings
          SET status = 'cancelled',
              cancellation_reason = 'Payment deadline expired - booking automatically cancelled',
              cancelled_at = NOW(),
              updated_at = NOW()
          WHERE id = ?
        `, [booking.id]);

        await pool.execute(`
          UPDATE payments
          SET status = 'cancelled',
              updated_at = NOW()
          WHERE booking_id = ?
            AND status IN ('pending', 'processing', 'completed')
        `, [booking.id]);

        let guestPhone = null;
        let guestName = '';

        const isPhoneValid = (phone) => {
          if (!phone) return false;
          const cleaned = String(phone).trim();
          return cleaned.length >= 5 && !cleaned.toLowerCase().startsWith('g-');
        };

        if (isPhoneValid(booking.guest_phone)) {
          guestPhone = booking.guest_phone.trim();
          guestName = booking.guest_name || 'Guest';
        }

        if (!guestPhone) {
          try {
            const [guestUsers] = await pool.execute(
              `SELECT first_name, last_name, phone FROM users WHERE id = ? LIMIT 1`,
              [booking.guest_id]
            );
            if (guestUsers.length > 0) {
              const guestUser = guestUsers[0];
              if (isPhoneValid(guestUser.phone)) {
                guestPhone = guestUser.phone.trim();
              }
              guestName = booking.guest_name || [guestUser.first_name, guestUser.last_name].filter(Boolean).join(' ') || 'Guest';
            }
          } catch (lookupError) {
            console.error(`Failed to lookup guest info for booking ${booking.id}:`, lookupError.message);
          }
        }

        if (guestPhone) {
          const propertyTitle = booking.property_title || 'the property';
          const checkInDate = booking.check_in_date
            ? new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '';
          const message = `Hi ${guestName || 'Guest'}, your booking request (${booking.booking_reference}) for ${propertyTitle}${checkInDate ? ` (Check-in: ${checkInDate})` : ''} has been automatically cancelled as payment was not completed within the deadline. The property is now available for other guests.`;

          try {
            await sendSMS({ to: guestPhone, message });
          } catch (smsError) {
            console.error(`SMS error for booking ${booking.id}:`, smsError.message);
          }
        } else {
          console.warn(`[Auto-Cancel] Skipping Guest SMS for booking ${booking.booking_reference}: No valid phone number found.`);
        }

        // Notify host via SMS
        try {
          if (booking.owner_phone && isPhoneValid(booking.owner_phone)) {
            const ownerName = [booking.owner_first_name, booking.owner_last_name].filter(Boolean).join(' ') || 'Host';
            const checkInDate = booking.check_in_date
              ? new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '';
            const hostMsg = `Hi ${ownerName}, booking request ${booking.booking_reference}${checkInDate ? ` (Check-in: ${checkInDate})` : ''} for "${booking.property_title || 'your property'}" was automatically cancelled because the guest did not complete the payment within the deadline. The property is now available for other bookings. – Keyhost`;
            await sendSMS({ to: booking.owner_phone.trim(), message: hostMsg }).catch(err =>
              console.error(`[Auto-Cancel] Host SMS failed for ${booking.booking_reference}:`, err.message)
            );
          } else {
            console.warn(`[Auto-Cancel] Skipping Host SMS for booking ${booking.booking_reference}: Host phone number is invalid or missing.`);
          }
        } catch (smsErr) {
          console.error(`[Auto-Cancel] Failed to notify host for booking ${booking.id}:`, smsErr.message);
        }

        cancelledBookings.push({ id: booking.id, reference: booking.booking_reference });
        console.log(`Cancelled booking ${booking.booking_reference} (ID: ${booking.id}) - Payment deadline expired.`);
      } catch (error) {
        console.error(`Error cancelling booking ${booking.id}:`, error.message);
      }
    }

    console.log(`Successfully cancelled ${cancelledBookings.length} expired booking(s).`);
    return { cancelled: cancelledBookings.length, bookings: cancelledBookings };

  } catch (error) {
    console.error('Error in booking cleanup:', error);
    throw error;
  }
};

/**
 * Auto-cancel pending bookings that the host has NOT accepted within the timeout period.
 * Timeout is configurable via system_settings key: pending_booking_timeout_minutes (default 1440m).
 */
const cancelUnacceptedBookings = async () => {
  try {
    // Read timeout from system_settings (fallback to 1440 minutes / 24 hours)
    const [rows] = await pool.execute(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'pending_booking_timeout_minutes' LIMIT 1`
    );
    const timeoutMinutes = rows.length > 0 ? (parseFloat(rows[0].setting_value) || 1440) : 1440;

    console.log(`[Auto-Cancel] Checking for pending bookings unaccepted for more than ${timeoutMinutes}m...`);

    // Find pending bookings where host hasn't accepted (confirmed_at IS NULL)
    // and the booking is older than the timeout
    const [unacceptedBookings] = await pool.execute(`
      SELECT
        b.id,
        b.booking_reference,
        b.guest_id,
        b.property_id,
        b.total_amount,
        b.check_in_date,
        b.created_at,
        b.guest_name,
        b.guest_phone,
        p.title          AS property_title,
        po_u.first_name  AS owner_first_name,
        po_u.last_name   AS owner_last_name,
        po_u.phone       AS owner_phone
      FROM bookings b
      JOIN properties    p   ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id   = po.id
      JOIN users          po_u ON po.user_id  = po_u.id
      WHERE b.status = 'pending'
        AND b.confirmed_at IS NULL
        AND b.created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)
    `, [timeoutMinutes]);

    if (unacceptedBookings.length === 0) {
      console.log('[Auto-Cancel] No unaccepted pending bookings found.');
      return { cancelled: 0, bookings: [] };
    }

    console.log(`[Auto-Cancel] Found ${unacceptedBookings.length} unaccepted booking(s) to cancel.`);

    const cancelledBookings = [];

    for (const booking of unacceptedBookings) {
      try {
        // 1. Cancel the booking
        await pool.execute(`
          UPDATE bookings
          SET status              = 'cancelled',
              cancellation_reason = ?,
              cancelled_at        = NOW(),
              updated_at          = NOW()
          WHERE id = ?
        `, [
          `Host did not respond within ${timeoutMinutes} minute(s) — booking automatically cancelled`,
          booking.id
        ]);

        // 2. Cancel any linked pending payments
        await pool.execute(`
          UPDATE payments
          SET status     = 'cancelled',
              updated_at = NOW()
          WHERE booking_id = ?
            AND status IN ('pending', 'processing')
        `, [booking.id]);

        // 3. Notify guest via SMS
        try {
          const isPhoneValid = (phone) => {
            if (!phone) return false;
            const cleaned = String(phone).trim();
            return cleaned.length >= 5 && !cleaned.toLowerCase().startsWith('g-');
          };

          let guestPhone = null;
          let guestName = '';

          if (isPhoneValid(booking.guest_phone)) {
            guestPhone = booking.guest_phone.trim();
            guestName = booking.guest_name || 'Guest';
          }

          if (!guestPhone) {
            const [guestUsers] = await pool.execute(
              `SELECT first_name, last_name, phone FROM users WHERE id = ? LIMIT 1`,
              [booking.guest_id]
            );
            if (guestUsers.length > 0) {
              const g = guestUsers[0];
              if (isPhoneValid(g.phone)) {
                guestPhone = g.phone.trim();
              }
              guestName = booking.guest_name || [g.first_name, g.last_name].filter(Boolean).join(' ') || 'Guest';
            }
          }

          if (guestPhone) {
            const checkInDate = booking.check_in_date
              ? new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '';
            const propertyTitle = booking.property_title || 'the property';
            const guestMsg = `Hi ${guestName}, your booking request (${booking.booking_reference}) for ${propertyTitle}${checkInDate ? ` (Check-in: ${checkInDate})` : ''} was automatically cancelled because the host did not respond within ${timeoutMinutes} minute(s). Please try another property. – Keyhost`;
            await sendSMS({ to: guestPhone, message: guestMsg }).catch(err =>
              console.error(`[Auto-Cancel] Guest SMS failed for ${booking.booking_reference}:`, err.message)
            );
          } else {
            console.warn(`[Auto-Cancel] Skipping Guest SMS for booking ${booking.booking_reference}: No valid phone number found.`);
          }
        } catch (smsErr) {
          console.error(`[Auto-Cancel] Failed to notify guest for booking ${booking.id}:`, smsErr.message);
        }

        // 4. Notify host via SMS
        try {
          const isPhoneValid = (phone) => {
            if (!phone) return false;
            const cleaned = String(phone).trim();
            return cleaned.length >= 5 && !cleaned.toLowerCase().startsWith('g-');
          };

          if (booking.owner_phone && isPhoneValid(booking.owner_phone)) {
            const ownerName   = [booking.owner_first_name, booking.owner_last_name].filter(Boolean).join(' ') || 'Host';
            const checkInDate = booking.check_in_date
              ? new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '';
            const hostMsg = `Hi ${ownerName}, booking request ${booking.booking_reference}${checkInDate ? ` (Check-in: ${checkInDate})` : ''} for "${booking.property_title || 'your property'}" was automatically cancelled as you did not respond within ${timeoutMinutes} minute(s). – Keyhost`;
            await sendSMS({ to: booking.owner_phone.trim(), message: hostMsg }).catch(err =>
              console.error(`[Auto-Cancel] Host SMS failed for ${booking.booking_reference}:`, err.message)
            );
          } else {
            console.warn(`[Auto-Cancel] Skipping Host SMS for booking ${booking.booking_reference}: Host phone number is invalid or missing.`);
          }
        } catch (smsErr) {
          console.error(`[Auto-Cancel] Failed to notify host for booking ${booking.id}:`, smsErr.message);
        }

        cancelledBookings.push({ id: booking.id, reference: booking.booking_reference });
        console.log(`[Auto-Cancel] ✅ Cancelled booking ${booking.booking_reference} (ID: ${booking.id}) — host did not respond within ${timeoutMinutes}m.`);

      } catch (err) {
        console.error(`[Auto-Cancel] Error cancelling booking ${booking.id}:`, err.message);
      }
    }

    console.log(`[Auto-Cancel] Done. Cancelled ${cancelledBookings.length} unaccepted booking(s).`);
    return { cancelled: cancelledBookings.length, bookings: cancelledBookings };

  } catch (error) {
    console.error('[Auto-Cancel] Fatal error in cancelUnacceptedBookings:', error);
    throw error;
  }
};

module.exports = {
  cancelExpiredBookings,
  cancelUnacceptedBookings
};
