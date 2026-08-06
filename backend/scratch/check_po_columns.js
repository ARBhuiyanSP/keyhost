const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkPO() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system'
    });

    try {
        const [rows] = await pool.query('SHOW COLUMNS FROM property_owners');
        console.log('Property Owners columns:', JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkPO();
