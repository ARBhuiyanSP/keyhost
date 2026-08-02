-- ==========================================
-- CREATE MISSING TABLES
-- ==========================================

CREATE TABLE `hms_invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) unsigned NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `invoice_type` varchar(50) DEFAULT 'full',
  `amount` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `items_json` text DEFAULT NULL,
  `generated_at` datetime DEFAULT current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `hms_invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- ALTER EXISTING TABLES (ADD/MODIFY COLUMNS)
-- ==========================================

ALTER TABLE `bookings`
  ADD COLUMN `booking_type` enum('short_stay','monthly') NOT NULL DEFAULT ''short_stay'',
  ADD COLUMN `months_count` int(11) DEFAULT 'NULL',
  ADD COLUMN `extra_days` int(11) DEFAULT 'NULL',
  ADD COLUMN `monthly_rate_used` decimal(12,2) DEFAULT 'NULL',
  ADD COLUMN `advance_amount` decimal(12,2) DEFAULT 'NULL';

ALTER TABLE `payments`
  ADD COLUMN `received_by` varchar(100) DEFAULT 'NULL',
  ADD COLUMN `account_name` varchar(100) DEFAULT 'NULL';

ALTER TABLE `properties`
  ADD COLUMN `monthly_rent_enabled` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `monthly_stay_type` enum('both','monthly_only') NOT NULL DEFAULT ''both'',
  ADD COLUMN `monthly_min_stay_nights` int(11) NOT NULL DEFAULT '30',
  ADD COLUMN `monthly_rent_amount` decimal(12,2) DEFAULT 'NULL',
  ADD COLUMN `monthly_advance_amount` decimal(12,2) DEFAULT 'NULL',
  ADD COLUMN `monthly_furnished` tinyint(1) NOT NULL DEFAULT '1',
  ADD COLUMN `monthly_wifi_included` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `monthly_electricity_included` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `monthly_gas_included` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `monthly_water_included` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `monthly_cleaning_included` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `monthly_service_charge_included` tinyint(1) NOT NULL DEFAULT '0',
  ADD COLUMN `monthly_inclusions_notes` text DEFAULT 'NULL',
  ADD COLUMN `monthly_security_deposit` decimal(12,2) DEFAULT 'NULL',
  ADD COLUMN `monthly_cancellation_policy` enum('flexible','moderate','strict','custom') NOT NULL DEFAULT ''moderate'',
  ADD COLUMN `monthly_approved` tinyint(1) NOT NULL DEFAULT '0';

