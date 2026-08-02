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
    const bookingId = 4;
    const userId = 59; // User ID of property owner

    const [booking] = await promisePool.query(
      `SELECT b.* FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = ? AND p.owner_id = (SELECT id FROM property_owners WHERE user_id = ?)`,
       [bookingId, userId]
    );

    console.log('Query result:', booking);
    console.log('booking.length:', booking.length);
    if (booking.length > 0) {
      console.log('First item:', booking[0]);
    }

    pool.end();
  } catch (err) {
    console.error(err);
    pool.end();
  }
}

run();
