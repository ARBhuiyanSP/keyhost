const { pool } = require('../config/database');

async function testPayoutCalculation() {
    try {
        const propertyOwnerId = 59;
        const [rows] = await pool.query(`
            SELECT
                b.id AS booking_id,
                b.booking_reference,
                b.total_amount as base_total,
                b.property_owner_earnings as base_earnings,
                COALESCE((
                    SELECT SUM(cr_amount) FROM payments 
                    WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online')
                ), 0) as total_online_collected,
                GREATEST(
                    b.property_owner_earnings,
                    COALESCE((
                        SELECT SUM(cr_amount) FROM payments 
                        WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online')
                    ), 0) - COALESCE(b.admin_commission_amount, 0)
                ) AS net_host_earnings
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE p.owner_id = ?
              AND b.payment_status = 'paid'
              AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        `, [propertyOwnerId]);

        console.log('Host 59 Payout Calculation Verification:');
        console.log(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testPayoutCalculation();
