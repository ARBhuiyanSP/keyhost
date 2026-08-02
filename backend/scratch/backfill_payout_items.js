const { pool } = require('../config/database');

async function backfill() {
  const [payouts] = await pool.execute('SELECT id, property_owner_id FROM owner_payouts');
  console.log('Payouts to process:', payouts.length);
  let totalLinked = 0;

  for (const payout of payouts) {
    const payoutId = payout.id;
    const ownerId = payout.property_owner_id;

    // Check if already has items
    const [existing] = await pool.execute('SELECT COUNT(*) as cnt FROM owner_payout_items WHERE payout_id = ?', [payoutId]);
    if (existing[0].cnt > 0) {
      console.log('Payout', payoutId, 'already has', existing[0].cnt, 'items — skipping');
      continue;
    }

    // Get eligible bookings for this owner NOT already in another payout's items
    const [bookings] = await pool.execute(`
      SELECT b.id as booking_id, b.total_amount, b.property_owner_earnings,
             COALESCE(ae.commission_amount, 0) as commission_amount,
             CASE WHEN ae.payment_status = 'paid' THEN 1 ELSE 0 END as commission_paid
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
      WHERE p.owner_id = ?
        AND b.payment_status = 'paid'
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.status != 'cancelled'
        AND b.id NOT IN (
          SELECT opi.booking_id FROM owner_payout_items opi
          JOIN owner_payouts op ON opi.payout_id = op.id
          WHERE op.property_owner_id = ? AND op.id != ?
        )
      ORDER BY b.created_at ASC
    `, [ownerId, ownerId, payoutId]);

    console.log('Payout', payoutId, '— found', bookings.length, 'eligible bookings');
    for (const b of bookings) {
      await pool.execute(
        'INSERT INTO owner_payout_items (payout_id, booking_id, booking_total, admin_commission, owner_earnings, commission_paid_to_admin) VALUES (?, ?, ?, ?, ?, ?)',
        [payoutId, b.booking_id, b.total_amount, b.commission_amount, b.property_owner_earnings, b.commission_paid]
      );
      totalLinked++;
    }
  }
  console.log('Backfill done. Total items linked:', totalLinked);
  process.exit(0);
}

backfill().catch(e => { console.error(e); process.exit(1); });
