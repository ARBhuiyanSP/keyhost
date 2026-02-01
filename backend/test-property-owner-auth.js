const { pool } = require('./config/database');

// Test property owner authentication and bookings
async function testPropertyOwnerAuth() {
  try {
    console.log('\n🔍 Testing Property Owner Authentication & Bookings\n');
    
    // Test with the specific user from database
    const testUserId = 21; // Atiqur rahman Bhuiyan
    
    console.log(`Testing for User ID: ${testUserId}\n`);
    
    // Check if user exists and is property owner
    const [users] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        po.id as owner_id
      FROM users u
      LEFT JOIN property_owners po ON u.id = po.user_id
      WHERE u.id = ?
    `, [testUserId]);
    
    if (users.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    const user = users[0];
    console.log('=== User Details ===');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Property Owner ID: ${user.owner_id || 'Not a property owner'}`);
    console.log('');
    
    if (!user.owner_id) {
      console.log('❌ User is not a property owner!');
      console.log('This is why booking buttons don\'t work.');
      console.log('User needs to be assigned as property owner.');
      return;
    }
    
    console.log('✅ User is a property owner');
    
    // Test the exact API query that property owner bookings use
    const [bookings] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        b.status,
        b.check_in_date,
        b.check_out_date,
        b.check_in_time,
        b.check_out_time,
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
    `, [user.owner_id]);
    
    console.log('=== Property Owner Bookings ===');
    console.log(`Total bookings found: ${bookings.length}\n`);
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found for this property owner!');
      console.log('This is why the booking list is empty.');
      console.log('');
      console.log('Possible causes:');
      console.log('1. No guests have booked this property owner\'s properties');
      console.log('2. Properties are not active');
      console.log('3. Database relationship issues');
      console.log('');
      
      // Check if property owner has properties
      const [properties] = await pool.execute(`
        SELECT id, title, status
        FROM properties
        WHERE owner_id = ?
      `, [user.owner_id]);
      
      console.log('=== Property Owner\'s Properties ===');
      console.log(`Total properties: ${properties.length}`);
      properties.forEach(prop => {
        console.log(`  Property ${prop.id}: ${prop.title} (${prop.status})`);
      });
      
    } else {
      console.log('✅ Found bookings for property owner:');
      bookings.forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log(`  ID: ${booking.id}`);
        console.log(`  Reference: ${booking.booking_reference}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Property: ${booking.property_title}`);
        console.log(`  Guest: ${booking.guest_first_name} ${booking.guest_last_name}`);
        console.log(`  Check-in: ${booking.check_in_date} ${booking.check_in_time}`);
        console.log(`  Check-out: ${booking.check_out_date} ${booking.check_out_time}`);
        console.log(`  Amount: ৳${booking.total_amount}`);
        
        // Test button logic
        const canCheckIn = booking.status === 'confirmed' && new Date(booking.check_in_date) <= new Date();
        const canCheckOut = booking.status === 'checked_in';
        const canCancel = ['pending', 'confirmed'].includes(booking.status);
        
        console.log(`  Actions: Check-in=${canCheckIn}, Check-out=${canCheckOut}, Cancel=${canCancel}`);
      });
      
      console.log('\n✅ Bookings found! If frontend is not showing them, check:');
      console.log('1. User authentication in frontend');
      console.log('2. API endpoint response');
      console.log('3. Frontend error handling');
      console.log('4. Console logs (F12)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPropertyOwnerAuth();


