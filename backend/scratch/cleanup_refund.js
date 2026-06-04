const { pool } = require('../config/database.js');

async function cleanup() {
    try {
        console.log('Cleaning up duplicate refund 11...');
        await pool.query('DELETE FROM hms_accounts_transactions WHERE reference_type = "refund" AND reference_id = 11');
        await pool.query('DELETE FROM refunds WHERE id = 11');
        console.log('Successfully cleaned up duplicate refund 11.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
