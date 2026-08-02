const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function debugCalendar() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("=== HMS ENABLED PROPERTIES ===");
        const [properties] = await pool.query("SELECT id, title, property_type, is_hms_enabled FROM properties WHERE is_hms_enabled = 1");
        
        for (const prop of properties) {
            console.log(`\nProperty ID ${prop.id} (${prop.title}):`);
            
            const [rooms] = await pool.query("SELECT id, room_number, room_type, price, status FROM hms_rooms WHERE property_id = ?", [prop.id]);
            console.log(`  Rooms count: ${rooms.length}`);
            console.log("  Rooms:", rooms.map(r => `${r.room_number} (id: ${r.id})`).join(', '));

            const [bookings] = await pool.query(
                "SELECT id, check_in_date, check_out_date, status, hms_room_id, total_amount, booking_type FROM bookings WHERE property_id = ?",
                [prop.id]
            );
            console.log(`  Bookings count: ${bookings.length}`);
            const matched = bookings.filter(b => b.hms_room_id !== null);
            const unmatched = bookings.filter(b => b.hms_room_id === null);
            console.log(`    Matched to room: ${matched.length}`);
            console.log(`    Unmatched (hms_room_id is NULL): ${unmatched.length}`);
            if (unmatched.length > 0) {
                console.log("    Unmatched bookings: ", unmatched.map(u => `id: ${u.id}, stay: ${u.check_in_date.toISOString().split('T')[0]} to ${u.check_out_date.toISOString().split('T')[0]}, status: ${u.status}`));
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

debugCalendar();
