const { pool } = require('../config/database');
const axios = require('axios');

async function testBulkSms() {
  console.log('🧪 Testing Bulk SMS gateway direct request...');
  try {
    // Fetch SMS settings
    const [rows] = await pool.execute(
      "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('sms_api_key', 'sms_secret_key', 'sms_sender_id', 'sms_api_url', 'sms_enabled')"
    );
    const settings = {};
    rows.forEach(r => settings[r.setting_key] = r.setting_value);

    const apiKey = settings.sms_api_key;
    const secretKey = settings.sms_secret_key;
    const senderId = settings.sms_sender_id;
    const apiUrl = settings.sms_api_url || 'http://217.172.190.215/sendtext';

    console.log('Credentials loaded:', {
      has_api_key: !!apiKey,
      has_secret_key: !!secretKey,
      has_sender_id: !!senderId,
      apiUrl
    });

    const targetPhone = '01729714503';
    
    // Test 1: Short message without special characters
    const testMsg1 = '[Keyhost] Test SMS without special characters. Booking ref: KH123456.';
    const url1 = `${apiUrl}?apikey=${encodeURIComponent(apiKey)}&secretkey=${encodeURIComponent(secretKey)}&callerID=${encodeURIComponent(senderId)}&toUser=${encodeURIComponent(targetPhone)}&messageContent=${encodeURIComponent(testMsg1)}`;
    
    console.log('\n--- Sending Test 1 (Short, clean) ---');
    const resp1 = await axios.get(url1, { timeout: 10000 });
    console.log('Response 1:', resp1.status, resp1.data);

    // Test 2: Message with Taka symbol (Unicode) and longer length
    const testMsg2 = '[Keyhost] Payment Confirmed! Booking KH123456 for Sweet Balcony Room has been paid successfully. Guest: Test. Total: ৳5000.00. Check-in: Jul 6, 2026.';
    const url2 = `${apiUrl}?apikey=${encodeURIComponent(apiKey)}&secretkey=${encodeURIComponent(secretKey)}&callerID=${encodeURIComponent(senderId)}&toUser=${encodeURIComponent(targetPhone)}&messageContent=${encodeURIComponent(testMsg2)}`;

    console.log('\n--- Sending Test 2 (Unicode Taka + Long) ---');
    const resp2 = await axios.get(url2, { timeout: 10000 });
    console.log('Response 2:', resp2.status, resp2.data);

  } catch (err) {
    console.error('Test failed with error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
  process.exit(0);
}

testBulkSms();
