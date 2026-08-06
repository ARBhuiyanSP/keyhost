const { pool } = require('../config/database');

async function migrate() {
    try {
        console.log('Migrating hms_rooms images to JSON array...');
        
        // 1. Add 'images' column
        await pool.query('ALTER TABLE hms_rooms ADD COLUMN images JSON AFTER features');
        
        // 2. Transfer existing 'image_url' data if any (as the first element of the array)
        await pool.query(`
            UPDATE hms_rooms 
            SET images = JSON_ARRAY(image_url) 
            WHERE image_url IS NOT NULL AND image_url != ''
        `);
        
        // 3. Drop old column
        await pool.query('ALTER TABLE hms_rooms DROP COLUMN image_url');
        
        console.log('✅ Migration successful');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
