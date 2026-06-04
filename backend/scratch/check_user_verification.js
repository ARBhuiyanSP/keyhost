const { pool } = require('../config/database');

async function run() {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, email_verified_at, google_id, phone_verified_at, created_at FROM users WHERE email = ?',
      ['arbhuiyan.pits@gmail.com']
    );
    console.log('User Record:', users[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
