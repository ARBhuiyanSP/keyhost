const { pool } = require('./config/database');
async function run() {
  await pool.query('DELETE FROM bookings WHERE booking_reference LIKE "EXT-%"');
  console.log('Deleted EXT- bookings');
  process.exit(0);
}
run();
