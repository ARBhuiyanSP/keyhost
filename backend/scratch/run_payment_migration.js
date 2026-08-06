const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'booking',
  });

  const settingsToInsert = [
    // bKash settings
    { key: 'enable_bkash', val: 'false', type: 'boolean', desc: 'Enable direct bKash payment gateway', pub: 1 },
    { key: 'bkash_is_live', val: 'false', type: 'boolean', desc: 'bKash environment mode (true = Live, false = Sandbox)', pub: 1 },
    { key: 'bkash_api_url', val: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta', type: 'string', desc: 'bKash API Endpoint URL', pub: 1 },
    { key: 'bkash_username', val: '', type: 'string', desc: 'bKash API Username', pub: 1 },
    { key: 'bkash_password', val: '', type: 'string', desc: 'bKash API Password', pub: 1 },
    { key: 'bkash_merchant_id', val: '', type: 'string', desc: 'bKash Merchant ID', pub: 1 },
    { key: 'bkash_merchant_key', val: '', type: 'string', desc: 'bKash App Key (Merchant Key)', pub: 1 },
    { key: 'bkash_merchant_secret', val: '', type: 'string', desc: 'bKash App Secret (Merchant Secret)', pub: 1 },

    // Nagad settings
    { key: 'enable_nagad', val: 'false', type: 'boolean', desc: 'Enable direct Nagad payment gateway', pub: 1 },
    { key: 'nagad_is_live', val: 'false', type: 'boolean', desc: 'Nagad environment mode (true = Live, false = Sandbox)', pub: 1 },
    { key: 'nagad_api_url', val: 'http://sandbox.mymoid.com:9090', type: 'string', desc: 'Nagad API Endpoint URL', pub: 1 },
    { key: 'nagad_merchant_id', val: '', type: 'string', desc: 'Nagad Merchant ID', pub: 1 },
    { key: 'nagad_private_key', val: '', type: 'string', desc: 'Merchant RSA Private Key (PEM format)', pub: 1 },
    { key: 'nagad_public_key', val: '', type: 'string', desc: 'Nagad RSA Public Key (PEM format)', pub: 1 },
  ];

  for (const s of settingsToInsert) {
    await pool.execute(
      `INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_type = VALUES(setting_type), description = VALUES(description), is_public = VALUES(is_public)`,
      [s.key, s.val, s.type, s.desc, s.pub]
    );
    console.log(`✅ Seeded ${s.key}`);
  }

  console.log('\nAll payment settings successfully initialized in system_settings table.');
  await pool.end();
})().catch(console.error);
