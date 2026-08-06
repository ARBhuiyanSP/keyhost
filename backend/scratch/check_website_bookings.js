const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkWebsiteBookings() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("=== WEBSITE BOOKINGS ON HMS PROPERTIES ===");
        const [bookings] = await pool.query(`
            SELECT b.id, b.property_id, p.title, b.check_in_date, b.check_out_date, b.status, b.hms_room_id, b.booking_source
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE p.is_hms_enabled = 1 AND b.booking_source = 'website'
        `);
        console.log(`Found ${bookings.length} website bookings on HMS enabled properties:`);
        console.log(bookings);
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkWebsiteBookings();
