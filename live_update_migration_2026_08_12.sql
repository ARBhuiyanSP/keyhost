-- ======================================================
-- Keyhost24 Live Server Database Migration Script
-- Target File: keyhhhpg_keyhost_db-live.sql
-- Generated: 2026-08-12T08:03:25.699Z
-- ======================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ======================================================
-- 1. MISSING TABLES IN LIVE DB (1)
-- ======================================================

-- Missing Table: `role_default_permissions`
CREATE TABLE `role_default_permissions` (
  `role` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `display_name` varchar(100) DEFAULT NULL,
  `is_custom` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ======================================================
-- 2. MISSING COLUMNS IN EXISTING LIVE TABLES
-- ======================================================

-- Table `admin_earnings`: Add missing column `booking_id`
ALTER TABLE `admin_earnings` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `admin_earnings`: Add missing column `property_id`
ALTER TABLE `admin_earnings` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `booking_id`;

-- Table `admin_earnings`: Add missing column `property_owner_id`
ALTER TABLE `admin_earnings` ADD COLUMN `property_owner_id` bigint(20) unsigned NOT NULL AFTER `property_id`;

-- Table `admin_earnings`: Add missing column `booking_total`
ALTER TABLE `admin_earnings` ADD COLUMN `booking_total` decimal(10,2) NOT NULL AFTER `property_owner_id`;

-- Table `admin_earnings`: Add missing column `commission_rate`
ALTER TABLE `admin_earnings` ADD COLUMN `commission_rate` decimal(5,2) NOT NULL DEFAULT '10.00' AFTER `booking_total`;

-- Table `admin_earnings`: Add missing column `commission_amount`
ALTER TABLE `admin_earnings` ADD COLUMN `commission_amount` decimal(10,2) NOT NULL AFTER `commission_rate`;

-- Table `admin_earnings`: Add missing column `tax_rate`
ALTER TABLE `admin_earnings` ADD COLUMN `tax_rate` decimal(5,2) DEFAULT '0.00' AFTER `commission_amount`;

-- Table `admin_earnings`: Add missing column `tax_amount`
ALTER TABLE `admin_earnings` ADD COLUMN `tax_amount` decimal(10,2) DEFAULT '0.00' AFTER `tax_rate`;

-- Table `admin_earnings`: Add missing column `net_commission`
ALTER TABLE `admin_earnings` ADD COLUMN `net_commission` decimal(10,2) NOT NULL AFTER `tax_amount`;

-- Table `admin_earnings`: Add missing column `payment_status`
ALTER TABLE `admin_earnings` ADD COLUMN `payment_status` enum('pending','paid','failed') DEFAULT 'pending' AFTER `net_commission`;

-- Table `admin_earnings`: Add missing column `payment_date`
ALTER TABLE `admin_earnings` ADD COLUMN `payment_date` timestamp DEFAULT NULL AFTER `payment_status`;

-- Table `admin_earnings`: Add missing column `payment_method`
ALTER TABLE `admin_earnings` ADD COLUMN `payment_method` varchar(50) DEFAULT NULL AFTER `payment_date`;

-- Table `admin_earnings`: Add missing column `payment_reference`
ALTER TABLE `admin_earnings` ADD COLUMN `payment_reference` varchar(100) DEFAULT NULL AFTER `payment_method`;

-- Table `admin_earnings`: Add missing column `status`
ALTER TABLE `admin_earnings` ADD COLUMN `status` enum('active','cancelled','refunded') DEFAULT 'active' AFTER `payment_reference`;

-- Table `admin_earnings`: Add missing column `created_at`
ALTER TABLE `admin_earnings` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `admin_earnings`: Add missing column `updated_at`
ALTER TABLE `admin_earnings` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `admin_earnings_summary`: Add missing column `year`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `year` int(11) NOT NULL AFTER `id`;

-- Table `admin_earnings_summary`: Add missing column `month`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `month` int(11) NOT NULL AFTER `year`;

-- Table `admin_earnings_summary`: Add missing column `total_bookings`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `total_bookings` int(11) DEFAULT '0' AFTER `month`;

-- Table `admin_earnings_summary`: Add missing column `total_booking_amount`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `total_booking_amount` decimal(12,2) DEFAULT '0.00' AFTER `total_bookings`;

-- Table `admin_earnings_summary`: Add missing column `total_commission`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `total_commission` decimal(12,2) DEFAULT '0.00' AFTER `total_booking_amount`;

-- Table `admin_earnings_summary`: Add missing column `total_tax`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `total_tax` decimal(12,2) DEFAULT '0.00' AFTER `total_commission`;

-- Table `admin_earnings_summary`: Add missing column `net_earnings`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `net_earnings` decimal(12,2) DEFAULT '0.00' AFTER `total_tax`;

-- Table `admin_earnings_summary`: Add missing column `pending_amount`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `pending_amount` decimal(12,2) DEFAULT '0.00' AFTER `net_earnings`;

-- Table `admin_earnings_summary`: Add missing column `paid_amount`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `paid_amount` decimal(12,2) DEFAULT '0.00' AFTER `pending_amount`;

-- Table `admin_earnings_summary`: Add missing column `failed_amount`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `failed_amount` decimal(12,2) DEFAULT '0.00' AFTER `paid_amount`;

-- Table `admin_earnings_summary`: Add missing column `created_at`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `failed_amount`;

-- Table `admin_earnings_summary`: Add missing column `updated_at`
ALTER TABLE `admin_earnings_summary` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `admin_payouts`: Add missing column `payout_reference`
ALTER TABLE `admin_payouts` ADD COLUMN `payout_reference` varchar(50) NOT NULL AFTER `id`;

-- Table `admin_payouts`: Add missing column `start_date`
ALTER TABLE `admin_payouts` ADD COLUMN `start_date` date NOT NULL AFTER `payout_reference`;

-- Table `admin_payouts`: Add missing column `end_date`
ALTER TABLE `admin_payouts` ADD COLUMN `end_date` date NOT NULL AFTER `start_date`;

-- Table `admin_payouts`: Add missing column `total_earnings`
ALTER TABLE `admin_payouts` ADD COLUMN `total_earnings` decimal(12,2) NOT NULL AFTER `end_date`;

-- Table `admin_payouts`: Add missing column `total_tax`
ALTER TABLE `admin_payouts` ADD COLUMN `total_tax` decimal(12,2) DEFAULT '0.00' AFTER `total_earnings`;

-- Table `admin_payouts`: Add missing column `net_payout`
ALTER TABLE `admin_payouts` ADD COLUMN `net_payout` decimal(12,2) NOT NULL AFTER `total_tax`;

-- Table `admin_payouts`: Add missing column `payment_method`
ALTER TABLE `admin_payouts` ADD COLUMN `payment_method` enum('bank_transfer','paypal','stripe','cash') NOT NULL AFTER `net_payout`;

-- Table `admin_payouts`: Add missing column `payment_status`
ALTER TABLE `admin_payouts` ADD COLUMN `payment_status` enum('pending','processing','completed','failed') DEFAULT 'pending' AFTER `payment_method`;

-- Table `admin_payouts`: Add missing column `payment_date`
ALTER TABLE `admin_payouts` ADD COLUMN `payment_date` timestamp DEFAULT NULL AFTER `payment_status`;

-- Table `admin_payouts`: Add missing column `payment_reference`
ALTER TABLE `admin_payouts` ADD COLUMN `payment_reference` varchar(100) DEFAULT NULL AFTER `payment_date`;

-- Table `admin_payouts`: Add missing column `bank_name`
ALTER TABLE `admin_payouts` ADD COLUMN `bank_name` varchar(100) DEFAULT NULL AFTER `payment_reference`;

-- Table `admin_payouts`: Add missing column `account_number`
ALTER TABLE `admin_payouts` ADD COLUMN `account_number` varchar(50) DEFAULT NULL AFTER `bank_name`;

-- Table `admin_payouts`: Add missing column `routing_number`
ALTER TABLE `admin_payouts` ADD COLUMN `routing_number` varchar(20) DEFAULT NULL AFTER `account_number`;

-- Table `admin_payouts`: Add missing column `notes`
ALTER TABLE `admin_payouts` ADD COLUMN `notes` text DEFAULT NULL AFTER `routing_number`;

-- Table `admin_payouts`: Add missing column `created_at`
ALTER TABLE `admin_payouts` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `notes`;

-- Table `admin_payouts`: Add missing column `updated_at`
ALTER TABLE `admin_payouts` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `amenities`: Add missing column `name`
ALTER TABLE `amenities` ADD COLUMN `name` varchar(100) NOT NULL AFTER `id`;

-- Table `amenities`: Add missing column `icon`
ALTER TABLE `amenities` ADD COLUMN `icon` varchar(100) DEFAULT NULL AFTER `name`;

-- Table `amenities`: Add missing column `category`
ALTER TABLE `amenities` ADD COLUMN `category` enum('basic','safety','entertainment','kitchen','bathroom','outdoor','accessibility') DEFAULT 'basic' AFTER `icon`;

-- Table `amenities`: Add missing column `is_active`
ALTER TABLE `amenities` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `category`;

-- Table `amenities`: Add missing column `created_at`
ALTER TABLE `amenities` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `audit_logs`: Add missing column `user_id`
ALTER TABLE `audit_logs` ADD COLUMN `user_id` bigint(20) unsigned DEFAULT NULL AFTER `id`;

-- Table `audit_logs`: Add missing column `action`
ALTER TABLE `audit_logs` ADD COLUMN `action` varchar(100) NOT NULL AFTER `user_id`;

-- Table `audit_logs`: Add missing column `table_name`
ALTER TABLE `audit_logs` ADD COLUMN `table_name` varchar(100) NOT NULL AFTER `action`;

-- Table `audit_logs`: Add missing column `record_id`
ALTER TABLE `audit_logs` ADD COLUMN `record_id` bigint(20) unsigned NOT NULL AFTER `table_name`;

-- Table `audit_logs`: Add missing column `old_values`
ALTER TABLE `audit_logs` ADD COLUMN `old_values` longtext DEFAULT NULL AFTER `record_id`;

-- Table `audit_logs`: Add missing column `new_values`
ALTER TABLE `audit_logs` ADD COLUMN `new_values` longtext DEFAULT NULL AFTER `old_values`;

-- Table `audit_logs`: Add missing column `ip_address`
ALTER TABLE `audit_logs` ADD COLUMN `ip_address` varchar(45) DEFAULT NULL AFTER `new_values`;

-- Table `audit_logs`: Add missing column `user_agent`
ALTER TABLE `audit_logs` ADD COLUMN `user_agent` text DEFAULT NULL AFTER `ip_address`;

-- Table `audit_logs`: Add missing column `created_at`
ALTER TABLE `audit_logs` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `user_agent`;

-- Table `bookings`: Add missing column `booking_reference`
ALTER TABLE `bookings` ADD COLUMN `booking_reference` varchar(20) NOT NULL AFTER `id`;

-- Table `bookings`: Add missing column `guest_id`
ALTER TABLE `bookings` ADD COLUMN `guest_id` bigint(20) unsigned DEFAULT NULL AFTER `booking_reference`;

-- Table `bookings`: Add missing column `property_id`
ALTER TABLE `bookings` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `guest_id`;

-- Table `bookings`: Add missing column `hms_room_id`
ALTER TABLE `bookings` ADD COLUMN `hms_room_id` int(11) DEFAULT NULL AFTER `property_id`;

-- Table `bookings`: Add missing column `check_in_date`
ALTER TABLE `bookings` ADD COLUMN `check_in_date` date NOT NULL AFTER `hms_room_id`;

-- Table `bookings`: Add missing column `check_out_date`
ALTER TABLE `bookings` ADD COLUMN `check_out_date` date NOT NULL AFTER `check_in_date`;

-- Table `bookings`: Add missing column `check_in_time`
ALTER TABLE `bookings` ADD COLUMN `check_in_time` time DEFAULT NULL AFTER `check_out_date`;

-- Table `bookings`: Add missing column `check_out_time`
ALTER TABLE `bookings` ADD COLUMN `check_out_time` time DEFAULT NULL AFTER `check_in_time`;

-- Table `bookings`: Add missing column `number_of_guests`
ALTER TABLE `bookings` ADD COLUMN `number_of_guests` int(11) NOT NULL DEFAULT '1' AFTER `check_out_time`;

-- Table `bookings`: Add missing column `number_of_children`
ALTER TABLE `bookings` ADD COLUMN `number_of_children` int(11) DEFAULT '0' AFTER `number_of_guests`;

-- Table `bookings`: Add missing column `number_of_infants`
ALTER TABLE `bookings` ADD COLUMN `number_of_infants` int(11) DEFAULT '0' AFTER `number_of_children`;

-- Table `bookings`: Add missing column `base_price`
ALTER TABLE `bookings` ADD COLUMN `base_price` decimal(10,2) NOT NULL AFTER `number_of_infants`;

-- Table `bookings`: Add missing column `cleaning_fee`
ALTER TABLE `bookings` ADD COLUMN `cleaning_fee` decimal(10,2) DEFAULT '0.00' AFTER `base_price`;

-- Table `bookings`: Add missing column `security_deposit`
ALTER TABLE `bookings` ADD COLUMN `security_deposit` decimal(10,2) DEFAULT '0.00' AFTER `cleaning_fee`;

-- Table `bookings`: Add missing column `extra_guest_fee`
ALTER TABLE `bookings` ADD COLUMN `extra_guest_fee` decimal(10,2) DEFAULT '0.00' AFTER `security_deposit`;

-- Table `bookings`: Add missing column `service_fee`
ALTER TABLE `bookings` ADD COLUMN `service_fee` decimal(10,2) DEFAULT '0.00' AFTER `extra_guest_fee`;

-- Table `bookings`: Add missing column `tax_amount`
ALTER TABLE `bookings` ADD COLUMN `tax_amount` decimal(10,2) DEFAULT '0.00' AFTER `service_fee`;

-- Table `bookings`: Add missing column `admin_commission_rate`
ALTER TABLE `bookings` ADD COLUMN `admin_commission_rate` decimal(5,2) DEFAULT '10.00' AFTER `tax_amount`;

-- Table `bookings`: Add missing column `admin_commission_amount`
ALTER TABLE `bookings` ADD COLUMN `admin_commission_amount` decimal(10,2) DEFAULT '0.00' AFTER `admin_commission_rate`;

-- Table `bookings`: Add missing column `property_owner_earnings`
ALTER TABLE `bookings` ADD COLUMN `property_owner_earnings` decimal(10,2) DEFAULT '0.00' AFTER `admin_commission_amount`;

-- Table `bookings`: Add missing column `total_amount`
ALTER TABLE `bookings` ADD COLUMN `total_amount` decimal(10,2) NOT NULL AFTER `property_owner_earnings`;

-- Table `bookings`: Add missing column `currency`
ALTER TABLE `bookings` ADD COLUMN `currency` varchar(3) DEFAULT 'BDT' AFTER `total_amount`;

-- Table `bookings`: Add missing column `status`
ALTER TABLE `bookings` ADD COLUMN `status` enum('pending','request_accepted','confirmed','checked_in','checked_out','cancelled','refunded') DEFAULT 'pending' AFTER `currency`;

-- Table `bookings`: Add missing column `payment_status`
ALTER TABLE `bookings` ADD COLUMN `payment_status` enum('pending','paid','failed','refunded','partially_refunded','pending_extra') DEFAULT 'pending' AFTER `status`;

-- Table `bookings`: Add missing column `payment_method`
ALTER TABLE `bookings` ADD COLUMN `payment_method` varchar(50) DEFAULT NULL AFTER `payment_status`;

-- Table `bookings`: Add missing column `payment_notes`
ALTER TABLE `bookings` ADD COLUMN `payment_notes` text DEFAULT NULL AFTER `payment_method`;

-- Table `bookings`: Add missing column `payment_link_token`
ALTER TABLE `bookings` ADD COLUMN `payment_link_token` varchar(100) DEFAULT NULL AFTER `payment_notes`;

-- Table `bookings`: Add missing column `payment_link_expires_at`
ALTER TABLE `bookings` ADD COLUMN `payment_link_expires_at` datetime DEFAULT NULL AFTER `payment_link_token`;

-- Table `bookings`: Add missing column `payment_link_custom_amount`
ALTER TABLE `bookings` ADD COLUMN `payment_link_custom_amount` decimal(12,2) DEFAULT NULL AFTER `payment_link_expires_at`;

-- Table `bookings`: Add missing column `special_requests`
ALTER TABLE `bookings` ADD COLUMN `special_requests` text DEFAULT NULL AFTER `payment_link_custom_amount`;

-- Table `bookings`: Add missing column `cancellation_reason`
ALTER TABLE `bookings` ADD COLUMN `cancellation_reason` text DEFAULT NULL AFTER `special_requests`;

-- Table `bookings`: Add missing column `coupon_code`
ALTER TABLE `bookings` ADD COLUMN `coupon_code` varchar(50) DEFAULT NULL AFTER `cancellation_reason`;

-- Table `bookings`: Add missing column `discount_amount`
ALTER TABLE `bookings` ADD COLUMN `discount_amount` decimal(10,2) DEFAULT '0.00' AFTER `coupon_code`;

-- Table `bookings`: Add missing column `booking_source`
ALTER TABLE `bookings` ADD COLUMN `booking_source` enum('website','mobile_app','admin','api') DEFAULT 'website' AFTER `discount_amount`;

-- Table `bookings`: Add missing column `guest_name`
ALTER TABLE `bookings` ADD COLUMN `guest_name` varchar(255) DEFAULT NULL AFTER `booking_source`;

-- Table `bookings`: Add missing column `guest_email`
ALTER TABLE `bookings` ADD COLUMN `guest_email` varchar(255) DEFAULT NULL AFTER `guest_name`;

-- Table `bookings`: Add missing column `guest_phone`
ALTER TABLE `bookings` ADD COLUMN `guest_phone` varchar(20) DEFAULT NULL AFTER `guest_email`;

-- Table `bookings`: Add missing column `guest_nationality`
ALTER TABLE `bookings` ADD COLUMN `guest_nationality` varchar(100) DEFAULT NULL AFTER `guest_phone`;

-- Table `bookings`: Add missing column `guest_nid_number`
ALTER TABLE `bookings` ADD COLUMN `guest_nid_number` varchar(50) DEFAULT NULL AFTER `guest_nationality`;

-- Table `bookings`: Add missing column `guest_passport_number`
ALTER TABLE `bookings` ADD COLUMN `guest_passport_number` varchar(50) DEFAULT NULL AFTER `guest_nid_number`;

-- Table `bookings`: Add missing column `guest_nid_document_url`
ALTER TABLE `bookings` ADD COLUMN `guest_nid_document_url` text DEFAULT NULL AFTER `guest_passport_number`;

-- Table `bookings`: Add missing column `guest_passport_document_url`
ALTER TABLE `bookings` ADD COLUMN `guest_passport_document_url` text DEFAULT NULL AFTER `guest_nid_document_url`;

-- Table `bookings`: Add missing column `booking_date`
ALTER TABLE `bookings` ADD COLUMN `booking_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `guest_passport_document_url`;

-- Table `bookings`: Add missing column `confirmed_at`
ALTER TABLE `bookings` ADD COLUMN `confirmed_at` timestamp DEFAULT NULL AFTER `booking_date`;

-- Table `bookings`: Add missing column `payment_deadline`
ALTER TABLE `bookings` ADD COLUMN `payment_deadline` datetime DEFAULT NULL AFTER `confirmed_at`;

-- Table `bookings`: Add missing column `cancelled_at`
ALTER TABLE `bookings` ADD COLUMN `cancelled_at` timestamp DEFAULT NULL AFTER `payment_deadline`;

-- Table `bookings`: Add missing column `created_at`
ALTER TABLE `bookings` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `cancelled_at`;

-- Table `bookings`: Add missing column `updated_at`
ALTER TABLE `bookings` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `bookings`: Add missing column `points_redeemed`
ALTER TABLE `bookings` ADD COLUMN `points_redeemed` int(11) DEFAULT '0' AFTER `updated_at`;

-- Table `bookings`: Add missing column `points_discount`
ALTER TABLE `bookings` ADD COLUMN `points_discount` decimal(10,2) DEFAULT '0.00' AFTER `points_redeemed`;

-- Table `bookings`: Add missing column `source`
ALTER TABLE `bookings` ADD COLUMN `source` varchar(50) DEFAULT 'Internal' AFTER `points_discount`;

-- Table `bookings`: Add missing column `external_booking_id`
ALTER TABLE `bookings` ADD COLUMN `external_booking_id` varchar(255) DEFAULT NULL AFTER `source`;

-- Table `bookings`: Add missing column `is_non_refundable`
ALTER TABLE `bookings` ADD COLUMN `is_non_refundable` tinyint(1) DEFAULT '0' AFTER `external_booking_id`;

-- Table `bookings`: Add missing column `security_deposit_status`
ALTER TABLE `bookings` ADD COLUMN `security_deposit_status` varchar(20) DEFAULT 'pending' AFTER `is_non_refundable`;

-- Table `bookings`: Add missing column `security_deposit_claim_amount`
ALTER TABLE `bookings` ADD COLUMN `security_deposit_claim_amount` decimal(10,2) DEFAULT '0.00' AFTER `security_deposit_status`;

-- Table `bookings`: Add missing column `security_deposit_claim_reason`
ALTER TABLE `bookings` ADD COLUMN `security_deposit_claim_reason` text DEFAULT NULL AFTER `security_deposit_claim_amount`;

-- Table `bookings`: Add missing column `security_deposit_claim_at`
ALTER TABLE `bookings` ADD COLUMN `security_deposit_claim_at` timestamp DEFAULT NULL AFTER `security_deposit_claim_reason`;

-- Table `bookings`: Add missing column `security_deposit_deduction_amount`
ALTER TABLE `bookings` ADD COLUMN `security_deposit_deduction_amount` decimal(10,2) DEFAULT '0.00' AFTER `security_deposit_claim_at`;

-- Table `bookings`: Add missing column `booking_type`
ALTER TABLE `bookings` ADD COLUMN `booking_type` enum('short_stay','monthly') NOT NULL DEFAULT 'short_stay' AFTER `security_deposit_deduction_amount`;

-- Table `bookings`: Add missing column `months_count`
ALTER TABLE `bookings` ADD COLUMN `months_count` int(11) DEFAULT NULL AFTER `booking_type`;

-- Table `bookings`: Add missing column `extra_days`
ALTER TABLE `bookings` ADD COLUMN `extra_days` int(11) DEFAULT NULL AFTER `months_count`;

-- Table `bookings`: Add missing column `monthly_rate_used`
ALTER TABLE `bookings` ADD COLUMN `monthly_rate_used` decimal(12,2) DEFAULT NULL AFTER `extra_days`;

-- Table `bookings`: Add missing column `advance_amount`
ALTER TABLE `bookings` ADD COLUMN `advance_amount` decimal(12,2) DEFAULT NULL AFTER `monthly_rate_used`;

-- Table `bookings`: Add missing column `host_proposed_price`
ALTER TABLE `bookings` ADD COLUMN `host_proposed_price` decimal(10,2) DEFAULT NULL AFTER `advance_amount`;

-- Table `bookings`: Add missing column `original_calculated_price`
ALTER TABLE `bookings` ADD COLUMN `original_calculated_price` decimal(10,2) DEFAULT NULL AFTER `host_proposed_price`;

-- Table `booking_guests`: Add missing column `booking_id`
ALTER TABLE `booking_guests` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `booking_guests`: Add missing column `first_name`
ALTER TABLE `booking_guests` ADD COLUMN `first_name` varchar(100) NOT NULL AFTER `booking_id`;

-- Table `booking_guests`: Add missing column `last_name`
ALTER TABLE `booking_guests` ADD COLUMN `last_name` varchar(100) NOT NULL AFTER `first_name`;

-- Table `booking_guests`: Add missing column `email`
ALTER TABLE `booking_guests` ADD COLUMN `email` varchar(255) DEFAULT NULL AFTER `last_name`;

-- Table `booking_guests`: Add missing column `phone`
ALTER TABLE `booking_guests` ADD COLUMN `phone` varchar(20) DEFAULT NULL AFTER `email`;

-- Table `booking_guests`: Add missing column `date_of_birth`
ALTER TABLE `booking_guests` ADD COLUMN `date_of_birth` date DEFAULT NULL AFTER `phone`;

-- Table `booking_guests`: Add missing column `gender`
ALTER TABLE `booking_guests` ADD COLUMN `gender` enum('male','female','other') DEFAULT NULL AFTER `date_of_birth`;

-- Table `booking_guests`: Add missing column `nid_number`
ALTER TABLE `booking_guests` ADD COLUMN `nid_number` varchar(50) DEFAULT NULL AFTER `gender`;

-- Table `booking_guests`: Add missing column `passport_number`
ALTER TABLE `booking_guests` ADD COLUMN `passport_number` varchar(50) DEFAULT NULL AFTER `nid_number`;

-- Table `booking_guests`: Add missing column `is_primary_guest`
ALTER TABLE `booking_guests` ADD COLUMN `is_primary_guest` tinyint(1) DEFAULT '0' AFTER `passport_number`;

-- Table `booking_guests`: Add missing column `created_at`
ALTER TABLE `booking_guests` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_primary_guest`;

-- Table `booking_modifications`: Add missing column `booking_id`
ALTER TABLE `booking_modifications` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `booking_modifications`: Add missing column `modified_by`
ALTER TABLE `booking_modifications` ADD COLUMN `modified_by` bigint(20) unsigned NOT NULL AFTER `booking_id`;

-- Table `booking_modifications`: Add missing column `modification_type`
ALTER TABLE `booking_modifications` ADD COLUMN `modification_type` enum('dates','guests','pricing','status','other') NOT NULL AFTER `modified_by`;

-- Table `booking_modifications`: Add missing column `old_values`
ALTER TABLE `booking_modifications` ADD COLUMN `old_values` longtext NOT NULL AFTER `modification_type`;

-- Table `booking_modifications`: Add missing column `new_values`
ALTER TABLE `booking_modifications` ADD COLUMN `new_values` longtext NOT NULL AFTER `old_values`;

-- Table `booking_modifications`: Add missing column `reason`
ALTER TABLE `booking_modifications` ADD COLUMN `reason` text DEFAULT NULL AFTER `new_values`;

-- Table `booking_modifications`: Add missing column `additional_fee`
ALTER TABLE `booking_modifications` ADD COLUMN `additional_fee` decimal(10,2) DEFAULT '0.00' AFTER `reason`;

-- Table `booking_modifications`: Add missing column `created_at`
ALTER TABLE `booking_modifications` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `additional_fee`;

-- Table `cancellation_policies`: Add missing column `name`
ALTER TABLE `cancellation_policies` ADD COLUMN `name` varchar(100) NOT NULL AFTER `id`;

-- Table `cancellation_policies`: Add missing column `description`
ALTER TABLE `cancellation_policies` ADD COLUMN `description` text NOT NULL AFTER `name`;

-- Table `cancellation_policies`: Add missing column `free_cancellation_hours`
ALTER TABLE `cancellation_policies` ADD COLUMN `free_cancellation_hours` int(11) NOT NULL AFTER `description`;

-- Table `cancellation_policies`: Add missing column `cancellation_fee_percentage`
ALTER TABLE `cancellation_policies` ADD COLUMN `cancellation_fee_percentage` decimal(5,2) DEFAULT '0.00' AFTER `free_cancellation_hours`;

-- Table `cancellation_policies`: Add missing column `no_show_fee_percentage`
ALTER TABLE `cancellation_policies` ADD COLUMN `no_show_fee_percentage` decimal(5,2) DEFAULT '100.00' AFTER `cancellation_fee_percentage`;

-- Table `cancellation_policies`: Add missing column `is_active`
ALTER TABLE `cancellation_policies` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `no_show_fee_percentage`;

-- Table `cancellation_policies`: Add missing column `created_at`
ALTER TABLE `cancellation_policies` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `cancellation_policies`: Add missing column `updated_at`
ALTER TABLE `cancellation_policies` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `car_bookings`: Add missing column `booking_reference`
ALTER TABLE `car_bookings` ADD COLUMN `booking_reference` varchar(20) NOT NULL AFTER `id`;

-- Table `car_bookings`: Add missing column `guest_id`
ALTER TABLE `car_bookings` ADD COLUMN `guest_id` bigint(20) unsigned NOT NULL AFTER `booking_reference`;

-- Table `car_bookings`: Add missing column `pickup_location`
ALTER TABLE `car_bookings` ADD COLUMN `pickup_location` varchar(255) NOT NULL AFTER `guest_id`;

-- Table `car_bookings`: Add missing column `dropoff_location`
ALTER TABLE `car_bookings` ADD COLUMN `dropoff_location` varchar(255) NOT NULL AFTER `pickup_location`;

-- Table `car_bookings`: Add missing column `pickup_date`
ALTER TABLE `car_bookings` ADD COLUMN `pickup_date` date NOT NULL AFTER `dropoff_location`;

-- Table `car_bookings`: Add missing column `pickup_time`
ALTER TABLE `car_bookings` ADD COLUMN `pickup_time` time NOT NULL AFTER `pickup_date`;

-- Table `car_bookings`: Add missing column `dropoff_date`
ALTER TABLE `car_bookings` ADD COLUMN `dropoff_date` date NOT NULL AFTER `pickup_time`;

-- Table `car_bookings`: Add missing column `dropoff_time`
ALTER TABLE `car_bookings` ADD COLUMN `dropoff_time` time NOT NULL AFTER `dropoff_date`;

-- Table `car_bookings`: Add missing column `base_price`
ALTER TABLE `car_bookings` ADD COLUMN `base_price` decimal(10,2) NOT NULL AFTER `dropoff_time`;

-- Table `car_bookings`: Add missing column `total_amount`
ALTER TABLE `car_bookings` ADD COLUMN `total_amount` decimal(10,2) NOT NULL AFTER `base_price`;

-- Table `car_bookings`: Add missing column `currency`
ALTER TABLE `car_bookings` ADD COLUMN `currency` varchar(3) DEFAULT 'BDT' AFTER `total_amount`;

-- Table `car_bookings`: Add missing column `status`
ALTER TABLE `car_bookings` ADD COLUMN `status` enum('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending' AFTER `currency`;

-- Table `car_bookings`: Add missing column `created_at`
ALTER TABLE `car_bookings` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `car_bookings`: Add missing column `updated_at`
ALTER TABLE `car_bookings` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `contact_messages`: Add missing column `name`
ALTER TABLE `contact_messages` ADD COLUMN `name` varchar(255) NOT NULL AFTER `id`;

-- Table `contact_messages`: Add missing column `email`
ALTER TABLE `contact_messages` ADD COLUMN `email` varchar(255) NOT NULL AFTER `name`;

-- Table `contact_messages`: Add missing column `subject`
ALTER TABLE `contact_messages` ADD COLUMN `subject` varchar(255) NOT NULL AFTER `email`;

-- Table `contact_messages`: Add missing column `message`
ALTER TABLE `contact_messages` ADD COLUMN `message` text NOT NULL AFTER `subject`;

-- Table `contact_messages`: Add missing column `status`
ALTER TABLE `contact_messages` ADD COLUMN `status` enum('unread','read','replied') DEFAULT 'unread' AFTER `message`;

-- Table `contact_messages`: Add missing column `created_at`
ALTER TABLE `contact_messages` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `contact_messages`: Add missing column `updated_at`
ALTER TABLE `contact_messages` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `conversations`: Add missing column `guest_id`
ALTER TABLE `conversations` ADD COLUMN `guest_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `conversations`: Add missing column `host_id`
ALTER TABLE `conversations` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `guest_id`;

-- Table `conversations`: Add missing column `property_id`
ALTER TABLE `conversations` ADD COLUMN `property_id` bigint(20) unsigned DEFAULT NULL AFTER `host_id`;

-- Table `conversations`: Add missing column `last_message_at`
ALTER TABLE `conversations` ADD COLUMN `last_message_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `property_id`;

-- Table `conversations`: Add missing column `created_at`
ALTER TABLE `conversations` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `last_message_at`;

-- Table `conversations`: Add missing column `updated_at`
ALTER TABLE `conversations` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `coupons`: Add missing column `code`
ALTER TABLE `coupons` ADD COLUMN `code` varchar(50) NOT NULL AFTER `id`;

-- Table `coupons`: Add missing column `name`
ALTER TABLE `coupons` ADD COLUMN `name` varchar(255) NOT NULL AFTER `code`;

-- Table `coupons`: Add missing column `description`
ALTER TABLE `coupons` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `coupons`: Add missing column `discount_type`
ALTER TABLE `coupons` ADD COLUMN `discount_type` enum('percentage','fixed_amount') NOT NULL AFTER `description`;

-- Table `coupons`: Add missing column `discount_value`
ALTER TABLE `coupons` ADD COLUMN `discount_value` decimal(10,2) NOT NULL AFTER `discount_type`;

-- Table `coupons`: Add missing column `minimum_amount`
ALTER TABLE `coupons` ADD COLUMN `minimum_amount` decimal(10,2) DEFAULT '0.00' AFTER `discount_value`;

-- Table `coupons`: Add missing column `maximum_discount`
ALTER TABLE `coupons` ADD COLUMN `maximum_discount` decimal(10,2) DEFAULT NULL AFTER `minimum_amount`;

-- Table `coupons`: Add missing column `usage_limit`
ALTER TABLE `coupons` ADD COLUMN `usage_limit` int(11) DEFAULT NULL AFTER `maximum_discount`;

-- Table `coupons`: Add missing column `used_count`
ALTER TABLE `coupons` ADD COLUMN `used_count` int(11) DEFAULT '0' AFTER `usage_limit`;

-- Table `coupons`: Add missing column `user_limit`
ALTER TABLE `coupons` ADD COLUMN `user_limit` int(11) DEFAULT '1' AFTER `used_count`;

-- Table `coupons`: Add missing column `valid_from`
ALTER TABLE `coupons` ADD COLUMN `valid_from` date NOT NULL AFTER `user_limit`;

-- Table `coupons`: Add missing column `valid_until`
ALTER TABLE `coupons` ADD COLUMN `valid_until` date NOT NULL AFTER `valid_from`;

-- Table `coupons`: Add missing column `is_active`
ALTER TABLE `coupons` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `valid_until`;

-- Table `coupons`: Add missing column `created_at`
ALTER TABLE `coupons` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `coupons`: Add missing column `updated_at`
ALTER TABLE `coupons` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `coupon_usage`: Add missing column `coupon_id`
ALTER TABLE `coupon_usage` ADD COLUMN `coupon_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `coupon_usage`: Add missing column `user_id`
ALTER TABLE `coupon_usage` ADD COLUMN `user_id` bigint(20) unsigned NOT NULL AFTER `coupon_id`;

-- Table `coupon_usage`: Add missing column `booking_id`
ALTER TABLE `coupon_usage` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `user_id`;

-- Table `coupon_usage`: Add missing column `discount_amount`
ALTER TABLE `coupon_usage` ADD COLUMN `discount_amount` decimal(10,2) NOT NULL AFTER `booking_id`;

-- Table `coupon_usage`: Add missing column `used_at`
ALTER TABLE `coupon_usage` ADD COLUMN `used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `discount_amount`;

-- Table `display_categories`: Add missing column `name`
ALTER TABLE `display_categories` ADD COLUMN `name` varchar(255) NOT NULL AFTER `id`;

-- Table `display_categories`: Add missing column `description`
ALTER TABLE `display_categories` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `display_categories`: Add missing column `sort_order`
ALTER TABLE `display_categories` ADD COLUMN `sort_order` int(11) DEFAULT '0' AFTER `description`;

-- Table `display_categories`: Add missing column `is_active`
ALTER TABLE `display_categories` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `sort_order`;

-- Table `display_categories`: Add missing column `created_at`
ALTER TABLE `display_categories` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `display_category_properties`: Add missing column `display_category_id`
ALTER TABLE `display_category_properties` ADD COLUMN `display_category_id` int(11) NOT NULL AFTER `id`;

-- Table `display_category_properties`: Add missing column `property_id`
ALTER TABLE `display_category_properties` ADD COLUMN `property_id` int(11) NOT NULL AFTER `display_category_id`;

-- Table `display_category_properties`: Add missing column `created_at`
ALTER TABLE `display_category_properties` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `property_id`;

-- Table `external_calendars`: Add missing column `property_id`
ALTER TABLE `external_calendars` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `external_calendars`: Add missing column `provider_name`
ALTER TABLE `external_calendars` ADD COLUMN `provider_name` varchar(100) NOT NULL AFTER `property_id`;

-- Table `external_calendars`: Add missing column `ical_url`
ALTER TABLE `external_calendars` ADD COLUMN `ical_url` text NOT NULL AFTER `provider_name`;

-- Table `external_calendars`: Add missing column `last_sync`
ALTER TABLE `external_calendars` ADD COLUMN `last_sync` datetime DEFAULT NULL AFTER `ical_url`;

-- Table `external_calendars`: Add missing column `created_at`
ALTER TABLE `external_calendars` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `last_sync`;

-- Table `external_calendars`: Add missing column `updated_at`
ALTER TABLE `external_calendars` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `favorites`: Add missing column `user_id`
ALTER TABLE `favorites` ADD COLUMN `user_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `favorites`: Add missing column `property_id`
ALTER TABLE `favorites` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `user_id`;

-- Table `favorites`: Add missing column `created_at`
ALTER TABLE `favorites` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `property_id`;

-- Table `food_items`: Add missing column `property_id`
ALTER TABLE `food_items` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `food_items`: Add missing column `name`
ALTER TABLE `food_items` ADD COLUMN `name` varchar(255) NOT NULL AFTER `property_id`;

-- Table `food_items`: Add missing column `description`
ALTER TABLE `food_items` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `food_items`: Add missing column `price`
ALTER TABLE `food_items` ADD COLUMN `price` decimal(10,2) NOT NULL AFTER `description`;

-- Table `food_items`: Add missing column `image_url`
ALTER TABLE `food_items` ADD COLUMN `image_url` varchar(500) DEFAULT NULL AFTER `price`;

-- Table `food_items`: Add missing column `category`
ALTER TABLE `food_items` ADD COLUMN `category` enum('breakfast','lunch','dinner','snacks','beverages') DEFAULT 'lunch' AFTER `image_url`;

-- Table `food_items`: Add missing column `is_available`
ALTER TABLE `food_items` ADD COLUMN `is_available` tinyint(1) DEFAULT '1' AFTER `category`;

-- Table `food_items`: Add missing column `preparation_time`
ALTER TABLE `food_items` ADD COLUMN `preparation_time` int(11) DEFAULT '30' AFTER `is_available`;

-- Table `food_items`: Add missing column `created_at`
ALTER TABLE `food_items` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `preparation_time`;

-- Table `food_items`: Add missing column `updated_at`
ALTER TABLE `food_items` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `food_orders`: Add missing column `order_reference`
ALTER TABLE `food_orders` ADD COLUMN `order_reference` varchar(20) NOT NULL AFTER `id`;

-- Table `food_orders`: Add missing column `guest_id`
ALTER TABLE `food_orders` ADD COLUMN `guest_id` bigint(20) unsigned NOT NULL AFTER `order_reference`;

-- Table `food_orders`: Add missing column `property_id`
ALTER TABLE `food_orders` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `guest_id`;

-- Table `food_orders`: Add missing column `booking_id`
ALTER TABLE `food_orders` ADD COLUMN `booking_id` bigint(20) unsigned DEFAULT NULL AFTER `property_id`;

-- Table `food_orders`: Add missing column `total_amount`
ALTER TABLE `food_orders` ADD COLUMN `total_amount` decimal(10,2) NOT NULL AFTER `booking_id`;

-- Table `food_orders`: Add missing column `currency`
ALTER TABLE `food_orders` ADD COLUMN `currency` varchar(3) DEFAULT 'BDT' AFTER `total_amount`;

-- Table `food_orders`: Add missing column `status`
ALTER TABLE `food_orders` ADD COLUMN `status` enum('pending','confirmed','preparing','ready','delivered','cancelled') DEFAULT 'pending' AFTER `currency`;

-- Table `food_orders`: Add missing column `delivery_time`
ALTER TABLE `food_orders` ADD COLUMN `delivery_time` time DEFAULT NULL AFTER `status`;

-- Table `food_orders`: Add missing column `special_instructions`
ALTER TABLE `food_orders` ADD COLUMN `special_instructions` text DEFAULT NULL AFTER `delivery_time`;

-- Table `food_orders`: Add missing column `created_at`
ALTER TABLE `food_orders` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `special_instructions`;

-- Table `food_orders`: Add missing column `updated_at`
ALTER TABLE `food_orders` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `food_order_items`: Add missing column `order_id`
ALTER TABLE `food_order_items` ADD COLUMN `order_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `food_order_items`: Add missing column `food_item_id`
ALTER TABLE `food_order_items` ADD COLUMN `food_item_id` bigint(20) unsigned NOT NULL AFTER `order_id`;

-- Table `food_order_items`: Add missing column `quantity`
ALTER TABLE `food_order_items` ADD COLUMN `quantity` int(11) NOT NULL DEFAULT '1' AFTER `food_item_id`;

-- Table `food_order_items`: Add missing column `unit_price`
ALTER TABLE `food_order_items` ADD COLUMN `unit_price` decimal(10,2) NOT NULL AFTER `quantity`;

-- Table `food_order_items`: Add missing column `total_price`
ALTER TABLE `food_order_items` ADD COLUMN `total_price` decimal(10,2) NOT NULL AFTER `unit_price`;

-- Table `hms_accounts_heads`: Add missing column `host_id`
ALTER TABLE `hms_accounts_heads` ADD COLUMN `host_id` int(11) DEFAULT NULL AFTER `id`;

-- Table `hms_accounts_heads`: Add missing column `name`
ALTER TABLE `hms_accounts_heads` ADD COLUMN `name` varchar(255) DEFAULT NULL AFTER `host_id`;

-- Table `hms_accounts_heads`: Add missing column `type`
ALTER TABLE `hms_accounts_heads` ADD COLUMN `type` enum('income','expense','asset','liability') DEFAULT NULL AFTER `name`;

-- Table `hms_accounts_heads`: Add missing column `parent_id`
ALTER TABLE `hms_accounts_heads` ADD COLUMN `parent_id` int(11) DEFAULT NULL AFTER `type`;

-- Table `hms_accounts_heads`: Add missing column `is_system`
ALTER TABLE `hms_accounts_heads` ADD COLUMN `is_system` tinyint(1) DEFAULT '0' AFTER `parent_id`;

-- Table `hms_accounts_heads`: Add missing column `created_at`
ALTER TABLE `hms_accounts_heads` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_system`;

-- Table `hms_accounts_transactions`: Add missing column `host_id`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `host_id` int(11) DEFAULT NULL AFTER `id`;

-- Table `hms_accounts_transactions`: Add missing column `property_id`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `property_id` bigint(20) unsigned DEFAULT NULL AFTER `host_id`;

-- Table `hms_accounts_transactions`: Add missing column `account_head_id`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `account_head_id` int(11) DEFAULT NULL AFTER `property_id`;

-- Table `hms_accounts_transactions`: Add missing column `amount`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `amount` decimal(15,2) DEFAULT NULL AFTER `account_head_id`;

-- Table `hms_accounts_transactions`: Add missing column `type`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `type` enum('debit','credit') DEFAULT NULL AFTER `amount`;

-- Table `hms_accounts_transactions`: Add missing column `description`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `description` text DEFAULT NULL AFTER `type`;

-- Table `hms_accounts_transactions`: Add missing column `reference_type`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `reference_type` varchar(50) DEFAULT NULL AFTER `description`;

-- Table `hms_accounts_transactions`: Add missing column `reference_id`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `reference_id` int(11) DEFAULT NULL AFTER `reference_type`;

-- Table `hms_accounts_transactions`: Add missing column `date`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `date` date DEFAULT NULL AFTER `reference_id`;

-- Table `hms_accounts_transactions`: Add missing column `created_at`
ALTER TABLE `hms_accounts_transactions` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `date`;

-- Table `hms_accounts_vouchers`: Add missing column `host_id`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `host_id` int(11) DEFAULT NULL AFTER `id`;

-- Table `hms_accounts_vouchers`: Add missing column `property_id`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `property_id` bigint(20) unsigned DEFAULT NULL AFTER `host_id`;

-- Table `hms_accounts_vouchers`: Add missing column `voucher_no`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `voucher_no` varchar(50) DEFAULT NULL AFTER `property_id`;

-- Table `hms_accounts_vouchers`: Add missing column `type`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `type` enum('payment','receipt','journal') DEFAULT NULL AFTER `voucher_no`;

-- Table `hms_accounts_vouchers`: Add missing column `date`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `date` date DEFAULT NULL AFTER `type`;

-- Table `hms_accounts_vouchers`: Add missing column `total_amount`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `total_amount` decimal(15,2) DEFAULT NULL AFTER `date`;

-- Table `hms_accounts_vouchers`: Add missing column `remarks`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `remarks` text DEFAULT NULL AFTER `total_amount`;

-- Table `hms_accounts_vouchers`: Add missing column `created_by`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `created_by` int(11) DEFAULT NULL AFTER `remarks`;

-- Table `hms_accounts_vouchers`: Add missing column `created_at`
ALTER TABLE `hms_accounts_vouchers` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`;

-- Table `hms_allowances`: Add missing column `host_id`
ALTER TABLE `hms_allowances` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_allowances`: Add missing column `name`
ALTER TABLE `hms_allowances` ADD COLUMN `name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_allowances`: Add missing column `amount_type`
ALTER TABLE `hms_allowances` ADD COLUMN `amount_type` enum('fixed','percentage') DEFAULT 'fixed' AFTER `name`;

-- Table `hms_allowances`: Add missing column `amount`
ALTER TABLE `hms_allowances` ADD COLUMN `amount` decimal(10,2) NOT NULL AFTER `amount_type`;

-- Table `hms_allowances`: Add missing column `created_at`
ALTER TABLE `hms_allowances` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `amount`;

-- Table `hms_attendance`: Add missing column `host_id`
ALTER TABLE `hms_attendance` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_attendance`: Add missing column `employee_id`
ALTER TABLE `hms_attendance` ADD COLUMN `employee_id` int(11) NOT NULL AFTER `host_id`;

-- Table `hms_attendance`: Add missing column `date`
ALTER TABLE `hms_attendance` ADD COLUMN `date` date NOT NULL AFTER `employee_id`;

-- Table `hms_attendance`: Add missing column `punch_in`
ALTER TABLE `hms_attendance` ADD COLUMN `punch_in` datetime DEFAULT NULL AFTER `date`;

-- Table `hms_attendance`: Add missing column `punch_out`
ALTER TABLE `hms_attendance` ADD COLUMN `punch_out` datetime DEFAULT NULL AFTER `punch_in`;

-- Table `hms_attendance`: Add missing column `punch_in_ip`
ALTER TABLE `hms_attendance` ADD COLUMN `punch_in_ip` varchar(45) DEFAULT NULL AFTER `punch_out`;

-- Table `hms_attendance`: Add missing column `punch_out_ip`
ALTER TABLE `hms_attendance` ADD COLUMN `punch_out_ip` varchar(45) DEFAULT NULL AFTER `punch_in_ip`;

-- Table `hms_attendance`: Add missing column `status`
ALTER TABLE `hms_attendance` ADD COLUMN `status` enum('present','late','absent','half_day') DEFAULT 'present' AFTER `punch_out_ip`;

-- Table `hms_attendance`: Add missing column `work_hours`
ALTER TABLE `hms_attendance` ADD COLUMN `work_hours` decimal(5,2) DEFAULT '0.00' AFTER `status`;

-- Table `hms_attendance`: Add missing column `overtime_hours`
ALTER TABLE `hms_attendance` ADD COLUMN `overtime_hours` decimal(5,2) DEFAULT '0.00' AFTER `work_hours`;

-- Table `hms_attendance`: Add missing column `note`
ALTER TABLE `hms_attendance` ADD COLUMN `note` text DEFAULT NULL AFTER `overtime_hours`;

-- Table `hms_attendance`: Add missing column `created_at`
ALTER TABLE `hms_attendance` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `note`;

-- Table `hms_bills`: Add missing column `host_id`
ALTER TABLE `hms_bills` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_bills`: Add missing column `booking_id`
ALTER TABLE `hms_bills` ADD COLUMN `booking_id` bigint(20) unsigned DEFAULT NULL AFTER `host_id`;

-- Table `hms_bills`: Add missing column `guest_name`
ALTER TABLE `hms_bills` ADD COLUMN `guest_name` varchar(255) DEFAULT NULL AFTER `booking_id`;

-- Table `hms_bills`: Add missing column `service_name`
ALTER TABLE `hms_bills` ADD COLUMN `service_name` varchar(255) NOT NULL AFTER `guest_name`;

-- Table `hms_bills`: Add missing column `amount`
ALTER TABLE `hms_bills` ADD COLUMN `amount` decimal(10,2) NOT NULL AFTER `service_name`;

-- Table `hms_bills`: Add missing column `created_at`
ALTER TABLE `hms_bills` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `amount`;

-- Table `hms_deductions`: Add missing column `host_id`
ALTER TABLE `hms_deductions` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_deductions`: Add missing column `name`
ALTER TABLE `hms_deductions` ADD COLUMN `name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_deductions`: Add missing column `amount_type`
ALTER TABLE `hms_deductions` ADD COLUMN `amount_type` enum('fixed','percentage') DEFAULT 'fixed' AFTER `name`;

-- Table `hms_deductions`: Add missing column `amount`
ALTER TABLE `hms_deductions` ADD COLUMN `amount` decimal(10,2) NOT NULL AFTER `amount_type`;

-- Table `hms_deductions`: Add missing column `created_at`
ALTER TABLE `hms_deductions` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `amount`;

-- Table `hms_departments`: Add missing column `host_id`
ALTER TABLE `hms_departments` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_departments`: Add missing column `name`
ALTER TABLE `hms_departments` ADD COLUMN `name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_departments`: Add missing column `description`
ALTER TABLE `hms_departments` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `hms_departments`: Add missing column `status`
ALTER TABLE `hms_departments` ADD COLUMN `status` enum('active','inactive') DEFAULT 'active' AFTER `description`;

-- Table `hms_departments`: Add missing column `created_at`
ALTER TABLE `hms_departments` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `hms_departments`: Add missing column `updated_at`
ALTER TABLE `hms_departments` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_designations`: Add missing column `host_id`
ALTER TABLE `hms_designations` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_designations`: Add missing column `name`
ALTER TABLE `hms_designations` ADD COLUMN `name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_designations`: Add missing column `description`
ALTER TABLE `hms_designations` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `hms_designations`: Add missing column `status`
ALTER TABLE `hms_designations` ADD COLUMN `status` enum('active','inactive') DEFAULT 'active' AFTER `description`;

-- Table `hms_designations`: Add missing column `created_at`
ALTER TABLE `hms_designations` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `hms_designations`: Add missing column `updated_at`
ALTER TABLE `hms_designations` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_employees`: Add missing column `host_id`
ALTER TABLE `hms_employees` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_employees`: Add missing column `property_id`
ALTER TABLE `hms_employees` ADD COLUMN `property_id` bigint(20) unsigned DEFAULT NULL AFTER `host_id`;

-- Table `hms_employees`: Add missing column `user_id`
ALTER TABLE `hms_employees` ADD COLUMN `user_id` bigint(20) unsigned DEFAULT NULL AFTER `property_id`;

-- Table `hms_employees`: Add missing column `name`
ALTER TABLE `hms_employees` ADD COLUMN `name` varchar(255) NOT NULL AFTER `user_id`;

-- Table `hms_employees`: Add missing column `email`
ALTER TABLE `hms_employees` ADD COLUMN `email` varchar(255) NOT NULL AFTER `name`;

-- Table `hms_employees`: Add missing column `phone`
ALTER TABLE `hms_employees` ADD COLUMN `phone` varchar(20) NOT NULL AFTER `email`;

-- Table `hms_employees`: Add missing column `salary`
ALTER TABLE `hms_employees` ADD COLUMN `salary` decimal(10,2) NOT NULL AFTER `phone`;

-- Table `hms_employees`: Add missing column `designation_id`
ALTER TABLE `hms_employees` ADD COLUMN `designation_id` int(11) DEFAULT NULL AFTER `salary`;

-- Table `hms_employees`: Add missing column `department_id`
ALTER TABLE `hms_employees` ADD COLUMN `department_id` int(11) DEFAULT NULL AFTER `designation_id`;

-- Table `hms_employees`: Add missing column `shift_id`
ALTER TABLE `hms_employees` ADD COLUMN `shift_id` int(11) DEFAULT NULL AFTER `department_id`;

-- Table `hms_employees`: Add missing column `blood_group`
ALTER TABLE `hms_employees` ADD COLUMN `blood_group` varchar(5) DEFAULT NULL AFTER `shift_id`;

-- Table `hms_employees`: Add missing column `date_of_birth`
ALTER TABLE `hms_employees` ADD COLUMN `date_of_birth` date DEFAULT NULL AFTER `blood_group`;

-- Table `hms_employees`: Add missing column `appointment_date`
ALTER TABLE `hms_employees` ADD COLUMN `appointment_date` date DEFAULT NULL AFTER `date_of_birth`;

-- Table `hms_employees`: Add missing column `joining_date`
ALTER TABLE `hms_employees` ADD COLUMN `joining_date` date DEFAULT NULL AFTER `appointment_date`;

-- Table `hms_employees`: Add missing column `address`
ALTER TABLE `hms_employees` ADD COLUMN `address` text DEFAULT NULL AFTER `joining_date`;

-- Table `hms_employees`: Add missing column `photo`
ALTER TABLE `hms_employees` ADD COLUMN `photo` varchar(255) DEFAULT NULL AFTER `address`;

-- Table `hms_employees`: Add missing column `status`
ALTER TABLE `hms_employees` ADD COLUMN `status` enum('active','inactive','terminated') DEFAULT 'active' AFTER `photo`;

-- Table `hms_employees`: Add missing column `role`
ALTER TABLE `hms_employees` ADD COLUMN `role` varchar(50) DEFAULT 'staff' AFTER `status`;

-- Table `hms_employees`: Add missing column `permissions`
ALTER TABLE `hms_employees` ADD COLUMN `permissions` longtext DEFAULT NULL AFTER `role`;

-- Table `hms_employees`: Add missing column `created_at`
ALTER TABLE `hms_employees` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `permissions`;

-- Table `hms_employees`: Add missing column `updated_at`
ALTER TABLE `hms_employees` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_expenses`: Add missing column `property_id`
ALTER TABLE `hms_expenses` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_expenses`: Add missing column `category`
ALTER TABLE `hms_expenses` ADD COLUMN `category` enum('utility','maintenance','inventory','marketing','staff_salary','other') NOT NULL AFTER `property_id`;

-- Table `hms_expenses`: Add missing column `title`
ALTER TABLE `hms_expenses` ADD COLUMN `title` varchar(255) NOT NULL AFTER `category`;

-- Table `hms_expenses`: Add missing column `description`
ALTER TABLE `hms_expenses` ADD COLUMN `description` text DEFAULT NULL AFTER `title`;

-- Table `hms_expenses`: Add missing column `amount`
ALTER TABLE `hms_expenses` ADD COLUMN `amount` decimal(10,2) NOT NULL AFTER `description`;

-- Table `hms_expenses`: Add missing column `expense_date`
ALTER TABLE `hms_expenses` ADD COLUMN `expense_date` date NOT NULL AFTER `amount`;

-- Table `hms_expenses`: Add missing column `payment_method`
ALTER TABLE `hms_expenses` ADD COLUMN `payment_method` enum('cash','bank_transfer','card','mobile_banking') DEFAULT 'cash' AFTER `expense_date`;

-- Table `hms_expenses`: Add missing column `receipt_url`
ALTER TABLE `hms_expenses` ADD COLUMN `receipt_url` varchar(500) DEFAULT NULL AFTER `payment_method`;

-- Table `hms_expenses`: Add missing column `created_at`
ALTER TABLE `hms_expenses` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `receipt_url`;

-- Table `hms_expenses`: Add missing column `updated_at`
ALTER TABLE `hms_expenses` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_food_items`: Add missing column `property_id`
ALTER TABLE `hms_food_items` ADD COLUMN `property_id` int(11) NOT NULL AFTER `id`;

-- Table `hms_food_items`: Add missing column `name`
ALTER TABLE `hms_food_items` ADD COLUMN `name` varchar(255) NOT NULL AFTER `property_id`;

-- Table `hms_food_items`: Add missing column `description`
ALTER TABLE `hms_food_items` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `hms_food_items`: Add missing column `price`
ALTER TABLE `hms_food_items` ADD COLUMN `price` decimal(10,2) NOT NULL AFTER `description`;

-- Table `hms_food_items`: Add missing column `category`
ALTER TABLE `hms_food_items` ADD COLUMN `category` varchar(100) NOT NULL AFTER `price`;

-- Table `hms_food_items`: Add missing column `image_url`
ALTER TABLE `hms_food_items` ADD COLUMN `image_url` varchar(255) DEFAULT NULL AFTER `category`;

-- Table `hms_food_items`: Add missing column `is_available`
ALTER TABLE `hms_food_items` ADD COLUMN `is_available` tinyint(1) DEFAULT '1' AFTER `image_url`;

-- Table `hms_food_items`: Add missing column `created_at`
ALTER TABLE `hms_food_items` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_available`;

-- Table `hms_food_orders`: Add missing column `property_id`
ALTER TABLE `hms_food_orders` ADD COLUMN `property_id` int(11) NOT NULL AFTER `id`;

-- Table `hms_food_orders`: Add missing column `booking_id`
ALTER TABLE `hms_food_orders` ADD COLUMN `booking_id` bigint(20) unsigned DEFAULT NULL AFTER `property_id`;

-- Table `hms_food_orders`: Add missing column `guest_name`
ALTER TABLE `hms_food_orders` ADD COLUMN `guest_name` varchar(255) DEFAULT NULL AFTER `booking_id`;

-- Table `hms_food_orders`: Add missing column `room_number`
ALTER TABLE `hms_food_orders` ADD COLUMN `room_number` varchar(50) DEFAULT NULL AFTER `guest_name`;

-- Table `hms_food_orders`: Add missing column `total_amount`
ALTER TABLE `hms_food_orders` ADD COLUMN `total_amount` decimal(10,2) NOT NULL AFTER `room_number`;

-- Table `hms_food_orders`: Add missing column `status`
ALTER TABLE `hms_food_orders` ADD COLUMN `status` enum('pending','preparing','served','cancelled') DEFAULT 'pending' AFTER `total_amount`;

-- Table `hms_food_orders`: Add missing column `payment_status`
ALTER TABLE `hms_food_orders` ADD COLUMN `payment_status` enum('unpaid','paid','billed_to_room') DEFAULT 'unpaid' AFTER `status`;

-- Table `hms_food_orders`: Add missing column `notes`
ALTER TABLE `hms_food_orders` ADD COLUMN `notes` text DEFAULT NULL AFTER `payment_status`;

-- Table `hms_food_orders`: Add missing column `created_at`
ALTER TABLE `hms_food_orders` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `notes`;

-- Table `hms_food_order_items`: Add missing column `order_id`
ALTER TABLE `hms_food_order_items` ADD COLUMN `order_id` int(11) NOT NULL AFTER `id`;

-- Table `hms_food_order_items`: Add missing column `item_id`
ALTER TABLE `hms_food_order_items` ADD COLUMN `item_id` int(11) NOT NULL AFTER `order_id`;

-- Table `hms_food_order_items`: Add missing column `quantity`
ALTER TABLE `hms_food_order_items` ADD COLUMN `quantity` int(11) NOT NULL AFTER `item_id`;

-- Table `hms_food_order_items`: Add missing column `price_at_time`
ALTER TABLE `hms_food_order_items` ADD COLUMN `price_at_time` decimal(10,2) NOT NULL AFTER `quantity`;

-- Table `hms_housekeeping`: Add missing column `property_id`
ALTER TABLE `hms_housekeeping` ADD COLUMN `property_id` int(11) NOT NULL AFTER `id`;

-- Table `hms_housekeeping`: Add missing column `room_id`
ALTER TABLE `hms_housekeeping` ADD COLUMN `room_id` int(11) NOT NULL AFTER `property_id`;

-- Table `hms_housekeeping`: Add missing column `staff_id`
ALTER TABLE `hms_housekeeping` ADD COLUMN `staff_id` int(11) DEFAULT NULL AFTER `room_id`;

-- Table `hms_housekeeping`: Add missing column `status`
ALTER TABLE `hms_housekeeping` ADD COLUMN `status` enum('dirty','cleaning','clean','inspected') DEFAULT 'dirty' AFTER `staff_id`;

-- Table `hms_housekeeping`: Add missing column `priority`
ALTER TABLE `hms_housekeeping` ADD COLUMN `priority` enum('low','medium','high') DEFAULT 'medium' AFTER `status`;

-- Table `hms_housekeeping`: Add missing column `notes`
ALTER TABLE `hms_housekeeping` ADD COLUMN `notes` text DEFAULT NULL AFTER `priority`;

-- Table `hms_housekeeping`: Add missing column `assigned_at`
ALTER TABLE `hms_housekeeping` ADD COLUMN `assigned_at` datetime DEFAULT NULL AFTER `notes`;

-- Table `hms_housekeeping`: Add missing column `completed_at`
ALTER TABLE `hms_housekeeping` ADD COLUMN `completed_at` datetime DEFAULT NULL AFTER `assigned_at`;

-- Table `hms_housekeeping`: Add missing column `created_at`
ALTER TABLE `hms_housekeeping` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `completed_at`;

-- Table `hms_housekeeping`: Add missing column `updated_at`
ALTER TABLE `hms_housekeeping` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_invoices`: Add missing column `booking_id`
ALTER TABLE `hms_invoices` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_invoices`: Add missing column `invoice_number`
ALTER TABLE `hms_invoices` ADD COLUMN `invoice_number` varchar(100) NOT NULL AFTER `booking_id`;

-- Table `hms_invoices`: Add missing column `invoice_type`
ALTER TABLE `hms_invoices` ADD COLUMN `invoice_type` varchar(50) DEFAULT 'full' AFTER `invoice_number`;

-- Table `hms_invoices`: Add missing column `amount`
ALTER TABLE `hms_invoices` ADD COLUMN `amount` decimal(12,2) DEFAULT '0.00' AFTER `invoice_type`;

-- Table `hms_invoices`: Add missing column `notes`
ALTER TABLE `hms_invoices` ADD COLUMN `notes` text DEFAULT NULL AFTER `amount`;

-- Table `hms_invoices`: Add missing column `items_json`
ALTER TABLE `hms_invoices` ADD COLUMN `items_json` text DEFAULT NULL AFTER `notes`;

-- Table `hms_invoices`: Add missing column `generated_at`
ALTER TABLE `hms_invoices` ADD COLUMN `generated_at` datetime DEFAULT CURRENT_TIMESTAMP AFTER `items_json`;

-- Table `hms_invoices`: Add missing column `created_at`
ALTER TABLE `hms_invoices` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP AFTER `generated_at`;

-- Table `hms_maintenance_notifications`: Add missing column `task_id`
ALTER TABLE `hms_maintenance_notifications` ADD COLUMN `task_id` int(11) NOT NULL AFTER `id`;

-- Table `hms_maintenance_notifications`: Add missing column `host_id`
ALTER TABLE `hms_maintenance_notifications` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `task_id`;

-- Table `hms_maintenance_notifications`: Add missing column `notification_date`
ALTER TABLE `hms_maintenance_notifications` ADD COLUMN `notification_date` date NOT NULL AFTER `host_id`;

-- Table `hms_maintenance_notifications`: Add missing column `is_sent`
ALTER TABLE `hms_maintenance_notifications` ADD COLUMN `is_sent` tinyint(1) DEFAULT '0' AFTER `notification_date`;

-- Table `hms_maintenance_notifications`: Add missing column `sent_at`
ALTER TABLE `hms_maintenance_notifications` ADD COLUMN `sent_at` timestamp DEFAULT NULL AFTER `is_sent`;

-- Table `hms_maintenance_tasks`: Add missing column `host_id`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_maintenance_tasks`: Add missing column `property_id`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `host_id`;

-- Table `hms_maintenance_tasks`: Add missing column `room_id`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `room_id` int(11) DEFAULT NULL AFTER `property_id`;

-- Table `hms_maintenance_tasks`: Add missing column `task_type`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `task_type` varchar(100) NOT NULL AFTER `room_id`;

-- Table `hms_maintenance_tasks`: Add missing column `description`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `description` text DEFAULT NULL AFTER `task_type`;

-- Table `hms_maintenance_tasks`: Add missing column `cost`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `cost` decimal(10,2) DEFAULT '0.00' AFTER `description`;

-- Table `hms_maintenance_tasks`: Add missing column `status`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled' AFTER `cost`;

-- Table `hms_maintenance_tasks`: Add missing column `start_date`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `start_date` date NOT NULL AFTER `status`;

-- Table `hms_maintenance_tasks`: Add missing column `end_date`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `end_date` date NOT NULL AFTER `start_date`;

-- Table `hms_maintenance_tasks`: Add missing column `is_recurring`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `is_recurring` tinyint(1) DEFAULT '0' AFTER `end_date`;

-- Table `hms_maintenance_tasks`: Add missing column `recurrence_interval`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `recurrence_interval` int(11) DEFAULT '0' AFTER `is_recurring`;

-- Table `hms_maintenance_tasks`: Add missing column `next_due_date`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `next_due_date` date DEFAULT NULL AFTER `recurrence_interval`;

-- Table `hms_maintenance_tasks`: Add missing column `created_by`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `created_by` bigint(20) unsigned NOT NULL AFTER `next_due_date`;

-- Table `hms_maintenance_tasks`: Add missing column `created_at`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`;

-- Table `hms_maintenance_tasks`: Add missing column `updated_at`
ALTER TABLE `hms_maintenance_tasks` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_maintenance_types`: Add missing column `host_id`
ALTER TABLE `hms_maintenance_types` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_maintenance_types`: Add missing column `name`
ALTER TABLE `hms_maintenance_types` ADD COLUMN `name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_maintenance_types`: Add missing column `description`
ALTER TABLE `hms_maintenance_types` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `hms_maintenance_types`: Add missing column `created_at`
ALTER TABLE `hms_maintenance_types` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `description`;

-- Table `hms_maintenance_types`: Add missing column `updated_at`
ALTER TABLE `hms_maintenance_types` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_packages`: Add missing column `name`
ALTER TABLE `hms_packages` ADD COLUMN `name` varchar(255) NOT NULL AFTER `id`;

-- Table `hms_packages`: Add missing column `price`
ALTER TABLE `hms_packages` ADD COLUMN `price` decimal(10,2) NOT NULL AFTER `name`;

-- Table `hms_packages`: Add missing column `billing_cycle`
ALTER TABLE `hms_packages` ADD COLUMN `billing_cycle` enum('monthly','yearly') DEFAULT 'monthly' AFTER `price`;

-- Table `hms_packages`: Add missing column `trial_days`
ALTER TABLE `hms_packages` ADD COLUMN `trial_days` int(11) DEFAULT '14' AFTER `billing_cycle`;

-- Table `hms_packages`: Add missing column `features`
ALTER TABLE `hms_packages` ADD COLUMN `features` longtext DEFAULT NULL AFTER `trial_days`;

-- Table `hms_packages`: Add missing column `is_active`
ALTER TABLE `hms_packages` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `features`;

-- Table `hms_packages`: Add missing column `created_at`
ALTER TABLE `hms_packages` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `hms_packages`: Add missing column `updated_at`
ALTER TABLE `hms_packages` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_packages`: Add missing column `is_trial`
ALTER TABLE `hms_packages` ADD COLUMN `is_trial` tinyint(1) DEFAULT '0' AFTER `updated_at`;

-- Table `hms_packages`: Add missing column `duration_days`
ALTER TABLE `hms_packages` ADD COLUMN `duration_days` int(11) DEFAULT '30' AFTER `is_trial`;

-- Table `hms_payrolls`: Add missing column `host_id`
ALTER TABLE `hms_payrolls` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_payrolls`: Add missing column `employee_id`
ALTER TABLE `hms_payrolls` ADD COLUMN `employee_id` int(11) NOT NULL AFTER `host_id`;

-- Table `hms_payrolls`: Add missing column `month`
ALTER TABLE `hms_payrolls` ADD COLUMN `month` varchar(20) NOT NULL AFTER `employee_id`;

-- Table `hms_payrolls`: Add missing column `year`
ALTER TABLE `hms_payrolls` ADD COLUMN `year` int(11) NOT NULL AFTER `month`;

-- Table `hms_payrolls`: Add missing column `basic_salary`
ALTER TABLE `hms_payrolls` ADD COLUMN `basic_salary` decimal(10,2) NOT NULL AFTER `year`;

-- Table `hms_payrolls`: Add missing column `total_allowance`
ALTER TABLE `hms_payrolls` ADD COLUMN `total_allowance` decimal(10,2) DEFAULT '0.00' AFTER `basic_salary`;

-- Table `hms_payrolls`: Add missing column `total_deduction`
ALTER TABLE `hms_payrolls` ADD COLUMN `total_deduction` decimal(10,2) DEFAULT '0.00' AFTER `total_allowance`;

-- Table `hms_payrolls`: Add missing column `net_salary`
ALTER TABLE `hms_payrolls` ADD COLUMN `net_salary` decimal(10,2) NOT NULL AFTER `total_deduction`;

-- Table `hms_payrolls`: Add missing column `payment_date`
ALTER TABLE `hms_payrolls` ADD COLUMN `payment_date` date DEFAULT NULL AFTER `net_salary`;

-- Table `hms_payrolls`: Add missing column `status`
ALTER TABLE `hms_payrolls` ADD COLUMN `status` enum('pending','paid') DEFAULT 'pending' AFTER `payment_date`;

-- Table `hms_payrolls`: Add missing column `created_at`
ALTER TABLE `hms_payrolls` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `hms_rooms`: Add missing column `property_id`
ALTER TABLE `hms_rooms` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_rooms`: Add missing column `room_number`
ALTER TABLE `hms_rooms` ADD COLUMN `room_number` varchar(50) NOT NULL AFTER `property_id`;

-- Table `hms_rooms`: Add missing column `room_type`
ALTER TABLE `hms_rooms` ADD COLUMN `room_type` varchar(100) DEFAULT NULL AFTER `room_number`;

-- Table `hms_rooms`: Add missing column `floor`
ALTER TABLE `hms_rooms` ADD COLUMN `floor` varchar(50) DEFAULT NULL AFTER `room_type`;

-- Table `hms_rooms`: Add missing column `price`
ALTER TABLE `hms_rooms` ADD COLUMN `price` decimal(10,2) NOT NULL AFTER `floor`;

-- Table `hms_rooms`: Add missing column `status`
ALTER TABLE `hms_rooms` ADD COLUMN `status` enum('available','occupied','dirty','maintenance') DEFAULT 'available' AFTER `price`;

-- Table `hms_rooms`: Add missing column `features`
ALTER TABLE `hms_rooms` ADD COLUMN `features` text DEFAULT NULL AFTER `status`;

-- Table `hms_rooms`: Add missing column `images`
ALTER TABLE `hms_rooms` ADD COLUMN `images` longtext DEFAULT NULL AFTER `features`;

-- Table `hms_rooms`: Add missing column `created_at`
ALTER TABLE `hms_rooms` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `images`;

-- Table `hms_rooms`: Add missing column `updated_at`
ALTER TABLE `hms_rooms` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_room_types`: Add missing column `host_id`
ALTER TABLE `hms_room_types` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_room_types`: Add missing column `name`
ALTER TABLE `hms_room_types` ADD COLUMN `name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_room_types`: Add missing column `description`
ALTER TABLE `hms_room_types` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `hms_room_types`: Add missing column `base_price`
ALTER TABLE `hms_room_types` ADD COLUMN `base_price` decimal(10,2) NOT NULL AFTER `description`;

-- Table `hms_room_types`: Add missing column `created_at`
ALTER TABLE `hms_room_types` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `base_price`;

-- Table `hms_rosters`: Add missing column `host_id`
ALTER TABLE `hms_rosters` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_rosters`: Add missing column `employee_id`
ALTER TABLE `hms_rosters` ADD COLUMN `employee_id` int(11) NOT NULL AFTER `host_id`;

-- Table `hms_rosters`: Add missing column `shift_id`
ALTER TABLE `hms_rosters` ADD COLUMN `shift_id` int(11) DEFAULT NULL AFTER `employee_id`;

-- Table `hms_rosters`: Add missing column `date`
ALTER TABLE `hms_rosters` ADD COLUMN `date` date NOT NULL AFTER `shift_id`;

-- Table `hms_rosters`: Add missing column `note`
ALTER TABLE `hms_rosters` ADD COLUMN `note` text DEFAULT NULL AFTER `date`;

-- Table `hms_rosters`: Add missing column `created_at`
ALTER TABLE `hms_rosters` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `note`;

-- Table `hms_shifts`: Add missing column `host_id`
ALTER TABLE `hms_shifts` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_shifts`: Add missing column `name`
ALTER TABLE `hms_shifts` ADD COLUMN `name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_shifts`: Add missing column `start_time`
ALTER TABLE `hms_shifts` ADD COLUMN `start_time` time NOT NULL AFTER `name`;

-- Table `hms_shifts`: Add missing column `end_time`
ALTER TABLE `hms_shifts` ADD COLUMN `end_time` time NOT NULL AFTER `start_time`;

-- Table `hms_shifts`: Add missing column `status`
ALTER TABLE `hms_shifts` ADD COLUMN `status` enum('active','inactive') DEFAULT 'active' AFTER `end_time`;

-- Table `hms_shifts`: Add missing column `created_at`
ALTER TABLE `hms_shifts` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `hms_shifts`: Add missing column `updated_at`
ALTER TABLE `hms_shifts` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_staff`: Add missing column `property_id`
ALTER TABLE `hms_staff` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_staff`: Add missing column `first_name`
ALTER TABLE `hms_staff` ADD COLUMN `first_name` varchar(100) NOT NULL AFTER `property_id`;

-- Table `hms_staff`: Add missing column `last_name`
ALTER TABLE `hms_staff` ADD COLUMN `last_name` varchar(100) NOT NULL AFTER `first_name`;

-- Table `hms_staff`: Add missing column `email`
ALTER TABLE `hms_staff` ADD COLUMN `email` varchar(255) DEFAULT NULL AFTER `last_name`;

-- Table `hms_staff`: Add missing column `phone`
ALTER TABLE `hms_staff` ADD COLUMN `phone` varchar(20) DEFAULT NULL AFTER `email`;

-- Table `hms_staff`: Add missing column `role`
ALTER TABLE `hms_staff` ADD COLUMN `role` enum('manager','receptionist','housekeeping','maintenance','security','other') NOT NULL DEFAULT 'other' AFTER `phone`;

-- Table `hms_staff`: Add missing column `salary`
ALTER TABLE `hms_staff` ADD COLUMN `salary` decimal(10,2) DEFAULT NULL AFTER `role`;

-- Table `hms_staff`: Add missing column `joining_date`
ALTER TABLE `hms_staff` ADD COLUMN `joining_date` date DEFAULT NULL AFTER `salary`;

-- Table `hms_staff`: Add missing column `status`
ALTER TABLE `hms_staff` ADD COLUMN `status` enum('active','inactive','on_leave') DEFAULT 'active' AFTER `joining_date`;

-- Table `hms_staff`: Add missing column `created_at`
ALTER TABLE `hms_staff` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `hms_staff`: Add missing column `updated_at`
ALTER TABLE `hms_staff` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_staff_members`: Add missing column `host_id`
ALTER TABLE `hms_staff_members` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_staff_members`: Add missing column `first_name`
ALTER TABLE `hms_staff_members` ADD COLUMN `first_name` varchar(100) NOT NULL AFTER `host_id`;

-- Table `hms_staff_members`: Add missing column `last_name`
ALTER TABLE `hms_staff_members` ADD COLUMN `last_name` varchar(100) NOT NULL AFTER `first_name`;

-- Table `hms_staff_members`: Add missing column `email`
ALTER TABLE `hms_staff_members` ADD COLUMN `email` varchar(255) NOT NULL AFTER `last_name`;

-- Table `hms_staff_members`: Add missing column `password`
ALTER TABLE `hms_staff_members` ADD COLUMN `password` varchar(255) NOT NULL AFTER `email`;

-- Table `hms_staff_members`: Add missing column `role`
ALTER TABLE `hms_staff_members` ADD COLUMN `role` varchar(50) DEFAULT 'staff' AFTER `password`;

-- Table `hms_staff_members`: Add missing column `created_at`
ALTER TABLE `hms_staff_members` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `role`;

-- Table `hms_subscriptions`: Add missing column `host_id`
ALTER TABLE `hms_subscriptions` ADD COLUMN `host_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `hms_subscriptions`: Add missing column `status`
ALTER TABLE `hms_subscriptions` ADD COLUMN `status` enum('active','inactive','trialing','expired') DEFAULT 'inactive' AFTER `host_id`;

-- Table `hms_subscriptions`: Add missing column `plan_type`
ALTER TABLE `hms_subscriptions` ADD COLUMN `plan_type` enum('basic','premium') DEFAULT 'basic' AFTER `status`;

-- Table `hms_subscriptions`: Add missing column `trial_started_at`
ALTER TABLE `hms_subscriptions` ADD COLUMN `trial_started_at` datetime DEFAULT NULL AFTER `plan_type`;

-- Table `hms_subscriptions`: Add missing column `trial_ends_at`
ALTER TABLE `hms_subscriptions` ADD COLUMN `trial_ends_at` datetime DEFAULT NULL AFTER `trial_started_at`;

-- Table `hms_subscriptions`: Add missing column `subscription_ends_at`
ALTER TABLE `hms_subscriptions` ADD COLUMN `subscription_ends_at` datetime DEFAULT NULL AFTER `trial_ends_at`;

-- Table `hms_subscriptions`: Add missing column `is_trial_used`
ALTER TABLE `hms_subscriptions` ADD COLUMN `is_trial_used` tinyint(1) DEFAULT '0' AFTER `subscription_ends_at`;

-- Table `hms_subscriptions`: Add missing column `created_at`
ALTER TABLE `hms_subscriptions` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_trial_used`;

-- Table `hms_subscriptions`: Add missing column `updated_at`
ALTER TABLE `hms_subscriptions` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `hms_subscriptions`: Add missing column `package_id`
ALTER TABLE `hms_subscriptions` ADD COLUMN `package_id` int(11) DEFAULT NULL AFTER `updated_at`;

-- Table `member_status_tiers`: Add missing column `tier_name`
ALTER TABLE `member_status_tiers` ADD COLUMN `tier_name` varchar(50) NOT NULL AFTER `id`;

-- Table `member_status_tiers`: Add missing column `tier_display_name`
ALTER TABLE `member_status_tiers` ADD COLUMN `tier_display_name` varchar(100) NOT NULL AFTER `tier_name`;

-- Table `member_status_tiers`: Add missing column `min_points`
ALTER TABLE `member_status_tiers` ADD COLUMN `min_points` int(11) NOT NULL AFTER `tier_display_name`;

-- Table `member_status_tiers`: Add missing column `tier_color`
ALTER TABLE `member_status_tiers` ADD COLUMN `tier_color` varchar(20) DEFAULT ''#666666'' AFTER `min_points`;

-- Table `member_status_tiers`: Add missing column `tier_icon`
ALTER TABLE `member_status_tiers` ADD COLUMN `tier_icon` varchar(100) DEFAULT NULL AFTER `tier_color`;

-- Table `member_status_tiers`: Add missing column `benefits`
ALTER TABLE `member_status_tiers` ADD COLUMN `benefits` text DEFAULT NULL AFTER `tier_icon`;

-- Table `member_status_tiers`: Add missing column `is_active`
ALTER TABLE `member_status_tiers` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `benefits`;

-- Table `member_status_tiers`: Add missing column `display_order`
ALTER TABLE `member_status_tiers` ADD COLUMN `display_order` int(11) DEFAULT '0' AFTER `is_active`;

-- Table `member_status_tiers`: Add missing column `created_at`
ALTER TABLE `member_status_tiers` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `display_order`;

-- Table `member_status_tiers`: Add missing column `updated_at`
ALTER TABLE `member_status_tiers` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `messages`: Add missing column `conversation_id`
ALTER TABLE `messages` ADD COLUMN `conversation_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `messages`: Add missing column `sender_id`
ALTER TABLE `messages` ADD COLUMN `sender_id` bigint(20) unsigned NOT NULL AFTER `conversation_id`;

-- Table `messages`: Add missing column `content`
ALTER TABLE `messages` ADD COLUMN `content` text NOT NULL AFTER `sender_id`;

-- Table `messages`: Add missing column `is_read`
ALTER TABLE `messages` ADD COLUMN `is_read` tinyint(1) DEFAULT '0' AFTER `content`;

-- Table `messages`: Add missing column `created_at`
ALTER TABLE `messages` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_read`;

-- Table `messages_backup_1769410022550`: Add missing column `sender_id`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `sender_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `messages_backup_1769410022550`: Add missing column `receiver_id`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `receiver_id` bigint(20) unsigned NOT NULL AFTER `sender_id`;

-- Table `messages_backup_1769410022550`: Add missing column `booking_id`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `booking_id` bigint(20) unsigned DEFAULT NULL AFTER `receiver_id`;

-- Table `messages_backup_1769410022550`: Add missing column `property_id`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `property_id` bigint(20) unsigned DEFAULT NULL AFTER `booking_id`;

-- Table `messages_backup_1769410022550`: Add missing column `message`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `message` text NOT NULL AFTER `property_id`;

-- Table `messages_backup_1769410022550`: Add missing column `message_type`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `message_type` enum('text','image','file') DEFAULT 'text' AFTER `message`;

-- Table `messages_backup_1769410022550`: Add missing column `is_read`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `is_read` tinyint(1) DEFAULT '0' AFTER `message_type`;

-- Table `messages_backup_1769410022550`: Add missing column `created_at`
ALTER TABLE `messages_backup_1769410022550` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_read`;

-- Table `notifications`: Add missing column `user_id`
ALTER TABLE `notifications` ADD COLUMN `user_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `notifications`: Add missing column `type`
ALTER TABLE `notifications` ADD COLUMN `type` enum('booking','payment','review','system','promotion') NOT NULL AFTER `user_id`;

-- Table `notifications`: Add missing column `title`
ALTER TABLE `notifications` ADD COLUMN `title` varchar(255) NOT NULL AFTER `type`;

-- Table `notifications`: Add missing column `message`
ALTER TABLE `notifications` ADD COLUMN `message` text NOT NULL AFTER `title`;

-- Table `notifications`: Add missing column `data`
ALTER TABLE `notifications` ADD COLUMN `data` longtext DEFAULT NULL AFTER `message`;

-- Table `notifications`: Add missing column `is_read`
ALTER TABLE `notifications` ADD COLUMN `is_read` tinyint(1) DEFAULT '0' AFTER `data`;

-- Table `notifications`: Add missing column `created_at`
ALTER TABLE `notifications` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_read`;

-- Table `orders`: Add missing column `booking_id`
ALTER TABLE `orders` ADD COLUMN `booking_id` int(11) DEFAULT NULL AFTER `id`;

-- Table `orders`: Add missing column `tran_id`
ALTER TABLE `orders` ADD COLUMN `tran_id` varchar(100) NOT NULL AFTER `booking_id`;

-- Table `orders`: Add missing column `val_id`
ALTER TABLE `orders` ADD COLUMN `val_id` varchar(100) DEFAULT NULL AFTER `tran_id`;

-- Table `orders`: Add missing column `amount`
ALTER TABLE `orders` ADD COLUMN `amount` decimal(10,2) NOT NULL AFTER `val_id`;

-- Table `orders`: Add missing column `status`
ALTER TABLE `orders` ADD COLUMN `status` varchar(50) DEFAULT 'PENDING' AFTER `amount`;

-- Table `orders`: Add missing column `created_at`
ALTER TABLE `orders` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `orders`: Add missing column `updated_at`
ALTER TABLE `orders` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `orders`: Add missing column `points_to_redeem`
ALTER TABLE `orders` ADD COLUMN `points_to_redeem` int(11) DEFAULT '0' AFTER `updated_at`;

-- Table `orders`: Add missing column `original_amount`
ALTER TABLE `orders` ADD COLUMN `original_amount` decimal(10,2) DEFAULT '0.00' AFTER `points_to_redeem`;

-- Table `orders`: Add missing column `package_id`
ALTER TABLE `orders` ADD COLUMN `package_id` int(11) DEFAULT NULL AFTER `original_amount`;

-- Table `orders`: Add missing column `host_id`
ALTER TABLE `orders` ADD COLUMN `host_id` int(11) DEFAULT NULL AFTER `package_id`;

-- Table `orders`: Add missing column `payment_method`
ALTER TABLE `orders` ADD COLUMN `payment_method` varchar(50) DEFAULT ''Online Payment'' AFTER `host_id`;

-- Table `owner_balances`: Add missing column `property_owner_id`
ALTER TABLE `owner_balances` ADD COLUMN `property_owner_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `owner_balances`: Add missing column `total_earnings`
ALTER TABLE `owner_balances` ADD COLUMN `total_earnings` decimal(12,2) DEFAULT '0.00' AFTER `property_owner_id`;

-- Table `owner_balances`: Add missing column `total_payouts`
ALTER TABLE `owner_balances` ADD COLUMN `total_payouts` decimal(12,2) DEFAULT '0.00' AFTER `total_earnings`;

-- Table `owner_balances`: Add missing column `current_balance`
ALTER TABLE `owner_balances` ADD COLUMN `current_balance` decimal(12,2) DEFAULT '0.00' AFTER `total_payouts`;

-- Table `owner_balances`: Add missing column `commission_paid_to_admin`
ALTER TABLE `owner_balances` ADD COLUMN `commission_paid_to_admin` decimal(12,2) DEFAULT '0.00' AFTER `current_balance`;

-- Table `owner_balances`: Add missing column `commission_pending`
ALTER TABLE `owner_balances` ADD COLUMN `commission_pending` decimal(12,2) DEFAULT '0.00' AFTER `commission_paid_to_admin`;

-- Table `owner_balances`: Add missing column `last_updated`
ALTER TABLE `owner_balances` ADD COLUMN `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `commission_pending`;

-- Table `owner_payouts`: Add missing column `property_owner_id`
ALTER TABLE `owner_payouts` ADD COLUMN `property_owner_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `owner_payouts`: Add missing column `payout_reference`
ALTER TABLE `owner_payouts` ADD COLUMN `payout_reference` varchar(50) NOT NULL AFTER `property_owner_id`;

-- Table `owner_payouts`: Add missing column `start_date`
ALTER TABLE `owner_payouts` ADD COLUMN `start_date` date NOT NULL AFTER `payout_reference`;

-- Table `owner_payouts`: Add missing column `end_date`
ALTER TABLE `owner_payouts` ADD COLUMN `end_date` date NOT NULL AFTER `start_date`;

-- Table `owner_payouts`: Add missing column `total_earnings`
ALTER TABLE `owner_payouts` ADD COLUMN `total_earnings` decimal(12,2) NOT NULL AFTER `end_date`;

-- Table `owner_payouts`: Add missing column `total_commission_paid`
ALTER TABLE `owner_payouts` ADD COLUMN `total_commission_paid` decimal(12,2) DEFAULT '0.00' AFTER `total_earnings`;

-- Table `owner_payouts`: Add missing column `net_payout`
ALTER TABLE `owner_payouts` ADD COLUMN `net_payout` decimal(12,2) NOT NULL AFTER `total_commission_paid`;

-- Table `owner_payouts`: Add missing column `payment_method`
ALTER TABLE `owner_payouts` ADD COLUMN `payment_method` enum('bank_transfer','bkash','nagad','rocket','cash') NOT NULL AFTER `net_payout`;

-- Table `owner_payouts`: Add missing column `payment_status`
ALTER TABLE `owner_payouts` ADD COLUMN `payment_status` enum('pending','processing','completed','failed') DEFAULT 'pending' AFTER `payment_method`;

-- Table `owner_payouts`: Add missing column `payment_date`
ALTER TABLE `owner_payouts` ADD COLUMN `payment_date` timestamp DEFAULT NULL AFTER `payment_status`;

-- Table `owner_payouts`: Add missing column `payment_reference`
ALTER TABLE `owner_payouts` ADD COLUMN `payment_reference` varchar(100) DEFAULT NULL AFTER `payment_date`;

-- Table `owner_payouts`: Add missing column `bank_name`
ALTER TABLE `owner_payouts` ADD COLUMN `bank_name` varchar(100) DEFAULT NULL AFTER `payment_reference`;

-- Table `owner_payouts`: Add missing column `account_number`
ALTER TABLE `owner_payouts` ADD COLUMN `account_number` varchar(50) DEFAULT NULL AFTER `bank_name`;

-- Table `owner_payouts`: Add missing column `routing_number`
ALTER TABLE `owner_payouts` ADD COLUMN `routing_number` varchar(20) DEFAULT NULL AFTER `account_number`;

-- Table `owner_payouts`: Add missing column `mobile_number`
ALTER TABLE `owner_payouts` ADD COLUMN `mobile_number` varchar(20) DEFAULT NULL AFTER `routing_number`;

-- Table `owner_payouts`: Add missing column `notes`
ALTER TABLE `owner_payouts` ADD COLUMN `notes` text DEFAULT NULL AFTER `mobile_number`;

-- Table `owner_payouts`: Add missing column `created_at`
ALTER TABLE `owner_payouts` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `notes`;

-- Table `owner_payouts`: Add missing column `updated_at`
ALTER TABLE `owner_payouts` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `owner_payout_items`: Add missing column `payout_id`
ALTER TABLE `owner_payout_items` ADD COLUMN `payout_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `owner_payout_items`: Add missing column `booking_id`
ALTER TABLE `owner_payout_items` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `payout_id`;

-- Table `owner_payout_items`: Add missing column `booking_total`
ALTER TABLE `owner_payout_items` ADD COLUMN `booking_total` decimal(10,2) NOT NULL AFTER `booking_id`;

-- Table `owner_payout_items`: Add missing column `admin_commission`
ALTER TABLE `owner_payout_items` ADD COLUMN `admin_commission` decimal(10,2) NOT NULL AFTER `booking_total`;

-- Table `owner_payout_items`: Add missing column `owner_earnings`
ALTER TABLE `owner_payout_items` ADD COLUMN `owner_earnings` decimal(10,2) NOT NULL AFTER `admin_commission`;

-- Table `owner_payout_items`: Add missing column `commission_paid_to_admin`
ALTER TABLE `owner_payout_items` ADD COLUMN `commission_paid_to_admin` tinyint(1) DEFAULT '0' AFTER `owner_earnings`;

-- Table `owner_payout_items`: Add missing column `created_at`
ALTER TABLE `owner_payout_items` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `commission_paid_to_admin`;

-- Table `password_resets`: Add missing column `token`
ALTER TABLE `password_resets` ADD COLUMN `token` varchar(255) NOT NULL AFTER `email`;

-- Table `password_resets`: Add missing column `created_at`
ALTER TABLE `password_resets` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `token`;

-- Table `payments`: Add missing column `booking_id`
ALTER TABLE `payments` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `payments`: Add missing column `payment_reference`
ALTER TABLE `payments` ADD COLUMN `payment_reference` varchar(50) NOT NULL AFTER `booking_id`;

-- Table `payments`: Add missing column `payment_method`
ALTER TABLE `payments` ADD COLUMN `payment_method` varchar(50) DEFAULT NULL AFTER `payment_reference`;

-- Table `payments`: Add missing column `payment_type`
ALTER TABLE `payments` ADD COLUMN `payment_type` enum('booking','refund','security_deposit') DEFAULT 'booking' AFTER `payment_method`;

-- Table `payments`: Add missing column `transaction_type`
ALTER TABLE `payments` ADD COLUMN `transaction_type` varchar(50) DEFAULT 'payment' AFTER `payment_type`;

-- Table `payments`: Add missing column `amount`
ALTER TABLE `payments` ADD COLUMN `amount` decimal(10,2) NOT NULL AFTER `transaction_type`;

-- Table `payments`: Add missing column `dr_amount`
ALTER TABLE `payments` ADD COLUMN `dr_amount` decimal(10,2) DEFAULT '0.00' AFTER `amount`;

-- Table `payments`: Add missing column `cr_amount`
ALTER TABLE `payments` ADD COLUMN `cr_amount` decimal(10,2) DEFAULT '0.00' AFTER `dr_amount`;

-- Table `payments`: Add missing column `running_balance`
ALTER TABLE `payments` ADD COLUMN `running_balance` decimal(10,2) DEFAULT '0.00' AFTER `cr_amount`;

-- Table `payments`: Add missing column `currency`
ALTER TABLE `payments` ADD COLUMN `currency` varchar(3) DEFAULT 'BDT' AFTER `running_balance`;

-- Table `payments`: Add missing column `gateway_transaction_id`
ALTER TABLE `payments` ADD COLUMN `gateway_transaction_id` varchar(100) DEFAULT NULL AFTER `currency`;

-- Table `payments`: Add missing column `bank_tran_id`
ALTER TABLE `payments` ADD COLUMN `bank_tran_id` varchar(100) DEFAULT NULL AFTER `gateway_transaction_id`;

-- Table `payments`: Add missing column `gateway_response`
ALTER TABLE `payments` ADD COLUMN `gateway_response` longtext DEFAULT NULL AFTER `bank_tran_id`;

-- Table `payments`: Add missing column `notes`
ALTER TABLE `payments` ADD COLUMN `notes` text DEFAULT NULL AFTER `gateway_response`;

-- Table `payments`: Add missing column `status`
ALTER TABLE `payments` ADD COLUMN `status` enum('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending' AFTER `notes`;

-- Table `payments`: Add missing column `payment_date`
ALTER TABLE `payments` ADD COLUMN `payment_date` timestamp DEFAULT NULL AFTER `status`;

-- Table `payments`: Add missing column `processed_at`
ALTER TABLE `payments` ADD COLUMN `processed_at` timestamp DEFAULT NULL AFTER `payment_date`;

-- Table `payments`: Add missing column `created_at`
ALTER TABLE `payments` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `processed_at`;

-- Table `payments`: Add missing column `updated_at`
ALTER TABLE `payments` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `payments`: Add missing column `received_by`
ALTER TABLE `payments` ADD COLUMN `received_by` varchar(100) DEFAULT NULL AFTER `updated_at`;

-- Table `payments`: Add missing column `account_name`
ALTER TABLE `payments` ADD COLUMN `account_name` varchar(100) DEFAULT NULL AFTER `received_by`;

-- Table `payment_settings`: Add missing column `provider_name`
ALTER TABLE `payment_settings` ADD COLUMN `provider_name` varchar(50) NOT NULL AFTER `id`;

-- Table `payment_settings`: Add missing column `store_id`
ALTER TABLE `payment_settings` ADD COLUMN `store_id` varchar(255) NOT NULL AFTER `provider_name`;

-- Table `payment_settings`: Add missing column `store_password`
ALTER TABLE `payment_settings` ADD COLUMN `store_password` varchar(255) NOT NULL AFTER `store_id`;

-- Table `payment_settings`: Add missing column `is_live`
ALTER TABLE `payment_settings` ADD COLUMN `is_live` tinyint(1) DEFAULT '0' AFTER `store_password`;

-- Table `payment_settings`: Add missing column `currency`
ALTER TABLE `payment_settings` ADD COLUMN `currency` varchar(10) DEFAULT 'BDT' AFTER `is_live`;

-- Table `payment_settings`: Add missing column `updated_at`
ALTER TABLE `payment_settings` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `currency`;

-- Table `properties`: Add missing column `owner_id`
ALTER TABLE `properties` ADD COLUMN `owner_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `properties`: Add missing column `title`
ALTER TABLE `properties` ADD COLUMN `title` varchar(255) NOT NULL AFTER `owner_id`;

-- Table `properties`: Add missing column `internal_name`
ALTER TABLE `properties` ADD COLUMN `internal_name` varchar(255) DEFAULT NULL AFTER `title`;

-- Table `properties`: Add missing column `description`
ALTER TABLE `properties` ADD COLUMN `description` text NOT NULL AFTER `internal_name`;

-- Table `properties`: Add missing column `property_type`
ALTER TABLE `properties` ADD COLUMN `property_type` enum('room','villa','apartment','house','hotel','hotels') NOT NULL AFTER `description`;

-- Table `properties`: Add missing column `property_category`
ALTER TABLE `properties` ADD COLUMN `property_category` enum('budget','standard','premium','luxury') DEFAULT 'standard' AFTER `property_type`;

-- Table `properties`: Add missing column `address`
ALTER TABLE `properties` ADD COLUMN `address` text NOT NULL AFTER `property_category`;

-- Table `properties`: Add missing column `city`
ALTER TABLE `properties` ADD COLUMN `city` varchar(100) NOT NULL AFTER `address`;

-- Table `properties`: Add missing column `state`
ALTER TABLE `properties` ADD COLUMN `state` varchar(100) NOT NULL AFTER `city`;

-- Table `properties`: Add missing column `country`
ALTER TABLE `properties` ADD COLUMN `country` varchar(100) NOT NULL AFTER `state`;

-- Table `properties`: Add missing column `postal_code`
ALTER TABLE `properties` ADD COLUMN `postal_code` varchar(20) NOT NULL AFTER `country`;

-- Table `properties`: Add missing column `latitude`
ALTER TABLE `properties` ADD COLUMN `latitude` decimal(10,8) DEFAULT NULL AFTER `postal_code`;

-- Table `properties`: Add missing column `longitude`
ALTER TABLE `properties` ADD COLUMN `longitude` decimal(11,8) DEFAULT NULL AFTER `latitude`;

-- Table `properties`: Add missing column `bedrooms`
ALTER TABLE `properties` ADD COLUMN `bedrooms` int(11) NOT NULL DEFAULT '0' AFTER `longitude`;

-- Table `properties`: Add missing column `bathrooms`
ALTER TABLE `properties` ADD COLUMN `bathrooms` int(11) NOT NULL DEFAULT '0' AFTER `bedrooms`;

-- Table `properties`: Add missing column `max_guests`
ALTER TABLE `properties` ADD COLUMN `max_guests` int(11) NOT NULL DEFAULT '1' AFTER `bathrooms`;

-- Table `properties`: Add missing column `size_sqft`
ALTER TABLE `properties` ADD COLUMN `size_sqft` int(11) DEFAULT NULL AFTER `max_guests`;

-- Table `properties`: Add missing column `floor_number`
ALTER TABLE `properties` ADD COLUMN `floor_number` int(11) DEFAULT NULL AFTER `size_sqft`;

-- Table `properties`: Add missing column `base_price`
ALTER TABLE `properties` ADD COLUMN `base_price` decimal(10,2) NOT NULL AFTER `floor_number`;

-- Table `properties`: Add missing column `cleaning_fee`
ALTER TABLE `properties` ADD COLUMN `cleaning_fee` decimal(10,2) DEFAULT '0.00' AFTER `base_price`;

-- Table `properties`: Add missing column `security_deposit`
ALTER TABLE `properties` ADD COLUMN `security_deposit` decimal(10,2) DEFAULT '0.00' AFTER `cleaning_fee`;

-- Table `properties`: Add missing column `extra_guest_fee`
ALTER TABLE `properties` ADD COLUMN `extra_guest_fee` decimal(10,2) DEFAULT '0.00' AFTER `security_deposit`;

-- Table `properties`: Add missing column `currency`
ALTER TABLE `properties` ADD COLUMN `currency` varchar(3) DEFAULT 'BDT' AFTER `extra_guest_fee`;

-- Table `properties`: Add missing column `status`
ALTER TABLE `properties` ADD COLUMN `status` enum('active','inactive','suspended','pending_approval','in_progress') DEFAULT 'in_progress' AFTER `currency`;

-- Table `properties`: Add missing column `is_featured`
ALTER TABLE `properties` ADD COLUMN `is_featured` tinyint(1) DEFAULT '0' AFTER `status`;

-- Table `properties`: Add missing column `is_instant_book`
ALTER TABLE `properties` ADD COLUMN `is_instant_book` tinyint(1) DEFAULT '0' AFTER `is_featured`;

-- Table `properties`: Add missing column `is_non_refundable`
ALTER TABLE `properties` ADD COLUMN `is_non_refundable` tinyint(1) DEFAULT '0' AFTER `is_instant_book`;

-- Table `properties`: Add missing column `check_in_time`
ALTER TABLE `properties` ADD COLUMN `check_in_time` time DEFAULT ''15:00:00'' AFTER `is_non_refundable`;

-- Table `properties`: Add missing column `check_out_time`
ALTER TABLE `properties` ADD COLUMN `check_out_time` time DEFAULT ''11:00:00'' AFTER `check_in_time`;

-- Table `properties`: Add missing column `minimum_stay`
ALTER TABLE `properties` ADD COLUMN `minimum_stay` int(11) DEFAULT '1' AFTER `check_out_time`;

-- Table `properties`: Add missing column `maximum_stay`
ALTER TABLE `properties` ADD COLUMN `maximum_stay` int(11) DEFAULT NULL AFTER `minimum_stay`;

-- Table `properties`: Add missing column `average_rating`
ALTER TABLE `properties` ADD COLUMN `average_rating` decimal(3,2) DEFAULT '0.00' AFTER `maximum_stay`;

-- Table `properties`: Add missing column `total_reviews`
ALTER TABLE `properties` ADD COLUMN `total_reviews` int(11) DEFAULT '0' AFTER `average_rating`;

-- Table `properties`: Add missing column `created_at`
ALTER TABLE `properties` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `total_reviews`;

-- Table `properties`: Add missing column `updated_at`
ALTER TABLE `properties` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `properties`: Add missing column `display_category_id`
ALTER TABLE `properties` ADD COLUMN `display_category_id` int(11) DEFAULT NULL AFTER `updated_at`;

-- Table `properties`: Add missing column `is_hms_enabled`
ALTER TABLE `properties` ADD COLUMN `is_hms_enabled` tinyint(1) DEFAULT '0' AFTER `display_category_id`;

-- Table `properties`: Add missing column `is_single_unit`
ALTER TABLE `properties` ADD COLUMN `is_single_unit` tinyint(1) DEFAULT '0' AFTER `is_hms_enabled`;

-- Table `properties`: Add missing column `slug`
ALTER TABLE `properties` ADD COLUMN `slug` varchar(255) DEFAULT NULL AFTER `is_single_unit`;

-- Table `properties`: Add missing column `auto_accept_bookings`
ALTER TABLE `properties` ADD COLUMN `auto_accept_bookings` tinyint(1) NOT NULL DEFAULT '0' AFTER `slug`;

-- Table `properties`: Add missing column `monthly_rent_enabled`
ALTER TABLE `properties` ADD COLUMN `monthly_rent_enabled` tinyint(1) NOT NULL DEFAULT '0' AFTER `auto_accept_bookings`;

-- Table `properties`: Add missing column `monthly_stay_type`
ALTER TABLE `properties` ADD COLUMN `monthly_stay_type` enum('both','monthly_only') NOT NULL DEFAULT 'both' AFTER `monthly_rent_enabled`;

-- Table `properties`: Add missing column `monthly_min_stay_nights`
ALTER TABLE `properties` ADD COLUMN `monthly_min_stay_nights` int(11) NOT NULL DEFAULT '30' AFTER `monthly_stay_type`;

-- Table `properties`: Add missing column `monthly_rent_amount`
ALTER TABLE `properties` ADD COLUMN `monthly_rent_amount` decimal(12,2) DEFAULT NULL AFTER `monthly_min_stay_nights`;

-- Table `properties`: Add missing column `monthly_advance_amount`
ALTER TABLE `properties` ADD COLUMN `monthly_advance_amount` decimal(12,2) DEFAULT NULL AFTER `monthly_rent_amount`;

-- Table `properties`: Add missing column `monthly_furnished`
ALTER TABLE `properties` ADD COLUMN `monthly_furnished` tinyint(1) NOT NULL DEFAULT '1' AFTER `monthly_advance_amount`;

-- Table `properties`: Add missing column `monthly_wifi_included`
ALTER TABLE `properties` ADD COLUMN `monthly_wifi_included` tinyint(1) NOT NULL DEFAULT '0' AFTER `monthly_furnished`;

-- Table `properties`: Add missing column `monthly_electricity_included`
ALTER TABLE `properties` ADD COLUMN `monthly_electricity_included` tinyint(1) NOT NULL DEFAULT '0' AFTER `monthly_wifi_included`;

-- Table `properties`: Add missing column `monthly_gas_included`
ALTER TABLE `properties` ADD COLUMN `monthly_gas_included` tinyint(1) NOT NULL DEFAULT '0' AFTER `monthly_electricity_included`;

-- Table `properties`: Add missing column `monthly_water_included`
ALTER TABLE `properties` ADD COLUMN `monthly_water_included` tinyint(1) NOT NULL DEFAULT '0' AFTER `monthly_gas_included`;

-- Table `properties`: Add missing column `monthly_cleaning_included`
ALTER TABLE `properties` ADD COLUMN `monthly_cleaning_included` tinyint(1) NOT NULL DEFAULT '0' AFTER `monthly_water_included`;

-- Table `properties`: Add missing column `monthly_service_charge_included`
ALTER TABLE `properties` ADD COLUMN `monthly_service_charge_included` tinyint(1) NOT NULL DEFAULT '0' AFTER `monthly_cleaning_included`;

-- Table `properties`: Add missing column `monthly_inclusions_notes`
ALTER TABLE `properties` ADD COLUMN `monthly_inclusions_notes` text DEFAULT NULL AFTER `monthly_service_charge_included`;

-- Table `properties`: Add missing column `monthly_security_deposit`
ALTER TABLE `properties` ADD COLUMN `monthly_security_deposit` decimal(12,2) DEFAULT NULL AFTER `monthly_inclusions_notes`;

-- Table `properties`: Add missing column `monthly_cancellation_policy`
ALTER TABLE `properties` ADD COLUMN `monthly_cancellation_policy` enum('flexible','moderate','strict','custom') NOT NULL DEFAULT 'moderate' AFTER `monthly_security_deposit`;

-- Table `properties`: Add missing column `monthly_approved`
ALTER TABLE `properties` ADD COLUMN `monthly_approved` tinyint(1) NOT NULL DEFAULT '0' AFTER `monthly_cancellation_policy`;

-- Table `property_amenities`: Add missing column `property_id`
ALTER TABLE `property_amenities` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_amenities`: Add missing column `amenity_id`
ALTER TABLE `property_amenities` ADD COLUMN `amenity_id` bigint(20) unsigned NOT NULL AFTER `property_id`;

-- Table `property_amenities`: Add missing column `created_at`
ALTER TABLE `property_amenities` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `amenity_id`;

-- Table `property_availability`: Add missing column `property_id`
ALTER TABLE `property_availability` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_availability`: Add missing column `date`
ALTER TABLE `property_availability` ADD COLUMN `date` date NOT NULL AFTER `property_id`;

-- Table `property_availability`: Add missing column `is_available`
ALTER TABLE `property_availability` ADD COLUMN `is_available` tinyint(1) DEFAULT '1' AFTER `date`;

-- Table `property_availability`: Add missing column `price`
ALTER TABLE `property_availability` ADD COLUMN `price` decimal(10,2) DEFAULT NULL AFTER `is_available`;

-- Table `property_availability`: Add missing column `minimum_stay`
ALTER TABLE `property_availability` ADD COLUMN `minimum_stay` int(11) DEFAULT NULL AFTER `price`;

-- Table `property_availability`: Add missing column `created_at`
ALTER TABLE `property_availability` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `minimum_stay`;

-- Table `property_availability`: Add missing column `updated_at`
ALTER TABLE `property_availability` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `property_images`: Add missing column `property_id`
ALTER TABLE `property_images` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_images`: Add missing column `image_url`
ALTER TABLE `property_images` ADD COLUMN `image_url` longtext DEFAULT NULL AFTER `property_id`;

-- Table `property_images`: Add missing column `image_type`
ALTER TABLE `property_images` ADD COLUMN `image_type` enum('main','gallery','amenity') DEFAULT 'gallery' AFTER `image_url`;

-- Table `property_images`: Add missing column `alt_text`
ALTER TABLE `property_images` ADD COLUMN `alt_text` varchar(255) DEFAULT NULL AFTER `image_type`;

-- Table `property_images`: Add missing column `sort_order`
ALTER TABLE `property_images` ADD COLUMN `sort_order` int(11) DEFAULT '0' AFTER `alt_text`;

-- Table `property_images`: Add missing column `is_active`
ALTER TABLE `property_images` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `sort_order`;

-- Table `property_images`: Add missing column `created_at`
ALTER TABLE `property_images` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `property_owners`: Add missing column `user_id`
ALTER TABLE `property_owners` ADD COLUMN `user_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_owners`: Add missing column `business_name`
ALTER TABLE `property_owners` ADD COLUMN `business_name` varchar(255) DEFAULT NULL AFTER `user_id`;

-- Table `property_owners`: Add missing column `business_license`
ALTER TABLE `property_owners` ADD COLUMN `business_license` varchar(100) DEFAULT NULL AFTER `business_name`;

-- Table `property_owners`: Add missing column `tax_id`
ALTER TABLE `property_owners` ADD COLUMN `tax_id` varchar(100) DEFAULT NULL AFTER `business_license`;

-- Table `property_owners`: Add missing column `bank_account_number`
ALTER TABLE `property_owners` ADD COLUMN `bank_account_number` varchar(50) DEFAULT NULL AFTER `tax_id`;

-- Table `property_owners`: Add missing column `bank_name`
ALTER TABLE `property_owners` ADD COLUMN `bank_name` varchar(100) DEFAULT NULL AFTER `bank_account_number`;

-- Table `property_owners`: Add missing column `bank_routing_number`
ALTER TABLE `property_owners` ADD COLUMN `bank_routing_number` varchar(20) DEFAULT NULL AFTER `bank_name`;

-- Table `property_owners`: Add missing column `commission_rate`
ALTER TABLE `property_owners` ADD COLUMN `commission_rate` decimal(5,2) DEFAULT '10.00' AFTER `bank_routing_number`;

-- Table `property_owners`: Add missing column `is_verified`
ALTER TABLE `property_owners` ADD COLUMN `is_verified` tinyint(1) DEFAULT '0' AFTER `commission_rate`;

-- Table `property_owners`: Add missing column `verification_documents`
ALTER TABLE `property_owners` ADD COLUMN `verification_documents` longtext DEFAULT NULL AFTER `is_verified`;

-- Table `property_owners`: Add missing column `created_at`
ALTER TABLE `property_owners` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `verification_documents`;

-- Table `property_owners`: Add missing column `updated_at`
ALTER TABLE `property_owners` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `property_owners`: Add missing column `mfs_provider`
ALTER TABLE `property_owners` ADD COLUMN `mfs_provider` varchar(20) DEFAULT NULL AFTER `updated_at`;

-- Table `property_owners`: Add missing column `mfs_wallet_number`
ALTER TABLE `property_owners` ADD COLUMN `mfs_wallet_number` varchar(20) DEFAULT NULL AFTER `mfs_provider`;

-- Table `property_owners`: Add missing column `mfs_account_name`
ALTER TABLE `property_owners` ADD COLUMN `mfs_account_name` varchar(100) DEFAULT NULL AFTER `mfs_wallet_number`;

-- Table `property_owner_blocks`: Add missing column `property_owner_id`
ALTER TABLE `property_owner_blocks` ADD COLUMN `property_owner_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_owner_blocks`: Add missing column `blocked_by`
ALTER TABLE `property_owner_blocks` ADD COLUMN `blocked_by` bigint(20) unsigned NOT NULL AFTER `property_owner_id`;

-- Table `property_owner_blocks`: Add missing column `block_type`
ALTER TABLE `property_owner_blocks` ADD COLUMN `block_type` enum('listing','booking','payment','all') NOT NULL AFTER `blocked_by`;

-- Table `property_owner_blocks`: Add missing column `reason`
ALTER TABLE `property_owner_blocks` ADD COLUMN `reason` text NOT NULL AFTER `block_type`;

-- Table `property_owner_blocks`: Add missing column `description`
ALTER TABLE `property_owner_blocks` ADD COLUMN `description` text DEFAULT NULL AFTER `reason`;

-- Table `property_owner_blocks`: Add missing column `affected_properties`
ALTER TABLE `property_owner_blocks` ADD COLUMN `affected_properties` longtext DEFAULT NULL AFTER `description`;

-- Table `property_owner_blocks`: Add missing column `status`
ALTER TABLE `property_owner_blocks` ADD COLUMN `status` enum('active','expired','revoked') DEFAULT 'active' AFTER `affected_properties`;

-- Table `property_owner_blocks`: Add missing column `blocked_at`
ALTER TABLE `property_owner_blocks` ADD COLUMN `blocked_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `property_owner_blocks`: Add missing column `expires_at`
ALTER TABLE `property_owner_blocks` ADD COLUMN `expires_at` timestamp DEFAULT NULL AFTER `blocked_at`;

-- Table `property_owner_blocks`: Add missing column `revoked_at`
ALTER TABLE `property_owner_blocks` ADD COLUMN `revoked_at` timestamp DEFAULT NULL AFTER `expires_at`;

-- Table `property_owner_blocks`: Add missing column `revoked_by`
ALTER TABLE `property_owner_blocks` ADD COLUMN `revoked_by` bigint(20) unsigned DEFAULT NULL AFTER `revoked_at`;

-- Table `property_owner_blocks`: Add missing column `created_at`
ALTER TABLE `property_owner_blocks` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `revoked_by`;

-- Table `property_owner_blocks`: Add missing column `updated_at`
ALTER TABLE `property_owner_blocks` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `property_owner_payouts`: Add missing column `property_owner_id`
ALTER TABLE `property_owner_payouts` ADD COLUMN `property_owner_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_owner_payouts`: Add missing column `amount`
ALTER TABLE `property_owner_payouts` ADD COLUMN `amount` decimal(10,2) NOT NULL AFTER `property_owner_id`;

-- Table `property_owner_payouts`: Add missing column `payment_method`
ALTER TABLE `property_owner_payouts` ADD COLUMN `payment_method` varchar(50) NOT NULL DEFAULT 'bank_transfer' AFTER `amount`;

-- Table `property_owner_payouts`: Add missing column `notes`
ALTER TABLE `property_owner_payouts` ADD COLUMN `notes` text DEFAULT NULL AFTER `payment_method`;

-- Table `property_owner_payouts`: Add missing column `status`
ALTER TABLE `property_owner_payouts` ADD COLUMN `status` enum('pending','approved','paid','rejected') DEFAULT 'pending' AFTER `notes`;

-- Table `property_owner_payouts`: Add missing column `admin_notes`
ALTER TABLE `property_owner_payouts` ADD COLUMN `admin_notes` text DEFAULT NULL AFTER `status`;

-- Table `property_owner_payouts`: Add missing column `requested_at`
ALTER TABLE `property_owner_payouts` ADD COLUMN `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `admin_notes`;

-- Table `property_owner_payouts`: Add missing column `processed_at`
ALTER TABLE `property_owner_payouts` ADD COLUMN `processed_at` timestamp DEFAULT NULL AFTER `requested_at`;

-- Table `property_owner_payouts`: Add missing column `created_at`
ALTER TABLE `property_owner_payouts` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `processed_at`;

-- Table `property_owner_payouts`: Add missing column `updated_at`
ALTER TABLE `property_owner_payouts` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `property_policies`: Add missing column `property_id`
ALTER TABLE `property_policies` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_policies`: Add missing column `cancellation_policy_id`
ALTER TABLE `property_policies` ADD COLUMN `cancellation_policy_id` bigint(20) unsigned NOT NULL AFTER `property_id`;

-- Table `property_policies`: Add missing column `created_at`
ALTER TABLE `property_policies` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `cancellation_policy_id`;

-- Table `property_reports`: Add missing column `property_id`
ALTER TABLE `property_reports` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_reports`: Add missing column `user_id`
ALTER TABLE `property_reports` ADD COLUMN `user_id` bigint(20) unsigned DEFAULT NULL AFTER `property_id`;

-- Table `property_reports`: Add missing column `reason`
ALTER TABLE `property_reports` ADD COLUMN `reason` varchar(255) NOT NULL AFTER `user_id`;

-- Table `property_reports`: Add missing column `detail`
ALTER TABLE `property_reports` ADD COLUMN `detail` varchar(255) DEFAULT NULL AFTER `reason`;

-- Table `property_reports`: Add missing column `status`
ALTER TABLE `property_reports` ADD COLUMN `status` enum('pending','investigating','resolved','dismissed') DEFAULT 'pending' AFTER `detail`;

-- Table `property_reports`: Add missing column `created_at`
ALTER TABLE `property_reports` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `property_reports`: Add missing column `updated_at`
ALTER TABLE `property_reports` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `property_rules`: Add missing column `property_id`
ALTER TABLE `property_rules` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `property_rules`: Add missing column `rule_type`
ALTER TABLE `property_rules` ADD COLUMN `rule_type` enum('check_in','check_out','smoking','pets','parties','quiet_hours','other') NOT NULL AFTER `property_id`;

-- Table `property_rules`: Add missing column `title`
ALTER TABLE `property_rules` ADD COLUMN `title` varchar(255) NOT NULL AFTER `rule_type`;

-- Table `property_rules`: Add missing column `description`
ALTER TABLE `property_rules` ADD COLUMN `description` text NOT NULL AFTER `title`;

-- Table `property_rules`: Add missing column `is_mandatory`
ALTER TABLE `property_rules` ADD COLUMN `is_mandatory` tinyint(1) DEFAULT '0' AFTER `description`;

-- Table `property_rules`: Add missing column `created_at`
ALTER TABLE `property_rules` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_mandatory`;

-- Table `property_rules`: Add missing column `updated_at`
ALTER TABLE `property_rules` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `property_types`: Add missing column `name`
ALTER TABLE `property_types` ADD COLUMN `name` varchar(255) NOT NULL AFTER `id`;

-- Table `property_types`: Add missing column `description`
ALTER TABLE `property_types` ADD COLUMN `description` text DEFAULT NULL AFTER `name`;

-- Table `property_types`: Add missing column `sort_order`
ALTER TABLE `property_types` ADD COLUMN `sort_order` int(11) DEFAULT '0' AFTER `description`;

-- Table `property_types`: Add missing column `is_active`
ALTER TABLE `property_types` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `sort_order`;

-- Table `property_types`: Add missing column `created_at`
ALTER TABLE `property_types` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `property_types`: Add missing column `updated_at`
ALTER TABLE `property_types` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `property_types`: Add missing column `icon_url`
ALTER TABLE `property_types` ADD COLUMN `icon_url` varchar(500) DEFAULT NULL AFTER `updated_at`;

-- Table `push_subscriptions`: Add missing column `user_id`
ALTER TABLE `push_subscriptions` ADD COLUMN `user_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `push_subscriptions`: Add missing column `endpoint`
ALTER TABLE `push_subscriptions` ADD COLUMN `endpoint` text NOT NULL AFTER `user_id`;

-- Table `push_subscriptions`: Add missing column `p256dh_key`
ALTER TABLE `push_subscriptions` ADD COLUMN `p256dh_key` text NOT NULL AFTER `endpoint`;

-- Table `push_subscriptions`: Add missing column `auth_key`
ALTER TABLE `push_subscriptions` ADD COLUMN `auth_key` text NOT NULL AFTER `p256dh_key`;

-- Table `push_subscriptions`: Add missing column `user_agent`
ALTER TABLE `push_subscriptions` ADD COLUMN `user_agent` varchar(512) DEFAULT NULL AFTER `auth_key`;

-- Table `push_subscriptions`: Add missing column `created_at`
ALTER TABLE `push_subscriptions` ADD COLUMN `created_at` datetime DEFAULT CURRENT_TIMESTAMP AFTER `user_agent`;

-- Table `push_subscriptions`: Add missing column `updated_at`
ALTER TABLE `push_subscriptions` ADD COLUMN `updated_at` datetime DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `refunds`: Add missing column `booking_id`
ALTER TABLE `refunds` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `refunds`: Add missing column `payment_id`
ALTER TABLE `refunds` ADD COLUMN `payment_id` bigint(20) unsigned NOT NULL AFTER `booking_id`;

-- Table `refunds`: Add missing column `refund_reference`
ALTER TABLE `refunds` ADD COLUMN `refund_reference` varchar(50) NOT NULL AFTER `payment_id`;

-- Table `refunds`: Add missing column `original_amount`
ALTER TABLE `refunds` ADD COLUMN `original_amount` decimal(10,2) NOT NULL AFTER `refund_reference`;

-- Table `refunds`: Add missing column `refund_amount`
ALTER TABLE `refunds` ADD COLUMN `refund_amount` decimal(10,2) NOT NULL AFTER `original_amount`;

-- Table `refunds`: Add missing column `service_charge`
ALTER TABLE `refunds` ADD COLUMN `service_charge` decimal(10,2) DEFAULT '0.00' AFTER `refund_amount`;

-- Table `refunds`: Add missing column `cancellation_fee`
ALTER TABLE `refunds` ADD COLUMN `cancellation_fee` decimal(10,2) DEFAULT '0.00' AFTER `service_charge`;

-- Table `refunds`: Add missing column `processing_fee`
ALTER TABLE `refunds` ADD COLUMN `processing_fee` decimal(10,2) DEFAULT '0.00' AFTER `cancellation_fee`;

-- Table `refunds`: Add missing column `net_refund`
ALTER TABLE `refunds` ADD COLUMN `net_refund` decimal(10,2) NOT NULL AFTER `processing_fee`;

-- Table `refunds`: Add missing column `refund_reason`
ALTER TABLE `refunds` ADD COLUMN `refund_reason` text NOT NULL AFTER `net_refund`;

-- Table `refunds`: Add missing column `refund_type`
ALTER TABLE `refunds` ADD COLUMN `refund_type` enum('full','partial','penalty','no_show') NOT NULL AFTER `refund_reason`;

-- Table `refunds`: Add missing column `cancellation_policy_applied`
ALTER TABLE `refunds` ADD COLUMN `cancellation_policy_applied` varchar(100) DEFAULT NULL AFTER `refund_type`;

-- Table `refunds`: Add missing column `status`
ALTER TABLE `refunds` ADD COLUMN `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending' AFTER `cancellation_policy_applied`;

-- Table `refunds`: Add missing column `processed_by`
ALTER TABLE `refunds` ADD COLUMN `processed_by` bigint(20) unsigned DEFAULT NULL AFTER `status`;

-- Table `refunds`: Add missing column `processed_at`
ALTER TABLE `refunds` ADD COLUMN `processed_at` timestamp DEFAULT NULL AFTER `processed_by`;

-- Table `refunds`: Add missing column `gateway_refund_id`
ALTER TABLE `refunds` ADD COLUMN `gateway_refund_id` varchar(100) DEFAULT NULL AFTER `processed_at`;

-- Table `refunds`: Add missing column `gateway_response`
ALTER TABLE `refunds` ADD COLUMN `gateway_response` longtext DEFAULT NULL AFTER `gateway_refund_id`;

-- Table `refunds`: Add missing column `requested_at`
ALTER TABLE `refunds` ADD COLUMN `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `gateway_response`;

-- Table `refunds`: Add missing column `approved_at`
ALTER TABLE `refunds` ADD COLUMN `approved_at` timestamp DEFAULT NULL AFTER `requested_at`;

-- Table `refunds`: Add missing column `completed_at`
ALTER TABLE `refunds` ADD COLUMN `completed_at` timestamp DEFAULT NULL AFTER `approved_at`;

-- Table `refunds`: Add missing column `created_at`
ALTER TABLE `refunds` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `completed_at`;

-- Table `refunds`: Add missing column `updated_at`
ALTER TABLE `refunds` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `refund_service_charges`: Add missing column `charge_name`
ALTER TABLE `refund_service_charges` ADD COLUMN `charge_name` varchar(100) NOT NULL AFTER `id`;

-- Table `refund_service_charges`: Add missing column `charge_type`
ALTER TABLE `refund_service_charges` ADD COLUMN `charge_type` enum('percentage','fixed_amount') NOT NULL AFTER `charge_name`;

-- Table `refund_service_charges`: Add missing column `charge_value`
ALTER TABLE `refund_service_charges` ADD COLUMN `charge_value` decimal(10,2) NOT NULL AFTER `charge_type`;

-- Table `refund_service_charges`: Add missing column `minimum_charge`
ALTER TABLE `refund_service_charges` ADD COLUMN `minimum_charge` decimal(10,2) DEFAULT '0.00' AFTER `charge_value`;

-- Table `refund_service_charges`: Add missing column `maximum_charge`
ALTER TABLE `refund_service_charges` ADD COLUMN `maximum_charge` decimal(10,2) DEFAULT NULL AFTER `minimum_charge`;

-- Table `refund_service_charges`: Add missing column `applies_to`
ALTER TABLE `refund_service_charges` ADD COLUMN `applies_to` enum('all','cancellation','no_show','refund') DEFAULT 'all' AFTER `maximum_charge`;

-- Table `refund_service_charges`: Add missing column `cancellation_hours_threshold`
ALTER TABLE `refund_service_charges` ADD COLUMN `cancellation_hours_threshold` int(11) DEFAULT NULL AFTER `applies_to`;

-- Table `refund_service_charges`: Add missing column `booking_amount_minimum`
ALTER TABLE `refund_service_charges` ADD COLUMN `booking_amount_minimum` decimal(10,2) DEFAULT '0.00' AFTER `cancellation_hours_threshold`;

-- Table `refund_service_charges`: Add missing column `is_active`
ALTER TABLE `refund_service_charges` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `booking_amount_minimum`;

-- Table `refund_service_charges`: Add missing column `effective_from`
ALTER TABLE `refund_service_charges` ADD COLUMN `effective_from` date NOT NULL AFTER `is_active`;

-- Table `refund_service_charges`: Add missing column `effective_until`
ALTER TABLE `refund_service_charges` ADD COLUMN `effective_until` date DEFAULT NULL AFTER `effective_from`;

-- Table `refund_service_charges`: Add missing column `created_at`
ALTER TABLE `refund_service_charges` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `effective_until`;

-- Table `refund_service_charges`: Add missing column `updated_at`
ALTER TABLE `refund_service_charges` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `reviews`: Add missing column `booking_id`
ALTER TABLE `reviews` ADD COLUMN `booking_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `reviews`: Add missing column `guest_id`
ALTER TABLE `reviews` ADD COLUMN `guest_id` bigint(20) unsigned NOT NULL AFTER `booking_id`;

-- Table `reviews`: Add missing column `property_id`
ALTER TABLE `reviews` ADD COLUMN `property_id` bigint(20) unsigned NOT NULL AFTER `guest_id`;

-- Table `reviews`: Add missing column `rating`
ALTER TABLE `reviews` ADD COLUMN `rating` int(11) NOT NULL AFTER `property_id`;

-- Table `reviews`: Add missing column `title`
ALTER TABLE `reviews` ADD COLUMN `title` varchar(255) DEFAULT NULL AFTER `rating`;

-- Table `reviews`: Add missing column `comment`
ALTER TABLE `reviews` ADD COLUMN `comment` text DEFAULT NULL AFTER `title`;

-- Table `reviews`: Add missing column `cleanliness_rating`
ALTER TABLE `reviews` ADD COLUMN `cleanliness_rating` int(11) DEFAULT NULL AFTER `comment`;

-- Table `reviews`: Add missing column `communication_rating`
ALTER TABLE `reviews` ADD COLUMN `communication_rating` int(11) DEFAULT NULL AFTER `cleanliness_rating`;

-- Table `reviews`: Add missing column `check_in_rating`
ALTER TABLE `reviews` ADD COLUMN `check_in_rating` int(11) DEFAULT NULL AFTER `communication_rating`;

-- Table `reviews`: Add missing column `accuracy_rating`
ALTER TABLE `reviews` ADD COLUMN `accuracy_rating` int(11) DEFAULT NULL AFTER `check_in_rating`;

-- Table `reviews`: Add missing column `location_rating`
ALTER TABLE `reviews` ADD COLUMN `location_rating` int(11) DEFAULT NULL AFTER `accuracy_rating`;

-- Table `reviews`: Add missing column `value_rating`
ALTER TABLE `reviews` ADD COLUMN `value_rating` int(11) DEFAULT NULL AFTER `location_rating`;

-- Table `reviews`: Add missing column `status`
ALTER TABLE `reviews` ADD COLUMN `status` enum('pending','approved','rejected') DEFAULT 'pending' AFTER `value_rating`;

-- Table `reviews`: Add missing column `is_public`
ALTER TABLE `reviews` ADD COLUMN `is_public` tinyint(1) DEFAULT '1' AFTER `status`;

-- Table `reviews`: Add missing column `host_response`
ALTER TABLE `reviews` ADD COLUMN `host_response` text DEFAULT NULL AFTER `is_public`;

-- Table `reviews`: Add missing column `host_response_date`
ALTER TABLE `reviews` ADD COLUMN `host_response_date` timestamp DEFAULT NULL AFTER `host_response`;

-- Table `reviews`: Add missing column `created_at`
ALTER TABLE `reviews` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `host_response_date`;

-- Table `reviews`: Add missing column `updated_at`
ALTER TABLE `reviews` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `rewards_point_settings`: Add missing column `points_per_taka`
ALTER TABLE `rewards_point_settings` ADD COLUMN `points_per_taka` decimal(10,2) NOT NULL DEFAULT '1.00' AFTER `id`;

-- Table `rewards_point_settings`: Add missing column `min_points_to_redeem`
ALTER TABLE `rewards_point_settings` ADD COLUMN `min_points_to_redeem` int(11) DEFAULT '100' AFTER `points_per_taka`;

-- Table `rewards_point_settings`: Add missing column `max_points_per_booking`
ALTER TABLE `rewards_point_settings` ADD COLUMN `max_points_per_booking` int(11) DEFAULT NULL AFTER `min_points_to_redeem`;

-- Table `rewards_point_settings`: Add missing column `points_expiry_days`
ALTER TABLE `rewards_point_settings` ADD COLUMN `points_expiry_days` int(11) DEFAULT NULL AFTER `max_points_per_booking`;

-- Table `rewards_point_settings`: Add missing column `is_active`
ALTER TABLE `rewards_point_settings` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `points_expiry_days`;

-- Table `rewards_point_settings`: Add missing column `created_at`
ALTER TABLE `rewards_point_settings` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `rewards_point_settings`: Add missing column `updated_at`
ALTER TABLE `rewards_point_settings` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `rewards_point_slots`: Add missing column `min_amount`
ALTER TABLE `rewards_point_slots` ADD COLUMN `min_amount` decimal(10,2) NOT NULL AFTER `id`;

-- Table `rewards_point_slots`: Add missing column `max_amount`
ALTER TABLE `rewards_point_slots` ADD COLUMN `max_amount` decimal(10,2) NOT NULL AFTER `min_amount`;

-- Table `rewards_point_slots`: Add missing column `points_per_thousand`
ALTER TABLE `rewards_point_slots` ADD COLUMN `points_per_thousand` decimal(10,2) NOT NULL AFTER `max_amount`;

-- Table `rewards_point_slots`: Add missing column `is_active`
ALTER TABLE `rewards_point_slots` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `points_per_thousand`;

-- Table `rewards_point_slots`: Add missing column `created_at`
ALTER TABLE `rewards_point_slots` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_active`;

-- Table `rewards_point_slots`: Add missing column `updated_at`
ALTER TABLE `rewards_point_slots` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `rewards_point_transactions`: Add missing column `user_id`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `user_id` int(10) unsigned NOT NULL AFTER `id`;

-- Table `rewards_point_transactions`: Add missing column `transaction_type`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `transaction_type` enum('earned','redeemed','expired','adjusted') NOT NULL AFTER `user_id`;

-- Table `rewards_point_transactions`: Add missing column `points`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `points` int(11) NOT NULL AFTER `transaction_type`;

-- Table `rewards_point_transactions`: Add missing column `balance_after`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `balance_after` int(11) NOT NULL AFTER `points`;

-- Table `rewards_point_transactions`: Add missing column `booking_id`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `booking_id` int(10) unsigned DEFAULT NULL AFTER `balance_after`;

-- Table `rewards_point_transactions`: Add missing column `description`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `description` text DEFAULT NULL AFTER `booking_id`;

-- Table `rewards_point_transactions`: Add missing column `expiry_date`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `expiry_date` date DEFAULT NULL AFTER `description`;

-- Table `rewards_point_transactions`: Add missing column `created_at`
ALTER TABLE `rewards_point_transactions` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `expiry_date`;

-- Table `system_settings`: Add missing column `setting_key`
ALTER TABLE `system_settings` ADD COLUMN `setting_key` varchar(100) NOT NULL AFTER `id`;

-- Table `system_settings`: Add missing column `setting_value`
ALTER TABLE `system_settings` ADD COLUMN `setting_value` text NOT NULL AFTER `setting_key`;

-- Table `system_settings`: Add missing column `setting_type`
ALTER TABLE `system_settings` ADD COLUMN `setting_type` enum('string','number','boolean','json') DEFAULT 'string' AFTER `setting_value`;

-- Table `system_settings`: Add missing column `description`
ALTER TABLE `system_settings` ADD COLUMN `description` text DEFAULT NULL AFTER `setting_type`;

-- Table `system_settings`: Add missing column `is_public`
ALTER TABLE `system_settings` ADD COLUMN `is_public` tinyint(1) DEFAULT '0' AFTER `description`;

-- Table `system_settings`: Add missing column `created_at`
ALTER TABLE `system_settings` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `is_public`;

-- Table `system_settings`: Add missing column `updated_at`
ALTER TABLE `system_settings` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `tickets`: Add missing column `guest_id`
ALTER TABLE `tickets` ADD COLUMN `guest_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `tickets`: Add missing column `host_id`
ALTER TABLE `tickets` ADD COLUMN `host_id` bigint(20) unsigned DEFAULT NULL AFTER `guest_id`;

-- Table `tickets`: Add missing column `property_id`
ALTER TABLE `tickets` ADD COLUMN `property_id` bigint(20) unsigned DEFAULT NULL AFTER `host_id`;

-- Table `tickets`: Add missing column `subject`
ALTER TABLE `tickets` ADD COLUMN `subject` varchar(255) NOT NULL AFTER `property_id`;

-- Table `tickets`: Add missing column `category`
ALTER TABLE `tickets` ADD COLUMN `category` enum('Cleaning','WiFi','Payment','Maintenance','Other') DEFAULT 'Other' AFTER `subject`;

-- Table `tickets`: Add missing column `priority`
ALTER TABLE `tickets` ADD COLUMN `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium' AFTER `category`;

-- Table `tickets`: Add missing column `status`
ALTER TABLE `tickets` ADD COLUMN `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open' AFTER `priority`;

-- Table `tickets`: Add missing column `created_at`
ALTER TABLE `tickets` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `tickets`: Add missing column `updated_at`
ALTER TABLE `tickets` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `ticket_messages`: Add missing column `ticket_id`
ALTER TABLE `ticket_messages` ADD COLUMN `ticket_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `ticket_messages`: Add missing column `sender_id`
ALTER TABLE `ticket_messages` ADD COLUMN `sender_id` bigint(20) unsigned NOT NULL AFTER `ticket_id`;

-- Table `ticket_messages`: Add missing column `sender_role`
ALTER TABLE `ticket_messages` ADD COLUMN `sender_role` enum('guest','host','admin') NOT NULL AFTER `sender_id`;

-- Table `ticket_messages`: Add missing column `message`
ALTER TABLE `ticket_messages` ADD COLUMN `message` text NOT NULL AFTER `sender_role`;

-- Table `ticket_messages`: Add missing column `attachment_url`
ALTER TABLE `ticket_messages` ADD COLUMN `attachment_url` varchar(255) DEFAULT NULL AFTER `message`;

-- Table `ticket_messages`: Add missing column `created_at`
ALTER TABLE `ticket_messages` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `attachment_url`;

-- Table `users`: Add missing column `first_name`
ALTER TABLE `users` ADD COLUMN `first_name` varchar(100) NOT NULL AFTER `id`;

-- Table `users`: Add missing column `last_name`
ALTER TABLE `users` ADD COLUMN `last_name` varchar(100) NOT NULL AFTER `first_name`;

-- Table `users`: Add missing column `email`
ALTER TABLE `users` ADD COLUMN `email` varchar(255) NOT NULL AFTER `last_name`;

-- Table `users`: Add missing column `phone`
ALTER TABLE `users` ADD COLUMN `phone` varchar(20) NOT NULL AFTER `email`;

-- Table `users`: Add missing column `password`
ALTER TABLE `users` ADD COLUMN `password` varchar(255) NOT NULL AFTER `phone`;

-- Table `users`: Add missing column `user_type`
ALTER TABLE `users` ADD COLUMN `user_type` enum('admin','property_owner','guest','staff') NOT NULL DEFAULT 'guest' AFTER `password`;

-- Table `users`: Add missing column `host_id`
ALTER TABLE `users` ADD COLUMN `host_id` bigint(20) unsigned DEFAULT NULL AFTER `user_type`;

-- Table `users`: Add missing column `email_verified_at`
ALTER TABLE `users` ADD COLUMN `email_verified_at` timestamp DEFAULT NULL AFTER `host_id`;

-- Table `users`: Add missing column `phone_verified_at`
ALTER TABLE `users` ADD COLUMN `phone_verified_at` timestamp DEFAULT NULL AFTER `email_verified_at`;

-- Table `users`: Add missing column `is_active`
ALTER TABLE `users` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `phone_verified_at`;

-- Table `users`: Add missing column `profile_image`
ALTER TABLE `users` ADD COLUMN `profile_image` varchar(255) DEFAULT NULL AFTER `is_active`;

-- Table `users`: Add missing column `date_of_birth`
ALTER TABLE `users` ADD COLUMN `date_of_birth` date DEFAULT NULL AFTER `profile_image`;

-- Table `users`: Add missing column `gender`
ALTER TABLE `users` ADD COLUMN `gender` enum('male','female','other') DEFAULT NULL AFTER `date_of_birth`;

-- Table `users`: Add missing column `address`
ALTER TABLE `users` ADD COLUMN `address` text DEFAULT NULL AFTER `gender`;

-- Table `users`: Add missing column `city`
ALTER TABLE `users` ADD COLUMN `city` varchar(100) DEFAULT NULL AFTER `address`;

-- Table `users`: Add missing column `state`
ALTER TABLE `users` ADD COLUMN `state` varchar(100) DEFAULT NULL AFTER `city`;

-- Table `users`: Add missing column `country`
ALTER TABLE `users` ADD COLUMN `country` varchar(100) DEFAULT NULL AFTER `state`;

-- Table `users`: Add missing column `postal_code`
ALTER TABLE `users` ADD COLUMN `postal_code` varchar(20) DEFAULT NULL AFTER `country`;

-- Table `users`: Add missing column `two_factor_enabled`
ALTER TABLE `users` ADD COLUMN `two_factor_enabled` tinyint(1) DEFAULT '0' AFTER `postal_code`;

-- Table `users`: Add missing column `two_factor_secret`
ALTER TABLE `users` ADD COLUMN `two_factor_secret` varchar(255) DEFAULT NULL AFTER `two_factor_enabled`;

-- Table `users`: Add missing column `last_login_at`
ALTER TABLE `users` ADD COLUMN `last_login_at` timestamp DEFAULT NULL AFTER `two_factor_secret`;

-- Table `users`: Add missing column `login_attempts`
ALTER TABLE `users` ADD COLUMN `login_attempts` int(11) DEFAULT '0' AFTER `last_login_at`;

-- Table `users`: Add missing column `locked_until`
ALTER TABLE `users` ADD COLUMN `locked_until` timestamp DEFAULT NULL AFTER `login_attempts`;

-- Table `users`: Add missing column `language`
ALTER TABLE `users` ADD COLUMN `language` varchar(10) DEFAULT 'en' AFTER `locked_until`;

-- Table `users`: Add missing column `timezone`
ALTER TABLE `users` ADD COLUMN `timezone` varchar(50) DEFAULT 'UTC' AFTER `language`;

-- Table `users`: Add missing column `email_notifications`
ALTER TABLE `users` ADD COLUMN `email_notifications` tinyint(1) DEFAULT '1' AFTER `timezone`;

-- Table `users`: Add missing column `sms_notifications`
ALTER TABLE `users` ADD COLUMN `sms_notifications` tinyint(1) DEFAULT '0' AFTER `email_notifications`;

-- Table `users`: Add missing column `created_at`
ALTER TABLE `users` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `sms_notifications`;

-- Table `users`: Add missing column `updated_at`
ALTER TABLE `users` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `users`: Add missing column `bio`
ALTER TABLE `users` ADD COLUMN `bio` text DEFAULT NULL AFTER `updated_at`;

-- Table `users`: Add missing column `work`
ALTER TABLE `users` ADD COLUMN `work` varchar(255) DEFAULT NULL AFTER `bio`;

-- Table `users`: Add missing column `school`
ALTER TABLE `users` ADD COLUMN `school` varchar(255) DEFAULT NULL AFTER `work`;

-- Table `users`: Add missing column `is_superhost`
ALTER TABLE `users` ADD COLUMN `is_superhost` tinyint(1) DEFAULT '0' AFTER `school`;

-- Table `users`: Add missing column `languages`
ALTER TABLE `users` ADD COLUMN `languages` longtext DEFAULT NULL AFTER `is_superhost`;

-- Table `users`: Add missing column `google_id`
ALTER TABLE `users` ADD COLUMN `google_id` varchar(255) DEFAULT NULL AFTER `languages`;

-- Table `users`: Add missing column `auto_accept_bookings`
ALTER TABLE `users` ADD COLUMN `auto_accept_bookings` tinyint(1) DEFAULT '0' AFTER `google_id`;

-- Table `users`: Add missing column `phone_verification_otp`
ALTER TABLE `users` ADD COLUMN `phone_verification_otp` varchar(6) DEFAULT NULL AFTER `auto_accept_bookings`;

-- Table `users`: Add missing column `phone_verification_expires_at`
ALTER TABLE `users` ADD COLUMN `phone_verification_expires_at` timestamp DEFAULT NULL AFTER `phone_verification_otp`;

-- Table `users`: Add missing column `nationality`
ALTER TABLE `users` ADD COLUMN `nationality` varchar(100) DEFAULT NULL AFTER `phone_verification_expires_at`;

-- Table `users`: Add missing column `nid_number`
ALTER TABLE `users` ADD COLUMN `nid_number` varchar(50) DEFAULT NULL AFTER `nationality`;

-- Table `users`: Add missing column `passport_number`
ALTER TABLE `users` ADD COLUMN `passport_number` varchar(50) DEFAULT NULL AFTER `nid_number`;

-- Table `users`: Add missing column `nid_document_url`
ALTER TABLE `users` ADD COLUMN `nid_document_url` text DEFAULT NULL AFTER `passport_number`;

-- Table `users`: Add missing column `passport_document_url`
ALTER TABLE `users` ADD COLUMN `passport_document_url` text DEFAULT NULL AFTER `nid_document_url`;

-- Table `users`: Add missing column `platform_permissions`
ALTER TABLE `users` ADD COLUMN `platform_permissions` longtext DEFAULT NULL AFTER `passport_document_url`;

-- Table `user_blocks`: Add missing column `blocked_user_id`
ALTER TABLE `user_blocks` ADD COLUMN `blocked_user_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `user_blocks`: Add missing column `blocked_by`
ALTER TABLE `user_blocks` ADD COLUMN `blocked_by` bigint(20) unsigned NOT NULL AFTER `blocked_user_id`;

-- Table `user_blocks`: Add missing column `block_type`
ALTER TABLE `user_blocks` ADD COLUMN `block_type` enum('temporary','permanent','warning') NOT NULL AFTER `blocked_by`;

-- Table `user_blocks`: Add missing column `reason`
ALTER TABLE `user_blocks` ADD COLUMN `reason` text NOT NULL AFTER `block_type`;

-- Table `user_blocks`: Add missing column `description`
ALTER TABLE `user_blocks` ADD COLUMN `description` text DEFAULT NULL AFTER `reason`;

-- Table `user_blocks`: Add missing column `block_duration`
ALTER TABLE `user_blocks` ADD COLUMN `block_duration` int(11) DEFAULT NULL AFTER `description`;

-- Table `user_blocks`: Add missing column `block_scope`
ALTER TABLE `user_blocks` ADD COLUMN `block_scope` enum('login','booking','messaging','all') DEFAULT 'all' AFTER `block_duration`;

-- Table `user_blocks`: Add missing column `status`
ALTER TABLE `user_blocks` ADD COLUMN `status` enum('active','expired','revoked') DEFAULT 'active' AFTER `block_scope`;

-- Table `user_blocks`: Add missing column `blocked_at`
ALTER TABLE `user_blocks` ADD COLUMN `blocked_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`;

-- Table `user_blocks`: Add missing column `expires_at`
ALTER TABLE `user_blocks` ADD COLUMN `expires_at` timestamp DEFAULT NULL AFTER `blocked_at`;

-- Table `user_blocks`: Add missing column `revoked_at`
ALTER TABLE `user_blocks` ADD COLUMN `revoked_at` timestamp DEFAULT NULL AFTER `expires_at`;

-- Table `user_blocks`: Add missing column `revoked_by`
ALTER TABLE `user_blocks` ADD COLUMN `revoked_by` bigint(20) unsigned DEFAULT NULL AFTER `revoked_at`;

-- Table `user_blocks`: Add missing column `created_at`
ALTER TABLE `user_blocks` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `revoked_by`;

-- Table `user_blocks`: Add missing column `updated_at`
ALTER TABLE `user_blocks` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- Table `user_rewards_points`: Add missing column `user_id`
ALTER TABLE `user_rewards_points` ADD COLUMN `user_id` int(10) unsigned NOT NULL AFTER `id`;

-- Table `user_rewards_points`: Add missing column `total_points_earned`
ALTER TABLE `user_rewards_points` ADD COLUMN `total_points_earned` int(11) DEFAULT '0' AFTER `user_id`;

-- Table `user_rewards_points`: Add missing column `current_balance`
ALTER TABLE `user_rewards_points` ADD COLUMN `current_balance` int(11) DEFAULT '0' AFTER `total_points_earned`;

-- Table `user_rewards_points`: Add missing column `lifetime_points_spent`
ALTER TABLE `user_rewards_points` ADD COLUMN `lifetime_points_spent` int(11) DEFAULT '0' AFTER `current_balance`;

-- Table `user_rewards_points`: Add missing column `member_status_tier_id`
ALTER TABLE `user_rewards_points` ADD COLUMN `member_status_tier_id` int(11) DEFAULT NULL AFTER `lifetime_points_spent`;

-- Table `user_rewards_points`: Add missing column `last_updated_at`
ALTER TABLE `user_rewards_points` ADD COLUMN `last_updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `member_status_tier_id`;

-- Table `user_rewards_points`: Add missing column `created_at`
ALTER TABLE `user_rewards_points` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `last_updated_at`;

-- Table `user_sessions`: Add missing column `user_id`
ALTER TABLE `user_sessions` ADD COLUMN `user_id` bigint(20) unsigned NOT NULL AFTER `id`;

-- Table `user_sessions`: Add missing column `session_token`
ALTER TABLE `user_sessions` ADD COLUMN `session_token` varchar(255) NOT NULL AFTER `user_id`;

-- Table `user_sessions`: Add missing column `refresh_token`
ALTER TABLE `user_sessions` ADD COLUMN `refresh_token` varchar(255) DEFAULT NULL AFTER `session_token`;

-- Table `user_sessions`: Add missing column `device_info`
ALTER TABLE `user_sessions` ADD COLUMN `device_info` longtext DEFAULT NULL AFTER `refresh_token`;

-- Table `user_sessions`: Add missing column `ip_address`
ALTER TABLE `user_sessions` ADD COLUMN `ip_address` varchar(45) DEFAULT NULL AFTER `device_info`;

-- Table `user_sessions`: Add missing column `user_agent`
ALTER TABLE `user_sessions` ADD COLUMN `user_agent` text DEFAULT NULL AFTER `ip_address`;

-- Table `user_sessions`: Add missing column `is_active`
ALTER TABLE `user_sessions` ADD COLUMN `is_active` tinyint(1) DEFAULT '1' AFTER `user_agent`;

-- Table `user_sessions`: Add missing column `expires_at`
ALTER TABLE `user_sessions` ADD COLUMN `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `is_active`;

-- Table `user_sessions`: Add missing column `created_at`
ALTER TABLE `user_sessions` ADD COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `expires_at`;

-- Table `user_sessions`: Add missing column `updated_at`
ALTER TABLE `user_sessions` ADD COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update current_timestamp() AFTER `created_at`;

-- ======================================================
-- 3. MISSING SYSTEM SETTINGS RECORDS
-- ======================================================

INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('platform_name', 'Keyhost Homes', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('default_currency', 'BDT', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('commission_rate', '10', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('max_guests_per_property', '20', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('booking_advance_days', '365', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('cancellation_hours', '24', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('support_email', 'info@keyhost24.com', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('support_phone', '+8801730353300', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('timezone', 'Asia/Dhaka', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('maintenance_mode', 'false', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('registration_enabled', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('email_verification_required', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('phone_verification_required', 'false', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('site_logo', 'data:image/png;base64,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', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('site_name', 'KeyHost 24', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('contact_email', 'info@keyhost24.com', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('site_favicon', 'data:image/png;base64,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', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('admin_commission_rate', '10', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('admin_tax_rate', '0', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('commission_calculation_method', 'percentage', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('minimum_payout_amount', '100', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('payout_frequency', 'monthly', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_enabled', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_merchant_id', 'KeyHost', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_merchant_key', '4f6o0cjiki2rfm34kfdadl1eqq', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_merchant_secret', '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_api_url', 'https://tokenized.sandbox.bka.sh/v1.2.0-beta', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_callback_url', 'http://localhost:3000/payment/callback', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_currency', 'BDT', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_intent', 'sale', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_mode', 'sandbox', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_success_url', 'http://localhost:3000/payment/success', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_fail_url', 'http://localhost:3000/payment/fail', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('enable_bkash', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('enable_nagad', 'false', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_sender_id', '01844015754', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_api_key', 'b4a37e3c2c368a44', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_secret_key', '7e0ba143', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('payment_time_limit_minutes', '30', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_enabled', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('primary_color', '#E41D57', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('secondary_color', '#E41D57', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('site_description', 'Find Your Comfort', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('enable_sslcommerz', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sslcommerz_store_id', 'testbox', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sslcommerz_store_password', 'qwerty', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('google_client_id', '82849880523-pdlo06m2e6n46eunf951sfv4cgt4a8kb.apps.googleusercontent.com', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('google_client_secret', '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', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('smtp_host', 'smtp.gmail.com', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('smtp_port', '465', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('smtp_encryption', 'ssl', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('smtp_username', 'arbhuiyan.pits@gmail.com', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('smtp_password', 'zgnd avpj klry ygpt', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('mail_from_address', 'arbhuiyan.pits@gmail.com', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('mail_from_name', 'Keyhost Homes', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sslcommerz_is_live', 'false', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('google_maps_api_key', 'AIzaSyBaZ6hlAV5zVfCzQZqY4KGrQqqv8zjrbu0', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('contact_phone', '+8801730353300', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('site_address', 'Rupayan Centre(8th Floor), 72
Mohakhali C/A, Dhaka-1212, Bangladesh', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('terms_of_service', 'KeyHost24 Ã¢â‚¬â€ Terms & Conditions  

Welcome to KeyHost24. By accessing our website and booking our services, you agree to comply with and be bound by the following Terms & Conditions.

---

### 1. About Us
KeyHost24 provides short-term rental and accommodation management services for guests seeking comfortable and reliable stays.

---

### 2. Booking & Payments
- All bookings must be confirmed with advance or full payment.  
- Prices are subject to availability, seasonal demand, and promotional offers.  
- Payments can be made via approved methods including cards, mobile financial services, and online payment gateways.  

---

### 3. Check-in & Check-out
- Standard Check-in Time: [Insert Time]  
- Standard Check-out Time: [Insert Time]  
- Early check-in or late check-out is subject to availability and may incur additional charges.  

---

### 4. Guest Responsibilities
Guests agree to:
- Provide valid identification at check-in  
- Maintain the property in good condition  
- Follow all house rules and regulations  
- Avoid illegal, unsafe, or disruptive behavior  

---

### 5. Property Use
- The property must be used only for residential purposes  
- Subletting or unauthorized guests are not allowed  
- Parties or events are strictly prohibited unless approved  

---

### 6. Damage & Loss
- Guests are responsible for any damage caused during their stay  
- Costs for repair or replacement will be charged or deducted from the security deposit  

---

### 7. Cancellation & Refund
All cancellations, refunds, and rescheduling are governed by our Refund & Cancellation Policy available on the website.

---

### 8. Security Deposit
- A refundable security deposit may be required  
- The deposit will be returned after inspection at checkout  
- Deductions may apply for damages or violations  

---

### 9. Limitation of Liability
KeyHost24 shall not be held responsible for:
- Loss or theft of personal belongings  
- Injuries or accidents occurring during the stay  
- Delays or disruptions caused by external factors beyond our control  

---

### 10. Privacy & Data Protection
We respect your privacy. All personal information is handled according to our Privacy Policy.

---

### 11. Third-Party Services
- We may use third-party services (e.g., payment gateways) for processing transactions  
- KeyHost24 is not responsible for failures or issues arising from third-party services  

---

### 12. Website Use
- Users agree not to misuse the website or attempt unauthorized access  
- All content on the website is the property of KeyHost24 and may not be copied or reused without permission  

---

### 13. Policy Updates
KeyHost24 reserves the right to modify these Terms & Conditions at any time without prior notice. Updated versions will be posted on the website.

---

### 14. Governing Law
These Terms & Conditions are governed by the laws of Bangladesh.

---

### 15. Contact Information
For any inquiries, please contact:

KeyHost24 Support Team  
Email: info@keyhost24.com  
Phone/WhatsApp: [01730353300]

---

By booking with KeyHost24, you confirm that you have read, understood, and agreed to these Terms & Conditions.', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('privacy_policy', '----', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('refund_policy', 'KeyHost24 Ã¢â‚¬â€ Refund, Cancellation & Rescheduling Policy  

At KeyHost24, we strive to provide a reliable and transparent booking experience. This policy outlines the conditions for cancellations, refunds, and booking modifications.

---

### 1. Booking Confirmation
All reservations are confirmed only after receiving a partial or full payment. By confirming a booking, the guest agrees to all policies stated herein.

---

### 2. Cancellation Policy

a. Standard Cancellation (Flexible Rate)  
- Free cancellation up to 48 hours before check-in  
- 100% refund of advance payment  

b. Late Cancellation  
- Cancellations within 48 hours of check-in are non-refundable

c. No-Show  
- Failure to check in on the scheduled date will result in full booking charge with no refund

---

### 3. Non-Refundable Bookings (If Applicable)
Certain promotional or discounted bookings may be marked as Non-Refundable.  
- No refund will be provided under any circumstances  
- Date changes may not be permitted  

---

### 4. Early Check-Out
- No refund will be issued for unused nights after check-in  
- Full stay amount remains payable

---

### 5. Refund Processing Timeline
- All approved refunds will be processed within 7Ã¢â‚¬â€œ10 working days  
- Refunds will be issued via the original mode of payment  
- Delays caused by banks, payment gateways, or mobile financial services are beyond our control  

---

### 6. Rescheduling / Date Modification
- Changes are allowed if requested at least 48 hours before check-in  
- Subject to availability  
- Rate differences may apply  

---

### 7. Security Deposit (If Applicable)
- Refundable upon checkout after inspection  
- Deductions may apply for:
  - Damages  
  - Missing items  
  - Rule violations  

---

### 8. Host-Initiated Cancellation
In rare cases where KeyHost24 must cancel:
- Full refund will be issued, OR  
- Alternative accommodation of similar or higher standard will be provided  

---

### 9. Force Majeure / Exceptional Circumstances
Refunds or credits may be considered in events beyond control, including:
- Natural disasters  
- Government restrictions  
- Medical emergencies  

(Valid documentation required)

---

### 10. Third-Party & Data Responsibility
- KeyHost24 does not share customer data with unauthorized third parties  
- Any integrated third-party service complies with applicable data protection standards  
- KeyHost24 is not responsible for external service disruptions beyond its control  

---

### 11. Policy Acceptance
During checkout, guests must confirm that they have read and agreed to:
- Terms & Conditions  
- Privacy Policy  
- Refund & Cancellation Policy  

---

### 12. Contact Information
For any queries regarding cancellations or refunds:

KeyHost24 Support Team  
Email: info@keyhost24.com  
Phone/WhatsApp: [01730353300]

---

Note: KeyHost24 reserves the right to update this policy at any time without prior notice.', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('pending_booking_timeout_minutes', '30', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_template_booking_request_host', 'New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Review & accept here: {booking_url}', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_template_booking_accepted_guest', 'Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay.', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_template_booking_paid_host', 'Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully. Guest: {guest_name}. Check-in: {check_in_date}.', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_template_booking_paid_guest', 'Thank you {guest_name}! Payment of {amount} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}.', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_template_checkout_guest', 'Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_template_refund_guest', 'Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}.', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_template_refund_host', 'Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}.', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('auto_approve_reviews', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('facebook_url', 'https://www.facebook.com/keyhosthomes', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('sms_gateway_type', 'whatsapp', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_is_live', 'false', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_username', 'sandboxTokenizedUser02', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_password', 'sandboxTokenizedUser02@12345', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('bkash_api_associated_email', '', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('nagad_is_live', 'false', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('nagad_api_url', 'http://sandbox.mymoid.com:9090', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('nagad_merchant_id', '', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('nagad_private_key', '', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('nagad_public_key', '', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('nagad_merchant_private_key', '', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('google_places_enabled', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('google_api_associated_email', '', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('facebook_pixel_id', '1086408337394401', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('meta_access_token', 'EAAgCvZAZB3rQkBSIaAIJJBZAEYfGZAmG6GeCGrZAN5EvZAOd7PmSdyZAz6XMJrftmZBwZC14qZBBxrC1KtoKOfQKeJZBnAZBQz2gXGQYyisqPT6y0ztvXCobpiVIWctOwNk9pyXuZAAzViDxF9AWKU5bRuM2YZC1LLEoEm9PZAUrdppIU7c5IKLydsaBOLtDAYx89Re4vosPwZDZD', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('meta_advanced_matching', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('meta_capi_enabled', 'true', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('meta_test_event_code', 'TEST28073', NOW(), NOW());
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES ('censor_banned_words', '["0","1","2"]', NOW(), NOW());

-- ======================================================
-- 4. MISSING ROLE PERMISSIONS RECORDS
-- ======================================================

INSERT IGNORE INTO `role_default_permissions` (`role`, `display_name`, `permissions`, `created_at`, `updated_at`) VALUES ('admin', 'Administrator', '{"properties.read":true,"properties.create_update":true,"properties.delete":true,"property_types.read":true,"property_types.create_update":true,"property_types.delete":true,"amenities.read":true,"amenities.create_update":true,"amenities.delete":true,"display_categories.read":true,"display_categories.create_update":true,"display_categories.delete":true,"coupons.read":true,"coupons.create_update":true,"coupons.delete":true,"bookings.read":true,"bookings.create_update":true,"bookings.delete":true,"calendar.read":true,"calendar.create_update":true,"ical.read":true,"ical.create_update":true,"ical.delete":true,"hms_rooms.read":true,"hms_rooms.create_update":true,"hms_rooms.delete":true,"hms_housekeeping.read":true,"hms_housekeeping.create_update":true,"hms_housekeeping.delete":true,"hms_accounts.read":true,"hms_accounts.create_update":true,"hms_accounts.delete":true,"hms_hr.read":true,"hms_hr.create_update":true,"hms_hr.delete":true,"earnings.read":true,"earnings.create_update":true,"earnings.delete":true,"payouts.read":true,"payouts.create_update":true,"payouts.delete":true,"refunds.read":true,"refunds.create_update":true,"security_deposits.read":true,"security_deposits.create_update":true,"messages.read":true,"messages.create_update":true,"support.read":true,"support.create_update":true,"support.delete":true,"contact_messages.read":true,"contact_messages.create_update":true,"contact_messages.delete":true,"reviews.read":true,"reviews.create_update":true,"reviews.delete":true,"users.read":true,"users.create_update":true,"users.delete":true,"roles.read":true,"roles.create_update":true,"roles.delete":true,"staff.read":true,"staff.create_update":true,"staff.delete":true,"rewards.read":true,"rewards.create_update":true,"analytics.read":true,"reports.read":true,"reports.create_update":true}', NOW(), NOW());
INSERT IGNORE INTO `role_default_permissions` (`role`, `display_name`, `permissions`, `created_at`, `updated_at`) VALUES ('guest', 'Guest / Traveler', '{"properties.read":true,"bookings.read":true,"bookings.create_update":true,"refunds.read":true,"refunds.create_update":true,"messages.read":true,"messages.create_update":true,"support.read":true,"support.create_update":true,"reviews.read":true,"reviews.create_update":true,"rewards.read":true,"property_types.read":false,"support.delete":false,"contact_messages.read":true,"contact_messages.create_update":true,"contact_messages.delete":false,"reviews.delete":false}', NOW(), NOW());
INSERT IGNORE INTO `role_default_permissions` (`role`, `display_name`, `permissions`, `created_at`, `updated_at`) VALUES ('property_owner', 'Host / Property Owner', '{"properties.read":true,"properties.create_update":true,"properties.delete":true,"property_types.read":true,"amenities.read":true,"display_categories.read":true,"bookings.read":true,"bookings.create_update":true,"calendar.read":true,"calendar.create_update":true,"ical.read":true,"ical.create_update":true,"ical.delete":true,"hms_rooms.read":true,"hms_rooms.create_update":true,"hms_rooms.delete":true,"hms_housekeeping.read":true,"hms_housekeeping.create_update":true,"hms_housekeeping.delete":true,"hms_accounts.read":true,"hms_accounts.create_update":true,"hms_accounts.delete":true,"hms_hr.read":true,"hms_hr.create_update":true,"hms_hr.delete":true,"earnings.read":true,"earnings.create_update":true,"payouts.read":true,"payouts.create_update":true,"refunds.read":true,"refunds.create_update":true,"security_deposits.read":true,"security_deposits.create_update":true,"messages.read":true,"messages.create_update":true,"support.read":true,"support.create_update":true,"reviews.read":true,"reviews.create_update":true,"staff.read":true,"staff.create_update":true,"staff.delete":true,"analytics.read":true,"reports.read":true,"bookings.delete":true,"contact_messages.create_update":true,"contact_messages.read":true}', NOW(), NOW());
INSERT IGNORE INTO `role_default_permissions` (`role`, `display_name`, `permissions`, `created_at`, `updated_at`) VALUES ('staff', 'Host Staff / Employee', '{"properties.read":true,"bookings.read":true,"bookings.create_update":true,"calendar.read":true,"calendar.create_update":true,"hms_rooms.read":true,"hms_rooms.create_update":true,"hms_housekeeping.read":true,"hms_housekeeping.create_update":true,"messages.read":true,"messages.create_update":true}', NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
