const { pool } = require('../config/database.js');

async function runMigration() {
  try {
    console.log("Starting auto-accept database migration...");

    // 1. Check if column already exists on properties table
    const [columns] = await pool.execute(`
      SHOW COLUMNS FROM properties LIKE 'auto_accept_bookings'
    `);

    if (columns.length === 0) {
      console.log("Adding column 'auto_accept_bookings' to 'properties' table...");
      await pool.execute(`
        ALTER TABLE properties ADD COLUMN auto_accept_bookings TINYINT(1) NOT NULL DEFAULT 0
      `);
      console.log("Column added successfully.");
    } else {
      console.log("Column 'auto_accept_bookings' already exists on 'properties' table.");
    }

    // 2. Sync existing properties to match their host's global auto_accept_bookings value
    console.log("Syncing existing properties' auto_accept_bookings with host profile settings...");
    const [result] = await pool.execute(`
      UPDATE properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      SET p.auto_accept_bookings = u.auto_accept_bookings
    `);

    console.log(`Migration sync completed. Rows updated: ${result.affectedRows}`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

runMigration();
