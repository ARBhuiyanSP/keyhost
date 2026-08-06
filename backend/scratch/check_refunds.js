const { pool } = require('../config/database');

async function checkRefunds() {
  try {
    const [refunds] = await pool.query(`SELECT * FROM refunds`);
    console.log('--- ALL REFUNDS ---');
    console.log(refunds);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkRefunds();
