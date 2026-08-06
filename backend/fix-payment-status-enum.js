const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Test: set booking 57 to pending_extra to verify it now works
    await pool.query(`UPDATE bookings SET payment_status = 'pending_extra' WHERE id = 57`);
    const [rows] = await pool.query('SELECT id, status, payment_status, check_out_date, total_amount FROM bookings WHERE id = 57');
    console.log('✅ Booking 57 updated:', rows[0]);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
