const { pool } = require('./config/database.js');

async function check() {
    try {
        const [res] = await pool.execute("SELECT * FROM hms_accounts_transactions LIMIT 5");
        console.log("HMS Transactions:", JSON.stringify(res, null, 2));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

check();

