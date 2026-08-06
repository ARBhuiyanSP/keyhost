const { pool } = require('../config/database');

async function testGuestRefundsQuery() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting Guest Refunds Query verification...');
    
    // Start transaction to isolate database tests
    await connection.beginTransaction();
    console.log('Transaction started.');

    // Create Guest User
    const [guestResult] = await connection.execute(`
      INSERT INTO users (first_name, last_name, email, password, phone, user_type, created_at)
      VALUES ('GuestRefunds', 'Tester', 'guestrefunds@example.com', 'hashedpassword', '9999999999', 'guest', NOW())
    `);
    const guestId = guestResult.insertId;
    console.log(`Created Guest ID: ${guestId}`);

    // Create Host
    const [hostResult] = await connection.execute(`
      INSERT INTO users (first_name, last_name, email, password, phone, user_type, created_at)
      VALUES ('HostRefunds', 'Tester', 'hostrefunds@example.com', 'hashedpassword', '8888888888', 'host', NOW())
    `);
    const hostUserId = hostResult.insertId;
    const [ownerResult] = await connection.execute(`
      INSERT INTO property_owners (user_id, created_at)
      VALUES (?, NOW())
    `, [hostUserId]);
    const ownerId = ownerResult.insertId;

    // Create Property
    const [propertyResult] = await connection.execute(`
      INSERT INTO properties (
        owner_id, title, description, property_type, address, city, country,
        latitude, longitude, base_price, cleaning_fee, security_deposit, status, created_at
      ) VALUES (?, 'Test Property for Refunds', 'desc', 'apartment', 'address', 'city', 'country',
        23.811, 90.412, 1000.00, 150.00, 500.00, 'active', NOW())
    `, [ownerId]);
    const propertyId = propertyResult.insertId;

    // 1. Create Cancelled Booking (to test Cancellation Refund)
    const [booking1Result] = await connection.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id, check_in_date, check_out_date,
        total_amount, security_deposit, security_deposit_status, status, payment_status, created_at, updated_at
      ) VALUES ('REF-CANCEL-1', ?, ?, '2026-06-01', '2026-06-05', 4150.00, 500.00, 'pending', 'cancelled', 'paid', NOW(), NOW())
    `, [guestId, propertyId]);
    const booking1Id = booking1Result.insertId;

    const [payment1Result] = await connection.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, amount, status, payment_date, created_at
      ) VALUES (?, 'REF-PAY-1', 'sslcommerz', 'booking_payment', 4150.00, 'completed', NOW(), NOW())
    `, [booking1Id]);
    const payment1Id = payment1Result.insertId;

    // Insert Cancellation Refund
    await connection.execute(`
      INSERT INTO refunds (
        booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund,
        refund_reason, refund_type, cancellation_policy_applied, status, requested_at
      ) VALUES (?, ?, 'REFUND-CANCEL-1', 4150.00, 4150.00, 4150.00, 'Guest Cancelled', 'full', 'Refund policy applied', 'pending', NOW())
    `, [booking1Id, payment1Id]);

    // 2. Create Checked-Out Booking (to test Security Deposit Refund)
    const [booking2Result] = await connection.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id, check_in_date, check_out_date,
        total_amount, security_deposit, security_deposit_status, status, payment_status, created_at, updated_at
      ) VALUES ('REF-CHECKOUT-2', ?, ?, '2026-06-10', '2026-06-15', 4150.00, 500.00, 'processed', 'checked_out', 'paid', NOW(), NOW())
    `, [guestId, propertyId]);
    const booking2Id = booking2Result.insertId;

    const [payment2Result] = await connection.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, amount, status, payment_date, created_at
      ) VALUES (?, 'REF-PAY-2', 'sslcommerz', 'booking_payment', 4150.00, 'completed', NOW(), NOW())
    `, [booking2Id]);
    const payment2Id = payment2Result.insertId;

    // Insert Security Deposit Refund
    await connection.execute(`
      INSERT INTO refunds (
        booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund,
        refund_reason, refund_type, cancellation_policy_applied, status, requested_at
      ) VALUES (?, ?, 'REFUND-SEC-2', 500.00, 500.00, 500.00, 'Security Deposit Release', 'full', 'Released fully', 'pending', NOW())
    `, [booking2Id, payment2Id]);

    // 3. Execute the endpoint query for this guest
    console.log('Executing GET /guest/refunds SQL query simulation...');
    const [refunds] = await connection.execute(`
      SELECT 
        r.id,
        r.booking_id,
        r.payment_id,
        r.refund_reference,
        r.original_amount,
        r.refund_amount,
        r.net_refund,
        r.refund_reason,
        r.refund_type,
        r.cancellation_policy_applied,
        r.status,
        r.requested_at,
        r.completed_at,
        b.booking_reference,
        p.title as property_title,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND image_type = 'main' AND is_active = 1 LIMIT 1) as property_image
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      WHERE b.guest_id = ?
      ORDER BY r.requested_at DESC
    `, [guestId]);

    console.log('Query result count:', refunds.length);
    console.log('Refunds details:', JSON.stringify(refunds, null, 2));

    // Assert that we get both refunds
    if (refunds.length === 2) {
      console.log('✅ Success: Query returned both the cancellation refund AND the security deposit refund.');
      const cancelRefund = refunds.find(r => r.refund_reference === 'REFUND-CANCEL-1');
      const secRefund = refunds.find(r => r.refund_reference === 'REFUND-SEC-2');

      if (cancelRefund && secRefund) {
        console.log('✅ Success: Both types are fully identified and joined correctly.');
      } else {
        throw new Error('Could not find both specific refund entries');
      }
    } else {
      throw new Error(`Expected 2 refunds, but got ${refunds.length}`);
    }

    // Rollback so the database remains pristine
    await connection.rollback();
    console.log('Transaction successfully rolled back. Database is pristine.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Verification failed:', error);
    try {
      await connection.rollback();
      console.log('Transaction rolled back after failure.');
    } catch (rollbackErr) {
      console.error('Failed to rollback transaction:', rollbackErr);
    }
    process.exit(1);
  } finally {
    connection.release();
  }
}

testGuestRefundsQuery();
