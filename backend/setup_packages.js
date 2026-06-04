const { pool } = require('./config/database.js');

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hms_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
        trial_days INT DEFAULT 14,
        features JSON,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM hms_packages');
    if (rows[0].cnt === 0) {
      await pool.query(`
        INSERT INTO hms_packages (name, price, billing_cycle, trial_days, features) 
        VALUES ('HMS Premium', 49.00, 'monthly', 14, '["Advanced Room Inventory", "Staff Check-in Management", "Extra Service Billing"]')
      `);
    }

    try {
      await pool.query('ALTER TABLE hms_subscriptions ADD COLUMN package_id INT');
      await pool.query('ALTER TABLE hms_subscriptions ADD FOREIGN KEY (package_id) REFERENCES hms_packages(id) ON DELETE SET NULL');
    } catch(e) {
      if(e.code !== 'ER_DUP_FIELDNAME') console.log('Alter subscription error handled: ', e.message);
    }
    console.log('Successfully setup packages!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
setup();
