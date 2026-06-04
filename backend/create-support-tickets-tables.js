const { pool } = require('./config/database');

const createSupportTables = async () => {
  try {
    console.log('🚀 Starting Support Ticketing System migration...');

    // 1. Create Tickets Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        guest_id BIGINT(20) UNSIGNED NOT NULL,
        host_id BIGINT(20) UNSIGNED DEFAULT NULL,
        property_id BIGINT(20) UNSIGNED DEFAULT NULL,
        subject VARCHAR(255) NOT NULL,
        category ENUM('Cleaning', 'WiFi', 'Payment', 'Maintenance', 'Other') DEFAULT 'Other',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tickets table created successfully');

    // 2. Create Ticket Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        ticket_id BIGINT(20) UNSIGNED NOT NULL,
        sender_id BIGINT(20) UNSIGNED NOT NULL,
        sender_role ENUM('guest', 'host', 'admin') NOT NULL,
        message TEXT NOT NULL,
        attachment_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Ticket Messages table created successfully');

    console.log('✨ Support migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

createSupportTables();
