const mysql = require('mysql2/promise');

async function cleanDatabase() {
  const localDbName = 'keyhost_booking_system';
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: localDbName
  });

  const tablesToTruncate = [
    'admin_earnings',
    'admin_earnings_summary',
    'admin_payouts',
    'audit_logs',
    'booking_guests',
    'booking_modifications',
    'bookings',
    'car_bookings',
    'contact_messages',
    'conversations',
    'coupon_usage',
    'favorites',
    'food_order_items',
    'food_orders',
    'hms_accounts_transactions',
    'hms_accounts_vouchers',
    'hms_attendance',
    'hms_bills',
    'hms_expenses',
    'hms_food_order_items',
    'hms_food_orders',
    'hms_housekeeping',
    'hms_invoices',
    'hms_payrolls',
    'hms_rosters',
    'hms_subscriptions',
    'messages',
    'messages_backup_1769410022550',
    'notifications',
    'orders',
    'owner_balances',
    'owner_payout_items',
    'owner_payouts',
    'password_resets',
    'payments',
    'property_availability',
    'property_owner_blocks',
    'property_owner_payouts',
    'property_reports',
    'refund_service_charges',
    'refunds',
    'reviews',
    'rewards_point_transactions',
    'ticket_messages',
    'tickets',
    'user_blocks',
    'user_rewards_points',
    'user_sessions'
  ];

  try {
    console.log('Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tablesToTruncate) {
      console.log(`Truncating table: ${table}...`);
      await connection.query(`TRUNCATE TABLE \`${table}\``);
    }

    console.log('Enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database cleanup completed successfully! Booking-related data is emptied, settings & configurations are preserved.');

  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await connection.end();
  }
}

cleanDatabase();
