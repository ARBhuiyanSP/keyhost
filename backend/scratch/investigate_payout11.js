const { pool } = require('../config/database');

async function investigate() {
  const [payout] = await pool.execute('SELECT * FROM owner_payouts WHERE id = 11');
  const p = payout[0];
  console.log('=== Payout 11 Full Record ===');
  console.log(JSON.stringify(p, null, 2));

  // Check payout 10 items (the previous one that ate 80 bookings)
  const [p10items] = await pool.execute(`
    SELECT opi.booking_id, opi.owner_earnings, b.booking_reference, b.status, DATE(b.created_at) as date
    FROM owner_payout_items opi
    JOIN bookings b ON opi.booking_id = b.id
    WHERE opi.payout_id = 10
    ORDER BY b.created_at ASC
    LIMIT 10
  `);
  console.log('\n=== Payout 10 first 10 items (for reference) ===');
  p10items.forEach(b => console.log(' -', b.booking_id, b.booking_reference, b.status, 'BDT:', b.owner_earnings, 'Date:', b.date));

  // What is payout 11's amount exactly and when was it created?
  console.log('\n=== Payout 11 summary ===');
  console.log('Amount (net_payout):', p.net_payout);
  console.log('Total earnings:', p.total_earnings);
  console.log('Total commission paid:', p.total_commission_paid);
  console.log('Created at:', p.created_at);
  console.log('Status:', p.payment_status);

  process.exit(0);
}

investigate().catch(e => { console.error(e); process.exit(1); });
