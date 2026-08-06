const { pool } = require('../config/database.js');

async function run() {
  try {
    const [columns] = await pool.query('DESCRIBE refunds');
    console.log(columns);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
