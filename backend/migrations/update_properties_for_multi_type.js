const { pool } = require('../config/database');

async function runMigration() {
  try {
    console.log('Running migration: Add is_single_unit to properties...');
    
    // 1. Add is_single_unit column to properties table if it doesn't exist
    await pool.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS is_single_unit TINYINT(1) DEFAULT 0 AFTER is_hms_enabled
    `);
    console.log('Column is_single_unit added or already exists.');

    // 2. Set is_single_unit = 1 for existing single-unit properties (villa, apartment, house, room)
    // and is_single_unit = 0 for hotels.
    await pool.query(`
      UPDATE properties 
      SET is_single_unit = 1 
      WHERE property_type IN ('villa', 'apartment', 'house', 'room')
    `);
    console.log('Updated existing properties: Set is_single_unit = 1 for villa, apartment, house, room.');

    await pool.query(`
      UPDATE properties 
      SET is_single_unit = 0 
      WHERE property_type IN ('hotel', 'hotels')
    `);
    console.log('Updated existing properties: Set is_single_unit = 0 for hotel, hotels.');

    // 3. Ensure property_types table has the correct items matching the enum
    const defaultTypes = [
      { name: 'Room', icon_url: '/images/nav-icon-room.png', sort_order: 1 },
      { name: 'Apartment', icon_url: '/images/nav-icon-apartment.png', sort_order: 2 },
      { name: 'Villa', icon_url: '/images/nav-icon-villa.png', sort_order: 3 },
      { name: 'House', icon_url: '/images/nav-icon-house.png', sort_order: 4 },
      { name: 'Hotel', icon_url: '/images/nav-icon-hotel.png', sort_order: 5 }
    ];

    for (const type of defaultTypes) {
      await pool.query(`
        INSERT INTO property_types (name, icon_url, sort_order, is_active) 
        VALUES (?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE icon_url = VALUES(icon_url), sort_order = VALUES(sort_order)
      `, [type.name, type.icon_url, type.sort_order]);
    }
    console.log('Seeded property_types table.');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
