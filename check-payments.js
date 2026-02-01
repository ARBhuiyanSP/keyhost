const mysql = require('mysql2/promise');

async function checkPayments() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'keyhost_homes'
  });

  console.log('=== Recent Bookings (Last 5) ===\n');
  
  const [bookings] = await connection.execute(`
    SELECT 
      b.id,
      b.booking_reference,
      b.status as booking_status,
      b.payment_status as bookings_payment_status,
      b.total_amount,
      b.created_at
    FROM bookings b
    ORDER BY b.created_at DESC
    LIMIT 5
  `);
  
  bookings.forEach(booking => {
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Reference: ${booking.booking_reference}`);
    console.log(`Booking Status: ${booking.booking_status}`);
    console.log(`Payment Status (bookings table): ${booking.bookings_payment_status}`);
    console.log(`Amount: ৳${booking.total_amount}`);
    console.log(`Created: ${booking.created_at}`);
    console.log('---');
  });

  console.log('\n=== Recent Payments (Last 5) ===\n');
  
  const [payments] = await connection.execute(`
    SELECT 
      p.id,
      p.booking_id,
      p.amount,
      p.payment_method,
      p.status as payments_status,
      p.payment_reference,
      p.created_at
    FROM payments p
    ORDER BY p.created_at DESC
    LIMIT 5
  `);
  
  payments.forEach(payment => {
    console.log(`Payment ID: ${payment.id}`);
    console.log(`Booking ID: ${payment.booking_id}`);
    console.log(`Method: ${payment.payment_method}`);
    console.log(`Status (payments table): ${payment.payments_status || 'NULL'}`);
    console.log(`Amount: ৳${payment.amount}`);
    console.log(`Reference: ${payment.payment_reference}`);
    console.log(`Created: ${payment.created_at}`);
    console.log('---');
  });

  await connection.end();
}

checkPayments().catch(console.error);





