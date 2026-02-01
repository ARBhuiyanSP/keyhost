const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupOwnerPayouts() {
  console.log('🚀 Setting up Owner Payouts System...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'keyhost_booking_system'
    });

    console.log('📊 Connected to database successfully');

    // Create owner_payouts table
    console.log('📊 Creating owner_payouts table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS owner_payouts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        property_owner_id BIGINT UNSIGNED NOT NULL,
        payout_reference VARCHAR(50) UNIQUE NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_earnings DECIMAL(12, 2) NOT NULL,
        total_commission_paid DECIMAL(12, 2) DEFAULT 0.00,
        net_payout DECIMAL(12, 2) NOT NULL,
        payment_method ENUM('bank_transfer', 'bkash', 'nagad', 'rocket', 'cash') NOT NULL,
        payment_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        payment_date TIMESTAMP NULL,
        payment_reference VARCHAR(100) NULL,
        bank_name VARCHAR(100) NULL,
        account_number VARCHAR(50) NULL,
        routing_number VARCHAR(20) NULL,
        mobile_number VARCHAR(20) NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (property_owner_id) REFERENCES property_owners(id) ON DELETE CASCADE,
        INDEX idx_property_owner_id (property_owner_id),
        INDEX idx_payout_reference (payout_reference),
        INDEX idx_payment_status (payment_status),
        INDEX idx_start_date (start_date),
        INDEX idx_end_date (end_date)
      )
    `);
    console.log('✅ owner_payouts table created');

    // Create owner_balances table
    console.log('📊 Creating owner_balances table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS owner_balances (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        property_owner_id BIGINT UNSIGNED NOT NULL,
        total_earnings DECIMAL(12, 2) DEFAULT 0.00,
        total_payouts DECIMAL(12, 2) DEFAULT 0.00,
        current_balance DECIMAL(12, 2) DEFAULT 0.00,
        commission_paid_to_admin DECIMAL(12, 2) DEFAULT 0.00,
        commission_pending DECIMAL(12, 2) DEFAULT 0.00,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (property_owner_id) REFERENCES property_owners(id) ON DELETE CASCADE,
        UNIQUE KEY unique_owner (property_owner_id),
        INDEX idx_property_owner_id (property_owner_id),
        INDEX idx_current_balance (current_balance)
      )
    `);
    console.log('✅ owner_balances table created');

    // Create owner_payout_items table
    console.log('📊 Creating owner_payout_items table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS owner_payout_items (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        payout_id BIGINT UNSIGNED NOT NULL,
        booking_id BIGINT UNSIGNED NOT NULL,
        booking_total DECIMAL(10, 2) NOT NULL,
        admin_commission DECIMAL(10, 2) NOT NULL,
        owner_earnings DECIMAL(10, 2) NOT NULL,
        commission_paid_to_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payout_id) REFERENCES owner_payouts(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        INDEX idx_payout_id (payout_id),
        INDEX idx_booking_id (booking_id)
      )
    `);
    console.log('✅ owner_payout_items table created');

    // Initialize owner balances
    console.log('📊 Initializing owner balances...');
    await connection.execute(`
      INSERT INTO owner_balances (property_owner_id, total_earnings, total_payouts, current_balance, commission_paid_to_admin, commission_pending)
      SELECT 
        po.id,
        COALESCE(SUM(b.property_owner_earnings), 0) as total_earnings,
        0 as total_payouts,
        COALESCE(SUM(b.property_owner_earnings), 0) as current_balance,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.commission_amount ELSE 0 END), 0) as commission_paid_to_admin,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.commission_amount ELSE 0 END), 0) as commission_pending
      FROM property_owners po
      LEFT JOIN properties p ON po.id = p.owner_id
      LEFT JOIN bookings b ON p.id = b.property_id AND b.payment_status = 'paid'
      LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
      GROUP BY po.id
      ON DUPLICATE KEY UPDATE
        total_earnings = VALUES(total_earnings),
        current_balance = VALUES(current_balance),
        commission_paid_to_admin = VALUES(commission_paid_to_admin),
        commission_pending = VALUES(commission_pending),
        last_updated = NOW()
    `);
    console.log('✅ Owner balances initialized');

    await connection.end();

    console.log('');
    console.log('✅ Owner payouts system setup completed successfully!');
    console.log('');
    console.log('📋 What was created:');
    console.log('   • owner_payouts table - tracks payouts to property owners');
    console.log('   • owner_balances table - tracks current balances per owner');
    console.log('   • owner_payout_items table - detailed breakdown of payout items');
    console.log('   • Initial balance records for existing owners');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Add owner payout endpoints to admin routes');
    console.log('   2. Update AdminAccounting UI');
    console.log('   3. Test the complete flow');

  } catch (error) {
    console.error('❌ Failed to setup owner payouts system');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupOwnerPayouts();

