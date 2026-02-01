const { pool } = require('../config/database');
const { updateMemberStatus } = require('../routes/rewards-points');

/**
 * Award rewards points to a user based on booking amount
 * @param {number} userId - User ID
 * @param {number} bookingAmount - Total booking amount in taka
 * @param {number} bookingId - Booking ID (optional)
 * @returns {Promise<Object>} - Points awarded and new balance
 */
async function awardPointsForBooking(userId, bookingAmount, bookingId = null) {
  try {
    console.log(`=== AWARD POINTS DEBUG ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Booking Amount: ${bookingAmount}`);
    console.log(`Booking ID: ${bookingId}`);
    
    // Get active rewards point slots
    const [slots] = await pool.execute(`
      SELECT * FROM rewards_point_slots 
      WHERE is_active = TRUE 
      AND min_amount <= ? AND max_amount >= ?
      ORDER BY min_amount DESC
      LIMIT 1
    `, [bookingAmount, bookingAmount]);

    console.log(`Found ${slots.length} active slot(s) for amount ${bookingAmount}`);
    if (slots.length > 0) {
      console.log(`Slot details:`, slots[0]);
    }

    if (slots.length === 0) {
      console.log(`No active slot found for amount: ${bookingAmount}`);
      // Check if any slots exist at all
      const [allSlots] = await pool.execute(`SELECT * FROM rewards_point_slots`);
      console.log(`Total slots in database: ${allSlots.length}`);
      if (allSlots.length > 0) {
        console.log(`All slots:`, allSlots);
      }
      return { pointsAwarded: 0, newBalance: 0 };
    }

    const slot = slots[0];
    
    // Calculate points: (amount / 1000) * points_per_thousand
    const pointsAwarded = Math.floor((bookingAmount / 1000) * slot.points_per_thousand);
    console.log(`Calculated points: (${bookingAmount} / 1000) * ${slot.points_per_thousand} = ${pointsAwarded}`);

    if (pointsAwarded <= 0) {
      console.log(`Points calculated as 0 or negative, not awarding`);
      return { pointsAwarded: 0, newBalance: 0 };
    }

    // Get or create user rewards points record
    const [userPoints] = await pool.execute(`
      SELECT * FROM user_rewards_points WHERE user_id = ?
    `, [userId]);

    let currentBalance = 0;
    let totalPointsEarned = 0;

    if (userPoints.length === 0) {
      // Create new record
      const [tier] = await pool.execute(`
        SELECT id FROM member_status_tiers WHERE min_points = 0 AND is_active = TRUE LIMIT 1
      `);

      await pool.execute(`
        INSERT INTO user_rewards_points 
        (user_id, total_points_earned, current_balance, member_status_tier_id)
        VALUES (?, ?, ?, ?)
      `, [userId, pointsAwarded, pointsAwarded, tier[0]?.id || null]);

      currentBalance = pointsAwarded;
      totalPointsEarned = pointsAwarded;
    } else {
      // Update existing record
      currentBalance = userPoints[0].current_balance + pointsAwarded;
      totalPointsEarned = userPoints[0].total_points_earned + pointsAwarded;

      await pool.execute(`
        UPDATE user_rewards_points 
        SET current_balance = ?,
            total_points_earned = ?
        WHERE user_id = ?
      `, [currentBalance, totalPointsEarned, userId]);
    }

    // Create transaction record
    await pool.execute(`
      INSERT INTO rewards_point_transactions 
      (user_id, transaction_type, points, balance_after, booking_id, description)
      VALUES (?, 'earned', ?, ?, ?, ?)
    `, [
      userId,
      pointsAwarded,
      currentBalance,
      bookingId,
      `Points earned from booking (${bookingAmount.toFixed(2)} BDT)`
    ]);

    // Update member status based on total points
    await updateMemberStatus(userId);

    console.log(`Awarded ${pointsAwarded} points to user ${userId} for booking ${bookingId}`);

    return {
      pointsAwarded,
      newBalance: currentBalance,
      totalPointsEarned
    };

  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Redeem rewards points for a booking
 * @param {number} userId - User ID
 * @param {number} pointsToRedeem - Points to redeem
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} - Discount amount and new balance
 */
async function redeemPointsForBooking(userId, pointsToRedeem, bookingId) {
  try {
    // Get rewards point settings
    const [settings] = await pool.execute(`
      SELECT * FROM rewards_point_settings WHERE is_active = TRUE LIMIT 1
    `);

    if (settings.length === 0) {
      throw new Error('Rewards point settings not found');
    }

    const settingsData = settings[0];

    // Validate minimum points
    if (pointsToRedeem < settingsData.min_points_to_redeem) {
      throw new Error(`Minimum ${settingsData.min_points_to_redeem} points required to redeem`);
    }

    // Check max points per booking
    if (settingsData.max_points_per_booking && pointsToRedeem > settingsData.max_points_per_booking) {
      throw new Error(`Maximum ${settingsData.max_points_per_booking} points can be used per booking`);
    }

    // Get user's current balance
    const [userPoints] = await pool.execute(`
      SELECT * FROM user_rewards_points WHERE user_id = ?
    `, [userId]);

    if (userPoints.length === 0 || userPoints[0].current_balance < pointsToRedeem) {
      throw new Error('Insufficient points balance');
    }

    const currentBalance = userPoints[0].current_balance;
    const newBalance = currentBalance - pointsToRedeem;

    // Calculate discount amount: points / points_per_taka
    const discountAmount = pointsToRedeem / settingsData.points_per_taka;

    // Update user's points balance
    await pool.execute(`
      UPDATE user_rewards_points 
      SET current_balance = ?,
          lifetime_points_spent = lifetime_points_spent + ?
      WHERE user_id = ?
    `, [newBalance, pointsToRedeem, userId]);

    // Create transaction record
    await pool.execute(`
      INSERT INTO rewards_point_transactions 
      (user_id, transaction_type, points, balance_after, booking_id, description)
      VALUES (?, 'redeemed', ?, ?, ?, ?)
    `, [
      userId,
      -pointsToRedeem,
      newBalance,
      bookingId,
      `Points redeemed for booking (${pointsToRedeem} points = ${discountAmount.toFixed(2)} BDT)`
    ]);

    console.log(`Redeemed ${pointsToRedeem} points (${discountAmount.toFixed(2)} BDT) for user ${userId} booking ${bookingId}`);

    return {
      pointsRedeemed: pointsToRedeem,
      discountAmount,
      newBalance
    };

  } catch (error) {
    console.error('Error redeeming points:', error);
    throw error;
  }
}

/**
 * Get user's available points balance
 * @param {number} userId - User ID
 * @returns {Promise<number>} - Available points balance
 */
async function getUserPointsBalance(userId) {
  try {
    const [userPoints] = await pool.execute(`
      SELECT current_balance FROM user_rewards_points WHERE user_id = ?
    `, [userId]);

    return userPoints.length > 0 ? userPoints[0].current_balance : 0;
  } catch (error) {
    console.error('Error getting user points balance:', error);
    return 0;
  }
}

/**
 * Get maximum redeemable points for a booking
 * @param {number} userId - User ID
 * @param {number} bookingAmount - Booking amount
 * @returns {Promise<number>} - Maximum points that can be redeemed
 */
async function getMaxRedeemablePoints(userId, bookingAmount) {
  try {
    // Get user's balance
    const balance = await getUserPointsBalance(userId);

    // Get settings
    const [settings] = await pool.execute(`
      SELECT * FROM rewards_point_settings WHERE is_active = TRUE LIMIT 1
    `);

    if (settings.length === 0) {
      return 0;
    }

    const settingsData = settings[0];

    // Calculate max points based on booking amount (can't redeem more than booking amount)
    const maxPointsFromBooking = Math.floor(bookingAmount * settingsData.points_per_taka);

    // Apply max points per booking limit
    let maxPoints = balance;
    if (settingsData.max_points_per_booking) {
      maxPoints = Math.min(maxPoints, settingsData.max_points_per_booking);
    }

    // Can't redeem more than booking amount
    maxPoints = Math.min(maxPoints, maxPointsFromBooking);

    // Must meet minimum
    if (maxPoints < settingsData.min_points_to_redeem) {
      return 0;
    }

    return maxPoints;

  } catch (error) {
    console.error('Error getting max redeemable points:', error);
    return 0;
  }
}

/**
 * Refund rewards points for a cancelled booking
 * @param {number} userId - User ID
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>} - Refunded points and new balance
 */
async function refundPointsForBooking(userId, bookingId) {
  try {
    console.log(`=== REFUND POINTS DEBUG ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Booking ID: ${bookingId}`);

    // Check if points were redeemed for this booking
    const [redeemedTransaction] = await pool.execute(`
      SELECT * FROM rewards_point_transactions 
      WHERE booking_id = ? AND transaction_type = 'redeemed' AND user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [bookingId, userId]);

    if (redeemedTransaction.length === 0) {
      console.log(`No points redeemed for booking ${bookingId}, nothing to refund`);
      return { pointsRefunded: 0, newBalance: 0 };
    }

    const redeemedPoints = Math.abs(redeemedTransaction[0].points); // Points are stored as negative
    console.log(`Found ${redeemedPoints} points to refund for booking ${bookingId}`);

    // Get user's current balance
    const [userPoints] = await pool.execute(`
      SELECT * FROM user_rewards_points WHERE user_id = ?
    `, [userId]);

    if (userPoints.length === 0) {
      console.log(`User ${userId} has no rewards points record, creating one`);
      await pool.execute(`
        INSERT INTO user_rewards_points (user_id, total_points_earned, current_balance, lifetime_points_spent)
        VALUES (?, 0, ?, ?)
      `, [userId, redeemedPoints, redeemedPoints]);
    } else {
      // Refund points: add back to balance, reduce lifetime_points_spent
      const newBalance = userPoints[0].current_balance + redeemedPoints;
      const newLifetimeSpent = Math.max(0, userPoints[0].lifetime_points_spent - redeemedPoints);

      await pool.execute(`
        UPDATE user_rewards_points 
        SET current_balance = ?,
            lifetime_points_spent = ?
        WHERE user_id = ?
      `, [newBalance, newLifetimeSpent, userId]);
    }

    // Create refund transaction record
    const [updatedUserPoints] = await pool.execute(`
      SELECT current_balance FROM user_rewards_points WHERE user_id = ?
    `, [userId]);
    const currentBalance = updatedUserPoints[0]?.current_balance || redeemedPoints;

    await pool.execute(`
      INSERT INTO rewards_point_transactions 
      (user_id, transaction_type, points, balance_after, booking_id, description)
      VALUES (?, 'adjusted', ?, ?, ?, ?)
    `, [
      userId,
      redeemedPoints,
      currentBalance,
      bookingId,
      `Points refunded for cancelled booking (${redeemedPoints} points)`
    ]);

    console.log(`✅ Refunded ${redeemedPoints} points to user ${userId} for cancelled booking ${bookingId}`);

    return {
      pointsRefunded: redeemedPoints,
      newBalance: currentBalance
    };

  } catch (error) {
    console.error('Error refunding points:', error);
    throw error;
  }
}

module.exports = {
  awardPointsForBooking,
  redeemPointsForBooking,
  getUserPointsBalance,
  getMaxRedeemablePoints,
  refundPointsForBooking
};

