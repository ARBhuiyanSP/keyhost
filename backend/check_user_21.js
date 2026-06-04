const { pool } = require('d:/88i/booking-systme/backend/config/database');

async function checkUser() {
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = 21');
    console.log('USER FROM DB:', users[0]);
    
    const [owners] = await pool.execute('SELECT * FROM property_owners WHERE user_id = 21');
    console.log('PROPERTY OWNER INFO:', owners[0]);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
