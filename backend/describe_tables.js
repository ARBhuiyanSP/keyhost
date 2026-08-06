const { pool } = require('./config/database');

const describeTables = async () => {
  try {
    const [users] = await pool.query('DESCRIBE users');
    console.log('Users Table Structure:');
    console.table(users);

    const [properties] = await pool.query('DESCRIBE properties');
    console.log('\nProperties Table Structure:');
    console.table(properties);

    const [bookings] = await pool.query('DESCRIBE bookings');
    console.log('\nBookings Table Structure:');
    console.table(bookings);

    process.exit(0);
  } catch (error) {
    console.error('Error describing tables:', error);
    process.exit(1);
  }
};

describeTables();
