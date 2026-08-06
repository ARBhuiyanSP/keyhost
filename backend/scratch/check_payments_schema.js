const { pool } = require('../config/database.js');

async function checkPaymentsSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE payments');
        console.log('Payments Table Columns:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPaymentsSchema();
