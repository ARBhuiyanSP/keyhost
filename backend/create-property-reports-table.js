const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

console.log('🔄 Creating property_reports table...\n');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS property_reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  reason VARCHAR(255) NOT NULL,
  detail VARCHAR(255) NULL,
  status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_property_id (property_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

connection.query(createTableSQL, (error, results) => {
    if (error) {
        console.error('❌ Failed to create table:', error.message);
        connection.end();
        process.exit(1);
    }

    console.log('✅ Table created successfully');
    connection.end();
    process.exit(0);
});
