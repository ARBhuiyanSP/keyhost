const { pool } = require('../config/database.js');

async function check() {
    try {
        console.log('Checking all transactions for Booking 166...');
        const [rows] = await pool.query('SELECT t.*, h.name as head_name FROM hms_accounts_transactions t JOIN hms_accounts_heads h ON t.account_head_id = h.id WHERE t.description LIKE "%Booking #166%" OR (t.reference_type = "food_order" AND t.reference_id IN (SELECT id FROM hms_food_orders WHERE booking_id = 166))');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
