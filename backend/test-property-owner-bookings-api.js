const { pool } = require('./config/database');

// Test property owner bookings API endpoint
async function testPropertyOwnerBookingsAPI() {
  try {
    console.log('\n🧪 Testing Property Owner Bookings API\n');
    
    // Simulate a property owner user (User ID: 21)
    const testUserId = 21;
    
    console.log(`Testing for Property Owner User ID: ${testUserId}\n`);
    
    // Check if user is a property owner
    const [owners] = await pool.execute(`
      SELECT id, user_id 
      FROM property_owners 
      WHERE user_id = ?
    `, [testUserId]);
    
    if (owners.length === 0) {
      console.log('❌ User is not a property owner!');
      console.log('This is why the booking list is empty.');
      return;
    }
    
    console.log('✅ User is a property owner');
    console.log(`Property Owner ID: ${owners[0].id}\n`);
    
    const ownerId = owners[0].id;
    
    // Get bookings for this property owner
    const [bookings] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        b.status,
        b.check_in_date,
        b.check_out_date,
        b.number_of_guests,
        b.total_amount,
        b.created_at,
        p.title as property_title,
        p.city as property_city,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_email,
        u.phone as guest_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      WHERE p.owner_id = ?
      ORDER BY b.created_at DESC
    `, [ownerId]);
    
    console.log('=== Property Owner Bookings ===\n');
    console.log(`Total bookings found: ${bookings.length}\n`);
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found for this property owner!');
      console.log('This is why the booking list is empty.');
      console.log('\nPossible causes:');
      console.log('1. No guests have booked this property owner\'s properties');
      console.log('2. Properties are not active');
      console.log('3. Database relationship issues');
    } else {
      console.log('✅ Found bookings for property owner:');
      bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log(`  ID: ${booking.id}`);
        console.log(`  Reference: ${booking.booking_reference}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Property: ${booking.property_title}`);
        console.log(`  Guest: ${booking.guest_first_name} ${booking.guest_last_name}`);
        console.log(`  Check-in: ${booking.check_in_date}`);
        console.log(`  Check-out: ${booking.check_out_date}`);
        console.log(`  Amount: ৳${booking.total_amount}`);
        
        // Test button logic
        const canCheckIn = booking.status === 'confirmed' && new Date(booking.check_in_date) <= new Date();
        const canCheckOut = booking.status === 'checked_in';
        const canCancel = ['pending', 'confirmed'].includes(booking.status);
        
        console.log(`  Actions: Check-in=${canCheckIn}, Check-out=${canCheckOut}, Cancel=${canCancel}`);
      });
    }
    
    // Test the exact API query that frontend uses
    console.log('\n=== Testing Frontend API Query ===\n');
    
    const [frontendBookings] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        b.status,
        b.check_in_date,
        b.check_out_date,
        b.number_of_guests,
        b.total_amount,
        b.created_at,
        p.title as property_title,
        p.city as property_city,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_email,
        u.phone as guest_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      WHERE p.owner_id = ?
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [ownerId]);
    
    console.log(`Frontend query result: ${frontendBookings.length} bookings`);
    
    if (frontendBookings.length > 0) {
      console.log('✅ Frontend should show bookings!');
      console.log('If frontend is not showing bookings, check:');
      console.log('1. User authentication');
      console.log('2. API endpoint response');
      console.log('3. Frontend error handling');
    } else {
      console.log('❌ Frontend query returns no results');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPropertyOwnerBookingsAPI();


