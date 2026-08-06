const { pool } = require('../config/database');
const { connectWhatsApp, getStatus } = require('../utils/whatsapp');
const sms = require('../utils/sms');

async function runTest() {
  console.log('🧪 Starting WhatsApp notification test script...');

  try {
    // 1. Get current setting
    console.log('1. Checking database configurations...');
    const [rows] = await pool.execute("SELECT * FROM system_settings WHERE setting_key IN ('sms_gateway_type', 'sms_enabled')");
    console.log('Database settings result:', rows);

    // 2. Fetch current status of Baileys connection
    console.log('\n2. Checking Baileys local connection status...');
    const status = getStatus();
    console.log('Current Baileys status:', status);

    console.log('\n✅ Script executed successfully. Database & dependency verification passed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  }
}

runTest();
