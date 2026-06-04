const { pool } = require('../config/database.js');

async function listTables() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

listTables();
