const express = require('express');
const { pool } = require('../../config/database');
const {
  formatResponse,
  generatePagination,
  generateToken,
  generateRefreshToken
} = require('../../utils/helpers');
const {
  validateId,
  validatePagination
} = require('../../middleware/validation');
const { verifyToken, requireAdmin, requirePlatformPermission } = require('../../middleware/auth');
const { cache } = require('../../middleware/cache');
const { syncRefundToHMSAccounts } = require('../../utils/hms-sync');
const { syncHmsAccessForHost } = require('../../utils/hms-helper');
const { sendRefundSms } = require('../../utils/sms');
const whatsapp = require('../../utils/whatsapp');
const BkashPaymentGateway = require('../../utils/bkash-gateway');
const bkashGateway = new BkashPaymentGateway();
bkashGateway.initialize().catch(e => console.error('[Admin] bKash gateway init error:', e));

// Helper: instantly clear all property-types cache entries
const clearPropertyTypesCache = () => {
  try {
    const allKeys = cache.keys();
    allKeys.forEach(key => {
      if (key.includes('property-types') || key.includes('property_types')) {
        cache.del(key);
      }
    });
  } catch (e) { /* ignore */ }
};

// Helper: clear properties related cache
const clearPropertiesCache = () => {
  try {
    const allKeys = cache.keys();
    allKeys.forEach(key => {
      if (
        key.includes('properties') || 
        key.includes('recommended') || 
        key.includes('featured') ||
        key.includes('display-categories') ||
        key.includes('guest')
      ) {
        cache.del(key);
      }
    });
  } catch (e) { /* ignore */ }
};

const router = express.Router();

// Import earnings routes
const earningsRoutes = require('./admin-earnings');
const ownerPayoutRoutes = require('./admin-owner-payouts');

// Apply authentication and admin middleware to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Clear all cache
router.post('/clear-cache', (req, res) => {
  try {
    cache.flushAll();
    res.json(formatResponse(true, 'All cache cleared successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to clear cache', null, error.message));
  }
});

// Get all platform roles (system + custom) with user counts
router.get('/roles', requirePlatformPermission('roles.read'), async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT rdp.role, rdp.display_name, rdp.permissions, rdp.is_custom, COUNT(u.id) as user_count
      FROM role_default_permissions rdp
      LEFT JOIN users u ON u.user_type = rdp.role
      GROUP BY rdp.role, rdp.display_name, rdp.permissions, rdp.is_custom
    `);

    const roles = rows.map(row => {
      let perms = row.permissions;
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms); } catch (e) { perms = {}; }
      }
      return {
        role: row.role,
        display_name: row.display_name || row.role,
        permissions: perms,
        is_custom: !!row.is_custom,
        user_count: parseInt(row.user_count) || 0
      };
    });

    res.json(formatResponse(true, 'Roles retrieved successfully', { roles }));
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve roles', null, error.message));
  }
});

// Create a new custom role
router.post('/roles', requirePlatformPermission('roles.create_update'), async (req, res) => {
  try {
    const { role, display_name, permissions } = req.body;

    if (!role || !display_name) {
      return res.status(400).json(formatResponse(false, 'Role key and display name are required'));
    }

    // Sanitize and validate role key
    const roleKey = String(role).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    if (!roleKey) {
      return res.status(400).json(formatResponse(false, 'Invalid role key'));
    }

    // Check if role already exists
    const [check] = await pool.execute('SELECT role FROM role_default_permissions WHERE role = ?', [roleKey]);
    if (check.length > 0) {
      return res.status(400).json(formatResponse(false, `Role '${roleKey}' already exists`));
    }

    const permsStr = typeof permissions === 'string' ? permissions : JSON.stringify(permissions || {});

    await pool.execute(
      `INSERT INTO role_default_permissions (role, display_name, permissions, is_custom)
       VALUES (?, ?, ?, 1)`,
      [roleKey, display_name.trim(), permsStr]
    );

    res.json(formatResponse(true, 'Custom role created successfully', {
      role: roleKey,
      display_name: display_name.trim(),
      permissions: typeof permissions === 'string' ? JSON.parse(permissions) : (permissions || {}),
      is_custom: true,
      user_count: 0
    }));
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create role', null, error.message));
  }
});

// Update a role (permissions and/or display name)
router.put('/roles/:role', requirePlatformPermission('roles.create_update'), async (req, res) => {
  try {
    const { role } = req.params;
    const { display_name, permissions } = req.body;

    // Check if role exists
    const [check] = await pool.execute('SELECT role, is_custom, display_name FROM role_default_permissions WHERE role = ?', [role]);
    if (check.length === 0) {
      return res.status(404).json(formatResponse(false, 'Role not found'));
    }

    const roleInfo = check[0];
    const finalDisplayName = roleInfo.is_custom ? (display_name || roleInfo.display_name) : roleInfo.display_name;
    const permsStr = typeof permissions === 'string' ? permissions : JSON.stringify(permissions || {});

    await pool.execute(
      `UPDATE role_default_permissions 
       SET display_name = ?, permissions = ?
       WHERE role = ?`,
      [finalDisplayName, permsStr, role]
    );

    res.json(formatResponse(true, 'Role updated successfully'));
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update role', null, error.message));
  }
});

// Delete a custom role
router.delete('/roles/:role', requirePlatformPermission('roles.delete'), async (req, res) => {
  try {
    const { role } = req.params;

    // Check if role exists and is custom
    const [check] = await pool.query('SELECT role, is_custom FROM role_default_permissions WHERE role = ?', [role]);
    if (check.length === 0) {
      return res.status(404).json(formatResponse(false, 'Role not found'));
    }

    const roleInfo = check[0];
    if (!roleInfo.is_custom) {
      return res.status(400).json(formatResponse(false, 'Cannot delete system roles'));
    }

    // Check if any users are assigned to this role
    const [users] = await pool.execute('SELECT COUNT(id) as count FROM users WHERE user_type = ?', [role]);
    if (users[0].count > 0) {
      return res.status(400).json(formatResponse(false, `Cannot delete role. It is currently assigned to ${users[0].count} users.`));
    }

    await pool.execute('DELETE FROM role_default_permissions WHERE role = ?', [role]);

    res.json(formatResponse(true, 'Custom role deleted successfully'));
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete role', null, error.message));
  }
});

// Get WhatsApp connection status
router.get('/whatsapp/status', (req, res) => {
  try {
    const statusData = whatsapp.getStatus();
    res.json(formatResponse(true, 'WhatsApp status retrieved successfully', statusData));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to get WhatsApp status', null, error.message));
  }
});

// Connect WhatsApp (generates QR code)
router.post('/whatsapp/connect', async (req, res) => {
  try {
    const result = await whatsapp.connectWhatsApp();
    res.json(formatResponse(true, 'WhatsApp connection initiated', result));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to initiate WhatsApp connection', null, error.message));
  }
});

// Disconnect WhatsApp (logs out and clears files)
router.post('/whatsapp/disconnect', async (req, res) => {
  try {
    const result = await whatsapp.disconnectWhatsApp();
    res.json(formatResponse(true, 'WhatsApp disconnected successfully', result));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to disconnect WhatsApp', null, error.message));
  }
});

// Get admin dashboard statistics with optional date filtering
router.get('/dashboard', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let bookingsWhere = 'status != "cancelled"';
    let bookingsParams = [];

    let earningsWhere = 'b.status != "cancelled" AND b.payment_status = "paid"';

    let earningsParams = [];

    let payoutsWhere = '1=1';
    let payoutsParams = [];

    if (start_date && end_date) {
      bookingsWhere += ' AND created_at >= ? AND created_at <= ?';
      bookingsParams.push(start_date + ' 00:00:00', end_date + ' 23:59:59');

      earningsWhere += ' AND b.created_at >= ? AND b.created_at <= ?';
      earningsParams.push(start_date + ' 00:00:00', end_date + ' 23:59:59');

      payoutsWhere += ' AND op.created_at >= ? AND op.created_at <= ?';
      payoutsParams.push(start_date + ' 00:00:00', end_date + ' 23:59:59');
    }

    // Queries
    // 1. Total Revenue
    const [revenueRes] = await pool.execute(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM bookings 
      WHERE ${bookingsWhere} AND payment_status = 'paid'
    `, bookingsParams);

    // 2. Admin Commission
    const [commissionRes] = await pool.execute(`
      SELECT COALESCE(SUM(admin_commission_amount), 0) as total 
      FROM bookings 
      WHERE ${bookingsWhere} AND payment_status = 'paid'
    `, bookingsParams);

    // 3. Host Outstanding — platform-owed amount only (subtract cash already collected by hosts and gateway fees)
    const [hostShareRes] = await pool.execute(`
      SELECT COALESCE(SUM(
        b.property_owner_earnings
        - COALESCE((
            SELECT SUM(p.cr_amount) FROM payments p
            WHERE p.booking_id = b.id AND p.status = 'completed'
              AND p.payment_method = 'cash'
              AND p.transaction_type IN ('guest_payment','payment','settlement')
          ), 0)
        - COALESCE((
            SELECT SUM(p_fee.gateway_fee) FROM payments p_fee
            WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed'
          ), 0)
      ), 0) as total_earnings
      FROM bookings b
      WHERE ${earningsWhere}
    `, earningsParams);

    let paymentsWhere = "status = 'completed'";
    let paymentsParams = [];
    if (start_date && end_date) {
      paymentsWhere += " AND payment_date >= ? AND payment_date <= ?";
      paymentsParams.push(start_date + ' 00:00:00', end_date + ' 23:59:59');
    }

    const [gatewayFeesRes] = await pool.execute(`
      SELECT COALESCE(SUM(gateway_fee), 0) as total 
      FROM payments 
      WHERE ${paymentsWhere}
    `, paymentsParams);

    let ordersWhere = "package_id IS NOT NULL AND (status = 'Success' OR status = 'COMPLETED')";
    let ordersParams = [];
    if (start_date && end_date) {
      ordersWhere += " AND created_at >= ? AND created_at <= ?";
      ordersParams.push(start_date + ' 00:00:00', end_date + ' 23:59:59');
    }
    const [subGatewayFeesRes] = await pool.execute(`
      SELECT COALESCE(SUM(gateway_fee), 0) as total
      FROM orders
      WHERE ${ordersWhere}
    `, ordersParams);
    
    const totalGatewayFees = parseFloat(gatewayFeesRes[0].total || 0) + parseFloat(subGatewayFeesRes[0].total || 0);

    const [payoutsRes] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN op.payment_status = 'completed' THEN op.net_payout ELSE 0 END), 0) as completed_payouts,
        COALESCE(SUM(CASE WHEN op.payment_status IN ('pending', 'processing') THEN op.net_payout ELSE 0 END), 0) as pending_payouts
      FROM owner_payouts op
      WHERE ${payoutsWhere}
    `, payoutsParams);

    const totalHostShare = parseFloat(hostShareRes[0]?.total_earnings || 0);
    const totalPaid = parseFloat(payoutsRes[0]?.completed_payouts || 0);
    const totalPending = parseFloat(payoutsRes[0]?.pending_payouts || 0);
    const hostOutstanding = Math.max(totalHostShare - totalPaid - totalPending, 0);


    // 4. Total Bookings
    const [bookingsCountRes] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM bookings 
      WHERE ${bookingsWhere}
    `, bookingsParams);

    // 5. Total Users & Active Properties (Keep as general platform outline stats)
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
    const [propertyCount] = await pool.execute('SELECT COUNT(*) as total FROM properties WHERE status = "active"');

    // Get recent bookings (filtered if date range is present)
    let recentBookingsQuery = `
      SELECT 
        b.id, b.booking_reference, b.total_amount, b.status, b.created_at,
        u.first_name, u.last_name,
        p.title as property_title
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE b.status != 'cancelled'
    `;
    let recentParams = [];
    if (start_date && end_date) {
      recentBookingsQuery += ' AND b.created_at >= ? AND b.created_at <= ?';
      recentParams.push(start_date + ' 00:00:00', end_date + ' 23:59:59');
    }
    recentBookingsQuery += ' ORDER BY b.created_at DESC LIMIT 5';
    const [recentBookings] = await pool.execute(recentBookingsQuery, recentParams);

    // Get pending reviews
    const [pendingReviews] = await pool.execute(`
      SELECT 
        r.id, r.rating, r.title, r.created_at,
        u.first_name, u.last_name,
        p.title as property_title
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN properties p ON r.property_id = p.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    // Get daily bookings for the last 7 days for chart
    const [dailyStats] = await pool.execute(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM bookings 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
      AND status != 'cancelled'
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `);

    // --- Executive Dashboard BI Metrics ---
    
    // 1. Average Booking Value (ABV)
    const totalBookings = bookingsCountRes[0].total;
    const totalRevenue = parseFloat(revenueRes[0].total || 0);
    const averageBookingValue = totalBookings > 0 ? (totalRevenue / totalBookings) : 0;

    // 2. Net Platform Margin (%)
    const adminCommission = parseFloat(commissionRes[0].total || 0);
    const netPlatformMargin = totalRevenue > 0 ? ((adminCommission / totalRevenue) * 100) : 0;

    // 3. Occupancy Rate (%)
    const [activeBookingsRes] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE CURRENT_DATE() BETWEEN check_in_date AND check_out_date 
      AND status IN ('confirmed', 'checked_in')
    `);
    const activeBookingsCount = activeBookingsRes[0].count;
    const totalPropertiesCount = propertyCount[0].total;
    const occupancyRate = totalPropertiesCount > 0 ? ((activeBookingsCount / totalPropertiesCount) * 100) : 0;

    // 4. Host Settlement Ratio (%)
    const hostSettlementRatio = (totalPaid + totalPending + hostOutstanding) > 0 ? (totalPaid / (totalPaid + totalPending + hostOutstanding) * 100) : 0;

    // 5. Average Length of Stay (ALOS)
    const [alosRes] = await pool.execute(`
      SELECT COALESCE(AVG(DATEDIFF(check_out_date, check_in_date)), 0) as avg_stay
      FROM bookings
      WHERE status != 'cancelled' AND check_out_date > check_in_date
    `);
    const averageLengthOfStay = parseFloat(alosRes[0]?.avg_stay || 0).toFixed(1);

    // 6. Repeat Guest Retention Rate (%)
    const [repeatGuestRes] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT guest_id) as total_guests,
        SUM(CASE WHEN booking_count > 1 THEN 1 ELSE 0 END) as repeat_guests
      FROM (
        SELECT guest_id, COUNT(*) as booking_count
        FROM bookings
        WHERE status != 'cancelled'
        GROUP BY guest_id
      ) guest_counts
    `);
    const totalGuests = repeatGuestRes[0]?.total_guests || 0;
    const repeatGuests = repeatGuestRes[0]?.repeat_guests || 0;
    const repeatGuestRate = totalGuests > 0 ? parseFloat(((repeatGuests / totalGuests) * 100).toFixed(1)) : 0;

    // 7. Growth Metrics (Current Month)
    const [growthRes] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM property_owners WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) as new_hosts,
        (SELECT COUNT(*) FROM properties WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) as new_properties
    `);
    const newHostsThisMonth = growthRes[0]?.new_hosts || 0;
    const newPropertiesThisMonth = growthRes[0]?.new_properties || 0;

    // 8. Location-Wise Revenue & Bookings
    const [locationStats] = await pool.execute(`
      SELECT 
        COALESCE(NULLIF(p.city, ''), 'Other') as location,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.status != 'cancelled'
      GROUP BY COALESCE(NULLIF(p.city, ''), 'Other')
      ORDER BY revenue DESC
      LIMIT 6
    `);

    // 9. Payout Aging Breakdown
    const payoutAgingStats = {
      unrequested: hostOutstanding,
      pending: totalPending,
      disbursed: totalPaid
    };

    // 10. Cancellation & Refund Trends (Last 6 Months)
    const [cancellationStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END), 0) as refund_amount
      FROM bookings
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // 11. Property Categories Performance
    const [categoryStats] = await pool.execute(`
      SELECT 
        COALESCE(NULLIF(p.property_type, ''), 'Apartment') as category,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.status != 'cancelled'
      GROUP BY COALESCE(NULLIF(p.property_type, ''), 'Apartment')
      ORDER BY revenue DESC
      LIMIT 5
    `);

    // 12. Monthly Revenue & Commission (Last 12 Months)
    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        COUNT(*) as bookings,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(admin_commission_amount), 0) as commission
      FROM bookings 
      WHERE status != 'cancelled' 
      AND payment_status = 'paid'
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
      ORDER BY month ASC
    `);

    // Pre-populate last 12 months with 0s to ensure a full chart timeline
    const monthlyStatsList = [];
    const todayVal = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(todayVal.getFullYear(), todayVal.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyStatsList.push({
        month: monthStr,
        bookings: 0,
        revenue: '0.00',
        commission: '0.00'
      });
    }

    monthlyStats.forEach(row => {
      const match = monthlyStatsList.find(m => m.month === row.month);
      if (match) {
        match.bookings = parseInt(row.bookings || 0);
        match.revenue = String(parseFloat(row.revenue || 0).toFixed(2));
        match.commission = String(parseFloat(row.commission || 0).toFixed(2));
      }
    });

    // Top 5 Properties by revenue
    const [topProperties] = await pool.execute(`
      SELECT 
        p.id, 
        p.title, 
        COALESCE(SUM(b.total_amount), 0) as revenue, 
        COALESCE(SUM(b.admin_commission_amount), 0) as commission 
      FROM bookings b 
      JOIN properties p ON b.property_id = p.id 
      WHERE b.status != 'cancelled' 
      AND b.payment_status = 'paid' 
      GROUP BY p.id, p.title 
      ORDER BY revenue DESC 
      LIMIT 5
    `);

    // Top 5 Hosts by revenue
    const [topHosts] = await pool.execute(`
      SELECT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) as name, 
        COALESCE(SUM(b.total_amount), 0) as revenue, 
        COALESCE(SUM(b.admin_commission_amount), 0) as commission 
      FROM bookings b 
      JOIN properties p ON b.property_id = p.id 
      JOIN property_owners po ON p.owner_id = po.id 
      JOIN users u ON po.user_id = u.id 
      WHERE b.status != 'cancelled' 
      AND b.payment_status = 'paid' 
      GROUP BY u.id, u.first_name, u.last_name 
      ORDER BY revenue DESC 
      LIMIT 5
    `);

    // Payment Method Share
    const [paymentShare] = await pool.execute(`
      SELECT 
        COALESCE(payment_method, 'Other') as payment_method, 
        COUNT(*) as count, 
        COALESCE(SUM(total_amount), 0) as revenue 
      FROM bookings 
      WHERE status != 'cancelled' 
      AND payment_status = 'paid' 
      GROUP BY payment_method
    `);

    // Booking Source Share
    const [sourceShare] = await pool.execute(`
      SELECT 
        COALESCE(source, 'Internal') as source, 
        COUNT(*) as count 
      FROM bookings 
      WHERE status != 'cancelled' 
      GROUP BY source
    `);

    // Action Center Alerts
    const [delayedPaymentsRes] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE payment_status != 'paid' 
      AND check_in_date < CURDATE() 
      AND status NOT IN ('cancelled', 'completed', 'checked_out')
    `);
    const delayedPaymentsCount = delayedPaymentsRes[0].count;

    const [pendingPayoutsCountRes] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM owner_payouts 
      WHERE payment_status IN ('pending', 'processing')
    `);
    const pendingPayoutsCount = pendingPayoutsCountRes[0].count;

    const [pendingRefundsRes] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'checked_out' 
      AND security_deposit_status IN ('held', 'pending_refund')
    `);
    const pendingRefundsCount = pendingRefundsRes[0].count;

    const [pendingPropertiesRes] = await pool.execute(`SELECT COUNT(*) as count FROM properties WHERE status = 'pending_approval'`);
    const pendingPropertiesCount = pendingPropertiesRes[0].count;

    const [pendingReviewsCountRes] = await pool.execute(`SELECT COUNT(*) as count FROM reviews WHERE status = 'pending'`);
    const pendingReviewsTotal = pendingReviewsCountRes[0].count;

    const [openTicketsRes] = await pool.execute(`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread' OR status = 'pending'`);
    const openTicketsCount = openTicketsRes[0]?.count || 0;

    const [subRevenueRes] = await pool.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) as total,
        COALESCE(SUM(gateway_fee), 0) as total_gateway_fee
      FROM orders 
      WHERE package_id IS NOT NULL AND (status = 'Success' OR status = 'COMPLETED')
    `);
    const subscriptionRevenue = parseFloat(subRevenueRes[0].total || 0) - parseFloat(subRevenueRes[0].total_gateway_fee || 0);

    res.json(
      formatResponse(true, 'Admin dashboard data retrieved successfully', {
        statistics: {
          totalUsers: userCount[0].total,
          totalProperties: propertyCount[0].total,
          totalBookings: totalBookings,
          totalRevenue: totalRevenue,
          adminCommission: adminCommission,
          subscriptionRevenue: subscriptionRevenue,
          hostOutstanding: hostOutstanding,
          totalGatewayFees: totalGatewayFees,
          averageBookingValue: averageBookingValue,
          netPlatformMargin: netPlatformMargin,
          occupancyRate: occupancyRate,
          hostSettlementRatio: hostSettlementRatio,
          averageLengthOfStay: averageLengthOfStay,
          repeatGuestRate: repeatGuestRate,
          newHostsThisMonth: newHostsThisMonth,
          newPropertiesThisMonth: newPropertiesThisMonth
        },
        chartData: dailyStats,
        monthlyStats: monthlyStatsList,
        locationStats,
        payoutAgingStats,
        cancellationStats,
        categoryStats,
        topProperties,
        topHosts,
        paymentShare,
        sourceShare,
        alerts: {
          delayedPayments: delayedPaymentsCount,
          pendingPayouts: pendingPayoutsCount,
          pendingRefunds: pendingRefundsCount,
          pendingProperties: pendingPropertiesCount,
          pendingReviews: pendingReviewsTotal,
          openTickets: openTicketsCount
        },
        recentBookings,
        pendingReviews
      })
    );

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve admin dashboard data', null, error.message)
    );
  }
});

// Get User Reports list with filters (type-wise, location-wise, search, date-range)
router.get('/reports/users', async (req, res) => {
  try {
    const { user_type, city, country, search, startDate, endDate } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (user_type) {
      whereConditions.push('u.user_type = ?');
      queryParams.push(user_type);
    }

    if (city) {
      whereConditions.push('u.city = ?');
      queryParams.push(city);
    }

    if (country) {
      whereConditions.push('u.country = ?');
      queryParams.push(country);
    }

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const term = `%${search}%`;
      queryParams.push(term, term, term, term);
    }

    if (startDate) {
      whereConditions.push('u.created_at >= ?');
      queryParams.push(startDate + ' 00:00:00');
    }

    if (endDate) {
      whereConditions.push('u.created_at <= ?');
      queryParams.push(endDate + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.phone, 
        u.user_type, 
        u.is_active, 
        u.city, 
        u.state, 
        u.country, 
        u.created_at
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT 1000
    `;

    const [users] = await pool.execute(query, queryParams);

    // Get lists of unique cities and countries for the dropdown filters
    const [cities] = await pool.execute(`
      SELECT DISTINCT city 
      FROM users 
      WHERE city IS NOT NULL AND TRIM(city) != '' 
      ORDER BY city ASC
    `);

    const [countries] = await pool.execute(`
      SELECT DISTINCT country 
      FROM users 
      WHERE country IS NOT NULL AND TRIM(country) != '' 
      ORDER BY country ASC
    `);

    res.json(formatResponse(true, 'User reports data retrieved successfully', {
      users,
      cities: cities.map(c => c.city),
      countries: countries.map(c => c.country)
    }));
  } catch (error) {
    console.error('[AdminReports] User reports list error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch user reports data', null, error.message));
  }
});

// Get User Analytics (Demographics, Age groups, Gender, Repeated guests)
router.get('/reports/users/analytics', async (req, res) => {
  try {
    // 1. Total & Type-wise counts
    const [typeCounts] = await pool.execute(`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      GROUP BY user_type
    `);

    // 2. Gender-wise distribution
    const [genderCounts] = await pool.execute(`
      SELECT COALESCE(gender, 'unspecified') as gender, COUNT(*) as count 
      FROM users 
      GROUP BY gender
    `);

    // 3. Age-wise distribution (using date_of_birth)
    const [ageCounts] = await pool.execute(`
      SELECT 
        CASE 
          WHEN date_of_birth IS NULL THEN 'Unspecified'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'Under 18'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
          ELSE '51+'
        END as age_group,
        COUNT(*) as count
      FROM users
      GROUP BY age_group
    `);

    // 4. Top Repeated Guests (guests with > 1 confirmed/completed bookings)
    const [repeatedGuests] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.city, u.country,
        COUNT(b.id) as bookings_count, 
        SUM(b.total_amount) as total_spent,
        GROUP_CONCAT(DISTINCT CONCAT(p.title, ' (', pb.cnt, ' bookings)') SEPARATOR ', ') as repeated_properties
      FROM users u
      JOIN bookings b ON u.id = b.guest_id
      JOIN properties p ON b.property_id = p.id
      JOIN (
        SELECT guest_id, property_id, COUNT(*) as cnt
        FROM bookings
        WHERE status IN ('confirmed', 'checked_in', 'checked_out')
        GROUP BY guest_id, property_id
      ) pb ON u.id = pb.guest_id AND b.property_id = pb.property_id
      WHERE b.status IN ('confirmed', 'checked_in', 'checked_out')
      GROUP BY u.id
      HAVING bookings_count > 1
      ORDER BY bookings_count DESC
      LIMIT 500
    `);

    // 5. Detailed stays history of all repeated guests (Stay dates grouped by property in frontend)
    const [repeatedGuestsBookings] = await pool.execute(`
      SELECT 
        b.id as booking_id,
        b.guest_id,
        b.property_id,
        p.title as property_title,
        b.check_in_date,
        b.check_out_date,
        b.status,
        b.total_amount
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.guest_id IN (
        SELECT guest_id
        FROM bookings
        WHERE status IN ('confirmed', 'checked_in', 'checked_out')
        GROUP BY guest_id
        HAVING COUNT(*) > 1
      )
      AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      ORDER BY b.guest_id, p.title, b.check_in_date DESC
    `);

    // 6. Complete list of users for detailed listing of genders/ages
    const [users] = await pool.execute(`
      SELECT 
        id, first_name, last_name, email, phone, user_type, gender, date_of_birth, city, country, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(formatResponse(true, 'User analytics data retrieved successfully', {
      typeCounts,
      genderCounts,
      ageCounts,
      repeatedGuests,
      repeatedGuestsBookings,
      users
    }));
  } catch (error) {
    console.error('[AdminReports] User analytics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch user analytics', null, error.message));
  }
});

// Get Property Analytics (Top booked, top earning, top reviewed)
router.get('/reports/properties/analytics', async (req, res) => {
  try {
    // 1. Top properties by booking count
    const [topBooked] = await pool.execute(`
      SELECT p.id, p.title, p.city, p.property_type, COUNT(b.id) as bookings_count
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id AND b.status IN ('confirmed', 'checked_in', 'checked_out')
      GROUP BY p.id
      ORDER BY bookings_count DESC
      LIMIT 500
    `);

    // 2. Top earning properties by total revenue
    const [topEarning] = await pool.execute(`
      SELECT p.id, p.title, p.city, p.property_type, COALESCE(SUM(b.total_amount), 0) as total_earnings
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id AND b.payment_status = 'paid'
      GROUP BY p.id
      ORDER BY total_earnings DESC
      LIMIT 500
    `);

    // 3. Top reviewed properties by average rating
    const [topReviewed] = await pool.execute(`
      SELECT p.id, p.title, p.city, p.property_type, AVG(r.rating) as avg_rating, COUNT(r.id) as reviews_count
      FROM properties p
      LEFT JOIN reviews r ON p.id = r.property_id AND r.status = 'approved'
      GROUP BY p.id
      HAVING reviews_count > 0
      ORDER BY avg_rating DESC, reviews_count DESC
      LIMIT 500
    `);

    res.json(formatResponse(true, 'Property analytics data retrieved successfully', {
      topBooked,
      topEarning,
      topReviewed
    }));
  } catch (error) {
    console.error('[AdminReports] Property analytics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch property analytics', null, error.message));
  }
});

// Get all users
router.get('/users', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, user_type, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (user_type) {
      whereConditions.push('u.user_type = ?');
      queryParams.push(user_type);
    }

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM users u 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get users
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type,
        u.is_active, u.auto_accept_bookings, u.email_verified_at, u.last_login_at, u.created_at,
        u.phone_verified_at, u.address, u.city, u.state, u.country, u.postal_code, u.bio,
        hs.status as hms_status, 
        hs.trial_ends_at as hms_trial_ends_at, 
        hs.subscription_ends_at as hms_subscription_ends_at,
        po.is_verified as owner_verified,
        po.business_name, po.business_license, po.tax_id,
        po.bank_account_number, po.bank_name, po.bank_routing_number, po.commission_rate
      FROM users u
      LEFT JOIN hms_subscriptions hs ON u.id = hs.host_id
      LEFT JOIN property_owners po ON u.id = po.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Get stats
    const [statsRows] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE user_type = 'property_owner') as total_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 1) as verified_hosts,
        (SELECT COUNT(*) FROM property_owners WHERE is_verified = 0) as pending_hosts,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
        (SELECT COUNT(*) FROM users WHERE is_active = 0) as blocked_users
    `);
    const statsResult = statsRows[0] || {};

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Users retrieved successfully', {
        users,
        pagination,
        stats: statsResult
      })
    );

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve users', null, error.message)
    );
  }
});

// Impersonate / switch user account (Admin only)
router.post('/users/:id/impersonate', verifyToken, requireAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // 1. Find target user
    const [users] = await pool.execute(
      `SELECT id, first_name, last_name, email, phone, user_type, host_id, is_active 
       FROM users WHERE id = ?`,
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json(formatResponse(false, 'Target user not found'));
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(400).json(formatResponse(false, 'Target user account is deactivated'));
    }

    console.log(`Admin ${req.user.id} is impersonating User ${user.id} (${user.email}). Generating tokens...`);

    // 2. Generate tokens
    const token = generateToken(user.id, user.user_type);
    const refreshToken = generateRefreshToken(user.id);

    // 3. Store session in database
    try {
      await pool.execute(
        `INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, created_at) 
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())`,
        [user.id, token, refreshToken]
      );
    } catch (sessionError) {
      console.error('Impersonation session save error:', sessionError);
    }

    // 4. Retrieve owner/staff specific data
    if (user.user_type === 'property_owner' || user.user_type === 'staff') {
      const hostId = user.user_type === 'staff' ? user.host_id : user.id;
      if (hostId) {
        const [hmsSub] = await pool.execute('SELECT status FROM hms_subscriptions WHERE host_id = ?', [hostId]);
        user.hms_status = hmsSub.length > 0 ? hmsSub[0].status : 'inactive';
        
        if (user.user_type === 'staff') {
          const [staffProfile] = await pool.execute('SELECT permissions FROM hms_employees WHERE user_id = ?', [user.id]);
          let permissions = staffProfile.length > 0 ? staffProfile[0].permissions : {};
          if (typeof permissions === 'string') {
            try { permissions = JSON.parse(permissions); } catch (e) {}
          }
          user.hms_permissions = permissions;
        }
      }
    }

    res.json(formatResponse(true, 'Impersonation token generated successfully', {
      token,
      refreshToken,
      user
    }));

  } catch (error) {
    console.error('Impersonate user error:', error);
    res.status(500).json(formatResponse(false, 'Failed to impersonate user', null, error.message));
  }
});

// Update platform-level permissions for a Host or Guest
router.put('/users/:id/platform-permissions', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { platform_permissions } = req.body;

    // Check if platform_permissions is object or null
    if (platform_permissions !== null && (typeof platform_permissions !== 'object' || Array.isArray(platform_permissions))) {
      return res.status(400).json(formatResponse(false, 'Invalid permissions data. Must be an object or null.'));
    }

    // Check if user exists
    const [check] = await pool.query('SELECT id, user_type FROM users WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json(formatResponse(false, 'User not found.'));
    }

    const val = platform_permissions === null ? null : JSON.stringify(platform_permissions);

    // Save platform permissions
    await pool.query(
      'UPDATE users SET platform_permissions = ? WHERE id = ?',
      [val, id]
    );

    res.json(formatResponse(true, 'Platform permissions updated successfully'));
  } catch (error) {
    console.error('Update platform permissions error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update platform permissions', null, error.message));
  }
});

// Get detailed user profile (guest or host) by userId, phone, or email for Admin Popups
router.get('/users/profile-details', async (req, res) => {
  try {
    const { userId, phone, email } = req.query;

    if (!userId && !phone && !email) {
      return res.status(400).json(formatResponse(false, 'userId, phone, or email is required'));
    }

    let user = null;
    let query = '';
    let params = [];

    if (userId) {
      query = `
        SELECT u.*, po.is_verified as owner_verified, po.business_name, po.business_license, po.tax_id, po.commission_rate, po.verification_documents
        FROM users u
        LEFT JOIN property_owners po ON u.id = po.user_id
        WHERE u.id = ? LIMIT 1`;
      params = [userId];
    } else if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      const suffixMatch = digitsOnly.length >= 10 ? `%${digitsOnly.slice(-10)}` : `%${digitsOnly}`;
      query = `
        SELECT u.*, po.is_verified as owner_verified, po.business_name, po.business_license, po.tax_id, po.commission_rate, po.verification_documents
        FROM users u
        LEFT JOIN property_owners po ON u.id = po.user_id
        WHERE (u.phone = ? OR u.phone LIKE ? OR REPLACE(u.phone, '+', '') = ?) LIMIT 1`;
      params = [phone, suffixMatch, digitsOnly];
    } else {
      query = `
        SELECT u.*, po.is_verified as owner_verified, po.business_name, po.business_license, po.tax_id, po.commission_rate, po.verification_documents
        FROM users u
        LEFT JOIN property_owners po ON u.id = po.user_id
        WHERE u.email = ? LIMIT 1`;
      params = [email];
    }

    const [userRows] = await pool.execute(query, params);
    if (userRows.length === 0) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    user = userRows[0];
    // Exclude password hash
    delete user.password_hash;
    delete user.password;

    let profile = {
      guest_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      guest_phone: user.phone,
      guest_email: user.email,
      nationality: user.country,
      address: user.address,
      city: user.city,
      state: user.state,
      user_type: user.user_type,
      is_active: user.is_active,
      created_at: user.created_at,
      owner_verified: user.owner_verified,
      business_name: user.business_name,
      business_license: user.business_license,
      tax_id: user.tax_id,
      verification_documents: user.verification_documents,
      total_bookings_count: 0,
      total_revenue_spent: 0,
      first_visit_date: null,
      last_visit_date: null,
      total_properties_count: 0,
      total_bookings_received: 0,
      total_earnings: 0
    };

    let recentBookings = [];

    if (user.user_type === 'property_owner') {
      // 1. Get Host Statistics
      const [propRows] = await pool.execute('SELECT COUNT(*) as total_props FROM properties WHERE owner_id = (SELECT id FROM property_owners WHERE user_id = ?)', [user.id]);
      profile.total_properties_count = propRows[0]?.total_props || 0;

      const [bookStatsRows] = await pool.execute(`
        SELECT COUNT(b.id) as total_books, SUM(b.total_amount) as total_rev
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE p.owner_id = (SELECT id FROM property_owners WHERE user_id = ?)
      `, [user.id]);
      profile.total_bookings_received = bookStatsRows[0]?.total_books || 0;
      profile.total_earnings = bookStatsRows[0]?.total_rev || 0;

      // 2. Fetch recent bookings for this host
      const [recentRows] = await pool.execute(`
        SELECT b.id, b.booking_reference, b.check_in_date, b.check_out_date, b.total_amount, b.status, b.guest_name, p.title as property_title
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE p.owner_id = (SELECT id FROM property_owners WHERE user_id = ?)
        ORDER BY b.created_at DESC LIMIT 5
      `, [user.id]);
      recentBookings = recentRows;
    } else {
      // 1. Get Guest Statistics (from bookings table by guest_id or phone matching)
      const [bookStatsRows] = await pool.execute(`
        SELECT 
          COUNT(b.id) as total_bookings, 
          SUM(b.total_amount) as total_spent,
          MIN(b.check_in_date) as first_visit,
          MAX(b.check_out_date) as last_visit
        FROM bookings b
        WHERE b.guest_id = ? OR b.guest_phone = ?
      `, [user.id, user.phone]);

      profile.total_bookings_count = bookStatsRows[0]?.total_bookings || 0;
      profile.total_revenue_spent = bookStatsRows[0]?.total_spent || 0;
      profile.first_visit_date = bookStatsRows[0]?.first_visit;
      profile.last_visit_date = bookStatsRows[0]?.last_visit;

      // 2. Fetch recent bookings for this guest
      const [recentRows] = await pool.execute(`
        SELECT b.id, b.booking_reference, b.check_in_date, b.check_out_date, b.total_amount, b.status, b.guest_name, p.title as property_title
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE b.guest_id = ? OR b.guest_phone = ?
        ORDER BY b.created_at DESC LIMIT 5
      `, [user.id, user.phone]);
      recentBookings = recentRows;
    }

    res.json(formatResponse(true, 'User profile details retrieved successfully', {
      profile,
      recentBookings
    }));

  } catch (error) {
    console.error('Get user profile details error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve user profile details', null, error.message));
  }
});

// Get global system overview & room occupancy stats for Admin overview report
router.get('/reports/overview-occupancy', async (req, res) => {
  try {
    const { property_id, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let propertyFilter = '';
    let queryParams = [];
    if (property_id && property_id !== 'all' && property_id !== '') {
      propertyFilter = 'AND p.id = ?';
      queryParams.push(property_id);
    }

    // 1. Get properties count
    let propCountQuery = `SELECT COUNT(*) as total FROM properties p WHERE 1=1 ${propertyFilter}`;
    const [propCountRows] = await pool.execute(propCountQuery, queryParams);
    const totalProperties = propCountRows[0]?.total || 0;

    // 2. Get total rooms count
    let roomCountQuery = `
      SELECT COUNT(*) as total 
      FROM hms_rooms r
      JOIN properties p ON r.property_id = p.id
      WHERE 1=1 ${propertyFilter.replace('p.id', 'r.property_id')}
    `;
    const [roomCountRows] = await pool.execute(roomCountQuery, queryParams);
    const totalRooms = roomCountRows[0]?.total || 0;

    // 3. Get room status counts from hms_rooms
    let roomStatusQuery = `
      SELECT r.status, COUNT(*) as count 
      FROM hms_rooms r
      JOIN properties p ON r.property_id = p.id
      WHERE 1=1 ${propertyFilter.replace('p.id', 'r.property_id')}
      GROUP BY r.status
    `;
    const [roomStatusRows] = await pool.execute(roomStatusQuery, queryParams);
    const statusCounts = {
      available: 0,
      occupied: 0,
      dirty: 0,
      maintenance: 0
    };
    roomStatusRows.forEach(row => {
      if (statusCounts[row.status] !== undefined) {
        statusCounts[row.status] = row.count;
      }
    });

    // 4. Get active bookings count for target date (Occupied Today)
    let activeBookingsQuery = `
      SELECT COUNT(DISTINCT b.hms_room_id) as total_booked
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.hms_room_id IS NOT NULL 
        AND b.status IN ('confirmed', 'checked_in') 
        AND b.check_in_date <= ? 
        AND b.check_out_date > ?
        ${propertyFilter}
    `;
    const [activeBookingsRows] = await pool.execute(activeBookingsQuery, [targetDate, targetDate, ...queryParams]);
    const totalBookedRooms = activeBookingsRows[0]?.total_booked || 0;

    // Calculate available rooms dynamically (Total rooms minus booked rooms)
    const dynamicAvailableRooms = Math.max(0, totalRooms - totalBookedRooms);

    // 5. Get detailed occupancy list
    let occupancyListQuery = `
      SELECT 
        b.booking_reference,
        b.guest_name,
        b.guest_phone,
        b.check_in_date,
        b.check_out_date,
        b.status as booking_status,
        r.room_number,
        r.room_type,
        r.floor,
        r.status as room_status,
        p.title as property_title
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN hms_rooms r ON b.hms_room_id = r.id
      WHERE b.status IN ('confirmed', 'checked_in')
        AND b.check_in_date <= ? 
        AND b.check_out_date > ?
        ${propertyFilter}
      ORDER BY r.room_number ASC
    `;
    const [occupancyListRows] = await pool.execute(occupancyListQuery, [targetDate, targetDate, ...queryParams]);

    // 6. Get additional metrics
    let totalConfirmedBooksQuery = `SELECT COUNT(*) as count FROM bookings b JOIN properties p ON b.property_id = p.id WHERE b.status != 'cancelled' ${propertyFilter}`;
    const [confirmRows] = await pool.execute(totalConfirmedBooksQuery, queryParams);
    
    let totalRevenueQuery = `SELECT SUM(total_amount) as total FROM bookings b JOIN properties p ON b.property_id = p.id WHERE b.payment_status = 'paid' AND b.status != 'cancelled' ${propertyFilter}`;
    const [revRows] = await pool.execute(totalRevenueQuery, queryParams);

    // If target date is today, match cards with the actual current room statuses
    const todayStr = new Date().toLocaleDateString('en-CA');
    const isToday = (targetDate === todayStr);

    const finalBooked = isToday ? statusCounts.occupied : totalBookedRooms;
    const finalAvailable = isToday ? statusCounts.available : dynamicAvailableRooms;

    res.json(formatResponse(true, 'Overview & occupancy statistics retrieved successfully', {
      summary: {
        totalProperties,
        totalRooms,
        bookedRooms: finalBooked,
        availableRooms: finalAvailable,
        occupancyRate: totalRooms > 0 ? Math.round((finalBooked / totalRooms) * 100) : 0,
        statusCounts,
        additional: {
          totalConfirmedBookings: confirmRows[0]?.count || 0,
          totalRevenuePaid: revRows[0]?.total || 0
        }
      },
      occupancyList: occupancyListRows
    }));

  } catch (error) {
    console.error('Get admin occupancy statistics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve occupancy statistics', null, error.message));
  }
});

// Get host performance and platform commission report (Date-wise Room Nights Occupancy)
router.get('/reports/host-performance', async (req, res) => {
  try {
    const { start_date, end_date, host_id } = req.query;

    const startDateStr = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA');
    const endDateStr = end_date || new Date().toLocaleDateString('en-CA');

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const totalNights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))); // Total nights in selection

    let hostFilter = '';
    let hostQueryParams = [];
    if (host_id && host_id !== 'all' && host_id !== '') {
      hostFilter = 'AND po.id = ?';
      hostQueryParams.push(host_id);
    }

    // 1. Get all active hosts/property owners
    const [hosts] = await pool.execute(`
      SELECT po.id as host_id, u.first_name, u.last_name, u.email, u.phone
      FROM property_owners po
      JOIN users u ON po.user_id = u.id
      WHERE 1=1 ${hostFilter}
      ORDER BY u.first_name ASC
    `, hostQueryParams);

    // 2. Get properties owned by these hosts
    let propertyQuery = `
      SELECT p.id, p.title, p.owner_id
      FROM properties p
    `;
    const [allProperties] = await pool.execute(propertyQuery);

    // 3. Get rooms belonging to these properties
    let roomQuery = `
      SELECT r.id, r.property_id, r.room_number, r.room_type, r.floor
      FROM hms_rooms r
    `;
    const [allRooms] = await pool.execute(roomQuery);

    // 4. Get active bookings in the date range
    let bookingsQuery = `
      SELECT b.id, b.hms_room_id, b.property_id, b.check_in_date, b.check_out_date, b.total_amount, b.admin_commission_amount
      FROM bookings b
      WHERE b.hms_room_id IS NOT NULL 
        AND b.status != 'cancelled' 
        AND b.check_in_date <= ? 
        AND b.check_out_date >= ?
    `;
    const [allBookings] = await pool.execute(bookingsQuery, [endDateStr, startDateStr]);

    // Build Host performance metrics
    const hostPerformanceData = hosts.map(h => {
      // Find properties owned by this host
      const hostProperties = allProperties.filter(p => p.owner_id === h.host_id);
      const hostPropertyIds = hostProperties.map(p => p.id);

      // Find rooms for this host's properties
      const hostRooms = allRooms.filter(r => hostPropertyIds.includes(r.property_id));

      let hostBookedNights = 0;
      let hostGrossCollection = 0;
      let hostCommission = 0;

      const roomsDetail = hostRooms.map(room => {
        // Find bookings for this room that overlap with the date range
        const roomBookings = allBookings.filter(b => b.hms_room_id === room.id);

        let roomBookedNights = 0;
        let roomGrossCollection = 0;
        let roomCommission = 0;
        let timesBooked = 0;

        roomBookings.forEach(b => {
          // Calculate overlap nights
          const bStart = new Date(b.check_in_date);
          const bEnd = new Date(b.check_out_date);

          const overlapStart = new Date(Math.max(start, bStart));
          const overlapEnd = new Date(Math.min(end, bEnd));

          const overlapNights = Math.max(0, Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
          
          if (overlapNights > 0) {
            roomBookedNights += overlapNights;
            roomGrossCollection += parseFloat(b.total_amount || 0);
            roomCommission += parseFloat(b.admin_commission_amount || 0);
            timesBooked++;
          }
        });

        // Cap booked nights to totalNights
        roomBookedNights = Math.min(totalNights, roomBookedNights);
        const roomEmptyNights = Math.max(0, totalNights - roomBookedNights);

        hostBookedNights += roomBookedNights;
        hostGrossCollection += roomGrossCollection;
        hostCommission += roomCommission;

        const property = hostProperties.find(p => p.id === room.property_id);

        return {
          room_id: room.id,
          property_title: property ? property.title : 'Unknown Property',
          room_number: room.room_number,
          room_type: room.room_type || 'Standard',
          floor: room.floor || '—',
          times_booked: timesBooked,
          booked_nights: roomBookedNights,
          empty_nights: roomEmptyNights,
          collection: roomGrossCollection,
          commission: roomCommission
        };
      });

      const totalCapacityNights = hostRooms.length * totalNights;
      const hostEmptyNights = Math.max(0, totalCapacityNights - hostBookedNights);

      return {
        host_id: h.host_id,
        host_name: `${h.first_name || ''} ${h.last_name || ''}`.trim(),
        host_email: h.email || '—',
        host_phone: h.phone || '—',
        rooms_registered: hostRooms.length,
        total_capacity_nights: totalCapacityNights,
        booked_nights: hostBookedNights,
        empty_nights: hostEmptyNights,
        gross_collection: hostGrossCollection,
        commission: hostCommission,
        rooms: roomsDetail
      };
    });

    // 5. Aggregate summary stats
    let totalRooms = 0;
    let totalCapacityNights = 0;
    let totalBookedNights = 0;
    let totalCollection = 0;
    let totalCommission = 0;

    hostPerformanceData.forEach(h => {
      totalRooms += h.rooms_registered;
      totalCapacityNights += h.total_capacity_nights;
      totalBookedNights += h.booked_nights;
      totalCollection += h.gross_collection;
      totalCommission += h.commission;
    });

    const totalEmptyNights = Math.max(0, totalCapacityNights - totalBookedNights);

    res.json(formatResponse(true, 'Host performance statistics retrieved successfully', {
      summary: {
        totalHosts: hosts.length,
        totalRooms,
        totalCapacityNights,
        totalBookedNights,
        totalEmptyNights,
        occupancyRate: totalCapacityNights > 0 ? Math.round((totalBookedNights / totalCapacityNights) * 100) : 0,
        totalCollection,
        totalCommission
      },
      hosts: hostPerformanceData
    }));

  } catch (error) {
    console.error('Get host performance statistics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve host performance statistics', null, error.message));
  }
});

// Get Master Calendar Matrix (Tape Chart)
router.get('/calendar/matrix', async (req, res) => {
  try {
    const { start_date, end_date, property_id, host_id, status, search } = req.query;

    const startDate = start_date || new Date().toISOString().split('T')[0];
    let endDate = end_date;
    if (!endDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + 14);
      endDate = d.toISOString().split('T')[0];
    }

    // 1. Fetch properties list (filtered by property_id / host_id)
    let propWhere = 'p.status = "active"';
    let propParams = [];

    if (property_id) {
      propWhere += ' AND p.id = ?';
      propParams.push(property_id);
    }
    if (host_id) {
      propWhere += ' AND po.user_id = ?';
      propParams.push(host_id);
    }
    if (search) {
      propWhere += ' AND (p.title LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR CONCAT(u.first_name, " ", u.last_name) LIKE ?)';
      const s = `%${search}%`;
      propParams.push(s, s, s, s);
    }

    const [properties] = await pool.execute(`
      SELECT 
        p.id, p.title, p.property_type, p.is_hms_enabled, p.status, COALESCE(p.base_price, 0) as price_per_night,
        u.id as host_id, CONCAT(u.first_name, ' ', u.last_name) as host_name, u.phone as host_phone
      FROM properties p
      LEFT JOIN property_owners po ON p.owner_id = po.id
      LEFT JOIN users u ON po.user_id = u.id
      WHERE ${propWhere}
      ORDER BY p.title ASC
    `, propParams);

    // Fetch list of hosts & master list of all properties for dropdown filtering
    const [hostsList] = await pool.execute(`
      SELECT DISTINCT u.id, CONCAT(u.first_name, ' ', u.last_name) as name
      FROM property_owners po
      JOIN users u ON po.user_id = u.id
      ORDER BY name ASC
    `);

    const [allPropertiesList] = await pool.execute(`
      SELECT id, title FROM properties WHERE status = 'active' ORDER BY title ASC
    `);

    if (properties.length === 0) {
      return res.json(formatResponse(true, 'Master calendar data retrieved', {
        properties: [],
        allProperties: allPropertiesList,
        bookings: [],
        hosts: hostsList,
        summary: { 
          totalProperties: 0, 
          totalRooms: 0, 
          totalBookings: 0, 
          occupancyRate: 0,
          totalRevenue: '0.00',
          totalCommission: '0.00',
          startDate,
          endDate
        }
      }));
    }

    const propertyIds = properties.map(p => p.id);

    // 2. Fetch HMS rooms for these properties
    const [hmsRooms] = await pool.query(
      `SELECT id, property_id, room_number, room_type, floor, price, status 
       FROM hms_rooms 
       WHERE property_id IN (?) 
       ORDER BY room_number ASC`,
      [propertyIds]
    );

    // Group rooms by property_id
    const roomsByProp = {};
    hmsRooms.forEach(r => {
      if (!roomsByProp[r.property_id]) roomsByProp[r.property_id] = [];
      roomsByProp[r.property_id].push(r);
    });

    // Attach rooms array to each property (provide a default entry if no hms_rooms exist)
    let totalRoomsCount = 0;
    properties.forEach(p => {
      const rooms = roomsByProp[p.id] || [];
      if (rooms.length > 0) {
        p.rooms = rooms;
        totalRoomsCount += rooms.length;
      } else {
        p.rooms = [{
          id: null,
          property_id: p.id,
          room_number: 'Entire Listing',
          room_type: p.property_type || 'Property',
          floor: '—',
          price: p.price_per_night,
          status: 'available'
        }];
        totalRoomsCount += 1;
      }
    });

    // 3. Fetch overlapping bookings
    let bookingWhere = `
      b.status != 'cancelled' 
      AND b.property_id IN (?) 
      AND b.check_in_date < ? 
      AND b.check_out_date > ?
    `;
    let bookingParams = [propertyIds, endDate + ' 23:59:59', startDate + ' 00:00:00'];

    if (status) {
      bookingWhere += ' AND b.status = ?';
      bookingParams.push(status);
    }
    if (search) {
      bookingWhere += ' AND (b.booking_reference LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR p.title LIKE ? OR hr.room_number LIKE ?)';
      const s = `%${search}%`;
      bookingParams.push(s, s, s, s, s);
    }

    const [bookings] = await pool.query(`
      SELECT 
        b.id, b.booking_reference, b.guest_id, b.property_id, b.hms_room_id,
        b.check_in_date, b.check_out_date, b.total_amount, b.admin_commission_amount,
        b.status, b.payment_status, b.payment_method, b.payment_notes as payment_txn_id, b.source, b.created_at,
        COALESCE(CONCAT(u.first_name, ' ', u.last_name), b.guest_name, 'Guest') as guest_name,
        COALESCE(u.phone, b.guest_phone) as guest_phone,
        COALESCE(u.email, b.guest_email) as guest_email,
        p.title as property_title,
        hr.room_number, hr.room_type
      FROM bookings b
      LEFT JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN hms_rooms hr ON b.hms_room_id = hr.id
      WHERE ${bookingWhere}
      ORDER BY b.check_in_date ASC
    `, bookingParams);

    // Calculate basic occupancy percentage and revenue totals for date window
    const daysCount = Math.max(Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)), 1);
    const totalCapacityRoomNights = totalRoomsCount * daysCount;
    const bookedNights = bookings.length;
    const occupancyRate = totalCapacityRoomNights > 0 ? Math.min(((bookedNights / totalCapacityRoomNights) * 100), 100).toFixed(1) : 0;
    const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
    const totalCommission = bookings.reduce((sum, b) => sum + (parseFloat(b.admin_commission_amount) || 0), 0);

    res.json(formatResponse(true, 'Master calendar data retrieved successfully', {
      properties,
      allProperties: allPropertiesList,
      bookings,
      hosts: hostsList,
      summary: {
        totalProperties: properties.length,
        totalRooms: totalRoomsCount,
        totalBookings: bookings.length,
        occupancyRate: occupancyRate,
        totalRevenue: totalRevenue.toFixed(2),
        totalCommission: totalCommission.toFixed(2),
        startDate,
        endDate
      }
    }));

  } catch (error) {
    console.error('Get admin calendar matrix error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve calendar matrix', null, error.stack || error.message));
  }
});

// Get all properties for assignment (no pagination limit)
router.get('/properties/all', async (req, res) => {
  try {
    const { status } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get all properties without pagination
    const [properties] = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.city,
        p.state,
        p.base_price,
        p.status,
        p.property_type
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, queryParams);

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        properties
      })
    );

  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Get all properties
router.get('/properties', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, featured, monthly_status, location, city, min_price, max_price, sort } = req.query;
    const offset = (page - 1) * limit;
    const selectedLocation = location || city;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    if (selectedLocation) {
      whereConditions.push('(p.city = ? OR p.city LIKE ? OR p.state LIKE ? OR p.address LIKE ?)');
      queryParams.push(selectedLocation, `%${selectedLocation}%`, `%${selectedLocation}%`, `%${selectedLocation}%`);
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.city LIKE ? OR p.address LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
      whereConditions.push('p.is_featured = 1');
    } else if (featured === 'false') {
      whereConditions.push('p.is_featured = 0');
    }

    if (monthly_status === 'pending') {
      whereConditions.push('p.monthly_rent_enabled = 1 AND p.monthly_approved = 0');
    } else if (monthly_status === 'approved') {
      whereConditions.push('p.monthly_rent_enabled = 1 AND p.monthly_approved = 1');
    }

    if (min_price && !isNaN(parseFloat(min_price))) {
      whereConditions.push('p.base_price >= ?');
      queryParams.push(parseFloat(min_price));
    }

    if (max_price && !isNaN(parseFloat(max_price))) {
      whereConditions.push('p.base_price <= ?');
      queryParams.push(parseFloat(max_price));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
      orderByClause = 'ORDER BY p.base_price ASC';
    } else if (sort === 'price_desc') {
      orderByClause = 'ORDER BY p.base_price DESC';
    } else if (sort === 'oldest') {
      orderByClause = 'ORDER BY p.created_at ASC';
    }

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM properties p 
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get properties
    const [properties] = await pool.execute(`
      SELECT 
        p.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.id as owner_user_id,
        u.phone as owner_phone
      FROM properties p
      JOIN property_owners po ON p.owner_id = po.id
      JOIN users u ON po.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Get display categories for each property
    for (let property of properties) {
      const [categories] = await pool.execute(`
        SELECT dc.id, dc.name, dc.description
        FROM display_categories dc
        INNER JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
        WHERE dcp.property_id = ?
        ORDER BY dc.sort_order ASC, dc.name ASC
      `, [property.id]);
      property.display_categories = categories;
    }

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    // Get global property statistics for dashboard count cards
    const [[statsResult]] = await pool.execute(`
      SELECT 
        COUNT(*) as \`all\`,
        COALESCE(SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END), 0) as pending_approval,
        COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active,
        COALESCE(SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END), 0) as suspended,
        COALESCE(SUM(CASE WHEN monthly_rent_enabled = 1 AND monthly_approved = 0 THEN 1 ELSE 0 END), 0) as monthly_pending,
        COALESCE(SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END), 0) as featured
      FROM properties
    `);

    // Get distinct locations/cities for location filter dropdown
    const [locationsResult] = await pool.execute(`
      SELECT DISTINCT city 
      FROM properties 
      WHERE city IS NOT NULL AND city != '' 
      ORDER BY city ASC
    `);
    const locations = locationsResult.map(r => r.city).filter(Boolean);

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        properties,
        pagination,
        stats: statsResult,
        locations
      })
    );

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Verify gateway transaction status
router.get('/bookings/:id/verify-gateway', async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Fetch booking details
    const [bookings] = await pool.execute(
      'SELECT id, booking_reference, payment_method, payment_status, total_amount FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json(formatResponse(false, 'Booking not found'));
    }

    const booking = bookings[0];
    const method = String(booking.payment_method).toLowerCase();

    if (method === 'bkash') {
      // Find latest bKash payment row for this booking
      const [paymentRows] = await pool.execute(
        "SELECT gateway_transaction_id, payment_reference FROM payments WHERE booking_id = ? AND payment_method = 'bkash' AND (gateway_transaction_id IS NOT NULL OR payment_reference IS NOT NULL) ORDER BY id DESC LIMIT 1",
        [bookingId]
      );

      if (paymentRows.length === 0) {
        return res.status(400).json(formatResponse(false, 'No bKash payment record initiated for this booking'));
      }

      const payID = paymentRows[0].gateway_transaction_id || 
                    (paymentRows[0].payment_reference ? paymentRows[0].payment_reference.replace('BKASH_', '') : '');

      if (!payID) {
        return res.status(400).json(formatResponse(false, 'Could not determine bKash paymentID for this transaction'));
      }

      const queryResult = await bkashGateway.queryPayment(payID);

      if (queryResult.success) {
        return res.json(formatResponse(true, 'bKash transaction verified successfully', {
          gateway: 'bkash',
          success: true,
          transactionId: queryResult.transactionID || 'Pending',
          paymentId: queryResult.paymentID,
          amount: queryResult.amount,
          currency: queryResult.currency || 'BDT',
          status: queryResult.transactionStatus, // e.g. 'Completed', 'Initiated'
          payerDetails: queryResult.customerMsisdn || 'Unknown',
          rawResponse: queryResult
        }));
      } else {
        return res.status(400).json(formatResponse(false, `bKash verification failed: ${queryResult.error}`, queryResult));
      }

    } else if (method === 'sslcommerz') {
      // Find latest SSLCommerz payment row for this booking
      const [paymentRows] = await pool.execute(
        "SELECT gateway_transaction_id, payment_reference FROM payments WHERE booking_id = ? AND payment_method = 'sslcommerz' AND gateway_transaction_id IS NOT NULL ORDER BY id DESC LIMIT 1",
        [bookingId]
      );

      if (paymentRows.length === 0) {
        return res.status(400).json(formatResponse(false, 'No SSLCommerz payment record initiated for this booking'));
      }

      const [sslConfig] = await pool.execute("SELECT store_id, store_password, is_live FROM payment_settings WHERE provider_name = 'sslcommerz'");
      if (sslConfig.length === 0) {
        return res.status(500).json(formatResponse(false, 'SSLCommerz gateway settings not configured in database'));
      }

      const SSLCommerzPayment = require('sslcommerz-lts');
      const config = sslConfig[0];
      const isLive = Boolean(config.is_live);
      const sslcz = new SSLCommerzPayment(config.store_id, config.store_password, isLive);

      const queryResult = await sslcz.transactionQueryByTransactionId({ tran_id: paymentRows[0].gateway_transaction_id });

      if (queryResult && queryResult.APIConnect === 'DONE' && queryResult.no_of_trans_found > 0) {
        const tx = queryResult.element[0];
        return res.json(formatResponse(true, 'SSLCommerz transaction verified successfully', {
          gateway: 'sslcommerz',
          success: true,
          transactionId: tx.tran_id,
          bankTranId: tx.bank_tran_id,
          amount: tx.amount,
          currency: tx.currency || 'BDT',
          status: tx.status, // e.g. 'VALID', 'FAILED'
          paymentTime: tx.tran_date,
          payerDetails: (tx.card_brand || '') + (tx.card_no ? ` (${tx.card_no})` : '') + (tx.card_issuer ? ` - ${tx.card_issuer}` : '') || 'Unknown',
          rawResponse: queryResult
        }));
      } else {
        return res.status(400).json(formatResponse(false, 'SSLCommerz transaction not found or query failed', queryResult));
      }

    } else {
      return res.status(400).json(formatResponse(false, `Live verification is not supported for ${booking.payment_method || 'this'} payment method`));
    }

  } catch (error) {
    console.error('Verify gateway error:', error);
    res.status(500).json(formatResponse(false, 'Failed to verify transaction with gateway', null, error.message));
  }
});

// Get all bookings
router.get('/bookings', validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      payment_status,
      payment_method,
      search,
      startDate,
      endDate,
      property_id,
      guest_id,
      host_id,
      dateType = 'check_in_date',
      report_mode
    } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('b.status = ?');
      queryParams.push(status);
    }

    if (payment_status) {
      whereConditions.push('b.payment_status = ?');
      queryParams.push(payment_status);
    }

    if (payment_method) {
      if (report_mode === 'true') {
        whereConditions.push('COALESCE(pay.payment_method, b.payment_method) = ?');
      } else {
        whereConditions.push('b.payment_method = ?');
      }
      queryParams.push(payment_method);
    }

    if (property_id) {
      whereConditions.push('b.property_id = ?');
      queryParams.push(property_id);
    }

    if (guest_id) {
      whereConditions.push('b.guest_id = ?');
      queryParams.push(guest_id);
    }

    if (host_id) {
      whereConditions.push('host_u.id = ?');
      queryParams.push(host_id);
    }

    if (search) {
      if (report_mode === 'true') {
        whereConditions.push(
          '(b.booking_reference LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ? OR host_u.first_name LIKE ? OR host_u.last_name LIKE ? OR p.title LIKE ? OR COALESCE(pay.payment_reference, pay.gateway_transaction_id) LIKE ?)'
        );
      } else {
        whereConditions.push(
          '(b.booking_reference LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ? OR host_u.first_name LIKE ? OR host_u.last_name LIKE ? OR p.title LIKE ? OR EXISTS (SELECT 1 FROM payments p_ref WHERE p_ref.booking_id = b.id AND p_ref.payment_reference LIKE ?))'
        );
      }
      queryParams.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    let dateColumn = 'b.check_in_date';
    if (dateType === 'check_out_date') {
      dateColumn = 'b.check_out_date';
    } else if (dateType === 'created_at') {
      dateColumn = 'b.created_at';
    }

    if (startDate) {
      whereConditions.push(`${dateColumn} >= ?`);
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`${dateColumn} <= ?`);
      if (dateType === 'created_at') {
        queryParams.push(endDate.includes(' ') || endDate.includes('T') ? endDate : `${endDate} 23:59:59`);
      } else {
        queryParams.push(endDate);
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    let countSql = '';
    if (report_mode === 'true') {
      countSql = `
        SELECT COUNT(*) as total 
        FROM bookings b
        JOIN users u ON b.guest_id = u.id
        JOIN properties p ON b.property_id = p.id
        JOIN property_owners po ON p.owner_id = po.id
        JOIN users host_u ON po.user_id = host_u.id
        LEFT JOIN payments pay ON pay.booking_id = b.id 
          AND pay.status = 'completed' 
          AND pay.transaction_type IN ('guest_payment', 'payment') 
          AND pay.cr_amount > 0
        ${whereClause}
      `;
    } else {
      countSql = `
        SELECT COUNT(*) as total 
        FROM bookings b
        JOIN users u ON b.guest_id = u.id
        JOIN properties p ON b.property_id = p.id
        JOIN property_owners po ON p.owner_id = po.id
        JOIN users host_u ON po.user_id = host_u.id
        ${whereClause}
      `;
    }

    const [countResult] = await pool.execute(countSql, queryParams);
    const total = countResult[0].total;

    // Get bookings
    let bookingsSql = '';
    if (report_mode === 'true') {
      bookingsSql = `
        SELECT 
          COALESCE(pay.id, b.id) as id,
          b.id as booking_original_id,
          b.booking_reference,
          b.guest_id,
          b.property_id,
          b.check_in_date,
          b.check_out_date,
          b.check_in_time,
          b.check_out_time,
          b.number_of_guests,
          b.number_of_children,
          b.number_of_infants,
          b.base_price,
          b.cleaning_fee,
          b.security_deposit,
          b.extra_guest_fee,
          b.service_fee,
          b.tax_amount,
          b.currency,
          b.special_requests,
          b.coupon_code,
          b.discount_amount,
          b.guest_name,
          b.guest_email,
          b.guest_phone,
          b.booking_source,
          b.status,
          b.payment_status,
          b.confirmed_at,
          b.cancelled_at,
          b.cancellation_reason,
          b.created_at,
          b.updated_at,
          b.hms_room_id,
          b.security_deposit_status,
          b.security_deposit_claim_amount,
          b.security_deposit_deduction_amount,
          b.security_deposit_claim_reason,
          b.security_deposit_claim_at,
          COALESCE(pay.payment_method, b.payment_method) as payment_method,
          COALESCE(pay.payment_reference, pay.gateway_transaction_id) as payment_txn_id,
          COALESCE(pay.cr_amount, b.total_amount) as total_amount,
          COALESCE(pay.gateway_fee, 0.00) as gateway_fee,
          u.id as guest_user_id,
          u.first_name as guest_first_name,
          u.last_name as guest_last_name,
          u.email as guest_email_user,
          u.phone as guest_phone_user,
          p.title as property_title,
          p.city as property_city,
          host_u.id as host_user_id,
          host_u.first_name as host_first_name,
          host_u.last_name as host_last_name,
          host_u.phone as host_phone,
          host_u.email as host_email,
          COALESCE(ae.commission_rate, 0) as commission_rate,
          COALESCE(
            CASE 
              WHEN pay.cr_amount IS NOT NULL AND ae.commission_rate IS NOT NULL 
                THEN (pay.cr_amount * ae.commission_rate / 100)
              WHEN ae.commission_rate IS NULL THEN 0
              ELSE 0
            END,
            0
          ) as commission_amount,
          COALESCE(ae.net_commission, 0) as net_commission
        FROM bookings b
        JOIN users u ON b.guest_id = u.id
        JOIN properties p ON b.property_id = p.id
        JOIN property_owners po ON p.owner_id = po.id
        JOIN users host_u ON po.user_id = host_u.id
        LEFT JOIN admin_earnings ae ON ae.booking_id = b.id
        LEFT JOIN payments pay ON pay.booking_id = b.id 
          AND pay.status = 'completed' 
          AND pay.transaction_type IN ('guest_payment', 'payment') 
          AND pay.cr_amount > 0
        ${whereClause}
        ORDER BY b.created_at DESC, pay.id DESC
        LIMIT ? OFFSET ?
      `;
    } else {
      bookingsSql = `
        SELECT 
          b.*,
          u.id as guest_user_id,
          u.first_name as guest_first_name,
          u.last_name as guest_last_name,
          u.email as guest_email,
          u.phone as guest_phone,
          p.title as property_title,
          p.city as property_city,
          host_u.id as host_user_id,
          host_u.first_name as host_first_name,
          host_u.last_name as host_last_name,
          host_u.phone as host_phone,
          host_u.email as host_email,
          COALESCE(ae.commission_rate, 0) as commission_rate,
          COALESCE(ae.commission_amount, 0) as commission_amount,
          COALESCE(ae.net_commission, 0) as net_commission,
          COALESCE((
            SELECT SUM(pay_fee.gateway_fee) 
            FROM payments pay_fee 
            WHERE pay_fee.booking_id = b.id AND pay_fee.status = 'completed'
          ), 0.00) as gateway_fee,
          (SELECT pay.payment_reference 
           FROM payments pay 
           WHERE pay.booking_id = b.id 
             AND pay.status = 'completed' 
             AND pay.payment_reference IS NOT NULL 
             AND pay.payment_reference NOT LIKE 'DR-%' 
           ORDER BY pay.id DESC 
           LIMIT 1) as payment_txn_id
        FROM bookings b
        JOIN users u ON b.guest_id = u.id
        JOIN properties p ON b.property_id = p.id
        JOIN property_owners po ON p.owner_id = po.id
        JOIN users host_u ON po.user_id = host_u.id
        LEFT JOIN admin_earnings ae ON ae.booking_id = b.id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `;
    }

    const [bookings] = await pool.execute(bookingsSql, [...queryParams, parseInt(limit), offset]);
    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Bookings retrieved successfully', {
        bookings,
        pagination
      })
    );

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve bookings', null, error.message)
    );
  }
});

// Get reviews (with filtering)
router.get('/reviews', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR p.title LIKE ? OR b.booking_reference LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get reviews
    const [reviews] = await pool.execute(`
      SELECT 
        r.*,
        u.first_name, u.last_name,
        b.booking_reference,
        p.title as property_title,
        p.city as property_city
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN properties p ON r.property_id = p.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(
      formatResponse(true, 'Reviews retrieved successfully', {
        reviews,
        pagination
      })
    );

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve reviews', null, error.message)
    );
  }
});

// Approve/Reject review
router.patch('/reviews/:id/status', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status. Must be "approved" or "rejected"')
      );
    }

    // Update review status
    const [result] = await pool.execute(
      'UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Review not found')
      );
    }

    // If approved, update property rating
    if (status === 'approved') {
      const [reviews] = await pool.execute(
        'SELECT property_id, rating FROM reviews WHERE id = ?',
        [id]
      );

      if (reviews.length > 0) {
        const { property_id } = reviews[0];

        // Calculate new average rating
        const [ratingResult] = await pool.execute(`
          SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
          FROM reviews 
          WHERE property_id = ? AND status = 'approved'
        `, [property_id]);

        const { avg_rating, total_reviews } = ratingResult[0];

        // Update property rating
        await pool.execute(
          'UPDATE properties SET average_rating = ?, total_reviews = ? WHERE id = ?',
          [avg_rating, total_reviews, property_id]
        );
      }
    }

    res.json(
      formatResponse(true, `Review ${status} successfully`)
    );

  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update review status', null, error.message)
    );
  }
});

// Update user details
router.put('/users/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, user_type, auto_accept_bookings, owner_verified } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !user_type) {
      return res.status(400).json(
        formatResponse(false, 'First name, last name, email, and user type are required')
      );
    }

    // Validate user_type
    if (!['admin', 'property_owner', 'guest'].includes(user_type)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid user type')
      );
    }

    // Check if email is already taken by another user
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json(
        formatResponse(false, 'Email is already in use by another user')
      );
    }

    // Update user
    let queryArgs = [first_name, last_name, email, phone || null, user_type];
    let querySets = 'first_name = ?, last_name = ?, email = ?, phone = ?, user_type = ?';

    if (auto_accept_bookings !== undefined) {
      querySets += ', auto_accept_bookings = ?';
      queryArgs.push(auto_accept_bookings ? 1 : 0);
    }
    
    querySets += ', updated_at = NOW()';
    queryArgs.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${querySets} WHERE id = ?`,
      queryArgs
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Update owner verification status if user type is property_owner
    if (user_type === 'property_owner') {
      const [existingOwner] = await pool.execute(
        'SELECT id FROM property_owners WHERE user_id = ?',
        [id]
      );
      
      const isVerifiedVal = owner_verified !== undefined ? (owner_verified ? 1 : 0) : 0;
      
      if (existingOwner.length > 0) {
        await pool.execute(
          'UPDATE property_owners SET is_verified = ? WHERE user_id = ?',
          [isVerifiedVal, id]
        );
      } else {
        await pool.execute(
          'INSERT INTO property_owners (user_id, commission_rate, is_verified, created_at) VALUES (?, 0, ?, NOW())',
          [id, isVerifiedVal]
        );
      }
    }

    // Get updated user data
    const [updatedUser] = await pool.execute(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type, 
        u.is_active, u.auto_accept_bookings, u.created_at,
        u.phone_verified_at, u.address, u.city, u.state, u.country, u.postal_code, u.bio,
        po.is_verified as owner_verified,
        po.business_name, po.business_license, po.tax_id,
        po.bank_account_number, po.bank_name, po.bank_routing_number, po.commission_rate
      FROM users u
      LEFT JOIN property_owners po ON u.id = po.user_id
      WHERE u.id = ?
    `, [id]);

    res.json(
      formatResponse(true, 'User updated successfully', updatedUser[0])
    );

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update user', null, error.message)
    );
  }
});

// Block/Unblock user
router.patch('/users/:id/block', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, reason } = req.body;

    // Update user status
    const [result] = await pool.execute(
      'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Create block record if blocking
    if (!is_active && reason) {
      await pool.execute(`
        INSERT INTO user_blocks (blocked_user_id, blocked_by, block_type, reason, status, blocked_at)
        VALUES (?, ?, 'permanent', ?, 'active', NOW())
      `, [id, req.user.id, reason]);
    }

    res.json(
      formatResponse(true, `User ${is_active ? 'unblocked' : 'blocked'} successfully`)
    );

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update user status', null, error.message)
    );
  }
});

// Get list of all properties (id, title) for dropdowns
router.get('/properties/list', async (req, res) => {
  try {
    const [properties] = await pool.execute(
      'SELECT id, title, city FROM properties ORDER BY title ASC'
    );
    res.json(formatResponse(true, 'Properties list retrieved successfully', { properties }));
  } catch (error) {
    console.error('Get properties list error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve properties list', null, error.message));
  }
});

// Update property details
router.put('/properties/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, base_price, status, display_category_id } = req.body;

    // Validate required fields
    if (!title || !base_price || !status) {
      return res.status(400).json(
        formatResponse(false, 'Title, base price, and status are required')
      );
    }

    // Validate status
    if (!['active', 'inactive', 'suspended', 'pending_approval'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status')
      );
    }

    // Validate display_category_id if provided
    if (display_category_id) {
      const [categoryExists] = await pool.execute(
        'SELECT id FROM display_categories WHERE id = ?',
        [display_category_id]
      );
      if (categoryExists.length === 0) {
        return res.status(400).json(
          formatResponse(false, 'Invalid display category')
        );
      }
    }

    // Update property
    const [result] = await pool.execute(
      `UPDATE properties 
       SET title = ?, base_price = ?, status = ?, display_category_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [title, base_price, status, display_category_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Get updated property data
    const [updatedProperty] = await pool.execute(
      'SELECT id, title, base_price, status, created_at FROM properties WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Property updated successfully', updatedProperty[0])
    );

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property', null, error.message)
    );
  }
});

// Toggle featured property
router.patch('/properties/:id/featured', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    if (typeof is_featured !== 'boolean') {
      return res.status(400).json(
        formatResponse(false, 'is_featured must be a boolean value')
      );
    }

    // Update property featured status
    const [result] = await pool.execute(
      'UPDATE properties SET is_featured = ?, updated_at = NOW() WHERE id = ?',
      [is_featured ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    res.json(
      formatResponse(true, `Property ${is_featured ? 'featured' : 'unfeatured'} successfully`)
    );

  } catch (error) {
    console.error('Toggle featured property error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update featured status', null, error.message)
    );
  }
});

// Approve/Reject property
router.patch('/properties/:id/status', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended', 'pending_approval'].includes(status)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status')
      );
    }

    // Update property status
    const [result] = await pool.execute(
      'UPDATE properties SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Clear cache
    clearPropertiesCache();

    res.json(
      formatResponse(true, 'Property status updated successfully')
    );

  } catch (error) {
    console.error('Update property status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property status', null, error.message)
    );
  }
});

// Approve monthly stay option
router.put('/properties/:id/approve-monthly', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE properties SET monthly_approved = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    clearPropertiesCache();

    res.json(
      formatResponse(true, 'Monthly rent stay approved successfully')
    );
  } catch (error) {
    console.error('Approve monthly stay error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to approve monthly stay', null, error.message)
    );
  }
});

// Revoke monthly stay option
router.put('/properties/:id/revoke-monthly', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE properties SET monthly_approved = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    clearPropertiesCache();

    res.json(
      formatResponse(true, 'Monthly rent stay revoked successfully')
    );
  } catch (error) {
    console.error('Revoke monthly stay error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to revoke monthly stay', null, error.message)
    );
  }
});

// =============================================
// DISPLAY CATEGORIES MANAGEMENT
// =============================================

// Get all display categories
router.get('/display-categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT dc.*, COUNT(DISTINCT dcp.property_id) as property_count
      FROM display_categories dc
      LEFT JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
      LEFT JOIN properties p ON dcp.property_id = p.id AND p.status = 'active'
      GROUP BY dc.id
      ORDER BY dc.sort_order ASC, dc.name ASC
    `);

    res.json(
      formatResponse(true, 'Display categories retrieved successfully', { categories })
    );

  } catch (error) {
    console.error('Get display categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve display categories', null, error.message)
    );
  }
});

// Create new display category
router.post('/display-categories', async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if category already exists
    const [existing] = await pool.execute(
      'SELECT id FROM display_categories WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Display category with this name already exists')
      );
    }

    // Create category
    const [result] = await pool.execute(
      'INSERT INTO display_categories (name, description, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, description || null, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    const categoryId = result.insertId;

    // Get created category
    const [newCategory] = await pool.execute(
      'SELECT * FROM display_categories WHERE id = ?',
      [categoryId]
    );

    res.status(201).json(
      formatResponse(true, 'Display category created successfully', { category: newCategory[0] })
    );

  } catch (error) {
    console.error('Create display category error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create display category', null, error.message)
    );
  }
});

// Update display category
router.put('/display-categories/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT id FROM display_categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Check if name already exists (excluding current category)
    const [nameExists] = await pool.execute(
      'SELECT id FROM display_categories WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameExists.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Display category with this name already exists')
      );
    }

    // Convert is_active boolean to 1 or 0 for MySQL
    const isActiveValue = is_active !== undefined ? (is_active === true || is_active === 1 || is_active === '1' ? 1 : 0) : 1;

    // Update category
    const [result] = await pool.execute(
      'UPDATE display_categories SET name = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name, description || null, sort_order || 0, isActiveValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Get updated category
    const [updatedCategory] = await pool.execute(
      'SELECT * FROM display_categories WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Display category updated successfully', { category: updatedCategory[0] })
    );

  } catch (error) {
    console.error('Update display category error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update display category', null, error.message)
    );
  }
});

// Delete display category
router.delete('/display-categories/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT id FROM display_categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Check if category is being used by any properties
    const [properties] = await pool.execute(
      'SELECT COUNT(*) as count FROM properties WHERE display_category_id = ?',
      [id]
    );

    if (properties[0].count > 0) {
      return res.status(409).json(
        formatResponse(false, 'Cannot delete display category. It is being used by properties.')
      );
    }

    // Delete category
    const [result] = await pool.execute(
      'DELETE FROM display_categories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    res.json(
      formatResponse(true, 'Display category deleted successfully')
    );

  } catch (error) {
    console.error('Delete display category error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete display category', null, error.message)
    );
  }
});

// Get properties by display category (using junction table)
router.get('/display-categories/:id/properties', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Check if category exists
    const [category] = await pool.execute(
      'SELECT * FROM display_categories WHERE id = ? AND is_active = 1',
      [id]
    );

    if (category.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found or inactive')
      );
    }

    // Get properties for this category using junction table
    const [properties] = await pool.execute(`
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND image_type = 'main' LIMIT 1) as main_image_url,
        (SELECT AVG(rating) FROM reviews WHERE property_id = p.id AND status = 'approved') as average_rating
      FROM properties p
      INNER JOIN display_category_properties dcp ON p.id = dcp.property_id
      WHERE dcp.display_category_id = ? 
        AND p.status = 'active'
      ORDER BY dcp.created_at DESC
      LIMIT ?
    `, [id, limit]);

    // Get amenities and images for each property
    for (let property of properties) {
      const [amenities] = await pool.execute(`
        SELECT a.id, a.name, a.icon, a.category
        FROM amenities a
        JOIN property_amenities pa ON a.id = pa.amenity_id
        WHERE pa.property_id = ? AND a.is_active = 1
        ORDER BY a.category, a.name
      `, [property.id]);
      property.amenities = amenities;

      // Get all images for the property
      const [allImages] = await pool.execute(`
        SELECT image_url, alt_text, image_type, sort_order
        FROM property_images
        WHERE property_id = ? AND is_active = 1
        ORDER BY 
          CASE WHEN image_type = 'main' THEN 0 ELSE 1 END,
          sort_order
        LIMIT 10
      `, [property.id]);

      property.images = allImages;

      // Set main_image for backward compatibility
      const mainImage = allImages.find(img => img.image_type === 'main') || allImages[0];
      property.main_image = mainImage || null;
    }

    res.json(
      formatResponse(true, 'Properties retrieved successfully', {
        category: category[0],
        properties
      })
    );

  } catch (error) {
    console.error('Get category properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve properties', null, error.message)
    );
  }
});

// Assign properties to display category
router.post('/display-categories/:id/assign-properties', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { property_ids } = req.body;

    // Validate input
    if (!Array.isArray(property_ids)) {
      return res.status(400).json(
        formatResponse(false, 'property_ids must be an array')
      );
    }

    // Check if category exists
    const [category] = await pool.execute(
      'SELECT id FROM display_categories WHERE id = ?',
      [id]
    );

    if (category.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Display category not found')
      );
    }

    // Validate all property IDs exist
    if (property_ids.length > 0) {
      const placeholders = property_ids.map(() => '?').join(',');
      const [properties] = await pool.execute(
        `SELECT id FROM properties WHERE id IN (${placeholders})`,
        property_ids
      );

      if (properties.length !== property_ids.length) {
        return res.status(400).json(
          formatResponse(false, 'One or more property IDs are invalid')
        );
      }
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove all existing assignments for this category
      await connection.execute(
        'DELETE FROM display_category_properties WHERE display_category_id = ?',
        [id]
      );

      // Insert new assignments
      if (property_ids.length > 0) {
        const values = property_ids.map(propertyId => [id, propertyId]);
        await connection.query(
          'INSERT INTO display_category_properties (display_category_id, property_id) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      connection.release();

      res.json(
        formatResponse(true, 'Properties assigned successfully', {
          assigned_count: property_ids.length
        })
      );

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Assign properties error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to assign properties', null, error.message)
    );
  }
});

// Get property's display categories
router.get('/properties/:id/display-categories', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const [property] = await pool.execute(
      'SELECT id FROM properties WHERE id = ?',
      [id]
    );

    if (property.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Get categories assigned to this property
    const [categories] = await pool.execute(`
      SELECT dc.id, dc.name, dc.description, dc.is_active, dc.sort_order
      FROM display_categories dc
      INNER JOIN display_category_properties dcp ON dc.id = dcp.display_category_id
      WHERE dcp.property_id = ?
      ORDER BY dc.sort_order ASC, dc.name ASC
    `, [id]);

    res.json(
      formatResponse(true, 'Property categories retrieved successfully', {
        categories
      })
    );

  } catch (error) {
    console.error('Get property categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property categories', null, error.message)
    );
  }
});

// Assign property to display categories
router.post('/properties/:id/assign-categories', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_ids } = req.body;

    // Validate input
    if (!Array.isArray(category_ids)) {
      return res.status(400).json(
        formatResponse(false, 'category_ids must be an array')
      );
    }

    // Check if property exists
    const [property] = await pool.execute(
      'SELECT id FROM properties WHERE id = ?',
      [id]
    );

    if (property.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property not found')
      );
    }

    // Validate all category IDs exist
    if (category_ids.length > 0) {
      const placeholders = category_ids.map(() => '?').join(',');
      const [categories] = await pool.execute(
        `SELECT id FROM display_categories WHERE id IN (${placeholders})`,
        category_ids
      );

      if (categories.length !== category_ids.length) {
        return res.status(400).json(
          formatResponse(false, 'One or more category IDs are invalid')
        );
      }
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove all existing assignments for this property
      await connection.execute(
        'DELETE FROM display_category_properties WHERE property_id = ?',
        [id]
      );

      // Insert new assignments
      if (category_ids.length > 0) {
        const values = category_ids.map(categoryId => [categoryId, id]);
        await connection.query(
          'INSERT INTO display_category_properties (display_category_id, property_id) VALUES ?',
          [values]
        );
      }

      await connection.commit();
      connection.release();

      res.json(
        formatResponse(true, 'Property assigned to categories successfully', {
          assigned_count: category_ids.length
        })
      );

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Assign property categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to assign categories', null, error.message)
    );
  }
});

// =============================================
// AMENITIES MANAGEMENT
// =============================================

// Get all amenities
router.get('/amenities', async (req, res) => {
  try {
    const [amenities] = await pool.execute(`
      SELECT id, name, icon, category, is_active, created_at
      FROM amenities
      ORDER BY category, name
    `);

    res.json(
      formatResponse(true, 'Amenities retrieved successfully', { amenities })
    );

  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve amenities', null, error.message)
    );
  }
});

// Create new amenity
router.post('/amenities', async (req, res) => {
  try {
    const { name, icon, category } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json(
        formatResponse(false, 'Name and category are required')
      );
    }

    // Validate category
    const validCategories = ['basic', 'safety', 'entertainment', 'kitchen', 'bathroom', 'outdoor', 'accessibility'];
    if (!validCategories.includes(category)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid category')
      );
    }

    // Check if amenity already exists
    const [existing] = await pool.execute(
      'SELECT id FROM amenities WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Amenity with this name already exists')
      );
    }

    // Create amenity
    const [result] = await pool.execute(
      'INSERT INTO amenities (name, icon, category, created_at) VALUES (?, ?, ?, NOW())',
      [name, icon || null, category]
    );

    const amenityId = result.insertId;

    // Get created amenity
    const [newAmenity] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ?',
      [amenityId]
    );

    res.status(201).json(
      formatResponse(true, 'Amenity created successfully', { amenity: newAmenity[0] })
    );

  } catch (error) {
    console.error('Create amenity error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create amenity', null, error.message)
    );
  }
});

// Update amenity
router.put('/amenities/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, category, is_active } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json(
        formatResponse(false, 'Name and category are required')
      );
    }

    // Validate category
    const validCategories = ['basic', 'safety', 'entertainment', 'kitchen', 'bathroom', 'outdoor', 'accessibility'];
    if (!validCategories.includes(category)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid category')
      );
    }

    // Check if amenity exists
    const [existing] = await pool.execute(
      'SELECT id FROM amenities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    // Check if name already exists (excluding current amenity)
    const [nameExists] = await pool.execute(
      'SELECT id FROM amenities WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameExists.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Amenity with this name already exists')
      );
    }

    // Update amenity
    // Convert is_active boolean to 1 or 0 for MySQL
    const isActiveValue = is_active !== undefined ? (is_active === true || is_active === 1 || is_active === '1' ? 1 : 0) : 1;

    const [result] = await pool.execute(
      'UPDATE amenities SET name = ?, icon = ?, category = ?, is_active = ? WHERE id = ?',
      [name, icon || null, category, isActiveValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    // Get updated amenity
    const [updatedAmenity] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ?',
      [id]
    );

    res.json(
      formatResponse(true, 'Amenity updated successfully', { amenity: updatedAmenity[0] })
    );

  } catch (error) {
    console.error('Update amenity error:', error);
    console.error('Error details:', {
      message: error.message,
      sql: error.sql,
      code: error.code,
      errno: error.errno
    });
    res.status(500).json(
      formatResponse(false, 'Failed to update amenity', null, error.message || 'Unknown error occurred')
    );
  }
});

// Delete amenity
router.delete('/amenities/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if amenity exists
    const [existing] = await pool.execute(
      'SELECT id FROM amenities WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    // Check if amenity is being used by any properties
    const [usage] = await pool.execute(
      'SELECT COUNT(*) as count FROM property_amenities WHERE amenity_id = ?',
      [id]
    );

    if (usage[0].count > 0) {
      return res.status(400).json(
        formatResponse(false, 'Cannot delete amenity. It is being used by properties.')
      );
    }

    // Delete amenity
    const [result] = await pool.execute(
      'DELETE FROM amenities WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    res.json(
      formatResponse(true, 'Amenity deleted successfully')
    );

  } catch (error) {
    console.error('Delete amenity error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete amenity', null, error.message)
    );
  }
});

// Toggle amenity status
router.patch('/amenities/:id/toggle', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json(
        formatResponse(false, 'is_active must be a boolean value')
      );
    }

    // Update amenity status
    const [result] = await pool.execute(
      'UPDATE amenities SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Amenity not found')
      );
    }

    res.json(
      formatResponse(true, `Amenity ${is_active ? 'activated' : 'deactivated'} successfully`)
    );

  } catch (error) {
    console.error('Toggle amenity status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update amenity status', null, error.message)
    );
  }
});

// =============================================
// PROPERTY TYPES MANAGEMENT
// =============================================

// Get all property types
router.get('/property-types', async (req, res) => {
  try {
    // Ensure icon_url column exists
    try {
      await pool.execute(`ALTER TABLE property_types ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500) NULL`);
    } catch (e) { /* ignore */ }

    // Auto-seed is only done in the public list endpoint when the table is completely empty.
    // Do NOT re-seed here — admin may have renamed or deleted types intentionally.
    const [propertyTypes] = await pool.execute(`
      SELECT 
        pt.id, 
        pt.name, 
        pt.description, 
        pt.sort_order, 
        pt.is_active,
        pt.icon_url,
        pt.created_at, 
        pt.updated_at,
        (
          SELECT COUNT(*) 
          FROM properties p 
          WHERE LOWER(p.property_type) COLLATE utf8mb4_unicode_ci = LOWER(pt.name) COLLATE utf8mb4_unicode_ci
        ) as property_count
      FROM property_types pt
      ORDER BY pt.sort_order ASC, pt.name ASC
    `);

    res.json(
      formatResponse(true, 'Property types retrieved successfully', { propertyTypes })
    );

  } catch (error) {
    console.error('Get property types error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve property types', null, error.message)
    );
  }
});

// Create new property type
router.post('/property-types', async (req, res) => {
  try {
    const { name, description, sort_order, icon_url } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if property type already exists
    const [existing] = await pool.execute(
      'SELECT id FROM property_types WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Property type with this name already exists')
      );
    }

    // Try to ensure icon_url column exists
    try {
      await pool.execute(`ALTER TABLE property_types ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500) NULL`);
    } catch (e) {
      // Column may already exist or DB doesn't support IF NOT EXISTS - ignore
    }

    // Create property type
    let result;
    try {
      [result] = await pool.execute(
        'INSERT INTO property_types (name, description, sort_order, icon_url, created_at) VALUES (?, ?, ?, ?, NOW())',
        [name, description || null, sort_order || 0, icon_url || null]
      );
    } catch (e) {
      // Fallback if icon_url column doesn't exist
      [result] = await pool.execute(
        'INSERT INTO property_types (name, description, sort_order, created_at) VALUES (?, ?, ?, NOW())',
        [name, description || null, sort_order || 0]
      );
    }

    const propertyTypeId = result.insertId;

    // Get created property type
    const [newPropertyType] = await pool.execute(
      'SELECT * FROM property_types WHERE id = ?',
      [propertyTypeId]
    );

    // ✅ Clear cache so frontend sees new tab immediately
    clearPropertyTypesCache();

    res.status(201).json(
      formatResponse(true, 'Property type created successfully', { propertyType: newPropertyType[0] })
    );

  } catch (error) {
    console.error('Create property type error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create property type', null, error.message)
    );
  }
});

// Update property type
router.put('/property-types/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active, icon_url } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json(
        formatResponse(false, 'Name is required')
      );
    }

    // Check if property type exists
    const [existing] = await pool.execute(
      'SELECT id FROM property_types WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // Check if name already exists (excluding current property type)
    const [nameExists] = await pool.execute(
      'SELECT id FROM property_types WHERE name = ? AND id != ?',
      [name, id]
    );

    if (nameExists.length > 0) {
      return res.status(409).json(
        formatResponse(false, 'Property type with this name already exists')
      );
    }

    // Ensure icon_url column exists
    try {
      await pool.execute(`ALTER TABLE property_types ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500) NULL`);
    } catch (e) {
      // Ignore - column may already exist
    }

    // Update property type
    const isActiveValue = is_active !== undefined ? (is_active === true || is_active === 1 || is_active === '1' ? 1 : 0) : 1;

    try {
      await pool.execute(
        'UPDATE property_types SET name = ?, description = ?, sort_order = ?, is_active = ?, icon_url = ? WHERE id = ?',
        [name, description || null, sort_order || 0, isActiveValue, icon_url || null, id]
      );
    } catch (e) {
      // Fallback without icon_url
      await pool.execute(
        'UPDATE property_types SET name = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?',
        [name, description || null, sort_order || 0, isActiveValue, id]
      );
    }

    // Get updated property type
    const [updatedPropertyType] = await pool.execute(
      'SELECT * FROM property_types WHERE id = ?',
      [id]
    );

    // ✅ Clear cache so frontend sees changes immediately
    clearPropertyTypesCache();

    res.json(
      formatResponse(true, 'Property type updated successfully', { propertyType: updatedPropertyType[0] })
    );

  } catch (error) {
    console.error('Update property type error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property type', null, error.message)
    );
  }
});

// Delete property type
router.delete('/property-types/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property type exists
    const [existing] = await pool.execute(
      'SELECT id FROM property_types WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // Check if property type is being used by any properties (collation-safe)
    const [usage] = await pool.execute(
      `
        SELECT COUNT(*) as count 
        FROM properties p 
        WHERE LOWER(p.property_type) COLLATE utf8mb4_unicode_ci = (
          SELECT LOWER(name) COLLATE utf8mb4_unicode_ci FROM property_types WHERE id = ?
        )
      `,
      [id]
    );

    if (usage[0].count > 0) {
      return res.status(400).json(
        formatResponse(false, 'Cannot delete property type. It is being used by properties.')
      );
    }

    // Delete property type
    const [result] = await pool.execute(
      'DELETE FROM property_types WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // ✅ Clear cache so frontend sees deletion immediately
    clearPropertyTypesCache();

    res.json(
      formatResponse(true, 'Property type deleted successfully')
    );

  } catch (error) {
    console.error('Delete property type error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete property type', null, error.message)
    );
  }
});

// Toggle property type status
router.patch('/property-types/:id/toggle', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json(
        formatResponse(false, 'is_active must be a boolean value')
      );
    }

    // Update property type status
    const [result] = await pool.execute(
      'UPDATE property_types SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(
        formatResponse(false, 'Property type not found')
      );
    }

    // ✅ Instantly clear cached property types so frontend sees changes immediately
    clearPropertyTypesCache();

    res.json(
      formatResponse(true, `Property type ${is_active ? 'activated' : 'deactivated'} successfully`)
    );

  } catch (error) {
    console.error('Toggle property type status error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update property type status', null, error.message)
    );
  }
});

// Get all system settings
router.get('/settings', async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value, setting_type, description, is_public
      FROM system_settings
      ORDER BY setting_key
    `);

    // Convert array to object for easier frontend usage
    const settingsObj = {};
    settings.forEach(setting => {
      let value = setting.setting_value;

      // Convert value based on type
      if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = value;
        }
      }

      settingsObj[setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
        is_public: setting.is_public
      };
    });

    res.json(
      formatResponse(true, 'Settings retrieved successfully', settingsObj)
    );

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve settings', null, error.message)
    );
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json(
        formatResponse(false, 'Settings object is required')
      );
    }

    const updatePromises = [];

    for (const [key, settingData] of Object.entries(settings)) {
      let value = settingData.value;

      // Convert value to string for database storage
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        value = value.toString();
      } else if (typeof value === 'number') {
        value = value.toString();
      }

      updatePromises.push(
        pool.execute(`
          INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          updated_at = NOW()
        `, [
          key,
          value,
          settingData.type || 'string',
          settingData.description || '',
          settingData.is_public || false
        ])
      );
    }

    await Promise.all(updatePromises);

    res.json(
      formatResponse(true, 'Settings updated successfully')
    );

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update settings', null, error.message)
    );
  }
});

// Get public settings (for non-admin users) - No authentication required
router.get('/settings/public', async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value, setting_type
      FROM system_settings
      WHERE is_public = TRUE
      ORDER BY setting_key
    `);

    // Convert array to object for easier frontend usage
    const settingsObj = {};
    settings.forEach(setting => {
      let value = setting.setting_value;

      // Convert value based on type
      if (setting.setting_type === 'number') {
        value = parseFloat(value);
      } else if (setting.setting_type === 'boolean') {
        value = value === 'true';
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = value;
        }
      }

      settingsObj[setting.setting_key] = value;
    });

    res.json(
      formatResponse(true, 'Public settings retrieved successfully', settingsObj)
    );

  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve public settings', null, error.message)
    );
  }
});

// Get admin analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30', startDate, endDate } = req.query;
    const days = parseInt(period) || 30;

    let dateWhere = '';
    const topPropsParams = [];

    if (startDate && endDate) {
      dateWhere = 'AND DATE(b.created_at) BETWEEN ? AND ?';
      topPropsParams.push(startDate, endDate);
    } else {
      dateWhere = 'AND b.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      topPropsParams.push(days);
    }

    // Get basic statistics
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_users,
        COUNT(CASE WHEN user_type = 'guest' THEN 1 END) as guests,
        COUNT(CASE WHEN user_type = 'property_owner' THEN 1 END) as property_owners
      FROM users
      WHERE is_active = 1
    `, [days]);

    const [propertyStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_properties,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_properties,
        COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_properties
      FROM properties
    `, [days]);

    const [bookingStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND status != 'cancelled' THEN 1 END) as new_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN total_amount ELSE 0 END) as total_revenue
      FROM bookings
      WHERE status != 'cancelled'
    `, [days]);

    const [reviewStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_reviews,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reviews,
        AVG(rating) as average_rating
      FROM reviews
    `, [days]);

    // Get Top Properties
    const [topProperties] = await pool.execute(`
      SELECT 
        p.id, p.title, p.city, 
        COUNT(b.id) as total_bookings, 
        COALESCE(SUM(b.total_amount), 0) as total_revenue
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id AND b.status != 'cancelled'
        ${dateWhere}
      GROUP BY p.id, p.title, p.city
      ORDER BY total_revenue DESC
      LIMIT 5
    `, topPropsParams);

    // Get Recent Activity
    const [recentActivity] = await pool.execute(`
      SELECT description, timestamp, type FROM (
        (SELECT 
          CONCAT('New booking #', b.booking_reference) as description,
          b.created_at as timestamp,
          'booking' as type
        FROM bookings b
        WHERE b.status != 'cancelled'
        ORDER BY b.created_at DESC LIMIT 5)
        UNION ALL
        (SELECT 
          CONCAT('New review for ', p.title) as description,
          r.created_at as timestamp,
          'review' as type
        FROM reviews r
        JOIN properties p ON r.property_id = p.id
        ORDER BY r.created_at DESC LIMIT 5)
      ) as combined
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    // Format timestamps for activity
    const formattedActivity = recentActivity.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleString()
    }));

    // Calculate Charts
    const [dailyData] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b %d') as date_formatted,
        DATE(created_at) as raw_date,
        COUNT(id) as count,
        COALESCE(SUM(total_amount), 0) as amount
      FROM bookings
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND status != 'cancelled' AND payment_status = 'paid'
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
      ORDER BY raw_date ASC
    `, [days]);

    const revenueChart = dailyData.map(d => ({ date: d.date_formatted, amount: parseFloat(d.amount) }));

    // Calculate User Growth Chart
    const [userData] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b %d') as date_formatted,
        DATE(created_at) as raw_date,
        COUNT(id) as count
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
      ORDER BY raw_date ASC
    `, [days]);

    const userChart = userData.map(d => ({ date: d.date_formatted, count: parseInt(d.count) }));

    res.json(
      formatResponse(true, 'Analytics retrieved successfully', {
        users: userStats[0],
        properties: propertyStats[0],
        bookings: bookingStats[0],
        reviews: reviewStats[0],
        period: days,
        topProperties: topProperties,
        recentActivity: formattedActivity,
        revenueChart,
        userChart
      })
    );



  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve analytics', null, error.message)
    );
  }
});

// Get booking payment history
router.get('/bookings/:id/payments', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const [bookings] = await pool.execute(`
      SELECT id FROM bookings WHERE id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json(
        formatResponse(false, 'Booking not found')
      );
    }

    // Get payment history with DR/CR
    const [payments] = await pool.execute(`
      SELECT 
        id, payment_reference, payment_method, payment_type,
        amount, dr_amount, cr_amount, transaction_type, notes,
        status, payment_date, created_at
      FROM payments
      WHERE booking_id = ?
      ORDER BY created_at ASC
    `, [id]);

    // Calculate running balance for each transaction
    let runningBalance = 0;
    const paymentsWithBalance = payments.map(payment => {
      runningBalance += (parseFloat(payment.dr_amount || 0) - parseFloat(payment.cr_amount || 0));
      return {
        ...payment,
        running_balance: runningBalance
      };
    });

    res.json(
      formatResponse(true, 'Payment history retrieved successfully', {
        payments: paymentsWithBalance
      })
    );

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve payment history', null, error.message)
    );
  }
});

// Get accounting ledger with DR/CR
router.get('/accounting/ledger', async (req, res) => {
  try {
    const { view = 'all', entity_id, start_date, end_date } = req.query;

    let whereConditions = ['1=1'];
    let queryParams = [];

    // Date range filter
    if (start_date) {
      whereConditions.push('p.created_at >= ?');
      queryParams.push(start_date);
    }
    if (end_date) {
      whereConditions.push('p.created_at <= ?');
      queryParams.push(end_date + ' 23:59:59');
    }

    // Entity filter
    if (view === 'owner' && entity_id) {
      whereConditions.push('(po.user_id = ? OR po.id = ?)');
      queryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      whereConditions.push('b.guest_id = ?');
      queryParams.push(entity_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get all transactions
    const [transactions] = await pool.execute(`
      SELECT 
        p.id, p.payment_reference, p.amount,
        p.dr_amount, p.cr_amount, p.transaction_type, p.notes,
        p.payment_method, p.status, p.created_at,
        b.id as booking_id, b.booking_reference, b.total_amount,
        pr.title as property_title,
        COALESCE(
          NULLIF(NULLIF(b.guest_name, ''), 'undefined undefined'),
          CONCAT(u.first_name, ' ', u.last_name)
        ) as guest_name,
        CONCAT(owner.first_name, ' ', owner.last_name) as owner_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN properties pr ON b.property_id = pr.id
      JOIN users u ON b.guest_id = u.id
      JOIN property_owners po ON pr.owner_id = po.id
      JOIN users owner ON po.user_id = owner.id
      ${whereClause}
        AND b.status != 'cancelled'
      ORDER BY p.created_at ASC
    `, queryParams);

    // Calculate running balance
    let runningBalance = 0;
    const transactionsWithBalance = transactions.map(txn => {
      runningBalance += (parseFloat(txn.dr_amount || 0) - parseFloat(txn.cr_amount || 0));
      return {
        ...txn,
        running_balance: runningBalance
      };
    });

    // Calculate summary
    const totalDR = transactions.reduce((sum, txn) => sum + parseFloat(txn.dr_amount || 0), 0);
    const totalCR = transactions.reduce((sum, txn) => sum + parseFloat(txn.cr_amount || 0), 0);
    const totalGuestPayments = transactions
      .filter(txn => ['guest_payment', 'payment', 'security_deposit_claim'].includes(txn.transaction_type))
      .reduce((sum, txn) => sum + parseFloat(txn.cr_amount || 0), 0);
    const pendingGuestPayments = totalDR - totalGuestPayments;
    const outstanding = totalDR - totalCR;

    const uniqueBookings = new Set(transactions.map(txn => txn.booking_id));

    // Get admin commission summary
    const commissionQueryParams = [];
    const commissionWhereClause = ['ae.status = ?'];
    commissionQueryParams.push('active');

    if (start_date) {
      commissionWhereClause.push('ae.created_at >= ?');
      commissionQueryParams.push(start_date);
    }
    if (end_date) {
      commissionWhereClause.push('ae.created_at <= ?');
      commissionQueryParams.push(end_date + ' 23:59:59');
    }

    let commissionJoin = '';
    if (view === 'owner' && entity_id) {
      commissionJoin = 'JOIN properties pr ON b.property_id = pr.id JOIN property_owners po ON pr.owner_id = po.id';
      commissionWhereClause.push('(po.user_id = ? OR po.id = ?)');
      commissionQueryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      commissionWhereClause.push('b.guest_id = ?');
      commissionQueryParams.push(entity_id);
    }

    const [commissionSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(ae.commission_amount), 0) as total_commission_earned,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.net_commission ELSE 0 END), 0) as commission_paid,
        COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.net_commission ELSE 0 END), 0) as commission_pending
      FROM admin_earnings ae
      JOIN bookings b ON ae.booking_id = b.id
      ${commissionJoin}
      WHERE ${commissionWhereClause.join(' AND ')}
        AND b.status != 'cancelled' AND b.payment_status = 'paid'
    `, commissionQueryParams);

    // Get owner earnings summary directly from paid bookings
    const ownerEarningsQueryParams = [];
    const ownerEarningsWhereClause = [
      "b.status != 'cancelled'",
      "b.payment_status = 'paid'",
      "(b.payment_method IN ('sslcommerz', 'bkash', 'nagad', 'online', 'bank_transfer') OR b.booking_source = 'website' OR b.source = 'Internal')"
    ];

    if (start_date) {
      ownerEarningsWhereClause.push('b.created_at >= ?');
      ownerEarningsQueryParams.push(start_date);
    }
    if (end_date) {
      ownerEarningsWhereClause.push('b.created_at <= ?');
      ownerEarningsQueryParams.push(end_date + ' 23:59:59');
    }

    let ownerEarningsJoin = 'JOIN properties pr ON b.property_id = pr.id JOIN property_owners po ON pr.owner_id = po.id';
    if (view === 'owner' && entity_id) {
      ownerEarningsWhereClause.push('(po.user_id = ? OR po.id = ?)');
      ownerEarningsQueryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      ownerEarningsWhereClause.push('b.guest_id = ?');
      ownerEarningsQueryParams.push(entity_id);
    }

    const [ownerEarningsSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(
          b.property_owner_earnings
          - COALESCE((
              SELECT SUM(p.cr_amount) FROM payments p
              WHERE p.booking_id = b.id AND p.status = 'completed'
                AND p.payment_method = 'cash'
                AND p.transaction_type IN ('guest_payment','payment','settlement')
            ), 0)
          - COALESCE((
              SELECT SUM(p_fee.gateway_fee) FROM payments p_fee
              WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed'
            ), 0)
        ), 0) as total_owner_earnings,
        COALESCE(SUM((
            SELECT COALESCE(SUM(p_fee.gateway_fee), 0) FROM payments p_fee
            WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed'
        )), 0) as total_gateway_fees,
        COUNT(DISTINCT b.id) as total_bookings
      FROM bookings b
      ${ownerEarningsJoin}
      WHERE ${ownerEarningsWhereClause.join(' AND ')}
    `, ownerEarningsQueryParams);

    // Get owner payouts summary
    const payoutQueryParams = [];
    const payoutWhereClause = [];

    if (start_date) {
      payoutWhereClause.push('op.created_at >= ?');
      payoutQueryParams.push(start_date);
    }
    if (end_date) {
      payoutWhereClause.push('op.created_at <= ?');
      payoutQueryParams.push(end_date + ' 23:59:59');
    }

    let payoutJoin = '';
    if (view === 'owner' && entity_id) {
      payoutJoin = 'JOIN property_owners po ON op.property_owner_id = po.id';
      payoutWhereClause.push('(po.user_id = ? OR po.id = ?)');
      payoutQueryParams.push(entity_id, entity_id);
    } else if (view === 'guest' && entity_id) {
      payoutWhereClause.push('1=0');
    }

    const payoutWhereClauseStr = payoutWhereClause.length > 0 ? `WHERE ${payoutWhereClause.join(' AND ')}` : '';

    const [ownerPayoutsSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(op.net_payout), 0) as total_payouts,
        COALESCE(SUM(CASE WHEN op.payment_status = 'completed' THEN op.net_payout ELSE 0 END), 0) as completed_payouts,
        COALESCE(SUM(CASE WHEN op.payment_status IN ('pending', 'processing') THEN op.net_payout ELSE 0 END), 0) as pending_payouts
      FROM owner_payouts op
      ${payoutJoin}
      ${payoutWhereClauseStr}
    `, payoutQueryParams);

    // Calculate owner outstanding = total owner share - what's already paid/in-progress
    const totalOwnerEarnings = parseFloat(ownerEarningsSummary[0]?.total_owner_earnings || 0);
    const totalPaidToOwners = parseFloat(ownerPayoutsSummary[0]?.completed_payouts || 0);
    const totalPendingPayouts = parseFloat(ownerPayoutsSummary[0]?.pending_payouts || 0);
    const computedOwnerOutstanding = Math.max(totalOwnerEarnings - totalPaidToOwners - totalPendingPayouts, 0);

    // Dummy ownerOutstandingSummary for compatibility
    const ownerOutstandingSummary = [{ total_outstanding: computedOwnerOutstanding, total_commission_pending: 0, total_owners: 0 }];

    res.json(
      formatResponse(true, 'Ledger retrieved successfully', {
        transactions: transactionsWithBalance,
        summary: {
          total_dr: totalDR,
          total_cr: totalCR,
          total_guest_payments: totalGuestPayments,
          pending_guest_payments: pendingGuestPayments,
          outstanding: outstanding,
          total_bookings: uniqueBookings.size,
          // New summary fields
          total_commission_earned: parseFloat(commissionSummary[0]?.total_commission_earned || 0),
          commission_paid: parseFloat(commissionSummary[0]?.commission_paid || 0),
          commission_pending: parseFloat(commissionSummary[0]?.commission_pending || 0),
          total_owner_earnings: parseFloat(ownerEarningsSummary[0]?.total_owner_earnings || 0),
          total_gateway_fees: parseFloat(ownerEarningsSummary[0]?.total_gateway_fees || 0),
          total_payouts_to_owners: parseFloat(ownerPayoutsSummary[0]?.completed_payouts || 0),
          pending_payouts_to_owners: parseFloat(ownerPayoutsSummary[0]?.pending_payouts || 0),
          total_owner_outstanding: parseFloat(ownerOutstandingSummary[0]?.total_outstanding || 0)
        }
      })
    );

  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve ledger', null, error.message)
    );
  }
});

// Get owner-wise accounting summary
router.get('/accounting/owners', async (req, res) => {
  try {
    const [ownerSummary] = await pool.execute(`
      SELECT 
        po.id, po.business_name,
        CONCAT(u.first_name, ' ', u.last_name) as owner_name,
        u.email,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.total_amount) as total_revenue,
        COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          JOIN bookings bk ON p.booking_id = bk.id
          JOIN properties pr ON bk.property_id = pr.id
          WHERE pr.owner_id = po.id AND bk.status != 'cancelled'
        ), 0) as total_received,
        (SUM(b.total_amount) - COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          JOIN bookings bk ON p.booking_id = bk.id
          JOIN properties pr ON bk.property_id = pr.id
          WHERE pr.owner_id = po.id AND bk.status != 'cancelled'
        ), 0)) as outstanding
      FROM property_owners po
      JOIN users u ON po.user_id = u.id
      LEFT JOIN properties pr ON pr.owner_id = po.id
      LEFT JOIN bookings b ON b.property_id = pr.id AND b.status IN ('confirmed', 'checked_in', 'checked_out') AND b.status != 'cancelled' AND b.payment_status = 'paid'
      GROUP BY po.id, po.business_name, u.first_name, u.last_name, u.email
      ORDER BY total_revenue DESC
    `);

    res.json(
      formatResponse(true, 'Owner accounting summary retrieved successfully', {
        owners: ownerSummary
      })
    );

  } catch (error) {
    console.error('Get owner accounting error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve owner accounting', null, error.message)
    );
  }
});

// Get guest-wise accounting summary
router.get('/accounting/guests', async (req, res) => {
  try {
    const [guestSummary] = await pool.execute(`
      SELECT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) as guest_name,
        u.email,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_spent,
        COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          WHERE p.booking_id IN (SELECT id FROM bookings WHERE guest_id = u.id AND status != 'cancelled')
        ), 0) as total_paid,
        (SUM(b.total_amount) - COALESCE((
          SELECT SUM(cr_amount)
          FROM payments p
          WHERE p.booking_id IN (SELECT id FROM bookings WHERE guest_id = u.id AND status != 'cancelled')
        ), 0)) as outstanding
      FROM users u
      JOIN bookings b ON b.guest_id = u.id
      WHERE u.user_type = 'guest' AND b.status != 'cancelled'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY total_spent DESC
    `);

    res.json(
      formatResponse(true, 'Guest accounting summary retrieved successfully', {
        guests: guestSummary
      })
    );

  } catch (error) {
    console.error('Get guest accounting error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve guest accounting', null, error.message)
    );
  }
});

// Use earnings routes
router.use('/earnings', earningsRoutes);

// Use owner payout routes
router.use('/owner-payouts', ownerPayoutRoutes);

// =============================================
// REFUND MANAGEMENT
// =============================================

// Get all refund requests
router.get('/refunds', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(b.booking_reference LIKE ? OR u.first_name LIKE ? OR p.title LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get refunds
    const [refunds] = await pool.execute(`
      SELECT 
        r.*,
        b.booking_reference, b.total_amount as booking_total,
        u.first_name as guest_first_name, u.last_name as guest_last_name, u.email as guest_email,
        p.title as property_title
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      ${whereClause}
      ORDER BY r.requested_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    res.json(
      formatResponse(true, 'Refund requests retrieved successfully', {
        refunds,
        pagination: generatePagination(parseInt(page), parseInt(limit), total)
      })
    );

  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve refund requests', null, error.message));
  }
});

// Approve refund
router.patch('/refunds/:id/approve', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get refund details and payment info
    const [refunds] = await pool.execute(`
      SELECT r.*, p.gateway_transaction_id, p.bank_tran_id, p.payment_method 
      FROM refunds r
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE r.id = ?
    `, [id]);

    if (refunds.length === 0) return res.status(404).json(formatResponse(false, 'Refund record not found'));
    
    const refund = refunds[0];
    if (refund.status !== 'pending') return res.status(400).json(formatResponse(false, 'Only pending refunds can be approved'));
    
    const refundRemarks = notes || refund.refund_reason || 'Admin Approved Refund';
    let gatewayResponseStr = null;
    let newStatus = 'processing';

    // Trigger actual refund via SSLCommerz using official sslcommerz-lts library
    if (refund.payment_method === 'sslcommerz' && refund.gateway_transaction_id) {
      try {
        const [sslConfig] = await pool.execute("SELECT store_id, store_password, is_live FROM payment_settings WHERE provider_name = 'sslcommerz'");
        if (sslConfig.length > 0) {
          const SSLCommerzPayment = require('sslcommerz-lts');
          const config = sslConfig[0];
          const isLive = Boolean(config.is_live);
          const sslcz = new SSLCommerzPayment(config.store_id, config.store_password, isLive);

          const refundData = {
            refund_amount: Number(parseFloat(refund.refund_amount).toFixed(2)),
            refund_remarks: String(refundRemarks).substring(0, 255),
            bank_tran_id: refund.bank_tran_id || refund.gateway_transaction_id,
            refe_id: String(refund.refund_reference).substring(0, 50),
          };

          console.log('--- SSL REFUND CALL (sslcommerz-lts) ---');
          console.log('Store ID:', config.store_id, '| isLive:', isLive);
          console.log('Refund Data:', refundData);

          const refundApiRes = await sslcz.initiateRefund(refundData);
          gatewayResponseStr = JSON.stringify(refundApiRes);
          console.log('SSL Refund Raw Response:', refundApiRes);

          const apiConnect = refundApiRes?.APIConnect || '';

          // Check for IP not whitelisted error
          if (apiConnect.startsWith('REQUEST_FROM_INVALID_SOURCE')) {
            const ip = apiConnect.replace('REQUEST_FROM_INVALID_SOURCE_', '');
            console.error('SSL IP NOT WHITELISTED:', ip);
            return res.status(400).json(formatResponse(false, 
              `SSL Gateway rejected request: Your server IP (${ip}) is not whitelisted. Please whitelist this IP in SSLCommerz panel.`,
              { gatewayResponse: refundApiRes, serverIp: ip }
            ));
          }

          // Check for authentication failure
          if (apiConnect === 'FAILED' || apiConnect === 'INACTIVE') {
            return res.status(400).json(formatResponse(false,
              `SSL Gateway authentication failed (${apiConnect}). Please check Store ID and Password.`,
              { gatewayResponse: refundApiRes }
            ));
          }

          // Check for successful refund initiation (APIConnect === 'DONE')
          if (apiConnect === 'DONE') {
            const refundStatus = refundApiRes?.status || '';
            const errorReason = refundApiRes?.errorReason || '';

            // Handle duplicate request within same minute - refund already submitted
            if (errorReason === 'FAILED_SAME_REQ_IN_SAME_MIN') {
              // Refund was already submitted to SSLCommerz, mark as processing
              newStatus = 'processing';
              console.log('ℹ️ SSL: Duplicate request in same minute - refund already submitted, marking as processing');
            } else if (refundStatus === 'success' || refundStatus === 'refunded') {
              newStatus = 'completed';
            } else if (refundStatus === 'processing') {
              newStatus = 'processing';
            } else if (refundStatus === 'failed') {
              return res.status(400).json(formatResponse(false, `SSL Gateway Error: ${errorReason || 'Refund failed at gateway'}`, { gatewayResponse: refundApiRes }));
            } else {
              // Unknown status but DONE connection - treat as processing
              newStatus = 'processing';
            }
          } else if (apiConnect.startsWith('FAILED_SAME_REQ')) {
            // Some versions return this at APIConnect level
            newStatus = 'processing';
            console.log('ℹ️ SSL: Duplicate request - marking as processing');
          } else {
            // Unrecognized APIConnect response
            return res.status(400).json(formatResponse(false,
              `Unexpected SSL Gateway response: ${apiConnect}`,
              { gatewayResponse: refundApiRes }
            ));
          }
        }
      } catch (sslErr) {
        console.error('SSL Refund Exception:', sslErr);
        return res.status(500).json(formatResponse(false, 'SSLCommerz connection error', null, sslErr.message));
      }
    }

    // Trigger actual refund via bKash gateway
    if (refund.payment_method === 'bkash') {
      try {
        const bookingId = refund.booking_id;

        // 1. Get bKash paymentID from payment_initiated row
        const [initiatedRows] = await pool.execute(`
          SELECT gateway_transaction_id FROM payments
          WHERE booking_id = ? AND transaction_type = 'payment_initiated' AND payment_method = 'bkash'
          ORDER BY id DESC LIMIT 1
        `, [bookingId]);

        // 2. Get bKash trxID from guest_payment row (stored in notes or gateway_transaction_id)
        const [guestPayRows] = await pool.execute(`
          SELECT gateway_transaction_id, notes FROM payments
          WHERE booking_id = ? AND transaction_type = 'guest_payment' AND payment_method = 'bkash'
          ORDER BY id DESC LIMIT 1
        `, [bookingId]);

        const bkashPaymentID = initiatedRows[0]?.gateway_transaction_id || null;

        // trxID may be in gateway_transaction_id (new payments) or extracted from notes (old payments)
        let bkashTrxID = guestPayRows[0]?.gateway_transaction_id || null;
        if (!bkashTrxID && guestPayRows[0]?.notes) {
          const match = guestPayRows[0].notes.match(/TXN:([A-Z0-9]+)/i);
          if (match) bkashTrxID = match[1];
        }

        const refundAmount = parseFloat(refund.refund_amount);

        console.log(`[ADMIN-REFUND] bKash — paymentID: ${bkashPaymentID}, trxID: ${bkashTrxID}, amount: ${refundAmount}`);

        if (!bkashPaymentID || !bkashTrxID) {
          console.warn('[ADMIN-REFUND] Missing bKash paymentID or trxID — marking as processing for manual follow-up');
          newStatus = 'processing';
          gatewayResponseStr = JSON.stringify({ error: `Missing bKash IDs — paymentID: ${bkashPaymentID}, trxID: ${bkashTrxID} — manual refund required` });
        } else {
          const bkashRefundResult = await bkashGateway.refundPayment(
            bkashPaymentID,
            refundAmount,
            bkashTrxID,
            refundRemarks
          );

          gatewayResponseStr = JSON.stringify(bkashRefundResult);
          console.log('[ADMIN-REFUND] bKash refund result:', bkashRefundResult);

          if (bkashRefundResult.success) {
            newStatus = 'completed';
          } else {
            return res.status(400).json(formatResponse(
              false,
              `bKash Refund Failed: ${bkashRefundResult.error || 'Unknown error'}`,
              { gatewayResponse: bkashRefundResult }
            ));
          }
        }
      } catch (bkashErr) {
        console.error('[ADMIN-REFUND] bKash refund exception:', bkashErr);
        return res.status(500).json(formatResponse(false, 'bKash refund connection error', null, bkashErr.message));
      }
    }

    // Update refund status in DB (ignoring 'notes' since it does not exist)
    await pool.execute(
      'UPDATE refunds SET status = ?, approved_at = NOW(), refund_reason = ?, gateway_response = ? WHERE id = ?',
      [newStatus, refundRemarks, gatewayResponseStr, id]
    );

    // If completed (auto-refunded), sync to HMS accounts
    if (newStatus === 'completed') {
      try {
        await syncRefundToHMSAccounts(id);
      } catch (hmsErr) {
        console.error('[ADMIN-REFUND] HMS Sync failed on approval:', hmsErr);
      }
      try {
        await sendRefundSms(refund.booking_id, refund.refund_amount, refundRemarks);
      } catch (smsErr) {
        console.error('[ADMIN-REFUND] Failed to send refund SMS on approval:', smsErr.message);
      }
    }

    res.json(formatResponse(true, `Refund ${newStatus === 'completed' ? 'processed' : 'approved'} successfully`));

  } catch (error) {
    console.error('Approve refund error:', error);
    res.status(500).json(formatResponse(false, 'Failed to approve refund', null, error.message));
  }
});

// Mark refund as completed
router.patch('/refunds/:id/complete', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, notes } = req.body;

    // Get refund details
    const [refunds] = await pool.execute('SELECT * FROM refunds WHERE id = ?', [id]);
    if (refunds.length === 0) return res.status(404).json(formatResponse(false, 'Refund record not found'));
    
    const refund = refunds[0];
    if (refund.status !== 'processing') return res.status(400).json(formatResponse(false, 'Only approved/processing refunds can be marked as completed'));

    // Update refund status
    await pool.execute(
      'UPDATE refunds SET status = "completed", completed_at = NOW(), transaction_id = ?, notes = ? WHERE id = ?',
      [transaction_id || null, notes || refund.notes, id]
    );

    // Sync to HMS accounts
    try {
      await syncRefundToHMSAccounts(id);
    } catch (hmsErr) {
      console.error('[ADMIN-REFUND] HMS Sync failed on manual completion:', hmsErr);
    }

    try {
      await sendRefundSms(refund.booking_id, refund.refund_amount, notes || refund.notes || refund.refund_reason);
    } catch (smsErr) {
      console.error('[ADMIN-REFUND] Failed to send refund SMS on manual completion:', smsErr.message);
    }

    res.json(formatResponse(true, 'Refund marked as completed successfully'));

  } catch (error) {
    console.error('Complete refund error:', error);
    res.status(500).json(formatResponse(false, 'Failed to complete refund', null, error.message));
  }
});

// Reject refund
router.patch('/refunds/:id/reject', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get refund details
    const [refunds] = await pool.execute('SELECT * FROM refunds WHERE id = ?', [id]);
    if (refunds.length === 0) return res.status(404).json(formatResponse(false, 'Refund record not found'));
    
    const refund = refunds[0];
    if (refund.status !== 'pending') return res.status(400).json(formatResponse(false, 'Only pending refunds can be rejected'));

    // Update refund status
    await pool.execute(
      'UPDATE refunds SET status = "rejected", notes = ? WHERE id = ?',
      [notes || refund.notes, id]
    );

    res.json(formatResponse(true, 'Refund request rejected'));

  } catch (error) {
    console.error('Reject refund error:', error);
    res.status(500).json(formatResponse(false, 'Failed to reject refund', null, error.message));
  }
});

// Deduct from security deposit and initiate refund
router.post('/bookings/:id/security-deposit-deduction', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { deduction_amount, reason, notes } = req.body;

    // Get booking details
    const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) return res.status(404).json(formatResponse(false, 'Booking not found'));
    
    const booking = bookings[0];
    if (booking.status !== 'checked_out') {
      return res.status(400).json(formatResponse(false, 'Security deposit can only be processed after check-out'));
    }

    const securityDeposit = parseFloat(booking.security_deposit || 0);
    const deduction = parseFloat(deduction_amount || 0);
    
    if (deduction > securityDeposit) {
      return res.status(400).json(formatResponse(false, 'Deduction cannot exceed security deposit amount'));
    }

    const refundAmount = securityDeposit - deduction;

    // Find payment id for refund
    const [payments] = await pool.execute("SELECT id FROM payments WHERE booking_id = ? AND status = 'completed' ORDER BY id DESC LIMIT 1", [id]);
    const paymentId = payments.length > 0 ? payments[0].id : 0;
    const refundRef = `SEC-REF-${Date.now()}-${id}`;

    // Create refund record
    await pool.execute(`
      INSERT INTO refunds (
        booking_id, payment_id, refund_reference, original_amount, refund_amount, net_refund,
        refund_reason, refund_type, cancellation_policy_applied, status, requested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
        id, 
        paymentId, 
        refundRef, 
        securityDeposit, 
        refundAmount, 
        refundAmount, 
        deduction === 0 ? 'Security Deposit Release' : 'Security Deposit Return', 
        deduction === 0 ? 'full' : 'partial',
        deduction === 0 ? `Released. ${notes || ''}` : `Deduction: ৳${deduction}. Reason: ${reason || 'N/A'}. ${notes || ''}`
    ]);

    // Update booking to indicate security deposit processed and increase owner earnings
    const [result] = await pool.execute(
      `UPDATE bookings b
       JOIN properties p ON b.property_id = p.id
       SET b.security_deposit_status = "processed", 
           b.security_deposit_deduction_amount = ?,
           b.property_owner_earnings = b.property_owner_earnings + ?,
           b.updated_at = NOW() 
       WHERE b.id = ?`,
      [deduction, deduction, id]
    );

    if (deduction > 0) {
      // Get owner_id for balance update
      const [bookingDetails] = await pool.execute(`
        SELECT p.owner_id 
        FROM bookings b 
        JOIN properties p ON b.property_id = p.id 
        WHERE b.id = ?
      `, [id]);

      if (bookingDetails.length > 0) {
        const ownerId = bookingDetails[0].owner_id;
        
        // Update owner balance summary
        await pool.execute(`
          UPDATE owner_balances 
          SET total_earnings = total_earnings + ?,
              current_balance = current_balance + ?,
              last_updated = NOW()
          WHERE property_owner_id = ?
        `, [deduction, deduction, ownerId]);

        // Record a payment transaction for transparency
        await pool.execute(`
          INSERT INTO payments (
            booking_id, payment_reference, payment_method, payment_type,
            amount, dr_amount, cr_amount, transaction_type, notes,
            status, payment_date, created_at
          ) VALUES (?, ?, 'adjustment', 'credit', ?, ?, ?, 'security_deposit_claim', ?, 'completed', NOW(), NOW())
        `, [
          id,
          `CLAIM-${id}-${Date.now()}`,
          deduction,
          deduction, // dr_amount: add to guest's debt for the damage
          deduction, // cr_amount: add to host's received amount from deposit
          `Security deposit deduction credit to host: ${reason || 'N/A'}`
        ]);
      }
    }

    res.json(formatResponse(true, 'Security deposit processed successfully', {
      refundableAmount: refundAmount,
      deductionAmount: deduction
    }));

  } catch (error) {
    console.error('Security deposit deduction error:', error);
    res.status(500).json(formatResponse(false, 'Failed to process security deposit deduction', null, error.message));
  }
});

// Get security deposits list
router.get('/security-deposits', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE b.security_deposit > 0 AND b.status = "checked_out"';
    const queryParams = [];

    if (status) {
      whereClause += ' AND b.security_deposit_status = ?';
      queryParams.push(status);
    }

    if (search) {
      whereClause += ' AND (b.booking_reference LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR p.title LIKE ?)';
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    // Get stats
    const [statsResult] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN b.security_deposit_status IN ('pending', 'claim_requested') THEN b.security_deposit ELSE 0 END), 0) as total_held,
        COALESCE(SUM(CASE WHEN b.security_deposit_status = 'claim_requested' THEN 1 ELSE 0 END), 0) as pending_claims,
        COALESCE(SUM(CASE WHEN b.security_deposit_status = 'processed' THEN b.security_deposit_deduction_amount ELSE 0 END), 0) as total_claimed,
        COALESCE(SUM(CASE WHEN b.security_deposit_status = 'processed' THEN b.security_deposit - b.security_deposit_deduction_amount ELSE 0 END), 0) as total_released
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
    `);
    const stats = statsResult[0];

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT b.id) as total
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get security deposits
    const [deposits] = await pool.execute(`
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
      ${whereClause}
      ORDER BY 
        CASE WHEN b.security_deposit_status = 'claim_requested' THEN 1 ELSE 2 END,
        b.security_deposit_claim_at DESC, 
        b.check_out_date DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    res.json(
      formatResponse(true, 'Security deposits retrieved successfully', {
        deposits,
        stats,
        pagination: generatePagination(parseInt(page), parseInt(limit), total)
      })
    );
  } catch (error) {
    console.error('Get security deposits error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve security deposits', null, error.message));
  }
});

// =============================================
// HMS MANAGEMENT
// =============================================

// Get all HMS packages
router.get('/hms/packages', async (req, res) => {
  try {
    const [packages] = await pool.execute('SELECT * FROM hms_packages ORDER BY created_at ASC');
    // Ensure features is parsed JSON
    packages.forEach(pkg => {
      try {
         pkg.features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
      } catch(e) {
         pkg.features = []; 
      }
    });
    res.json(formatResponse(true, 'Packages retrieved successfully', packages));
  } catch (error) {
    console.error('Get packages error', error);
    res.status(500).json(formatResponse(false, 'Failed to get packages', null, error.message));
  }
});

// Create HMS Package
router.post('/hms/packages', async (req, res) => {
  try {
    const { name, price, billing_cycle, is_trial, duration_days, trial_days, features, is_active } = req.body;
    await pool.execute(
      'INSERT INTO hms_packages (name, price, billing_cycle, is_trial, duration_days, trial_days, features, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, billing_cycle || 'monthly', is_trial ? true : false, duration_days || 30, is_trial ? (trial_days || 14) : 0, JSON.stringify(features || []), is_active !== false]
    );
    res.json(formatResponse(true, 'Package created successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to create package', null, error.message));
  }
});

// Update HMS Package
router.put('/hms/packages/:id', async (req, res) => {
  try {
    const { name, price, billing_cycle, is_trial, duration_days, trial_days, features, is_active } = req.body;
    await pool.execute(
      'UPDATE hms_packages SET name=?, price=?, billing_cycle=?, is_trial=?, duration_days=?, trial_days=?, features=?, is_active=? WHERE id=?',
      [name, price, billing_cycle || 'monthly', is_trial ? true : false, duration_days || 30, is_trial ? (trial_days || 14) : 0, JSON.stringify(features || []), is_active !== false, req.params.id]
    );
    res.json(formatResponse(true, 'Package updated successfully'));
  } catch (error) {
    console.error('PUT /hms/packages/:id Error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update package', null, error.message));
  }
});

// Delete HMS Package
router.delete('/hms/packages/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM hms_packages WHERE id=?', [req.params.id]);
    res.json(formatResponse(true, 'Package deleted successfully'));
  } catch (error) {
    res.status(500).json(formatResponse(false, 'Failed to delete package', null, error.message));
  }
});

// Toggle HMS Status manually
router.patch('/hms/toggle', async (req, res) => {
  try {
    const { host_id, status } = req.body;

    if (!['active', 'inactive', 'trialing', 'expired'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Invalid status'));
    }

    let extraUpdates = '';
    let pkgId = null;

    if (status === 'trialing') {
      const [tp] = await pool.execute('SELECT duration_days, id FROM hms_packages WHERE is_trial = true AND is_active = true ORDER BY duration_days DESC LIMIT 1');
      const trialDays = tp.length > 0 ? tp[0].duration_days : 14;
      pkgId = tp.length > 0 ? tp[0].id : null;
      extraUpdates = `, trial_started_at = NOW(), trial_ends_at = DATE_ADD(NOW(), INTERVAL ${trialDays} DAY)`;
    } else if (status === 'active') {
      const [ap] = await pool.execute('SELECT duration_days, id FROM hms_packages WHERE is_trial = false AND is_active = true ORDER BY price ASC LIMIT 1');
      const activeDays = ap.length > 0 ? ap[0].duration_days || 30 : 30;
      pkgId = ap.length > 0 ? ap[0].id : null;
      extraUpdates = `, subscription_ends_at = DATE_ADD(NOW(), INTERVAL ${activeDays} DAY)`;
    }

    if (pkgId) {
       extraUpdates += `, package_id = ${pkgId}`;
    }

    // Insert or update HMS sub
    const [existing] = await pool.execute('SELECT id FROM hms_subscriptions WHERE host_id = ?', [host_id]);
    
    if (existing.length > 0) {
      await pool.execute(
        `UPDATE hms_subscriptions SET status = ? ${extraUpdates} WHERE host_id = ?`,
        [status, host_id]
      );
    } else {
      let q = `INSERT INTO hms_subscriptions (host_id, status) VALUES (?, ?)`;
      if (status === 'trialing') {
         const tDays = extraUpdates.match(/INTERVAL (\d+) DAY/)?.[1] || 14;
         q = `INSERT INTO hms_subscriptions (host_id, status, trial_started_at, trial_ends_at${pkgId ? ', package_id' : ''}) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ${tDays} DAY)${pkgId ? ', ' + pkgId : ''})`;
      } else if (status === 'active') {
         const aDays = extraUpdates.match(/INTERVAL (\d+) DAY/)?.[1] || 30;
         q = `INSERT INTO hms_subscriptions (host_id, status, subscription_ends_at${pkgId ? ', package_id' : ''}) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${aDays} DAY)${pkgId ? ', ' + pkgId : ''})`;
      }
      await pool.execute(q, [host_id, status]);
    }

    // Record order entry if status is active
    if (status === 'active' && pkgId) {
      const [pkgRes] = await pool.execute('SELECT price FROM hms_packages WHERE id = ?', [pkgId]);
      const pkgPrice = pkgRes.length > 0 ? pkgRes[0].price : 0;
      const tranId = `MANUAL-ADMIN-${Date.now()}`;
      await pool.execute(
        `INSERT INTO orders (tran_id, amount, status, package_id, host_id, payment_method) VALUES (?, ?, 'COMPLETED', ?, ?, 'Cash / Admin Manual')`,
        [tranId, pkgPrice, pkgId, host_id]
      );
    }

    const hasAccess = status === 'active' || status === 'trialing';
    await syncHmsAccessForHost(host_id, hasAccess);

    res.json(formatResponse(true, `HMS status updated to ${status} for host ${host_id}`));
  } catch (error) {
    console.error('Toggle HMS status error:', error);
    res.status(500).json(formatResponse(false, 'Failed to toggle HMS status', null, error.message));
  }
});

// Set HMS Trial Duration
router.post('/hms/trial', async (req, res) => {
  try {
    const { host_id, days } = req.body;
    
    if (!host_id || !days || isNaN(days)) {
      return res.status(400).json(formatResponse(false, 'Valid host_id and days are required'));
    }

    const [existing] = await pool.execute('SELECT id FROM hms_subscriptions WHERE host_id = ?', [host_id]);
    
    // Add days to now
    if (existing.length > 0) {
      await pool.execute(
        'UPDATE hms_subscriptions SET status = "trialing", trial_started_at = NOW(), trial_ends_at = DATE_ADD(NOW(), INTERVAL ? DAY), is_trial_used = TRUE WHERE host_id = ?',
        [days, host_id]
      );
    } else {
      await pool.execute(
        'INSERT INTO hms_subscriptions (host_id, status, trial_started_at, trial_ends_at, is_trial_used) VALUES (?, "trialing", NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), TRUE)',
        [host_id, days]
      );
    }

    await syncHmsAccessForHost(host_id, true);

    res.json(formatResponse(true, `HMS trial activated for ${days} days for host ${host_id}`));
  } catch (error) {
    console.error('Set HMS trial error:', error);
    res.status(500).json(formatResponse(false, 'Failed to set HMS trial', null, error.message));
  }
});

// Get Admin HMS Subscription Revenue Analytics & Payment Logs
router.get('/hms-subscriptions/revenue-analytics', async (req, res) => {
  try {
    const { search, gateway, startDate, endDate } = req.query;

    // 1. Total Subscription Revenue
    const [totalRevenueRow] = await pool.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue, 
        COALESCE(SUM(gateway_fee), 0) as total_gateway_fee,
        COUNT(*) as total_orders
      FROM orders
      WHERE package_id IS NOT NULL AND (status = 'Success' OR status = 'COMPLETED')
    `);

    // 2. Total Active Paid Subscriptions Count
    const [activePaidSubsRow] = await pool.execute(`
      SELECT COUNT(*) as active_paid_count
      FROM hms_subscriptions
      WHERE status = 'active' AND package_id IS NOT NULL
    `);

    // 3. Total Trialing Hosts Count
    const [trialingCountRow] = await pool.execute(`
      SELECT COUNT(*) as trialing_count
      FROM hms_subscriptions
      WHERE status = 'trialing'
    `);

    // 4. Subscription Payment Logs
    let whereClauses = ["o.package_id IS NOT NULL"];
    let queryParams = [];

    if (search) {
      whereClauses.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR o.tran_id LIKE ?)");
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term, term, term);
    }

    if (gateway) {
      if (gateway.toLowerCase() === 'sslcommerz') {
        whereClauses.push("(o.tran_id LIKE 'SSL%' OR o.tran_id LIKE 'SSLC%')");
      } else if (gateway.toLowerCase() === 'bkash') {
        whereClauses.push("(o.tran_id LIKE '%BKASH%' OR o.tran_id LIKE '%BK%')");
      } else if (gateway.toLowerCase() === 'nagad') {
        whereClauses.push("(o.tran_id LIKE '%NAGAD%' OR o.tran_id LIKE '%NG%')");
      }
    }

    if (startDate) {
      whereClauses.push("o.created_at >= ?");
      queryParams.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      whereClauses.push("o.created_at <= ?");
      queryParams.push(`${endDate} 23:59:59`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [payments] = await pool.execute(`
      SELECT 
        o.id as order_id,
        o.tran_id,
        o.amount,
        o.gateway_fee,
        o.gateway_channel,
        o.status,
        o.created_at as payment_date,
        u.id as host_user_id,
        u.first_name as host_first_name,
        u.last_name as host_last_name,
        u.email as host_email,
        u.phone as host_phone,
        hp.name as package_name,
        hp.duration_days,
        hs.status as subscription_status,
        hs.subscription_ends_at
      FROM orders o
      JOIN users u ON o.host_id = u.id
      JOIN hms_packages hp ON o.package_id = hp.id
      LEFT JOIN hms_subscriptions hs ON hs.host_id = o.host_id AND hs.package_id = o.package_id
      ${whereSql}
      ORDER BY o.id DESC
    `, queryParams);

    res.json(formatResponse(true, 'HMS subscription revenue analytics fetched successfully', {
      summary: {
        total_revenue: parseFloat(totalRevenueRow[0].total_revenue || 0) - parseFloat(totalRevenueRow[0].total_gateway_fee || 0),
        total_gateway_fees: parseFloat(totalRevenueRow[0].total_gateway_fee || 0),
        total_orders: totalRevenueRow[0].total_orders || 0,
        active_paid_subscriptions: activePaidSubsRow[0].active_paid_count || 0,
        trialing_subscriptions: trialingCountRow[0].trialing_count || 0
      },
      payments: payments.map(p => {
        let method = p.payment_method;
        if (!method || method === 'Online Gateway' || method === 'Online Payment') {
          const tid = String(p.tran_id || '').toUpperCase();
          if (tid.includes('BKASH') || tid.includes('BK')) method = 'bKash';
          else if (tid.includes('NAGAD') || tid.includes('NG')) method = 'Nagad';
          else if (tid.includes('MANUAL') || tid.includes('CASH')) method = 'Cash / Admin Manual';
          else method = 'SSLCommerz';
        }

        return {
          id: p.order_id,
          tran_id: p.tran_id || `SUB-${p.order_id}`,
          amount: parseFloat(p.amount || 0),
          gateway_fee: parseFloat(p.gateway_fee || 0),
          gateway_channel: p.gateway_channel || (method === 'SSLCommerz' ? 'SSLCommerz' : 'Manual'),
          status: p.status === 'Success' ? 'COMPLETED' : p.status,
          payment_method: method,
          package_name: p.package_name || 'HMS Package',
          duration_days: p.duration_days || 30,
          payment_date: p.payment_date,
          valid_until: p.subscription_ends_at,
          host_name: [p.host_first_name, p.host_last_name].filter(Boolean).join(' ') || 'Host',
          host_email: p.host_email || '',
          host_phone: p.host_phone || ''
        };
      })
    }));
  } catch (error) {
    console.error('[Admin] Subscription revenue analytics error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch subscription revenue analytics', null, error.message));
  }
});

// =============================================
// COUPONS MANAGEMENT
// =============================================

// Get all coupons
router.get('/coupons', async (req, res) => {
  try {
    const [coupons] = await pool.execute(`
      SELECT * FROM coupons 
      ORDER BY created_at DESC
    `);
    res.json(formatResponse(true, 'Coupons retrieved successfully', { coupons }));
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve coupons', null, error.message));
  }
});

// Create a coupon
router.post('/coupons', async (req, res) => {
  try {
    const { 
      code, name, description, discount_type, discount_value, 
      minimum_amount, maximum_discount, usage_limit, user_limit, 
      valid_from, valid_until, is_active 
    } = req.body;
    
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json(formatResponse(false, 'Code, discount type, and discount value are required'));
    }

    const [result] = await pool.execute(`
      INSERT INTO coupons (
        code, name, description, discount_type, discount_value, 
        minimum_amount, maximum_discount, usage_limit, user_limit, 
        valid_from, valid_until, is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      code, name || null, description || null, discount_type, discount_value, 
      minimum_amount || 0, maximum_discount || null, usage_limit || null, user_limit || null, 
      valid_from || null, valid_until || null, is_active !== undefined ? is_active : 1
    ]);

    res.json(formatResponse(true, 'Coupon created successfully', { id: result.insertId }));
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create coupon', null, error.message));
  }
});

// Update a coupon
router.put('/coupons/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, name, description, discount_type, discount_value, 
      minimum_amount, maximum_discount, usage_limit, user_limit, 
      valid_from, valid_until, is_active 
    } = req.body;

    const [result] = await pool.execute(`
      UPDATE coupons 
      SET code = ?, name = ?, description = ?, discount_type = ?, discount_value = ?, 
          minimum_amount = ?, maximum_discount = ?, usage_limit = ?, user_limit = ?, 
          valid_from = ?, valid_until = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      code, name, description, discount_type, discount_value, 
      minimum_amount, maximum_discount, usage_limit, user_limit, 
      valid_from, valid_until, is_active, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Coupon not found'));
    }

    res.json(formatResponse(true, 'Coupon updated successfully'));
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update coupon', null, error.message));
  }
});

// Delete a coupon
router.delete('/coupons/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Coupon not found'));
    }

    res.json(formatResponse(true, 'Coupon deleted successfully'));
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete coupon', null, error.message));
  }
});

// =============================================
// ADMIN REVENUE REPORT
// =============================================
router.get('/reports/revenue', async (req, res) => {
  try {
    const {
      start_date, end_date,
      host_id, property_id,
      payment_method, booking_source,
      admin_id,
      page = 1, limit = 50
    } = req.query;

    // Build WHERE conditions
    const conditions = [
      `b.status != 'cancelled'`,
      `b.payment_status = 'paid'`
    ];
    const params = [];

    if (start_date) {
      conditions.push('b.created_at >= ?');
      params.push(start_date + ' 00:00:00');
    }
    if (end_date) {
      conditions.push('b.created_at <= ?');
      params.push(end_date + ' 23:59:59');
    }
    if (host_id && host_id !== 'all') {
      conditions.push('po.id = ?');
      params.push(host_id);
    }
    if (property_id && property_id !== 'all') {
      conditions.push('b.property_id = ?');
      params.push(property_id);
    }
    if (payment_method && payment_method !== 'all') {
      conditions.push('b.payment_method = ?');
      params.push(payment_method);
    }
    if (booking_source && booking_source !== 'all') {
      if (booking_source === 'hms') {
        conditions.push(`b.booking_source NOT IN ('website','mobile_app')`);
      } else if (booking_source === 'online') {
        conditions.push(`b.booking_source IN ('website','mobile_app')`);
      }
    }

    if (admin_id && admin_id !== 'all') {
      conditions.push('b.admin_id = ?');
      params.push(admin_id);
    }

    const whereClause = conditions.join(' AND ');

    // 1. KPI Summary
    const [summaryRows] = await pool.execute(`
      SELECT
        COUNT(b.id)                                                          AS total_bookings,
        COALESCE(SUM(b.total_amount), 0)                                    AS total_revenue,
        COALESCE(SUM(b.admin_commission_amount), 0)                         AS total_commission,
        COALESCE(SUM(
          (SELECT SUM(p_fee.gateway_fee) FROM payments p_fee
           WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed')
        ), 0) as total_gateway_fees,
        COALESCE(SUM(
          b.total_amount 
          - COALESCE(b.admin_commission_amount, 0) 
          - COALESCE((SELECT SUM(p_fee.gateway_fee) FROM payments p_fee WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed'), 0)
        ), 0) AS host_earnings,

        /* Online (website/app) bookings — booking_source = website or mobile_app */
        COUNT(CASE WHEN b.booking_source IN ('website','mobile_app') THEN 1 END) AS online_count,
        COALESCE(SUM(CASE WHEN b.booking_source IN ('website','mobile_app') THEN b.total_amount ELSE 0 END), 0) AS online_revenue,

        /* HMS / Walk-in bookings — booking_source = admin or api */
        COUNT(CASE WHEN b.booking_source NOT IN ('website','mobile_app') OR b.booking_source IS NULL THEN 1 END) AS hms_count,
        COALESCE(SUM(CASE WHEN b.booking_source NOT IN ('website','mobile_app') OR b.booking_source IS NULL THEN b.total_amount ELSE 0 END), 0) AS hms_revenue,


        /* Payment method breakdown */
        COALESCE(SUM(CASE WHEN b.payment_method = 'cash'        THEN b.total_amount ELSE 0 END), 0) AS cash_revenue,
        COALESCE(SUM(CASE WHEN b.payment_method = 'bkash'       THEN b.total_amount ELSE 0 END), 0) AS bkash_revenue,
        COALESCE(SUM(CASE WHEN b.payment_method = 'sslcommerz'  THEN b.total_amount ELSE 0 END), 0) AS ssl_revenue,
        COALESCE(SUM(CASE WHEN b.payment_method = 'nagad'       THEN b.total_amount ELSE 0 END), 0) AS nagad_revenue,
        COALESCE(SUM(CASE WHEN b.payment_method NOT IN ('cash','bkash','sslcommerz','nagad') THEN b.total_amount ELSE 0 END), 0) AS other_revenue,

        /* count by method */
        COUNT(CASE WHEN b.payment_method = 'cash'       THEN 1 END) AS cash_count,
        COUNT(CASE WHEN b.payment_method = 'bkash'      THEN 1 END) AS bkash_count,
        COUNT(CASE WHEN b.payment_method = 'sslcommerz' THEN 1 END) AS ssl_count,
        COUNT(CASE WHEN b.payment_method = 'nagad'      THEN 1 END) AS nagad_count
      FROM bookings b
      LEFT JOIN properties p   ON b.property_id = p.id
      LEFT JOIN property_owners po ON p.owner_id = po.id
      WHERE ${whereClause}
    `, params);

    // 1b. Available for Payout — platform-collected amount owed to hosts (minus cash and gateway fees)
    const [availPayoutRows] = await pool.execute(`
      SELECT COALESCE(SUM(
        b.property_owner_earnings
        - COALESCE((
            SELECT SUM(p.cr_amount)
            FROM payments p
            WHERE p.booking_id = b.id
              AND p.status = 'completed'
              AND p.payment_method = 'cash'
              AND p.transaction_type IN ('guest_payment', 'payment', 'settlement')
          ), 0)
        - COALESCE((
            SELECT SUM(p_fee.gateway_fee)
            FROM payments p_fee
            WHERE p_fee.booking_id = b.id
              AND p_fee.status = 'completed'
          ), 0)
      ), 0) AS available_for_payout
      FROM bookings b
      WHERE b.status != 'cancelled'
        AND b.payment_status IN ('paid', 'partial')
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
        AND b.id NOT IN (
          SELECT opi.booking_id
          FROM owner_payout_items opi
          JOIN owner_payouts op ON opi.payout_id = op.id
          WHERE op.payment_status IN ('pending', 'processing', 'completed')
        )
    `);

    // 1c. Get payment method breakdown from actual completed payments
    const [paymentBreakdownRows] = await pool.execute(`
      SELECT 
        p.payment_method,
        COALESCE(SUM(p.cr_amount), 0) AS total_revenue,
        COUNT(DISTINCT p.id) AS txn_count
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN properties prop ON b.property_id = prop.id
      LEFT JOIN property_owners po ON prop.owner_id = po.id
      WHERE ${whereClause}
        AND p.status = 'completed'
        AND p.cr_amount > 0
      GROUP BY p.payment_method
    `, params);

    const breakdown = {
      cash_revenue: 0, cash_count: 0,
      bkash_revenue: 0, bkash_count: 0,
      ssl_revenue: 0, ssl_count: 0,
      nagad_revenue: 0, nagad_count: 0,
      other_revenue: 0
    };

    paymentBreakdownRows.forEach(r => {
      const method = (r.payment_method || '').toLowerCase();
      const rev = parseFloat(r.total_revenue) || 0;
      const count = parseInt(r.txn_count) || 0;
      if (method === 'cash') {
        breakdown.cash_revenue = rev;
        breakdown.cash_count = count;
      } else if (method === 'bkash') {
        breakdown.bkash_revenue = rev;
        breakdown.bkash_count = count;
      } else if (method === 'sslcommerz') {
        breakdown.ssl_revenue = rev;
        breakdown.ssl_count = count;
      } else if (method === 'nagad') {
        breakdown.nagad_revenue = rev;
        breakdown.nagad_count = count;
      } else {
        breakdown.other_revenue += rev;
      }
    });

    const summary = {
      ...(summaryRows[0] || {}),
      ...breakdown,
      available_for_payout: parseFloat(availPayoutRows[0]?.available_for_payout || 0)
    };


    // 2. Paginated transaction list
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [transactions] = await pool.execute(`
      SELECT
        b.id,
        b.booking_reference,
        b.created_at,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.admin_commission_amount                         AS commission,
        COALESCE((SELECT SUM(p_fee.gateway_fee) FROM payments p_fee WHERE p_fee.booking_id = b.id AND p_fee.status = 'completed'), 0) as gateway_fee,
        COALESCE((SELECT p_chan.gateway_channel FROM payments p_chan WHERE p_chan.booking_id = b.id AND p_chan.status = 'completed' AND p_chan.gateway_channel IS NOT NULL LIMIT 1), 'Online') as gateway_channel,
        (b.total_amount - COALESCE(b.admin_commission_amount, 0) - COALESCE((SELECT SUM(p_fee2.gateway_fee) FROM payments p_fee2 WHERE p_fee2.booking_id = b.id AND p_fee2.status = 'completed'), 0)) AS host_amount,
        b.payment_method,
        b.payment_status,
        b.hms_room_id,
        b.booking_source,
        COALESCE(CONCAT(gu.first_name, ' ', gu.last_name), b.guest_name) AS guest_name,
        COALESCE(gu.email, b.guest_email)                               AS guest_email,
        p.title                                           AS property_title,
        CONCAT(hu.first_name, ' ', hu.last_name)         AS host_name,
        r.room_number                                     AS room_number
      FROM bookings b
      LEFT JOIN users gu          ON b.guest_id = gu.id

      LEFT JOIN properties p      ON b.property_id = p.id
      LEFT JOIN property_owners po ON p.owner_id = po.id
      LEFT JOIN users hu          ON po.user_id = hu.id
      LEFT JOIN hms_rooms r       ON b.hms_room_id = r.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `, params);

    // 3. Count for pagination
    const [countRow] = await pool.execute(`
      SELECT COUNT(b.id) AS total
      FROM bookings b
      LEFT JOIN properties p   ON b.property_id = p.id
      LEFT JOIN property_owners po ON p.owner_id = po.id
      WHERE ${whereClause}
    `, params);
    const totalCount = countRow[0]?.total || 0;

    // 4. Filter options: hosts, properties
    const [hosts] = await pool.execute(`
      SELECT po.id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email
      FROM property_owners po
      JOIN users u ON po.user_id = u.id
      ORDER BY u.first_name
    `);

    const [properties] = await pool.execute(`
      SELECT p.id, p.title FROM properties p WHERE p.status = 'active' ORDER BY p.title
    `);


    res.json(formatResponse(true, 'Revenue report fetched successfully', {
      summary,
      transactions,
      pagination: {
        total: parseInt(totalCount),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      },
      filter_options: { hosts, properties }
    }));
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json(formatResponse(false, 'Failed to fetch revenue report', null, error.message));
  }
});

module.exports = router;
