// Migration: Add Meta Pixel CAPI settings
// Run: node backend/migrations/add_meta_pixel_settings.js

const { pool } = require('../config/database');

async function migrate() {
  const settings = [
    { key: 'facebook_pixel_id',       value: '',        type: 'string',  is_public: true,  desc: 'Meta Pixel ID for browser-side tracking' },
    { key: 'meta_access_token',        value: '',        type: 'string',  is_public: false, desc: 'Meta Conversions API access token (server-side)' },
    { key: 'meta_test_event_code',     value: '',        type: 'string',  is_public: false, desc: 'Meta test event code for development testing' },
    { key: 'meta_advanced_matching',   value: 'true',    type: 'boolean', is_public: false, desc: 'Enable advanced matching (hashed user data)' },
    { key: 'meta_capi_enabled',        value: 'false',   type: 'boolean', is_public: false, desc: 'Enable Conversions API (server-side events)' },
  ];

  for (const s of settings) {
    await pool.execute(`
      INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        setting_type = VALUES(setting_type),
        description  = VALUES(description),
        is_public    = VALUES(is_public)
    `, [s.key, s.value, s.type, s.desc, s.is_public]);
    console.log(`✅ Upserted: ${s.key}`);
  }

  console.log('✅ Meta Pixel settings migration complete');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
