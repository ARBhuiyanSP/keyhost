const { pool } = require('../config/database');

async function fixHMS() {
    try {
        console.log('Synchronizing HMS Tables (Forced)...');

        // Disable FB checks to allow dropping referenced tables
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Drop existing hms_rooms
        await pool.execute('DROP TABLE IF EXISTS hms_rooms');

        // 2. Create hms_rooms with CORRECT structure
        await pool.execute(`
            CREATE TABLE hms_rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id BIGINT UNSIGNED NOT NULL,
                room_number VARCHAR(50) NOT NULL,
                room_type VARCHAR(100),
                floor VARCHAR(50),
                price DECIMAL(10, 2) NOT NULL,
                status ENUM('available', 'occupied', 'dirty', 'maintenance') DEFAULT 'available',
                features TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (property_id)
            )
        `);
        console.log('✅ hms_rooms table rebuilt successfully.');

        // Re-enable FK checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    } catch (e) {
        console.error('❌ Error synchronizing HMS:', e);
    } finally {
        process.exit(0);
    }
}

fixHMS();
