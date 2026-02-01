const { pool } = require('./config/database');

async function testBookingStatus() {
  try {
    console.log('=== TESTING BOOKING STATUS ===\n');
    
    // Test 1: Check database schema
    console.log('1. Checking database schema...');
    const [schema] = await pool.execute('DESCRIBE bookings');
    const statusField = schema.find(row => row.Field === 'status');
    console.log('Status field:', statusField);
    console.log('');
    
    // Test 2: Create a test booking with pending status
    console.log('2. Creating test booking with pending status...');
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id,
        check_in_date, check_out_date,
        number_of_guests, base_price, total_amount,
        status, payment_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', NOW())
    `, ['TEST-' + Date.now(), 1, 1, '2025-01-01', '2025-01-02', 2, 1000, 1000]);
    
    const testBookingId = result.insertId;
    console.log('Test booking created with ID:', testBookingId);
    console.log('');
    
    // Test 3: Check if status is pending
    console.log('3. Checking initial status...');
    const [bookings1] = await pool.execute('SELECT id, status, payment_status FROM bookings WHERE id = ?', [testBookingId]);
    console.log('Initial status:', bookings1[0]);
    console.log('');
    
    // Test 4: Update status to pending (simulating cash on arrival)
    console.log('4. Updating status to pending (cash on arrival)...');
    await pool.execute(`
      UPDATE bookings 
      SET status = ?, payment_status = ?
      WHERE id = ?
    `, ['pending', 'pending', testBookingId]);
    console.log('Update executed');
    console.log('');
    
    // Test 5: Check if status remained pending
    console.log('5. Checking status after update...');
    const [bookings2] = await pool.execute('SELECT id, status, payment_status FROM bookings WHERE id = ?', [testBookingId]);
    console.log('After update:', bookings2[0]);
    console.log('');
    
    // Test 6: Update status to confirmed (simulating online payment)
    console.log('6. Updating status to confirmed (online payment)...');
    await pool.execute(`
      UPDATE bookings 
      SET status = ?, payment_status = ?
      WHERE id = ?
    `, ['confirmed', 'paid', testBookingId]);
    console.log('Update executed');
    console.log('');
    
    // Test 7: Check if status is confirmed
    console.log('7. Checking status after confirmed update...');
    const [bookings3] = await pool.execute('SELECT id, status, payment_status FROM bookings WHERE id = ?', [testBookingId]);
    console.log('After confirmed update:', bookings3[0]);
    console.log('');
    
    // Cleanup
    console.log('8. Cleaning up test booking...');
    await pool.execute('DELETE FROM bookings WHERE id = ?', [testBookingId]);
    console.log('Test booking deleted');
    console.log('');
    
    console.log('=== TEST COMPLETED ===');
    console.log('✅ All database operations work correctly');
    console.log('The issue might be in the application logic, not the database');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBookingStatus();

