const { pool } = require('./backend/config/database');

async function migrate() {
  try {
    // Check if column already exists
    const [cols] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'properties' AND COLUMN_NAME = 'internal_name'"
    );
    if (cols.length > 0) {
      console.log('internal_name column already exists, skipping.');
      process.exit(0);
    }
    await pool.execute(
      "ALTER TABLE properties ADD COLUMN internal_name VARCHAR(255) NULL DEFAULT NULL AFTER title"
    );
    console.log('SUCCESS: internal_name column added to properties table.');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
}

migrate();
