const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupAdminCommissionSimple() {
  console.log('🚀 Setting up Admin Commission System (Simple Version)...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'keyhost_booking_system'
    });

    console.log('📊 Connected to database successfully');

    // Create admin_earnings table
    console.log('📊 Creating admin_earnings table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_earnings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        booking_id BIGINT UNSIGNED NOT NULL,
        property_id BIGINT UNSIGNED NOT NULL,
        property_owner_id BIGINT UNSIGNED NOT NULL,
        booking_total DECIMAL(10, 2) NOT NULL,
        commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
        commission_amount DECIMAL(10, 2) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 0.00,
        tax_amount DECIMAL(10, 2) DEFAULT 0.00,
        net_commission DECIMAL(10, 2) NOT NULL,
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        payment_date TIMESTAMP NULL,
        payment_method VARCHAR(50) NULL,
        payment_reference VARCHAR(100) NULL,
        status ENUM('active', 'cancelled', 'refunded') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (property_owner_id) REFERENCES property_owners(id) ON DELETE CASCADE,
        INDEX idx_booking_id (booking_id),
        INDEX idx_property_id (property_id),
        INDEX idx_property_owner_id (property_owner_id),
        INDEX idx_payment_status (payment_status),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ admin_earnings table created');

    // Create admin_earnings_summary table
    console.log('📊 Creating admin_earnings_summary table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_earnings_summary (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        year INT NOT NULL,
        month INT NOT NULL,
        total_bookings INT DEFAULT 0,
        total_booking_amount DECIMAL(12, 2) DEFAULT 0.00,
        total_commission DECIMAL(12, 2) DEFAULT 0.00,
        total_tax DECIMAL(12, 2) DEFAULT 0.00,
        net_earnings DECIMAL(12, 2) DEFAULT 0.00,
        pending_amount DECIMAL(12, 2) DEFAULT 0.00,
        paid_amount DECIMAL(12, 2) DEFAULT 0.00,
        failed_amount DECIMAL(12, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_year_month (year, month),
        INDEX idx_year_month (year, month)
      )
    `);
    console.log('✅ admin_earnings_summary table created');

    // Create admin_payouts table
    console.log('📊 Creating admin_payouts table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_payouts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        payout_reference VARCHAR(50) UNIQUE NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_earnings DECIMAL(12, 2) NOT NULL,
        total_tax DECIMAL(12, 2) DEFAULT 0.00,
        net_payout DECIMAL(12, 2) NOT NULL,
        payment_method ENUM('bank_transfer', 'paypal', 'stripe', 'cash') NOT NULL,
        payment_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        payment_date TIMESTAMP NULL,
        payment_reference VARCHAR(100) NULL,
        bank_name VARCHAR(100) NULL,
        account_number VARCHAR(50) NULL,
        routing_number VARCHAR(20) NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_payout_reference (payout_reference),
        INDEX idx_payment_status (payment_status),
        INDEX idx_start_date (start_date),
        INDEX idx_end_date (end_date)
      )
    `);
    console.log('✅ admin_payouts table created');

    // Add commission fields to bookings table
    console.log('📊 Adding commission fields to bookings table...');
    try {
      await connection.execute(`
        ALTER TABLE bookings 
        ADD COLUMN admin_commission_rate DECIMAL(5, 2) DEFAULT 10.00 AFTER tax_amount
      `);
      console.log('✅ Added admin_commission_rate column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  admin_commission_rate column already exists');
      } else {
        throw error;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE bookings 
        ADD COLUMN admin_commission_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER admin_commission_rate
      `);
      console.log('✅ Added admin_commission_amount column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  admin_commission_amount column already exists');
      } else {
        throw error;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE bookings 
        ADD COLUMN property_owner_earnings DECIMAL(10, 2) DEFAULT 0.00 AFTER admin_commission_amount
      `);
      console.log('✅ Added property_owner_earnings column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  property_owner_earnings column already exists');
      } else {
        throw error;
      }
    }

    // Insert commission settings
    console.log('📊 Adding commission settings...');
    await connection.execute(`
      INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
      ('admin_commission_rate', '10.00', 'number', 'Default admin commission rate percentage', false),
      ('admin_tax_rate', '0.00', 'number', 'Tax rate on admin commission', false),
      ('commission_calculation_method', 'percentage', 'string', 'Commission calculation method (percentage or fixed)', false),
      ('minimum_payout_amount', '100.00', 'number', 'Minimum amount required for payout', false),
      ('payout_frequency', 'monthly', 'string', 'Payout frequency (weekly, monthly, quarterly)', false)
      ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value),
      updated_at = NOW()
    `);
    console.log('✅ Commission settings added');

    await connection.end();

    console.log('');
    console.log('✅ Admin commission system setup completed successfully!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   • admin_earnings table - tracks commission from each booking');
    console.log('   • admin_earnings_summary table - monthly earnings summaries');
    console.log('   • admin_payouts table - payout management');
    console.log('   • Commission fields added to bookings table');
    console.log('   • System settings for commission rates');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Access /admin/earnings in the frontend');
    console.log('   3. Test with a booking to see commission calculation');

  } catch (error) {
    console.error('❌ Failed to setup admin commission system');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupAdminCommissionSimple();


