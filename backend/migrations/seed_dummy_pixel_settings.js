// Migration: Seed Dummy Meta Pixel settings
// Run: node backend/migrations/seed_dummy_pixel_settings.js

const { pool } = require('../config/database');

async function seed() {
  const settings = [
    { key: 'facebook_pixel_id',       value: '1234567890123456' },
    { key: 'meta_access_token',        value: 'EAABsDummyAccessToken1234567890ExampleKey' },
    { key: 'meta_test_event_code',     value: 'TEST12345' },
    { key: 'meta_advanced_matching',   value: 'true' },
    { key: 'meta_capi_enabled',        value: 'true' },
  ];

  for (const s of settings) {
    await pool.execute(`
      UPDATE system_settings 
      SET setting_value = ? 
      WHERE setting_key = ?
    `, [s.value, s.key]);
    console.log(`✅ Seeded dummy value for: ${s.key}`);
  }

  console.log('✅ Dummy Meta Pixel credentials seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
