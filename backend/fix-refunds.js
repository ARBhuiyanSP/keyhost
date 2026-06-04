const { pool } = require('./config/database');

async function fixRefundStatuses() {
  try {
    console.log('Connecting to database...');
    const [res] = await pool.execute(
      "UPDATE refunds SET status = 'processing' WHERE status = '' OR status IS NULL OR status = 'approved'"
    );
    console.log(`Success! Fixed ${res.affectedRows} refund rows.`);
  } catch (err) {
    console.error('Error fixing statuses:', err.message);
  } finally {
    process.exit();
  }
}

fixRefundStatuses();
