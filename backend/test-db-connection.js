require('dotenv').config();
const { pool } = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection and data...\n');
    
    // Test 1: Check users table
    console.log('1. Checking users table...');
    const [users] = await pool.execute('SELECT id, email, user_type, is_active FROM users LIMIT 5');
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.user_type}) - Active: ${user.is_active}`);
    });
    
    // Test 2: Check properties table
    console.log('\n2. Checking properties table...');
    const [properties] = await pool.execute('SELECT id, title, owner_id, status FROM properties LIMIT 5');
    console.log('Properties found:', properties.length);
    properties.forEach(prop => {
      console.log(`  - ${prop.title} (Owner: ${prop.owner_id}) - Status: ${prop.status}`);
    });
    
    // Test 3: Check bookings table
    console.log('\n3. Checking bookings table...');
    const [bookings] = await pool.execute('SELECT id, booking_reference, guest_id, property_id, total_amount FROM bookings LIMIT 5');
    console.log('Bookings found:', bookings.length);
    bookings.forEach(booking => {
      console.log(`  - ${booking.booking_reference} (Guest: ${booking.guest_id}, Property: ${booking.property_id}) - Amount: ${booking.total_amount}`);
    });
    
    // Test 4: Check admin user specifically
    console.log('\n4. Checking admin user...');
    const [adminUsers] = await pool.execute('SELECT id, email, user_type, password FROM users WHERE user_type = "admin"');
    console.log('Admin users found:', adminUsers.length);
    adminUsers.forEach(admin => {
      console.log(`  - ${admin.email} (ID: ${admin.id}) - Password hash: ${admin.password.substring(0, 20)}...`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
