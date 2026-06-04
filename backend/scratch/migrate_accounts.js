const { pool } = require('../config/database.js');

async function migrate() {
    try {
        console.log('Adding property_id to accounts tables...');
        
        await pool.query('ALTER TABLE hms_accounts_vouchers ADD COLUMN property_id BIGINT UNSIGNED NULL AFTER host_id');
        await pool.query('ALTER TABLE hms_accounts_transactions ADD COLUMN property_id BIGINT UNSIGNED NULL AFTER host_id');
        
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
