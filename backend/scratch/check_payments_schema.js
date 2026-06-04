const { pool } = require('../config/database.js');

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE payments');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
