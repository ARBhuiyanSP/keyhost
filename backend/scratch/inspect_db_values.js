const { pool } = require('../config/database');

async function inspectValues() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ae.id, ae.booking_id, ae.booking_total, 
        b.security_deposit, b.total_amount,
        ae.commission_amount, ae.net_commission
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
    `);
    console.log('--- ADMIN EARNINGS ROWS ---');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspectValues();
