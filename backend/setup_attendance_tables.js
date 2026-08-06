const { pool } = require('./config/database');

const setupShiftManagement = async () => {
    try {
        console.log('Setting up Shift Management tables...');

        // 1. Rosters Table (Daily Shift Assignments)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hms_rosters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                host_id BIGINT UNSIGNED NOT NULL,
                employee_id INT NOT NULL,
                shift_id INT NULL, -- NULL means day off
                date DATE NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_employee_date (employee_id, date),
                FOREIGN KEY (employee_id) REFERENCES hms_employees(id) ON DELETE CASCADE,
                FOREIGN KEY (shift_id) REFERENCES hms_shifts(id) ON DELETE SET NULL,
                INDEX (host_id)
            ) ENGINE=InnoDB;
        `);

        // 2. Attendance Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hms_attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                host_id BIGINT UNSIGNED NOT NULL,
                employee_id INT NOT NULL,
                date DATE NOT NULL,
                punch_in DATETIME NULL,
                punch_out DATETIME NULL,
                punch_in_ip VARCHAR(45),
                punch_out_ip VARCHAR(45),
                status ENUM('present', 'late', 'absent', 'half_day') DEFAULT 'present',
                work_hours DECIMAL(5,2) DEFAULT 0,
                overtime_hours DECIMAL(5,2) DEFAULT 0,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_employee_attendance (employee_id, date),
                FOREIGN KEY (employee_id) REFERENCES hms_employees(id) ON DELETE CASCADE,
                INDEX (host_id)
            ) ENGINE=InnoDB;
        `);

        console.log('Shift Management tables created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up tables:', error);
        process.exit(1);
    }
};

setupShiftManagement();
