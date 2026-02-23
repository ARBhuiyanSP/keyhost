const { pool } = require('./config/database.js');

async function check() {
    try {
        const [res] = await pool.execute("SELECT id, status, payment_status, confirmed_at FROM bookings ORDER BY id DESC LIMIT 5");
        console.log("Recent Bookings:", res);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

check();
