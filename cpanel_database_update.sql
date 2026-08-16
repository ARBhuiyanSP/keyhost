-- =====================================================================
-- CPANEL DATABASE SCHEMA UPDATE SCRIPT
-- Run this script in CPanel phpMyAdmin SQL tab to synchronize live DB.
-- =====================================================================

-- 1. Add new columns to `bookings` table
ALTER TABLE `bookings` ADD COLUMN `host_proposed_price` decimal(10,2) NULL DEFAULT NULL;
ALTER TABLE `bookings` ADD COLUMN `original_calculated_price` decimal(10,2) NULL DEFAULT NULL;

-- 2. Create the `push_subscriptions` table (for PWA Push Notifications)
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh_key` text NOT NULL,
  `auth_key` text NOT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_endpoint` (`endpoint`(500)),
  KEY `user_id` (`user_id`),
  CONSTRAINT `push_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Insert Meta Pixel & Conversions API (CAPI) settings into `system_settings`
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES 
('facebook_pixel_id', '', 'string', 'Meta Pixel ID for browser-side tracking', 1),
('meta_access_token', '', 'string', 'Meta Conversions API access token (server-side)', 0),
('meta_advanced_matching', 'true', 'boolean', 'Enable advanced matching (hashed user data)', 1),
('meta_capi_enabled', 'false', 'boolean', 'Enable Conversions API (server-side events)', 1),
('meta_test_event_code', '', 'string', 'Meta test event code for development testing', 0)
ON DUPLICATE KEY UPDATE 
  setting_type = VALUES(setting_type), 
  is_public = VALUES(is_public),
  description = VALUES(description);
