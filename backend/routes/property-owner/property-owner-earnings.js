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
const { requireHMSPermission } = require('../../middleware/auth');

const router = express.Router();
router.use(requireHMSPermission('view_analytics'));

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
        COALESCE(SUM(b.security_deposit_claim_amount), 0) as total_requested_claims,
        COALESCE(SUM(b.security_deposit_deduction_amount), 0) as total_received_claims,
        COALESCE(SUM(CASE WHEN b.payment_status = 'pending' THEN b.property_owner_earnings ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.property_owner_earnings ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(
          (SELECT SUM(p_fee.gateway_fee) FROM payments p_fee
           WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed')
        ), 0) as total_gateway_fees,
        -- Withdrawable amount = Total - Commission (same as property_owner_earnings)
        -- EXCLUDE bookings already paid out through completed payouts
        -- ONLY INCLUDE bookings where Keyhost collected the payment
        COALESCE(SUM(
          CASE WHEN completed_payouts.booking_id IS NULL
            AND (b.booking_source = 'website' OR b.source = 'Internal' OR b.payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer'))
          THEN b.property_owner_earnings ELSE 0 END
        ), 0) as withdrawable_amount,
        -- Available for payout: platform-collected amount (excludes cash the host collected directly)
        COALESCE(SUM(
          CASE WHEN (b.payment_status IN ('paid', 'partial') OR EXISTS (SELECT 1 FROM payments WHERE booking_id = b.id AND status = 'completed'))
            AND b.status IN ('confirmed', 'checked_in', 'checked_out')
            AND (
              b.booking_source = 'website' 
              OR b.source = 'Internal' 
              OR b.payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer')
              OR EXISTS (
                SELECT 1 FROM payments 
                WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer')
              )
            )
            AND b.id NOT IN (
              SELECT opi.booking_id 
              FROM owner_payout_items opi
              JOIN owner_payouts op ON opi.payout_id = op.id
              WHERE op.property_owner_id = ? AND op.payment_status IN ('pending', 'processing', 'completed')
            )
          THEN GREATEST(0,
            b.property_owner_earnings 
            - COALESCE((
              SELECT SUM(p2.cr_amount) FROM payments p2
              WHERE p2.booking_id = b.id AND p2.status = 'completed'
                AND p2.payment_method = 'cash'
                AND p2.transaction_type IN ('guest_payment','payment','settlement')
            ), 0)
            - COALESCE((
              SELECT SUM(p3.gateway_fee) FROM payments p3
              WHERE p3.booking_id = b.id AND p3.status = 'completed'
            ), 0)
          ) ELSE 0 END
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
        COALESCE(SUM(b.security_deposit_claim_amount), 0) as total_requested_claims,
        COALESCE(SUM(b.security_deposit_deduction_amount), 0) as total_received_claims,
        COALESCE(SUM(CASE WHEN b.payment_status = 'pending' THEN b.property_owner_earnings ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.property_owner_earnings ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(
          (SELECT SUM(p_fee.gateway_fee) FROM payments p_fee
           WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed')
        ), 0) as total_gateway_fees,
        -- Withdrawable amount = Total - Commission (same as property_owner_earnings)
        -- EXCLUDE bookings already paid out through completed payouts
        -- ONLY INCLUDE bookings where Keyhost collected the payment
        COALESCE(SUM(
          CASE WHEN completed_payouts.booking_id IS NULL
            AND (b.booking_source = 'website' OR b.source = 'Internal' OR b.payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer'))
          THEN b.property_owner_earnings ELSE 0 END
        ), 0) as withdrawable_amount,
        -- Available for payout: platform-collected amount (excludes cash the host collected directly)
        COALESCE(SUM(
          CASE WHEN (b.payment_status IN ('paid', 'partial') OR EXISTS (SELECT 1 FROM payments WHERE booking_id = b.id AND status = 'completed'))
            AND b.status IN ('confirmed', 'checked_in', 'checked_out')
            AND (
              b.booking_source = 'website' 
              OR b.source = 'Internal' 
              OR b.payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer')
              OR EXISTS (
                SELECT 1 FROM payments 
                WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer')
              )
            )
            AND b.id NOT IN (
              SELECT opi.booking_id 
              FROM owner_payout_items opi
              JOIN owner_payouts op ON opi.payout_id = op.id
              WHERE op.property_owner_id = ? AND op.payment_status IN ('pending', 'processing', 'completed')
            )
          THEN GREATEST(0,
            (CASE 
              WHEN b.booking_source = 'website' THEN b.property_owner_earnings
              ELSE COALESCE((
                SELECT SUM(cr_amount) FROM payments 
                WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online')
              ), 0) - COALESCE(b.admin_commission_amount, 0)
            END)
            - COALESCE((
              SELECT SUM(p2.cr_amount) FROM payments p2
              WHERE p2.booking_id = b.id AND p2.status = 'completed'
                AND p2.payment_method = 'cash'
                AND p2.transaction_type IN ('guest_payment','payment','settlement')
            ), 0)
            - COALESCE((
              SELECT SUM(p3.gateway_fee) FROM payments p3
              WHERE p3.booking_id = b.id AND p3.status = 'completed'
            ), 0)
          ) ELSE 0 END
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
        b.security_deposit_claim_amount,
        b.security_deposit_deduction_amount,
        b.payment_status as status,
        b.payment_method,
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
        COALESCE(SUM(CASE WHEN payment_status IN ('pending', 'processing') THEN net_payout ELSE 0 END), 0) as pending_payouts,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN net_payout ELSE 0 END), 0) as completed_payouts
      FROM owner_payouts
      WHERE property_owner_id = ?
    `, [propertyOwnerId]);

    const [[currentMonthPayoutStats]] = await pool.execute(`
      SELECT
        COALESCE(SUM(CASE WHEN payment_status IN ('pending', 'processing') THEN net_payout ELSE 0 END), 0) as pending_payouts,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN net_payout ELSE 0 END), 0) as completed_payouts
      FROM owner_payouts
      WHERE property_owner_id = ?
        AND YEAR(created_at) = ?
        AND MONTH(created_at) = ?
    `, [propertyOwnerId, currentYear, currentMonth]);

    // Live platform-owed earnings: online earnings minus any cash already collected by host at property
    const [[liveOnlineEarningsRes]] = await pool.execute(`
      SELECT 
        COALESCE(SUM(
          b.property_owner_earnings
          - COALESCE((
              SELECT SUM(p.cr_amount) FROM payments p
              WHERE p.booking_id = b.id AND p.status = 'completed'
                AND p.payment_method = 'cash'
                AND p.transaction_type IN ('guest_payment','payment','settlement')
            ), 0)
        ), 0) as online_earnings,
        COALESCE(SUM(
          (SELECT SUM(p2.gateway_fee) FROM payments p2
           WHERE p2.booking_id = b.id AND p2.status = 'completed')
        ), 0) as total_gateway_fees
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
        AND b.payment_status = 'paid'
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND (
          b.payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer', 'cash')
          OR b.booking_source = 'website'
          OR b.source = 'Internal'
          OR EXISTS (
            SELECT 1 FROM payments p2
            WHERE p2.booking_id = b.id AND p2.status = 'completed'
          )
        )
    `, [propertyOwnerId]);

    const totalOnlineEarnings = Math.max(0, 
      parseFloat(liveOnlineEarningsRes?.online_earnings || 0) - parseFloat(liveOnlineEarningsRes?.total_gateway_fees || 0)
    );

    const adjustSummaryWithPayouts = (summary, stats) => {
      if (!summary) return summary;
      const pendingTotal = parseFloat(stats?.pending_payouts || 0);
      const completedTotal = parseFloat(stats?.completed_payouts || 0);
      const adjusted = { ...summary };

      // Real live available for payout = total platform-owed earnings minus already paid/pending payouts
      const realAvailable = Math.max(0, totalOnlineEarnings - completedTotal - pendingTotal);

      adjusted.pending_payouts = pendingTotal;
      adjusted.completed_payouts = completedTotal;
      adjusted.withdrawable_amount = realAvailable;
      adjusted.available_for_payout = realAvailable;

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
        b.security_deposit_claim_amount,
        b.security_deposit_deduction_amount,
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

    // Get booking and payment data for proportional method allocation of host earnings
    const [paymentRows] = await pool.execute(`
      SELECT 
        b.id as booking_id,
        b.total_amount,
        b.admin_commission_amount,
        b.property_owner_earnings,
        b.payment_method as booking_payment_method,
        p.payment_method as payment_method,
        p.cr_amount,
        p.gateway_fee as gateway_fee
      FROM bookings b
      JOIN properties prop ON b.property_id = prop.id
      LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'completed' AND p.payment_method IS NOT NULL AND p.cr_amount > 0
      WHERE prop.owner_id = ?
        AND b.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.status != 'cancelled'
    `, [propertyOwnerId, parseInt(period)]);

    const bookingsMap = {};
    paymentRows.forEach(row => {
      if (!bookingsMap[row.booking_id]) {
        bookingsMap[row.booking_id] = {
          total_amount: parseFloat(row.total_amount) || 0,
          commission: parseFloat(row.admin_commission_amount) || 0,
          fallbackMethod: row.booking_payment_method || 'Unknown',
          payments: []
        };
      }
      if (row.payment_method && parseFloat(row.cr_amount) > 0) {
        bookingsMap[row.booking_id].payments.push({
          method: row.payment_method,
          amount: parseFloat(row.cr_amount),
          gateway_fee: parseFloat(row.gateway_fee || 0)
        });
      }
    });

    const formattedPaymentBreakdown = {
      cash: 0,
      sslcommerz: 0,
      bkash: 0,
      nagad: 0
    };

    const formattedCommissionBreakdown = {
      cash: 0,
      sslcommerz: 0,
      bkash: 0,
      nagad: 0
    };

    const formattedGatewayFeeBreakdown = {
      cash: 0,
      sslcommerz: 0,
      bkash: 0,
      nagad: 0
    };

    Object.values(bookingsMap).forEach(b => {
      const totalPayments = b.payments.reduce((sum, p) => sum + p.amount, 0);
      
      const onlinePayments = b.payments.filter(p => 
        ['sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer'].includes(p.method.toLowerCase())
      );
      const totalOnlinePayments = onlinePayments.reduce((sum, p) => sum + p.amount, 0);

      if (totalPayments > 0) {
        // Allocate gross payments (without commission deduction)
        b.payments.forEach(p => {
          const method = p.method.toLowerCase();
          if (formattedPaymentBreakdown[method] !== undefined) {
            formattedPaymentBreakdown[method] += p.amount;
          } else {
            formattedPaymentBreakdown[method] = p.amount;
          }

          // Allocate gateway fee
          if (p.gateway_fee > 0) {
            if (formattedGatewayFeeBreakdown[method] !== undefined) {
              formattedGatewayFeeBreakdown[method] += p.gateway_fee;
            } else {
              formattedGatewayFeeBreakdown[method] = p.gateway_fee;
            }
          }
        });

        // Allocate commission
        if (b.commission > 0) {
          if (totalOnlinePayments > 0) {
            onlinePayments.forEach(p => {
              const share = b.commission * (p.amount / totalOnlinePayments);
              const method = p.method.toLowerCase();
              if (formattedCommissionBreakdown[method] !== undefined) {
                formattedCommissionBreakdown[method] += share;
              } else {
                formattedCommissionBreakdown[method] = share;
              }
            });
          } else {
            const method = b.fallbackMethod.toLowerCase();
            if (formattedCommissionBreakdown[method] !== undefined) {
              formattedCommissionBreakdown[method] += b.commission;
            } else {
              formattedCommissionBreakdown[method] = b.commission;
            }
          }
        }
      } else {
        // Fallback to booking fields if no payments recorded
        const method = b.fallbackMethod.toLowerCase();
        if (formattedPaymentBreakdown[method] !== undefined) {
          formattedPaymentBreakdown[method] += b.total_amount;
        } else {
          formattedPaymentBreakdown[method] = b.total_amount;
        }

        if (b.commission > 0) {
          if (formattedCommissionBreakdown[method] !== undefined) {
            formattedCommissionBreakdown[method] += b.commission;
          } else {
            formattedCommissionBreakdown[method] = b.commission;
          }
        }
      }
    });

    res.json(
      formatResponse(true, 'Property owner earnings analytics retrieved successfully', {
        earningsTrend,
        topProperties,
        paymentBreakdown: formattedPaymentBreakdown,
        commissionBreakdown: formattedCommissionBreakdown,
        gatewayFeeBreakdown: formattedGatewayFeeBreakdown
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
  const connection = await pool.getConnection();
  try {
    if (!req.user?.id) {
      return res.status(401).json(formatResponse(false, 'Authentication required'));
    }

    // Resolve property owner id
    let propertyOwnerId = req.user?.property_owner_id;
    if (!propertyOwnerId) {
      const [ownerRows] = await connection.execute(
        'SELECT id FROM property_owners WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
      if (ownerRows.length === 0) {
        return res.status(404).json(formatResponse(false, 'Property owner profile not found'));
      }
      propertyOwnerId = ownerRows[0].id;
    }

    const { payment_method = 'bank_transfer', notes } = req.body;

    // Block duplicate pending/processing requests
    const [existingPending] = await connection.execute(`
      SELECT id, payout_reference FROM owner_payouts
      WHERE property_owner_id = ? AND payment_status IN ('pending', 'processing')
      LIMIT 1
    `, [propertyOwnerId]);

    if (existingPending.length > 0) {
      return res.status(400).json(formatResponse(
        false,
        `You already have an active payout request (${existingPending[0].payout_reference}). Please wait for it to be processed before requesting another.`
      ));
    }

    // Fetch all eligible bookings not already claimed by a completed/pending payout
    const [eligibleBookings] = await connection.execute(`
      SELECT
        b.id AS booking_id,
        b.booking_reference,
        b.total_amount,
        GREATEST(0,
          (CASE 
            WHEN b.booking_source = 'website' THEN b.property_owner_earnings
            ELSE COALESCE((
              SELECT SUM(cr_amount) FROM payments 
              WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online')
            ), 0) - COALESCE(b.admin_commission_amount, 0)
          END)
          - COALESCE((
            SELECT SUM(p2.cr_amount) FROM payments p2
            WHERE p2.booking_id = b.id AND p2.status = 'completed'
              AND p2.payment_method = 'cash'
              AND p2.transaction_type IN ('guest_payment','payment','settlement')
          ), 0)
          - COALESCE((
            SELECT SUM(p3.gateway_fee) FROM payments p3
            WHERE p3.booking_id = b.id AND p3.status = 'completed'
          ), 0)
        ) AS property_owner_earnings,
        COALESCE(ae.commission_amount, 0) AS commission_amount,
        CASE WHEN ae.payment_status = 'paid' THEN 1 ELSE 0 END AS commission_paid
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
      WHERE p.owner_id = ?
        AND b.payment_status = 'paid'
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.status != 'cancelled'
        AND (
          b.booking_source = 'website' 
          OR b.source = 'Internal' 
          OR b.payment_method = 'sslcommerz'
          OR EXISTS (
            SELECT 1 FROM payments 
            WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online')
          )
        )
        AND GREATEST(0,
          (CASE 
            WHEN b.booking_source = 'website' THEN b.property_owner_earnings
            ELSE COALESCE((
              SELECT SUM(cr_amount) FROM payments 
              WHERE booking_id = b.id AND status = 'completed' AND payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online')
            ), 0) - COALESCE(b.admin_commission_amount, 0)
          END)
          - COALESCE((
            SELECT SUM(p2.cr_amount) FROM payments p2
            WHERE p2.booking_id = b.id AND p2.status = 'completed'
              AND p2.payment_method = 'cash'
              AND p2.transaction_type IN ('guest_payment','payment','settlement')
          ), 0)
          - COALESCE((
            SELECT SUM(p3.gateway_fee) FROM payments p3
            WHERE p3.booking_id = b.id AND p3.status = 'completed'
          ), 0)
        ) > 0
        AND b.id NOT IN (
          SELECT opi.booking_id
          FROM owner_payout_items opi
          JOIN owner_payouts op ON opi.payout_id = op.id
          WHERE op.property_owner_id = ? AND op.payment_status IN ('pending', 'processing', 'completed')
        )
      ORDER BY b.created_at ASC
    `, [propertyOwnerId, propertyOwnerId]);

    if (eligibleBookings.length === 0) {
      return res.status(400).json(formatResponse(
        false,
        'No eligible bookings available for payout. All bookings may already be claimed or not yet settled.'
      ));
    }

    // Auto-calculate amount from actual bookings
    const totalEarnings = eligibleBookings.reduce((sum, b) => sum + parseFloat(b.property_owner_earnings), 0);
    const totalCommissionPaid = eligibleBookings.reduce((sum, b) =>
      sum + (b.commission_paid ? parseFloat(b.commission_amount) : 0), 0);
    const netPayout = totalEarnings;

    if (netPayout <= 0) {
      return res.status(400).json(formatResponse(
        false,
        'No positive payout amount available after deducting admin commission.'
      ));
    }

    await connection.beginTransaction();

    const payoutReference = `OWNER-PAYOUT-REQ-${Date.now()}-${propertyOwnerId}`;

    const [result] = await connection.execute(`
      INSERT INTO owner_payouts (
        property_owner_id, payout_reference, start_date, end_date,
        total_earnings, total_commission_paid, net_payout,
        payment_method, notes
      ) VALUES (?, ?, CURDATE(), CURDATE(), ?, ?, ?, ?, ?)
    `, [
      propertyOwnerId, payoutReference,
      totalEarnings, totalCommissionPaid, netPayout,
      payment_method, notes || null
    ]);

    const payoutId = result.insertId;

    // Link all eligible bookings as payout items immediately
    for (const booking of eligibleBookings) {
      await connection.execute(`
        INSERT INTO owner_payout_items (
          payout_id, booking_id, booking_total, admin_commission, owner_earnings, commission_paid_to_admin
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        payoutId, booking.booking_id, booking.total_amount,
        booking.commission_amount, booking.property_owner_earnings, booking.commission_paid
      ]);
    }

    await connection.commit();

    console.log(`Payout request created: ID=${payoutId}, ref=${payoutReference}, bookings=${eligibleBookings.length}, net=BDT${netPayout}`);

    res.status(201).json(
      formatResponse(true, 'Payout request submitted successfully', {
        payout_id: payoutId,
        payout_reference: payoutReference,
        items_count: eligibleBookings.length,
        total_earnings: totalEarnings,
        total_commission_paid: totalCommissionPaid,
        net_payout: netPayout,
        payment_method,
        payment_status: 'pending',
        status: 'pending'
      })
    );

  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error('Create payout request error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create payout request', null, error.message));
  } finally {
    connection.release();
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

// =============================================
// GET PROPERTY OWNER FINANCIAL REPORTS
// =============================================
router.get('/financial-reports', async (req, res) => {
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

    const { dateRange = 'this_month', startDate, endDate } = req.query;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Build date filter based on dateRange parameter
    let dateWhere = '';
    const dateParams = [propertyOwnerId];

    if (dateRange === 'this_month') {
      dateWhere = 'AND YEAR(b.created_at) = ? AND MONTH(b.created_at) = ?';
      dateParams.push(currentYear, currentMonth);
    } else if (dateRange === 'last_month') {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      dateWhere = 'AND YEAR(b.created_at) = ? AND MONTH(b.created_at) = ?';
      dateParams.push(lastMonthYear, lastMonth);
    } else if (dateRange === 'this_year') {
      dateWhere = 'AND YEAR(b.created_at) = ?';
      dateParams.push(currentYear);
    } else if (dateRange === 'last_year') {
      dateWhere = 'AND YEAR(b.created_at) = ?';
      dateParams.push(currentYear - 1);
    } else if (dateRange === 'custom') {
      if (startDate && endDate) {
        dateWhere = 'AND DATE(b.created_at) BETWEEN ? AND ?';
        dateParams.push(startDate, endDate);
      }
    }

    // Main financial summary for property owner
    const [summaryRows] = await pool.execute(`
      SELECT
        COALESCE(COUNT(DISTINCT b.id), 0) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as gross_revenue,
        COALESCE(SUM(b.admin_commission_amount), 0) as total_commission,
        COALESCE(SUM(b.property_owner_earnings), 0) as net_earnings
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.status != 'cancelled'
        ${dateWhere}
    `, dateParams);

    const summary = summaryRows[0] || {
      total_bookings: 0,
      gross_revenue: 0,
      total_commission: 0,
      net_earnings: 0
    };

    // Fetch detailed transactions for the property owner
    const [bookings] = await pool.execute(`
      SELECT
        b.booking_reference,
        p.title as property_title,
        b.total_amount as gross_revenue,
        b.admin_commission_amount as commission,
        b.property_owner_earnings as net_earnings,
        DATE_FORMAT(b.created_at, '%Y-%m-%d') as date
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.status != 'cancelled'
        ${dateWhere}
      ORDER BY b.created_at DESC
      LIMIT 150
    `, dateParams);

    // Payment method breakdown for Host
    const [paymentMethods] = await pool.execute(`
      SELECT
        COALESCE(b.payment_method, 'Unknown') as method,
        COUNT(DISTINCT b.id) as count,
        COALESCE(SUM(b.total_amount), 0) as total_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.owner_id = ?
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.status != 'cancelled'
        ${dateWhere}
      GROUP BY b.payment_method
      ORDER BY total_amount DESC
    `, dateParams);

    res.json(formatResponse(true, 'Financial reports retrieved successfully', {
      summary,
      bookings,
      paymentMethods,
      dateRange
    }));

  } catch (error) {
    console.error('Property owner financial reports error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve financial reports', null, error.message)
    );
  }
});

module.exports = router;
