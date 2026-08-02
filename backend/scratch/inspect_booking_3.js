const { pool } = require('../config/database');

async function inspectBooking() {
  try {
    const bookingId = 8;
    console.log(`=== INSPECTING BOOKING ID ${bookingId} ===`);
    
    // 1. Fetch booking info
    const [booking] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    console.log('Booking Table Row:', booking[0]);

    if (booking[0]) {
      // 2. Fetch payments
      const [payments] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [bookingId]);
      console.log('Payments:', payments);

      // 3. Fetch hms_bills (extra bills)
      const [bills] = await pool.query('SELECT * FROM hms_bills WHERE booking_id = ?', [bookingId]);
      console.log('Extra Bills (hms_bills):', bills);

      // 4. Fetch hms_food_orders
      const [foodOrders] = await pool.query('SELECT * FROM hms_food_orders WHERE booking_id = ?', [bookingId]);
      console.log('Food Orders:', foodOrders);
    }

    console.log('=== END INSPECTING ===');
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await pool.end();
  }
}

inspectBooking();



