const { pool } = require('../config/database.js');

async function check() {
    try {
        const [rows] = await pool.query('SELECT * FROM hms_accounts_transactions WHERE reference_type = "food_order" AND reference_id = 12');
        console.log('Order 12 transactions:', rows.length);
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
