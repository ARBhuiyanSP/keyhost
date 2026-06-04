const { pool } = require('./config/database');

async function updateDB() {
  try {
    await pool.execute(`
      UPDATE system_settings 
      SET is_public = 1 
      WHERE setting_key IN ('terms_of_service', 'privacy_policy', 'refund_policy')
    `);
    console.log('Database updated successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

updateDB();
