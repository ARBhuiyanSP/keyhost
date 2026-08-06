/**
 * run_nagad_settings_update.js
 * Fixes Nagad settings in DB:
 *  - Adds nagad_merchant_private_key (canonical key name used by gateway)
 *  - Updates nagad_api_url to correct Nagad sandbox endpoint
 *  - Adds bkash_api_associated_email if missing
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
  });

  const updates = [
    // Add nagad_merchant_private_key as the canonical key (gateway reads this first)
    {
      key: 'nagad_merchant_private_key',
      val: '',
      type: 'string',
      desc: 'Nagad Merchant RSA Private Key (base64, no headers)',
      pub: 0  // sensitive — not public
    },
    // Fix Nagad sandbox URL to official endpoint
    {
      key: 'nagad_api_url',
      val: 'https://sandbox.mynagad.com:10080',
      type: 'string',
      desc: 'Nagad API Endpoint URL (sandbox or live)',
      pub: 1
    },
    // bKash associated email field
    {
      key: 'bkash_api_associated_email',
      val: '',
      type: 'string',
      desc: 'Email associated with bKash merchant account / Google Cloud project',
      pub: 1
    },
  ];

  for (const s of updates) {
    await pool.execute(
      `INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_type = VALUES(setting_type), description = VALUES(description), is_public = VALUES(is_public)`,
      [s.key, s.val, s.type, s.desc, s.pub]
    );
    console.log(`✅  ${s.key}`);
  }

  console.log('\nNagad settings update complete.');
  await pool.end();
})().catch(console.error);
