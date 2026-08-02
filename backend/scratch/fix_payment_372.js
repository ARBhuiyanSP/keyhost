const { pool } = require('../config/database');

async function fixPayment372() {
    try {
        const booking_id = 372;
        const tran_id = 'HMSPAY1785128823642';
        const val_id = '260727110706rLnc8GTAUJsuxqc';
        const amount = '2.00';

        const [exists] = await pool.execute("SELECT id FROM payments WHERE gateway_transaction_id = ?", [tran_id]);
        if (exists.length === 0) {
            const [result] = await pool.execute(`
                INSERT INTO payments (
                  booking_id, payment_reference, payment_method, payment_type, 
                  amount, dr_amount, cr_amount, transaction_type, status, notes,
                  payment_date, created_at, updated_at, gateway_transaction_id, bank_tran_id
                ) VALUES (?, ?, 'sslcommerz', 'booking', ?, 0, ?, 'guest_payment', 'completed', ?, NOW(), NOW(), NOW(), ?, ?)
            `, [
                booking_id, 
                `SSL-${tran_id}`, 
                amount, 
                amount, 
                `Guest payment received via SSLCommerz - Total paid: ৳${amount}`,
                tran_id,
                val_id
            ]);
            console.log('Inserted payment 2 taka successfully, ID:', result.insertId);

            // Update booking payment_status to paid
            await pool.execute('UPDATE bookings SET payment_status = "paid", updated_at = NOW() WHERE id = ?', [booking_id]);
            console.log('Updated booking 372 payment_status to paid.');
        } else {
            console.log('Payment record already exists:', exists);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixPayment372();
