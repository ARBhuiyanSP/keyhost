const { pool } = require('../config/database');

async function inspect() {
  try {
    const [rows] = await pool.execute(`
      SELECT id, property_owner_id, payout_reference, total_earnings, total_commission_paid, net_payout, payment_status
      FROM owner_payouts
      WHERE ABS(net_payout - (total_earnings - total_commission_paid)) < 0.01
    `);
    console.log('--- Double-deducted or matching formula payouts ---');
    rows.forEach(r => {
      console.log(`ID: ${r.id} | Ref: ${r.payout_reference} | Earnings: ${r.total_earnings} | Commission: ${r.total_commission_paid} | Net Payout: ${r.net_payout} | Status: ${r.payment_status}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
