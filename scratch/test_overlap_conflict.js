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
    const roomId = 7;
    const bookingId = 4; // Booking we are editing

    // We want to change Booking 4 to check-in on '2026-06-08' and check-out on '2026-06-10'
    // But Booking 3 is check-in '2026-06-08', check-out '2026-06-09' (based on date-only fields)
    // Wait, let's query the raw string values of check_in_date and check_out_date from mysql to verify them
    const [rawDates] = await promisePool.execute(
      "SELECT id, DATE_FORMAT(check_in_date, '%Y-%m-%d') as ci, DATE_FORMAT(check_out_date, '%Y-%m-%d') as co FROM bookings WHERE id IN (3, 4)"
    );
    console.log('Raw Dates in MySQL:', rawDates);

    // Let's test a conflict: setting Booking 4 to '2026-06-08' -> '2026-06-09'
    // Since Booking 3 is '2026-06-08' -> '2026-06-09', this should conflict!
    const testCheckIn = '2026-06-08';
    const testCheckOut = '2026-06-09';

    const [conflicts] = await promisePool.query(`
        SELECT id, booking_reference FROM bookings
        WHERE hms_room_id = ?
        AND id != ?
        AND status IN ('request_accepted', 'confirmed', 'checked_in')
        AND check_in_date < ?
        AND check_out_date > ?
    `, [roomId, bookingId, testCheckOut, testCheckIn]);

    console.log('Conflict query results:', conflicts);
    if (conflicts.length > 0) {
      console.log('SUCCESS: Conflict detected correctly!');
    } else {
      console.log('WARNING: No conflict detected!');
    }

    pool.end();
  } catch (err) {
    console.error(err);
    pool.end();
  }
}

run();
