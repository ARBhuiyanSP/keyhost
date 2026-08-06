const { pool } = require('../config/database');

async function checkOrders() {
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE booking_id = 372 ORDER BY id DESC');
        console.log('Orders for booking 372:', orders);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOrders();
