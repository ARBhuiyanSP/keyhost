const { pool } = require('../config/database');

async function migrate() {
    try {
        console.log('Adding security deposit claim columns to bookings table...');
        await pool.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS security_deposit_claim_amount DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS security_deposit_claim_reason TEXT,
            ADD COLUMN IF NOT EXISTS security_deposit_claim_at TIMESTAMP NULL;
        `);
        console.log('✅ Columns added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
