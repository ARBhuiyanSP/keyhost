const { pool } = require('./config/database.js');

async function setupHRTables() {
  try {
    console.log('Setting up Human Resource tables...');

    // 1. Update users table for staff support
    console.log('Updating users table...');
    try {
      await pool.query(`
        ALTER TABLE users 
        MODIFY COLUMN user_type ENUM('admin', 'property_owner', 'guest', 'staff') NOT NULL DEFAULT 'guest',
        ADD COLUMN IF NOT EXISTS host_id BIGINT UNSIGNED NULL AFTER user_type
      `);
      console.log('Users table updated successfully.');
    } catch (err) {
      console.log('Note: Users table update might have already been applied or failed partially:', err.message);
    }

    // 2. Departments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (host_id)
      )
    `);
    console.log('hms_departments table created.');

    // 3. Designations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_designations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (host_id)
      )
    `);
    console.log('hms_designations table created.');

    // 4. Shifts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (host_id)
      )
    `);
    console.log('hms_shifts table created.');

    // 5. Employees
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NULL, -- Link to users table for login
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        salary DECIMAL(10,2) NOT NULL,
        designation_id INT NULL,
        department_id INT NULL,
        shift_id INT NULL,
        blood_group VARCHAR(5) NULL,
        date_of_birth DATE NULL,
        appointment_date DATE NULL,
        joining_date DATE NULL,
        address TEXT NULL,
        photo VARCHAR(255) NULL,
        status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
        role VARCHAR(50) DEFAULT 'staff', -- For permissions
        permissions JSON NULL, -- Store granular permissions
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (designation_id) REFERENCES hms_designations(id) ON DELETE SET NULL,
        FOREIGN KEY (department_id) REFERENCES hms_departments(id) ON DELETE SET NULL,
        FOREIGN KEY (shift_id) REFERENCES hms_shifts(id) ON DELETE SET NULL,
        INDEX (host_id),
        INDEX (user_id)
      )
    `);
    console.log('hms_employees table created.');

    // 6. Allowances
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_allowances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        amount_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (host_id)
      )
    `);
    console.log('hms_allowances table created.');

    // 7. Deductions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_deductions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        amount_type ENUM('fixed', 'percentage') DEFAULT 'fixed',
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (host_id)
      )
    `);
    console.log('hms_deductions table created.');

    // 8. Payrolls
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_payrolls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        host_id BIGINT UNSIGNED NOT NULL,
        employee_id INT NOT NULL,
        month VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        basic_salary DECIMAL(10,2) NOT NULL,
        total_allowance DECIMAL(10,2) DEFAULT 0,
        total_deduction DECIMAL(10,2) DEFAULT 0,
        net_salary DECIMAL(10,2) NOT NULL,
        payment_date DATE NULL,
        status ENUM('pending', 'paid') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES hms_employees(id) ON DELETE CASCADE,
        INDEX (host_id)
      )
    `);
    console.log('hms_payrolls table created.');

    console.log('All HR tables set up successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up HR tables:', error);
    process.exit(1);
  }
}

setupHRTables();
