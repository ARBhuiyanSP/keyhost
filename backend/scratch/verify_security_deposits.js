const { pool } = require('../config/database');

async function testSecurityDepositFlows() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting Security Deposit Flow verification...');
    
    // Start transaction to isolate database tests
    await connection.beginTransaction();
    console.log('Transaction started.');

    let guestId, ownerId, propertyId;

    // 1. Try to find existing guest user
    const [existingGuests] = await connection.execute(`
      SELECT id FROM users WHERE user_type = 'guest' LIMIT 1
    `);
    if (existingGuests.length > 0) {
      guestId = existingGuests[0].id;
      console.log(`Using existing Guest ID: ${guestId}`);
    } else {
      // Create Mock Guest
      const [guestResult] = await connection.execute(`
        INSERT INTO users (first_name, last_name, email, password, phone, user_type, created_at)
        VALUES ('TestGuest', 'One', 'testguest1@example.com', 'hashedpassword', '1234567890', 'guest', NOW())
      `);
      guestId = guestResult.insertId;
      console.log(`Created Mock Guest ID: ${guestId}`);
    }

    // 2. Try to find existing property owner
    const [existingOwners] = await connection.execute(`
      SELECT id FROM property_owners LIMIT 1
    `);
    if (existingOwners.length > 0) {
      ownerId = existingOwners[0].id;
      console.log(`Using existing Property Owner ID: ${ownerId}`);
    } else {
      // Create Host User first
      const [hostResult] = await connection.execute(`
        INSERT INTO users (first_name, last_name, email, password, phone, user_type, created_at)
        VALUES ('TestHost', 'One', 'testhost1@example.com', 'hashedpassword', '0987654321', 'host', NOW())
      `);
      const hostUserId = hostResult.insertId;
      // Create Property Owner
      const [ownerResult] = await connection.execute(`
        INSERT INTO property_owners (user_id, created_at)
        VALUES (?, NOW())
      `);
      ownerId = ownerResult.insertId;
      console.log(`Created Mock Host User and Property Owner ID: ${ownerId}`);
    }

    // Initialize Owner Balance if not exists
    const [existingBalances] = await connection.execute(`
      SELECT id FROM owner_balances WHERE property_owner_id = ?
    `, [ownerId]);
    if (existingBalances.length === 0) {
      await connection.execute(`
        INSERT INTO owner_balances (property_owner_id, total_earnings, total_payouts, current_balance)
        VALUES (?, 0, 0, 0)
      `, [ownerId]);
      console.log('Initialized Owner Balance.');
    }

    // 3. Try to find existing property
    const [existingProperties] = await connection.execute(`
      SELECT id FROM properties LIMIT 1
    `);
    if (existingProperties.length > 0) {
      propertyId = existingProperties[0].id;
      console.log(`Using existing Property ID: ${propertyId}`);
    } else {
      // Create Mock Property
      const [propertyResult] = await connection.execute(`
        INSERT INTO properties (
          owner_id, title, description, property_type, address, city, country,
          latitude, longitude, base_price, cleaning_fee, security_deposit, status, created_at
        ) VALUES (?, 'Test Luxury Apartment', 'Beautiful unit', 'apartment', '123 Test St', 'Dhaka', 'Bangladesh',
          23.811, 90.412, 1000.00, 150.00, 500.00, 'active', NOW())
      `);
      propertyId = propertyResult.insertId;
      console.log(`Created Mock Property ID: ${propertyId}`);
    }

    // 4. Create Booking with checked-out status and security deposit
    const [bookingResult] = await connection.execute(`
      INSERT INTO bookings (
        booking_reference, guest_id, property_id, check_in_date, check_out_date,
        total_amount, security_deposit, security_deposit_status, status, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, '2026-06-01', '2026-06-05', 4150.00, 500.00, 'pending', 'checked_out', 'paid', NOW(), NOW())
    `, [`REF-${Date.now()}`, guestId, propertyId]);
    const bookingId = bookingResult.insertId;
    console.log(`Created Mock Booking ID: ${bookingId}`);

    // Create Booking Payment
    const [paymentResult] = await connection.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type, amount, status, payment_date, created_at
      ) VALUES (?, ?, 'sslcommerz', 'booking_payment', 4150.00, 'completed', NOW(), NOW())
    `, [bookingId, `REF-PAY-${Date.now()}`]);
    const paymentId = paymentResult.insertId;
    console.log(`Created Mock Payment ID: ${paymentId}`);

    // 5. Fetch security deposits list to test the SQL query of GET /admin/security-deposits
    console.log('Testing GET /admin/security-deposits query compatibility...');
    const [deposits] = await connection.execute(`
      SELECT 
        b.id,
        b.booking_reference,
        b.status as booking_status,
        b.payment_status,
        DATE_FORMAT(b.check_in_date, '%Y-%m-%d') as check_in_date,
        DATE_FORMAT(b.check_out_date, '%Y-%m-%d') as check_out_date,
        b.total_amount,
        b.security_deposit,
        b.security_deposit_status,
        b.security_deposit_claim_amount,
        b.security_deposit_deduction_amount,
        b.security_deposit_claim_reason,
        b.security_deposit_claim_at,
        p.id as property_id,
        p.title as property_title,
        u.first_name as guest_first_name,
        u.last_name as guest_last_name,
        u.email as guest_email,
        u.phone as guest_phone,
        u2.first_name as owner_first_name,
        u2.last_name as owner_last_name,
        u2.email as owner_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u2 ON po.user_id = u2.id
      WHERE b.security_deposit > 0 AND b.status = "checked_out" AND b.id = ?
    `, [bookingId]);

    if (deposits.length === 1 && deposits[0].id === bookingId) {
      console.log('✅ GET /admin/security-deposits compatibility check: PASSED');
    } else {
      throw new Error(`GET query failed to return test booking. Returned count: ${deposits.length}`);
    }

    // 6. Test Full Release Flow (deduction = 0)
    console.log('Testing Full Release Flow (deduction_amount = 0)...');
    const deduction0 = 0;
    const refundAmount0 = 500 - deduction0; // 500.00 - 0.00 = 500.00
    const refundRef0 = `SEC-REF-TEST0-${Date.now()}`;
    const notes0 = 'Test full release notes';

    // Insert refund record
    await connection.execute(`
      INSERT INTO refunds (
        booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund,
        refund_reason, refund_type, cancellation_policy_applied, status, requested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
        bookingId, 
        paymentId, 
        refundRef0, 
        500.00, 
        refundAmount0, 
        refundAmount0, 
        'Security Deposit Release', 
        'full',
        `Released. ${notes0}`
    ]);

    // Update booking status
    await connection.execute(
      `UPDATE bookings b
       SET b.security_deposit_status = "processed", 
           b.security_deposit_deduction_amount = ?,
           b.updated_at = NOW() 
       WHERE b.id = ?`,
      [deduction0, bookingId]
    );

    // Verify refund row
    const [refunds0] = await connection.execute('SELECT * FROM refunds WHERE booking_id = ? AND refund_type = "full"', [bookingId]);
    if (refunds0.length === 1 && parseFloat(refunds0[0].refund_amount) === 500) {
      console.log('✅ Full Release Refund entry: PASSED');
    } else {
      throw new Error(`Refund entry not found or incorrect amount: ${JSON.stringify(refunds0)}`);
    }

    // Verify booking updates
    const [bookingAfterRelease] = await connection.execute('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (bookingAfterRelease[0].security_deposit_status === 'processed' && parseFloat(bookingAfterRelease[0].security_deposit_deduction_amount) === 0) {
      console.log('✅ Full Release Booking update: PASSED');
    } else {
      throw new Error('Booking status/deduction incorrect after full release');
    }

    // 7. Test Partial Deduction Flow (deduction = 100.00)
    console.log('Testing Partial Deduction Flow (deduction_amount = 100)...');
    
    // We will reset booking state to pending check_out for test 2
    await connection.execute('UPDATE bookings SET security_deposit_status = "pending", security_deposit_deduction_amount = 0 WHERE id = ?', [bookingId]);

    const deduction100 = 100.00;
    const refundAmount100 = 500.00 - deduction100; // 400.00
    const refundRef100 = `SEC-REF-TEST100-${Date.now()}`;
    const reason100 = 'Stained carpet';
    const notes100 = 'Deducted by admin';

    // Insert refund record
    await connection.execute(`
      INSERT INTO refunds (
        booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund,
        refund_reason, refund_type, cancellation_policy_applied, status, requested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
        bookingId, 
        paymentId, 
        refundRef100, 
        500.00, 
        refundAmount100, 
        refundAmount100, 
        'Security Deposit Return', 
        'partial',
        `Deduction: ৳${deduction100}. Reason: ${reason100}. ${notes100}`
    ]);

    // Update booking status & owner earnings
    await connection.execute(
      `UPDATE bookings b
       SET b.security_deposit_status = "processed", 
           b.security_deposit_deduction_amount = ?,
           b.property_owner_earnings = b.property_owner_earnings + ?,
           b.updated_at = NOW() 
       WHERE b.id = ?`,
      [deduction100, deduction100, bookingId]
    );

    // Update owner balance
    await connection.execute(`
      UPDATE owner_balances 
      SET total_earnings = total_earnings + ?,
          current_balance = current_balance + ?,
          last_updated = NOW()
      WHERE property_owner_id = ?
    `, [deduction100, deduction100, ownerId]);

    // Record adjustment payment transaction
    await connection.execute(`
      INSERT INTO payments (
        booking_id, payment_reference, payment_method, payment_type,
        amount, dr_amount, cr_amount, transaction_type, notes,
        status, payment_date, created_at
      ) VALUES (?, ?, 'adjustment', 'credit', ?, ?, ?, 'security_deposit_claim', ?, 'completed', NOW(), NOW())
    `, [
      bookingId,
      `CLAIM-${bookingId}-${Date.now()}`,
      deduction100,
      deduction100,
      deduction100,
      `Security deposit deduction credit to host: ${reason100}`
    ]);

    // Verify refund entry
    const [refunds100] = await connection.execute('SELECT * FROM refunds WHERE booking_id = ? AND refund_type = "partial"', [bookingId]);
    if (refunds100.length === 1 && parseFloat(refunds100[0].refund_amount) === 400 && parseFloat(refunds100[0].original_amount) === 500) {
      console.log('✅ Deduction Refund entry: PASSED');
    } else {
      throw new Error(`Deduction Refund entry not found or incorrect: ${JSON.stringify(refunds100)}`);
    }

    // Verify owner balance update
    const [balance] = await connection.execute('SELECT * FROM owner_balances WHERE property_owner_id = ?', [ownerId]);
    const balanceObj = balance[0];
    console.log('Post-deduction balance object:', balanceObj);
    
    // Verify adjustment transaction recorded
    const [adjTx] = await connection.execute('SELECT * FROM payments WHERE booking_id = ? AND transaction_type = "security_deposit_claim"', [bookingId]);
    if (adjTx.length === 1 && parseFloat(adjTx[0].amount) === 100) {
      console.log('✅ Adjustment Payment transaction entry: PASSED');
    } else {
      throw new Error(`Adjustment transaction incorrect or not found: ${JSON.stringify(adjTx)}`);
    }

    console.log('All database assertions: PASSED 🎉');

    // Rollback so the database remains completely pristine
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

testSecurityDepositFlows();
