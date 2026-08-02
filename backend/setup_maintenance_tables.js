const { pool } = require('./config/database.js');

async function setupMaintenanceTables() {
  try {
    console.log('Creating HMS Maintenance tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_maintenance_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        property_id BIGINT UNSIGNED NOT NULL,
        room_id INT DEFAULT NULL,
        task_type VARCHAR(100) NOT NULL,
        description TEXT,
        cost DECIMAL(10, 2) DEFAULT 0.00,
        status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_interval INT DEFAULT 0,
        next_due_date DATE DEFAULT NULL,
        created_by BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES hms_rooms(id) ON DELETE SET NULL
      )
    `);
    console.log('hms_maintenance_tasks table created or already exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_maintenance_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_host_type_name (host_id, name)
      )
    `);
    console.log('hms_maintenance_types table created or already exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_maintenance_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        host_id BIGINT UNSIGNED NOT NULL,
        notification_date DATE NOT NULL,
        is_sent BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP NULL,
        FOREIGN KEY (task_id) REFERENCES hms_maintenance_tasks(id) ON DELETE CASCADE
      )
    `);
    console.log('hms_maintenance_notifications table created or already exists.');

    console.log('All HMS Maintenance tables are set up.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating HMS Maintenance tables:', error);
    process.exit(1);
  }
}

setupMaintenanceTables();
