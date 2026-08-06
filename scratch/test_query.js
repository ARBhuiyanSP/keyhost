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
    const propertyOwnerId = 29;
    
    // Copy exact query from property-owner-earnings.js line 70-102
    const [currentMonthSummary] = await promisePool.execute(`
      SELECT
        COALESCE(COUNT(DISTINCT b.id), 0) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as total_booking_amount,
        COALESCE(SUM(b.admin_commission_amount), 0) as total_commission,
        COALESCE(SUM(b.property_owner_earnings), 0) as net_earnings,
        COALESCE(SUM(b.security_deposit_claim_amount), 0) as total_requested_claims,
        COALESCE(SUM(b.security_deposit_deduction_amount), 0) as total_received_claims,
        COALESCE(SUM(CASE WHEN b.payment_status = 'pending' THEN b.property_owner_earnings ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.property_owner_earnings ELSE 0 END), 0) as paid_amount,
        -- Withdrawable amount
        COALESCE(SUM(
          CASE WHEN completed_payouts.booking_id IS NULL
            AND (b.booking_source = 'website' OR b.source = 'Internal' OR b.payment_method = 'sslcommerz')
          THEN LEAST(
            b.property_owner_earnings,
            COALESCE((SELECT SUM(cr_amount) FROM payments WHERE booking_id = b.id AND payment_method != 'cash' AND status = 'completed'), 0) - b.admin_commission_amount
          ) ELSE 0 END
        ), 0) as withdrawable_amount,
        -- Available for payout (paid bookings not yet in payout requests)
        COALESCE(SUM(
          CASE WHEN b.payment_status = 'paid' AND b.status IN ('confirmed', 'checked_in', 'checked_out')
            AND (b.booking_source = 'website' OR b.source = 'Internal' OR b.payment_method = 'sslcommerz')
            AND b.id NOT IN (
              SELECT opi.booking_id 
              FROM owner_payout_items opi
              JOIN owner_payouts op ON opi.payout_id = op.id
              WHERE op.property_owner_id = ? AND op.payment_status IN ('pending', 'processing', 'completed')
            )
          THEN LEAST(
            b.property_owner_earnings,
            COALESCE((SELECT SUM(cr_amount) FROM payments WHERE booking_id = b.id AND payment_method != 'cash' AND status = 'completed'), 0) - b.admin_commission_amount
          ) ELSE 0 END
        ), 0) as available_for_payout
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN (
        SELECT DISTINCT opi.booking_id
        FROM owner_payout_items opi
        JOIN owner_payouts op ON opi.payout_id = op.id
        WHERE op.property_owner_id = ? AND op.payment_status = 'completed'
      ) completed_payouts ON b.id = completed_payouts.booking_id
      WHERE p.owner_id = ? 
      AND YEAR(b.created_at) = 2026 
      AND MONTH(b.created_at) = 6
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
    `, [propertyOwnerId, propertyOwnerId, propertyOwnerId]);

    console.log(currentMonthSummary);
    pool.end();
  } catch (err) {
    console.error(err);
    pool.end();
  }
}

run();
