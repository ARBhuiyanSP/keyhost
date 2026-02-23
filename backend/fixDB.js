const { pool } = require('./config/database.js');

async function fix() {
    try {
        const res = await pool.execute("ALTER TABLE bookings MODIFY status ENUM('pending','request_accepted','confirmed','checked_in','checked_out','cancelled','refunded') DEFAULT 'pending'");
        console.log("Success:", res);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

fix();
