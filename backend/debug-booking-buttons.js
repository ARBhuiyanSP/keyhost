const { pool } = require('./config/database');

// Debug booking buttons and database
async function debugBookingButtons() {
  try {
    console.log('\n🔍 Debugging Property Owner Booking Buttons\n');
    
    // Check if we have any bookings
    const [bookings] = await pool.execute(`
      SELECT 
        b.id,
        b.status,
        b.check_in_date,
        b.check_out_date,
        b.guest_id,
        p.title as property_title,
        p.owner_id,
        po.user_id as owner_user_id,
        u.first_name,
        u.last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON b.guest_id = u.id
      ORDER BY b.id DESC
      LIMIT 10
    `);
    
    console.log('=== All Bookings in Database ===\n');
    if (bookings.length === 0) {
      console.log('❌ No bookings found in database!');
      console.log('This is why buttons don\'t work - no data to display.');
      return;
    }
    
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`);
      console.log(`  ID: ${booking.id}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Guest: ${booking.first_name} ${booking.last_name}`);
      console.log(`  Property: ${booking.property_title}`);
      console.log(`  Property Owner ID: ${booking.owner_id}`);
      console.log(`  Owner User ID: ${booking.owner_user_id}`);
      console.log(`  Check-in: ${booking.check_in_date}`);
      console.log(`  Check-out: ${booking.check_out_date}`);
      console.log('');
    });
    
    // Check property owners
    const [owners] = await pool.execute(`
      SELECT 
        po.id as owner_id,
        po.user_id,
        u.first_name,
        u.last_name,
        u.email
      FROM property_owners po
      JOIN users u ON po.user_id = u.id
    `);
    
    console.log('=== Property Owners ===\n');
    if (owners.length === 0) {
      console.log('❌ No property owners found!');
      console.log('This could be why buttons don\'t work.');
    } else {
      owners.forEach((owner, index) => {
        console.log(`Owner ${index + 1}:`);
        console.log(`  Owner ID: ${owner.owner_id}`);
        console.log(`  User ID: ${owner.user_id}`);
        console.log(`  Name: ${owner.first_name} ${owner.last_name}`);
        console.log(`  Email: ${owner.email}`);
        console.log('');
      });
    }
    
    // Test button logic for each booking
    console.log('=== Button Logic Test ===\n');
    bookings.forEach((booking, index) => {
      console.log(`Booking ${booking.id} (${booking.status}):`);
      
      // Check-in logic
      const canCheckIn = booking.status === 'confirmed' && new Date(booking.check_in_date) <= new Date();
      console.log(`  Can Check-in: ${canCheckIn} (status: ${booking.status}, check-in: ${booking.check_in_date})`);
      
      // Check-out logic  
      const canCheckOut = booking.status === 'checked_in';
      console.log(`  Can Check-out: ${canCheckOut} (status: ${booking.status})`);
      
      // Cancel logic
      const canCancel = ['pending', 'confirmed'].includes(booking.status);
      console.log(`  Can Cancel: ${canCancel} (status: ${booking.status})`);
      console.log('');
    });
    
    // Check if there are any property owner bookings specifically
    const [ownerBookings] = await pool.execute(`
      SELECT 
        b.id,
        b.status,
        p.owner_id,
        po.user_id as owner_user_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      WHERE po.user_id IS NOT NULL
    `);
    
    console.log('=== Property Owner Bookings ===\n');
    console.log(`Total bookings for property owners: ${ownerBookings.length}`);
    
    if (ownerBookings.length === 0) {
      console.log('❌ No bookings found for property owners!');
      console.log('This means the property owner booking list will be empty.');
      console.log('Possible causes:');
      console.log('  1. No bookings exist');
      console.log('  2. Properties don\'t have owners assigned');
      console.log('  3. Database relationship issues');
    } else {
      console.log('✅ Found property owner bookings');
      ownerBookings.forEach(booking => {
        console.log(`  Booking ${booking.id}: status=${booking.status}, owner_id=${booking.owner_id}, owner_user_id=${booking.owner_user_id}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugBookingButtons();


