const { pool } = require('../config/database');

async function clean() {
  const connection = await pool.getConnection();
  try {
    console.log('=== STARTING BOOKING DATA CLEANUP ===');
    await connection.beginTransaction();

    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✔ Foreign key checks disabled');

    // List of booking-related tables to truncate/clear
    const tablesToClear = [
      'bookings',
      'booking_guests',
      'booking_modifications',
      'car_bookings',
      'coupon_usage',
      'food_orders',
      'food_order_items',
      'hms_food_orders',
      'hms_food_order_items',
      'hms_housekeeping',
      'hms_invoices',
      'admin_earnings',
      'admin_earnings_summary',
      'admin_payouts',
      'owner_payout_items',
      'owner_payouts',
      'property_owner_payouts',
      'payments',
      'refunds',
      'reviews',
      'rewards_point_transactions',
      'orders'
    ];

    for (const table of tablesToClear) {
      await connection.execute(`TRUNCATE TABLE ${table}`);
      console.log(`✔ Cleared table: ${table}`);
    }

    // Clean accounts transactions linked to bookings, payments, or payouts
    const [txResult] = await connection.execute(`
      DELETE FROM hms_accounts_transactions 
      WHERE reference_type IN ('payment', 'payout', 'booking') 
         OR description LIKE '%Booking%' 
         OR description LIKE '%Payout%'
    `);
    console.log(`✔ Deleted ${txResult.affectedRows} booking/payout transactions from accounting journal`);

    // Reset owner balances to 0
    const [balanceResult] = await connection.execute(`
      UPDATE owner_balances 
      SET total_earnings = 0.00, 
          total_payouts = 0.00, 
          current_balance = 0.00, 
          commission_paid_to_admin = 0.00, 
          commission_pending = 0.00,
          last_updated = NOW()
    `);
    console.log(`✔ Reset ${balanceResult.affectedRows} owner balances to 0.00`);

    // Reset user rewards points to 0
    const [pointsResult] = await connection.execute(`
      UPDATE user_rewards_points 
      SET total_points_earned = 0, 
          current_balance = 0, 
          lifetime_points_spent = 0, 
          member_status_tier_id = NULL,
          last_updated_at = NOW()
    `);
    console.log(`✔ Reset ${pointsResult.affectedRows} user rewards point accounts`);

    // Reset occupied rooms to available
    const [roomResult] = await connection.execute(`
      UPDATE hms_rooms 
      SET status = 'available' 
      WHERE status = 'occupied'
    `);
    console.log(`✔ Reset ${roomResult.affectedRows} occupied rooms back to 'available'`);

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✔ Foreign key checks re-enabled');

    await connection.commit();
    console.log('=== BOOKING DATA CLEANUP COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    await connection.rollback();
    console.error('❌ Data cleanup failed:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

clean();
