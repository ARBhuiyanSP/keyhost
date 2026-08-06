const { pool } = require('../config/database');

async function debugDetail() {
  const id = 3;
  
  try {
    // Step 1: main query
    console.log('Step 1: Main booking query...');
    const [rows] = await pool.query(`
      SELECT 
        b.*, 
        DATEDIFF(b.check_out_date, b.check_in_date) as nights,
        r.room_number, r.room_type,
        p.title as property_title, p.address as property_address, p.city as property_city,
        po.business_name as company_name,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_user_email,
        u.phone as guest_user_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN property_owners po ON p.owner_id = po.id
      LEFT JOIN hms_rooms r ON b.hms_room_id = r.id
      LEFT JOIN users u ON b.guest_id = u.id
      WHERE b.id = ?
    `, [id]);
    console.log('  OK - rows:', rows.length);
  } catch(e) { console.error('  FAIL Step 1:', e.message); }

  try {
    // Step 2: payments
    console.log('Step 2: Payments query...');
    const [payments] = await pool.query(
      `SELECT id, payment_reference, payment_method, amount, cr_amount, dr_amount, 
              transaction_type, status, notes, payment_date, created_at
       FROM payments WHERE booking_id = ? ORDER BY created_at DESC`, [id]
    );
    console.log('  OK - payments:', payments.length);
  } catch(e) { console.error('  FAIL Step 2:', e.message); }

  try {
    // Step 3: extra bills
    console.log('Step 3: hms_bills query...');
    const [extraBills] = await pool.query('SELECT * FROM hms_bills WHERE booking_id = ? ORDER BY created_at DESC', [id]);
    console.log('  OK - bills:', extraBills.length);
  } catch(e) { console.error('  FAIL Step 3:', e.message); }

  try {
    // Step 4: food orders - check what columns exist
    console.log('Step 4: Checking hms_food_orders columns...');
    const [cols] = await pool.query('DESCRIBE hms_food_orders');
    console.log('  Columns:', cols.map(c => c.Field).join(', '));
  } catch(e) { console.error('  FAIL Step 4 (table may not exist):', e.message); }

  try {
    // Step 5: food orders query as written
    console.log('Step 5: hms_food_orders query...');
    const [foodOrders] = await pool.query(
      `SELECT id, order_reference, total_amount, payment_status, notes, created_at
       FROM hms_food_orders WHERE booking_id = ? ORDER BY created_at DESC`, [id]
    );
    console.log('  OK - food orders:', foodOrders.length);
  } catch(e) { console.error('  FAIL Step 5:', e.message); }

  process.exit(0);
}

debugDetail().catch(e => { console.error('CRASH:', e); process.exit(1); });
