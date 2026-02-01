const { pool } = require('./config/database');

// Debug booking times issue
async function debugBookingTimes() {
  try {
    console.log('\n🔍 Debugging Booking Times Issue\n');
    
    // Check recent bookings and their times
    const [bookings] = await pool.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        b.check_in_date,
        b.check_out_date,
        b.check_in_time,
        b.check_out_time,
        b.status,
        p.title as property_title,
        p.check_in_time as property_check_in_time,
        p.check_out_time as property_check_out_time,
        u.first_name,
        u.last_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      ORDER BY b.id DESC
      LIMIT 5
    `);
    
    console.log('=== Recent Bookings with Times ===\n');
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`);
      console.log(`  ID: ${booking.id}`);
      console.log(`  Reference: ${booking.booking_reference}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Guest: ${booking.first_name} ${booking.last_name}`);
      console.log(`  Property: ${booking.property_title}`);
      console.log(`  Check-in Date: ${booking.check_in_date}`);
      console.log(`  Check-out Date: ${booking.check_out_date}`);
      console.log(`  Booking Check-in Time: ${booking.check_in_time}`);
      console.log(`  Booking Check-out Time: ${booking.check_out_time}`);
      console.log(`  Property Check-in Time: ${booking.property_check_in_time}`);
      console.log(`  Property Check-out Time: ${booking.property_check_out_time}`);
      console.log('');
    });
    
    // Check if there's a mismatch
    console.log('=== Time Mismatch Analysis ===\n');
    bookings.forEach((booking, index) => {
      const bookingCheckIn = booking.check_in_time;
      const propertyCheckIn = booking.property_check_in_time;
      const bookingCheckOut = booking.check_out_time;
      const propertyCheckOut = booking.property_check_out_time;
      
      console.log(`Booking ${booking.id}:`);
      console.log(`  Booking Check-in: ${bookingCheckIn}`);
      console.log(`  Property Check-in: ${propertyCheckIn}`);
      console.log(`  Match: ${bookingCheckIn === propertyCheckIn ? '✅' : '❌'}`);
      console.log(`  Booking Check-out: ${bookingCheckOut}`);
      console.log(`  Property Check-out: ${propertyCheckOut}`);
      console.log(`  Match: ${bookingCheckOut === propertyCheckOut ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Check property times
    const [properties] = await pool.execute(`
      SELECT 
        id,
        title,
        check_in_time,
        check_out_time
      FROM properties
      ORDER BY id DESC
      LIMIT 5
    `);
    
    console.log('=== Property Times ===\n');
    properties.forEach((property, index) => {
      console.log(`Property ${index + 1}:`);
      console.log(`  ID: ${property.id}`);
      console.log(`  Title: ${property.title}`);
      console.log(`  Check-in Time: ${property.check_in_time}`);
      console.log(`  Check-out Time: ${property.check_out_time}`);
      console.log('');
    });
    
    // Check if this is causing button issues
    console.log('=== Potential Issues ===\n');
    
    const problematicBookings = bookings.filter(booking => 
      booking.check_in_time !== booking.property_check_in_time ||
      booking.check_out_time !== booking.property_check_out_time
    );
    
    if (problematicBookings.length > 0) {
      console.log(`❌ Found ${problematicBookings.length} bookings with time mismatches!`);
      console.log('This could cause issues with:');
      console.log('1. Check-in button logic');
      console.log('2. Time validation');
      console.log('3. Property owner actions');
      console.log('');
      
      console.log('Problematic bookings:');
      problematicBookings.forEach(booking => {
        console.log(`  Booking ${booking.id}:`);
        console.log(`    Booking times: ${booking.check_in_time} / ${booking.check_out_time}`);
        console.log(`    Property times: ${booking.property_check_in_time} / ${booking.property_check_out_time}`);
      });
    } else {
      console.log('✅ No time mismatches found');
    }
    
    // Check if times are being inserted correctly
    console.log('\n=== Time Insertion Analysis ===\n');
    console.log('Expected behavior:');
    console.log('1. Guest booking should use property check-in/out times');
    console.log('2. Not insert custom times unless specified');
    console.log('3. Property owner should see consistent times');
    console.log('');
    
    console.log('Current behavior:');
    console.log('1. Booking times are being inserted from form');
    console.log('2. This might override property default times');
    console.log('3. Could cause confusion for property owners');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugBookingTimes();


