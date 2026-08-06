const { pool } = require('../config/database');

async function checkData() {
  try {
    const [transactions] = await pool.query(`
      SELECT t.*, h.name as head_name, h.type as head_type 
      FROM hms_accounts_transactions t 
      JOIN hms_accounts_heads h ON t.account_head_id = h.id
    `);
    console.log('--- HMS ACCOUNTS TRANSACTIONS ---');
    console.log(transactions);

    const [bookings] = await pool.query(`
      SELECT id, booking_reference, total_amount, security_deposit, admin_commission_amount, property_owner_earnings, security_deposit_deduction_amount, security_deposit_status, status, payment_status 
      FROM bookings
    `);
    console.log('--- BOOKINGS ---');
    console.log(bookings);

    const [payments] = await pool.query(`
      SELECT id, booking_id, amount, dr_amount, cr_amount, transaction_type, payment_method 
      FROM payments
    `);
    console.log('--- PAYMENTS ---');
    console.log(payments);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkData();
