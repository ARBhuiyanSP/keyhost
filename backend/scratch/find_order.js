const { pool } = require('../config/database.js');

async function find() {
    try {
        const [rows] = await pool.query('SELECT * FROM hms_food_orders WHERE total_amount = 275 ORDER BY created_at DESC');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

find();
