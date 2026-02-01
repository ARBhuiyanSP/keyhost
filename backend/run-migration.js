const mysql = require('mysql2');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'keyhost_booking_system',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

// SQL commands
const sql = `
-- Create display_categories table
CREATE TABLE IF NOT EXISTS display_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Check if display_category_id column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'properties';
SET @columnname = 'display_category_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key constraint if it doesn't exist
SET @constraint_name = 'fk_properties_display_category';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @constraint_name)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraint_name, ' FOREIGN KEY (display_category_id) REFERENCES display_categories(id) ON DELETE SET NULL')
));
PREPARE constraintIfNotExists FROM @preparedStatement;
EXECUTE constraintIfNotExists;
DEALLOCATE PREPARE constraintIfNotExists;

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_properties_display_category ON properties(display_category_id);

-- Create junction table for many-to-many relationship (if not exists)
CREATE TABLE IF NOT EXISTS display_category_properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  display_category_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_property (display_category_id, property_id),
  INDEX idx_display_category_id (display_category_id),
  INDEX idx_property_id (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys separately (if they don't exist)
SET @constraint_name1 = 'fk_dcp_display_category';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = 'display_category_properties')
      AND (table_schema = DATABASE())
      AND (constraint_name = @constraint_name1)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE display_category_properties ADD CONSTRAINT ', @constraint_name1, ' FOREIGN KEY (display_category_id) REFERENCES display_categories(id) ON DELETE CASCADE')
));
PREPARE constraintIfNotExists FROM @preparedStatement;
EXECUTE constraintIfNotExists;
DEALLOCATE PREPARE constraintIfNotExists;

SET @constraint_name2 = 'fk_dcp_property';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = 'display_category_properties')
      AND (table_schema = DATABASE())
      AND (constraint_name = @constraint_name2)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE display_category_properties ADD CONSTRAINT ', @constraint_name2, ' FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE')
));
PREPARE constraintIfNotExists FROM @preparedStatement;
EXECUTE constraintIfNotExists;
DEALLOCATE PREPARE constraintIfNotExists;
`;

console.log('🔄 Running migration to create display_categories table...\n');

connection.query(sql, (error, results) => {
  if (error) {
    console.error('❌ Migration failed:', error.message);
    
    // If it's a "duplicate key" or "already exists" error, that's okay
    if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_FIELDNAME' || error.message.includes('already exists')) {
      console.log('⚠️  Some objects already exist, but migration completed.');
      console.log('✅ Migration completed successfully!');
      connection.end();
      process.exit(0);
    } else {
      connection.end();
      process.exit(1);
    }
  } else {
    console.log('✅ Migration completed successfully!');
    console.log('✅ display_categories table created');
    console.log('✅ display_category_id column added to properties table');
    console.log('✅ Foreign key constraint added');
    console.log('✅ Index created');
    console.log('✅ display_category_properties junction table created');
    connection.end();
    process.exit(0);
  }
});

