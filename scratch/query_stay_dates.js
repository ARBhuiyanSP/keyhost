const mysql = require('d:/88i/booking-systme/backend/node_modules/mysql2');
const dotenv = require('d:/88i/booking-systme/backend/node_modules/dotenv');
dotenv.config({ path: 'd:/88i/booking-systme/backend/.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'keyhost_booking_system',
  port: process.env.DB_PORT || 3306,
});

const promisePool = pool.promise();

async function run() {
  try {
    const [bookings] = await promisePool.execute("SELECT id, hms_room_id, check_in_date, check_out_date, status, booking_reference FROM bookings WHERE id IN (3, 4)");
    console.log(JSON.stringify(bookings, null, 2));
    pool.end();
  } catch (err) {
    console.error(err);
    pool.end();
  }
}

run();
