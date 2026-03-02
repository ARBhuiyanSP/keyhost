const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    charset: 'utf8mb4'
};

async function setup() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to DB');

        // Create external_calendars table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS external_calendars (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                property_id BIGINT UNSIGNED NOT NULL,
                provider_name VARCHAR(100) NOT NULL,
                ical_url TEXT NOT NULL,
                last_sync DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('external_calendars table created or exists');

        // Check if source column exists in bookings table
        const [columns] = await connection.query(`SHOW COLUMNS FROM bookings LIKE 'source'`);
        if (columns.length === 0) {
            await connection.query(`ALTER TABLE bookings ADD COLUMN source VARCHAR(50) DEFAULT 'Internal'`);
            console.log('Added source column to bookings table');
        } else {
            console.log('source column already exists in bookings table');
        }

        // Check if external_booking_id exists in bookings table to prevent duplicate imports
        const [refColumns] = await connection.query(`SHOW COLUMNS FROM bookings LIKE 'external_booking_id'`);
        if (refColumns.length === 0) {
            await connection.query(`ALTER TABLE bookings ADD COLUMN external_booking_id VARCHAR(255) DEFAULT NULL`);
            console.log('Added external_booking_id column to bookings table');
        } else {
             console.log('external_booking_id column already exists in bookings table');
        }

    } catch (error) {
        console.error('Error setting up DB:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setup();
