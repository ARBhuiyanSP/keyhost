const { pool } = require('../config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE hms_rooms');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
