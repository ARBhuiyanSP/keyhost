const mysql = require('mysql2/promise');
require('dotenv').config();

async function clean() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'booking_system'
    });

    // Clean up corrupted base64 strings from bookings
    const [result] = await connection.query(`
        UPDATE bookings 
        SET guest_nid_document_url = NULL 
        WHERE guest_nid_document_url LIKE 'data:%' AND LENGTH(guest_nid_document_url) < 70000
    `);
    console.log('Cleaned bookings NID:', result.affectedRows);

    const [result2] = await connection.query(`
        UPDATE bookings 
        SET guest_passport_document_url = NULL 
        WHERE guest_passport_document_url LIKE 'data:%' AND LENGTH(guest_passport_document_url) < 70000
    `);
    console.log('Cleaned bookings Passport:', result2.affectedRows);

    await connection.end();
}

clean().catch(console.error);
