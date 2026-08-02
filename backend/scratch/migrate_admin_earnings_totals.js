const { pool } = require('../config/database');

async function migrateAdminEarnings() {
  try {
    console.log('--- MIGRATING ADMIN EARNINGS BOOKING_TOTAL VALUES ---');
    
    // 1. Update the booking_total in admin_earnings for all entries to be total_amount - security_deposit
    const [result] = await pool.execute(`
      UPDATE admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      SET ae.booking_total = b.total_amount - b.security_deposit
    `);
    
    console.log(`Updated ${result.affectedRows} rows successfully!`);

    // 2. Select and log to verify
    const [rows] = await pool.execute(`
      SELECT 
        ae.id, ae.booking_id, ae.booking_total, 
        b.security_deposit, b.total_amount,
        ae.commission_amount, ae.net_commission
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
    `);
    console.log('--- UPDATED ADMIN EARNINGS ROWS ---');
    console.log(rows);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrateAdminEarnings();
