-- Rewards Points System - Auto-detect data types
-- This version tries both INT and INT UNSIGNED

-- ============================================
-- STEP 1: Check data types first
-- ============================================
-- Run this to see what data types your tables use:
-- SHOW COLUMNS FROM users WHERE Field = 'id';
-- SHOW COLUMNS FROM bookings WHERE Field = 'id';

-- ============================================
-- STEP 2: Create basic tables
-- ============================================

CREATE TABLE IF NOT EXISTS rewards_point_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  min_amount DECIMAL(10, 2) NOT NULL,
  max_amount DECIMAL(10, 2) NOT NULL,
  points_per_thousand DECIMAL(10, 2) NOT NULL COMMENT 'Points earned per 1000 taka spent',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_min_amount (min_amount),
  INDEX idx_max_amount (max_amount),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rewards_point_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  points_per_taka DECIMAL(10, 2) NOT NULL DEFAULT 1.00 COMMENT 'How many points = 1 taka',
  min_points_to_redeem INT DEFAULT 100 COMMENT 'Minimum points required to redeem',
  max_points_per_booking INT DEFAULT NULL COMMENT 'Maximum points that can be used per booking (NULL = unlimited)',
  points_expiry_days INT DEFAULT NULL COMMENT 'Points expiry in days (NULL = no expiry)',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS member_status_tiers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tier_name VARCHAR(50) NOT NULL UNIQUE,
  tier_display_name VARCHAR(100) NOT NULL,
  min_points INT NOT NULL COMMENT 'Minimum total points required for this tier',
  tier_color VARCHAR(20) DEFAULT '#666666',
  tier_icon VARCHAR(100) DEFAULT NULL,
  benefits TEXT DEFAULT NULL COMMENT 'JSON array of benefits',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_min_points (min_points),
  INDEX idx_active (is_active),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STEP 3: Drop and recreate user_rewards_points
-- Try with INT UNSIGNED first (most common)
-- ============================================

DROP TABLE IF EXISTS user_rewards_points;

CREATE TABLE user_rewards_points (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  total_points_earned INT DEFAULT 0 COMMENT 'Total points ever earned',
  current_balance INT DEFAULT 0 COMMENT 'Available points balance',
  lifetime_points_spent INT DEFAULT 0 COMMENT 'Total points used in bookings',
  member_status_tier_id INT DEFAULT NULL,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_member_tier (member_status_tier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STEP 4: Drop and recreate rewards_point_transactions
-- ============================================

DROP TABLE IF EXISTS rewards_point_transactions;

CREATE TABLE rewards_point_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL,
  points INT NOT NULL COMMENT 'Positive for earned, negative for redeemed/expired',
  balance_after INT NOT NULL COMMENT 'Balance after this transaction',
  booking_id INT UNSIGNED DEFAULT NULL COMMENT 'Related booking if applicable',
  description TEXT DEFAULT NULL,
  expiry_date DATE DEFAULT NULL COMMENT 'When these points expire (if applicable)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_booking_id (booking_id),
  INDEX idx_created_at (created_at),
  INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STEP 5: Insert default data
-- ============================================

INSERT INTO rewards_point_settings (points_per_taka, min_points_to_redeem, max_points_per_booking, is_active)
VALUES (1.00, 100, NULL, TRUE)
ON DUPLICATE KEY UPDATE points_per_taka = VALUES(points_per_taka);

INSERT INTO member_status_tiers (tier_name, tier_display_name, min_points, tier_color, display_order, is_active)
VALUES
  ('bronze', 'Bronze', 0, '#CD7F32', 1, TRUE),
  ('silver', 'Silver', 1000, '#C0C0C0', 2, TRUE),
  ('gold', 'Gold', 5000, '#FFD700', 3, TRUE),
  ('platinum', 'Platinum', 10000, '#E5E4E2', 4, TRUE),
  ('diamond', 'Diamond', 25000, '#B9F2FF', 5, TRUE)
ON DUPLICATE KEY UPDATE tier_display_name = VALUES(tier_display_name);

INSERT INTO rewards_point_slots (min_amount, max_amount, points_per_thousand, is_active)
VALUES
  (0, 1000, 5, TRUE),
  (1000, 5000, 10, TRUE),
  (5000, 10000, 15, TRUE),
  (10000, 50000, 20, TRUE),
  (50000, 999999999, 25, TRUE)
ON DUPLICATE KEY UPDATE points_per_thousand = VALUES(points_per_thousand);

-- ============================================
-- STEP 6: Add foreign keys
-- ============================================

ALTER TABLE user_rewards_points
ADD CONSTRAINT fk_user_rewards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_rewards_points
ADD CONSTRAINT fk_user_rewards_tier FOREIGN KEY (member_status_tier_id) REFERENCES member_status_tiers(id) ON DELETE SET NULL;

ALTER TABLE rewards_point_transactions
ADD CONSTRAINT fk_rewards_trans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE rewards_point_transactions
ADD CONSTRAINT fk_rewards_trans_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- ============================================
-- STEP 7: Add columns to bookings table
-- ============================================

ALTER TABLE bookings 
ADD COLUMN points_redeemed INT DEFAULT 0 COMMENT 'Points redeemed for this booking',
ADD COLUMN points_discount DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Discount amount from points redemption';

