const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkRecentBookings() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("=== LAST 10 CREATED BOOKINGS ===");
        const [bookings] = await pool.query(`
            SELECT b.id, b.property_id, p.title, p.is_hms_enabled, b.check_in_date, b.check_out_date, b.status, b.hms_room_id, b.created_at 
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            ORDER BY b.created_at DESC
            LIMIT 10
        `);
        console.log(bookings.map(b => ({
            id: b.id,
            property_id: b.property_id,
            title: b.title,
            is_hms_enabled: b.is_hms_enabled,
            stay: `${b.check_in_date.toISOString().split('T')[0]} to ${b.check_out_date.toISOString().split('T')[0]}`,
            status: b.status,
            hms_room_id: b.hms_room_id,
            created_at: b.created_at
        })));
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkRecentBookings();
