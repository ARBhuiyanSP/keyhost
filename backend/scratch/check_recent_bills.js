const { pool } = require('../config/database');

const run = async () => {
  try {
    console.log("--- Recent Food Orders ---");
    const [orders] = await pool.query('SELECT id, booking_id, guest_name, total_amount, payment_status FROM hms_food_orders ORDER BY created_at DESC LIMIT 10');
    console.table(orders);

    if (orders.length > 0) {
        const bookingIds = [...new Set(orders.map(o => o.booking_id).filter(id => id))];
        if (bookingIds.length > 0) {
            console.log("\n--- Bills for these bookings ---");
            const [bills] = await pool.query('SELECT * FROM hms_bills WHERE booking_id IN (?)', [bookingIds]);
            console.table(bills);
        }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
