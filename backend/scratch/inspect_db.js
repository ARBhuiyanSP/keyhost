const { pool } = require('../config/database');

async function checkBooking() {
    try {
        const [bookings] = await pool.query('SELECT id, booking_reference, total_amount, payment_status FROM bookings ORDER BY id DESC LIMIT 5');
        for (const bk of bookings) {
            const [bills] = await pool.query('SELECT * FROM hms_bills WHERE booking_id = ?', [bk.id]);
            const [pays] = await pool.query('SELECT id, amount, cr_amount, status, payment_method FROM payments WHERE booking_id = ?', [bk.id]);
            console.log(`Booking ID ${bk.id} (${bk.booking_reference}): payment_status=${bk.payment_status}, total_amount=${bk.total_amount}`);
            console.log('  HMS Bills:', bills);
            console.log('  Payments:', pays);
            console.log('---');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBooking();
