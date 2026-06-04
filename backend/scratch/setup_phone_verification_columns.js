const { pool } = require('../config/database');

async function run() {
  try {
    console.log('Checking database table structure...');
    
    // Add columns if they do not exist
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM users LIKE 'phone_verification_otp'
    `);
    
    if (columns.length === 0) {
      console.log('Adding phone_verification_otp and phone_verification_expires_at to users table...');
      await pool.execute(`
        ALTER TABLE users 
        ADD COLUMN phone_verification_otp VARCHAR(6) NULL, 
        ADD COLUMN phone_verification_expires_at TIMESTAMP NULL
      `);
      console.log('Columns added successfully.');
    } else {
      console.log('Columns already exist.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
