const { pool } = require('../config/database');
const sms = require('../utils/sms');

// Temporarily expose internal helper functions for testing
// We can test by calling getBookingDetailsForSms and verifying the values
async function testParser() {
  try {
    console.log('=== TEMPLATE PARSER VERIFICATION START ===');

    // 1. Get a test booking ID
    const [bookings] = await pool.execute('SELECT id, booking_reference FROM bookings ORDER BY id DESC LIMIT 1');
    if (bookings.length === 0) {
      console.warn('⚠️ No bookings found in the database. Creating a mock entry or skipping database query.');
      return;
    }

    const testBookingId = bookings[0].id;
    console.log(`Using test booking ID: ${testBookingId} (Ref: ${bookings[0].booking_reference})`);

    // 2. Fetch booking details for templating
    // Querying exactly what getBookingDetailsForSms queries internally
    const [rows] = await pool.execute(
      `
        SELECT 
          b.id,
          b.booking_reference,
          b.total_amount,
          b.check_in_date,
          b.check_out_date,
          b.guest_name,
          b.guest_phone,
          b.guest_email,
          b.guest_id,
          b.payment_deadline,
          p.title as property_title,
          p.owner_id,
          o_u.first_name as owner_first_name,
          o_u.last_name as owner_last_name,
          o_u.phone as owner_phone,
          g_u.first_name as guest_first_name,
          g_u.last_name as guest_last_name,
          g_u.phone as guest_user_phone
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN property_owners po ON p.owner_id = po.id
        JOIN users o_u ON po.user_id = o_u.id
        LEFT JOIN users g_u ON b.guest_id = g_u.id
        WHERE b.id = ?
        LIMIT 1
      `,
      [testBookingId]
    );

    const booking = rows[0];
    console.log('\nRetrieved booking details for templates:');
    console.log({
      booking_ref: booking.booking_reference,
      total_amount: booking.total_amount,
      guest_name: booking.guest_name,
      property_title: booking.property_title,
      owner_name: `${booking.owner_first_name} ${booking.owner_last_name}`,
      owner_phone: booking.owner_phone,
      guest_phone: booking.guest_phone || booking.guest_user_phone
    });

    // 3. Define and verify dummy values
    const hostName = [booking.owner_first_name, booking.owner_last_name].filter(Boolean).join(' ') || 'Host';
    const guestName = booking.guest_name || [booking.guest_first_name, booking.guest_last_name].filter(Boolean).join(' ') || 'Guest';
    const checkInStr = booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const amountStr = booking.total_amount ? `৳${booking.total_amount}` : '';
    const paymentTimeLimitMinutes = 15;
    const deadlineStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

    const placeholders = {
      host_name: hostName,
      guest_name: guestName,
      property_name: booking.property_title,
      booking_ref: booking.booking_reference,
      check_in_date: checkInStr,
      amount: amountStr,
      payment_limit: paymentTimeLimitMinutes,
      deadline: deadlineStr,
      reason: 'Guest request cancellation',
      booking_url: `http://localhost:3000/property-owner/bookings?search=${booking.booking_reference}`
    };

    const templatesToTest = {};
    const defaultTemplates = {
      sms_template_booking_request_host: '[Keyhost] New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Please review and respond in your host panel.',
      sms_template_booking_accepted_guest: '[Keyhost] Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay.',
      sms_template_booking_paid_host: '[Keyhost] Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully. Guest: {guest_name}. Check-in: {check_in_date}.',
      sms_template_booking_paid_guest: '[Keyhost] Thank you {guest_name}! Payment of {amount} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}.',
      sms_template_checkout_guest: '[Keyhost] Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!',
      sms_template_refund_guest: '[Keyhost] Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}.',
      sms_template_refund_host: '[Keyhost] Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}.'
    };

    for (const key of Object.keys(defaultTemplates)) {
      const [rows] = await pool.execute('SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1', [key]);
      templatesToTest[key] = rows.length > 0 ? rows[0].setting_value : defaultTemplates[key];
    }

    console.log('\n--- PARSING TEST ---');
    
    // We will parse templates using simple replacement logic representing parseTemplate
    for (const [key, templateText] of Object.entries(templatesToTest)) {
      let message = templateText;
      for (const [pk, pv] of Object.entries(placeholders)) {
        const regex = new RegExp(`{${pk}}`, 'g');
        message = message.replace(regex, pv !== undefined && pv !== null ? String(pv) : '');
      }
      console.log(`\n🔑 Key: ${key}`);
      console.log(`   Template: "${templateText}"`);
      console.log(`   Rendered: "${message}"`);
    }

    console.log('\n=== TEMPLATE PARSER VERIFICATION END ===');
  } catch (error) {
    console.error('❌ Error during parser verification:', error.message || error);
  } finally {
    await pool.end();
  }
}

testParser();
