const { pool } = require('../config/database');

async function main() {
  try {
    console.log('--- User 64 Check ---');
    const [users] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone 
      FROM users 
      WHERE id = 64
    `);
    console.log('User 64 details:', users);
  } catch (err) {
    console.error('Error running check:', err);
  } finally {
    process.exit(0);
  }
}

main();
