const { pool } = require('../config/database.js');

async function checkHeads() {
    try {
        const [rows] = await pool.query('SELECT * FROM hms_accounts_heads');
        console.log('Account Heads:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkHeads();
