const mysql = require('d:/88i/booking-systme/backend/node_modules/mysql2');
const dotenv = require('d:/88i/booking-systme/backend/node_modules/dotenv');
dotenv.config({ path: 'd:/88i/booking-systme/backend/.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'keyhost_booking_system',
  port: process.env.DB_PORT || 3306,
});

const promisePool = pool.promise();

async function testPayoutMath() {
  console.log("Starting transaction for payout math verification...");
  const conn = await promisePool.getConnection();
  await conn.beginTransaction();

  try {
    // 1. Setup test user & owner
    console.log("Setting up test owner...");
    const [userRes] = await conn.execute(`
      INSERT INTO users (first_name, last_name, email, phone, password, user_type) 
      VALUES ('Test', 'Owner', 'testowner_payout_verification@example.com', '01700000000', 'hashedpassword', 'property_owner')
    `);
    const userId = userRes.insertId;

    const [ownerRes] = await conn.execute(`
      INSERT INTO property_owners (user_id, business_name) 
      VALUES (?, ?)
    `, [userId, 'Test Payout Biz']);
    const ownerId = ownerRes.insertId;

    // 2. Setup test property
    console.log("Setting up test property...");
    const [propRes] = await conn.execute(`
      INSERT INTO properties (owner_id, title, description, address, base_price, monthly_rent_amount, monthly_rent_enabled, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [ownerId, 'Test Commission Prop', 'Test Prop Desc', '123 Test St', 15.00, 500.00, 1, 'active']);
    const propertyId = propRes.insertId;

    // 3. Create Booking 1: BDT 50 advance online (BDT 40 commission, BDT 460 owner share)
    console.log("Creating Booking 1 (BDT 50 advance online)...");
    const [booking1Res] = await conn.execute(`
      INSERT INTO bookings (
        booking_reference, property_id, check_in_date, check_out_date,
        base_price, total_amount, admin_commission_amount, property_owner_earnings,
        status, booking_type, payment_status, booking_source, source
      ) VALUES (?, ?, '2026-07-01', '2026-07-31', 15.00, 500.00, 40.00, 460.00, 'confirmed', 'monthly', 'paid', 'website', 'Internal')
    `, [`T-B1-${Date.now()}`, propertyId]);
    const b1Id = booking1Res.insertId;

    // Insert SSLCommerz online payment of BDT 50 for Booking 1
    await conn.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, transaction_type,
        amount, cr_amount, status
      ) VALUES (?, ?, 'sslcommerz', 'booking', 'payment', 50.00, 50.00, 'completed')
    `, [b1Id, `T-PAY-1-1-${Date.now()}`]);

    // Insert Cash payment of BDT 450 (manual payment collected by host)
    await conn.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, transaction_type,
        amount, cr_amount, status
      ) VALUES (?, ?, 'cash', 'booking', 'payment', 450.00, 450.00, 'completed')
    `, [b1Id, `T-PAY-1-2-${Date.now()}`]);

    // Insert admin earnings entry for Booking 1
    await conn.execute(`
      INSERT INTO admin_earnings (
        booking_id, property_id, property_owner_id, booking_total, commission_amount, net_commission, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'active')
    `, [b1Id, propertyId, ownerId, 500.00, 40.00, 40.00]);

    // 4. Create Booking 2: BDT 20 advance online (BDT 40 commission, BDT 460 owner share)
    console.log("Creating Booking 2 (BDT 20 advance online)...");
    const [booking2Res] = await conn.execute(`
      INSERT INTO bookings (
        booking_reference, property_id, check_in_date, check_out_date,
        base_price, total_amount, admin_commission_amount, property_owner_earnings,
        status, booking_type, payment_status, booking_source, source
      ) VALUES (?, ?, '2026-08-01', '2026-08-31', 15.00, 500.00, 40.00, 460.00, 'confirmed', 'monthly', 'paid', 'website', 'Internal')
    `, [`T-B2-${Date.now()}`, propertyId]);
    const b2Id = booking2Res.insertId;

    // Insert SSLCommerz online payment of BDT 20 for Booking 2
    await conn.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, transaction_type,
        amount, cr_amount, status
      ) VALUES (?, ?, 'sslcommerz', 'booking', 'payment', 20.00, 20.00, 'completed')
    `, [b2Id, `T-PAY-2-1-${Date.now()}`]);

    // Insert Cash payment of BDT 480 (manual payment collected by host)
    await conn.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, transaction_type,
        amount, cr_amount, status
      ) VALUES (?, ?, 'cash', 'booking', 'payment', 480.00, 480.00, 'completed')
    `, [b2Id, `T-PAY-2-2-${Date.now()}`]);

    // Insert admin earnings entry for Booking 2
    await conn.execute(`
      INSERT INTO admin_earnings (
        booking_id, property_id, property_owner_id, booking_total, commission_amount, net_commission, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'active')
    `, [b2Id, propertyId, ownerId, 500.00, 40.00, 40.00]);

    // 5. Query Dashboard Earnings for Host
    console.log("Verifying dashboard earnings query...");
    const dashboardQuery = `
      SELECT 
        -- Withdrawable earnings (paid bookings not yet in a completed payout)
        COALESCE(SUM(
          CASE WHEN b.id NOT IN (
            SELECT booking_id FROM owner_payout_items opi
            JOIN owner_payouts op ON opi.payout_id = op.id
            WHERE op.payment_status = 'completed'
          )
            AND (b.booking_source = 'website' OR b.source = 'Internal' OR b.payment_method = 'sslcommerz')
          THEN LEAST(
            b.property_owner_earnings,
            COALESCE((SELECT SUM(cr_amount) FROM payments WHERE booking_id = b.id AND payment_method != 'cash' AND status = 'completed'), 0) - b.admin_commission_amount
          ) ELSE 0 END
        ), 0) as withdrawable_amount,
        -- Available for payout (paid bookings not yet in payout requests)
        COALESCE(SUM(
          CASE WHEN b.id NOT IN (
            SELECT booking_id FROM owner_payout_items opi
            JOIN owner_payouts op ON opi.payout_id = op.id
            WHERE op.property_owner_id = ? AND op.payment_status IN ('pending', 'processing', 'completed')
          )
          THEN LEAST(
            b.property_owner_earnings,
            COALESCE((SELECT SUM(cr_amount) FROM payments WHERE booking_id = b.id AND payment_method != 'cash' AND status = 'completed'), 0) - b.admin_commission_amount
          ) ELSE 0 END
        ), 0) as available_for_payout
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? AND b.payment_status = 'paid'
    `;
    const [dashboardResults] = await conn.execute(dashboardQuery, [ownerId, ownerId]);
    console.log("Dashboard Results:", dashboardResults[0]);

    // Expected withdrawable:
    // Booking 1: LEAST(460, 50 - 40) = LEAST(460, 10) = 10
    // Booking 2: LEAST(460, 20 - 40) = LEAST(460, -20) = -20
    // Total withdrawable: 10 + (-20) = -10
    console.log(`Expected total: -10.00. Got: ${dashboardResults[0].withdrawable_amount}`);
    
    if (parseFloat(dashboardResults[0].withdrawable_amount) === -10.00) {
      console.log("✅ Dashboard earnings calculation is correct!");
    } else {
      console.log("❌ Dashboard earnings calculation is incorrect!");
    }

    // 6. Test Admin Payout Eligible Bookings Query
    console.log("Verifying admin payout eligible bookings query...");
    const [eligibleBookings] = await conn.execute(`
      SELECT 
        b.id as booking_id,
        b.booking_reference,
        b.total_amount,
        b.property_owner_earnings,
        LEAST(
          b.property_owner_earnings,
          COALESCE((SELECT SUM(cr_amount) FROM payments WHERE booking_id = b.id AND payment_method != 'cash' AND status = 'completed'), 0)
          - COALESCE(ae.commission_amount, b.admin_commission_amount)
        ) as platform_withdrawable_earnings,
        ae.commission_amount,
        ae.payment_status as commission_status
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
      WHERE p.owner_id = ? 
        AND b.payment_status = 'paid'
        AND (b.booking_source = 'website' OR b.source = 'Internal' OR b.payment_method = 'sslcommerz')
        AND DATE(b.created_at) BETWEEN '2026-06-01' AND '2026-12-31'
        AND b.id NOT IN (
          SELECT booking_id FROM owner_payout_items opi
          JOIN owner_payouts op ON opi.payout_id = op.id
          WHERE op.property_owner_id = ? AND op.payment_status != 'failed'
        )
    `, [ownerId, ownerId]);

    console.log("Eligible Bookings:", eligibleBookings);

    const totalEarnings = eligibleBookings.reduce((sum, booking) => sum + parseFloat(booking.property_owner_earnings), 0);
    const netPayout = eligibleBookings.reduce((sum, booking) => sum + parseFloat(booking.platform_withdrawable_earnings), 0);
    const totalCommissionPaid = totalEarnings - netPayout;

    console.log("Eligible summary:");
    console.log(`- Total Earnings: ${totalEarnings}`);
    console.log(`- Net Payout: ${netPayout}`);
    console.log(`- Total Commission Paid/Offset: ${totalCommissionPaid}`);

    if (netPayout === -10.00) {
      console.log("✅ Eligible bookings net payout offset calculation is correct!");
    } else {
      console.log("❌ Eligible bookings net payout offset calculation is incorrect!");
    }

    // 7. Add a Booking 3 to verify positive netting (Booking 3 has online BDT 200, commission BDT 40, owner share BDT 160)
    console.log("Creating Booking 3 (BDT 200 advance online, BDT 40 commission)...");
    const [booking3Res] = await conn.execute(`
      INSERT INTO bookings (
        booking_reference, property_id, check_in_date, check_out_date,
        base_price, total_amount, admin_commission_amount, property_owner_earnings,
        status, booking_type, payment_status, booking_source, source
      ) VALUES (?, ?, '2026-09-01', '2026-09-30', 15.00, 200.00, 40.00, 160.00, 'confirmed', 'monthly', 'paid', 'website', 'Internal')
    `, [`T-B3-${Date.now()}`, propertyId]);
    const b3Id = booking3Res.insertId;

    // Insert SSLCommerz online payment of BDT 200 for Booking 3
    await conn.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, transaction_type,
        amount, cr_amount, status
      ) VALUES (?, ?, 'sslcommerz', 'booking', 'payment', 200.00, 200.00, 'completed')
    `, [b3Id, `T-PAY-3-1-${Date.now()}`]);

    // Insert admin earnings entry for Booking 3
    await conn.execute(`
      INSERT INTO admin_earnings (
        booking_id, property_id, property_owner_id, booking_total, commission_amount, net_commission, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'active')
    `, [b3Id, propertyId, ownerId, 200.00, 40.00, 40.00]);

    // Re-run dashboard query
    const [dashboardResults2] = await conn.execute(dashboardQuery, [ownerId, ownerId]);
    console.log("Dashboard Results after Booking 3:", dashboardResults2[0]);
    // Booking 3 withdrawable: LEAST(160, 200 - 40) = LEAST(160, 160) = 160.
    // Total withdrawable: 10 + (-20) + 160 = 150.
    console.log(`Expected total: 150.00. Got: ${dashboardResults2[0].withdrawable_amount}`);
    if (parseFloat(dashboardResults2[0].withdrawable_amount) === 150.00) {
      console.log("✅ Netting of multiple bookings works perfectly!");
    } else {
      console.log("❌ Netting of multiple bookings failed!");
    }

  } catch (err) {
    console.error("Error during verification script execution:", err);
  } finally {
    console.log("Rolling back transaction to keep database clean...");
    await conn.rollback();
    conn.release();
    pool.end();
  }
}

testPayoutMath();
