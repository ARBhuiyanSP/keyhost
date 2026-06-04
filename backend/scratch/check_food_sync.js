const { pool } = require('../config/database.js');

async function check() {
    try {
        const [rows] = await pool.query('SELECT * FROM hms_accounts_heads WHERE name LIKE "%Food%"');
        console.table(rows);
        
        const [trans] = await pool.query('SELECT t.*, h.name as head_name FROM hms_accounts_transactions t JOIN hms_accounts_heads h ON t.account_head_id = h.id WHERE h.name LIKE "%Food%" ORDER BY t.created_at DESC LIMIT 5');
        console.table(trans);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
