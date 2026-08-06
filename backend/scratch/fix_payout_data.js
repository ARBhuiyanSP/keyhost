/**
 * Fix existing payout data for owner 27:
 * - Payout 10 (created 2026-06-12): should own bookings created ON or BEFORE June 12
 * - Payout 11 (created 2026-06-30): should own bookings created AFTER June 12 up to June 30
 * Then recalculate and update net_payout/total_earnings for both.
 */
const { pool } = require('../config/database');

async function fixPayoutData() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Clear all existing items for owner 27's payouts
    await connection.execute(`
      DELETE opi FROM owner_payout_items opi
      JOIN owner_payouts op ON opi.payout_id = op.id
      WHERE op.property_owner_id = 27
    `);
    console.log('Cleared existing payout items for owner 27');

    // 2. Get owner 27's eligible bookings with their dates
    const [bookings] = await connection.execute(`
      SELECT
        b.id AS booking_id,
        b.booking_reference,
        b.total_amount,
        b.property_owner_earnings,
        COALESCE(ae.commission_amount, 0) AS commission_amount,
        CASE WHEN ae.payment_status = 'paid' THEN 1 ELSE 0 END AS commission_paid,
        b.created_at
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
      WHERE p.owner_id = 27
        AND b.payment_status = 'paid'
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.status != 'cancelled'
      ORDER BY b.created_at ASC
    `);
    console.log(`Found ${bookings.length} total eligible bookings for owner 27`);

    // Payout 10: created 2026-06-12 → bookings on or before that date
    const payout10Cutoff = new Date('2026-06-12T23:59:59Z');
    // Payout 11: created 2026-06-30 → bookings after June 12 up to June 30
    const payout11Cutoff = new Date('2026-06-30T23:59:59Z');

    const payout10Bookings = bookings.filter(b => new Date(b.created_at) <= payout10Cutoff);
    const payout11Bookings = bookings.filter(b => new Date(b.created_at) > payout10Cutoff && new Date(b.created_at) <= payout11Cutoff);
    const unclaimed = bookings.filter(b => new Date(b.created_at) > payout11Cutoff);

    console.log(`\nPayout 10 will get: ${payout10Bookings.length} bookings`);
    console.log(`Payout 11 will get: ${payout11Bookings.length} bookings`);
    console.log(`Unclaimed (after June 30): ${unclaimed.length} bookings`);

    // 3. Insert items and compute totals for Payout 10
    let p10Earnings = 0, p10Commission = 0;
    for (const b of payout10Bookings) {
      await connection.execute(
        'INSERT INTO owner_payout_items (payout_id, booking_id, booking_total, admin_commission, owner_earnings, commission_paid_to_admin) VALUES (?, ?, ?, ?, ?, ?)',
        [10, b.booking_id, b.total_amount, b.commission_amount, b.property_owner_earnings, b.commission_paid]
      );
      p10Earnings += parseFloat(b.property_owner_earnings);
      p10Commission += b.commission_paid ? parseFloat(b.commission_amount) : 0;
    }
    const p10Net = p10Earnings - p10Commission;

    // 4. Insert items and compute totals for Payout 11
    let p11Earnings = 0, p11Commission = 0;
    for (const b of payout11Bookings) {
      await connection.execute(
        'INSERT INTO owner_payout_items (payout_id, booking_id, booking_total, admin_commission, owner_earnings, commission_paid_to_admin) VALUES (?, ?, ?, ?, ?, ?)',
        [11, b.booking_id, b.total_amount, b.commission_amount, b.property_owner_earnings, b.commission_paid]
      );
      p11Earnings += parseFloat(b.property_owner_earnings);
      p11Commission += b.commission_paid ? parseFloat(b.commission_amount) : 0;
    }
    const p11Net = p11Earnings - p11Commission;

    // 5. Update payout amounts to match actual booking data
    await connection.execute(
      'UPDATE owner_payouts SET total_earnings = ?, total_commission_paid = ?, net_payout = ? WHERE id = 10',
      [p10Earnings, p10Commission, p10Net]
    );
    await connection.execute(
      'UPDATE owner_payouts SET total_earnings = ?, total_commission_paid = ?, net_payout = ? WHERE id = 11',
      [p11Earnings, p11Commission, p11Net]
    );

    await connection.commit();

    console.log('\n=== Results ===');
    console.log(`Payout 10: ${payout10Bookings.length} bookings | Earnings: ${p10Earnings} | Commission: ${p10Commission} | Net: ${p10Net}`);
    console.log(`Payout 11: ${payout11Bookings.length} bookings | Earnings: ${p11Earnings} | Commission: ${p11Commission} | Net: ${p11Net}`);
    console.log('✅ Done!');
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('Error:', err);
    process.exit(1);
  } finally {
    connection.release();
  }
}

fixPayoutData();
