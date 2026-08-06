const { pool } = require('../config/database');

async function migrate() {
    try {
        console.log('Adding image_url column to hms_rooms...');
        await pool.query('ALTER TABLE hms_rooms ADD COLUMN image_url VARCHAR(255) AFTER features');
        console.log('✅ Migration successful');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('ℹ️ Column image_url already exists');
        } else {
            console.error('❌ Migration failed:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
