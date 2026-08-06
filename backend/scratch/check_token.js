const { pool } = require('../config/database');

async function checkBooking372() {
    try {
        const [rows] = await pool.query(`
            SELECT 
                b.id, 
                b.booking_reference, 
                b.payment_link_token, 
                b.total_amount as base_total, 
                b.payment_status, 
                (SELECT SUM(amount) FROM hms_bills WHERE booking_id = b.id) as bills_total, 
                (SELECT SUM(cr_amount) FROM payments WHERE booking_id = b.id AND status = 'completed') as paid_total
            FROM bookings b 
            WHERE b.id = 372 OR b.booking_reference LIKE '%1785126562930-39%'
        `);
        console.log('Booking 372 Data:', rows);

        if (rows.length > 0) {
            const token = rows[0].payment_link_token;
            console.log('Token:', token);

            const [infoRows] = await pool.query(`
                SELECT 
                    b.id, 
                    (
                        b.total_amount 
                        + COALESCE((SELECT SUM(amount) FROM hms_bills WHERE booking_id = b.id), 0)
                        - COALESCE((SELECT SUM(cr_amount) FROM payments WHERE booking_id = b.id AND status = 'completed'), 0)
                    ) as net_due,
                    b.payment_status, b.guest_name, b.guest_email, b.guest_phone
                FROM bookings b
                WHERE b.payment_link_token = ?
            `, [token]);
            console.log('Payment Info API Result:', infoRows);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBooking372();
