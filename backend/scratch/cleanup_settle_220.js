const { pool } = require('../config/database.js');

async function cleanup() {
    try {
        await pool.query('DELETE FROM hms_accounts_transactions WHERE reference_type = "payment" AND reference_id = 220');
        console.log('Cleaned up incorrect settlement sync for 220');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
