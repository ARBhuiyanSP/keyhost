const { pool } = require('./config/database');

async function cleanupDemoBookings() {
  try {
    console.log('Starting cleanup of demo booking data...');

    // Disable foreign key checks temporarily to allow truncating tables with relations
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

    const tablesToTruncate = [
      'bookings',
      'booking_guests',
      'booking_modifications',
      'admin_earnings',
      'admin_earnings_summary',
      'admin_payouts',
      'coupon_usage',
      'messages',
      'conversations',
      'notifications',
      'owner_balances',
      'owner_payout_items',
      'owner_payouts',
      'payments',
      'property_owner_payouts',
      'refund_service_charges',
      'refunds',
      'reviews',
      'rewards_point_transactions',
      'user_rewards_points',
      'audit_logs',
      'contact_messages',
      'ticket_messages',
      'tickets',
      // car and food
      'car_bookings',
      'food_orders',
      'food_order_items',
      // orders and hms booking related
      'orders',
      'hms_bills',
      'hms_food_orders',
      'hms_food_order_items',
      'hms_accounts_transactions',
      'hms_accounts_vouchers',
      'hms_invoices',
      'hms_housekeeping',
      // user sessions / pass reset / property availability blocks
      'password_resets',
      'user_sessions',
      'favorites',
      'property_availability',
      'property_owner_blocks'
    ];

    for (const table of tablesToTruncate) {
      try {
        await pool.execute(`TRUNCATE TABLE ${table}`);
        console.log(`✅ Truncated ${table}`);
      } catch (err) {
        console.warn(`⚠️ Could not truncate ${table}: ${err.message}`);
      }
    }

    // Reset total_reviews and average_rating in properties table
    await pool.execute('UPDATE properties SET total_reviews = 0, average_rating = 0');
    console.log('✅ Reset property review counts and ratings');

    // Reset HMS rooms to available status
    await pool.execute('UPDATE hms_rooms SET status = "available"');
    console.log('✅ Reset all HMS rooms status to available');

    // Re-enable foreign key checks
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🎉 Cleanup completed successfully! System is fresh.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    // Ensure foreign key checks are re-enabled even on failure
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    process.exit(1);
  }
}

cleanupDemoBookings();
