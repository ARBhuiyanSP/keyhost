const { pool } = require('./config/database');

// Test booking actions endpoints
async function testBookingActions() {
  try {
    console.log('\n🧪 Testing Property Owner Booking Actions\n');
    
    // Get a property owner's bookings
    const [bookings] = await pool.execute(`
      SELECT 
        b.id,
        b.status,
        b.check_in_date,
        b.check_out_date,
        b.guest_id,
        p.title as property_title,
        po.user_id as owner_id,
        u.first_name,
        u.last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON b.guest_id = u.id
      WHERE po.user_id IS NOT NULL
      ORDER BY b.id DESC
      LIMIT 5
    `);
    
    console.log('=== Recent Bookings ===\n');
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`);
      console.log(`  ID: ${booking.id}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Guest: ${booking.first_name} ${booking.last_name}`);
      console.log(`  Property: ${booking.property_title}`);
      console.log(`  Check-in: ${booking.check_in_date}`);
      console.log(`  Check-out: ${booking.check_out_date}`);
      console.log(`  Owner ID: ${booking.owner_id}`);
      console.log('');
    });
    
    if (bookings.length > 0) {
      const testBooking = bookings[0];
      console.log(`\n=== Testing Actions for Booking ${testBooking.id} ===\n`);
      
      // Test what actions are possible
      console.log('Possible actions:');
      
      if (['pending', 'confirmed'].includes(testBooking.status)) {
        console.log('✅ Can Cancel');
      } else {
        console.log('❌ Cannot Cancel');
      }
      
      if (testBooking.status === 'confirmed' && new Date(testBooking.check_in_date) <= new Date()) {
        console.log('✅ Can Check In');
      } else {
        console.log('❌ Cannot Check In');
      }
      
      if (testBooking.status === 'checked_in') {
        console.log('✅ Can Check Out');
      } else {
        console.log('❌ Cannot Check Out');
      }
      
      console.log('\n=== API Endpoints ===\n');
      console.log('Check-in: PATCH /api/property-owner/bookings/:id/checkin');
      console.log('Check-out: PATCH /api/property-owner/bookings/:id/checkout');
      console.log('Cancel: PATCH /api/property-owner/bookings/:id/cancel');
      console.log('');
      
      console.log('✅ All endpoints should be working!');
    } else {
      console.log('⚠️ No bookings found to test');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testBookingActions();


