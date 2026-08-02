const { pool } = require('../config/database.js');

async function run() {
  try {
    const [result] = await pool.query(
      'UPDATE refunds SET status = "cancelled" WHERE id = ? AND status = "pending"',
      [17]
    );
    console.log(`Successfully updated ${result.affectedRows} refund record(s).`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
