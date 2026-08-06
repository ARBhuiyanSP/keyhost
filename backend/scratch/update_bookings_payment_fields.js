const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'keyhost_booking_system',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('Adding payment fields to bookings table...');
        
        // Add payment_method field
        await pool.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL AFTER payment_status,
            ADD COLUMN IF NOT EXISTS payment_notes TEXT DEFAULT NULL AFTER payment_method,
            ADD COLUMN IF NOT EXISTS payment_link_token VARCHAR(100) DEFAULT NULL AFTER payment_notes
        `);

        console.log('Database updated successfully!');
    } catch (error) {
        console.error('Update error:', error);
    } finally {
        await pool.end();
    }
}

updateSchema();
