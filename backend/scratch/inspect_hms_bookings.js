const { pool } = require('../config/database');

async function main() {
    try {
        console.log('Searching by guest_name or room_number...');
        const [bookings] = await pool.query(`
            SELECT b.*, r.room_number FROM bookings b
            LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
            WHERE b.guest_name LIKE '%Mahmud%' OR r.room_number = '101' OR b.booking_reference LIKE 'BK-%'
        `);
        console.log('Bookings found:', bookings.length);
        if (bookings.length > 0) {
            console.log(bookings[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
