const { pool } = require('../config/database');

async function verify() {
  try {
    const [rows] = await pool.execute(`
      SELECT id, payout_reference, total_earnings, total_commission_paid, net_payout, payment_status
      FROM owner_payouts
      WHERE id = 1
    `);
    rows.forEach(r => {
      console.log(`ID: ${r.id}`);
      console.log(`Ref: ${r.payout_reference}`);
      console.log(`total_earnings (owner cut): ${r.total_earnings}`);
      console.log(`total_commission_paid: ${r.total_commission_paid}`);
      console.log(`net_payout: ${r.net_payout}`);
      console.log(`Status: ${r.payment_status}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
verify();
