const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkOrphanBookings() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("=== BOOKINGS WITH NULL hms_room_id ===");
        const [nullRoomBookings] = await pool.query(`
            SELECT b.id, b.property_id, p.title, p.is_hms_enabled, b.check_in_date, b.check_out_date, b.status 
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.hms_room_id IS NULL AND p.is_hms_enabled = 1
        `);
        console.log(`Found ${nullRoomBookings.length} bookings with NULL hms_room_id on HMS enabled properties:`);
        
        for (const booking of nullRoomBookings) {
            const [rooms] = await pool.query(
                "SELECT id, room_number, room_type FROM hms_rooms WHERE property_id = ? AND room_number = 'Entire Place'",
                [booking.property_id]
            );
            console.log(`Booking ID ${booking.id} (Property: ${booking.title}, ID: ${booking.property_id}, Stay: ${booking.check_in_date.toISOString().split('T')[0]} to ${booking.check_out_date.toISOString().split('T')[0]}, Status: ${booking.status}):`);
            if (rooms.length > 0) {
                console.log(`  -> Has 'Entire Place' room (ID: ${rooms[0].id})`);
            } else {
                console.log(`  -> WARNING: NO 'Entire Place' room found for this property!`);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkOrphanBookings();
