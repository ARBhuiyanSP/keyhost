const { pool } = require('../config/database.js');
const { syncRefundToHMSAccounts } = require('../utils/hms-sync.js');

async function resync() {
    try {
        console.log('Re-syncing refund 10...');
        await pool.query('DELETE FROM hms_accounts_transactions WHERE reference_type = "refund" AND reference_id = 10');
        await syncRefundToHMSAccounts(10);
        console.log('Successfully re-synced refund 10 under Room Revenue head.');
        process.exit(0);
    } catch (err) {
        console.error('Re-sync failed:', err);
        process.exit(1);
    }
}

resync();
