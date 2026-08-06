const { pool } = require('../config/database');

async function inspectBooking372Full() {
    try {
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = 372 OR booking_reference LIKE "%1785126562930-39%"');
        console.log('--- BOOKING RECORD ---');
        console.log(bookings[0]);

        const [bills] = await pool.query('SELECT * FROM hms_bills WHERE booking_id = 372');
        console.log('--- HMS BILLS ---');
        console.log(bills);

        const [payments] = await pool.query('SELECT * FROM payments WHERE booking_id = 372');
        console.log('--- PAYMENTS ---');
        console.log(payments);

        const [guests] = await pool.query('SELECT * FROM booking_guests WHERE booking_id = 372');
        console.log('--- BOOKING GUESTS ---');
        console.log(guests);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectBooking372Full();
