const { pool } = require('../config/database');

async function runMigration() {
  try {
    console.log('Running migration: Add MFS columns to property_owners table...');
    
    // 1. Add mfs_provider column
    await pool.query(`
      ALTER TABLE property_owners 
      ADD COLUMN IF NOT EXISTS mfs_provider VARCHAR(20) DEFAULT NULL AFTER bank_routing_number
    `);
    console.log('Column mfs_provider added or already exists.');

    // 2. Add mfs_wallet_number column
    await pool.query(`
      ALTER TABLE property_owners 
      ADD COLUMN IF NOT EXISTS mfs_wallet_number VARCHAR(20) DEFAULT NULL AFTER mfs_provider
    `);
    console.log('Column mfs_wallet_number added or already exists.');

    // 3. Add mfs_account_name column
    await pool.query(`
      ALTER TABLE property_owners 
      ADD COLUMN IF NOT EXISTS mfs_account_name VARCHAR(100) DEFAULT NULL AFTER mfs_wallet_number
    `);
    console.log('Column mfs_account_name added or already exists.');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
