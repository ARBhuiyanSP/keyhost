const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkProperty89() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system',
        port: process.env.DB_PORT || 3306
    });

    try {
        const propId = 89;
        const [reservations] = await pool.query(`
            SELECT id, status, hms_room_id, check_in_date, check_out_date, total_amount, booking_type 
            FROM bookings 
            WHERE property_id = ?
            ORDER BY check_in_date DESC
        `, [propId]);

        console.log(`=== ACTIVE RESERVATIONS FOR PROPERTY ${propId} ===`);
        const active = reservations.filter(r => r.status !== 'cancelled');
        console.log(active.map(r => ({
            id: r.id,
            status: r.status,
            hms_room_id: r.hms_room_id,
            check_in_date: r.check_in_date.toISOString().split('T')[0],
            check_out_date: r.check_out_date.toISOString().split('T')[0],
            booking_type: r.booking_type
        })));
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkProperty89();
