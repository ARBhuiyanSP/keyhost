const { pool } = require('../config/database.js');

async function verify() {
    try {
        console.log('Verifying refund transaction in ledger...');
        const [rows] = await pool.query('SELECT t.*, h.name as head_name FROM hms_accounts_transactions t JOIN hms_accounts_heads h ON t.account_head_id = h.id WHERE t.reference_type = "refund" AND t.reference_id = 10');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
