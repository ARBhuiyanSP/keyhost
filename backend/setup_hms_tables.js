const { pool } = require('./config/database.js');

async function setupHMSTables() {
  try {
    console.log('Creating HMS tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        status ENUM('active', 'inactive', 'trialing', 'expired') DEFAULT 'inactive',
        plan_type ENUM('basic', 'premium') DEFAULT 'basic',
        trial_started_at DATETIME NULL,
        trial_ends_at DATETIME NULL,
        subscription_ends_at DATETIME NULL,
        is_trial_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_host (host_id)
      )
    `);
    console.log('hms_subscriptions table created or already exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_staff_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('hms_staff_members table created or already exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_room_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        base_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('hms_room_types table created or already exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        room_type_id INT NOT NULL,
        room_number VARCHAR(50) NOT NULL,
        status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('hms_rooms table created or already exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        booking_id BIGINT UNSIGNED NULL,
        guest_name VARCHAR(255) NULL,
        service_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('hms_bills table created or already exists.');

    console.log('All HMS tables are set up.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating HMS tables:', error);
    process.exit(1);
  }
}

setupHMSTables();
