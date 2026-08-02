const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function testReservationsQuery() {
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
            SELECT 
                b.*, 
                DATEDIFF(b.check_out_date, b.check_in_date) as nights,
                COALESCE(b.hms_room_id, ep.id) as hms_room_id,
                COALESCE(r.room_number, ep.room_number) as room_number, 
                COALESCE(r.room_type, ep.room_type) as room_type,
                u.first_name as guest_first_name,
                u.last_name as guest_last_name,
                u.email as guest_user_email,
                u.phone as guest_user_phone,
                (SELECT COALESCE(SUM(amount), 0) FROM hms_bills WHERE booking_id = b.id) as extra_billing_amount,
                (SELECT COALESCE(SUM(cr_amount), 0) FROM payments WHERE booking_id = b.id AND status = 'completed') as paid_amount,
                (SELECT COUNT(*) FROM hms_food_orders WHERE booking_id = b.id AND payment_status IN ('unpaid', 'billed_to_room')) as unpaid_food_count,
                (SELECT COUNT(*) FROM hms_bills WHERE booking_id = b.id) as extra_bills_count
            FROM bookings b
            LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
            LEFT JOIN hms_rooms ep ON ep.property_id = b.property_id AND ep.room_number = 'Entire Place' AND b.hms_room_id IS NULL
            LEFT JOIN users u ON b.guest_id = u.id
            WHERE b.property_id = ?
            ORDER BY b.created_at DESC
        `, [propId]);

        console.log(`=== RESERVATIONS FOR PROPERTY ${propId} ===`);
        console.log(reservations.map(r => ({
            id: r.id,
            status: r.status,
            booking_type: r.booking_type,
            hms_room_id: r.hms_room_id,
            check_in_date: r.check_in_date,
            check_out_date: r.check_out_date
        })));
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

testReservationsQuery();
