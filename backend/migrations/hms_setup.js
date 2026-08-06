const { pool } = require('../config/database');

async function migrate() {
    try {
        console.log('Starting HMS Migration...');

        // Add HMS flag to properties
        const [columns] = await pool.execute("SHOW COLUMNS FROM properties LIKE 'is_hms_enabled'");
        if (columns.length === 0) {
            await pool.execute('ALTER TABLE properties ADD COLUMN is_hms_enabled BOOLEAN DEFAULT FALSE');
            console.log('Added is_hms_enabled to properties');
        }

        const [catColumn] = await pool.execute("SHOW COLUMNS FROM properties LIKE 'property_category'");
        if (catColumn.length === 0) {
            await pool.execute("ALTER TABLE properties ADD COLUMN property_category ENUM('standard', 'hotel') DEFAULT 'standard'");
            console.log('Added property_category to properties');
        }

        // Create Rooms table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS hms_rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT NOT NULL,
                room_number VARCHAR(50) NOT NULL,
                room_type VARCHAR(100),
                floor VARCHAR(20),
                price DECIMAL(15, 2) NOT NULL,
                status ENUM('available', 'occupied', 'dirty', 'maintenance') DEFAULT 'available',
                features JSON,
                images JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
        console.log('Created hms_rooms table');

        // Add hms_room_id to bookings
        const [bookingCols] = await pool.execute("SHOW COLUMNS FROM bookings LIKE 'hms_room_id'");
        if (bookingCols.length === 0) {
            await pool.execute('ALTER TABLE bookings ADD COLUMN hms_room_id INT NULL AFTER property_id');
            await pool.execute('ALTER TABLE bookings ADD FOREIGN KEY (hms_room_id) REFERENCES hms_rooms(id) ON DELETE SET NULL');
            console.log('Added hms_room_id to bookings');
        }

        console.log('HMS Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
