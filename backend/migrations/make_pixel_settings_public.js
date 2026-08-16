// Migration: Make Meta Pixel configuration settings public
// Run: node backend/migrations/make_pixel_settings_public.js

const { pool } = require('../config/database');

async function run() {
  await pool.execute(`
    UPDATE system_settings 
    SET is_public = true 
    WHERE setting_key IN ('meta_advanced_matching', 'meta_capi_enabled')
  `);
  console.log('✅ meta_advanced_matching and meta_capi_enabled are now public settings');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
