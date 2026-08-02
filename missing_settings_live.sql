-- Missing system_settings rows for LIVE server
-- Run these INSERTs in phpMyAdmin on keyhhhpg_keyhost_db

INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('bkash_is_live', 'false', 'boolean', 'Whether bKash tokenized API is live', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('bkash_username', 'sandboxTokenizedUser02', 'string', 'bKash API Username', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('bkash_password', 'sandboxTokenizedUser02@12345', 'string', 'bKash API Password', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('bkash_api_associated_email', '', 'string', 'bKash API Registered Email', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('nagad_is_live', 'false', 'boolean', 'Whether Nagad API is live', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('nagad_api_url', 'http://sandbox.mymoid.com:9090', 'string', 'Nagad API URL', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('nagad_merchant_id', '', 'string', 'Nagad Merchant ID', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('nagad_private_key', '', 'string', 'Nagad Private Key', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('nagad_public_key', '', 'string', 'Nagad Public Key', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('nagad_merchant_private_key', '', 'string', 'Nagad Merchant Private Key', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('google_places_enabled', 'true', 'boolean', 'Whether Google Places autocomplete is enabled', 0, NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES ('google_api_associated_email', '', 'string', 'Google Places associated account email', 0, NOW(), NOW());
