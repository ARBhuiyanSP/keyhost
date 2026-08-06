const { pool } = require('../backend/config/database');

async function setupHMSTables() {
  try {
    console.log('Setting up HMS tables...');

    // 1. Staff Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hms_staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id BIGINT(20) UNSIGNED NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        role ENUM('manager', 'receptionist', 'housekeeping', 'maintenance', 'security', 'other') NOT NULL DEFAULT 'other',
        salary DECIMAL(10, 2),
        joining_date DATE,
        status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ hms_staff table ensured');

    // 2. Expenses Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hms_expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id BIGINT(20) UNSIGNED NOT NULL,
        category ENUM('utility', 'maintenance', 'inventory', 'marketing', 'staff_salary', 'other') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        expense_date DATE NOT NULL,
        payment_method ENUM('cash', 'bank_transfer', 'card', 'mobile_banking') DEFAULT 'cash',
        receipt_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ hms_expenses table ensured');

    console.log('HMS Table Setup Complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up HMS tables:', error);
    process.exit(1);
  }
}

setupHMSTables();
