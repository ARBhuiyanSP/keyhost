const mysql = require('mysql2');
require('dotenv').config();

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'keyhost_booking_system',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

console.log('🔄 Creating display_category_properties junction table...\n');

// Create table without foreign keys first
const createTableSQL = `
CREATE TABLE IF NOT EXISTS display_category_properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  display_category_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_property (display_category_id, property_id),
  INDEX idx_display_category_id (display_category_id),
  INDEX idx_property_id (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

connection.query(createTableSQL, (error, results) => {
  if (error) {
    console.error('❌ Failed to create table:', error.message);
    connection.end();
    process.exit(1);
  }

  console.log('✅ Table created successfully');

  // Add foreign keys separately
  const addFK1 = `
    ALTER TABLE display_category_properties 
    ADD CONSTRAINT fk_dcp_display_category 
    FOREIGN KEY (display_category_id) 
    REFERENCES display_categories(id) 
    ON DELETE CASCADE;
  `;

  const addFK2 = `
    ALTER TABLE display_category_properties 
    ADD CONSTRAINT fk_dcp_property 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE;
  `;

  // Check if constraints exist before adding
  connection.query(`
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'display_category_properties'
    AND CONSTRAINT_NAME IN ('fk_dcp_display_category', 'fk_dcp_property')
  `, (error, constraints) => {
    const existingConstraints = constraints.map(c => c.CONSTRAINT_NAME);
    
    if (!existingConstraints.includes('fk_dcp_display_category')) {
      connection.query(addFK1, (error) => {
        if (error && !error.message.includes('Duplicate')) {
          console.error('⚠️  Warning: Could not add FK1:', error.message);
        } else {
          console.log('✅ Foreign key 1 added');
        }
      });
    } else {
      console.log('✅ Foreign key 1 already exists');
    }

    if (!existingConstraints.includes('fk_dcp_property')) {
      connection.query(addFK2, (error) => {
        if (error && !error.message.includes('Duplicate')) {
          console.error('⚠️  Warning: Could not add FK2:', error.message);
        } else {
          console.log('✅ Foreign key 2 added');
          connection.end();
          console.log('\n✅ Migration completed successfully!');
          process.exit(0);
        }
      });
    } else {
      console.log('✅ Foreign key 2 already exists');
      connection.end();
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    }
  });
});

