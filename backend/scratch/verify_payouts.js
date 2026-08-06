const { pool } = require('../config/database');
pool.execute(`
  SELECT op.id, op.payout_reference, op.net_payout, op.payment_status, COUNT(opi.id) as items_count 
  FROM owner_payouts op 
  LEFT JOIN owner_payout_items opi ON op.id = opi.payout_id 
  GROUP BY op.id
`).then(([rows]) => {
  console.log('Final payout state:');
  rows.forEach(r => console.log(
    'Payout', r.id, '|', r.payout_reference, '| BDT', r.net_payout, '|', r.payment_status, '|', r.items_count, 'bookings'
  ));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
