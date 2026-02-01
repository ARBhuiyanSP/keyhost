-- Fix Rewards Points Foreign Key Issues
-- Run this AFTER checking users table structure

-- Step 1: Check users table id column type
-- Run this first to see what type users.id is:
-- SHOW COLUMNS FROM users WHERE Field = 'id';

-- Step 2: Drop the table if it exists with wrong structure
DROP TABLE IF EXISTS user_rewards_points;
DROP TABLE IF EXISTS rewards_point_transactions;

-- Step 3: Make sure member_status_tiers exists first
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

-- Step 4: Create user_rewards_points with matching data types
-- If users.id is UNSIGNED INT, change INT to INT UNSIGNED below
CREATE TABLE IF NOT EXISTS user_rewards_points (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_points_earned INT DEFAULT 0 COMMENT 'Total points ever earned',
  current_balance INT DEFAULT 0 COMMENT 'Available points balance',
  lifetime_points_spent INT DEFAULT 0 COMMENT 'Total points used in bookings',
  member_status_tier_id INT DEFAULT NULL,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (member_status_tier_id) REFERENCES member_status_tiers(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user (user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_member_tier (member_status_tier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Create rewards_point_transactions
-- If bookings.id is UNSIGNED INT, change INT to INT UNSIGNED below
CREATE TABLE IF NOT EXISTS rewards_point_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  transaction_type ENUM('earned', 'redeemed', 'expired', 'adjusted') NOT NULL,
  points INT NOT NULL COMMENT 'Positive for earned, negative for redeemed/expired',
  balance_after INT NOT NULL COMMENT 'Balance after this transaction',
  booking_id INT DEFAULT NULL COMMENT 'Related booking if applicable',
  description TEXT DEFAULT NULL,
  expiry_date DATE DEFAULT NULL COMMENT 'When these points expire (if applicable)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_booking_id (booking_id),
  INDEX idx_created_at (created_at),
  INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

