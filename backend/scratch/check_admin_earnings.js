const { pool } = require('../config/database');

async function testAdminEarnings() {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    console.log('--- ADMIN EARNINGS VERIFICATION ---');

    const [currentMonthSummary] = await pool.execute(`
      SELECT 
        COALESCE(COUNT(DISTINCT ae.booking_id), 0) as total_bookings,
        COALESCE(SUM(ae.booking_total - b.security_deposit), 0) as total_booking_amount,
        COALESCE(SUM(ae.commission_amount), 0) as total_commission,
        COALESCE(SUM(ae.tax_amount), 0) as total_tax,
        COALESCE(SUM(ae.net_commission), 0) as net_earnings,
        -- Calculate payable amount (Total - Commission = amount to pay owners)
        COALESCE(SUM(
          CASE WHEN payout_bookings.booking_id IS NULL
          THEN (ae.booking_total - b.security_deposit - ae.commission_amount) ELSE 0 END
        ), 0) as payable_amount
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      LEFT JOIN (
        SELECT DISTINCT opi.booking_id
        FROM owner_payout_items opi
        JOIN owner_payouts op ON opi.payout_id = op.id
        WHERE op.payment_status IN ('pending', 'processing', 'completed')
      ) payout_bookings ON ae.booking_id = payout_bookings.booking_id
      WHERE YEAR(ae.created_at) = ? 
        AND MONTH(ae.created_at) = ? 
        AND ae.status = 'active'
        AND b.status != 'cancelled' AND b.payment_status = 'paid'
    `, [currentYear, currentMonth]);

    console.log('Current Month Summary (with subtracted security deposit):');
    console.log(currentMonthSummary);

    const [transactions] = await pool.execute(`
      SELECT 
        p.id, p.payment_reference, p.amount,
        p.dr_amount, p.cr_amount, p.transaction_type, p.notes,
        p.payment_method, p.status, p.created_at,
        b.id as booking_id, b.booking_reference, b.total_amount
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.status != 'cancelled'
      ORDER BY p.created_at ASC
    `);

    const totalDR = transactions.reduce((sum, txn) => sum + parseFloat(txn.dr_amount || 0), 0);
    const totalCR = transactions.reduce((sum, txn) => sum + parseFloat(txn.cr_amount || 0), 0);
    const totalGuestPayments = transactions
      .filter(txn => ['guest_payment', 'payment', 'security_deposit_claim'].includes(txn.transaction_type))
      .reduce((sum, txn) => sum + parseFloat(txn.cr_amount || 0), 0);
    const pendingGuestPayments = totalDR - totalGuestPayments;

    console.log('--- ADMIN ACCOUNTING SUMMARY ---');
    console.log('Total DR:', totalDR);
    console.log('Total CR:', totalCR);
    console.log('Total Guest Payments:', totalGuestPayments);
    console.log('Pending Guest Payments:', pendingGuestPayments);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

testAdminEarnings();
