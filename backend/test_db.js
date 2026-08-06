const { pool } = require('./config/database');
async function run() {
  const [rows] = await pool.query('SELECT id, property_id, check_in_date, check_out_date, status FROM bookings ORDER BY id DESC LIMIT 5');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
run();
