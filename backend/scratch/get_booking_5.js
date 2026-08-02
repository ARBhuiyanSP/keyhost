const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'booking_system'
    });

    const [rows] = await connection.query('SELECT id, guest_name, guest_phone, guest_nid_document_url, guest_passport_document_url FROM bookings WHERE id = 5');
    console.log(JSON.stringify(rows, null, 2));

    await connection.end();
}

check().catch(console.error);
