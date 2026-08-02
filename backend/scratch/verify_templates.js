const { pool } = require('../config/database');

async function testTemplates() {
  const testKeys = [
    'sms_template_booking_request_host',
    'sms_template_booking_accepted_guest',
    'sms_template_booking_paid_host',
    'sms_template_booking_paid_guest',
    'sms_template_checkout_guest',
    'sms_template_refund_guest',
    'sms_template_refund_host'
  ];

  try {
    console.log('=== DB VERIFICATION START ===');

    // 1. Check existing values
    console.log('1. Checking existing settings keys in database...');
    const [rows] = await pool.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN (${testKeys.map(() => '?').join(', ')})
    `, testKeys);

    console.log(`Found ${rows.length} existing SMS template settings:`);
    rows.forEach(r => console.log(`  - ${r.setting_key}: ${r.setting_value}`));

    // 2. Perform test insert/update on one key
    const testKey = 'sms_template_booking_request_host';
    const testVal = 'New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Please review and confirm.';
    
    console.log(`\n2. Performing test upsert on key: ${testKey}`);
    await pool.execute(`
      INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
      VALUES (?, ?, 'string', 'Test booking request SMS template', 0)
      ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value),
      updated_at = NOW()
    `, [testKey, testVal]);

    console.log('Upsert succeeded.');

    // 3. Retrieve back and verify
    console.log('\n3. Retrieving back to verify value...');
    const [checkRows] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1',
      [testKey]
    );

    if (checkRows.length > 0 && checkRows[0].setting_value === testVal) {
      console.log('✅ Success! Value verified successfully.');
    } else {
      console.error('❌ Error! Retrieved value does not match target value.');
    }

    console.log('=== DB VERIFICATION END ===');
  } catch (error) {
    console.error('❌ Exception in verification test:', error.message || error);
  } finally {
    await pool.end();
  }
}

testTemplates();
