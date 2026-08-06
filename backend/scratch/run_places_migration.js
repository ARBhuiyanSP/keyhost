const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'booking',
  });

  const sql1 = `
    INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
    VALUES ('google_places_enabled', 'true', 'boolean',
      'When true, location search uses Google Places API. When false, only database cities shown.', 1)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
  `;

  const sql2 = `
    INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
    VALUES ('google_api_associated_email', '', 'string',
      'Reference: which Gmail owns the Google Cloud project for this API key.', 1)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
  `;

  await pool.execute(sql1);
  console.log('✅ google_places_enabled inserted/updated');

  await pool.execute(sql2);
  console.log('✅ google_api_associated_email inserted/updated');

  const [rows] = await pool.execute(
    'SELECT setting_key, setting_value, setting_type, is_public FROM system_settings WHERE setting_key IN (?, ?, ?)',
    ['google_places_enabled', 'google_api_associated_email', 'google_maps_api_key']
  );

  console.log('\nSettings in DB:');
  rows.forEach(r => console.log(` - ${r.setting_key} = "${r.setting_value}" | public: ${r.is_public}`));

  await pool.end();
})().catch(console.error);
