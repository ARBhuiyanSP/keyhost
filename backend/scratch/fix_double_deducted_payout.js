/**
 * Fix payout ID 1 (OWNER-PAYOUT-REQ-1784530065459-29):
 * 
 * PROBLEM:
 *   - total_earnings (property_owner_earnings) = 13.50
 *     (this is ALREADY after commission was subtracted at booking creation)
 *   - total_commission_paid = 1.50
 *   - net_payout was wrongly set to: 13.50 - 1.50 = 12.00  (double deducted!)
 *
 * FIX:
 *   - net_payout should be: 13.50 (= total_earnings, commission already excluded)
 */
const { pool } = require('../config/database');

async function fixDoubleDedectedPayout() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get all pending/processing payouts where net_payout = total_earnings - total_commission_paid
    // (these are double-deducted ones)
    const [doubleDeducted] = await connection.execute(`
      SELECT id, payout_reference, total_earnings, total_commission_paid, net_payout, payment_status
      FROM owner_payouts
      WHERE payment_status IN ('pending', 'processing')
        AND ABS(net_payout - (total_earnings - total_commission_paid)) < 0.01
    `);

    if (doubleDeducted.length === 0) {
      console.log('✅ No double-deducted payouts found. Nothing to fix.');
      process.exit(0);
    }

    console.log(`Found ${doubleDeducted.length} payout(s) with double-deducted net amounts:`);
    doubleDeducted.forEach(p => {
      const correct = parseFloat(p.total_earnings);
      const wrong = parseFloat(p.net_payout);
      console.log(`  ID: ${p.id} | Ref: ${p.payout_reference} | Status: ${p.payment_status}`);
      console.log(`    total_earnings: ${p.total_earnings} (= owner's cut, already net)`);
      console.log(`    total_commission_paid: ${p.total_commission_paid}`);
      console.log(`    net_payout (WRONG): ${wrong} → FIXING TO: ${correct}`);
    });

    for (const p of doubleDeducted) {
      const correctedNet = parseFloat(p.total_earnings);
      await connection.execute(
        `UPDATE owner_payouts SET net_payout = ? WHERE id = ?`,
        [correctedNet, p.id]
      );
      console.log(`✅ Fixed payout ID ${p.id}: net_payout = ${correctedNet}`);
    }

    await connection.commit();
    console.log('\n🎉 Fix applied successfully!');
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    connection.release();
  }
}

fixDoubleDedectedPayout();
