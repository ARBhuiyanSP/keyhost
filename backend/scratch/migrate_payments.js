const { pool } = require('../config/database.js');

async function migrate() {
    try {
        console.log('Migrating payments table to add custom receipt fields...');
        
        // 1. Check & Add received_by
        const [receivedByCols] = await pool.query("SHOW COLUMNS FROM payments LIKE 'received_by'");
        if (receivedByCols.length === 0) {
            await pool.query("ALTER TABLE payments ADD COLUMN received_by VARCHAR(100) NULL");
            console.log('✅ Added received_by column');
        } else {
            console.log('ℹ️ received_by column already exists');
        }

        // 2. Check & Add account_name
        const [accountNameCols] = await pool.query("SHOW COLUMNS FROM payments LIKE 'account_name'");
        if (accountNameCols.length === 0) {
            await pool.query("ALTER TABLE payments ADD COLUMN account_name VARCHAR(100) NULL");
            console.log('✅ Added account_name column');
        } else {
            console.log('ℹ️ account_name column already exists');
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
