-- ========================================================
-- KEYHOST24 MASTER LIVE DATABASE UPDATE SCRIPT
-- Generated: 2026-08-11T07:21:43.660Z
-- Local DB: keyhhhpg_keyhost_db vs Live Dump: keyhhhpg_keyhost_db.sql
-- ========================================================

-- --------------------------------------------------------
-- 1. MISSING TABLES TO CREATE ON LIVE
-- --------------------------------------------------------

-- Create Table: role_default_permissions
CREATE TABLE `role_default_permissions` (
  `role` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `display_name` varchar(100) DEFAULT NULL,
  `is_custom` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Default Rows for role_default_permissions:
INSERT IGNORE INTO `role_default_permissions` (`role`, `permissions`, `updated_at`, `display_name`, `is_custom`) VALUES ('admin', '{"properties.read":true,"properties.create_update":true,"properties.delete":true,"property_types.read":true,"property_types.create_update":true,"property_types.delete":true,"amenities.read":true,"amenities.create_update":true,"amenities.delete":true,"display_categories.read":true,"display_categories.create_update":true,"display_categories.delete":true,"coupons.read":true,"coupons.create_update":true,"coupons.delete":true,"bookings.read":true,"bookings.create_update":true,"bookings.delete":true,"calendar.read":true,"calendar.create_update":true,"ical.read":true,"ical.create_update":true,"ical.delete":true,"hms_rooms.read":true,"hms_rooms.create_update":true,"hms_rooms.delete":true,"hms_housekeeping.read":true,"hms_housekeeping.create_update":true,"hms_housekeeping.delete":true,"hms_accounts.read":true,"hms_accounts.create_update":true,"hms_accounts.delete":true,"hms_hr.read":true,"hms_hr.create_update":true,"hms_hr.delete":true,"earnings.read":true,"earnings.create_update":true,"earnings.delete":true,"payouts.read":true,"payouts.create_update":true,"payouts.delete":true,"refunds.read":true,"refunds.create_update":true,"security_deposits.read":true,"security_deposits.create_update":true,"messages.read":true,"messages.create_update":true,"support.read":true,"support.create_update":true,"support.delete":true,"contact_messages.read":true,"contact_messages.create_update":true,"contact_messages.delete":true,"reviews.read":true,"reviews.create_update":true,"reviews.delete":true,"users.read":true,"users.create_update":true,"users.delete":true,"roles.read":true,"roles.create_update":true,"roles.delete":true,"staff.read":true,"staff.create_update":true,"staff.delete":true,"rewards.read":true,"rewards.create_update":true,"analytics.read":true,"reports.read":true,"reports.create_update":true}', 'Sun Aug 09 2026 11:36:04 GMT+0600 (Bangladesh Standard Time)', 'Administrator', '0');
INSERT IGNORE INTO `role_default_permissions` (`role`, `permissions`, `updated_at`, `display_name`, `is_custom`) VALUES ('guest', '{"properties.read":true,"bookings.read":true,"bookings.create_update":true,"refunds.read":true,"refunds.create_update":true,"messages.read":true,"messages.create_update":true,"support.read":true,"support.create_update":true,"reviews.read":true,"reviews.create_update":true,"rewards.read":true,"property_types.read":false,"support.delete":false,"contact_messages.read":true,"contact_messages.create_update":true,"contact_messages.delete":false,"reviews.delete":false}', 'Sun Aug 09 2026 15:39:32 GMT+0600 (Bangladesh Standard Time)', 'Guest / Traveler', '0');
INSERT IGNORE INTO `role_default_permissions` (`role`, `permissions`, `updated_at`, `display_name`, `is_custom`) VALUES ('property_owner', '{"properties.read":true,"properties.create_update":true,"properties.delete":true,"property_types.read":true,"amenities.read":true,"display_categories.read":true,"bookings.read":true,"bookings.create_update":true,"calendar.read":true,"calendar.create_update":true,"ical.read":true,"ical.create_update":true,"ical.delete":true,"hms_rooms.read":true,"hms_rooms.create_update":true,"hms_rooms.delete":true,"hms_housekeeping.read":true,"hms_housekeeping.create_update":true,"hms_housekeeping.delete":true,"hms_accounts.read":true,"hms_accounts.create_update":true,"hms_accounts.delete":true,"hms_hr.read":true,"hms_hr.create_update":true,"hms_hr.delete":true,"earnings.read":true,"earnings.create_update":true,"payouts.read":true,"payouts.create_update":true,"refunds.read":true,"refunds.create_update":true,"security_deposits.read":true,"security_deposits.create_update":true,"messages.read":true,"messages.create_update":true,"support.read":true,"support.create_update":true,"reviews.read":true,"reviews.create_update":true,"staff.read":true,"staff.create_update":true,"staff.delete":true,"analytics.read":true,"reports.read":true,"bookings.delete":true,"contact_messages.create_update":true,"contact_messages.read":true}', 'Mon Aug 10 2026 07:43:21 GMT+0600 (Bangladesh Standard Time)', 'Host / Property Owner', '0');
INSERT IGNORE INTO `role_default_permissions` (`role`, `permissions`, `updated_at`, `display_name`, `is_custom`) VALUES ('staff', '{"properties.read":true,"bookings.read":true,"bookings.create_update":true,"calendar.read":true,"calendar.create_update":true,"hms_rooms.read":true,"hms_rooms.create_update":true,"hms_housekeeping.read":true,"hms_housekeeping.create_update":true,"messages.read":true,"messages.create_update":true}', 'Sun Aug 09 2026 11:36:04 GMT+0600 (Bangladesh Standard Time)', 'Host Staff / Employee', '0');


-- --------------------------------------------------------
-- 2. MISSING COLUMNS (ALTER STATEMENTS) TO RUN ON LIVE
-- --------------------------------------------------------

ALTER TABLE `users` ADD COLUMN `platform_permissions` longtext NULL;

