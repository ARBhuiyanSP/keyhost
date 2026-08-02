const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'booking_system'
    });

    const [cols] = await connection.query('SHOW COLUMNS FROM bookings');
    console.log('Columns:', JSON.stringify(cols, null, 2));

    await connection.end();
}

check().catch(console.error);
