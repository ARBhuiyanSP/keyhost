const { pool } = require('../config/database.js');
const { syncPaymentToHMSAccounts } = require('../utils/hms-sync.js');

async function fix() {
    try {
        const bookingId = 163;
        const amount = 5000;
        const payRef = `HMS-MANUAL-FIX-${Date.now()}`;
        
        console.log(`Fixing booking ${bookingId}...`);
        
        const [pResult] = await pool.query(`
            INSERT INTO payments (
                booking_id, payment_reference, payment_method, payment_type, 
                amount, cr_amount, dr_amount, transaction_type, status, notes,
                payment_date
            ) VALUES (?, ?, 'cash', 'booking', ?, ?, 0, 'guest_payment', 'completed', 'Manual sync fix for reservation creation', NOW())
        `, [bookingId, payRef, amount, amount]);

        console.log('Payment inserted. Syncing to HMS accounts...');
        await syncPaymentToHMSAccounts(pResult.insertId);
        
        console.log('Fixed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
}

fix();
