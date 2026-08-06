const { pool } = require('./config/database');

async function setupDB() {
    try {
        console.log('Creating payment_settings table...');
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_name VARCHAR(50) NOT NULL UNIQUE,
        store_id VARCHAR(255) NOT NULL,
        store_password VARCHAR(255) NOT NULL,
        is_live BOOLEAN DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'BDT',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        console.log('Inserting default SSLCommerz config...');
        await pool.execute(`
      INSERT IGNORE INTO payment_settings (provider_name, store_id, store_password, is_live)
      VALUES ('sslcommerz', 'testbox', 'qwerty', 0)
    `);

        console.log('Creating orders table for SSLCommerz...');
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NULL,
        tran_id VARCHAR(100) NOT NULL UNIQUE,
        val_id VARCHAR(100) NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        console.log('SSLCommerz tables created successfully.');
    } catch (error) {
        console.error('Error in DB setup:', error);
    } finally {
        process.exit(0);
    }
}

setupDB();
