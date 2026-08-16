const { pool } = require('../config/database');

async function run() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in Database:');
    rows.forEach(row => {
      console.log(Object.values(row)[0]);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
