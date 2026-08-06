const { pool } = require('../config/database');

async function fixBooking372Amount() {
    try {
        await pool.query('UPDATE bookings SET total_amount = 8.00, base_price = 8.00 WHERE id = 372');
        console.log('Updated booking 372 total_amount and base_price to 8.00 BDT');

        const [detail] = await pool.query(`
            SELECT 
                b.id,
                b.total_amount as room_amount,
                (SELECT COALESCE(SUM(amount), 0) FROM hms_bills WHERE booking_id = b.id) as extra_bills,
                (SELECT COALESCE(SUM(cr_amount), 0) FROM payments WHERE booking_id = b.id AND status = 'completed') as paid
            FROM bookings b WHERE b.id = 372
        `);

        const row = detail[0];
        const room = parseFloat(row.room_amount);
        const extra = parseFloat(row.extra_bills);
        const grandTotal = room + extra;
        const paid = parseFloat(row.paid);
        const due = Math.max(0, grandTotal - paid);

        console.log('Fixed Booking 372 Financial Summary:');
        console.log({
            RoomAmount: room,
            ExtraBills: extra,
            GrandTotal: grandTotal,
            TotalPaid: paid,
            NetDue: due,
            IsFullyPaid: due === 0
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixBooking372Amount();
