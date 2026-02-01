const { pool } = require('./config/database');

// Simulate a booking request to debug the issue
async function debugBookingRequest() {
  try {
    console.log('\n🔍 Debugging Booking Request\n');
    
    // Test data that might be causing the issue
    const testBookingData = {
      property_id: 33,
      check_in_date: '2025-10-25',
      check_out_date: '2025-10-27',
      check_in_time: '15:00',
      check_out_time: '11:00',
      number_of_guests: 2,
      number_of_children: 0,
      number_of_infants: 0,
      special_requests: '',
      coupon_code: ''
    };
    
    console.log('Test booking data:');
    console.log(JSON.stringify(testBookingData, null, 2));
    console.log('');
    
    // Check if property exists
    const [properties] = await pool.execute(`
      SELECT p.*, po.user_id as owner_id
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      WHERE p.id = ? AND p.status = 'active'
    `, [testBookingData.property_id]);
    
    if (properties.length === 0) {
      console.log('❌ Property not found or not active');
      return;
    }
    
    console.log('✅ Property found:', properties[0].title);
    console.log('');
    
    // Test date validation
    const { isValidDateRange, isPastDate } = require('./utils/helpers');
    
    console.log('Date validation tests:');
    console.log(`Check-in date: ${testBookingData.check_in_date}`);
    console.log(`Check-out date: ${testBookingData.check_out_date}`);
    console.log(`Is past date: ${isPastDate(testBookingData.check_in_date)}`);
    console.log(`Is valid range: ${isValidDateRange(testBookingData.check_in_date, testBookingData.check_out_date)}`);
    console.log('');
    
    // Check for conflicts
    const [conflicts] = await pool.execute(`
      SELECT id FROM bookings
      WHERE property_id = ? 
      AND status IN ('confirmed', 'checked_in')
      AND (
        (check_in_date <= ? AND check_out_date > ?) OR
        (check_in_date < ? AND check_out_date >= ?) OR
        (check_in_date >= ? AND check_out_date <= ?)
      )
    `, [
      testBookingData.property_id, 
      testBookingData.check_out_date, 
      testBookingData.check_in_date, 
      testBookingData.check_out_date, 
      testBookingData.check_in_date, 
      testBookingData.check_in_date, 
      testBookingData.check_out_date
    ]);
    
    console.log(`Conflicts found: ${conflicts.length}`);
    if (conflicts.length > 0) {
      console.log('Conflicting bookings:', conflicts);
    }
    console.log('');
    
    // Test minimum stay
    const nights = Math.ceil((new Date(testBookingData.check_out_date) - new Date(testBookingData.check_in_date)) / (1000 * 60 * 60 * 24));
    console.log(`Nights: ${nights}`);
    console.log(`Minimum stay required: ${properties[0].minimum_stay}`);
    console.log(`Meets minimum stay: ${nights >= properties[0].minimum_stay}`);
    console.log('');
    
    console.log('✅ All checks passed - booking should work!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugBookingRequest();


