const mysql = require('mysql2/promise');

async function addBkashSettings() {
  console.log('🚀 Adding bKash Payment Settings...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'keyhost_booking_system'
    });

    console.log('📊 Connected to database successfully');

    // Add bKash settings
    console.log('📊 Adding bKash payment settings...');
    await connection.execute(`
      INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
      ('bkash_enabled', 'true', 'boolean', 'Enable bKash payment gateway', false),
      ('bkash_merchant_id', 'DEMO_MERCHANT_001', 'string', 'bKash merchant ID', false),
      ('bkash_merchant_key', 'DEMO_MERCHANT_KEY_123', 'string', 'bKash merchant key', false),
      ('bkash_merchant_secret', 'DEMO_MERCHANT_SECRET_456', 'string', 'bKash merchant secret', false),
      ('bkash_api_url', 'https://tokenized.pay.bka.sh/v1.2.0-beta', 'string', 'bKash API base URL', false),
      ('bkash_callback_url', 'http://localhost:3000/payment/callback', 'string', 'bKash payment callback URL', false),
      ('bkash_currency', 'BDT', 'string', 'bKash payment currency', false),
      ('bkash_intent', 'sale', 'string', 'bKash payment intent', false),
      ('bkash_mode', 'sandbox', 'string', 'bKash payment mode (sandbox/live)', false),
      ('bkash_success_url', 'http://localhost:3000/payment/success', 'string', 'bKash payment success redirect URL', false),
      ('bkash_fail_url', 'http://localhost:3000/payment/fail', 'string', 'bKash payment failure redirect URL', false)
      ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value),
      updated_at = NOW()
    `);
    console.log('✅ bKash settings added');

    await connection.end();

    console.log('');
    console.log('✅ bKash payment settings setup completed successfully!');
    console.log('');
    console.log('📋 What was added:');
    console.log('   • bKash enabled/disabled toggle');
    console.log('   • Demo merchant credentials');
    console.log('   • API configuration');
    console.log('   • Callback URLs');
    console.log('   • Payment mode settings');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Create bKash payment gateway integration');
    console.log('   2. Add bKash payment processing to booking flow');
    console.log('   3. Test demo payment flow');

  } catch (error) {
    console.error('❌ Failed to add bKash settings');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addBkashSettings();





