const { pool } = require('../config/database.js');

async function check() {
    try {
        const [rows] = await pool.query('DESCRIBE hms_rooms');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
