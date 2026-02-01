const express = require('express');
const { pool } = require('../../config/database');
const {
  formatResponse,
  generatePagination
} = require('../../utils/helpers');
const {
  validateId,
  validatePagination
} = require('../../middleware/validation');

const router = express.Router();

// =============================================
// GET PROPERTY OWNER EARNINGS DASHBOARD
// =============================================
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(
        formatResponse(false, 'Authentication required')
      );
    }
    // Resolve property owner id from authenticated user
    let propertyOwnerId = req.user?.property_owner_id;
    if (!propertyOwnerId) {
      const [ownerRows] = await pool.execute(
        'SELECT id FROM property_owners WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
      if (ownerRows.length === 0) {
        return res.status(404).json(
          formatResponse(false, 'Property owner profile not found')
        );
      }
      propertyOwnerId = ownerRows[0].id;
    }
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Get current month earnings summary with withdrawable amount
    console.log('Property owner earnings dashboard: resolving summaries', {
      propertyOwnerId,
      currentYear,
      currentMonth
    });

    let currentMonthSummary;
    try {
      [currentMonthSummary] = await pool.execute(`
      SELECT
        COALESCE(COUNT(DISTINCT b.id), 0) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as total_booking_amount,
        COALESCE(SUM(b.admin_commission_amount), 0) as total_commission,
        COALESCE(SUM(b.property_owner_earnings), 0) as net_earnings,
        COALESCE(SUM(CASE WHEN b.payment_status = 'pending' THEN b.property_owner_earnings ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.property_owner_earnings ELSE 0 END), 0) as paid_amount,
        -- Withdrawable amount = Total - Commission (same as property_owner_earnings)
        -- EXCLUDE bookings already paid out through completed payouts
        COALESCE(SUM(
          CASE WHEN completed_payouts.booking_id IS NULL
          THEN b.property_owner_earnings ELSE 0 END
        ), 0) as withdrawable_amount,
        -- Available for payout (paid bookings not yet in payout requests)
        COALESCE(SUM(
          CASE WHEN b.payment_status = 'paid' AND b.status IN ('confirmed', 'checked_in', 'checked_out')
            AND b.id NOT IN (
              SELECT opi.booking_id 
              FROM owner_payout_items opi
              JOIN owner_payouts op ON opi.payout_id = op.id
              WHERE op.property_owner_id = ? AND op.payment_status IN ('pending', 'processing', 'completed')
            )
          THEN b.property_owner_earnings ELSE 0 END
        ), 0) as available_for_payout
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN (
        SELECT DISTINCT opi.booking_id
        FROM owner_payout_items opi
        JOIN owner_payouts op ON opi.payout_id = op.id
        WHERE op.property_owner_id = ? AND op.payment_status = 'completed'
      ) completed_payouts ON b.id = completed_payouts.booking_id
      WHERE p.owner_id = ? 
      AND YEAR(b.created_at) = ? 
      AND MONTH(b.created_at) = ?
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      `, [propertyOwnerId, propertyOwnerId, propertyOwnerId, currentYear, currentMonth]);
    } catch (error) {
      console.error('Property owner earnings dashboard currentMonthSummary error:', {
        message: error.message,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        code: error.code,
        params: [propertyOwnerId, propertyOwnerId, propertyOwnerId, currentYear, currentMonth]
      });
      throw error;
    }

    // Get lifetime earnings summary with withdrawable amount
    let lifetimeSummary;
    try {
      [lifetimeSummary] = await pool.execute(`
      SELECT
        COALESCE(COUNT(DISTINCT b.id), 0) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as total_booking_amount,
        COALESCE(SUM(b.admin_commission_amount), 0) as total_commission,
        COALESCE(SUM(b.property_owner_earnings), 0) as net_earnings,
        COALESCE(SUM(CASE WHEN b.payment_status = 'pending' THEN b.property_owner_earnings ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.property_owner_earnings ELSE 0 END), 0) as paid_amount,
        -- Withdrawable amount = Total - Commission (same as property_owner_earnings)
        -- EXCLUDE bookings already paid out through completed payouts
        COALESCE(SUM(
          CASE WHEN completed_payouts.booking_id IS NULL
          THEN b.property_owner_earnings ELSE 0 END
        ), 0) as withdrawable_amount,
        -- Available for payout (paid bookings not yet in payout requests)
        COALESCE(SUM(
          CASE WHEN b.payment_status = 'paid' AND b.status IN ('confirmed', 'checked_in', 'checked_out')
            AND b.id NOT IN (
              SELECT opi.booking_id 
              FROM owner_payout_items opi
              JOIN owner_payouts op ON opi.payout_id = op.id
              WHERE op.property_owner_id = ? AND op.payment_status IN ('pending', 'processing', 'completed')
            )
          THEN b.property_owner_earnings ELSE 0 END
        ), 0) as available_for_payout
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN (
        SELECT DISTINCT opi.booking_id
        FROM owner_payout_items opi
        JOIN owner_payouts op ON opi.payout_id = op.id
        WHERE op.property_owner_id = ? AND op.payment_status = 'completed'
      ) completed_payouts ON b.id = completed_payouts.booking_id
      WHERE p.owner_id = ? 
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      `, [propertyOwnerId, propertyOwnerId, propertyOwnerId]);
    } catch (error) {
      console.error('Property owner earnings dashboard lifetimeSummary error:', {
        message: error.message,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        code: error.code,
        params: [propertyOwnerId, propertyOwnerId, propertyOwnerId]
      });
      throw error;
    }

    // Get monthly earnings for the last 12 months
    let monthlyEarnings;
    try {
      [monthlyEarnings] = await pool.execute(`
      SELECT
        YEAR(b.created_at) as year,
        MONTH(b.created_at) as month,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.total_amount) as total_booking_amount,
        SUM(b.admin_commission_amount) as total_commission,
        SUM(b.property_owner_earnings) as net_earnings
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
      AND b.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      GROUP BY YEAR(b.created_at), MONTH(b.created_at)
      ORDER BY year DESC, month DESC
      `, [propertyOwnerId]);
    } catch (error) {
      console.error('Property owner earnings dashboard monthlyEarnings error:', {
        message: error.message,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        code: error.code,
        params: [propertyOwnerId]
      });
      throw error;
    }

    // Get recent earnings
    let recentEarnings;
    try {
      [recentEarnings] = await pool.execute(`
      SELECT
        b.id,
        b.booking_reference,
        b.total_amount as booking_total,
        b.admin_commission_amount as commission_amount,
        b.property_owner_earnings as net_earnings,
        b.payment_status as status,
        b.created_at,
        p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      ORDER BY b.created_at DESC
      LIMIT 10
      `, [propertyOwnerId]);
    } catch (error) {
      console.error('Property owner earnings dashboard recentEarnings error:', {
        message: error.message,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        code: error.code,
        params: [propertyOwnerId]
      });
      throw error;
    }

    // Get commission rate from system settings
    let commissionSettings;
    try {
      [commissionSettings] = await pool.execute(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'admin_commission_rate'
      `);
    } catch (error) {
      console.error('Property owner earnings dashboard commissionSettings error:', {
        message: error.message,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        code: error.code
      });
      throw error;
    }

    const commissionRate = commissionSettings.length > 0 ?
      parseFloat(commissionSettings[0].setting_value) : 10.00;

    // Fetch payout stats to adjust withdrawable and available amounts
    const [[lifetimePayoutStats]] = await pool.execute(`
      SELECT
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_earnings ELSE 0 END), 0) as pending_payouts,
        COALESCE(SUM(CASE WHEN payment_status = 'processing' THEN total_earnings ELSE 0 END), 0) as processing_payouts,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN total_earnings ELSE 0 END), 0) as completed_payouts
      FROM owner_payouts
      WHERE property_owner_id = ?
    `, [propertyOwnerId]);

    const [[currentMonthPayoutStats]] = await pool.execute(`
      SELECT
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_earnings ELSE 0 END), 0) as pending_payouts,
        COALESCE(SUM(CASE WHEN payment_status = 'processing' THEN total_earnings ELSE 0 END), 0) as processing_payouts,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN total_earnings ELSE 0 END), 0) as completed_payouts
      FROM owner_payouts
      WHERE property_owner_id = ?
        AND YEAR(created_at) = ?
        AND MONTH(created_at) = ?
    `, [propertyOwnerId, currentYear, currentMonth]);

    const adjustSummaryWithPayouts = (summary, stats) => {
      if (!summary) return summary;
      const pendingTotal = parseFloat(stats?.pending_payouts || 0) + parseFloat(stats?.processing_payouts || 0);
      const completedTotal = parseFloat(stats?.completed_payouts || 0);
      const adjusted = { ...summary };
      const originalAvailable = parseFloat(summary.available_for_payout || 0);
      const originalWithdrawable = parseFloat(summary.withdrawable_amount || 0);

      adjusted.pending_payouts = pendingTotal;
      adjusted.completed_payouts = completedTotal;
      adjusted.withdrawable_amount = Math.max(originalWithdrawable - (pendingTotal + completedTotal), 0);
      adjusted.available_for_payout = Math.max(originalAvailable - (pendingTotal + completedTotal), 0);

      return adjusted;
    };

    const adjustedCurrentMonthSummary = adjustSummaryWithPayouts(currentMonthSummary[0], currentMonthPayoutStats);
    const adjustedLifetimeSummary = adjustSummaryWithPayouts(lifetimeSummary[0], lifetimePayoutStats);

    res.json(
      formatResponse(true, 'Property owner earnings dashboard retrieved successfully', {
        currentMonth: adjustedCurrentMonthSummary,
        lifetime: adjustedLifetimeSummary,
        monthlyEarnings,
        recentEarnings,
        settings: {
          commission_rate: commissionRate
        }
      })
    );

  } catch (error) {
    console.error('Property owner earnings dashboard error:', {
      message: error.message,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property owner earnings dashboard', null, error.message)
    );
  }
});

// =============================================
// GET PROPERTY OWNER EARNINGS HISTORY
// =============================================
router.get('/earnings', validatePagination, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(
        formatResponse(false, 'Authentication required')
      );
    }
    // Resolve property owner id from authenticated user
    let propertyOwnerId = req.user?.property_owner_id;
    if (!propertyOwnerId) {
      const [ownerRows] = await pool.execute(
        'SELECT id FROM property_owners WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
      if (ownerRows.length === 0) {
        return res.status(404).json(
          formatResponse(false, 'Property owner profile not found')
        );
      }
      propertyOwnerId = ownerRows[0].id;
    }
    const { page = 1, limit = 10, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['p.owner_id = ?'];
    let queryParams = [propertyOwnerId];

    if (status) {
      whereConditions.push('b.payment_status = ?');
      queryParams.push(status);
    }

    if (start_date) {
      whereConditions.push('b.created_at >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push('b.created_at <= ?');
      queryParams.push(end_date);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
    `, queryParams);

    const total = countResult[0].total;

    // Get earnings
    const [earnings] = await pool.query(`
      SELECT
        b.id,
        b.booking_reference,
        b.total_amount as booking_total,
        b.admin_commission_amount as commission_amount,
        b.property_owner_earnings as net_earnings,
        b.payment_status as status,
        b.created_at,
        p.title as property_title,
        p.city as property_city
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Property owner earnings history retrieved successfully', {
        earnings,
        pagination
      })
    );

  } catch (error) {
    console.error('Property owner earnings history error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property owner earnings history', null, error.message)
    );
  }
});

// =============================================
// GET PROPERTY OWNER EARNINGS ANALYTICS
// =============================================
router.get('/analytics', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(
        formatResponse(false, 'Authentication required')
      );
    }
    // Resolve property owner id from authenticated user
    let propertyOwnerId = req.user?.property_owner_id;
    if (!propertyOwnerId) {
      const [ownerRows] = await pool.execute(
        'SELECT id FROM property_owners WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
      if (ownerRows.length === 0) {
        return res.status(404).json(
          formatResponse(false, 'Property owner profile not found')
        );
      }
      propertyOwnerId = ownerRows[0].id;
    }
    const { period = 12 } = req.query;

    // Get earnings trend
    const [earningsTrend] = await pool.execute(`
      SELECT
        DATE_FORMAT(b.created_at, '%Y-%m') as month,
        SUM(b.property_owner_earnings) as earnings,
        SUM(b.admin_commission_amount) as commission,
        COUNT(DISTINCT b.id) as bookings
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
      AND b.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
      ORDER BY month DESC
    `, [propertyOwnerId, parseInt(period)]);

    // Get top performing properties
    const [topProperties] = await pool.execute(`
      SELECT
        p.id,
        p.title,
        p.city,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.property_owner_earnings) as total_earnings,
        AVG(b.property_owner_earnings) as avg_earnings_per_booking
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
      AND b.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      GROUP BY p.id, p.title, p.city
      ORDER BY total_earnings DESC
      LIMIT 5
    `, [propertyOwnerId, parseInt(period)]);

    // Get payment method breakdown (using payments table)
    const [paymentBreakdown] = await pool.execute(`
      SELECT
        CASE 
          WHEN pay.payment_method = 'cash_on_arrival' THEN 'cash_on_arrival'
          WHEN pay.payment_method = 'online_payment' THEN 'online_payment'
          ELSE 'bank_transfer'
        END as payment_method,
        SUM(b.property_owner_earnings) as total_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN payments pay ON b.id = pay.booking_id AND pay.transaction_type = 'payment_received'
      WHERE p.owner_id = ? 
      AND b.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      GROUP BY payment_method
    `, [propertyOwnerId, parseInt(period)]);

    // Format payment breakdown
    const formattedPaymentBreakdown = {
      cash_on_arrival: 0,
      online_payment: 0,
      bank_transfer: 0
    };

    paymentBreakdown.forEach(item => {
      formattedPaymentBreakdown[item.payment_method] = parseFloat(item.total_amount) || 0;
    });

    res.json(
      formatResponse(true, 'Property owner earnings analytics retrieved successfully', {
        earningsTrend,
        topProperties,
        paymentBreakdown: formattedPaymentBreakdown
      })
    );

  } catch (error) {
    console.error('Property owner earnings analytics error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property owner earnings analytics', null, error.message)
    );
  }
});

// =============================================
// CREATE PAYOUT REQUEST
// =============================================
router.post('/payout-request', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(
        formatResponse(false, 'Authentication required')
      );
    }
    // Resolve property owner id from authenticated user
    let propertyOwnerId = req.user?.property_owner_id;
    if (!propertyOwnerId) {
      const [ownerRows] = await pool.execute(
        'SELECT id FROM property_owners WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
      if (ownerRows.length === 0) {
        return res.status(404).json(
          formatResponse(false, 'Property owner profile not found')
        );
      }
      propertyOwnerId = ownerRows[0].id;
    }
    const { amount, payment_method = 'bank_transfer', notes } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json(
        formatResponse(false, 'Invalid payout amount')
      );
    }

    // Check available balance (for confirmed, checked_in, or checked_out bookings with paid status)
    const [availableBalance] = await pool.execute(`
      SELECT COALESCE(SUM(b.property_owner_earnings), 0) as available_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ? 
      AND b.payment_status = 'paid' 
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      AND b.status != 'cancelled'
      AND b.id NOT IN (
        SELECT opi.booking_id 
        FROM owner_payout_items opi
        JOIN owner_payouts op ON opi.payout_id = op.id
        WHERE op.property_owner_id = ?
          AND op.payment_status IN ('pending', 'processing', 'completed')
      )
    `, [propertyOwnerId, propertyOwnerId]);

    const availableAmount = parseFloat(availableBalance[0].available_amount);

    if (amount > availableAmount) {
      return res.status(400).json(
        formatResponse(false, `Insufficient balance. Available: ${availableAmount}`)
      );
    }

    // Create owner payout record (pending) for admin to process
    const payoutReference = `OWNER-PAYOUT-REQ-${Date.now()}-${propertyOwnerId}`;

    console.log('=== CREATE PAYOUT REQUEST ===');
    console.log('Property Owner ID:', propertyOwnerId);
    console.log('Amount:', amount);
    console.log('Payment Method:', payment_method);
    console.log('Payout Reference:', payoutReference);

    const [result] = await pool.execute(`
      INSERT INTO owner_payouts (
        property_owner_id, payout_reference, start_date, end_date,
        total_earnings, total_commission_paid, net_payout,
        payment_method, notes
      ) VALUES (?, ?, CURDATE(), CURDATE(), ?, 0, ?, ?, ?)
    `, [
      propertyOwnerId, payoutReference, amount, amount, payment_method, notes || null
    ]);

    const payoutId = result.insertId;
    console.log('Payout created with ID:', payoutId);
    console.log('===========================');

    res.status(201).json(
      formatResponse(true, 'Payout request submitted successfully', {
        payout_id: payoutId,
        payout_reference: payoutReference,
        amount,
        payment_method,
        payment_status: 'pending',
        status: 'pending'
      })
    );

  } catch (error) {
    console.error('Create payout request error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create payout request', null, error.message)
    );
  }
});

// =============================================
// GET PAYOUT REQUESTS
// =============================================
router.get('/payouts', validatePagination, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json(
        formatResponse(false, 'Authentication required')
      );
    }
    // Resolve property owner id from authenticated user
    let propertyOwnerId = req.user?.property_owner_id;
    if (!propertyOwnerId) {
      const [ownerRows] = await pool.execute(
        'SELECT id FROM property_owners WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
      if (ownerRows.length === 0) {
        return res.status(404).json(
          formatResponse(false, 'Property owner profile not found')
        );
      }
      propertyOwnerId = ownerRows[0].id;
    }

    console.log('=== GET OWNER PAYOUTS ===');
    console.log('User ID:', req.user.id);
    console.log('Property Owner ID:', propertyOwnerId);
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['op.property_owner_id = ?'];
    let queryParams = [propertyOwnerId];

    if (status) {
      whereConditions.push('op.payment_status = ?');
      queryParams.push(status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM owner_payouts op
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get payouts
    const [payouts] = await pool.query(`
      SELECT
        op.id,
        op.payout_reference,
        op.net_payout as amount,
        op.total_earnings,
        op.payment_method,
        op.notes,
        op.payment_status as status,
        op.created_at as requested_at,
        op.payment_date as processed_at,
        op.notes as admin_notes,
        COUNT(opi.id) as items_count
      FROM owner_payouts op
      LEFT JOIN owner_payout_items opi ON op.id = opi.payout_id
      ${whereClause}
      GROUP BY op.id
      ORDER BY op.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    console.log('Total payouts found:', total);
    console.log('Payouts:', payouts);
    console.log('===========================');

    res.json(
      formatResponse(true, 'Payout requests retrieved successfully', {
        payouts,
        pagination
      })
    );

  } catch (error) {
    console.error('Get payout requests error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve payout requests', null, error.message)
    );
  }
});

module.exports = router;
