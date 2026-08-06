const path = require('path');
const { pool } = require('../config/database');

async function runMigration() {
  console.log('🚀 Running Bus System Database Migration...');
  try {
    // 1. bus_operators table
    console.log('📦 Creating table: bus_operators');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bus_operators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operator_name VARCHAR(255) NOT NULL,
        operator_code VARCHAR(100) UNIQUE NOT NULL,
        logo_url VARCHAR(550) DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. bus_schedules table
    console.log('📦 Creating table: bus_schedules');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bus_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operator_id INT NOT NULL,
        bus_number VARCHAR(100) NOT NULL,
        bus_type VARCHAR(100) NOT NULL,
        is_ac TINYINT(1) DEFAULT 1,
        from_city VARCHAR(100) NOT NULL,
        to_city VARCHAR(100) NOT NULL,
        departure_time VARCHAR(50) NOT NULL,
        arrival_time VARCHAR(50) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        price_per_seat DECIMAL(10,2) NOT NULL,
        total_seats INT DEFAULT 40,
        seat_plan VARCHAR(50) DEFAULT '2x2',
        boarding_points TEXT,
        dropping_points TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. bus_bookings table
    console.log('📦 Creating table: bus_bookings');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bus_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_ref VARCHAR(100) UNIQUE NOT NULL,
        schedule_id INT NOT NULL,
        passenger_name VARCHAR(255) NOT NULL,
        passenger_phone VARCHAR(50) NOT NULL,
        passenger_email VARCHAR(191) DEFAULT NULL,
        seat_numbers TEXT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        boarding_point VARCHAR(255) NOT NULL,
        dropping_point VARCHAR(255) NOT NULL,
        journey_date DATE NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Paid',
        booking_status VARCHAR(50) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default operators if empty
    console.log('🌱 Seeding initial operators & schedules if empty...');
    await pool.query(`
      INSERT IGNORE INTO bus_operators (id, operator_name, operator_code) VALUES
      (1, 'Green Line Paribahan', 'GREENLINE'),
      (2, 'Hanif Enterprise', 'HANIF'),
      (3, 'Shohag Elite', 'SHOHAG'),
      (4, 'Ena Transport', 'ENA'),
      (5, 'Shyamoli Paribahan', 'SHYAMOLI');
    `);

    const [existingSchedules] = await pool.query('SELECT COUNT(*) as total FROM bus_schedules');
    if (existingSchedules[0].total === 0) {
      await pool.query(`
        INSERT INTO bus_schedules 
        (operator_id, bus_number, bus_type, is_ac, from_city, to_city, departure_time, arrival_time, duration, price_per_seat, total_seats, boarding_points, dropping_points)
        VALUES
        (1, 'Dhaka Metro-BA 11-4567', 'AC Volvo Multi-Axle', 1, 'Dhaka', 'Cox''s Bazar', '10:00 PM', '06:00 AM', '8h 00m', 1800.00, 40, '["Arambagh Counter (10:00 PM)", "Kalabagan Counter (10:30 PM)", "Sayedabad (11:00 PM)"]', '["Kolatoli Point (06:00 AM)", "Dolphin Goli (06:15 AM)"]'),
        (2, 'Dhaka Metro-BA 14-8890', 'AC Scania Luxury', 1, 'Dhaka', 'Cox''s Bazar', '11:15 PM', '07:15 AM', '8h 00m', 1500.00, 40, '["Gabtoli Counter (10:45 PM)", "Kalabagan (11:15 PM)"]', '["Sugandha Beach (07:15 AM)", "Kolatoli (07:30 AM)"]'),
        (3, 'Dhaka Metro-BA 09-1234', 'Non-AC Hino Chair Coach', 0, 'Dhaka', 'Cox''s Bazar', '08:30 PM', '05:00 AM', '8h 30m', 900.00, 40, '["Arambagh Counter (08:30 PM)", "Sayedabad (09:00 PM)"]', '["Bus Terminal (05:00 AM)"]'),
        (4, 'Dhaka Metro-BA 15-9988', 'AC Hyundai Business', 1, 'Dhaka', 'Cox''s Bazar', '09:30 PM', '05:30 AM', '8h 00m', 1600.00, 36, '["Uttara Counter (08:45 PM)", "Mohakhali (09:30 PM)"]', '["Kolatoli (05:30 AM)"]'),
        (5, 'Dhaka Metro-BA 08-7711', 'Non-AC Deluxe', 0, 'Dhaka', 'Cox''s Bazar', '11:45 PM', '08:15 AM', '8h 30m', 850.00, 40, '["Sayedabad (11:45 PM)"]', '["Kolatoli (08:15 AM)"]');
      `);
      console.log('✅ Bus schedules seeded successfully!');
    }

    console.log('🎉 Bus System Migration Finished Successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    process.exit();
  }
}

runMigration();
