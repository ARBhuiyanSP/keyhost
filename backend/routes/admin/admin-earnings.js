const express = require('express');
const { pool } = require('../../config/database');
const { formatResponse, generatePagination } = require('../../utils/helpers');
const { validatePagination } = require('../../middleware/validation');

const router = express.Router();

// =============================================
// ADMIN EARNINGS DASHBOARD
// =============================================
router.get('/dashboard', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Get current month earnings summary with payable amount
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
        AND b.status != 'cancelled'
    `, [currentYear, currentMonth]);

    // Get total lifetime earnings with payable amount calculation
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
        AND b.status != 'cancelled'
    `);

    // Get monthly earnings for the last 12 months (calculated directly from admin_earnings to exclude cancelled bookings)
    const [monthlyEarnings] = await pool.execute(`
      SELECT 
        YEAR(ae.created_at) as year,
        MONTH(ae.created_at) as month,
        COUNT(DISTINCT ae.booking_id) as total_bookings,
        COALESCE(SUM(ae.booking_total), 0) as total_booking_amount,
        COALESCE(SUM(ae.commission_amount), 0) as total_commission,
        COALESCE(SUM(ae.net_commission), 0) as net_earnings
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      WHERE ae.status = 'active'
        AND b.status != 'cancelled'
        AND (
          (YEAR(ae.created_at) = ? AND MONTH(ae.created_at) >= ?) 
          OR (YEAR(ae.created_at) = ? AND MONTH(ae.created_at) <= ?)
        )
      GROUP BY YEAR(ae.created_at), MONTH(ae.created_at)
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [currentYear, currentMonth - 11, currentYear - 1, currentMonth]);

    // Get recent earnings (last 10)
    const [recentEarnings] = await pool.execute(`
      SELECT 
        ae.*,
        b.booking_reference,
        b.guest_name,
        b.guest_email,
        p.title as property_title,
        p.city as property_city,
        po.business_name as owner_business_name,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      JOIN properties p ON ae.property_id = p.id
      JOIN property_owners po ON ae.property_owner_id = po.id
      JOIN users u ON po.user_id = u.id
      WHERE ae.status = 'active'
        AND b.status != 'cancelled'
      ORDER BY ae.created_at DESC
      LIMIT 10
    `);

    // Sum completed owner payouts to adjust payable amounts
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
      const adjustedPayable = Math.max(locked, 0);
      return {
        ...summary,
        owner_due_total: base,
        payable_amount: adjustedPayable,
        completed_owner_payouts: completed,
        pending_owner_payouts: locked
      };
    };

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

    // Get commission settings
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value
      FROM system_settings
      WHERE setting_key IN ('admin_commission_rate', 'admin_tax_rate', 'minimum_payout_amount')
    `);

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = parseFloat(setting.setting_value);
    });

    res.json(formatResponse(true, 'Admin earnings dashboard retrieved successfully', {
      currentMonth: adjustedCurrentMonth || {
        total_bookings: 0,
        total_booking_amount: 0,
        total_commission: 0,
        total_tax: 0,
        net_earnings: 0,
        pending_amount: 0,
        paid_amount: 0,
        failed_amount: 0,
        payable_amount: 0  // Total - Commission = amount to pay owners
      },
      lifetime: adjustedLifetime || {
        total_bookings: 0,
        total_booking_amount: 0,
        total_commission: 0,
        total_tax: 0,
        net_earnings: 0,
        pending_amount: 0,
        paid_amount: 0,
        failed_amount: 0,
        payable_amount: 0  // Total - Commission = amount to pay owners
      },
      monthlyEarnings,
      recentEarnings,
      settings: settingsObj
    }));

  } catch (error) {
    console.error('Admin earnings dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve admin earnings dashboard', null, error.message)
    );
  }
});

// =============================================
// UPDATE EARNINGS PAYMENT STATUS
// =============================================
router.patch('/earnings/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method, payment_reference, payment_date } = req.body;

    if (!payment_status || !['pending', 'paid', 'failed'].includes(payment_status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid payment status')
      );
    }

    const updateData = {
      payment_status,
      updated_at: new Date()
    };

    if (payment_method) updateData.payment_method = payment_method;
    if (payment_reference) updateData.payment_reference = payment_reference;
    if (payment_date) updateData.payment_date = payment_date;
    if (payment_status === 'paid') updateData.payment_date = new Date();

    const [result] = await pool.execute(`
      UPDATE admin_earnings 
      SET payment_status = ?, payment_method = ?, payment_reference = ?, payment_date = ?, updated_at = ?
      WHERE id = ?
    `, [
      updateData.payment_status,
      updateData.payment_method || null,
      updateData.payment_reference || null,
      updateData.payment_date || null,
      updateData.updated_at,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Earnings record not found')
      );
    }

    res.json(formatResponse(true, 'Payment status updated successfully'));

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update payment status', null, error.message)
    );
  }
});

// =============================================
// GET ADMIN EARNINGS HISTORY
// =============================================
router.get('/earnings', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, payment_status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE ae.status = 'active'";
    const queryParams = [];

    if (status) {
      whereClause += " AND ae.status = ?";
      queryParams.push(status);
    }

    if (payment_status) {
      whereClause += " AND ae.payment_status = ?";
      queryParams.push(payment_status);
    }

    if (start_date) {
      whereClause += " AND DATE(ae.created_at) >= ?";
      queryParams.push(start_date);
    }

    if (end_date) {
      whereClause += " AND DATE(ae.created_at) <= ?";
      queryParams.push(end_date);
    }

    // Get earnings with pagination
    const [earnings] = await pool.execute(`
      SELECT 
        ae.*,
        b.booking_reference,
        b.guest_name,
        b.guest_email,
        b.check_in_date,
        b.check_out_date,
        p.title as property_title,
        p.city as property_city,
        po.business_name as owner_business_name,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      JOIN properties p ON ae.property_id = p.id
      JOIN property_owners po ON ae.property_owner_id = po.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
        AND b.status != 'cancelled'
      ORDER BY ae.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      ${whereClause}
        AND b.status != 'cancelled'
    `, queryParams);

    const total = countResult[0].total;
    const pagination = generatePagination(page, limit, total);

    res.json(formatResponse(true, 'Admin earnings retrieved successfully', {
      earnings,
      pagination
    }));

  } catch (error) {
    console.error('Get admin earnings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve admin earnings', null, error.message)
    );
  }
});

// =============================================
// GET MONTHLY EARNINGS SUMMARY
// =============================================
router.get('/monthly-summary', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let whereClause = '';
    const queryParams = [];

    if (year && month) {
      whereClause = 'WHERE year = ? AND month = ?';
      queryParams.push(parseInt(year), parseInt(month));
    } else if (year) {
      whereClause = 'WHERE year = ?';
      queryParams.push(parseInt(year));
    }

    // Calculate from admin_earnings directly to exclude cancelled bookings
    let summaryWhereClause = "WHERE ae.status = 'active'";
    const summaryQueryParams = [];
    
    if (year && month) {
      summaryWhereClause += ' AND YEAR(ae.created_at) = ? AND MONTH(ae.created_at) = ?';
      summaryQueryParams.push(parseInt(year), parseInt(month));
    } else if (year) {
      summaryWhereClause += ' AND YEAR(ae.created_at) = ?';
      summaryQueryParams.push(parseInt(year));
    }
    
    const [summary] = await pool.execute(`
      SELECT 
        YEAR(ae.created_at) as year,
        MONTH(ae.created_at) as month,
        COUNT(DISTINCT ae.booking_id) as total_bookings,
        COALESCE(SUM(ae.booking_total), 0) as total_booking_amount,
        COALESCE(SUM(ae.commission_amount), 0) as total_commission,
        COALESCE(SUM(ae.tax_amount), 0) as total_tax,
        COALESCE(SUM(ae.net_commission), 0) as net_earnings,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.net_commission ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.net_commission ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'failed' THEN ae.net_commission ELSE 0 END), 0) as failed_amount,
        MIN(ae.created_at) as created_at,
        MAX(ae.updated_at) as updated_at
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      ${summaryWhereClause}
        AND b.status != 'cancelled'
      GROUP BY YEAR(ae.created_at), MONTH(ae.created_at)
      ORDER BY year DESC, month DESC
    `, summaryQueryParams);

    res.json(formatResponse(true, 'Monthly earnings summary retrieved successfully', {
      summary
    }));

  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve monthly summary', null, error.message)
    );
  }
});

// =============================================
// CREATE ADMIN PAYOUT
// =============================================
router.post('/payouts', async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      payment_method,
      bank_name,
      account_number,
      routing_number,
      notes
    } = req.body;

    if (!start_date || !end_date || !payment_method) {
      return res.status(400).json(
        formatResponse(false, 'Start date, end date, and payment method are required')
      );
    }

    // Calculate total earnings for the period
    const [earningsData] = await pool.execute(`
      SELECT 
        COUNT(*) as total_earnings_count,
        COALESCE(SUM(net_commission), 0) as total_earnings,
        COALESCE(SUM(tax_amount), 0) as total_tax
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      WHERE DATE(b.created_at) BETWEEN ? AND ?
      AND ae.status = 'active'
      AND ae.payment_status = 'paid'
      AND b.status != 'cancelled'
    `, [start_date, end_date]);

    const { total_earnings, total_tax } = earningsData[0];
    const net_payout = total_earnings - total_tax;

    // Generate payout reference
    const payout_reference = `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payout record
    const [result] = await pool.execute(`
      INSERT INTO admin_payouts (
        payout_reference, start_date, end_date,
        total_earnings, total_tax, net_payout,
        payment_method, bank_name, account_number, routing_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      payout_reference, start_date, end_date,
      total_earnings, total_tax, net_payout,
      payment_method, bank_name || null, account_number || null, routing_number || null, notes || null
    ]);

    res.status(201).json(formatResponse(true, 'Payout created successfully', {
      payout_id: result.insertId,
      payout_reference,
      total_earnings,
      total_tax,
      net_payout
    }));

  } catch (error) {
    console.error('Create payout error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create payout', null, error.message)
    );
  }
});

// =============================================
// GET ADMIN PAYOUTS
// =============================================
router.get('/payouts', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, payment_status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams = [];

    if (payment_status) {
      whereClause = 'WHERE payment_status = ?';
      queryParams.push(payment_status);
    }

    const [payouts] = await pool.execute(`
      SELECT *
      FROM admin_payouts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM admin_payouts
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;
    const pagination = generatePagination(page, limit, total);

    res.json(formatResponse(true, 'Admin payouts retrieved successfully', {
      payouts,
      pagination
    }));

  } catch (error) {
    console.error('Get admin payouts error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve admin payouts', null, error.message)
    );
  }
});

// =============================================
// UPDATE PAYOUT STATUS
// =============================================
router.patch('/payouts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_reference, notes } = req.body;

    if (!payment_status || !['pending', 'processing', 'completed', 'failed'].includes(payment_status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid payment status')
      );
    }

    const updateData = {
      payment_status,
      updated_at: new Date()
    };

    if (payment_reference) updateData.payment_reference = payment_reference;
    if (notes) updateData.notes = notes;
    if (payment_status === 'completed') updateData.payment_date = new Date();

    const [result] = await pool.execute(`
      UPDATE admin_payouts 
      SET payment_status = ?, payment_reference = ?, payment_date = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      updateData.payment_status,
      updateData.payment_reference || null,
      updateData.payment_date || null,
      updateData.notes || null,
      updateData.updated_at,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Payout not found')
      );
    }

    res.json(formatResponse(true, 'Payout status updated successfully'));

  } catch (error) {
    console.error('Update payout status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update payout status', null, error.message)
    );
  }
});

// =============================================
// GET EARNINGS ANALYTICS
// =============================================
router.get('/analytics', async (req, res) => {
  try {
    const { period = '12' } = req.query; // months

    // Get earnings trend for the specified period
    const [earningsTrend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(ae.created_at, '%Y-%m') as month,
        COUNT(*) as bookings_count,
        COALESCE(SUM(ae.booking_total), 0) as total_booking_amount,
        COALESCE(SUM(ae.commission_amount), 0) as total_commission,
        COALESCE(SUM(ae.net_commission), 0) as net_earnings
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      WHERE ae.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      AND ae.status = 'active'
      AND b.status != 'cancelled'
      GROUP BY DATE_FORMAT(ae.created_at, '%Y-%m')
      ORDER BY month DESC
    `, [parseInt(period)]);

    // Get top earning properties
    const [topProperties] = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.city,
        COUNT(ae.id) as bookings_count,
        COALESCE(SUM(ae.commission_amount), 0) as total_commission
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      JOIN properties p ON ae.property_id = p.id
      WHERE ae.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      AND ae.status = 'active'
      AND b.status != 'cancelled'
      GROUP BY p.id, p.title, p.city
      ORDER BY total_commission DESC
      LIMIT 10
    `, [parseInt(period)]);

    // Get payment status breakdown
    const [paymentBreakdown] = await pool.execute(`
      SELECT 
        ae.payment_status as payment_status,
        COUNT(*) as count,
        COALESCE(SUM(ae.net_commission), 0) as amount
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      WHERE ae.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      AND ae.status = 'active'
      AND b.status != 'cancelled'
      GROUP BY ae.payment_status
    `, [parseInt(period)]);

    res.json(formatResponse(true, 'Earnings analytics retrieved successfully', {
      earningsTrend,
      topProperties,
      paymentBreakdown
    }));

  } catch (error) {
    console.error('Get earnings analytics error:', {
      message: error.message,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve earnings analytics', null, error.message)
    );
  }
});

module.exports = router;

// =============================================
// COLLECT COMMISSION FROM OWNER (OWNER REMITS TO ADMIN)
// =============================================
// Records a commission remittance against a specific booking and
// marks the corresponding admin_earnings row as paid.
router.post('/:bookingId/collect-commission', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, payment_method, payment_reference, notes } = req.body;

    // Fetch earnings for the booking
    const [earningsRows] = await pool.execute(`
      SELECT ae.id, ae.net_commission, ae.payment_status
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      WHERE ae.booking_id = ? AND ae.status = 'active' AND b.status != 'cancelled'
      LIMIT 1
    `, [bookingId]);

    if (earningsRows.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Admin earnings not found for this booking')
      );
    }

    const earnings = earningsRows[0];

    if (earnings.payment_status === 'paid') {
      return res.status(400).json(
        formatResponse(false, 'Commission already marked as paid for this booking')
      );
    }

    const remitAmount = parseFloat(amount || earnings.net_commission);
    if (!remitAmount || remitAmount <= 0) {
      return res.status(400).json(
        formatResponse(false, 'Invalid commission amount')
      );
    }

    // Create a CR entry to reflect commission remitted to admin
    const generatedRef = payment_reference || `COMM-REMIT-${Date.now()}-${bookingId}`;
    await pool.execute(`
      INSERT INTO payments (
        booking_id, amount, dr_amount, cr_amount, payment_method, payment_reference,
        status, payment_type, transaction_type, notes, payment_date, created_at
      ) VALUES (?, ?, 0, ?, ?, ?, 'completed', 'booking', 'commission_remit_to_admin', ?, NOW(), NOW())
    `, [bookingId, remitAmount, remitAmount, payment_method || 'cash', generatedRef, notes || 'Commission remitted by owner']);

    // Mark admin_earnings as paid
    await pool.execute(`
      UPDATE admin_earnings
      SET payment_status = 'paid', payment_date = NOW(), payment_method = ?, payment_reference = ?, updated_at = NOW()
      WHERE id = ?
    `, [payment_method || 'cash', generatedRef, earnings.id]);

    res.status(200).json(
      formatResponse(true, 'Commission collected and marked as paid')
    );

  } catch (error) {
    console.error('Collect commission error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to collect commission', null, error.message)
    );
  }
});

// =============================================
// GET EARNINGS FOR A BOOKING (FOR VERIFICATION)
// =============================================
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [rows] = await pool.execute(`
      SELECT *
      FROM admin_earnings
      WHERE booking_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [bookingId]);

    if (rows.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Admin earnings not found for this booking')
      );
    }

    res.json(
      formatResponse(true, 'Admin earnings fetched', rows[0])
    );

  } catch (error) {
    console.error('Get earnings by booking error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to fetch admin earnings', null, error.message)
    );
  }
});
