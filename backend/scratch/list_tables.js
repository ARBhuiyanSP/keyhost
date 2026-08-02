const { pool } = require('../config/database.js');

async function run() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log(tables);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
