const { pool } = require('../config/database.js');

async function check() {
    try {
        console.log('--- Latest Account Transactions ---');
        const [rows] = await pool.query('SELECT * FROM hms_accounts_transactions ORDER BY created_at DESC LIMIT 10');
        console.table(rows);
        
        console.log('--- Latest Refunds ---');
        const [refunds] = await pool.query('SELECT * FROM refunds ORDER BY created_at DESC LIMIT 5');
        console.table(refunds);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
