const { pool } = require('../config/database');

const templates = {
  sms_template_booking_request_host: '[Keyhost] New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Review & accept here: {booking_url}',
  sms_template_booking_accepted_guest: '[Keyhost] Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay.',
  sms_template_booking_paid_host: '[Keyhost] Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully. Guest: {guest_name}. Check-in: {check_in_date}.',
  sms_template_booking_paid_guest: '[Keyhost] Thank you {guest_name}! Payment of {amount} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}.',
  sms_template_checkout_guest: '[Keyhost] Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!',
  sms_template_refund_guest: '[Keyhost] Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}.',
  sms_template_refund_host: '[Keyhost] Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}.'
};

async function seedTemplates() {
  try {
    console.log('=== SEEDING SMS TEMPLATES START ===');
    console.log('Connecting to database...');

    for (const [key, value] of Object.entries(templates)) {
      console.log(`Seeding key: ${key}`);
      
      // Upsert the setting key-value pair
      await pool.execute(
        `
        INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
        VALUES (?, ?, 'string', ?, 0)
        ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          updated_at = NOW()
        `,
        [
          key,
          value,
          `SMS template setting for ${key.replace('sms_template_', '').replace(/_/g, ' ')}`
        ]
      );
    }

    console.log('✅ All SMS templates have been seeded successfully!');
    console.log('=== SEEDING SMS TEMPLATES END ===');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message || error);
  } finally {
    await pool.end();
  }
}

seedTemplates();
