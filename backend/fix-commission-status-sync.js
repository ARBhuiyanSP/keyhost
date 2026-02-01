const mysql = require('mysql2/promise');

async function fixCommissionStatusSync() {
  console.log('🔧 Fixing Commission Status Synchronization...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'keyhost_booking_system'
    });

    console.log('📊 Connected to database successfully');

    // Find bookings where payments are completed but admin_earnings are still pending
    console.log('🔍 Finding bookings with payment status discrepancies...');
    
    const [discrepancies] = await connection.execute(`
      SELECT 
        ae.id as admin_earnings_id,
        ae.booking_id,
        ae.payment_status as admin_payment_status,
        b.payment_status as booking_payment_status,
        b.booking_reference,
        COALESCE(SUM(p.cr_amount), 0) as total_cr_amount,
        COALESCE(SUM(p.dr_amount), 0) as total_dr_amount
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
      WHERE ae.payment_status = 'pending'
      AND b.payment_status = 'paid'
      GROUP BY ae.id, ae.booking_id, ae.payment_status, b.payment_status, b.booking_reference
      HAVING total_cr_amount > 0
    `);

    console.log(`📋 Found ${discrepancies.length} commission status discrepancies`);

    if (discrepancies.length === 0) {
      console.log('✅ No discrepancies found. Commission status is already synchronized.');
      await connection.end();
      return;
    }

    // Fix each discrepancy
    let fixedCount = 0;
    for (const discrepancy of discrepancies) {
      console.log(`🔧 Fixing booking ${discrepancy.booking_reference} (ID: ${discrepancy.booking_id})`);
      
      // Update admin_earnings to paid status
      await connection.execute(`
        UPDATE admin_earnings 
        SET payment_status = 'paid', 
            payment_date = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `, [discrepancy.admin_earnings_id]);
      
      fixedCount++;
      console.log(`✅ Fixed admin earnings for booking ${discrepancy.booking_reference}`);
    }

    console.log('');
    console.log(`✅ Commission status synchronization completed!`);
    console.log(`📊 Fixed ${fixedCount} discrepancies`);
    console.log('');
    console.log('🎯 Summary:');
    console.log('   • Updated admin_earnings.payment_status from "pending" to "paid"');
    console.log('   • Set payment_date to current timestamp');
    console.log('   • Synchronized with existing booking payment status');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Check admin earnings dashboard');
    console.log('   3. Verify property owner earnings view');

    await connection.end();

  } catch (error) {
    console.error('❌ Failed to fix commission status synchronization');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixCommissionStatusSync();
