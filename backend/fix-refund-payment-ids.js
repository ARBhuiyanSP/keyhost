const { pool } = require('./config/database');

async function fixRefundPaymentIds() {
  try {
    // Find refunds where linked payment has no payment_method (wrong payment linked)
    const [wrongRefunds] = await pool.execute(`
      SELECT r.id, r.booking_id, r.payment_id, r.status, p.payment_method, p.transaction_type
      FROM refunds r
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE (p.payment_method IS NULL OR p.payment_method = '')
      AND r.status = 'pending'
    `);

    console.log(`Found ${wrongRefunds.length} refunds with wrong payment_id:`, wrongRefunds);

    for (const ref of wrongRefunds) {
      // Find the correct guest_payment entry
      const [correctPay] = await pool.execute(`
        SELECT id, payment_method, gateway_transaction_id 
        FROM payments 
        WHERE booking_id = ? 
        AND transaction_type = 'guest_payment' 
        AND status = 'completed' 
        ORDER BY created_at DESC LIMIT 1
      `, [ref.booking_id]);

      if (correctPay.length > 0) {
        await pool.execute('UPDATE refunds SET payment_id = ? WHERE id = ?', [correctPay[0].id, ref.id]);
        console.log(`✅ Fixed refund #${ref.id}: payment_id -> ${correctPay[0].id} (method: ${correctPay[0].payment_method}, tran_id: ${correctPay[0].gateway_transaction_id})`);
      } else {
        console.log(`⚠️ No guest_payment found for booking #${ref.booking_id} (refund #${ref.id})`);
      }
    }

    // Verify the fix
    const [verified] = await pool.execute(`
      SELECT r.id, r.booking_id, r.status, r.refund_amount, p.payment_method, p.gateway_transaction_id
      FROM refunds r
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE r.status = 'pending'
    `);
    console.log('\n✅ All pending refunds after fix:', JSON.stringify(verified, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

fixRefundPaymentIds();
