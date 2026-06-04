const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkBooking() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system'
    });

    try {
        const [rows] = await pool.query('SELECT b.id, b.property_id, p.owner_id, po.user_id FROM bookings b JOIN properties p ON b.property_id = p.id JOIN property_owners po ON p.owner_id = po.id WHERE b.id = 145');
        console.log('Booking 145 info:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkBooking();
