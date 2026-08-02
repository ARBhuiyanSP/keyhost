const { pool } = require('../config/database');

async function testDashboard() {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // 1. Get current month earnings summary with payable amount
    const [currentMonthSummary] = await pool.execute(`
      SELECT 
        COALESCE(COUNT(DISTINCT ae.booking_id), 0) as total_bookings,
        COALESCE(SUM(ae.booking_total), 0) as total_booking_amount,
        COALESCE(SUM(ae.commission_amount), 0) as total_commission,
        COALESCE(SUM(ae.tax_amount), 0) as total_tax,
        COALESCE(SUM(ae.net_commission), 0) as net_earnings,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.net_commission ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.net_commission ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'failed' THEN ae.net_commission ELSE 0 END), 0) as failed_amount,
        -- Calculate payable amount (Total - Commission = amount to pay owners)
        -- EXCLUDE bookings already paid out through completed payouts
        COALESCE(SUM(
          CASE WHEN payout_bookings.booking_id IS NULL
          THEN (ae.booking_total - ae.commission_amount) ELSE 0 END
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

    // 2. Get total lifetime earnings with payable amount calculation
    const [lifetimeStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT ae.booking_id) as total_bookings,
        COALESCE(SUM(ae.booking_total), 0) as total_booking_amount,
        COALESCE(SUM(ae.commission_amount), 0) as total_commission,
        COALESCE(SUM(ae.tax_amount), 0) as total_tax,
        COALESCE(SUM(ae.net_commission), 0) as net_earnings,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.net_commission ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.net_commission ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'failed' THEN ae.net_commission ELSE 0 END), 0) as failed_amount,
        -- Calculate payable amount (Total - Commission = amount to pay owners)
        -- EXCLUDE bookings already paid out through completed payouts
        COALESCE(SUM(
          CASE WHEN payout_bookings.booking_id IS NULL
          THEN (ae.booking_total - ae.commission_amount) ELSE 0 END
        ), 0) as payable_amount
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      LEFT JOIN (
        SELECT DISTINCT opi.booking_id
        FROM owner_payout_items opi
        JOIN owner_payouts op ON opi.payout_id = op.id
        WHERE op.payment_status IN ('pending', 'processing', 'completed')
      ) payout_bookings ON ae.booking_id = payout_bookings.booking_id
      WHERE ae.status = 'active'
        AND b.status != 'cancelled' AND b.payment_status = 'paid'
    `);

    const [[currentMonthCompletedPayouts]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(net_payout), 0) as completed_payouts
      FROM owner_payouts
      WHERE payment_status = 'completed'
        AND YEAR(created_at) = ?
        AND MONTH(created_at) = ?
    `, [currentYear, currentMonth]);

    const [[lifetimeCompletedPayouts]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(net_payout), 0) as completed_payouts
      FROM owner_payouts
      WHERE payment_status = 'completed'
    `);

    const [[currentMonthLockedPayouts]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(net_payout), 0) as locked_payouts
      FROM owner_payouts
      WHERE payment_status IN ('pending', 'processing')
        AND YEAR(created_at) = ?
        AND MONTH(created_at) = ?
    `, [currentYear, currentMonth]);

    const [[lifetimeLockedPayouts]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(net_payout), 0) as locked_payouts
      FROM owner_payouts
      WHERE payment_status IN ('pending', 'processing')
    `);

    const getOwnerDue = (summary, fallback = 0) => {
      if (!summary) return fallback;
      const totalBooking = parseFloat(summary.total_booking_amount || 0);
      const totalCommission = parseFloat(summary.total_commission || 0);
      const ownerPortion = totalBooking - totalCommission;
      const originalPayable = parseFloat(summary.payable_amount || 0);
      return Math.max(isNaN(ownerPortion) ? originalPayable : ownerPortion, 0);
    };

    const currentOwnerDue = getOwnerDue(currentMonthSummary[0]);
    const lifetimeOwnerDue = getOwnerDue(lifetimeStats[0]);

    const adjustPayableAmount = (summary, ownerDue, completedAmount, lockedAmount) => {
      if (!summary) return summary;
      const completed = parseFloat(completedAmount || 0);
      const locked = parseFloat(lockedAmount || 0);
      const base = parseFloat(ownerDue || 0);
      // Wait, is adjustedPayable supposed to be base (which is ownerPortion) or locked?
      // Let's print out what all these values are!
      const adjustedPayable = Math.max(locked, 0);
      return {
        ...summary,
        owner_due_total: base,
        payable_amount: adjustedPayable,
        completed_owner_payouts: completed,
        pending_owner_payouts: locked
      };
    };

    console.log('--- RAW VALUES ---');
    console.log('currentMonthSummary[0]:', currentMonthSummary[0]);
    console.log('lifetimeStats[0]:', lifetimeStats[0]);
    console.log('currentMonthCompletedPayouts:', currentMonthCompletedPayouts);
    console.log('lifetimeCompletedPayouts:', lifetimeCompletedPayouts);
    console.log('currentMonthLockedPayouts:', currentMonthLockedPayouts);
    console.log('lifetimeLockedPayouts:', lifetimeLockedPayouts);
    console.log('currentOwnerDue:', currentOwnerDue);
    console.log('lifetimeOwnerDue:', lifetimeOwnerDue);

    const adjustedCurrentMonth = adjustPayableAmount(
      currentMonthSummary[0],
      currentOwnerDue,
      currentMonthCompletedPayouts?.completed_payouts,
      currentMonthLockedPayouts?.locked_payouts
    );
    const adjustedLifetime = adjustPayableAmount(
      lifetimeStats[0],
      lifetimeOwnerDue,
      lifetimeCompletedPayouts?.completed_payouts,
      lifetimeLockedPayouts?.locked_payouts
    );

    console.log('--- ADJUSTED VALUES ---');
    console.log('adjustedCurrentMonth:', adjustedCurrentMonth);
    console.log('adjustedLifetime:', adjustedLifetime);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

testDashboard();
