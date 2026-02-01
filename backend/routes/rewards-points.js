const express = require('express');
const { pool } = require('../config/database');
const { formatResponse, generatePagination } = require('../utils/helpers');
const { verifyToken, requireGuest, requireAdmin } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// ==================== GUEST ROUTES ====================

// Get user's rewards points balance and status
router.get('/my-points', verifyToken, requireGuest, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's rewards points
    const [pointsData] = await pool.execute(`
      SELECT 
        urp.*,
        mst.tier_name,
        mst.tier_display_name,
        mst.tier_color,
        mst.tier_icon
      FROM user_rewards_points urp
      LEFT JOIN member_status_tiers mst ON urp.member_status_tier_id = mst.id
      WHERE urp.user_id = ?
    `, [userId]);

    // Get recent transactions
    const [transactions] = await pool.execute(`
      SELECT 
        rpt.*,
        b.booking_reference,
        b.total_amount as booking_amount
      FROM rewards_point_transactions rpt
      LEFT JOIN bookings b ON rpt.booking_id = b.id
      WHERE rpt.user_id = ?
      ORDER BY rpt.created_at DESC
      LIMIT 10
    `, [userId]);

    // Get rewards point settings
    const [settings] = await pool.execute(`
      SELECT * FROM rewards_point_settings WHERE is_active = TRUE LIMIT 1
    `);

    // If user doesn't have rewards points record, create one
    if (pointsData.length === 0) {
      await pool.execute(`
        INSERT INTO user_rewards_points (user_id, total_points_earned, current_balance, member_status_tier_id)
        VALUES (?, 0, 0, (SELECT id FROM member_status_tiers WHERE min_points = 0 AND is_active = TRUE LIMIT 1))
      `, [userId]);

      // Fetch again
      const [newPointsData] = await pool.execute(`
        SELECT 
          urp.*,
          mst.tier_name,
          mst.tier_display_name,
          mst.tier_color,
          mst.tier_icon
        FROM user_rewards_points urp
        LEFT JOIN member_status_tiers mst ON urp.member_status_tier_id = mst.id
        WHERE urp.user_id = ?
      `, [userId]);

      return res.json(formatResponse(true, 'Rewards points retrieved successfully', {
        points: newPointsData[0] || {
          user_id: userId,
          total_points_earned: 0,
          current_balance: 0,
          lifetime_points_spent: 0,
          tier_name: 'bronze',
          tier_display_name: 'Bronze',
          tier_color: '#CD7F32'
        },
        transactions: [],
        settings: settings[0] || null
      }));
    }

    res.json(formatResponse(true, 'Rewards points retrieved successfully', {
      points: pointsData[0],
      transactions,
      settings: settings[0] || null
    }));

  } catch (error) {
    console.error('Get rewards points error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve rewards points', null, error.message));
  }
});

// Get user's rewards points transaction history
router.get('/my-transactions', verifyToken, requireGuest, validatePagination, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM rewards_point_transactions 
      WHERE user_id = ?
    `, [userId]);

    const total = countResult[0].total;

    // Get transactions
    const [transactions] = await pool.execute(`
      SELECT 
        rpt.*,
        b.booking_reference,
        b.total_amount as booking_amount,
        p.title as property_title
      FROM rewards_point_transactions rpt
      LEFT JOIN bookings b ON rpt.booking_id = b.id
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE rpt.user_id = ?
      ORDER BY rpt.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(formatResponse(true, 'Transactions retrieved successfully', {
      transactions,
      pagination
    }));

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve transactions', null, error.message));
  }
});

// Get available member status tiers
router.get('/member-tiers', verifyToken, requireGuest, async (req, res) => {
  try {
    const [tiers] = await pool.execute(`
      SELECT * FROM member_status_tiers 
      WHERE is_active = TRUE 
      ORDER BY display_order ASC, min_points ASC
    `);

    res.json(formatResponse(true, 'Member tiers retrieved successfully', { tiers }));

  } catch (error) {
    console.error('Get member tiers error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve member tiers', null, error.message));
  }
});

// ==================== ADMIN ROUTES ====================

// Get all rewards point slots
router.get('/admin/slots', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [slots] = await pool.execute(`
      SELECT * FROM rewards_point_slots 
      ORDER BY min_amount ASC
    `);

    res.json(formatResponse(true, 'Rewards point slots retrieved successfully', { slots }));

  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve slots', null, error.message));
  }
});

// Create rewards point slot
router.post('/admin/slots', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { min_amount, max_amount, points_per_thousand, is_active = true } = req.body;

    if (!min_amount || !max_amount || !points_per_thousand) {
      return res.status(400).json(formatResponse(false, 'Missing required fields'));
    }

    if (min_amount >= max_amount) {
      return res.status(400).json(formatResponse(false, 'Min amount must be less than max amount'));
    }

    // Check for overlapping slots
    const [overlaps] = await pool.execute(`
      SELECT * FROM rewards_point_slots 
      WHERE is_active = TRUE 
      AND (
        (min_amount <= ? AND max_amount >= ?) OR
        (min_amount <= ? AND max_amount >= ?) OR
        (min_amount >= ? AND max_amount <= ?)
      )
    `, [min_amount, min_amount, max_amount, max_amount, min_amount, max_amount]);

    if (overlaps.length > 0) {
      return res.status(400).json(formatResponse(false, 'Slot overlaps with existing active slot'));
    }

    const [result] = await pool.execute(`
      INSERT INTO rewards_point_slots (min_amount, max_amount, points_per_thousand, is_active)
      VALUES (?, ?, ?, ?)
    `, [min_amount, max_amount, points_per_thousand, is_active]);

    const [newSlot] = await pool.execute(`
      SELECT * FROM rewards_point_slots WHERE id = ?
    `, [result.insertId]);

    res.status(201).json(formatResponse(true, 'Rewards point slot created successfully', { slot: newSlot[0] }));

  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create slot', null, error.message));
  }
});

// Update rewards point slot
router.put('/admin/slots/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { min_amount, max_amount, points_per_thousand, is_active } = req.body;

    const [result] = await pool.execute(`
      UPDATE rewards_point_slots 
      SET min_amount = ?, max_amount = ?, points_per_thousand = ?, is_active = ?
      WHERE id = ?
    `, [min_amount, max_amount, points_per_thousand, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Slot not found'));
    }

    const [updatedSlot] = await pool.execute(`
      SELECT * FROM rewards_point_slots WHERE id = ?
    `, [id]);

    res.json(formatResponse(true, 'Slot updated successfully', { slot: updatedSlot[0] }));

  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update slot', null, error.message));
  }
});

// Delete rewards point slot
router.delete('/admin/slots/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM rewards_point_slots WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Slot not found'));
    }

    res.json(formatResponse(true, 'Slot deleted successfully'));

  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete slot', null, error.message));
  }
});

// Get rewards point settings
router.get('/admin/settings', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT * FROM rewards_point_settings WHERE is_active = TRUE LIMIT 1
    `);

    if (settings.length === 0) {
      // Create default settings if none exist
      await pool.execute(`
        INSERT INTO rewards_point_settings (points_per_taka, min_points_to_redeem, max_points_per_booking, is_active)
        VALUES (1.00, 100, NULL, TRUE)
      `);

      const [newSettings] = await pool.execute(`
        SELECT * FROM rewards_point_settings WHERE is_active = TRUE LIMIT 1
      `);

      return res.json(formatResponse(true, 'Settings retrieved successfully', { settings: newSettings[0] }));
    }

    res.json(formatResponse(true, 'Settings retrieved successfully', { settings: settings[0] }));

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve settings', null, error.message));
  }
});

// Update rewards point settings
router.put('/admin/settings', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { points_per_taka, min_points_to_redeem, max_points_per_booking, points_expiry_days } = req.body;

    // Get existing settings
    const [existing] = await pool.execute(`
      SELECT * FROM rewards_point_settings WHERE is_active = TRUE LIMIT 1
    `);

    if (existing.length === 0) {
      // Create new settings
      const [result] = await pool.execute(`
        INSERT INTO rewards_point_settings 
        (points_per_taka, min_points_to_redeem, max_points_per_booking, points_expiry_days, is_active)
        VALUES (?, ?, ?, ?, TRUE)
      `, [points_per_taka, min_points_to_redeem, max_points_per_booking, points_expiry_days]);

      const [newSettings] = await pool.execute(`
        SELECT * FROM rewards_point_settings WHERE id = ?
      `, [result.insertId]);

      return res.json(formatResponse(true, 'Settings created successfully', { settings: newSettings[0] }));
    }

    // Update existing settings
    const [result] = await pool.execute(`
      UPDATE rewards_point_settings 
      SET points_per_taka = ?, 
          min_points_to_redeem = ?, 
          max_points_per_booking = ?,
          points_expiry_days = ?
      WHERE id = ?
    `, [points_per_taka, min_points_to_redeem, max_points_per_booking, points_expiry_days, existing[0].id]);

    const [updatedSettings] = await pool.execute(`
      SELECT * FROM rewards_point_settings WHERE id = ?
    `, [existing[0].id]);

    res.json(formatResponse(true, 'Settings updated successfully', { settings: updatedSettings[0] }));

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update settings', null, error.message));
  }
});

// Get all member status tiers
router.get('/admin/member-tiers', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [tiers] = await pool.execute(`
      SELECT * FROM member_status_tiers 
      ORDER BY display_order ASC, min_points ASC
    `);

    res.json(formatResponse(true, 'Member tiers retrieved successfully', { tiers }));

  } catch (error) {
    console.error('Get member tiers error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve member tiers', null, error.message));
  }
});

// Create member status tier
router.post('/admin/member-tiers', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { tier_name, tier_display_name, min_points, tier_color, tier_icon, benefits, display_order, is_active = true } = req.body;

    if (!tier_name || !tier_display_name || min_points === undefined) {
      return res.status(400).json(formatResponse(false, 'Missing required fields'));
    }

    const [result] = await pool.execute(`
      INSERT INTO member_status_tiers 
      (tier_name, tier_display_name, min_points, tier_color, tier_icon, benefits, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [tier_name, tier_display_name, min_points, tier_color, tier_icon, benefits, display_order, is_active]);

    const [newTier] = await pool.execute(`
      SELECT * FROM member_status_tiers WHERE id = ?
    `, [result.insertId]);

    res.status(201).json(formatResponse(true, 'Member tier created successfully', { tier: newTier[0] }));

  } catch (error) {
    console.error('Create member tier error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json(formatResponse(false, 'Tier name already exists'));
    }
    res.status(500).json(formatResponse(false, 'Failed to create member tier', null, error.message));
  }
});

// Update member status tier
router.put('/admin/member-tiers/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { tier_name, tier_display_name, min_points, tier_color, tier_icon, benefits, display_order, is_active } = req.body;

    const [result] = await pool.execute(`
      UPDATE member_status_tiers 
      SET tier_name = ?, tier_display_name = ?, min_points = ?, tier_color = ?, 
          tier_icon = ?, benefits = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `, [tier_name, tier_display_name, min_points, tier_color, tier_icon, benefits, display_order, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Tier not found'));
    }

    const [updatedTier] = await pool.execute(`
      SELECT * FROM member_status_tiers WHERE id = ?
    `, [id]);

    res.json(formatResponse(true, 'Tier updated successfully', { tier: updatedTier[0] }));

  } catch (error) {
    console.error('Update member tier error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update tier', null, error.message));
  }
});

// Delete member status tier
router.delete('/admin/member-tiers/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM member_status_tiers WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json(formatResponse(false, 'Tier not found'));
    }

    res.json(formatResponse(true, 'Tier deleted successfully'));

  } catch (error) {
    console.error('Delete member tier error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete tier', null, error.message));
  }
});

// Get all users' rewards points (admin dashboard)
router.get('/admin/users-points', verifyToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];

    if (search) {
      whereClause = `WHERE u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?`;
      const searchTerm = `%${search}%`;
      queryParams = [searchTerm, searchTerm, searchTerm];
    }

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM user_rewards_points urp
      JOIN users u ON urp.user_id = u.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Get users' points
    const [usersPoints] = await pool.execute(`
      SELECT 
        urp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        mst.tier_name,
        mst.tier_display_name,
        mst.tier_color
      FROM user_rewards_points urp
      JOIN users u ON urp.user_id = u.id
      LEFT JOIN member_status_tiers mst ON urp.member_status_tier_id = mst.id
      ${whereClause}
      ORDER BY urp.total_points_earned DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const pagination = generatePagination(parseInt(page), parseInt(limit), total);

    res.json(formatResponse(true, 'Users points retrieved successfully', {
      usersPoints,
      pagination
    }));

  } catch (error) {
    console.error('Get users points error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve users points', null, error.message));
  }
});

// Adjust user's rewards points (admin only)
router.post('/admin/adjust-points', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, points, description } = req.body;

    if (!user_id || !points || !description) {
      return res.status(400).json(formatResponse(false, 'Missing required fields'));
    }

    // Get user's current balance
    const [userPoints] = await pool.execute(`
      SELECT * FROM user_rewards_points WHERE user_id = ?
    `, [user_id]);

    if (userPoints.length === 0) {
      return res.status(404).json(formatResponse(false, 'User rewards points not found'));
    }

    const currentBalance = userPoints[0].current_balance;
    const newBalance = currentBalance + parseInt(points);

    if (newBalance < 0) {
      return res.status(400).json(formatResponse(false, 'Insufficient points balance'));
    }

    // Update user's points
    await pool.execute(`
      UPDATE user_rewards_points 
      SET current_balance = ?,
          total_points_earned = total_points_earned + ?
      WHERE user_id = ?
    `, [newBalance, Math.max(0, parseInt(points)), user_id]);

    // Create transaction record
    await pool.execute(`
      INSERT INTO rewards_point_transactions 
      (user_id, transaction_type, points, balance_after, description)
      VALUES (?, 'adjusted', ?, ?, ?)
    `, [user_id, parseInt(points), newBalance, description]);

    // Update member status
    await updateMemberStatus(user_id);

    res.json(formatResponse(true, 'Points adjusted successfully', {
      newBalance,
      pointsAdjusted: parseInt(points)
    }));

  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json(formatResponse(false, 'Failed to adjust points', null, error.message));
  }
});

// Helper function to update member status based on total points
async function updateMemberStatus(userId) {
  try {
    // Get user's total points earned
    const [userPoints] = await pool.execute(`
      SELECT total_points_earned FROM user_rewards_points WHERE user_id = ?
    `, [userId]);

    if (userPoints.length === 0) return;

    const totalPoints = userPoints[0].total_points_earned;

    // Find appropriate tier
    const [tier] = await pool.execute(`
      SELECT * FROM member_status_tiers 
      WHERE min_points <= ? AND is_active = TRUE 
      ORDER BY min_points DESC 
      LIMIT 1
    `, [totalPoints]);

    if (tier.length > 0) {
      await pool.execute(`
        UPDATE user_rewards_points 
        SET member_status_tier_id = ? 
        WHERE user_id = ?
      `, [tier[0].id, userId]);
    }
  } catch (error) {
    console.error('Update member status error:', error);
  }
}

module.exports = router;
module.exports.updateMemberStatus = updateMemberStatus;

