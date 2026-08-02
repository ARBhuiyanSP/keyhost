const mysql = require('d:/88i/booking-systme/backend/node_modules/mysql2');
const dotenv = require('d:/88i/booking-systme/backend/node_modules/dotenv');
dotenv.config({ path: 'd:/88i/booking-systme/backend/.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'keyhost_booking_system',
  port: process.env.DB_PORT || 3306,
});

const promisePool = pool.promise();

async function run() {
  try {
    const ownerId = 29; // From property_owners table
    
    // Query bookings for this owner
    const [bookings] = await promisePool.execute(`
      SELECT b.id, b.booking_reference, b.status, b.payment_status, b.booking_source, b.source, b.payment_method, 
             b.total_amount, b.property_owner_earnings, b.admin_commission_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
    `, [ownerId]);
    
    console.log('--- BOOKINGS ---');
    console.log(bookings);

    // Query payments for these bookings
    const [payments] = await promisePool.execute(`
      SELECT p.id, p.booking_id, p.cr_amount, p.payment_method, p.status
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties prop ON b.property_id = prop.id
      WHERE prop.owner_id = ?
    `, [ownerId]);
    
    console.log('\n--- PAYMENTS ---');
    console.log(payments);

    // Query payouts
    const [payouts] = await promisePool.execute(`
      SELECT op.id, op.property_owner_id, op.payment_status, op.total_earnings, op.created_at
      FROM owner_payouts op
      WHERE op.property_owner_id = ?
    `, [ownerId]);

    console.log('\n--- PAYOUTS ---');
    console.log(payouts);

    // Query payout items
    const [payoutItems] = await promisePool.execute(`
      SELECT opi.payout_id, opi.booking_id, opi.owner_earnings
      FROM owner_payout_items opi
      JOIN owner_payouts op ON opi.payout_id = op.id
      WHERE op.property_owner_id = ?
    `, [ownerId]);

    console.log('\n--- PAYOUT ITEMS ---');
    console.log(payoutItems);

    pool.end();
  } catch (err) {
    console.error(err);
    pool.end();
  }
}

run();
