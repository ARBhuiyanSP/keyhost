const { pool } = require('../config/database');

async function fix() {
    try {
        console.log('Updating properties ENUM to include hotels...');
        await pool.execute("ALTER TABLE properties MODIFY COLUMN property_type ENUM('room','villa','apartment','house','hotel','hotels') NOT NULL");
        console.log('ENUM updated successfully.');
        
        // Also check sub status
        const [subs] = await pool.execute("SELECT status FROM hms_subscriptions");
        console.log('Current subscription statuses in DB:', subs.map(s => s.status));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

fix();
