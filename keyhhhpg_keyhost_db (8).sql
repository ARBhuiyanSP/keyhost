-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 23, 2026 at 09:29 PM
-- Server version: 11.4.10-MariaDB-cll-lve
-- PHP Version: 8.3.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `keyhhhpg_keyhost_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_earnings`
--

CREATE TABLE `admin_earnings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `property_owner_id` bigint(20) UNSIGNED NOT NULL,
  `booking_total` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT 10.00,
  `commission_amount` decimal(10,2) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `net_commission` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `status` enum('active','cancelled','refunded') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_earnings`
--

INSERT INTO `admin_earnings` (`id`, `booking_id`, `property_id`, `property_owner_id`, `booking_total`, `commission_rate`, `commission_amount`, `tax_rate`, `tax_amount`, `net_commission`, `payment_status`, `payment_date`, `payment_method`, `payment_reference`, `status`, `created_at`, `updated_at`) VALUES
(5, 174, 77, 29, 20.00, 10.00, 2.00, 0.00, 0.00, 2.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-17 07:28:55', '2026-05-17 07:28:55'),
(6, 175, 77, 29, 35.00, 10.00, 3.50, 0.00, 0.00, 3.50, 'pending', NULL, NULL, NULL, 'active', '2026-05-17 07:35:08', '2026-05-17 07:35:08'),
(7, 176, 75, 28, 2400.00, 10.00, 240.00, 0.00, 0.00, 240.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-17 08:53:27', '2026-05-17 08:53:27'),
(8, 177, 80, 27, 2000.00, 10.00, 200.00, 0.00, 0.00, 200.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-17 10:21:18', '2026-05-17 10:21:18'),
(9, 178, 70, 27, 2000.00, 10.00, 200.00, 0.00, 0.00, 200.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-17 10:36:20', '2026-05-17 10:36:20'),
(10, 179, 80, 27, 2000.00, 10.00, 200.00, 0.00, 0.00, 200.00, 'paid', '2026-05-17 11:25:06', NULL, NULL, 'active', '2026-05-17 11:24:05', '2026-05-17 11:25:06'),
(11, 180, 70, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-05-17 19:43:11', NULL, NULL, 'active', '2026-05-17 19:41:24', '2026-05-17 19:43:11'),
(12, 181, 74, 28, 96000.00, 10.00, 9600.00, 0.00, 0.00, 9600.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-19 09:27:54', '2026-05-19 09:27:54'),
(13, 182, 77, 29, 20.00, 10.00, 2.00, 0.00, 0.00, 2.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-23 05:28:31', '2026-05-23 05:28:31'),
(14, 183, 77, 29, 20.00, 10.00, 2.00, 0.00, 0.00, 2.00, 'paid', '2026-05-23 08:14:09', NULL, NULL, 'active', '2026-05-23 08:13:03', '2026-05-23 08:14:09'),
(15, 184, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-23 19:32:46', '2026-05-23 19:32:46'),
(16, 185, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-23 21:29:51', '2026-05-23 21:29:51');

-- --------------------------------------------------------

--
-- Table structure for table `admin_earnings_summary`
--

CREATE TABLE `admin_earnings_summary` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `total_bookings` int(11) DEFAULT 0,
  `total_booking_amount` decimal(12,2) DEFAULT 0.00,
  `total_commission` decimal(12,2) DEFAULT 0.00,
  `total_tax` decimal(12,2) DEFAULT 0.00,
  `net_earnings` decimal(12,2) DEFAULT 0.00,
  `pending_amount` decimal(12,2) DEFAULT 0.00,
  `paid_amount` decimal(12,2) DEFAULT 0.00,
  `failed_amount` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_payouts`
--

CREATE TABLE `admin_payouts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payout_reference` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_earnings` decimal(12,2) NOT NULL,
  `total_tax` decimal(12,2) DEFAULT 0.00,
  `net_payout` decimal(12,2) NOT NULL,
  `payment_method` enum('bank_transfer','paypal','stripe','cash') NOT NULL,
  `payment_status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `routing_number` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `amenities`
--

CREATE TABLE `amenities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `category` enum('basic','safety','entertainment','kitchen','bathroom','outdoor','accessibility') DEFAULT 'basic',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `amenities`
--

INSERT INTO `amenities` (`id`, `name`, `icon`, `category`, `is_active`, `created_at`) VALUES
(1, 'WiFi', 'fas fa-wifi', 'basic', 1, '2025-10-12 19:40:43'),
(2, 'Air Conditioning', 'fas fa-snowflake', 'basic', 1, '2025-10-12 19:40:43'),
(3, 'Parking', 'fas fa-car', 'accessibility', 1, '2025-10-12 19:40:43'),
(4, 'Kitchen', 'fas fa-utensils', 'kitchen', 1, '2025-10-12 19:40:43'),
(5, 'Swimming Pool', 'fas fa-swimming-pool', 'outdoor', 1, '2025-10-12 19:40:43'),
(6, 'Gym', 'fas fa-dumbbell', 'entertainment', 1, '2025-10-12 19:40:43'),
(7, 'Laundry', 'fas fa-tshirt', 'basic', 1, '2025-10-12 19:40:43'),
(8, 'Balcony', 'fas fa-home', 'outdoor', 1, '2025-10-12 19:40:43'),
(9, 'TV', 'fas fa-tv', 'entertainment', 1, '2025-10-12 19:40:43'),
(10, 'Security', 'fas fa-shield-alt', 'safety', 1, '2025-10-12 19:40:43'),
(11, 'Elevator', 'fas fa-elevator', 'accessibility', 1, '2025-10-12 19:40:43'),
(12, 'Pet Friendly', 'fas fa-paw', 'basic', 0, '2025-10-12 19:40:43'),
(13, 'Breakfast', 'fas fa-coffee', 'basic', 1, '2025-10-12 19:40:43'),
(14, 'Room Service', 'fas fa-concierge-bell', 'basic', 1, '2025-10-12 19:40:43');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` bigint(20) UNSIGNED NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_reference` varchar(20) NOT NULL,
  `guest_id` bigint(20) UNSIGNED DEFAULT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `hms_room_id` int(11) DEFAULT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `number_of_guests` int(11) NOT NULL DEFAULT 1,
  `number_of_children` int(11) DEFAULT 0,
  `number_of_infants` int(11) DEFAULT 0,
  `base_price` decimal(10,2) NOT NULL,
  `cleaning_fee` decimal(10,2) DEFAULT 0.00,
  `security_deposit` decimal(10,2) DEFAULT 0.00,
  `extra_guest_fee` decimal(10,2) DEFAULT 0.00,
  `service_fee` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `admin_commission_rate` decimal(5,2) DEFAULT 10.00,
  `admin_commission_amount` decimal(10,2) DEFAULT 0.00,
  `property_owner_earnings` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'BDT',
  `status` enum('pending','request_accepted','confirmed','checked_in','checked_out','cancelled','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded','partially_refunded','pending_extra') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_notes` text DEFAULT NULL,
  `payment_link_token` varchar(100) DEFAULT NULL,
  `special_requests` text DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `booking_source` enum('website','mobile_app','admin','api') DEFAULT 'website',
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `booking_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `payment_deadline` datetime DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `points_redeemed` int(11) DEFAULT 0,
  `points_discount` decimal(10,2) DEFAULT 0.00,
  `source` varchar(50) DEFAULT 'Internal',
  `external_booking_id` varchar(255) DEFAULT NULL,
  `is_non_refundable` tinyint(1) DEFAULT 0,
  `security_deposit_status` varchar(20) DEFAULT 'pending',
  `security_deposit_claim_amount` decimal(10,2) DEFAULT 0.00,
  `security_deposit_claim_reason` text DEFAULT NULL,
  `security_deposit_claim_at` timestamp NULL DEFAULT NULL,
  `security_deposit_deduction_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_reference`, `guest_id`, `property_id`, `hms_room_id`, `check_in_date`, `check_out_date`, `check_in_time`, `check_out_time`, `number_of_guests`, `number_of_children`, `number_of_infants`, `base_price`, `cleaning_fee`, `security_deposit`, `extra_guest_fee`, `service_fee`, `tax_amount`, `admin_commission_rate`, `admin_commission_amount`, `property_owner_earnings`, `total_amount`, `currency`, `status`, `payment_status`, `payment_method`, `payment_notes`, `payment_link_token`, `special_requests`, `cancellation_reason`, `coupon_code`, `discount_amount`, `booking_source`, `guest_name`, `guest_email`, `guest_phone`, `booking_date`, `confirmed_at`, `payment_deadline`, `cancelled_at`, `created_at`, `updated_at`, `points_redeemed`, `points_discount`, `source`, `external_booking_id`, `is_non_refundable`, `security_deposit_status`, `security_deposit_claim_amount`, `security_deposit_claim_reason`, `security_deposit_claim_at`, `security_deposit_deduction_amount`) VALUES
(174, 'KH9358673L1', 64, 77, NULL, '2026-05-19', '2026-05-20', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'undefined undefined', 'atiqur.cumilla@gmail.com', NULL, '2026-05-17 07:28:55', '2026-05-17 07:28:55', '2026-05-17 03:48:55', '2026-05-23 05:26:20', '2026-05-17 07:28:55', '2026-05-23 05:26:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(175, 'KH3079281ZA', 64, 77, NULL, '2026-05-27', '2026-05-29', '15:00:00', '11:00:00', 1, 0, 0, 30.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 3.50, 31.50, 35.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'undefined undefined', 'atiqur.cumilla@gmail.com', NULL, '2026-05-17 07:35:07', '2026-05-17 07:35:07', '2026-05-17 03:55:07', '2026-05-23 05:26:20', '2026-05-17 07:35:07', '2026-05-23 05:26:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(176, 'KH007535SWG', 64, 75, NULL, '2026-05-18', '2026-05-19', '15:00:00', '11:00:00', 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 240.00, 2160.00, 2400.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'KEY20', 600.00, 'website', 'undefined undefined', 'atiqur.cumilla@gmail.com', NULL, '2026-05-17 08:53:27', '2026-05-17 08:53:27', '2026-05-17 05:13:27', '2026-05-23 05:26:21', '2026-05-17 08:53:27', '2026-05-23 05:26:21', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(177, 'KH278157YLG', 68, 80, NULL, '2026-05-17', '2026-05-18', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'Key20', 500.00, 'website', 'undefined undefined', 'noredef70@gmail.com', NULL, '2026-05-17 10:21:18', '2026-05-17 10:21:18', '2026-05-17 06:41:18', '2026-05-23 05:26:21', '2026-05-17 10:21:18', '2026-05-23 05:26:21', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(178, 'KH18090428I', 69, 70, NULL, '2026-05-17', '2026-05-18', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'KEY20', 500.00, 'website', 'undefined undefined', 'adnansami229atbd@gmail.com', NULL, '2026-05-17 10:36:20', '2026-05-17 10:36:20', '2026-05-17 06:56:20', '2026-05-23 05:26:21', '2026-05-17 10:36:20', '2026-05-23 05:26:21', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(179, 'KH0459351YO', 68, 80, NULL, '2026-05-18', '2026-05-19', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, 'Key20', 500.00, 'website', 'undefined undefined', 'noredef70@gmail.com', NULL, '2026-05-17 11:24:05', '2026-05-17 11:25:10', '2026-05-17 07:44:05', NULL, '2026-05-17 11:24:05', '2026-05-17 11:25:10', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(180, 'KH884077QN3', 71, 70, NULL, '2026-05-23', '2026-05-24', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'undefined undefined', 'smjoy619@gmail.com', NULL, '2026-05-17 19:41:24', '2026-05-17 19:43:16', '2026-05-17 16:01:24', NULL, '2026-05-17 19:41:24', '2026-05-17 19:43:16', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(181, 'KH874673NXB', 56, 74, NULL, '2026-05-22', '2026-06-15', '15:00:00', '11:00:00', 1, 0, 0, 96000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 9600.00, 86400.00, 96000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'undefined undefined', 'titubiniamin@gmail.com', NULL, '2026-05-19 09:27:54', '2026-05-19 09:27:54', '2026-05-19 05:47:54', '2026-05-23 05:26:22', '2026-05-19 09:27:54', '2026-05-23 05:26:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(182, 'KH1119484O6', 75, 77, NULL, '2026-05-26', '2026-05-27', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', '2026-05-23 05:28:31', '2026-05-23 05:28:31', '2026-05-23 01:48:31', '2026-05-23 05:49:20', '2026-05-23 05:28:31', '2026-05-23 05:49:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(183, 'KH983306HXP', 50, 77, NULL, '2026-06-09', '2026-06-10', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'paid', 'sslcommerz', NULL, NULL, NULL, 'Test', NULL, 0.00, 'website', 'Md. Imtiaz Hanif', 'sakil.imtiaz@gmail.com', '01774853552504', '2026-05-23 08:13:03', '2026-05-23 08:14:14', '2026-05-23 04:15:03', '2026-05-23 08:48:26', '2026-05-23 08:13:03', '2026-05-23 08:48:26', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(184, 'KH76638005Z', 77, 80, NULL, '2026-05-24', '2026-05-25', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Ashiqur Rahman vevo', 'asifboycocgame@gmail.com', 'G-1779561817279', '2026-05-23 19:32:46', '2026-05-23 19:32:46', '2026-05-23 15:34:46', '2026-05-23 19:34:58', '2026-05-23 19:32:46', '2026-05-23 19:34:58', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00),
(185, 'KH79100661V', 77, 69, NULL, '2026-05-24', '2026-05-25', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Ashiqur Rahman', 'asifboycocgame@gmail.com', 'G-1779561817279', '2026-05-23 21:29:51', '2026-05-23 21:29:51', '2026-05-23 17:31:51', '2026-05-23 21:32:42', '2026-05-23 21:29:51', '2026-05-23 21:32:42', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `booking_guests`
--

CREATE TABLE `booking_guests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `is_primary_guest` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_modifications`
--

CREATE TABLE `booking_modifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `modified_by` bigint(20) UNSIGNED NOT NULL,
  `modification_type` enum('dates','guests','pricing','status','other') NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`new_values`)),
  `reason` text DEFAULT NULL,
  `additional_fee` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cancellation_policies`
--

CREATE TABLE `cancellation_policies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `free_cancellation_hours` int(11) NOT NULL,
  `cancellation_fee_percentage` decimal(5,2) DEFAULT 0.00,
  `no_show_fee_percentage` decimal(5,2) DEFAULT 100.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cancellation_policies`
--

INSERT INTO `cancellation_policies` (`id`, `name`, `description`, `free_cancellation_hours`, `cancellation_fee_percentage`, `no_show_fee_percentage`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Flexible', 'Free cancellation up to 24 hours before check-in', 24, 0.00, 100.00, 1, '2025-10-12 14:54:16', '2025-10-12 14:54:16'),
(2, 'Moderate', 'Free cancellation up to 5 days before check-in', 120, 50.00, 100.00, 1, '2025-10-12 14:54:16', '2025-10-12 14:54:16'),
(3, 'Strict', 'Free cancellation up to 7 days before check-in', 168, 100.00, 100.00, 1, '2025-10-12 14:54:16', '2025-10-12 14:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `car_bookings`
--

CREATE TABLE `car_bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_reference` varchar(20) NOT NULL,
  `guest_id` bigint(20) UNSIGNED NOT NULL,
  `pickup_location` varchar(255) NOT NULL,
  `dropoff_location` varchar(255) NOT NULL,
  `pickup_date` date NOT NULL,
  `pickup_time` time NOT NULL,
  `dropoff_date` date NOT NULL,
  `dropoff_time` time NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'BDT',
  `status` enum('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','replied') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `guest_id` bigint(20) UNSIGNED NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED DEFAULT NULL,
  `last_message_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `guest_id`, `host_id`, `property_id`, `last_message_at`, `created_at`, `updated_at`) VALUES
(14, 74, 52, 80, '2026-05-22 15:26:55', '2026-05-22 15:26:55', '2026-05-22 15:26:55'),
(15, 74, 52, 70, '2026-05-22 15:46:19', '2026-05-22 15:46:19', '2026-05-22 15:46:19'),
(16, 74, 59, 77, '2026-05-22 16:30:28', '2026-05-22 16:30:28', '2026-05-22 16:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed_amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_amount` decimal(10,2) DEFAULT 0.00,
  `maximum_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `user_limit` int(11) DEFAULT 1,
  `valid_from` date NOT NULL,
  `valid_until` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `minimum_amount`, `maximum_discount`, `usage_limit`, `used_count`, `user_limit`, `valid_from`, `valid_until`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'Welcome Discount', '10% off for new users', 'percentage', 10.00, 1000.00, NULL, 100, 0, 1, '2025-10-12', '2026-10-12', 1, '2025-10-12 14:54:16', '2025-10-12 14:54:16'),
(2, 'SAVE500', 'Fixed Discount', '500 BDT off on bookings above 3000 BDT', 'fixed_amount', 500.00, 3000.00, NULL, 50, 0, 1, '2025-10-12', '2026-04-12', 1, '2025-10-12 14:54:16', '2025-10-12 14:54:16'),
(3, 'KEY20', 'KEY20', '20% Discount', 'percentage', 20.00, 1.00, NULL, NULL, 4, NULL, '2026-05-17', '2030-05-26', 1, '2026-05-17 08:51:23', '2026-05-23 08:14:04');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usage`
--

CREATE TABLE `coupon_usage` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `coupon_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupon_usage`
--

INSERT INTO `coupon_usage` (`id`, `coupon_id`, `user_id`, `booking_id`, `discount_amount`, `used_at`) VALUES
(1, 3, 64, 176, 600.00, '2026-05-17 08:53:27'),
(2, 3, 68, 177, 500.00, '2026-05-17 10:21:18'),
(3, 3, 69, 178, 500.00, '2026-05-17 10:36:20'),
(4, 3, 68, 179, 500.00, '2026-05-17 11:24:05');

-- --------------------------------------------------------

--
-- Table structure for table `display_categories`
--

CREATE TABLE `display_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `display_categories`
--

INSERT INTO `display_categories` (`id`, `name`, `description`, `sort_order`, `is_active`, `created_at`) VALUES
(2, 'Bangladesh Gateaways', NULL, 0, 1, '2025-11-30 09:13:11'),
(3, 'Dhaka Homes', NULL, 1, 1, '2025-11-30 09:41:09');

-- --------------------------------------------------------

--
-- Table structure for table `display_category_properties`
--

CREATE TABLE `display_category_properties` (
  `id` int(11) NOT NULL,
  `display_category_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `display_category_properties`
--

INSERT INTO `display_category_properties` (`id`, `display_category_id`, `property_id`, `created_at`) VALUES
(41, 2, 76, '2026-04-13 04:43:10'),
(42, 3, 76, '2026-04-13 04:43:10'),
(43, 2, 75, '2026-04-13 04:43:29'),
(44, 3, 75, '2026-04-13 04:43:29'),
(45, 2, 74, '2026-04-13 04:43:38'),
(46, 3, 74, '2026-04-13 04:43:38'),
(47, 2, 73, '2026-04-13 04:43:44'),
(48, 2, 72, '2026-04-13 04:43:48'),
(49, 2, 70, '2026-04-13 05:01:18'),
(50, 3, 70, '2026-04-13 05:01:18');

-- --------------------------------------------------------

--
-- Table structure for table `external_calendars`
--

CREATE TABLE `external_calendars` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `provider_name` varchar(100) NOT NULL,
  `ical_url` text NOT NULL,
  `last_sync` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `property_id`, `created_at`) VALUES
(15, 68, 80, '2026-05-17 11:22:31');

-- --------------------------------------------------------

--
-- Table structure for table `food_items`
--

CREATE TABLE `food_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `category` enum('breakfast','lunch','dinner','snacks','beverages') DEFAULT 'lunch',
  `is_available` tinyint(1) DEFAULT 1,
  `preparation_time` int(11) DEFAULT 30,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `food_orders`
--

CREATE TABLE `food_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_reference` varchar(20) NOT NULL,
  `guest_id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'BDT',
  `status` enum('pending','confirmed','preparing','ready','delivered','cancelled') DEFAULT 'pending',
  `delivery_time` time DEFAULT NULL,
  `special_instructions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `food_order_items`
--

CREATE TABLE `food_order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `food_item_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_accounts_heads`
--

CREATE TABLE `hms_accounts_heads` (
  `id` int(11) NOT NULL,
  `host_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` enum('income','expense','asset','liability') DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_accounts_heads`
--

INSERT INTO `hms_accounts_heads` (`id`, `host_id`, `name`, `type`, `parent_id`, `is_system`, `created_at`) VALUES
(1, NULL, 'Room Revenue', 'income', NULL, 1, '2026-04-26 08:19:01'),
(2, NULL, 'Service Charge', 'income', NULL, 1, '2026-04-26 08:19:02'),
(3, NULL, 'Laundry Income', 'income', NULL, 1, '2026-04-26 08:19:03'),
(4, NULL, 'Staff Salary', 'expense', NULL, 1, '2026-04-26 08:19:03'),
(5, NULL, 'Electricity Bill', 'expense', NULL, 1, '2026-04-26 08:19:03'),
(6, NULL, 'Water Bill', 'expense', NULL, 1, '2026-04-26 08:19:03'),
(7, NULL, 'Maintenance', 'expense', NULL, 1, '2026-04-26 08:19:03'),
(8, NULL, 'Office Rent', 'expense', NULL, 1, '2026-04-26 08:19:03'),
(9, 59, 'Food & Beverage Income', 'income', NULL, 0, '2026-05-04 09:56:59'),
(10, 59, 'Platform Commission', 'expense', NULL, 0, '2026-05-05 05:07:09'),
(11, 59, 'Refunds/Cancellations', 'expense', NULL, 0, '2026-05-05 08:20:59');

-- --------------------------------------------------------

--
-- Table structure for table `hms_accounts_transactions`
--

CREATE TABLE `hms_accounts_transactions` (
  `id` int(11) NOT NULL,
  `host_id` int(11) DEFAULT NULL,
  `property_id` bigint(20) UNSIGNED DEFAULT NULL,
  `account_head_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `type` enum('debit','credit') DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_accounts_transactions`
--

INSERT INTO `hms_accounts_transactions` (`id`, `host_id`, `property_id`, `account_head_id`, `amount`, `type`, `description`, `reference_type`, `reference_id`, `date`, `created_at`) VALUES
(102, 59, 78, 4, 69948.20, 'debit', 'Salary Payment - Tanjim (May/2026)', 'payroll', 5, '2026-05-23', '2026-05-23 08:34:45');

-- --------------------------------------------------------

--
-- Table structure for table `hms_accounts_vouchers`
--

CREATE TABLE `hms_accounts_vouchers` (
  `id` int(11) NOT NULL,
  `host_id` int(11) DEFAULT NULL,
  `property_id` bigint(20) UNSIGNED DEFAULT NULL,
  `voucher_no` varchar(50) DEFAULT NULL,
  `type` enum('payment','receipt','journal') DEFAULT NULL,
  `date` date DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_allowances`
--

CREATE TABLE `hms_allowances` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `amount_type` enum('fixed','percentage') DEFAULT 'fixed',
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_allowances`
--

INSERT INTO `hms_allowances` (`id`, `host_id`, `name`, `amount_type`, `amount`, `created_at`) VALUES
(1, 59, 'House Rent', 'percentage', 50.00, '2026-04-26 05:17:05');

-- --------------------------------------------------------

--
-- Table structure for table `hms_attendance`
--

CREATE TABLE `hms_attendance` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `punch_in` datetime DEFAULT NULL,
  `punch_out` datetime DEFAULT NULL,
  `punch_in_ip` varchar(45) DEFAULT NULL,
  `punch_out_ip` varchar(45) DEFAULT NULL,
  `status` enum('present','late','absent','half_day') DEFAULT 'present',
  `work_hours` decimal(5,2) DEFAULT 0.00,
  `overtime_hours` decimal(5,2) DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_attendance`
--

INSERT INTO `hms_attendance` (`id`, `host_id`, `employee_id`, `date`, `punch_in`, `punch_out`, `punch_in_ip`, `punch_out_ip`, `status`, `work_hours`, `overtime_hours`, `note`, `created_at`) VALUES
(2, 59, 3, '2026-05-02', '2026-05-02 13:13:33', '2026-05-02 13:23:30', '::1', '::1', 'present', 0.17, 0.00, NULL, '2026-05-02 07:13:33'),
(3, 59, 5, '2026-05-23', '2026-05-23 04:31:46', NULL, '127.0.0.1', NULL, 'present', 0.00, 0.00, NULL, '2026-05-23 08:31:46');

-- --------------------------------------------------------

--
-- Table structure for table `hms_bills`
--

CREATE TABLE `hms_bills` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `service_name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_deductions`
--

CREATE TABLE `hms_deductions` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `amount_type` enum('fixed','percentage') DEFAULT 'fixed',
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_deductions`
--

INSERT INTO `hms_deductions` (`id`, `host_id`, `name`, `amount_type`, `amount`, `created_at`) VALUES
(1, 59, 'Provident Fund', 'percentage', 10.00, '2026-04-26 05:17:59');

-- --------------------------------------------------------

--
-- Table structure for table `hms_departments`
--

CREATE TABLE `hms_departments` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_departments`
--

INSERT INTO `hms_departments` (`id`, `host_id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 59, 'Administration', 'Administration', 'active', '2026-04-26 05:32:06', '2026-04-26 05:32:06'),
(2, 59, 'Finance', '---', 'active', '2026-04-26 05:32:22', '2026-04-26 05:32:22'),
(3, 59, 'Accounts', 'Accounts', 'active', '2026-05-23 08:24:35', '2026-05-23 08:24:35'),
(4, 59, 'Operation', '---', 'active', '2026-05-23 08:25:03', '2026-05-23 08:25:03');

-- --------------------------------------------------------

--
-- Table structure for table `hms_designations`
--

CREATE TABLE `hms_designations` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_designations`
--

INSERT INTO `hms_designations` (`id`, `host_id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 59, 'Receptionist', '---', 'active', '2026-04-26 05:32:38', '2026-04-26 05:32:38'),
(2, 59, 'Manager', '---', 'active', '2026-04-26 05:32:46', '2026-04-26 05:32:46'),
(3, 59, 'Care Taker', '---', 'active', '2026-04-26 05:32:54', '2026-04-26 05:32:54'),
(4, 59, 'Housekeeping', 'Housekeeping', 'active', '2026-05-03 06:43:56', '2026-05-03 06:43:56'),
(5, 59, 'Accountant', '---', 'active', '2026-05-23 08:26:00', '2026-05-23 08:26:00');

-- --------------------------------------------------------

--
-- Table structure for table `hms_employees`
--

CREATE TABLE `hms_employees` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `designation_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `shift_id` int(11) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','terminated') DEFAULT 'active',
  `role` varchar(50) DEFAULT 'staff',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_employees`
--

INSERT INTO `hms_employees` (`id`, `host_id`, `property_id`, `user_id`, `name`, `email`, `phone`, `salary`, `designation_id`, `department_id`, `shift_id`, `blood_group`, `date_of_birth`, `appointment_date`, `joining_date`, `address`, `photo`, `status`, `role`, `permissions`, `created_at`, `updated_at`) VALUES
(3, 59, 78, 62, 'Manager', 'manager@keyhost.com', '01932570096', 20000.00, 2, 1, NULL, 'A+', '1998-04-22', '2026-04-01', '2026-04-01', 'Mohammadpur, Dhaka', '/uploads/employees/emp-1777182027323-844037451.webp', 'active', NULL, '{}', '2026-04-26 05:40:27', '2026-05-05 06:22:12'),
(4, 59, 78, 65, 'Mr. HK-Staff', 'hkstaff@keyhost.com', '123421', 10000.00, 4, 1, NULL, 'A+', '1999-05-14', '2026-05-01', '2026-05-01', 'Dhaka', NULL, 'active', NULL, '{}', '2026-05-03 06:45:20', '2026-05-23 06:51:18'),
(5, 59, 78, 76, 'Tanjim', 'tanjim@gmail.com', '0139856852', 49963.00, 5, 3, NULL, 'A+', '2026-05-23', NULL, NULL, 'Dhaka', NULL, 'active', 'staff', '{}', '2026-05-23 08:29:25', '2026-05-23 08:29:25');

-- --------------------------------------------------------

--
-- Table structure for table `hms_expenses`
--

CREATE TABLE `hms_expenses` (
  `id` int(11) NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `category` enum('utility','maintenance','inventory','marketing','staff_salary','other') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_method` enum('cash','bank_transfer','card','mobile_banking') DEFAULT 'cash',
  `receipt_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_food_items`
--

CREATE TABLE `hms_food_items` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_food_items`
--

INSERT INTO `hms_food_items` (`id`, `property_id`, `name`, `description`, `price`, `category`, `image_url`, `is_available`, `created_at`) VALUES
(1, 78, 'Pasta', 'Pasta', 250.00, 'Snacks', '/uploads/properties/hms-food-1777798855447-677067361.webp', 1, '2026-05-03 07:10:41'),
(2, 78, 'Coca Cola 250ml', '', 25.00, 'Snacks', '/uploads/properties/hms-food-1778041111270-78851888.webp', 1, '2026-05-06 04:18:33'),
(3, 78, 'Egg fried rice , BBQ chicken , Vegetables', 'Egg fried rice , BBQ chicken , Vegetables', 220.00, 'Lunch', '/uploads/properties/hms-food-1778056442154-670290565.webp', 1, '2026-05-06 08:34:02'),
(4, 78, '7 Up Can - 250 ml', '7 Up Can - 250 ml', 70.00, 'Drinks', '/uploads/properties/hms-food-1778056530727-569923283.webp', 1, '2026-05-06 08:35:30'),
(5, 78, 'Coca-Cola Zero Can - 250 ml', 'Coca-Cola Zero Can - 250 ml', 70.00, 'Drinks', '/uploads/properties/hms-food-1778057067618-911103705.webp', 1, '2026-05-06 08:44:27');

-- --------------------------------------------------------

--
-- Table structure for table `hms_food_orders`
--

CREATE TABLE `hms_food_orders` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `booking_id` bigint(20) UNSIGNED DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','preparing','served','cancelled') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','billed_to_room') DEFAULT 'unpaid',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_food_order_items`
--

CREATE TABLE `hms_food_order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_housekeeping`
--

CREATE TABLE `hms_housekeeping` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `status` enum('dirty','cleaning','clean','inspected') DEFAULT 'dirty',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_housekeeping`
--

INSERT INTO `hms_housekeeping` (`id`, `property_id`, `room_id`, `staff_id`, `status`, `priority`, `notes`, `assigned_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(2, 78, 1, 4, 'clean', 'medium', 'gfgf', NULL, '2026-05-05 13:10:26', '2026-05-05 07:10:09', '2026-05-05 07:10:26');

-- --------------------------------------------------------

--
-- Table structure for table `hms_packages`
--

CREATE TABLE `hms_packages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_cycle` enum('monthly','yearly') DEFAULT 'monthly',
  `trial_days` int(11) DEFAULT 14,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_trial` tinyint(1) DEFAULT 0,
  `duration_days` int(11) DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_packages`
--

INSERT INTO `hms_packages` (`id`, `name`, `price`, `billing_cycle`, `trial_days`, `features`, `is_active`, `created_at`, `updated_at`, `is_trial`, `duration_days`) VALUES
(1, 'HMS Premium', 10.00, 'monthly', 14, '[]', 1, '2026-04-20 04:30:56', '2026-04-20 06:13:59', 0, 30),
(2, 'Trial Package', 0.00, 'monthly', 7, '[]', 1, '2026-04-20 04:43:12', '2026-04-20 06:15:14', 1, 7);

-- --------------------------------------------------------

--
-- Table structure for table `hms_payrolls`
--

CREATE TABLE `hms_payrolls` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` varchar(20) NOT NULL,
  `year` int(11) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `total_allowance` decimal(10,2) DEFAULT 0.00,
  `total_deduction` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` enum('pending','paid') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_payrolls`
--

INSERT INTO `hms_payrolls` (`id`, `host_id`, `employee_id`, `month`, `year`, `basic_salary`, `total_allowance`, `total_deduction`, `net_salary`, `payment_date`, `status`, `created_at`) VALUES
(5, 59, 5, 'May', 2026, 49963.00, 24981.50, 4996.30, 69948.20, '2026-05-23', 'paid', '2026-05-23 08:34:22');

-- --------------------------------------------------------

--
-- Table structure for table `hms_rooms`
--

CREATE TABLE `hms_rooms` (
  `id` int(11) NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `room_type` varchar(100) DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('available','occupied','dirty','maintenance') DEFAULT 'available',
  `features` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_rooms`
--

INSERT INTO `hms_rooms` (`id`, `property_id`, `room_number`, `room_type`, `floor`, `price`, `status`, `features`, `images`, `created_at`, `updated_at`) VALUES
(1, 78, '101', 'Standard', '1st', 10.00, 'available', '[]', '[\"/uploads/rooms/hms-room-1776837476011-278100382.webp\",\"/uploads/rooms/hms-room-1776837476417-446927213.webp\",\"/uploads/rooms/hms-room-1776837476524-722896760.webp\",\"/uploads/rooms/hms-room-1776837476646-42191238.webp\",\"/uploads/rooms/hms-room-1776837476749-963192734.webp\",\"/uploads/rooms/hms-room-1776837476830-565210632.webp\"]', '2026-04-21 09:42:36', '2026-05-07 06:34:01'),
(2, 78, '102', 'Deluxe', '1st', 2500.00, 'available', '[]', NULL, '2026-04-22 04:46:18', '2026-05-05 08:04:33'),
(3, 78, '201', 'Executive Suite', '2nd', 5000.00, 'available', '[]', NULL, '2026-04-22 05:14:54', '2026-04-22 05:14:54'),
(4, 78, '202', 'Executive Suite', '2nd', 5000.00, 'available', '[]', NULL, '2026-04-22 05:14:54', '2026-04-22 05:14:54'),
(5, 78, '203', 'Executive Suite', '2nd', 5000.00, 'available', '[]', NULL, '2026-04-22 05:14:54', '2026-04-22 05:14:54'),
(6, 78, '301', 'Penthouse', '3rd', 10000.00, 'available', '[]', '[\"/uploads/rooms/hms-room-1776837802814-453399316.webp\",\"/uploads/rooms/hms-room-1776837802950-501778318.webp\",\"/uploads/rooms/hms-room-1776837803071-415129616.webp\",\"/uploads/rooms/hms-room-1776837803185-181445928.webp\",\"/uploads/rooms/hms-room-1776837803265-149123595.webp\",\"/uploads/rooms/hms-room-1776837803431-990404244.webp\"]', '2026-04-22 06:03:23', '2026-04-22 06:03:23');

-- --------------------------------------------------------

--
-- Table structure for table `hms_room_types`
--

CREATE TABLE `hms_room_types` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_rosters`
--

CREATE TABLE `hms_rosters` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` int(11) NOT NULL,
  `shift_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_rosters`
--

INSERT INTO `hms_rosters` (`id`, `host_id`, `employee_id`, `shift_id`, `date`, `note`, `created_at`) VALUES
(16, 59, 3, 1, '2026-05-02', NULL, '2026-05-02 07:06:59'),
(17, 59, 3, 1, '2026-05-03', NULL, '2026-05-02 07:06:59'),
(18, 59, 3, 2, '2026-05-04', NULL, '2026-05-02 07:06:59'),
(19, 59, 3, 2, '2026-05-05', NULL, '2026-05-02 07:06:59'),
(24, 59, 4, NULL, '2026-05-01', NULL, '2026-05-03 10:08:43'),
(25, 59, 4, 2, '2026-05-02', NULL, '2026-05-03 10:08:43'),
(26, 59, 4, 2, '2026-05-03', NULL, '2026-05-03 10:08:43'),
(27, 59, 4, 1, '2026-05-04', NULL, '2026-05-03 10:08:43'),
(28, 59, 4, 1, '2026-05-05', NULL, '2026-05-03 10:08:43'),
(29, 59, 4, 1, '2026-05-06', NULL, '2026-05-03 10:08:43'),
(30, 59, 4, 2, '2026-05-07', NULL, '2026-05-03 10:08:43'),
(31, 59, 4, 3, '2026-05-09', NULL, '2026-05-03 10:08:43'),
(32, 59, 4, 3, '2026-05-10', NULL, '2026-05-03 10:08:43');

-- --------------------------------------------------------

--
-- Table structure for table `hms_shifts`
--

CREATE TABLE `hms_shifts` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_shifts`
--

INSERT INTO `hms_shifts` (`id`, `host_id`, `name`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
(1, 59, 'Morning', '07:00:00', '15:00:00', 'active', '2026-04-26 06:22:24', '2026-04-26 06:22:24'),
(2, 59, 'Evening', '15:00:00', '23:00:00', 'active', '2026-04-26 06:22:50', '2026-04-26 06:22:50'),
(3, 59, 'Night', '23:00:00', '07:00:00', 'active', '2026-04-26 06:23:06', '2026-04-26 06:23:06');

-- --------------------------------------------------------

--
-- Table structure for table `hms_staff`
--

CREATE TABLE `hms_staff` (
  `id` int(11) NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('manager','receptionist','housekeeping','maintenance','security','other') NOT NULL DEFAULT 'other',
  `salary` decimal(10,2) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_staff`
--

INSERT INTO `hms_staff` (`id`, `property_id`, `first_name`, `last_name`, `email`, `phone`, `role`, `salary`, `joining_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 78, 'HJ-Staff', '01', 'hjstaff@gmail.com', '01932570096', 'receptionist', 20000.00, '2026-04-22', 'active', '2026-04-22 04:16:34', '2026-04-22 04:16:34');

-- --------------------------------------------------------

--
-- Table structure for table `hms_staff_members`
--

CREATE TABLE `hms_staff_members` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_subscriptions`
--

CREATE TABLE `hms_subscriptions` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','inactive','trialing','expired') DEFAULT 'inactive',
  `plan_type` enum('basic','premium') DEFAULT 'basic',
  `trial_started_at` datetime DEFAULT NULL,
  `trial_ends_at` datetime DEFAULT NULL,
  `subscription_ends_at` datetime DEFAULT NULL,
  `is_trial_used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `package_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_subscriptions`
--

INSERT INTO `hms_subscriptions` (`id`, `host_id`, `status`, `plan_type`, `trial_started_at`, `trial_ends_at`, `subscription_ends_at`, `is_trial_used`, `created_at`, `updated_at`, `package_id`) VALUES
(3, 59, 'active', 'basic', '2026-05-04 15:21:46', '2026-05-11 15:21:46', '2026-06-22 02:44:54', 1, '2026-05-04 09:21:46', '2026-05-23 06:44:54', 1);

-- --------------------------------------------------------

--
-- Table structure for table `member_status_tiers`
--

CREATE TABLE `member_status_tiers` (
  `id` int(11) NOT NULL,
  `tier_name` varchar(50) NOT NULL,
  `tier_display_name` varchar(100) NOT NULL,
  `min_points` int(11) NOT NULL COMMENT 'Minimum total points required for this tier',
  `tier_color` varchar(20) DEFAULT '#666666',
  `tier_icon` varchar(100) DEFAULT NULL,
  `benefits` text DEFAULT NULL COMMENT 'JSON array of benefits',
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `member_status_tiers`
--

INSERT INTO `member_status_tiers` (`id`, `tier_name`, `tier_display_name`, `min_points`, `tier_color`, `tier_icon`, `benefits`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'bronze', 'Bronze', 0, '#CD7F32', NULL, NULL, 1, 1, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(2, 'silver', 'Silver', 1000, '#C0C0C0', NULL, NULL, 1, 2, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(3, 'gold', 'Gold', 5000, '#FFD700', NULL, NULL, 1, 3, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(4, 'platinum', 'Platinum', 10000, '#E5E4E2', NULL, NULL, 1, 4, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(5, 'diamond', 'Diamond', 25000, '#B9F2FF', NULL, NULL, 1, 5, '2025-12-09 09:25:59', '2025-12-09 09:25:59');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `is_read`, `created_at`) VALUES
(10, 14, 74, 'Hello, I\'m interested in your property. Could you provide more details about the amenities and check-in times? Thank you!', 0, '2026-05-22 15:26:55'),
(11, 15, 74, 'Hi Reservation2! I\'ll be visiting...', 0, '2026-05-22 15:46:19'),
(12, 16, 74, 'Hello, I\'m interested in your property. Please let me know more details.', 1, '2026-05-22 16:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `messages_backup_1769410022550`
--

CREATE TABLE `messages_backup_1769410022550` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED DEFAULT NULL,
  `property_id` bigint(20) UNSIGNED DEFAULT NULL,
  `message` text NOT NULL,
  `message_type` enum('text','image','file') DEFAULT 'text',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('booking','payment','review','system','promotion') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `tran_id` varchar(100) NOT NULL,
  `val_id` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `points_to_redeem` int(11) DEFAULT 0,
  `original_amount` decimal(10,2) DEFAULT 0.00,
  `package_id` int(11) DEFAULT NULL,
  `host_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `booking_id`, `tran_id`, `val_id`, `amount`, `status`, `created_at`, `updated_at`, `points_to_redeem`, `original_amount`, `package_id`, `host_id`) VALUES
(92, NULL, 'HMS1779001279705', NULL, 10.00, 'Cancelled', '2026-05-17 07:01:19', '2026-05-17 07:01:28', 0, 0.00, 1, 59),
(93, 174, 'REF1779002941186', NULL, 20.00, 'PENDING', '2026-05-17 07:29:01', '2026-05-17 07:29:01', 0, 0.00, NULL, NULL),
(94, 176, 'REF1779008018951', NULL, 2400.00, 'Cancelled', '2026-05-17 08:53:38', '2026-05-17 08:54:50', 0, 0.00, NULL, NULL),
(95, 177, 'REF1779013317120', NULL, 2000.00, 'PENDING', '2026-05-17 10:21:57', '2026-05-17 10:21:57', 0, 0.00, NULL, NULL),
(96, 178, 'REF1779014191996', NULL, 2000.00, 'PENDING', '2026-05-17 10:36:31', '2026-05-17 10:36:31', 0, 0.00, NULL, NULL),
(97, 179, 'REF1779017054438', '2605171725047310505593081d0', 2000.00, 'Success', '2026-05-17 11:24:14', '2026-05-17 11:25:06', 0, 0.00, NULL, NULL),
(98, 180, 'REF1779046905611', '26051814309316469265b3c4bd', 2500.00, 'Success', '2026-05-17 19:41:45', '2026-05-17 19:43:11', 0, 0.00, NULL, NULL),
(99, 182, 'REF1779514122234', NULL, 20.00, 'Cancelled', '2026-05-23 05:28:42', '2026-05-23 05:28:53', 0, 0.00, NULL, NULL),
(100, 182, 'REF1779514147645', NULL, 20.00, 'PENDING', '2026-05-23 05:29:07', '2026-05-23 05:29:07', 0, 0.00, NULL, NULL),
(101, NULL, 'HMS1779518533522', NULL, 10.00, 'Cancelled', '2026-05-23 06:42:13', '2026-05-23 06:43:18', 0, 0.00, 1, 59),
(102, NULL, 'HMS1779518615242', '260523124448765337636fedd50', 10.00, 'Success', '2026-05-23 06:43:35', '2026-05-23 06:44:49', 0, 0.00, 1, 59),
(103, 183, 'REF1779523999520', '26052314140858506108724e880', 20.00, 'Success', '2026-05-23 08:13:19', '2026-05-23 08:14:09', 0, 0.00, NULL, NULL),
(104, 184, 'REF1779564781566', NULL, 2500.00, 'PENDING', '2026-05-23 19:33:01', '2026-05-23 19:33:01', 0, 0.00, NULL, NULL),
(105, 185, 'REF1779571810709', NULL, 2500.00, 'PENDING', '2026-05-23 21:30:10', '2026-05-23 21:30:10', 0, 0.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `owner_balances`
--

CREATE TABLE `owner_balances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_owner_id` bigint(20) UNSIGNED NOT NULL,
  `total_earnings` decimal(12,2) DEFAULT 0.00,
  `total_payouts` decimal(12,2) DEFAULT 0.00,
  `current_balance` decimal(12,2) DEFAULT 0.00,
  `commission_paid_to_admin` decimal(12,2) DEFAULT 0.00,
  `commission_pending` decimal(12,2) DEFAULT 0.00,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `owner_payouts`
--

CREATE TABLE `owner_payouts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_owner_id` bigint(20) UNSIGNED NOT NULL,
  `payout_reference` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_earnings` decimal(12,2) NOT NULL,
  `total_commission_paid` decimal(12,2) DEFAULT 0.00,
  `net_payout` decimal(12,2) NOT NULL,
  `payment_method` enum('bank_transfer','bkash','nagad','rocket','cash') NOT NULL,
  `payment_status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `routing_number` varchar(20) DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `owner_payout_items`
--

CREATE TABLE `owner_payout_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payout_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `booking_total` decimal(10,2) NOT NULL,
  `admin_commission` decimal(10,2) NOT NULL,
  `owner_earnings` decimal(10,2) NOT NULL,
  `commission_paid_to_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `payment_reference` varchar(50) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_type` enum('booking','refund','security_deposit') DEFAULT 'booking',
  `transaction_type` varchar(50) DEFAULT 'payment',
  `amount` decimal(10,2) NOT NULL,
  `dr_amount` decimal(10,2) DEFAULT 0.00,
  `cr_amount` decimal(10,2) DEFAULT 0.00,
  `running_balance` decimal(10,2) DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'BDT',
  `gateway_transaction_id` varchar(100) DEFAULT NULL,
  `bank_tran_id` varchar(100) DEFAULT NULL,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `notes` text DEFAULT NULL,
  `status` enum('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `payment_reference`, `payment_method`, `payment_type`, `transaction_type`, `amount`, `dr_amount`, `cr_amount`, `running_balance`, `currency`, `gateway_transaction_id`, `bank_tran_id`, `gateway_response`, `notes`, `status`, `payment_date`, `processed_at`, `created_at`, `updated_at`) VALUES
(237, 174, 'DR-1779002935911-174', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'cancelled', '2026-05-17 07:28:55', NULL, '2026-05-17 07:28:55', '2026-05-23 05:26:20'),
(238, 175, 'DR-1779003308012-175', NULL, 'booking', 'owner_accepted', 35.00, 35.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳35', 'cancelled', '2026-05-17 07:35:08', NULL, '2026-05-17 07:35:08', '2026-05-23 05:26:20'),
(239, 176, 'DR-1779008007537-176', NULL, 'booking', 'owner_accepted', 2400.00, 2400.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2400', 'cancelled', '2026-05-17 08:53:27', NULL, '2026-05-17 08:53:27', '2026-05-23 05:26:21'),
(240, 177, 'DR-1779013278160-177', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'cancelled', '2026-05-17 10:21:18', NULL, '2026-05-17 10:21:18', '2026-05-23 05:26:21'),
(241, 178, 'DR-1779014180906-178', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'cancelled', '2026-05-17 10:36:20', NULL, '2026-05-17 10:36:20', '2026-05-23 05:26:21'),
(242, 179, 'DR-1779017045938-179', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'completed', '2026-05-17 11:24:05', NULL, '2026-05-17 11:24:05', '2026-05-17 11:25:06'),
(243, 179, 'SSL-REF1779017054438', 'sslcommerz', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', 'REF1779017054438', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2000.00', 'completed', '2026-05-17 11:25:06', NULL, '2026-05-17 11:25:06', '2026-05-17 11:25:06'),
(244, 180, 'DR-1779046884079-180', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-05-17 19:41:24', NULL, '2026-05-17 19:41:24', '2026-05-17 19:43:11'),
(245, 180, 'SSL-REF1779046905611', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1779046905611', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-05-17 19:43:11', NULL, '2026-05-17 19:43:11', '2026-05-17 19:43:11'),
(246, 181, 'DR-1779182874676-181', NULL, 'booking', 'owner_accepted', 96000.00, 96000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳96000', 'cancelled', '2026-05-19 09:27:54', NULL, '2026-05-19 09:27:54', '2026-05-23 05:26:22'),
(247, 182, 'DR-1779514111973-182', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'cancelled', '2026-05-23 05:28:31', NULL, '2026-05-23 05:28:31', '2026-05-23 05:49:20'),
(248, 183, 'DR-1779523983308-183', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'completed', '2026-05-23 08:13:03', NULL, '2026-05-23 08:13:03', '2026-05-23 08:14:09'),
(249, 183, 'SSL-REF1779523999520', 'sslcommerz', 'booking', 'guest_payment', 20.00, 0.00, 20.00, 0.00, 'BDT', 'REF1779523999520', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳20.00', 'completed', '2026-05-23 08:14:09', NULL, '2026-05-23 08:14:09', '2026-05-23 08:14:09'),
(250, 184, 'DR-1779564766389-184', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-05-23 19:32:46', NULL, '2026-05-23 19:32:46', '2026-05-23 19:34:58'),
(251, 185, 'DR-1779571791009-185', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-05-23 21:29:51', NULL, '2026-05-23 21:29:51', '2026-05-23 21:32:42');

-- --------------------------------------------------------

--
-- Table structure for table `payment_settings`
--

CREATE TABLE `payment_settings` (
  `id` int(11) NOT NULL,
  `provider_name` varchar(50) NOT NULL,
  `store_id` varchar(255) NOT NULL,
  `store_password` varchar(255) NOT NULL,
  `is_live` tinyint(1) DEFAULT 0,
  `currency` varchar(10) DEFAULT 'BDT',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_settings`
--

INSERT INTO `payment_settings` (`id`, `provider_name`, `store_id`, `store_password`, `is_live`, `currency`, `updated_at`) VALUES
(1, 'sslcommerz', 'keyhost0live', '69B795058626C68204', 1, 'BDT', '2026-05-07 07:05:05');

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `property_type` enum('room','villa','apartment','house','hotel','hotels') NOT NULL,
  `property_category` enum('budget','standard','premium','luxury') DEFAULT 'standard',
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `bedrooms` int(11) NOT NULL DEFAULT 0,
  `bathrooms` int(11) NOT NULL DEFAULT 0,
  `max_guests` int(11) NOT NULL DEFAULT 1,
  `size_sqft` int(11) DEFAULT NULL,
  `floor_number` int(11) DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `cleaning_fee` decimal(10,2) DEFAULT 0.00,
  `security_deposit` decimal(10,2) DEFAULT 0.00,
  `extra_guest_fee` decimal(10,2) DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'BDT',
  `status` enum('active','inactive','suspended','pending_approval','in_progress') DEFAULT 'in_progress',
  `is_featured` tinyint(1) DEFAULT 0,
  `is_instant_book` tinyint(1) DEFAULT 0,
  `is_non_refundable` tinyint(1) DEFAULT 0,
  `check_in_time` time DEFAULT '15:00:00',
  `check_out_time` time DEFAULT '11:00:00',
  `minimum_stay` int(11) DEFAULT 1,
  `maximum_stay` int(11) DEFAULT NULL,
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `display_category_id` int(11) DEFAULT NULL,
  `is_hms_enabled` tinyint(1) DEFAULT 0,
  `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`id`, `owner_id`, `title`, `description`, `property_type`, `property_category`, `address`, `city`, `state`, `country`, `postal_code`, `latitude`, `longitude`, `bedrooms`, `bathrooms`, `max_guests`, `size_sqft`, `floor_number`, `base_price`, `cleaning_fee`, `security_deposit`, `extra_guest_fee`, `currency`, `status`, `is_featured`, `is_instant_book`, `is_non_refundable`, `check_in_time`, `check_out_time`, `minimum_stay`, `maximum_stay`, `average_rating`, `total_reviews`, `created_at`, `updated_at`, `display_category_id`, `is_hms_enabled`, `slug`) VALUES
(68, 27, 'Peaceful 3BR Near Evercare & NSU', '\nLiving room  Sofa set, smart TV, dining table\n\nFully equipped kitchen  Fridge, gas stove, microwave, kettle, cookware & utensils\n\nAir conditioning  In all bedrooms\n\nWi-Fi  Fast and reliable, suitable for work or streaming\n\nGenerator backup  No worries during load-shedding\n\nPerfect for up to 6 guests looking for comfort and convenience.', 'apartment', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 3, 3, 6, NULL, NULL, 6000.00, 0.00, 0.00, 500.00, 'BDT', 'in_progress', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-03-31 04:45:48', '2026-05-23 04:36:13', NULL, 0, 'peaceful-3br-near-evercare-nsu-68'),
(69, 27, 'Private Deluxe Suite near Evercare & NSU', 'Relax in this modern AC suite featuring a plush double bed, private ensuite bathroom with hotwater shower, and a comfy seating area. Enjoy a mini fridge, flatscreen TV, ceiling fan, wardrobe, and free WiFi. Thoughtful touches include fresh linens, toiletries and a welcome note with local tips. Ideal for couples or solo travellers seeking comfort near local restaurants and shops.', 'room', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 1, 1, 2, NULL, NULL, 2500.00, 0.00, 0.00, 500.00, 'BDT', 'active', 1, 0, 0, '14:00:00', '00:00:00', 1, NULL, 0.00, 0, '2026-03-31 08:36:05', '2026-05-23 04:36:34', NULL, 0, 'private-deluxe-suite-near-evercare-nsu-69'),
(70, 27, 'Private AC Suite Near Evercare, NSU & ISD', 'Welcome to a clean, comfortable, and private stay in Bashundhara Residential Area (Block A, Road 1)  just minutes from Evercare Hospital, North South University (NSU), and ISD.\n\nThe Space\n- Comfortable queen-size bed\n-Air conditioning\n-Private attached bathroom with shower\n-High-speed WiFi\n-Small seating area\n-Fresh linens', 'room', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 1, 1, 2, NULL, NULL, 2500.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '14:00:00', '00:00:00', 1, NULL, 0.00, 0, '2026-03-31 08:46:37', '2026-05-23 04:36:44', NULL, 0, 'private-ac-suite-near-evercare-nsu-isd-70'),
(73, 26, '3BR apartment near evercare', ' Spacious 3BR Apartment  2 Ensuites  Balcony  Bashundhara\nUnwind in a clean, cozy, and fully furnished  apartment located in the heart of Bashundhara Block A, Dhaka. Ideal for families, business travelers, or small groups enjoy AC in every room, fast Wi-Fi, private balconies, and 24/7 security. Flexible check-in/out and weekly cleaning .\n\n Whats Nearby:\n\n️ Jamuna Future Park 5 mins\n\n Evercare Hospital  7 mins\n\n Dhaka Airport  20 mins\n\n Baridhara Diplomatic Zone  10 mins', 'apartment', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 3, 3, 6, 1650, NULL, 6000.00, 0.00, 0.00, 500.00, 'BDT', 'active', 1, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-03-31 12:55:52', '2026-05-23 04:37:46', NULL, 0, '3br-apartment-near-evercare-73'),
(74, 28, ' 3 Bedroom Furnished Apartment for Rent in Mirpur Original 10 ️Dhaka Bangladesh ', ' 3 Bedroom Furnished Apartment for Rent in Mirpur Original 10 ️Dhaka Bangladesh \n\n Location: Mirpur Original 10, West Side, Near Dhaka Metro Rail (Metro 10 Station) Bangladesh \n মেট্রোর একদম পাশে  Easy Communication\n\n\n\n Apartment Features:\n️ Fully Furnished Luxury Flat\n️ 3 Spacious Bedrooms\n️ 1 Attached Bathroom  2 Common Bathrooms\n️ Elegant Drawing Room with Android TV\n️ Dining Space\n️ Modern Kitchen\n️ 3 Verandas (Open & Airy)\n️ Fridge  Oven\n️ Pure It Water Filter\n️ Kitchen Accessories\n️ High Speed Internet\n️ 1 Time Daily Cleaning Service \n️ Car Parking (On Demand  Chargeable)\n️ Catering Service Available (On Demand)\n\n Youll find everything you need for a perfect comfortable stay!\n\n Booking Requirement:\n Valid NID / Passport Copy Required', 'apartment', 'standard', 'Rony.Section-6,Block-A,Road-5,Plot-3,Mirpur,Dhaka-1216.Bangladesh.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1216', NULL, NULL, 3, 3, 6, 1175, NULL, 4000.00, 0.00, 0.00, 500.00, 'BDT', 'active', 1, 0, 0, '12:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-04-02 11:31:42', '2026-05-23 05:10:10', NULL, 0, '3-bedroom-furnished-apartment-for-rent-in-mirpur-74'),
(75, 28, ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড!  Mirpur Dhaka Bangladesh.', ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড! \nMirpur Dhaka Bangladesh.\nPerfect Stay  Prime Location  Ready to Move\n\n Why This Apartment is Special?\n\n Location: Mirpur Original 10.Just beside Metro 10 Station (West Side)  Just Walking Distance \n Inside the Apartment Youll Get:\n️ 2 Luxury Furnished Bedrooms\n️1 AC Room for Premium Comfort\n Smart Android TV\n️ Complete Kitchen\n Fridge  Oven  Pureit Water Filter\n High Speed Internet\n Daily one time Cleaning Service (FREE)\n Car Parking Available.(chargeable)\n Catering Service Available.\n Perfect for:\n️ Family Stay\n️ বিদেশ থেকে আসা Guest\n️ Corporate People\n️ Short Term Luxury Stay\n', 'apartment', 'standard', 'Rony.Section-6,Block-A,Road-5,Plot-3,Mirpur,Dhaka-1216.Bangladesh.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1216', NULL, NULL, 2, 2, 4, 650, NULL, 3000.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '12:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-04-02 11:36:40', '2026-05-23 04:38:31', NULL, 0, 'mirpur-dhaka-bangladesh-75'),
(76, 28, ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট 1 ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড!  Mirpur Dhaka Bangladesh.', ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড! \nMirpur Dhaka Bangladesh.\nPerfect Stay  Prime Location  Ready to Move\n\n Why This Apartment is Special?\n\n Location: Mirpur Original 10.Just beside Metro 10 Station (West Side)  Just Walking Distance \n Inside the Apartment Youll Get:\n️ 2 Luxury Furnished Bedrooms\n️1 AC Room for Premium Comfort\n Smart Android TV\n️ Complete Kitchen\n Fridge  Oven  Pureit Water Filter\n High Speed Internet\n Daily one time Cleaning Service (FREE)\n Car Parking Available.(chargeable)\n Catering Service Available.\n Perfect for:\n️ Family Stay\n️ বিদেশ থেকে আসা Guest\n️ Corporate People\n️ Short Term Luxury Stay\n', 'apartment', 'standard', 'Rony.Section-6,Block-A,Road-5,Plot-3,Mirpur,Dhaka-1216.Bangladesh.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1216', NULL, NULL, 2, 2, 4, 600, NULL, 3000.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '12:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-04-02 11:40:41', '2026-05-23 04:38:48', NULL, 0, '1-mirpur-dhaka-bangladesh-76'),
(77, 29, 'CC  TV Sweet Bedroom Attached Washroom & Balcony at Muhammadpur  Sat Masjid Housing', 'Special discount for a limited Time.\nAuto Applied on the selected date.\n𝐅𝐥𝐚𝐭 𝟏𝟔 𝐃𝐢𝐬𝐜𝐨𝐮𝐧𝐭\n\n 𝐅𝐚𝐜𝐢𝐥𝐢𝐭𝐢𝐞𝐬\n️ AC\n️ Attached Washroom\n️ Attached Balcony\n️ Fan, Bed & Light\n️ Free WiFi\n️ Kitchen Access (Guests must bring their own essentials  oil, salt, masala, etc.)\n️ Bike Parking Available  100 BDT/day\n\n Please Note: \n All guests must upload a clear photo of their NID or Passport in the Travela app after completing the payment\n Strictly Prohibited: No drugs, alcohol, or smoking allowed inside the property.\n No check-in after 12AM\n No check-in allowed without proper NIDs of all the guests', 'room', 'premium', 'Jannat Tower, Sat Masjid Housing Road, Dhaka, Bangladesh', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1207', 23.75821860, 90.35242660, 1, 1, 2, 150, NULL, 15.00, 0.00, 5.00, 0.00, 'BDT', 'active', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 4.00, 1, '2026-04-21 05:19:34', '2026-05-23 05:21:56', NULL, 0, 'cc-tv-sweet-bedroom-attached-washroom-balcony-77'),
(78, 29, 'Hotel Jannat ', 'Hotel Jannat ', 'hotels', 'premium', 'Jannat Tower, Sat Masjid Housing Road, Dhaka, Bangladesh', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1207', 23.75821860, 90.35242660, 20, 1, 2, NULL, NULL, 3000.00, 0.00, 0.00, 0.00, 'BDT', 'suspended', 1, 0, 0, '15:00:00', '11:00:00', 1, NULL, 4.00, 1, '2026-04-21 08:52:36', '2026-05-23 04:39:47', NULL, 1, 'hotel-jannat-78'),
(79, 29, 'sefrer', 'werwe', 'room', 'standard', 'Jannat Tower Rd, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1230', 23.87094350, 90.40683750, 1, 1, 2, NULL, NULL, 2500.00, 0.00, 0.00, 0.00, 'BDT', 'suspended', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-04-30 06:37:50', '2026-05-23 04:40:01', NULL, 0, 'sefrer-79'),
(80, 27, 'Private AC Suite near Evercare, NSU, IUB', 'Welcome to a clean, comfortable, and private stay in Bashundhara Residential Area (Block A, Road 1)  just minutes from Evercare Hospital, North South University (NSU), and ISD.\n\nThe Space\n- Comfortable queen-size bed\n-Air conditioning\n-Private attached bathroom with shower\n-High-speed WiFi\n-Small seating area\n-Fresh linens', 'room', 'standard', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 1, 1, 4, NULL, NULL, 2500.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '14:00:00', '12:00:00', 1, NULL, 0.00, 0, '2026-05-17 08:26:06', '2026-05-23 04:41:09', NULL, 0, 'private-ac-suite-near-evercare-nsu-iub-80'),
(81, 31, 'Test Cozy Apartment in Gulshan', 'This is a test property listing for QA purposes. It is not a real apartment. It has two bedrooms, a living area, kitchen, WiFi, and air conditioning. Located in Gulshan, Dhaka.', 'apartment', 'standard', 'House 10, Road 11, Gulshan 1', 'Dhaka', 'Dhaka Division', 'Bangladesh', '', 23.80203126, 90.40891724, 1, 1, 2, 800, NULL, 4000.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 0, '15:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-05-22 15:03:39', '2026-05-23 04:41:46', NULL, 0, 'test-cozy-apartment-in-gulshan-81');

-- --------------------------------------------------------

--
-- Table structure for table `property_amenities`
--

CREATE TABLE `property_amenities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `amenity_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_amenities`
--

INSERT INTO `property_amenities` (`id`, `property_id`, `amenity_id`, `created_at`) VALUES
(1039, 69, 11, '2026-03-31 08:38:12'),
(1040, 69, 8, '2026-03-31 08:38:12'),
(1041, 69, 9, '2026-03-31 08:38:12'),
(1042, 69, 1, '2026-03-31 08:38:12'),
(1043, 69, 2, '2026-03-31 08:38:12'),
(1044, 69, 10, '2026-03-31 08:38:12'),
(1104, 73, 1, '2026-03-31 12:59:30'),
(1105, 73, 2, '2026-03-31 12:59:30'),
(1106, 73, 9, '2026-03-31 12:59:30'),
(1107, 73, 4, '2026-03-31 12:59:30'),
(1108, 73, 8, '2026-03-31 12:59:30'),
(1109, 73, 11, '2026-03-31 12:59:30'),
(1110, 73, 3, '2026-03-31 12:59:30'),
(1111, 73, 10, '2026-03-31 12:59:30'),
(1135, 74, 2, '2026-04-02 11:35:52'),
(1136, 74, 1, '2026-04-02 11:35:52'),
(1137, 74, 10, '2026-04-02 11:35:52'),
(1138, 74, 9, '2026-04-02 11:35:52'),
(1139, 74, 4, '2026-04-02 11:35:52'),
(1140, 74, 8, '2026-04-02 11:35:52'),
(1168, 75, 2, '2026-04-02 11:40:07'),
(1169, 75, 1, '2026-04-02 11:40:07'),
(1170, 75, 10, '2026-04-02 11:40:07'),
(1171, 75, 9, '2026-04-02 11:40:07'),
(1172, 75, 4, '2026-04-02 11:40:07'),
(1173, 75, 8, '2026-04-02 11:40:07'),
(1200, 76, 2, '2026-04-02 11:44:01'),
(1201, 76, 1, '2026-04-02 11:44:01'),
(1202, 76, 10, '2026-04-02 11:44:01'),
(1203, 76, 9, '2026-04-02 11:44:01'),
(1204, 76, 4, '2026-04-02 11:44:01'),
(1205, 76, 8, '2026-04-02 11:44:01'),
(1264, 77, 1, '2026-04-21 05:23:35'),
(1265, 77, 2, '2026-04-21 05:23:35'),
(1266, 77, 3, '2026-04-21 05:23:35'),
(1267, 77, 4, '2026-04-21 05:23:35'),
(1268, 77, 8, '2026-04-21 05:23:35'),
(1269, 77, 9, '2026-04-21 05:23:35'),
(1270, 77, 10, '2026-04-21 05:23:35'),
(1271, 77, 11, '2026-04-21 05:23:35'),
(1272, 77, 14, '2026-04-21 05:23:35'),
(1291, 78, 4, '2026-04-21 09:06:11'),
(1292, 78, 6, '2026-04-21 09:06:11'),
(1293, 78, 9, '2026-04-21 09:06:11'),
(1303, 79, 6, '2026-04-30 06:39:13'),
(1304, 79, 9, '2026-04-30 06:39:13'),
(1305, 79, 10, '2026-04-30 06:39:13'),
(1321, 80, 2, '2026-05-17 08:30:43'),
(1322, 80, 1, '2026-05-17 08:30:43'),
(1323, 80, 10, '2026-05-17 08:30:43'),
(1324, 80, 9, '2026-05-17 08:30:43'),
(1325, 80, 11, '2026-05-17 08:30:43'),
(1326, 70, 1, '2026-05-17 19:37:55'),
(1327, 70, 2, '2026-05-17 19:37:55'),
(1328, 70, 9, '2026-05-17 19:37:55'),
(1329, 70, 11, '2026-05-17 19:37:55'),
(1428, 68, 1, '2026-05-20 14:55:40'),
(1429, 68, 2, '2026-05-20 14:55:40'),
(1430, 68, 3, '2026-05-20 14:55:40'),
(1431, 68, 8, '2026-05-20 14:55:40'),
(1432, 68, 9, '2026-05-20 14:55:40'),
(1433, 68, 10, '2026-05-20 14:55:40'),
(1434, 68, 11, '2026-05-20 14:55:40'),
(1475, 81, 1, '2026-05-22 15:19:25'),
(1476, 81, 2, '2026-05-22 15:19:25'),
(1477, 81, 4, '2026-05-22 15:19:25'),
(1478, 81, 8, '2026-05-22 15:19:25'),
(1479, 81, 9, '2026-05-22 15:19:25'),
(1480, 81, 10, '2026-05-22 15:19:25');

-- --------------------------------------------------------

--
-- Table structure for table `property_availability`
--

CREATE TABLE `property_availability` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `price` decimal(10,2) DEFAULT NULL,
  `minimum_stay` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_availability`
--

INSERT INTO `property_availability` (`id`, `property_id`, `date`, `is_available`, `price`, `minimum_stay`, `created_at`, `updated_at`) VALUES
(4, 73, '2026-05-17', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(5, 73, '2026-05-28', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(6, 73, '2026-05-27', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(7, 73, '2026-05-26', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(8, 73, '2026-05-25', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(9, 73, '2026-05-24', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(10, 73, '2026-05-23', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(11, 73, '2026-05-22', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(12, 73, '2026-05-21', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(13, 73, '2026-05-20', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(14, 73, '2026-05-19', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(15, 73, '2026-05-18', 0, NULL, 1, '2026-05-17 10:30:50', '2026-05-17 10:30:50'),
(16, 77, '2026-05-28', 1, 12.00, 1, '2026-05-23 07:58:53', '2026-05-23 07:58:53'),
(17, 73, '2026-05-29', 1, 4000.00, 1, '2026-05-23 07:59:07', '2026-05-23 07:59:07'),
(18, 73, '2026-05-30', 1, 4000.00, 1, '2026-05-23 07:59:07', '2026-05-23 07:59:07'),
(19, 73, '2026-05-31', 1, 4000.00, 1, '2026-05-23 07:59:07', '2026-05-23 07:59:07'),
(20, 77, '2026-05-30', 1, 12.00, 1, '2026-05-23 08:08:34', '2026-05-23 08:08:34');

-- --------------------------------------------------------

--
-- Table structure for table `property_images`
--

CREATE TABLE `property_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `image_url` longtext DEFAULT NULL,
  `image_type` enum('main','gallery','amenity') DEFAULT 'gallery',
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_images`
--

INSERT INTO `property_images` (`id`, `property_id`, `image_url`, `image_type`, `alt_text`, `sort_order`, `is_active`, `created_at`) VALUES
(737, 69, '/uploads/properties/prop-1774946292286-329981000.webp', 'main', 'Property image 1', 0, 1, '2026-03-31 08:38:12'),
(738, 69, '/uploads/properties/prop-1774946292296-513356222.webp', 'gallery', 'Property image 2', 1, 1, '2026-03-31 08:38:12'),
(739, 69, '/uploads/properties/prop-1774946292297-755190144.webp', 'gallery', 'Property image 3', 2, 1, '2026-03-31 08:38:12'),
(747, 73, '/uploads/properties/prop-1774961970877-292340096.webp', 'main', 'Property image 1', 0, 1, '2026-03-31 12:59:31'),
(748, 73, '/uploads/properties/prop-1774961970879-825725521.webp', 'gallery', 'Property image 2', 1, 1, '2026-03-31 12:59:31'),
(749, 73, '/uploads/properties/prop-1774961970880-458197227.webp', 'gallery', 'Property image 3', 2, 1, '2026-03-31 12:59:31'),
(750, 73, '/uploads/properties/prop-1774961970881-187079375.webp', 'gallery', 'Property image 4', 3, 1, '2026-03-31 12:59:31'),
(751, 74, '/uploads/properties/prop-1775129752137-995076481.webp', 'main', 'Property image 1', 0, 1, '2026-04-02 11:35:52'),
(752, 74, '/uploads/properties/prop-1775129752139-810466581.webp', 'gallery', 'Property image 2', 1, 1, '2026-04-02 11:35:52'),
(753, 74, '/uploads/properties/prop-1775129752140-509571874.webp', 'gallery', 'Property image 3', 2, 1, '2026-04-02 11:35:52'),
(754, 74, '/uploads/properties/prop-1775129752140-568751915.webp', 'gallery', 'Property image 4', 3, 1, '2026-04-02 11:35:52'),
(755, 74, '/uploads/properties/prop-1775129752140-521493624.webp', 'gallery', 'Property image 5', 4, 1, '2026-04-02 11:35:52'),
(756, 74, '/uploads/properties/prop-1775129752141-656232679.webp', 'gallery', 'Property image 6', 5, 1, '2026-04-02 11:35:52'),
(757, 74, '/uploads/properties/prop-1775129752141-113888293.webp', 'gallery', 'Property image 7', 6, 1, '2026-04-02 11:35:52'),
(758, 74, '/uploads/properties/prop-1775129752141-156261870.webp', 'gallery', 'Property image 8', 7, 1, '2026-04-02 11:35:52'),
(759, 74, '/uploads/properties/prop-1775129752142-801886436.webp', 'gallery', 'Property image 9', 8, 1, '2026-04-02 11:35:52'),
(760, 74, '/uploads/properties/prop-1775129752142-889365319.webp', 'gallery', 'Property image 10', 9, 1, '2026-04-02 11:35:52'),
(761, 75, '/uploads/properties/prop-1775130007121-516461929.webp', 'main', 'Property image 1', 0, 1, '2026-04-02 11:40:07'),
(762, 75, '/uploads/properties/prop-1775130007122-920270270.webp', 'gallery', 'Property image 2', 1, 1, '2026-04-02 11:40:07'),
(763, 75, '/uploads/properties/prop-1775130007122-133263863.webp', 'gallery', 'Property image 3', 2, 1, '2026-04-02 11:40:07'),
(764, 75, '/uploads/properties/prop-1775130007122-631876398.webp', 'gallery', 'Property image 4', 3, 1, '2026-04-02 11:40:07'),
(765, 75, '/uploads/properties/prop-1775130007123-990427553.webp', 'gallery', 'Property image 5', 4, 1, '2026-04-02 11:40:07'),
(766, 75, '/uploads/properties/prop-1775130007123-212514927.webp', 'gallery', 'Property image 6', 5, 1, '2026-04-02 11:40:07'),
(767, 75, '/uploads/properties/prop-1775130007124-945231346.webp', 'gallery', 'Property image 7', 6, 1, '2026-04-02 11:40:07'),
(768, 75, '/uploads/properties/prop-1775130007124-441008534.webp', 'gallery', 'Property image 8', 7, 1, '2026-04-02 11:40:07'),
(769, 75, '/uploads/properties/prop-1775130007124-322175959.webp', 'gallery', 'Property image 9', 8, 1, '2026-04-02 11:40:07'),
(770, 75, '/uploads/properties/prop-1775130007125-445363678.webp', 'gallery', 'Property image 10', 9, 1, '2026-04-02 11:40:07'),
(771, 76, '/uploads/properties/prop-1775130241184-422879374.webp', 'main', 'Property image 1', 0, 1, '2026-04-02 11:44:01'),
(772, 76, '/uploads/properties/prop-1775130241184-577560491.webp', 'gallery', 'Property image 2', 1, 1, '2026-04-02 11:44:01'),
(773, 76, '/uploads/properties/prop-1775130241185-331151446.webp', 'gallery', 'Property image 3', 2, 1, '2026-04-02 11:44:01'),
(774, 76, '/uploads/properties/prop-1775130241185-60290788.webp', 'gallery', 'Property image 4', 3, 1, '2026-04-02 11:44:01'),
(775, 76, '/uploads/properties/prop-1775130241185-200910021.webp', 'gallery', 'Property image 5', 4, 1, '2026-04-02 11:44:01'),
(776, 76, '/uploads/properties/prop-1775130241186-614985422.webp', 'gallery', 'Property image 6', 5, 1, '2026-04-02 11:44:01'),
(777, 76, '/uploads/properties/prop-1775130241186-453517777.webp', 'gallery', 'Property image 7', 6, 1, '2026-04-02 11:44:01'),
(800, 77, '/uploads/properties/prop-1776748949018-849122918.webp', 'main', 'Property image 1', 0, 1, '2026-04-21 05:23:35'),
(801, 77, '/uploads/properties/prop-1776748949077-673326158.webp', 'gallery', 'Property image 2', 1, 1, '2026-04-21 05:23:35'),
(802, 77, '/uploads/properties/prop-1776748949078-997939413.webp', 'gallery', 'Property image 3', 2, 1, '2026-04-21 05:23:35'),
(803, 77, '/uploads/properties/prop-1776748949078-946238831.webp', 'gallery', 'Property image 4', 3, 1, '2026-04-21 05:23:35'),
(804, 77, '/uploads/properties/prop-1776748949079-362828889.webp', 'gallery', 'Property image 5', 4, 1, '2026-04-21 05:23:35'),
(805, 77, '/uploads/properties/prop-1776748949080-570666938.webp', 'gallery', 'Property image 6', 5, 1, '2026-04-21 05:23:35'),
(806, 77, '/uploads/properties/prop-1776748949080-460153548.webp', 'gallery', 'Property image 7', 6, 1, '2026-04-21 05:23:35'),
(837, 78, '/uploads/properties/prop-1776761627682-546004899.webp', 'main', 'Property image 1', 0, 1, '2026-04-21 09:06:11'),
(838, 78, '/uploads/properties/prop-1776761627684-157140098.webp', 'gallery', 'Property image 2', 1, 1, '2026-04-21 09:06:11'),
(839, 78, '/uploads/properties/prop-1776761627684-330473896.webp', 'gallery', 'Property image 3', 2, 1, '2026-04-21 09:06:11'),
(840, 78, '/uploads/properties/prop-1776761627685-315807482.webp', 'gallery', 'Property image 4', 3, 1, '2026-04-21 09:06:11'),
(841, 78, '/uploads/properties/prop-1776761627686-343372384.webp', 'gallery', 'Property image 5', 4, 1, '2026-04-21 09:06:11'),
(842, 78, '/uploads/properties/prop-1776761627687-762773367.webp', 'gallery', 'Property image 6', 5, 1, '2026-04-21 09:06:11'),
(846, 79, '/uploads/properties/prop-1777531121613-56857916.webp', 'main', 'Property image 1', 0, 1, '2026-04-30 06:39:13'),
(847, 79, '/uploads/properties/prop-1777531121634-899963821.webp', 'gallery', 'Property image 2', 1, 1, '2026-04-30 06:39:13'),
(848, 80, '/uploads/properties/prop-1779006643838-420176868.webp', 'main', 'Property image 1', 0, 1, '2026-05-17 08:30:44'),
(849, 80, '/uploads/properties/prop-1779006643840-102084149.webp', 'gallery', 'Property image 2', 1, 1, '2026-05-17 08:30:44'),
(850, 70, '/uploads/properties/prop-1774946904596-554519145.webp', 'main', 'Property image 1', 0, 1, '2026-05-17 19:37:55'),
(851, 70, '/uploads/properties/prop-1774946904598-906486603.webp', 'gallery', 'Property image 2', 1, 1, '2026-05-17 19:37:55'),
(852, 81, '/uploads/properties/prop-1779463165921-364360388.webp', 'main', 'Property image 1', 0, 1, '2026-05-22 15:19:26'),
(853, 81, '/uploads/properties/prop-1779463165923-724249010.webp', 'gallery', 'Property image 2', 1, 1, '2026-05-22 15:19:26');

-- --------------------------------------------------------

--
-- Table structure for table `property_owners`
--

CREATE TABLE `property_owners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `business_license` varchar(100) DEFAULT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_routing_number` varchar(20) DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT 10.00,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_documents`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_owners`
--

INSERT INTO `property_owners` (`id`, `user_id`, `business_name`, `business_license`, `tax_id`, `bank_account_number`, `bank_name`, `bank_routing_number`, `commission_rate`, `is_verified`, `verification_documents`, `created_at`, `updated_at`) VALUES
(17, 21, 'Flat Owner - Keyhost', '123456', '321654', '987563214587', 'Brac Bank', '321465719', 10.00, 0, NULL, '2025-10-19 09:37:39', '2026-03-29 10:14:59'),
(18, 1, 'admin Business', NULL, NULL, NULL, NULL, NULL, 10.00, 1, NULL, '2025-10-28 09:48:28', '2025-10-28 09:48:28'),
(26, 49, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-03-30 15:06:57', '2026-03-30 15:06:57'),
(27, 52, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-03-31 04:45:06', '2026-03-31 04:45:06'),
(28, 53, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-04-02 11:30:49', '2026-04-02 11:30:49'),
(29, 59, 'Hotel Jannat', '123456', '3254345', '234324', 'sadsa', '234323', 10.00, 0, NULL, '2026-04-19 09:45:52', '2026-05-23 05:30:29'),
(30, 64, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-05-02 05:12:31', '2026-05-02 05:12:31'),
(31, 74, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-05-22 15:01:56', '2026-05-22 15:01:56');

-- --------------------------------------------------------

--
-- Table structure for table `property_owner_blocks`
--

CREATE TABLE `property_owner_blocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_owner_id` bigint(20) UNSIGNED NOT NULL,
  `blocked_by` bigint(20) UNSIGNED NOT NULL,
  `block_type` enum('listing','booking','payment','all') NOT NULL,
  `reason` text NOT NULL,
  `description` text DEFAULT NULL,
  `affected_properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`affected_properties`)),
  `status` enum('active','expired','revoked') DEFAULT 'active',
  `blocked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_owner_payouts`
--

CREATE TABLE `property_owner_payouts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_owner_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL DEFAULT 'bank_transfer',
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','paid','rejected') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_policies`
--

CREATE TABLE `property_policies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `cancellation_policy_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_reports`
--

CREATE TABLE `property_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `detail` varchar(255) DEFAULT NULL,
  `status` enum('pending','investigating','resolved','dismissed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_rules`
--

CREATE TABLE `property_rules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `rule_type` enum('check_in','check_out','smoking','pets','parties','quiet_hours','other') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `is_mandatory` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_types`
--

CREATE TABLE `property_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `icon_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `property_types`
--

INSERT INTO `property_types` (`id`, `name`, `description`, `sort_order`, `is_active`, `created_at`, `updated_at`, `icon_url`) VALUES
(1, 'Room', 'Single room accommodation', 1, 1, '2025-12-11 06:15:03', '2026-04-15 07:58:10', '/images/nav-icon-room.png'),
(2, 'Apartment', 'Self-contained apartment unit', 2, 1, '2025-12-11 06:15:03', '2026-04-15 07:58:01', '/images/nav-icon-apartment.png'),
(3, 'Hotels', 'Luxury standalone Hotels', 3, 1, '2025-12-11 06:15:03', '2026-04-15 07:57:50', '/images/nav-icon-hotel.png'),
(6, 'Flight', 'Booked All Airlines Flight Ticket', 99, 0, '2026-03-09 05:04:42', '2026-04-15 07:55:46', '/images/flight.png');

-- --------------------------------------------------------

--
-- Table structure for table `refunds`
--

CREATE TABLE `refunds` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `refund_reference` varchar(50) NOT NULL,
  `original_amount` decimal(10,2) NOT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `service_charge` decimal(10,2) DEFAULT 0.00,
  `cancellation_fee` decimal(10,2) DEFAULT 0.00,
  `processing_fee` decimal(10,2) DEFAULT 0.00,
  `net_refund` decimal(10,2) NOT NULL,
  `refund_reason` text NOT NULL,
  `refund_type` enum('full','partial','penalty','no_show') NOT NULL,
  `cancellation_policy_applied` varchar(100) DEFAULT NULL,
  `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  `processed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `gateway_refund_id` varchar(100) DEFAULT NULL,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refunds`
--

INSERT INTO `refunds` (`id`, `booking_id`, `payment_id`, `refund_reference`, `original_amount`, `refund_amount`, `service_charge`, `cancellation_fee`, `processing_fee`, `net_refund`, `refund_reason`, `refund_type`, `cancellation_policy_applied`, `status`, `processed_by`, `processed_at`, `gateway_refund_id`, `gateway_response`, `requested_at`, `approved_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(16, 183, 249, 'REF-1779526106627-183', 20.00, 20.00, 0.00, 0.00, 0.00, 20.00, 'Cancelled more than 48 hours before check-in', 'full', 'Original Paid: ৳20. Policy Status: Eligible', 'pending', NULL, NULL, NULL, NULL, '2026-05-23 08:48:26', NULL, NULL, '2026-05-23 08:48:26', '2026-05-23 08:48:26');

-- --------------------------------------------------------

--
-- Table structure for table `refund_service_charges`
--

CREATE TABLE `refund_service_charges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `charge_name` varchar(100) NOT NULL,
  `charge_type` enum('percentage','fixed_amount') NOT NULL,
  `charge_value` decimal(10,2) NOT NULL,
  `minimum_charge` decimal(10,2) DEFAULT 0.00,
  `maximum_charge` decimal(10,2) DEFAULT NULL,
  `applies_to` enum('all','cancellation','no_show','refund') DEFAULT 'all',
  `cancellation_hours_threshold` int(11) DEFAULT NULL,
  `booking_amount_minimum` decimal(10,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `effective_from` date NOT NULL,
  `effective_until` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refund_service_charges`
--

INSERT INTO `refund_service_charges` (`id`, `charge_name`, `charge_type`, `charge_value`, `minimum_charge`, `maximum_charge`, `applies_to`, `cancellation_hours_threshold`, `booking_amount_minimum`, `is_active`, `effective_from`, `effective_until`, `created_at`, `updated_at`) VALUES
(1, 'Cancellation Service Fee', 'percentage', 5.00, 50.00, 500.00, 'cancellation', 24, 0.00, 1, '2025-10-12', NULL, '2025-10-12 14:54:16', '2025-10-12 14:54:16'),
(2, 'No Show Service Fee', 'percentage', 10.00, 100.00, 1000.00, 'no_show', 0, 0.00, 1, '2025-10-12', NULL, '2025-10-12 14:54:16', '2025-10-12 14:54:16'),
(3, 'Processing Fee', 'fixed_amount', 25.00, 25.00, 25.00, 'all', NULL, 0.00, 1, '2025-10-12', NULL, '2025-10-12 14:54:16', '2025-10-12 14:54:16'),
(4, 'Late Cancellation Fee', 'percentage', 15.00, 100.00, 1000.00, 'cancellation', 2, 0.00, 1, '2025-10-12', NULL, '2025-10-12 14:54:16', '2025-10-12 14:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `guest_id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `cleanliness_rating` int(11) DEFAULT NULL CHECK (`cleanliness_rating` >= 1 and `cleanliness_rating` <= 5),
  `communication_rating` int(11) DEFAULT NULL CHECK (`communication_rating` >= 1 and `communication_rating` <= 5),
  `check_in_rating` int(11) DEFAULT NULL CHECK (`check_in_rating` >= 1 and `check_in_rating` <= 5),
  `accuracy_rating` int(11) DEFAULT NULL CHECK (`accuracy_rating` >= 1 and `accuracy_rating` <= 5),
  `location_rating` int(11) DEFAULT NULL CHECK (`location_rating` >= 1 and `location_rating` <= 5),
  `value_rating` int(11) DEFAULT NULL CHECK (`value_rating` >= 1 and `value_rating` <= 5),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `is_public` tinyint(1) DEFAULT 1,
  `host_response` text DEFAULT NULL,
  `host_response_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rewards_point_settings`
--

CREATE TABLE `rewards_point_settings` (
  `id` int(11) NOT NULL,
  `points_per_taka` decimal(10,2) NOT NULL DEFAULT 1.00 COMMENT 'How many points = 1 taka',
  `min_points_to_redeem` int(11) DEFAULT 100 COMMENT 'Minimum points required to redeem',
  `max_points_per_booking` int(11) DEFAULT NULL COMMENT 'Maximum points that can be used per booking (NULL = unlimited)',
  `points_expiry_days` int(11) DEFAULT NULL COMMENT 'Points expiry in days (NULL = no expiry)',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rewards_point_settings`
--

INSERT INTO `rewards_point_settings` (`id`, `points_per_taka`, `min_points_to_redeem`, `max_points_per_booking`, `points_expiry_days`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1.00, 100, NULL, NULL, 1, '2025-12-09 09:25:59', '2025-12-09 09:25:59');

-- --------------------------------------------------------

--
-- Table structure for table `rewards_point_slots`
--

CREATE TABLE `rewards_point_slots` (
  `id` int(11) NOT NULL,
  `min_amount` decimal(10,2) NOT NULL,
  `max_amount` decimal(10,2) NOT NULL,
  `points_per_thousand` decimal(10,2) NOT NULL COMMENT 'Points earned per 1000 taka spent',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rewards_point_slots`
--

INSERT INTO `rewards_point_slots` (`id`, `min_amount`, `max_amount`, `points_per_thousand`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 0.00, 1000.00, 5.00, 1, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(2, 1000.00, 5000.00, 10.00, 1, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(3, 5000.00, 10000.00, 15.00, 1, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(4, 10000.00, 50000.00, 20.00, 1, '2025-12-09 09:25:59', '2025-12-09 09:25:59'),
(5, 50000.00, 99999999.99, 25.00, 1, '2025-12-09 09:25:59', '2025-12-09 09:25:59');

-- --------------------------------------------------------

--
-- Table structure for table `rewards_point_transactions`
--

CREATE TABLE `rewards_point_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `transaction_type` enum('earned','redeemed','expired','adjusted') NOT NULL,
  `points` int(11) NOT NULL COMMENT 'Positive for earned, negative for redeemed/expired',
  `balance_after` int(11) NOT NULL COMMENT 'Balance after this transaction',
  `booking_id` int(10) UNSIGNED DEFAULT NULL COMMENT 'Related booking if applicable',
  `description` text DEFAULT NULL,
  `expiry_date` date DEFAULT NULL COMMENT 'When these points expire (if applicable)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'platform_name', 'Keyhost Homes', 'string', 'Website name displayed in header and title', 1, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(2, 'default_currency', 'BDT', 'string', 'Default currency', 1, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(3, 'commission_rate', '10', 'number', 'Default commission rate for property owners', 0, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(4, 'max_guests_per_property', '20', 'number', 'Maximum guests allowed per property', 0, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(5, 'booking_advance_days', '365', 'number', 'Maximum days in advance for booking', 1, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(6, 'cancellation_hours', '24', 'number', 'Hours before check-in for free cancellation', 1, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(7, 'support_email', 'info@keyhost24.com', 'string', 'Support email address', 1, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(8, 'support_phone', '+8801730353300', 'string', 'Support phone number', 1, '2025-10-12 14:54:15', '2026-05-23 06:34:41'),
(12, 'timezone', 'Asia/Dhaka', 'string', 'Default timezone for the platform', 1, '2025-10-20 07:48:11', '2026-05-23 06:34:41'),
(13, 'maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode', 1, '2025-10-20 07:48:11', '2026-05-23 06:34:41'),
(14, 'registration_enabled', 'false', 'boolean', 'Allow new user registration', 1, '2025-10-20 07:48:11', '2026-05-23 06:34:41'),
(15, 'email_verification_required', 'true', 'boolean', 'Require email verification for new accounts', 1, '2025-10-20 07:48:11', '2026-05-23 06:34:41'),
(16, 'phone_verification_required', 'false', 'boolean', 'Require phone verification for new accounts', 1, '2025-10-20 07:48:11', '2026-05-23 06:34:41'),
(35, 'site_logo', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAEYCAMAAACJAdUUAAADAFBMVEW7iTqmcS767pruymu1cjLClETOxnv66YXChj7623L53nj67Yn64X2teTJ6aTiaYyfFjEHMok/78IzOpFH79qrc1IXhtVxsRB364YHJkUX65YhhYWGGWCW/gju+kEN+dUWlWyYEBwf65oExMjLhtJDowWWOe0Ltw10REhLcp3rSqVRXORn41Wq5eTaqYim7pVr89JLLm0T05dgyKxjTpUqpiER6VCP78qK8fTiadjj66pHRnk5RUlJxcXGfaCnq1Xfy0XCxfjW9jT29q2K1hDosJhWXVyW9tXjqxWipdTAhIiGel1vfs1u0gTacZiiibSyemmjhvWJOQyRrVCn633pkSiP68J7YqVRfVzL01XNMNBbzymD66Y4/Nx740mbr3ILLuWiway7WpVLHm0ns5IjesVEiHA/NmEq9u4OvaS21mlH32XY4MRz65IaJXyqnXSidiUnmvmPovVi9sm7jtlVWRyXwzW7786Xr4ZOtpWPYqk7kumEcFAlfWzfMlUigaiqybjD665TlwmXXu2RtZTn65H7DkT6GajPVrVf79KaVbjPbrFd4Sh9BKxNBPSSsnFfdr1ldQB3euF6lg0FkPhqOilrmuVbZslqFTiKMczuQZS367JfKn024hjeibCusZStvbEbFl0SukEr654ygfTyjbiz62G5/e1PJnUvSn0+3djTSsl6Sai7Pm0ytZyxyXTDTolA0JBH644SiczFeUSuNgkrVqEzcrlCmeDWofTquqXIPDQiqYyqiYCmSYCa0fDqpay++mEvMv3FQTjL11nO4iD2+oFHgy3GdkFHbxm7KsF3Zs14tHxBhX0GgaTCZgEJTMBZAQEB/f3+Bg4Pv7+/AwcG/v79DRUXPz8+fn5/RjFPf39+vr6+hoqKPj4/785DQ0NDQp1Lg4OCwsbGRkpLbtVyoYCnnxKfw0G/8+PTUk17u1L73z2TnvmPXmmn58eny03Hx28nrzLOkbivbrVfXp1Titl7PoEfbtFvctVtCQS3qyWrs5p6ccDIAAAD////qM4JpAAABAHRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AU/cHJQAAAAlwSFlzAABcRgAAXEYBFJRDQQAABfppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNi0wNS0xN1QxNDowODoyNyswNjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjYtMDUtMTdUMTQ6MDk6MzQrMDY6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjYtMDUtMTdUMTQ6MDk6MzQrMDY6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIyIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N2E5MmViNDUtNTEyZi1lNDQ2LWJkMDQtMTA3NjdjMzRkMGZlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZGI5N2IyZmQtMmVhNi1iMjQ1LTlmYTYtOGFmYzA1NjU0NGZmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MTE3OTdkZDAtMzBhNC03NzQwLTg4NDktY2U5OGJmMThlMWE0Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxMTc5N2RkMC0zMGE0LTc3NDAtODg0OS1jZTk4YmYxOGUxYTQiIHN0RXZ0OndoZW49IjIwMjYtMDUtMTdUMTQ6MDg6MjcrMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6N2E5MmViNDUtNTEyZi1lNDQ2LWJkMDQtMTA3NjdjMzRkMGZlIiBzdEV2dDp3aGVuPSIyMDI2LTA1LTE3VDE0OjA5OjM0KzA2OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+HsQ14QAAMnhJREFUeNrtnQt8VNW970UQkbcPLo8B43LUbkxVSiqiTqAIKAxClQhihGJbHFERsRSVGkVb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', 'string', '', 1, '2025-10-22 05:05:19', '2026-05-23 06:34:41'),
(51, 'site_name', 'KeyHost 24', 'string', '', 1, '2025-10-22 05:07:24', '2026-05-23 06:34:41'),
(52, 'contact_email', 'info@keyhost24.com', 'string', '', 1, '2025-10-22 05:07:24', '2026-05-23 06:34:41'),
(144, 'site_favicon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArwAAAEYCAMAAACJAdUUAAADAFBMVEW7iTqmcS767pruymu1cjLClETOxnv66YXChj7623L53nj67Yn64X2teTJ6aTiaYyfFjEHMok/78IzOpFH79qrc1IXhtVxsRB364YHJkUX65YhhYWGGWCW/gju+kEN+dUWlWyYEBwf65oExMjLhtJDowWWOe0Ltw10REhLcp3rSqVRXORn41Wq5eTaqYim7pVr89JLLm0T05dgyKxjTpUqpiER6VCP78qK8fTiadjj66pHRnk5RUlJxcXGfaCnq1Xfy0XCxfjW9jT29q2K1hDosJhWXVyW9tXjqxWipdTAhIiGel1vfs1u0gTacZiiibSyemmjhvWJOQyRrVCn633pkSiP68J7YqVRfVzL01XNMNBbzymD66Y4/Nx740mbr3ILLuWiway7WpVLHm0ns5IjesVEiHA/NmEq9u4OvaS21mlH32XY4MRz65IaJXyqnXSidiUnmvmPovVi9sm7jtlVWRyXwzW7786Xr4ZOtpWPYqk7kumEcFAlfWzfMlUigaiqybjD665TlwmXXu2RtZTn65H7DkT6GajPVrVf79KaVbjPbrFd4Sh9BKxNBPSSsnFfdr1ldQB3euF6lg0FkPhqOilrmuVbZslqFTiKMczuQZS367JfKn024hjeibCusZStvbEbFl0SukEr654ygfTyjbiz62G5/e1PJnUvSn0+3djTSsl6Sai7Pm0ytZyxyXTDTolA0JBH644SiczFeUSuNgkrVqEzcrlCmeDWofTquqXIPDQiqYyqiYCmSYCa0fDqpay++mEvMv3FQTjL11nO4iD2+oFHgy3GdkFHbxm7KsF3Zs14tHxBhX0GgaTCZgEJTMBZAQEB/f3+Bg4Pv7+/AwcG/v79DRUXPz8+fn5/RjFPf39+vr6+hoqKPj4/785DQ0NDQp1Lg4OCwsbGRkpLbtVyoYCnnxKfw0G/8+PTUk17u1L73z2TnvmPXmmn58eny03Hx28nrzLOkbivbrVfXp1Titl7PoEfbtFvctVtCQS3qyWrs5p6ccDIAAAD////qM4JpAAABAHRSTlP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AU/cHJQAAAAlwSFlzAABcRgAAXEYBFJRDQQAABfppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNi0wNS0xN1QxNDowODoyNyswNjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjYtMDUtMTdUMTQ6MDk6MzQrMDY6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjYtMDUtMTdUMTQ6MDk6MzQrMDY6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIyIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N2E5MmViNDUtNTEyZi1lNDQ2LWJkMDQtMTA3NjdjMzRkMGZlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZGI5N2IyZmQtMmVhNi1iMjQ1LTlmYTYtOGFmYzA1NjU0NGZmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MTE3OTdkZDAtMzBhNC03NzQwLTg4NDktY2U5OGJmMThlMWE0Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxMTc5N2RkMC0zMGE0LTc3NDAtODg0OS1jZTk4YmYxOGUxYTQiIHN0RXZ0OndoZW49IjIwMjYtMDUtMTdUMTQ6MDg6MjcrMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6N2E5MmViNDUtNTEyZi1lNDQ2LWJkMDQtMTA3NjdjMzRkMGZlIiBzdEV2dDp3aGVuPSIyMDI2LTA1LTE3VDE0OjA5OjM0KzA2OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+HsQ14QAAMnhJREFUeNrtnQt8VNW970UQkbcPLo8B43LUbkxVSiqiTqAIKAxClQhihGJbHFERsRSVGkVb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', 'string', 'Setting for site_favicon', 1, '2025-10-22 05:17:44', '2026-05-23 06:34:41'),
(411, 'admin_commission_rate', '10', 'number', 'Default admin commission rate percentage', 0, '2025-10-28 06:09:49', '2026-05-23 06:34:41'),
(412, 'admin_tax_rate', '0', 'number', 'Tax rate on admin commission', 0, '2025-10-28 06:09:49', '2026-05-23 06:34:41'),
(413, 'commission_calculation_method', 'percentage', 'string', 'Commission calculation method (percentage or fixed)', 0, '2025-10-28 06:09:49', '2026-05-23 06:34:41'),
(414, 'minimum_payout_amount', '100', 'number', 'Minimum amount required for payout', 0, '2025-10-28 06:09:49', '2026-05-23 06:34:41'),
(415, 'payout_frequency', 'monthly', 'string', 'Payout frequency (weekly, monthly, quarterly)', 0, '2025-10-28 06:09:49', '2026-05-23 06:34:41'),
(438, 'bkash_enabled', 'true', 'boolean', 'Enable bKash payment gateway', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(439, 'bkash_merchant_id', 'DEMO_MERCHANT_001', 'string', 'bKash merchant ID', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(440, 'bkash_merchant_key', 'DEMO_MERCHANT_KEY_123', 'string', 'bKash merchant key', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(441, 'bkash_merchant_secret', 'DEMO_MERCHANT_SECRET_456', 'string', 'bKash merchant secret', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(442, 'bkash_api_url', 'https://tokenized.pay.bka.sh/v1.2.0-beta', 'string', 'bKash API base URL', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(443, 'bkash_callback_url', 'http://localhost:3000/payment/callback', 'string', 'bKash payment callback URL', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(444, 'bkash_currency', 'BDT', 'string', 'bKash payment currency', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(445, 'bkash_intent', 'sale', 'string', 'bKash payment intent', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(446, 'bkash_mode', 'sandbox', 'string', 'bKash payment mode (sandbox/live)', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(447, 'bkash_success_url', 'http://localhost:3000/payment/success', 'string', 'bKash payment success redirect URL', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(448, 'bkash_fail_url', 'http://localhost:3000/payment/fail', 'string', 'bKash payment failure redirect URL', 0, '2025-10-29 08:56:13', '2026-05-23 06:34:41'),
(482, 'enable_bkash', 'false', 'boolean', 'Setting for enable_bkash', 0, '2025-10-29 09:00:26', '2026-05-23 06:34:41'),
(483, 'enable_nagad', 'false', 'boolean', 'Setting for enable_nagad', 0, '2025-10-29 09:00:26', '2026-05-23 06:34:41'),
(519, 'sms_sender_id', '01844015754', 'string', 'Setting for sms_sender_id', 0, '2025-11-11 07:06:03', '2026-05-23 06:34:41'),
(520, 'sms_api_key', 'b4a37e3c2c368a44', 'string', 'Setting for sms_api_key', 0, '2025-11-11 07:06:03', '2026-05-23 06:34:41'),
(521, 'sms_secret_key', '7e0ba143', 'string', 'Setting for sms_secret_key', 0, '2025-11-11 07:06:03', '2026-05-23 06:34:41'),
(560, 'payment_time_limit_minutes', '2', 'number', 'Setting for payment_time_limit_minutes', 0, '2025-11-12 05:35:35', '2026-05-23 06:34:41'),
(912, 'sms_enabled', 'true', 'boolean', 'Setting for sms_enabled', 0, '2025-12-10 04:53:32', '2026-05-23 06:34:41'),
(993, 'primary_color', '#E41D57', 'string', 'Setting for primary_color', 0, '2025-12-21 08:50:15', '2026-05-23 06:34:41'),
(1035, 'secondary_color', '#E41D57', 'string', 'Setting for secondary_color', 0, '2025-12-21 08:50:39', '2026-05-23 06:34:41'),
(1458, 'site_description', 'Find Your Comfort', 'string', 'Setting for site_description', 1, '2026-02-23 07:13:57', '2026-05-23 06:34:41'),
(1502, 'enable_sslcommerz', 'true', 'boolean', 'Setting for enable_sslcommerz', 0, '2026-02-25 15:16:59', '2026-05-23 06:34:41'),
(1547, 'sslcommerz_store_id', 'keyhost0live', 'string', 'Setting for sslcommerz_store_id', 0, '2026-02-25 15:17:40', '2026-05-23 06:34:41'),
(1548, 'sslcommerz_store_password', '69B795058626C68204', 'string', 'Setting for sslcommerz_store_password', 0, '2026-02-25 15:17:40', '2026-05-23 06:34:41'),
(1549, 'google_client_id', '82849880523-pdlo06m2e6n46eunf951sfv4cgt4a8kb.apps.googleusercontent.com', 'string', 'Google Client ID', 1, '2026-02-26 02:51:19', '2026-05-23 06:34:41'),
(1550, 'google_client_secret', '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', 'string', 'Google Client Secret', 0, '2026-02-26 02:51:19', '2026-05-23 06:34:41'),
(1551, 'smtp_host', 'smtp.gmail.com', 'string', 'SMTP Server', 0, '2026-02-26 05:07:23', '2026-05-23 06:34:41'),
(1552, 'smtp_port', '465', 'string', 'SMTP Port', 0, '2026-02-26 05:07:24', '2026-05-23 06:34:41'),
(1553, 'smtp_encryption', 'ssl', 'string', 'SMTP Encryption', 0, '2026-02-26 05:07:24', '2026-05-23 06:34:41'),
(1554, 'smtp_username', 'arbhuiyan.pits@gmail.com', 'string', 'SMTP Username', 0, '2026-02-26 05:07:24', '2026-05-23 06:34:41'),
(1555, 'smtp_password', 'zgnd avpj klry ygpt', 'string', 'SMTP Password', 0, '2026-02-26 05:07:24', '2026-05-23 06:34:41'),
(1556, 'mail_from_address', 'arbhuiyan.pits@gmail.com', 'string', 'Mail From Address', 0, '2026-02-26 05:07:24', '2026-05-23 06:34:41'),
(1557, 'mail_from_name', 'Keyhost Homes', 'string', 'Mail From Name', 0, '2026-02-26 05:07:24', '2026-05-23 06:34:41'),
(1613, 'sslcommerz_is_live', 'true', 'boolean', 'Setting for sslcommerz_is_live', 0, '2026-03-03 04:54:56', '2026-05-23 06:34:41'),
(1614, 'google_maps_api_key', 'AIzaSyBaZ6hlAV5zVfCzQZqY4KGrQqqv8zjrbu0', 'string', 'Setting for google_maps_api_key', 1, '2026-03-03 04:54:56', '2026-05-23 06:34:41'),
(1843, 'contact_phone', '+8801730353300', 'string', 'Setting for contact_phone', 1, '2026-03-14 05:21:48', '2026-05-23 06:34:41'),
(1902, 'site_address', 'Rupayan Centre(8th Floor), 72\nMohakhali C/A, Dhaka-1212, Bangladesh', 'string', 'Setting for site_address', 1, '2026-03-16 10:17:50', '2026-05-23 06:34:41');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
(2080, 'terms_of_service', 'KeyHost24 — Terms & Conditions  \n\nWelcome to KeyHost24. By accessing our website and booking our services, you agree to comply with and be bound by the following Terms & Conditions.\n\n---\n\n### 1. About Us\nKeyHost24 provides short-term rental and accommodation management services for guests seeking comfortable and reliable stays.\n\n---\n\n### 2. Booking & Payments\n- All bookings must be confirmed with advance or full payment.  \n- Prices are subject to availability, seasonal demand, and promotional offers.  \n- Payments can be made via approved methods including cards, mobile financial services, and online payment gateways.  \n\n---\n\n### 3. Check-in & Check-out\n- Standard Check-in Time: [Insert Time]  \n- Standard Check-out Time: [Insert Time]  \n- Early check-in or late check-out is subject to availability and may incur additional charges.  \n\n---\n\n### 4. Guest Responsibilities\nGuests agree to:\n- Provide valid identification at check-in  \n- Maintain the property in good condition  \n- Follow all house rules and regulations  \n- Avoid illegal, unsafe, or disruptive behavior  \n\n---\n\n### 5. Property Use\n- The property must be used only for residential purposes  \n- Subletting or unauthorized guests are not allowed  \n- Parties or events are strictly prohibited unless approved  \n\n---\n\n### 6. Damage & Loss\n- Guests are responsible for any damage caused during their stay  \n- Costs for repair or replacement will be charged or deducted from the security deposit  \n\n---\n\n### 7. Cancellation & Refund\nAll cancellations, refunds, and rescheduling are governed by our Refund & Cancellation Policy available on the website.\n\n---\n\n### 8. Security Deposit\n- A refundable security deposit may be required  \n- The deposit will be returned after inspection at checkout  \n- Deductions may apply for damages or violations  \n\n---\n\n### 9. Limitation of Liability\nKeyHost24 shall not be held responsible for:\n- Loss or theft of personal belongings  \n- Injuries or accidents occurring during the stay  \n- Delays or disruptions caused by external factors beyond our control  \n\n---\n\n### 10. Privacy & Data Protection\nWe respect your privacy. All personal information is handled according to our Privacy Policy.\n\n---\n\n### 11. Third-Party Services\n- We may use third-party services (e.g., payment gateways) for processing transactions  \n- KeyHost24 is not responsible for failures or issues arising from third-party services  \n\n---\n\n### 12. Website Use\n- Users agree not to misuse the website or attempt unauthorized access  \n- All content on the website is the property of KeyHost24 and may not be copied or reused without permission  \n\n---\n\n### 13. Policy Updates\nKeyHost24 reserves the right to modify these Terms & Conditions at any time without prior notice. Updated versions will be posted on the website.\n\n---\n\n### 14. Governing Law\nThese Terms & Conditions are governed by the laws of Bangladesh.\n\n---\n\n### 15. Contact Information\nFor any inquiries, please contact:\n\nKeyHost24 Support Team  \nEmail: info@keyhost24.com  \nPhone/WhatsApp: [01730353300]\n\n---\n\nBy booking with KeyHost24, you confirm that you have read, understood, and agreed to these Terms & Conditions.', 'string', 'Setting for terms_of_service', 1, '2026-03-29 10:00:33', '2026-05-23 06:34:41'),
(2141, 'privacy_policy', '----', 'string', 'Setting for privacy_policy', 1, '2026-03-29 10:07:44', '2026-05-23 06:34:41'),
(2142, 'refund_policy', 'KeyHost24 — Refund, Cancellation & Rescheduling Policy  \n\nAt KeyHost24, we strive to provide a reliable and transparent booking experience. This policy outlines the conditions for cancellations, refunds, and booking modifications.\n\n---\n\n### 1. Booking Confirmation\nAll reservations are confirmed only after receiving a partial or full payment. By confirming a booking, the guest agrees to all policies stated herein.\n\n---\n\n### 2. Cancellation Policy\n\na. Standard Cancellation (Flexible Rate)  \n- Free cancellation up to 48 hours before check-in  \n- 100% refund of advance payment  \n\nb. Late Cancellation  \n- Cancellations within 48 hours of check-in are non-refundable\n\nc. No-Show  \n- Failure to check in on the scheduled date will result in full booking charge with no refund\n\n---\n\n### 3. Non-Refundable Bookings (If Applicable)\nCertain promotional or discounted bookings may be marked as Non-Refundable.  \n- No refund will be provided under any circumstances  \n- Date changes may not be permitted  \n\n---\n\n### 4. Early Check-Out\n- No refund will be issued for unused nights after check-in  \n- Full stay amount remains payable\n\n---\n\n### 5. Refund Processing Timeline\n- All approved refunds will be processed within 7–10 working days  \n- Refunds will be issued via the original mode of payment  \n- Delays caused by banks, payment gateways, or mobile financial services are beyond our control  \n\n---\n\n### 6. Rescheduling / Date Modification\n- Changes are allowed if requested at least 48 hours before check-in  \n- Subject to availability  \n- Rate differences may apply  \n\n---\n\n### 7. Security Deposit (If Applicable)\n- Refundable upon checkout after inspection  \n- Deductions may apply for:\n  - Damages  \n  - Missing items  \n  - Rule violations  \n\n---\n\n### 8. Host-Initiated Cancellation\nIn rare cases where KeyHost24 must cancel:\n- Full refund will be issued, OR  \n- Alternative accommodation of similar or higher standard will be provided  \n\n---\n\n### 9. Force Majeure / Exceptional Circumstances\nRefunds or credits may be considered in events beyond control, including:\n- Natural disasters  \n- Government restrictions  \n- Medical emergencies  \n\n(Valid documentation required)\n\n---\n\n### 10. Third-Party & Data Responsibility\n- KeyHost24 does not share customer data with unauthorized third parties  \n- Any integrated third-party service complies with applicable data protection standards  \n- KeyHost24 is not responsible for external service disruptions beyond its control  \n\n---\n\n### 11. Policy Acceptance\nDuring checkout, guests must confirm that they have read and agreed to:\n- Terms & Conditions  \n- Privacy Policy  \n- Refund & Cancellation Policy  \n\n---\n\n### 12. Contact Information\nFor any queries regarding cancellations or refunds:\n\nKeyHost24 Support Team  \nEmail: info@keyhost24.com  \nPhone/WhatsApp: [01730353300]\n\n---\n\nNote: KeyHost24 reserves the right to update this policy at any time without prior notice.', 'string', 'Setting for refund_policy', 1, '2026-03-29 10:07:44', '2026-05-23 06:34:41'),
(2701, 'pending_booking_timeout_minutes', '1', 'number', 'Setting for pending_booking_timeout_minutes', 0, '2026-05-23 04:02:20', '2026-05-23 06:34:41');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `guest_id` bigint(20) UNSIGNED NOT NULL,
  `host_id` bigint(20) UNSIGNED DEFAULT NULL,
  `property_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `category` enum('Cleaning','WiFi','Payment','Maintenance','Other') DEFAULT 'Other',
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Medium',
  `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `sender_role` enum('guest','host','admin') NOT NULL,
  `message` text NOT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` enum('admin','property_owner','guest','staff') NOT NULL DEFAULT 'guest',
  `host_id` bigint(20) UNSIGNED DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `profile_image` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  `language` varchar(10) DEFAULT 'en',
  `timezone` varchar(50) DEFAULT 'UTC',
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `bio` text DEFAULT NULL,
  `work` varchar(255) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `is_superhost` tinyint(1) DEFAULT 0,
  `languages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`languages`)),
  `google_id` varchar(255) DEFAULT NULL,
  `auto_accept_bookings` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `user_type`, `host_id`, `email_verified_at`, `phone_verified_at`, `is_active`, `profile_image`, `date_of_birth`, `gender`, `address`, `city`, `state`, `country`, `postal_code`, `two_factor_enabled`, `two_factor_secret`, `last_login_at`, `login_attempts`, `locked_until`, `language`, `timezone`, `email_notifications`, `sms_notifications`, `created_at`, `updated_at`, `bio`, `work`, `school`, `is_superhost`, `languages`, `google_id`, `auto_accept_bookings`) VALUES
(1, 'Admin', 'User', 'admin@keyhost.com', '+8801712345678', '$2a$12$bADSG1hhKuOgx6sgInD3Le7g2mW4M/AfHdxjvAnSynUKumb15auhm', 'admin', NULL, '2025-10-12 19:40:43', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-23 08:13:34', 0, NULL, 'en', 'UTC', 1, 0, '2025-10-12 19:40:43', '2026-05-23 08:13:34', NULL, NULL, NULL, 0, NULL, NULL, 0),
(2, 'Super', 'Admin', 'superadmin@keyhost.com', '+8801712345679', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'admin', NULL, '2025-10-12 19:40:43', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 5, '2026-03-31 09:10:39', 'en', 'UTC', 1, 0, '2025-10-12 19:40:43', '2026-03-31 08:40:39', NULL, NULL, NULL, 0, NULL, NULL, 0),
(20, 'Guest', 'User', 'guest@keyhost.com', '01932570096', '$2a$12$ZRtBHaDsifn2cNMw3c5QoOiNa.6000D641EY5hmQIMgqYWX.sSPQ6', 'guest', NULL, '2025-10-13 09:49:21', NULL, 1, NULL, '2025-10-01', 'male', 'dhaka', 'Dhaka', 'Dhaka', 'Bangladesh', NULL, 0, NULL, '2026-02-23 06:12:56', 0, NULL, 'en', 'UTC', 1, 0, '2025-10-13 09:49:21', '2026-02-23 06:12:56', NULL, NULL, NULL, 0, NULL, NULL, 0),
(21, 'Property Owner', 'User', 'owner@keyhost.com', '+8801932570096', '$2a$12$bADSG1hhKuOgx6sgInD3Le7g2mW4M/AfHdxjvAnSynUKumb15auhm', 'property_owner', NULL, '2025-10-19 09:37:39', NULL, 1, NULL, '1992-10-19', 'male', 'Dhaka', 'Dhaka', 'Dhaka', 'Bangladesh', NULL, 0, NULL, '2026-04-25 06:40:38', 0, NULL, 'en', 'UTC', 1, 0, '2025-10-19 09:37:39', '2026-04-25 06:40:38', NULL, NULL, NULL, 0, NULL, NULL, 1),
(29, 'Bini', 'Amin', 'amin@keyhost.com', '01911518462', '$2a$12$Kw9tKmfpUnj6gGErCoTTGO91z9Wsm5E6266FOmcvXeXDls.v1MHbC', 'guest', NULL, '2026-02-01 05:15:16', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-02-01 05:15:16', '2026-02-01 05:15:16', NULL, NULL, NULL, 0, NULL, NULL, 0),
(49, 'Reservation1', '.', 'reservation1@keyhosthomes.com', '01774849026736', '$2a$12$3UIl6VI5QZzVp17sik46UebBF4sF.Pl/7fwigO0mmlqJJSKxWsEFW', 'property_owner', NULL, '2026-03-30 05:37:06', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJDIWXfD0YyyP6vfyaUWNqiM_bVQ0mLNSlsok26i0QpLNsHaw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-23 08:44:11', 0, NULL, 'en', 'UTC', 1, 0, '2026-03-30 05:37:06', '2026-05-23 08:44:11', NULL, NULL, NULL, 0, NULL, '102708877439960281828', 1),
(50, 'Md. Imtiaz', 'Hanif', 'sakil.imtiaz@gmail.com', '01774853552504', '$2a$12$2HiAc7MQKbzOMh7u5iPmK.47Bmv1hgxgIfxVAr3QZus1TSsN9RLFe', 'guest', NULL, '2026-03-30 06:52:32', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLwI2s1aYvKtyxgQoXfLfDJu3mziLzaCoVb93R2pvYYHdYue7iHYg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-23 08:06:56', 0, NULL, 'en', 'UTC', 1, 0, '2026-03-30 06:52:32', '2026-05-23 08:06:56', NULL, NULL, NULL, 0, NULL, '103083555536008779942', 0),
(51, 'Test', 'Guest', 'rolay60533@fengnu.com', '01711111111', '$2a$12$trtLJaF2OG.t65MXgg3kweONkdNgPI0FlT0XrYAev1Ui9LRad0pHC', 'guest', NULL, '2026-03-31 01:59:14', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-03-31 01:59:14', '2026-03-31 01:59:14', NULL, NULL, NULL, 0, NULL, NULL, 0),
(52, 'Reservation2', '.', 'reservation2@keyhosthomes.com', '01774932282002', '$2a$12$CM2nDwRQbqOca/VXJWtzPuyqJNi3sMyxX2bfcgVJVJPePDqzugDHq', 'property_owner', NULL, '2026-03-31 04:44:42', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIt1mwW1W9IjXqk5co9VzuK45gIYbu40sqsEYMZ7R5AIwtI6A=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-23 08:44:42', 0, NULL, 'en', 'UTC', 1, 0, '2026-03-31 04:44:42', '2026-05-23 08:44:42', NULL, NULL, NULL, 0, NULL, '117819244221922854397', 1),
(53, 'Rony', 'Noor', 'ronynoor2015@gmail.com', '+8801715000636', '$2a$12$LfHelLqM6eY4.VM/S63IA.nT.qyhSxwQQ76mepqyHZKwV4zY96/YW', 'property_owner', NULL, '2026-04-02 11:30:49', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-04-02 11:30:49', '2026-04-06 11:09:13', NULL, NULL, NULL, 0, NULL, NULL, 1),
(54, 'Tarafder', 'Md Ruhul Amin', 'tarafderamin@gmail.com', '01775416231151', '$2a$12$KUEXysHZaDfHBP8kJEdHRex.sX3ITl30DhI00Q4UK12tREZ1Abx66', 'guest', NULL, '2026-04-05 19:10:31', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJ0osTmvVTsbbWyW5jUTGGvq3v3QrPEwmltjZRe0RIv5DacPw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-04-05 19:10:31', '2026-05-18 05:18:43', NULL, NULL, NULL, 0, NULL, '105794295834654476222', 0),
(55, 'Saif', 'Tarafder', 'saif607@gmail.com', '01775468190527', '$2a$12$PrrsYeQtz/RNf16JoeG1IuUfCVZdyz/OfGavFER1qe4VTqQ/9WEVm', 'guest', NULL, '2026-04-06 09:36:30', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK_fc2lVRfyG3mjTvdRPnWQ7ZLK9CyL7SccBDp-IkC2RDgzwFUJ6g=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-21 13:47:58', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-06 09:36:30', '2026-05-21 13:47:58', NULL, NULL, NULL, 0, NULL, '108600706256610741426', 0),
(56, 'Bini', 'Amin', 'titubiniamin@gmail.com', '01775561819073', '$2a$12$qH7zAKGbnyjZESJkgwEIU.UIi1nFNITBFdmiH6CHMr8Cu7r6wXSe2', 'guest', NULL, '2026-04-07 11:36:59', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJHMH4h_JpKNrOesJdQNo6juprbGP8N0Q7xpmuQbH39UIIIDTotLQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-19 09:38:35', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-07 11:36:59', '2026-05-19 09:38:35', NULL, NULL, NULL, 0, NULL, '111595828045881219195', 0),
(57, 'tanzim', 'islam', 'tanzimislam426@gmail.com', '01775564391768', '$2a$12$PL3W8YFv.cjleVKtdI.v8OtuXLSUJeo5i3B3mY1Imyuojpfmn7egK', 'guest', NULL, '2026-04-07 12:19:51', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIEFsA05yBuiKFP7kSEsPBz58pi9CpNMje2O_1EztHBVMIqDz0Z=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-04-08 08:09:57', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-07 12:19:51', '2026-05-18 05:19:10', NULL, NULL, NULL, 0, NULL, '115537929237544952939', 0),
(58, 'Tanbir', 'Islam', 'tanbirislam96@gmail.com', '01775564409811', '$2a$12$j7hvWoTQq/pO3ltZ202/Pub9BZixSV1JofJG3AcNGdgRdKO5UHNPW', 'guest', NULL, '2026-04-07 12:20:09', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIT_yx_63S5oZCWRD7_Igt4WvduM8276t1_nqHenKUZ900_FJnC=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-04-07 12:20:09', '2026-05-18 05:19:25', NULL, NULL, NULL, 0, NULL, '113831420183700882709', 0),
(59, 'AR', 'Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', '$2a$12$sUxztG3mD6NnVgK.N5md9ODA7DLj60thAWEDP9K64fhp0/pZD34Wu', 'property_owner', NULL, '2026-04-13 04:36:34', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocId7BcdtkzA_iHXyUgI2ZxgseX145xWVNmH8eMZdECNBZhbsQ=s96-c', NULL, NULL, '', '', '', '', '', 0, NULL, '2026-05-23 08:33:08', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-13 04:36:34', '2026-05-23 08:33:08', '', NULL, NULL, 0, NULL, '117579869875687587616', 1),
(62, 'Manager', '', 'manager@keyhost.com', '23454', '$2a$12$.izwmwynuhHJ6EhBQvdLPO0qkc9kofnRbiWQYIBq1dGG9SBErcYIa', 'staff', 59, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-02 07:13:10', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-26 05:40:27', '2026-05-02 07:13:10', NULL, NULL, NULL, 0, NULL, NULL, 0),
(64, 'Atiqur Rahman', 'Bhuiyan', 'atiqur.cumilla@gmail.com', '01777529947564', '$2a$12$9AmssTPm0WcC5T226M0EY.lbHxKcp9EUoBmI5OYIYnSpSxI/t2S3a', 'property_owner', NULL, '2026-04-30 06:19:07', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIbPRlza_XvPh4GUtTyflJoBN3CIDIccreLK1BQgU0ModIDCA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-23 08:09:32', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-30 06:19:07', '2026-05-23 08:09:32', NULL, NULL, NULL, 0, NULL, '108711246270744898816', 0),
(65, 'Mr.', 'HK-Staff', 'hkstaff@keyhost.com', '123421', '$2a$12$5B2QayPGBTQHsxYRaD4Bs.xqsLx6Mo7nrXWUIsyz.QzeSWPbrPkt.', 'staff', 59, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-03 06:45:20', '2026-05-23 06:51:09', NULL, NULL, NULL, 0, NULL, NULL, 0),
(66, 'Tasin', 'Abir', 'mdabir01870770010@gmail.com', '01761808367', '$2a$12$WO5rkTQaILb4r9T8kY55auVzNsIuPds9lfnKMpzvnuXvTWgILuMYO', 'guest', NULL, '2026-05-12 19:21:43', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-12 19:21:43', '2026-05-12 19:21:43', NULL, NULL, NULL, 0, NULL, NULL, 0),
(67, 'Tech', 'Tonic', 'techtonic.dhk@gmail.com', '01779006970248', '$2a$12$F3i/UP.Lg4NCbdOr.fFHHuKrqjio3JuLOja8mERnlfakGDkQNXTKa', 'guest', NULL, '2026-05-17 08:36:10', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK3CUz0Bhu74L8KItwj8WJncmXMK64krtDr_1bJaN5Fugx7BA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-21 08:41:38', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 08:36:10', '2026-05-21 08:41:38', NULL, NULL, NULL, 0, NULL, '113680803738321795005', 0),
(68, 'Nore', 'Def', 'noredef70@gmail.com', '01779013252961', '$2a$12$lZ39HPutoiAiiPMGQEuUS.4k//UGfM0Ns8HeLl57BWdcGO2jPXkaa', 'guest', NULL, '2026-05-17 10:20:52', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJDjGckstwVYuQKPfdOwzw9TSpTO9TROpn22rBKPSWsa61PwA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 10:20:52', '2026-05-18 05:20:06', NULL, NULL, NULL, 0, NULL, '104833284078655758639', 0),
(69, 'adnan', 'sami', 'adnansami229atbd@gmail.com', '01779014136358', '$2a$12$SmshEiPjpM9JXzTxqYBb.e20NE6eZjCk3U5A8nwB.A5dl.2YflxCq', 'guest', NULL, '2026-05-17 10:35:36', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLfk1Y5RLa7i1o60ntQMenGYigRDIRcC4_9NGzl7Ig5sxr1B690=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 10:35:36', '2026-05-18 05:20:16', NULL, NULL, NULL, 0, NULL, '109783368443009686440', 0),
(70, 'Md Akib', 'Hossain', 'mdakibhossain697@gmail.com', '01779022108052', '$2a$12$xrpQvFGD4eywIUrQQ7.OD.gYXntyovJr8anhjAs2wWnXRkiuVkvry', 'guest', NULL, '2026-05-17 12:48:28', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLDeUNDDUa_vOSO5k6bR02W-7Z-AN3WLikY-B8uJZCUqJpULw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 12:48:28', '2026-05-18 05:20:24', NULL, NULL, NULL, 0, NULL, '105815656359125256466', 0),
(71, 'MJ11', 'Gaming', 'smjoy619@gmail.com', '01779046308360', '$2a$12$S4zXFOF6kEZ0.rpBeywyMOs1OVhNayaFhOwre3EY3ZgXmcBetTon2', 'guest', NULL, '2026-05-17 19:31:48', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJgL--XR0lM2W_xU74KKCMH8ujZiJF-qjm4wWCS370xpSbl1YMf4Q=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 19:31:48', '2026-05-18 05:20:31', NULL, NULL, NULL, 0, NULL, '107845648885798043245', 0),
(72, 'Muhib', 'Rahman', 'muhibrahman98@gmail.com', 'G-1779083716247', '$2a$12$1dzHIBE31FxLZALwQhOfIuxZXkZZLnGITsibCvazxyiKD/mVd5YtO', 'guest', NULL, '2026-05-18 05:55:16', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLRW5QMyUJH7DC7xLH6uxvAubwXroZccDB-PxlIKjksjA98DA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-18 05:55:16', '2026-05-18 05:55:16', NULL, NULL, NULL, 0, NULL, '109084105730950549091', 0),
(73, 'Bini', 'Amin', 'titubiniaminphoto@gmail.com', 'G-1779271574345', '$2a$12$7Pr8LJVRJfjBhHxiRlPSbO0MACS5I5ghIlVAQXk/gTRczwyU1qRsK', 'guest', NULL, '2026-05-20 10:06:14', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIUJCRzAgGpFRkS6qc4Oc44qfsTHfTcarepTUexjuOVbKExQw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-20 10:06:14', '2026-05-20 10:06:14', NULL, NULL, NULL, 0, NULL, '100328090505222812066', 0),
(74, 'Test', 'Agent', 'testuser@example.com', '01555555555', '$2a$12$BS2u4qIW5zZB.9Ge/99NUOVVtbNKDzKn2DSLwgNkArrxCBAUNwfa6', 'property_owner', NULL, '2026-05-22 15:01:56', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-22 15:01:56', '2026-05-22 15:01:56', NULL, NULL, NULL, 0, NULL, NULL, 0),
(75, 'Farhad', 'Ali', 'farhadali0507@gmail.com', 'G-1779514102952', '$2a$12$fnX9iDVTMQTCJS31tWY17Opohm7XUgKPtFBehFx/RuL.hv3iVMjGa', 'guest', NULL, '2026-05-23 05:28:22', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLQ5ljR94swyMfy8DB0nMwIoLlTxwlRRsxDfePY3P6TYLburfE=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 05:28:22', '2026-05-23 05:28:22', NULL, NULL, NULL, 0, NULL, '117371253437301383532', 0),
(76, 'Tanjim', '', 'tanjim@gmail.com', '0139856852', '$2a$12$AMZzVmDCDyTuDE4.bMS2uei8on0Aa6YnBa7JwMBbA6bbK5b3UT0Oe', 'staff', 59, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-23 08:30:31', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 08:29:25', '2026-05-23 08:30:31', NULL, NULL, NULL, 0, NULL, NULL, 0),
(77, 'Ashiqur', 'Rahman', 'asifboycocgame@gmail.com', 'G-1779561817279', '$2a$12$5nWCXdI578wt/YlA/J0gyueCZ0P3J1wsqgAOQkDU/AnHbhO5dUN8m', 'guest', NULL, '2026-05-23 18:43:37', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJNIN4ftDkOfPD4fM9p9kFzenLPaDpWpoFAlDasXLNdilma65tG=s96-c', NULL, NULL, '', '', '', '', '', 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 18:43:37', '2026-05-23 19:48:59', NULL, NULL, NULL, 0, NULL, '100773045449747558359', 0),
(78, 'Tasnim', 'Islam', 'tasnimislam017@gmail.com', 'G-1779565224287', '$2a$12$s/u86se3yPx2W9/KbCnI..A.TIFpPFw2ZebX5aD/m/tiDGeupF2HG', 'guest', NULL, '2026-05-23 19:40:24', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLodpuH2z1uf-YRpd_ASRG8csWj2MhlATibLVeJeajSKJd8YA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 19:40:24', '2026-05-23 19:40:24', NULL, NULL, NULL, 0, NULL, '118075528480833678691', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_blocks`
--

CREATE TABLE `user_blocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `blocked_user_id` bigint(20) UNSIGNED NOT NULL,
  `blocked_by` bigint(20) UNSIGNED NOT NULL,
  `block_type` enum('temporary','permanent','warning') NOT NULL,
  `reason` text NOT NULL,
  `description` text DEFAULT NULL,
  `block_duration` int(11) DEFAULT NULL,
  `block_scope` enum('login','booking','messaging','all') DEFAULT 'all',
  `status` enum('active','expired','revoked') DEFAULT 'active',
  `blocked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_rewards_points`
--

CREATE TABLE `user_rewards_points` (
  `id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `total_points_earned` int(11) DEFAULT 0 COMMENT 'Total points ever earned',
  `current_balance` int(11) DEFAULT 0 COMMENT 'Available points balance',
  `lifetime_points_spent` int(11) DEFAULT 0 COMMENT 'Total points used in bookings',
  `member_status_tier_id` int(11) DEFAULT NULL,
  `last_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_rewards_points`
--

INSERT INTO `user_rewards_points` (`id`, `user_id`, `total_points_earned`, `current_balance`, `lifetime_points_spent`, `member_status_tier_id`, `last_updated_at`, `created_at`) VALUES
(32, 64, 0, 0, 0, 1, '2026-05-17 07:28:57', '2026-05-17 07:28:57'),
(33, 68, 20, 20, 0, 1, '2026-05-17 11:25:06', '2026-05-17 10:21:20'),
(34, 69, 0, 0, 0, 1, '2026-05-17 10:36:22', '2026-05-17 10:36:22'),
(35, 71, 25, 25, 0, 1, '2026-05-17 19:43:11', '2026-05-17 19:41:27'),
(36, 52, 0, 0, 0, 1, '2026-05-18 05:28:13', '2026-05-18 05:28:13'),
(37, 56, 0, 0, 0, 1, '2026-05-19 09:27:56', '2026-05-19 09:27:56'),
(38, 75, 0, 0, 0, 1, '2026-05-23 05:28:33', '2026-05-23 05:28:33'),
(39, 50, 0, 0, 0, 1, '2026-05-23 08:13:06', '2026-05-23 08:13:06'),
(40, 77, 0, 0, 0, 1, '2026-05-23 19:32:48', '2026-05-23 19:32:48');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `device_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`device_info`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `device_info`, `ip_address`, `user_agent`, `is_active`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3NTI5ODA4LCJleHAiOjE3NzgxMzQ2MDh9.5M_wyN2RJLtzEGhMC2WQo5LPKiAW0rlI3T_rVkecmaw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc1Mjk4MDgsImV4cCI6MTc4MDEyMTgwOH0.CXbVAK4keWmmWs_xOq1RK1guFzaElB4oI6orueJoAoA', NULL, NULL, NULL, 0, '2026-04-30 06:18:40', '2026-04-30 06:16:48', '2026-04-30 06:18:40'),
(2, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc3NTI5OTQ3LCJleHAiOjE3NzgxMzQ3NDd9.jaruPYM5POeDTzTL4mly1Ehm-L1z7TmA86Xip6ZMXjo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzc1Mjk5NDcsImV4cCI6MTc4MDEyMTk0N30.9PYVwAdNU2XYK488G2sDC9vJh0g80zvDP0LMauntmHw', NULL, NULL, NULL, 0, '2026-04-30 06:19:37', '2026-04-30 06:19:07', '2026-04-30 06:19:37'),
(3, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3NTI5OTg1LCJleHAiOjE3NzgxMzQ3ODV9.6-4m-HHehYNfdZa-LFJzmACK7f3uwWtReIsu73feP7M', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc1Mjk5ODUsImV4cCI6MTc4MDEyMTk4NX0._DHX5nOi5yXWcC9S9Iq8-oRIet6qDhj1kHx7hhMDNUo', NULL, NULL, NULL, 0, '2026-04-30 06:21:33', '2026-04-30 06:19:45', '2026-04-30 06:21:33'),
(4, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzc1MzAxMDcsImV4cCI6MTc3ODEzNDkwN30.LxtvDPI3g1ZY6-AqAPFhooIGmGUdET81OMJqsIQ9O1g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NzUzMDEwNywiZXhwIjoxNzgwMTIyMTA3fQ.Z8GE1iCNngHglirujp02xkkpc8PC7_PSvmrzmZwd5Xg', NULL, NULL, NULL, 0, '2026-04-30 06:37:34', '2026-04-30 06:21:47', '2026-04-30 06:37:34'),
(5, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3NTMxMDYyLCJleHAiOjE3NzgxMzU4NjJ9.g_GdbsoAdlU9x6K3q-6Nclum5Roygw7PnTMDNvWz2fA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc1MzEwNjIsImV4cCI6MTc4MDEyMzA2Mn0.ox1iZQD7prCR_5obkb-SJp7FxVbtf6-p2PQYYSa10D0', NULL, NULL, NULL, 0, '2026-05-02 05:12:15', '2026-04-30 06:37:42', '2026-05-02 05:12:15'),
(6, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc3Njk4NzQyLCJleHAiOjE3NzgzMDM1NDJ9.C9IwQ3w9mxZZSuJ3Gs_qlp7P8Wkhp7Qghjffh-y3r_E', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzc2OTg3NDIsImV4cCI6MTc4MDI5MDc0Mn0.q8lQ5haNneh7AFLWz1P0Lxa2T6apGqqErYAsoGyX9rI', NULL, NULL, NULL, 0, '2026-05-02 05:12:41', '2026-05-02 05:12:22', '2026-05-02 05:12:41'),
(7, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3Njk4NzY3LCJleHAiOjE3NzgzMDM1Njd9.YogSxuOenKONZGeVtZ116WKvQM0fXg0DjTu-44pqB80', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc2OTg3NjcsImV4cCI6MTc4MDI5MDc2N30.jGeADTaNoVS3fXVWTwMD8bFerjmWiYdU6cXqq65dGio', NULL, NULL, NULL, 0, '2026-05-03 09:04:04', '2026-05-02 05:12:47', '2026-05-03 09:04:04'),
(8, 62, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYyLCJ1c2VyVHlwZSI6InN0YWZmIiwiaWF0IjoxNzc3NzA1OTkwLCJleHAiOjE3NzgzMTA3OTB9.gxG5ZWO-5Kr6hWkzdSANFzmEUMTBQhyhYXiL1E7Max4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYyLCJpYXQiOjE3Nzc3MDU5OTAsImV4cCI6MTc4MDI5Nzk5MH0.zzvHND87ClmrbPpG-IGVQtc31X0MGC_IilS8FzXAhOA', NULL, NULL, NULL, 1, '2026-06-01 07:13:10', '2026-05-02 07:13:10', '2026-05-02 07:13:10'),
(9, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3Nzk5MDY2LCJleHAiOjE3Nzg0MDM4NjZ9.cA7rF3Ha-3XSGsuBZcuoUbf8iSir3YjvHttVlvMWxRA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzc3OTkwNjYsImV4cCI6MTc4MDM5MTA2Nn0.3GVqN8vQYN97YGdgqUqDtTWmcQ8XkRnrSV-HoQTrroQ', NULL, NULL, NULL, 0, '2026-05-03 09:04:58', '2026-05-03 09:04:26', '2026-05-03 09:04:58'),
(10, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3Nzk5MTA0LCJleHAiOjE3Nzg0MDM5MDR9.IBiHLWwMtwb0wk2M11QL4Jd4WKLYNQfnGWdNpHi-cHQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc3OTkxMDQsImV4cCI6MTc4MDM5MTEwNH0.xlyZtL-kMrO32Sk3Y4zxfd03L0IaGPSUMwGB-rxzHLU', NULL, NULL, NULL, 0, '2026-05-04 09:22:01', '2026-05-03 09:05:04', '2026-05-04 09:22:01'),
(11, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3ODg2NTQwLCJleHAiOjE3Nzg0OTEzNDB9.AJIrobZAS1OBTuA8tdEZ9rD0yaFZI7IjdQTFsVj9Rgg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzc4ODY1NDAsImV4cCI6MTc4MDQ3ODU0MH0.66fBimNsGHcmZNTLDLdSPCAd5ravZYGWnHxo55MsPTY', NULL, NULL, NULL, 0, '2026-05-04 09:22:42', '2026-05-04 09:22:20', '2026-05-04 09:22:42'),
(12, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3ODg2NTY4LCJleHAiOjE3Nzg0OTEzNjh9.gnJRFpINjfk0OXBjWpb-09KpaOhBfipwbcJ_8atp22c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc4ODY1NjgsImV4cCI6MTc4MDQ3ODU2OH0.JWLTAsOiMnRdJ0QOIFY5udwPle3Su-zEcPUYwBXC3uc', NULL, NULL, NULL, 0, '2026-05-04 09:45:56', '2026-05-04 09:22:48', '2026-05-04 09:45:56'),
(13, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3ODg3OTY1LCJleHAiOjE3Nzg0OTI3NjV9.3ImepsPaFgXOK5pwNEi-vCnNUqGDV7c21_o2uTfXuAw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzc4ODc5NjUsImV4cCI6MTc4MDQ3OTk2NX0.Sjgv8FpaIIlsdl0OQl8VNYuCGFRUPe6YDtzw9Z1g1Fg', NULL, NULL, NULL, 0, '2026-05-04 09:46:33', '2026-05-04 09:46:05', '2026-05-04 09:46:33'),
(14, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3ODg3OTk5LCJleHAiOjE3Nzg0OTI3OTl9.PagGXFzEOLxys3zfH2z-eRF3UHFOINpxERch0lPe4KQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc4ODc5OTksImV4cCI6MTc4MDQ3OTk5OX0.7-iH2I6xPJKqsqQY_A5SpE-XzaiBUKBRpA84bFqKh-U', NULL, NULL, NULL, 0, '2026-05-05 04:13:16', '2026-05-04 09:46:39', '2026-05-05 04:13:16'),
(15, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3OTU0NDIwLCJleHAiOjE3Nzg1NTkyMjB9.My8-JTADCnhC2E7bkEwTyGcq9xOiVK9bJOqUINJjlZ8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzc5NTQ0MjAsImV4cCI6MTc4MDU0NjQyMH0.HFDRw7cIScP0f95HF45zmB5OnQIC_Xo0hUU27UZbGPk', NULL, NULL, NULL, 0, '2026-05-05 04:14:29', '2026-05-05 04:13:40', '2026-05-05 04:14:29'),
(16, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc3OTU0NDc1LCJleHAiOjE3Nzg1NTkyNzV9.nzsBRPDBe7iIg8lrxKnCtysi7vznu1cO8ZMCT31WhEA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzc5NTQ0NzUsImV4cCI6MTc4MDU0NjQ3NX0.YcqlqjXGPo4v1adI7NBiB3yI-qyYzWTghgngwFzXNd4', NULL, NULL, NULL, 0, '2026-05-06 04:13:54', '2026-05-05 04:14:35', '2026-05-06 04:13:54'),
(17, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MDQwODc4LCJleHAiOjE3Nzg2NDU2Nzh9.SNq36ZVB5w7EE-mLdrVRbd9llIeZjhO0dgap7NxTqLY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgwNDA4NzgsImV4cCI6MTc4MDYzMjg3OH0.UiZo7T4ZDvaux-99iUHxr1GvrSxO--FeNbhW24tcMoE', NULL, NULL, NULL, 0, '2026-05-06 04:15:23', '2026-05-06 04:14:38', '2026-05-06 04:15:23'),
(18, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MDQwOTI5LCJleHAiOjE3Nzg2NDU3Mjl9.wMWMJNx97nC6dvixyOBbfNI8EOzTGDuR9vqRcreTpZY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgwNDA5MjksImV4cCI6MTc4MDYzMjkyOX0.l4PNxzoiHRuSSNnaeNYXn9cciTZTjDvLWTwk-xDc_OM', NULL, NULL, NULL, 0, '2026-05-06 04:44:26', '2026-05-06 04:15:29', '2026-05-06 04:44:26'),
(19, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MDQyNjkxLCJleHAiOjE3Nzg2NDc0OTF9.5ioFUUDuDS626p2pUKeOzbVI1n9FebStl19DSGqA41k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgwNDI2OTEsImV4cCI6MTc4MDYzNDY5MX0.PXlyNMT_vshub-mzKegABuK2s6iH3b3LsGLLu90CA5Y', NULL, NULL, NULL, 0, '2026-05-06 04:45:26', '2026-05-06 04:44:51', '2026-05-06 04:45:26'),
(20, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MDQyNzQwLCJleHAiOjE3Nzg2NDc1NDB9.CbaorvppCwSXaFMUUWygWnL-8MCNX6nXxp4so8uDgj8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgwNDI3NDAsImV4cCI6MTc4MDYzNDc0MH0.-wWiF0LXJgZ-bo-MqI6mGLDBPMFMjPZA7VdnGTc5OeI', NULL, NULL, NULL, 0, '2026-05-07 04:06:02', '2026-05-06 04:45:40', '2026-05-07 04:06:02'),
(21, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTI2NzgxLCJleHAiOjE3Nzg3MzE1ODF9.47j7CMFUFvNzER1hckyoaSGxx_kfzphdmhgGlwtKdfQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgxMjY3ODEsImV4cCI6MTc4MDcxODc4MX0.SPhtfqS5jXvF355v2ZiYJ3hj3XaoihOn2AcWQSPqzQ8', NULL, NULL, NULL, 0, '2026-05-07 04:06:52', '2026-05-07 04:06:21', '2026-05-07 04:06:52'),
(22, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTI2ODE3LCJleHAiOjE3Nzg3MzE2MTd9.HawrmNl5K11fKMVQnKsGiHTqL8TBY2pR6ZTVhhElWl0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgxMjY4MTcsImV4cCI6MTc4MDcxODgxN30.YNi75U2w-Iw67f8J9pqZ2psydWRO6bIEiCgMWT80vZo', NULL, NULL, NULL, 0, '2026-05-07 04:37:39', '2026-05-07 04:06:58', '2026-05-07 04:37:39'),
(23, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTI4Njg4LCJleHAiOjE3Nzg3MzM0ODh9.WdCo0vUFjePHxq2Y5odH09n-88CqPPp8_RoZZVB092U', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgxMjg2ODgsImV4cCI6MTc4MDcyMDY4OH0.F6jFNBn1TRdmm8oO-Mv3OLSgjmVweS15eA7U7-nLa3M', NULL, NULL, NULL, 0, '2026-05-07 04:38:56', '2026-05-07 04:38:08', '2026-05-07 04:38:56'),
(24, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTI4NzQyLCJleHAiOjE3Nzg3MzM1NDJ9.OZML1IM0dXkthCzTp1tryVftrmVMLJgPSU9pmSjs6T4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgxMjg3NDIsImV4cCI6MTc4MDcyMDc0Mn0.gjnHoQzn-u9d5TgWlrc38RpiyRC6OG-jnFaGBq29iSM', NULL, NULL, NULL, 0, '2026-05-07 04:40:48', '2026-05-07 04:39:02', '2026-05-07 04:40:48'),
(25, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTI4ODU0LCJleHAiOjE3Nzg3MzM2NTR9.W1R95UVG4QzYTcijvMZTFj6x7bQePWMIWRaYIJwG8F4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgxMjg4NTQsImV4cCI6MTc4MDcyMDg1NH0.zVkhAWeuzBV6J_HsfA8Ib_oyiYcWxuISHIxKx5vVJyM', NULL, NULL, NULL, 0, '2026-05-07 04:48:45', '2026-05-07 04:40:54', '2026-05-07 04:48:45'),
(26, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzgxMjkzNDAsImV4cCI6MTc3ODczNDE0MH0.A8kuDqwFfu0pJKxpuVgLeaEGfgmxd9a0qu_QbLqyfn8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3ODEyOTM0MCwiZXhwIjoxNzgwNzIxMzQwfQ.BUgbB3YSBvM2iadGLZXEruI2npynfsyqMLuG1Sd0wvI', NULL, NULL, NULL, 0, '2026-05-07 04:50:39', '2026-05-07 04:49:00', '2026-05-07 04:50:39'),
(27, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTI5NDUzLCJleHAiOjE3Nzg3MzQyNTN9.U3nsAEmGjkuVDs2z-O4TPm0ueWbxjaCUnCy1RdoUgHM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgxMjk0NTMsImV4cCI6MTc4MDcyMTQ1M30.MBVL09zADhxL-aeCSpXsNfZoVZTzpF-yg2l5lA3g1PM', NULL, NULL, NULL, 0, '2026-05-07 05:32:02', '2026-05-07 04:50:53', '2026-05-07 05:32:02'),
(28, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzgxMjk0OTAsImV4cCI6MTc3ODczNDI5MH0.EndecMJfhKlKJeLRKdV1wDcHoW9-_gWJFnQPrXXbaUg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3ODEyOTQ5MCwiZXhwIjoxNzgwNzIxNDkwfQ.-pHwm0rF8KRGUzjIVnximuGDSg3r-aIqJosN-o0pv5A', NULL, NULL, NULL, 1, '2026-06-06 04:51:30', '2026-05-07 04:51:30', '2026-05-07 04:51:30'),
(29, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTMxOTQwLCJleHAiOjE3Nzg3MzY3NDB9.dvC76WFJfA9el53N8QZ-VIpRFxeghwtluNjbByV0Mv0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgxMzE5NDAsImV4cCI6MTc4MDcyMzk0MH0.X9QAqL9Q9u13tFBhbT4K5droTOWWmNRvchHbrGH3Mf0', NULL, NULL, NULL, 0, '2026-05-07 05:32:41', '2026-05-07 05:32:20', '2026-05-07 05:32:41'),
(30, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTMxOTY4LCJleHAiOjE3Nzg3MzY3Njh9.XvIBAY-kQyonru993-9fOEPIYd8OfDkgo77kyqS9SeE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgxMzE5NjgsImV4cCI6MTc4MDcyMzk2OH0.jNcw96luj6R4j47zTWNghAxqNKo7U1DdT94Gz_q-q_o', NULL, NULL, NULL, 0, '2026-05-07 05:33:52', '2026-05-07 05:32:48', '2026-05-07 05:33:52'),
(31, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTMyMDY2LCJleHAiOjE3Nzg3MzY4NjZ9.m962DFKcRImTt4PyAuqyjwvLk_jRhbh6GIDJ-miQmAQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgxMzIwNjYsImV4cCI6MTc4MDcyNDA2Nn0.VVMvOrTXGNbm7f8grgVzlJbEAi8RB36CwpUDN37li_w', NULL, NULL, NULL, 0, '2026-05-07 05:34:56', '2026-05-07 05:34:26', '2026-05-07 05:34:56'),
(32, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTMyMTAyLCJleHAiOjE3Nzg3MzY5MDJ9.8s9ye2m1CSSMNnvUN7EAF3gEs6n8t7ocQ5DxwuiL6Po', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgxMzIxMDIsImV4cCI6MTc4MDcyNDEwMn0.SWhsnJ7lF5ah82w-si0qYYChC-ObD_rpO6hfJp7uHWY', NULL, NULL, NULL, 0, '2026-05-07 06:25:08', '2026-05-07 05:35:02', '2026-05-07 06:25:08'),
(33, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTM1MTMxLCJleHAiOjE3Nzg3Mzk5MzF9.PHy32Rm9SVgdgXl6QTc6h7b6NHoQB9UbuuUpNsnBx_E', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzgxMzUxMzEsImV4cCI6MTc4MDcyNzEzMX0.Ot4tO2o7WKQETti9MtukXBsCZh5ZGXSESiu6BKKPKAU', NULL, NULL, NULL, 0, '2026-05-07 06:26:14', '2026-05-07 06:25:31', '2026-05-07 06:26:14'),
(34, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc4MTM1MTg0LCJleHAiOjE3Nzg3Mzk5ODR9.p5XoI95kjVNrmbzlQRyv0oD908Ml-JrBmF_PFro9Krw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzgxMzUxODQsImV4cCI6MTc4MDcyNzE4NH0.dX1o5b5aq6xTUE8Cnh0OrMcXAIobIP-P4uGLInmUoms', NULL, NULL, NULL, 1, '2026-06-06 06:26:24', '2026-05-07 06:26:24', '2026-05-07 06:26:24'),
(35, 66, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc4NjEzNzAzLCJleHAiOjE3NzkyMTg1MDN9.8HYpmeOyybgO1BgVIL5DZNqNF5BwlK2a8f6kiX_ZGtU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY2LCJpYXQiOjE3Nzg2MTM3MDMsImV4cCI6MTc4MTIwNTcwM30.a_U4RV2Kv07zZ8AY8SlVCBcYQuOtuBkHpycsZq_9hrg', NULL, NULL, NULL, 1, '2026-06-11 19:21:43', '2026-05-12 19:21:43', '2026-05-12 19:21:43'),
(36, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDAxMjMyLCJleHAiOjE3Nzk2MDYwMzJ9.kLCRbTdQuBHaTzKGAlj00PONMFCHCEr6Oz1qlaKSaA8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzkwMDEyMzIsImV4cCI6MTc4MTU5MzIzMn0.VHq1F7yYSk42YbiMYgDi8fX6mzGBubimxXYXAuXuGmo', NULL, NULL, NULL, 0, '2026-05-17 07:28:36', '2026-05-17 07:00:32', '2026-05-17 07:28:36'),
(37, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDAxMjkzLCJleHAiOjE3Nzk2MDYwOTN9.L4KwsVru1PmiKh_zr61HLIN3rK78MtxLN4PChIw51zw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwMDEyOTMsImV4cCI6MTc4MTU5MzI5M30.W_ZIhLpMlRAxgk3o9phk5sT6NGrtTLVcxp_ZGvlnYcc', NULL, NULL, NULL, 0, '2026-05-17 08:18:04', '2026-05-17 07:01:33', '2026-05-17 08:18:04'),
(38, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDAyNDI3LCJleHAiOjE3Nzk2MDcyMjd9.bQ6_nnEOB1-79QAupyr6MS1XENM83_6NlvBP8sP1bNk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzkwMDI0MjcsImV4cCI6MTc4MTU5NDQyN30.d7l8g83kt-fGdYmBWg6-rhj7-YvoaqmWXMZGm3QT-44', NULL, NULL, NULL, 0, '2026-05-18 00:17:00', '2026-05-17 07:20:27', '2026-05-18 00:17:00'),
(39, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDAyOTI5LCJleHAiOjE3Nzk2MDc3Mjl9.xk03B3TdvQZ4vD5DCENTs86DaMMzJxZ78zIoqntthnA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzkwMDI5MjksImV4cCI6MTc4MTU5NDkyOX0.S422w2DJiz21V3HxXAwFapZfqefX44tjvvoc9FrarhM', NULL, NULL, NULL, 0, '2026-05-17 07:33:11', '2026-05-17 07:28:49', '2026-05-17 07:33:11'),
(40, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDAzMTk3LCJleHAiOjE3Nzk2MDc5OTd9.jJDTlVgUa9Q6Fm9XMfZJWyiasaR1SxMug04z0ytLUFs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzkwMDMxOTcsImV4cCI6MTc4MTU5NTE5N30.a13M3a_MCVJoFNwYKZJrJiu8s3tAr9BYoGDZ9HIMMG4', NULL, NULL, NULL, 0, '2026-05-17 07:34:31', '2026-05-17 07:33:17', '2026-05-17 07:34:31'),
(41, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDAzMjkzLCJleHAiOjE3Nzk2MDgwOTN9.703WdvFeF37B8lc7qjlrs2W72UJlAXG70pHiHQsXLqs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzkwMDMyOTMsImV4cCI6MTc4MTU5NTI5M30.4Dy5Q-mu8HP47ZJwHpb5DSDHAuXZcpBMasBIiz0LDbE', NULL, NULL, NULL, 0, '2026-05-17 07:58:39', '2026-05-17 07:34:53', '2026-05-17 07:58:39'),
(42, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkwMDQ3NDAsImV4cCI6MTc3OTYwOTU0MH0.fsmrGu2dggblzM89ClmiIsDlwJy7k8Hy5GeCZKCaHUI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTAwNDc0MCwiZXhwIjoxNzgxNTk2NzQwfQ.XHwoiepIXnJYmzy5w1Rv-IdCzEZ8PHDyFQG28aT7dKg', NULL, NULL, NULL, 0, '2026-05-17 08:52:54', '2026-05-17 07:59:00', '2026-05-17 08:52:54'),
(43, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkwMDU4OTEsImV4cCI6MTc3OTYxMDY5MX0.h5_YS701c8hb9ss_Nez1QxFyN00XQnQ0gAj3AH6n2fA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTAwNTg5MSwiZXhwIjoxNzgxNTk3ODkxfQ.MkTwKojPv6vxXNccsOXRzbsdY9QeTPRe1apCpxGwYFc', NULL, NULL, NULL, 0, '2026-05-17 08:22:53', '2026-05-17 08:18:11', '2026-05-17 08:22:53'),
(44, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDA2MzEwLCJleHAiOjE3Nzk2MTExMTB9.BdoypADZDRY7f9FHc5eUOHWWkNMNBAYTKUWtJkB0_z0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwMDYzMTAsImV4cCI6MTc4MTU5ODMxMH0.9raUpQGp4D1NQuFaVZZqwEOo34V2hbRd1kODcFswYf0', NULL, NULL, NULL, 0, '2026-05-17 08:30:58', '2026-05-17 08:25:10', '2026-05-17 08:30:58'),
(45, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkwMDY2NjIsImV4cCI6MTc3OTYxMTQ2Mn0.W8KHtb4shs4JNDJfq-IidOPhCAXpsTAEXFA-r2rF24s', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTAwNjY2MiwiZXhwIjoxNzgxNTk4NjYyfQ.brESzwQ1WI6OgQ1tbkgn6nIXdmO4ncWNmDBdrk7hZxA', NULL, NULL, NULL, 0, '2026-05-17 08:31:43', '2026-05-17 08:31:02', '2026-05-17 08:31:43'),
(46, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDA2NzEyLCJleHAiOjE3Nzk2MTE1MTJ9.TqnpkSE6ctP5SafS7nAI2XP9VCD8dPBefxE4fdSV090', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwMDY3MTIsImV4cCI6MTc4MTU5ODcxMn0.GCtvIXLRlbcXBLKqu_0fmmgr2TbnEPJH5JEnQb-B1DM', NULL, NULL, NULL, 0, '2026-05-17 08:32:33', '2026-05-17 08:31:52', '2026-05-17 08:32:33'),
(47, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkwMDY3NjAsImV4cCI6MTc3OTYxMTU2MH0.pwJm8KvXCy2uB3qVOPnL-4yKbetCvXkOvE3XNI6fsFc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTAwNjc2MCwiZXhwIjoxNzgxNTk4NzYwfQ.3M1TSumdsirWjWB2ccex34IAhtJvAQuVU8B8R3F-eBA', NULL, NULL, NULL, 0, '2026-05-17 08:33:10', '2026-05-17 08:32:40', '2026-05-17 08:33:10'),
(48, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDA2Nzk2LCJleHAiOjE3Nzk2MTE1OTZ9.zX-dqwqL9htJ-_rrCzcvmL6BN0JFHQi3ZwDHTRWmwWo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwMDY3OTYsImV4cCI6MTc4MTU5ODc5Nn0.axIRojS3eYRuWBsPWPgLGbhM216SEG-rflMwRL5yZqg', NULL, NULL, NULL, 0, '2026-05-17 09:45:51', '2026-05-17 08:33:16', '2026-05-17 09:45:51'),
(49, 67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDA2OTcwLCJleHAiOjE3Nzk2MTE3NzB9.GXQxsUnCUFiYWt0pmrvFIW2SBYFbI3oJ1tEE5CO7lW4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJpYXQiOjE3NzkwMDY5NzAsImV4cCI6MTc4MTU5ODk3MH0.QhqXGCSZpgi1TMKB9WFtk4ZzTsWrMHR78K-rND_R8ro', NULL, NULL, NULL, 1, '2026-06-16 08:36:10', '2026-05-17 08:36:10', '2026-05-17 08:36:10'),
(50, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDA3OTg5LCJleHAiOjE3Nzk2MTI3ODl9.unjAGMSkNWkvVdqgH-tXg755X-2hf6jpQwzoyPIVY3M', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3NzkwMDc5ODksImV4cCI6MTc4MTU5OTk4OX0.Vsi7axtUq42NMoiqF08ln_i9OE-aZI90R-tfF0doM70', NULL, NULL, NULL, 0, '2026-05-22 16:19:35', '2026-05-17 08:53:09', '2026-05-22 16:19:35'),
(51, 67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDExMTA2LCJleHAiOjE3Nzk2MTU5MDZ9.pO03iCY5V7ZPzdg8DIeXbaNVmhL4cs32396kDYJFuPM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJpYXQiOjE3NzkwMTExMDYsImV4cCI6MTc4MTYwMzEwNn0.328rbUgj_UTHnEge7RZHytfQYzXclD6FoXp7BCC_CII', NULL, NULL, NULL, 1, '2026-06-16 09:45:06', '2026-05-17 09:45:06', '2026-05-17 09:45:06'),
(52, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDExMTYxLCJleHAiOjE3Nzk2MTU5NjF9.Ww9HStYWiyR36K_SLYYZV1OrvDVJ5do-6Hg_xXBCxi0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3NzkwMTExNjEsImV4cCI6MTc4MTYwMzE2MX0.liBllYDdpvsv2Xtbc43aHaFklFHnxeZ36d_nd2W0LIU', NULL, NULL, NULL, 0, '2026-05-17 10:31:00', '2026-05-17 09:46:01', '2026-05-17 10:31:00'),
(53, 68, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY4LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDEzMjUyLCJleHAiOjE3Nzk2MTgwNTJ9.begO1n-oniqw8JoBjEESHP-0JtE9kPhDdpvH8S6SpoE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY4LCJpYXQiOjE3NzkwMTMyNTIsImV4cCI6MTc4MTYwNTI1Mn0.v3ohAdQO2HxlTrY4BF_HYyeDZTzoe8ojLQgVlcUKnBI', NULL, NULL, NULL, 1, '2026-06-16 10:20:52', '2026-05-17 10:20:52', '2026-05-17 10:20:52'),
(54, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDEzODcxLCJleHAiOjE3Nzk2MTg2NzF9.4qNT2JwMqhOX8JDDUNOiRiL0NUtY6daBqFf-N_EY3n8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwMTM4NzEsImV4cCI6MTc4MTYwNTg3MX0.tLVAVYcps0-8tH2JZrf_lOttEmFxlx0mUJwPYqPoFmw', NULL, NULL, NULL, 0, '2026-05-21 08:41:27', '2026-05-17 10:31:11', '2026-05-21 08:41:27'),
(55, 69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDE0MTM2LCJleHAiOjE3Nzk2MTg5MzZ9.I1ZKp8b-XWhet5C-sZElDTOz3b2B8EXoVhHG-Pg4xbk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJpYXQiOjE3NzkwMTQxMzYsImV4cCI6MTc4MTYwNjEzNn0.V1vOK_U1zWZgfriT8dB21Ddbmwzm1TkD5cecG3xke-4', NULL, NULL, NULL, 1, '2026-06-16 10:35:36', '2026-05-17 10:35:36', '2026-05-17 10:35:36'),
(56, 70, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDIyMTA4LCJleHAiOjE3Nzk2MjY5MDh9.FenRZ8VsfA2JH7ba87vE2rJE-OhavoKhzbAfnXeOpQI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcwLCJpYXQiOjE3NzkwMjIxMDgsImV4cCI6MTc4MTYxNDEwOH0.7_i9ObXV-cOnuiQaVDt--aYVFjnY_vjCXn7I9ACUKbE', NULL, NULL, NULL, 1, '2026-06-16 12:48:28', '2026-05-17 12:48:28', '2026-05-17 12:48:28'),
(57, 71, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcxLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDQ2MzA4LCJleHAiOjE3Nzk2NTExMDh9._NcKzPa6fePp4BO8Uo_BYzx44AAa-K1uMTfIKs6r9W8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcxLCJpYXQiOjE3NzkwNDYzMDgsImV4cCI6MTc4MTYzODMwOH0.c6m8pR-Z2k7SMDpqLrxaSMtikpgYkCeG2JqFVVxwWBA', NULL, NULL, NULL, 1, '2026-06-16 19:31:48', '2026-05-17 19:31:48', '2026-05-17 19:31:48'),
(58, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkwNjM0MzQsImV4cCI6MTc3OTY2ODIzNH0.4CM7txVJJ9YrCAPZ7QYeEWZSHVFRE2onNUKp47MboDE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTA2MzQzNCwiZXhwIjoxNzgxNjU1NDM0fQ.VmmVJ63w1HT-zlWRpuVkyGStI5ao47ikK2PJe9ZPuoA', NULL, NULL, NULL, 0, '2026-05-18 00:39:04', '2026-05-18 00:17:14', '2026-05-18 00:39:04'),
(59, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDY0NzUxLCJleHAiOjE3Nzk2Njk1NTF9.VD0_Y6Ai9a78V4SHjw_X745IHZPj6KKPrGOjTM_jPpg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3NzkwNjQ3NTEsImV4cCI6MTc4MTY1Njc1MX0.h0AVGJbtH_q3Of4cNAQby4p1OMBPhgFWOMYD1frDmt8', NULL, NULL, NULL, 1, '2026-06-17 00:39:11', '2026-05-18 00:39:11', '2026-05-18 00:39:11'),
(60, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDgwMTU5LCJleHAiOjE3Nzk2ODQ5NTl9.-ElwNRYhA-vAk36AVjUmTY2erA8jSNbvCsBO7P0K2X4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwODAxNTksImV4cCI6MTc4MTY3MjE1OX0.JdY2NAJRrH6_uZXuJD7mZIQsHURBEdnVkalFotDhdpY', NULL, NULL, NULL, 0, '2026-05-18 13:52:13', '2026-05-18 04:55:59', '2026-05-18 13:52:13'),
(61, 72, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcyLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDgzNzE2LCJleHAiOjE3Nzk2ODg1MTZ9.2SJ4OxZKwAhQxamAYaC9wC2jLeB2HwNl_crIRijyA8I', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcyLCJpYXQiOjE3NzkwODM3MTYsImV4cCI6MTc4MTY3NTcxNn0.H9rhhKjs4WRU1VW6xF1mzM00JPASlzp6vjR6BTvvFjI', NULL, NULL, NULL, 1, '2026-06-17 05:55:16', '2026-05-18 05:55:16', '2026-05-18 05:55:16'),
(62, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MTEyMzQxLCJleHAiOjE3Nzk3MTcxNDF9.X2zymj1Tp0ULNjVnJusCwAxRKFjh8nPtcWkL8mQJmbk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkxMTIzNDEsImV4cCI6MTc4MTcwNDM0MX0.Z-pWDLhlDUSNCkU5fhyDLtjEWxLf-KG2WUHinANzPmo', NULL, NULL, NULL, 0, '2026-05-18 13:54:45', '2026-05-18 13:52:21', '2026-05-18 13:54:45'),
(63, 56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MTgyODYwLCJleHAiOjE3Nzk3ODc2NjB9.g2R8By-wciABWAFp2yHF9bdNuW9kr1xDMo3iwQjQf0A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJpYXQiOjE3NzkxODI4NjAsImV4cCI6MTc4MTc3NDg2MH0.Rf1fQkZoqMrXoRjbBDVwvfXzp6ov5f7LnHd6LxK_74g', NULL, NULL, NULL, 0, '2026-05-19 09:38:07', '2026-05-19 09:27:40', '2026-05-19 09:38:07'),
(64, 56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MTgzNTE1LCJleHAiOjE3Nzk3ODgzMTV9._2_0W7vqZ7DQtoi69H9FM_z4hqS6SCYzSyX4gSw6EvU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJpYXQiOjE3NzkxODM1MTUsImV4cCI6MTc4MTc3NTUxNX0.yv0NXYj4a-0ju1EXwdqlp611x2laUgxsyDCyPE1htOM', NULL, NULL, NULL, 1, '2026-06-18 09:38:35', '2026-05-19 09:38:35', '2026-05-19 09:38:35'),
(65, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MjU0MjA1LCJleHAiOjE3Nzk4NTkwMDV9.HPzIkeLcGW-yllPpMc5Wz7Y61UznkqNEpw969Y7xh2c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkyNTQyMDUsImV4cCI6MTc4MTg0NjIwNX0.UYmiahQ4sEfADpMGlUtrHcPc9DF1diLtwOhLHKqz4fc', NULL, NULL, NULL, 0, '2026-05-20 10:52:11', '2026-05-20 05:16:45', '2026-05-20 10:52:11'),
(66, 73, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjczLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MjcxNTc0LCJleHAiOjE3Nzk4NzYzNzR9.qtnLQ3HFs5cetEh0qsxsdSvyqkCeYx6rhLJKbtapKqg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjczLCJpYXQiOjE3NzkyNzE1NzQsImV4cCI6MTc4MTg2MzU3NH0.DK4NKx08Bo07JtJDW1bz0fzKAAgjuMLX1_jLbHDDjLQ', NULL, NULL, NULL, 1, '2026-06-19 10:06:14', '2026-05-20 10:06:14', '2026-05-20 10:06:14'),
(67, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5Mjc0MzM5LCJleHAiOjE3Nzk4NzkxMzl9.rYvriDik1h4yfUTAf3oEQLrm8bt11zqtLAvuJV2Ocr4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkyNzQzMzksImV4cCI6MTc4MTg2NjMzOX0.XKT6i44hPfr8D2JSamO7zpYrJh8uMz5FwucSnEhx2OM', NULL, NULL, NULL, 0, '2026-05-20 15:03:06', '2026-05-20 10:52:19', '2026-05-20 15:03:06'),
(68, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MzQyMjczLCJleHAiOjE3Nzk5NDcwNzN9.3116yGAnsGtdAc53WYP4geLRNoosr1xzgGyDi93CF2c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkzNDIyNzMsImV4cCI6MTc4MTkzNDI3M30.hqnqyZZK-N2OcE5wJWl5M3QFl0W4MEj_Yway0sVkQL0', NULL, NULL, NULL, 1, '2026-06-20 05:44:33', '2026-05-21 05:44:33', '2026-05-21 05:44:33'),
(69, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkzNTIxNTksImV4cCI6MTc3OTk1Njk1OX0.vVqzPgRdtx_Y9j4vGlYO7ybV_qWTQ8NTFHeKpoKQC_g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTM1MjE1OSwiZXhwIjoxNzgxOTQ0MTU5fQ.OxLlHMcfuWZclmAOyLPSx1jVVWpTJdoxj6apSY9O3tA', NULL, NULL, NULL, 1, '2026-06-20 08:29:19', '2026-05-21 08:29:19', '2026-05-21 08:29:19'),
(70, 67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MzUyODk4LCJleHAiOjE3Nzk5NTc2OTh9.8FkM3UP-hzzyW8jDBdpyNFIqy3KEarhGsRhk7EsZggM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJpYXQiOjE3NzkzNTI4OTgsImV4cCI6MTc4MTk0NDg5OH0.XiUuU233eu1KHaDa2XJ8mh7CObk04o4gz7LA9xRMKp4', NULL, NULL, NULL, 0, '2026-05-21 08:42:29', '2026-05-21 08:41:38', '2026-05-21 08:42:29'),
(71, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MzUyOTU1LCJleHAiOjE3Nzk5NTc3NTV9.BYTgq3-xxv3LXoXInL30UmhLUvhS8My05YO6HQYEHBw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3NzkzNTI5NTUsImV4cCI6MTc4MTk0NDk1NX0.2Od4hTLVwd_6NUv8nefTdN3IaTC2CSAsmXv5VxuGES0', NULL, NULL, NULL, 0, '2026-05-23 08:30:07', '2026-05-21 08:42:35', '2026-05-23 08:30:07'),
(72, 55, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MzcxMjc4LCJleHAiOjE3Nzk5NzYwNzh9.yWAdXa1VpkxGj92DGuHVloc7GQH0QWMSZHvRciPZ4MI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU1LCJpYXQiOjE3NzkzNzEyNzgsImV4cCI6MTc4MTk2MzI3OH0.pGiKHthM-w3RasKY7VEhqeyFI1mZPfn9wV9BYwwInKw', NULL, NULL, NULL, 1, '2026-06-20 13:47:58', '2026-05-21 13:47:58', '2026-05-21 13:47:58'),
(73, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjE5ODgsImV4cCI6MTc4MDA2Njc4OH0.AxWkAyeXJP7tmV-MFAbHbhWwdFgVA5iaL9tDbCHud0s', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2MTk4OCwiZXhwIjoxNzgyMDUzOTg4fQ.wbVNOgP8kijM8F33CPZibE45mUA14U0daBIf23pYZ4k', NULL, NULL, NULL, 1, '2026-06-21 14:59:48', '2026-05-22 14:59:48', '2026-05-22 14:59:48'),
(74, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjE5ODksImV4cCI6MTc4MDA2Njc4OX0.UV0ET5-n8x7XLIVKCbLyHPocwPPHXww09j1yh19WP4c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2MTk4OSwiZXhwIjoxNzgyMDUzOTg5fQ.QqenSoC4AVOiNKiGySCOl3aQmnvN6pW2bf_JEwO41uY', NULL, NULL, NULL, 1, '2026-06-21 14:59:49', '2026-05-22 14:59:49', '2026-05-22 14:59:49'),
(75, 74, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NDYyMTE2LCJleHAiOjE3ODAwNjY5MTZ9.EFrPhFnAhQRRR19tNFNebFLIl5_dHbbQh2DPPdGCAMM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc0LCJpYXQiOjE3Nzk0NjIxMTYsImV4cCI6MTc4MjA1NDExNn0.G0VIuatg95ZKrMH4XI65tcwhzsMzg9M_qX3ZaUn7Ugk', NULL, NULL, NULL, 1, '2026-06-21 15:01:56', '2026-05-22 15:01:56', '2026-05-22 15:01:56'),
(76, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjMyNDAsImV4cCI6MTc4MDA2ODA0MH0.V9ZskSbaJ6WYakt_TaxkdTv8_Ish_WjaYoWBZSiPZnU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2MzI0MCwiZXhwIjoxNzgyMDU1MjQwfQ.ab3HEn10QH_Ej2a0a3iK9_UXG_w3F6RtR92EQ73USWo', NULL, NULL, NULL, 1, '2026-06-21 15:20:40', '2026-05-22 15:20:40', '2026-05-22 15:20:40'),
(77, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjY3OTcsImV4cCI6MTc4MDA3MTU5N30.M-6kf5AmjplltTsNj_F4trtjA3rZC8t6cRoa5nL4MEw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2Njc5NywiZXhwIjoxNzgyMDU4Nzk3fQ.8aj7Oy2ig3DruSNmd9myQLkj9IVaGURRNZwLjNY13fs', NULL, NULL, NULL, 0, '2026-05-23 05:29:24', '2026-05-22 16:19:57', '2026-05-23 05:29:24'),
(78, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTE0MTAyLCJleHAiOjE3ODAxMTg5MDJ9.EcdpyAFGF2FREkvZmsIZ-OFY5NSkLGG6LA6RE3gpGMY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3Nzk1MTQxMDIsImV4cCI6MTc4MjEwNjEwMn0.Rn96_JwcXb4d0opaxQ3Eg-62WNm5b5tCWUuQUhfZl7U', NULL, NULL, NULL, 1, '2026-06-22 05:28:22', '2026-05-23 05:28:22', '2026-05-23 05:28:22'),
(79, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTE0MTg4LCJleHAiOjE3ODAxMTg5ODh9.TVigBdQH7bDc727hEuj3O9mp3L_sEXsSKNdDgYmDK6I', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MTQxODgsImV4cCI6MTc4MjEwNjE4OH0.oa9OyL3PgYPd1-gJa8w6NDBDiKwWG58fM0cu4jpXJmk', NULL, NULL, NULL, 0, '2026-05-23 05:30:37', '2026-05-23 05:29:48', '2026-05-23 05:30:37'),
(80, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk1MTQyNTIsImV4cCI6MTc4MDExOTA1Mn0.NKhedJyZKs-9s3TGBB_cgjWeY0Cjg1Tde8W8ZJNEnIE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTUxNDI1MiwiZXhwIjoxNzgyMTA2MjUyfQ.RQIb7yaYYZMFbBpmj-RBXaej4XWtJrXPT7EABfp6asE', NULL, NULL, NULL, 0, '2026-05-23 05:35:42', '2026-05-23 05:30:52', '2026-05-23 05:35:42'),
(81, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk1MTQ3ODcsImV4cCI6MTc4MDExOTU4N30.fBg1THvgBykRqKqG-IzqzuM-2hJWChhefoZq0i3Zj0g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTUxNDc4NywiZXhwIjoxNzgyMTA2Nzg3fQ.Xu5J6XifegAD-5FN9r57aJ9PJ-L7PKzME45EgDfDhyw', NULL, NULL, NULL, 0, '2026-05-23 06:40:52', '2026-05-23 05:39:47', '2026-05-23 06:40:52'),
(82, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTE4NDc2LCJleHAiOjE3ODAxMjMyNzZ9.F336rAlZhSeztNt0PDKssNehtYOUsN_jTio0KwUYt_o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MTg0NzYsImV4cCI6MTc4MjExMDQ3Nn0.im5BlzgRQ9ZruLmvKvhtrtE8jI7A3_uUfzfigDDQZWA', NULL, NULL, NULL, 0, '2026-05-23 07:01:01', '2026-05-23 06:41:16', '2026-05-23 07:01:01'),
(83, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk1MTk2NzQsImV4cCI6MTc4MDEyNDQ3NH0.4JxxnEtgc5OiLN03t5U1IWz86svCcGjFNRl_LlmhRQM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTUxOTY3NCwiZXhwIjoxNzgyMTExNjc0fQ.cbyZKd-_x8Czz8L9ssUMwAvOUjmH_Kzb2FFXfH6B1PY', NULL, NULL, NULL, 0, '2026-05-23 07:06:57', '2026-05-23 07:01:14', '2026-05-23 07:06:57'),
(84, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIwMDI0LCJleHAiOjE3ODAxMjQ4MjR9.1xs9MDdShDtdsRNLCysRXvSe-82NYKVnijF8cVak-YI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjAwMjQsImV4cCI6MTc4MjExMjAyNH0.-2-Lp0B2pU_P8wuSBvYu9tiDZkp7WeW273EDU5P-Ca8', NULL, NULL, NULL, 0, '2026-05-23 07:21:30', '2026-05-23 07:07:04', '2026-05-23 07:21:30'),
(85, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIwODk3LCJleHAiOjE3ODAxMjU2OTd9.iZzAbkSX4v8x_o8MG9lLwsHgmw6MfMBSUWOKbb-xY8g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjA4OTcsImV4cCI6MTc4MjExMjg5N30.jS8NruV3LUpYn-BSjhovCkhiJV6pAeCwoQZLxvdiR8s', NULL, NULL, NULL, 0, '2026-05-23 07:25:07', '2026-05-23 07:21:37', '2026-05-23 07:25:07'),
(86, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk1MjExMjAsImV4cCI6MTc4MDEyNTkyMH0.SHeaUBAc2d_rAggGtQ-lPaWDvqH_lL7gwaxxorw13UM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTUyMTEyMCwiZXhwIjoxNzgyMTEzMTIwfQ.WtG1R39wv2dRIBl8w_XnWQBBWfm-82eQN5OVUFvfQ4Y', NULL, NULL, NULL, 0, '2026-05-23 07:32:16', '2026-05-23 07:25:20', '2026-05-23 07:32:16'),
(87, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIxNTQzLCJleHAiOjE3ODAxMjYzNDN9.21nvB1PP-2JMXG9Zhne_sIA0Z02C81_H-P41vhJW0L4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjE1NDMsImV4cCI6MTc4MjExMzU0M30.1DoVivi_9Roh1jgwBQ5Uox0wOckM29NLiiR8csQaBaY', NULL, NULL, NULL, 0, '2026-05-23 07:35:02', '2026-05-23 07:32:23', '2026-05-23 07:35:02'),
(88, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIxNzE3LCJleHAiOjE3ODAxMjY1MTd9.MpA-f9mBX8Y5BOYuyioKeQPHZdN6xvF8L0uZQod46i0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzk1MjE3MTcsImV4cCI6MTc4MjExMzcxN30.ed6z2z5mtmrvMub6fKkRZHwYWzWT5_zd2Pd-zp5weLU', NULL, NULL, NULL, 0, '2026-05-23 07:37:29', '2026-05-23 07:35:17', '2026-05-23 07:37:29'),
(89, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIxODU2LCJleHAiOjE3ODAxMjY2NTZ9.2X2fkotW8hoxw51aXEWfwcsQqzBdHgjsf3Q9nWzoTJQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjE4NTYsImV4cCI6MTc4MjExMzg1Nn0.0AQpaYjOizr49AeNadSA3qyMuMRvkrXdNEBz8jUAMX8', NULL, NULL, NULL, 0, '2026-05-23 07:40:08', '2026-05-23 07:37:36', '2026-05-23 07:40:08'),
(90, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk1MjIyMjUsImV4cCI6MTc4MDEyNzAyNX0.7t6_A1Fkhed8siX3OSl_WAsojgNz3FQka5xUEG4MmbM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTUyMjIyNSwiZXhwIjoxNzgyMTE0MjI1fQ.9zwyepmYfPazxXUacKPSPAvVp6YV7khHdvXlWa3qaYQ', NULL, NULL, NULL, 0, '2026-05-23 07:44:53', '2026-05-23 07:43:45', '2026-05-23 07:44:53'),
(91, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIyNTc2LCJleHAiOjE3ODAxMjczNzZ9.MI7Tsmua5yLQFsbpMhUbA6u_ZSu7DATo3Jugia4Pj2A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk1MjI1NzYsImV4cCI6MTc4MjExNDU3Nn0.C-LcLQXzYrYYrus1Z8T-ip5Qgmz_y0vdyTrHVffyV7k', NULL, NULL, NULL, 1, '2026-06-22 07:49:36', '2026-05-23 07:49:36', '2026-05-23 07:49:36'),
(92, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIyNTgwLCJleHAiOjE3ODAxMjczODB9.PZOJy3PwtsKFnzIfwLo0QQfMASYC45NvGnp-cXlX70c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjI1ODAsImV4cCI6MTc4MjExNDU4MH0.y0YPJelz1s9rIWj3ExYLfIZJDOBM5MCRSCSC_CSagNc', NULL, NULL, NULL, 0, '2026-05-23 07:53:21', '2026-05-23 07:49:40', '2026-05-23 07:53:21'),
(93, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIzMDk1LCJleHAiOjE3ODAxMjc4OTV9.HZT16KOfthQoiTP9286ur2q9WKKQEPnshKYSV1k7b44', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjMwOTUsImV4cCI6MTc4MjExNTA5NX0.eD0A38i3PDAFLzu3d7aDkTwdCfdnPs8bwSUOUqZdxDk', NULL, NULL, NULL, 0, '2026-05-23 08:08:55', '2026-05-23 07:58:15', '2026-05-23 08:08:55'),
(94, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTIzNTM5LCJleHAiOjE3ODAxMjgzMzl9.nXkRQF5q2Zvz5rS6RFqjK0IimrOpKaLJYSr215m-jjI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3Nzk1MjM1MzksImV4cCI6MTc4MjExNTUzOX0.dqjd0tdBFopvR0XzB5ABzxPJaotu8ae-b6WkOaX3EJU', NULL, NULL, NULL, 0, '2026-05-23 08:05:45', '2026-05-23 08:05:39', '2026-05-23 08:05:45'),
(95, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTIzNjE2LCJleHAiOjE3ODAxMjg0MTZ9.es3gJnPwaO4RF5qH_UN7SW2cYywDKMfLnRjOQ-hnjMY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3Nzk1MjM2MTYsImV4cCI6MTc4MjExNTYxNn0.dEBY7ONqAWiS3b4R2_HvUfpJHvs4syMGwzI2NVsC7hM', NULL, NULL, NULL, 1, '2026-06-22 08:06:56', '2026-05-23 08:06:56', '2026-05-23 08:06:56'),
(96, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIzNzcyLCJleHAiOjE3ODAxMjg1NzJ9.tFsT3PmmkZD7PClyD87sVkBmJFesoRJjQM5MXup1tbU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzk1MjM3NzIsImV4cCI6MTc4MjExNTc3Mn0.5IImwdgc_cKxfM_tr-QX3_POLnjGXYMdX654i8NQtFw', NULL, NULL, NULL, 0, '2026-05-23 08:10:25', '2026-05-23 08:09:32', '2026-05-23 08:10:25'),
(97, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIzODM0LCJleHAiOjE3ODAxMjg2MzR9.FVP01n9pgiT9URaeQ4ZQZ9u-0Ly1cAtshdN6Lc_fiRE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjM4MzQsImV4cCI6MTc4MjExNTgzNH0.yGTq_xNdrL1nmHPLJAYlQZXhW3fDrOuwt6aQZ_2YAno', NULL, NULL, NULL, 0, '2026-05-23 08:13:20', '2026-05-23 08:10:34', '2026-05-23 08:13:20'),
(98, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk1MjQwMTQsImV4cCI6MTc4MDEyODgxNH0.8C8PQ1kqbZjpTgC41Vi9CnXUNHcSSgbGfiMzhBvvZMk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTUyNDAxNCwiZXhwIjoxNzgyMTE2MDE0fQ.EfLTpXw9VmM1o2byWcXb_E6p846NoNWWxuL-_Jkb-vk', NULL, NULL, NULL, 0, '2026-05-23 08:16:34', '2026-05-23 08:13:34', '2026-05-23 08:16:34'),
(99, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI0MjA3LCJleHAiOjE3ODAxMjkwMDd9.mk1PGSIpoMCAV5wIDifAszxfIWDHg_oGme2ihNO9oAE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjQyMDcsImV4cCI6MTc4MjExNjIwN30.iDur_GLG9xakUCuubcrg2zOgCJNMtPjt9wAs4z4ewl8', NULL, NULL, NULL, 0, '2026-05-23 08:30:13', '2026-05-23 08:16:47', '2026-05-23 08:30:13'),
(100, 76, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc2LCJ1c2VyVHlwZSI6InN0YWZmIiwiaWF0IjoxNzc5NTI1MDMxLCJleHAiOjE3ODAxMjk4MzF9.eETa-qyfEBVwCdXzuY4rfK-LAuulfSrq8ADzk-iYPTs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc2LCJpYXQiOjE3Nzk1MjUwMzEsImV4cCI6MTc4MjExNzAzMX0.Ebn1vrE7rM05ukCIQOJlPrW10IcPs--mHC1WkQNyy10', NULL, NULL, NULL, 0, '2026-05-23 08:32:59', '2026-05-23 08:30:31', '2026-05-23 08:32:59'),
(101, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1MTg4LCJleHAiOjE3ODAxMjk5ODh9.ujzsuBAo5jDa23KnL-sjmVJm_KICm5QG4vUj6mh160o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjUxODgsImV4cCI6MTc4MjExNzE4OH0.QHUjEMWbifgDHRJ6iF_p_OyNLedNfGce4tTTvjnS7cY', NULL, NULL, NULL, 1, '2026-06-22 08:33:08', '2026-05-23 08:33:08', '2026-05-23 08:33:08'),
(102, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1NzI0LCJleHAiOjE3ODAxMzA1MjR9.GyBE76a9pMDzloy41R0gm8srg4BF47yg44-LAwGHmUQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3Nzk1MjU3MjQsImV4cCI6MTc4MjExNzcyNH0.gcq1qKXjDV4xppM7_xpWkBIcJBqAA9UsZYZprRu7K4Q', NULL, NULL, NULL, 0, '2026-05-23 08:42:45', '2026-05-23 08:42:04', '2026-05-23 08:42:45'),
(103, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1ODAwLCJleHAiOjE3ODAxMzA2MDB9.eHWFvosgwestptSb4jYfuc-ODH_NvvqpZjAfHE1W2JA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk1MjU4MDAsImV4cCI6MTc4MjExNzgwMH0.653BJTn2IOuUFzCGxuXibUejRmCzXCc9TGkq2bf-iiA', NULL, NULL, NULL, 0, '2026-05-23 08:43:39', '2026-05-23 08:43:20', '2026-05-23 08:43:39'),
(104, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1ODUxLCJleHAiOjE3ODAxMzA2NTF9.ARLQWrQXTOWILaDWUDkT39alGHtt_dwnZ8m76F8iNY0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3Nzk1MjU4NTEsImV4cCI6MTc4MjExNzg1MX0.00_u3sOqoeWRRo64daIzHQjE8Pa0kxmSE3cbJGmxRQU', NULL, NULL, NULL, 0, '2026-05-23 08:44:37', '2026-05-23 08:44:11', '2026-05-23 08:44:37'),
(105, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1ODgyLCJleHAiOjE3ODAxMzA2ODJ9.jzIQxt32jXUcE11kpVQQcu04qfBQDDCX4vvYmrftbSo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk1MjU4ODIsImV4cCI6MTc4MjExNzg4Mn0.kjVyRwLgTFEm3BZpWwcrdHWwK3_O_D0hedqoBB8va7U', NULL, NULL, NULL, 1, '2026-06-22 08:44:42', '2026-05-23 08:44:42', '2026-05-23 08:44:42'),
(106, 77, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTYxODE3LCJleHAiOjE3ODAxNjY2MTd9.5Ldi5RCpnUEf-ritqYmMYzvhIGIenNqakkNku0JqGws', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJpYXQiOjE3Nzk1NjE4MTcsImV4cCI6MTc4MjE1MzgxN30.qQLdYhQFro0AVZKBKBG-eqU7G-X3jZcA6YwwOzPa4Ts', NULL, NULL, NULL, 1, '2026-06-22 18:43:37', '2026-05-23 18:43:37', '2026-05-23 18:43:37'),
(107, 78, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc4LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTY1MjI0LCJleHAiOjE3ODAxNzAwMjR9.I0jhDYBOrmJydUbCmnoMqKE2MEqAI_tq967TnBbblcc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc4LCJpYXQiOjE3Nzk1NjUyMjQsImV4cCI6MTc4MjE1NzIyNH0.YTWfaLN3i-Fu-HWsluPpimI0kxdW5ClTlWAXr4Q9iIE', NULL, NULL, NULL, 1, '2026-06-22 19:40:24', '2026-05-23 19:40:24', '2026-05-23 19:40:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_earnings`
--
ALTER TABLE `admin_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_property_owner_id` (`property_owner_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `admin_earnings_summary`
--
ALTER TABLE `admin_earnings_summary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_year_month` (`year`,`month`),
  ADD KEY `idx_year_month` (`year`,`month`);

--
-- Indexes for table `admin_payouts`
--
ALTER TABLE `admin_payouts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payout_reference` (`payout_reference`),
  ADD KEY `idx_payout_reference` (`payout_reference`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_end_date` (`end_date`);

--
-- Indexes for table `amenities`
--
ALTER TABLE `amenities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table_name` (`table_name`),
  ADD KEY `idx_record_id` (`record_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `idx_booking_reference` (`booking_reference`),
  ADD KEY `idx_guest_id` (`guest_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_check_in_date` (`check_in_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_booking_date` (`booking_date`),
  ADD KEY `hms_room_id` (`hms_room_id`);

--
-- Indexes for table `booking_guests`
--
ALTER TABLE `booking_guests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_is_primary_guest` (`is_primary_guest`);

--
-- Indexes for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_modified_by` (`modified_by`),
  ADD KEY `idx_modification_type` (`modification_type`);

--
-- Indexes for table `cancellation_policies`
--
ALTER TABLE `cancellation_policies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `car_bookings`
--
ALTER TABLE `car_bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `idx_booking_reference` (`booking_reference`),
  ADD KEY `idx_guest_id` (`guest_id`),
  ADD KEY `idx_pickup_date` (`pickup_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_guest` (`guest_id`),
  ADD KEY `idx_host` (`host_id`),
  ADD KEY `idx_property` (`property_id`),
  ADD KEY `idx_last_message` (`last_message_at`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_valid_from` (`valid_from`),
  ADD KEY `idx_valid_until` (`valid_until`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking_coupon` (`booking_id`,`coupon_id`),
  ADD KEY `idx_coupon_id` (`coupon_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `display_categories`
--
ALTER TABLE `display_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_sort_order` (`sort_order`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `display_category_properties`
--
ALTER TABLE `display_category_properties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_property` (`display_category_id`,`property_id`),
  ADD KEY `idx_display_category_id` (`display_category_id`),
  ADD KEY `idx_property_id` (`property_id`);

--
-- Indexes for table `external_calendars`
--
ALTER TABLE `external_calendars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_property_favorite` (`user_id`,`property_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `food_items`
--
ALTER TABLE `food_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_available` (`is_available`);

--
-- Indexes for table `food_orders`
--
ALTER TABLE `food_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_reference` (`order_reference`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_order_reference` (`order_reference`),
  ADD KEY `idx_guest_id` (`guest_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `food_order_items`
--
ALTER TABLE `food_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_food_item_id` (`food_item_id`);

--
-- Indexes for table `hms_accounts_heads`
--
ALTER TABLE `hms_accounts_heads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_accounts_transactions`
--
ALTER TABLE `hms_accounts_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_accounts_vouchers`
--
ALTER TABLE `hms_accounts_vouchers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_allowances`
--
ALTER TABLE `hms_allowances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_attendance`
--
ALTER TABLE `hms_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_attendance` (`employee_id`,`date`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_bills`
--
ALTER TABLE `hms_bills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_deductions`
--
ALTER TABLE `hms_deductions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_departments`
--
ALTER TABLE `hms_departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_designations`
--
ALTER TABLE `hms_designations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_employees`
--
ALTER TABLE `hms_employees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `designation_id` (`designation_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `shift_id` (`shift_id`),
  ADD KEY `host_id` (`host_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_hms_employees_property` (`property_id`);

--
-- Indexes for table `hms_expenses`
--
ALTER TABLE `hms_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `hms_food_items`
--
ALTER TABLE `hms_food_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_food_orders`
--
ALTER TABLE `hms_food_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_food_order_items`
--
ALTER TABLE `hms_food_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `hms_housekeeping`
--
ALTER TABLE `hms_housekeeping`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_packages`
--
ALTER TABLE `hms_packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_payrolls`
--
ALTER TABLE `hms_payrolls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_rooms`
--
ALTER TABLE `hms_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `hms_room_types`
--
ALTER TABLE `hms_room_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hms_rosters`
--
ALTER TABLE `hms_rosters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`date`),
  ADD KEY `shift_id` (`shift_id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_shifts`
--
ALTER TABLE `hms_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_id` (`host_id`);

--
-- Indexes for table `hms_staff`
--
ALTER TABLE `hms_staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `hms_staff_members`
--
ALTER TABLE `hms_staff_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `hms_subscriptions`
--
ALTER TABLE `hms_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_host` (`host_id`),
  ADD KEY `package_id` (`package_id`);

--
-- Indexes for table `member_status_tiers`
--
ALTER TABLE `member_status_tiers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tier_name` (`tier_name`),
  ADD KEY `idx_min_points` (`min_points`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversation` (`conversation_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `messages_backup_1769410022550`
--
ALTER TABLE `messages_backup_1769410022550`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `idx_sender_id` (`sender_id`),
  ADD KEY `idx_receiver_id` (`receiver_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tran_id` (`tran_id`);

--
-- Indexes for table `owner_balances`
--
ALTER TABLE `owner_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_owner` (`property_owner_id`),
  ADD KEY `idx_property_owner_id` (`property_owner_id`),
  ADD KEY `idx_current_balance` (`current_balance`);

--
-- Indexes for table `owner_payouts`
--
ALTER TABLE `owner_payouts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payout_reference` (`payout_reference`),
  ADD KEY `idx_property_owner_id` (`property_owner_id`),
  ADD KEY `idx_payout_reference` (`payout_reference`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_end_date` (`end_date`);

--
-- Indexes for table `owner_payout_items`
--
ALTER TABLE `owner_payout_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payout_id` (`payout_id`),
  ADD KEY `idx_booking_id` (`booking_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `email` (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_reference` (`payment_reference`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_payment_reference` (`payment_reference`),
  ADD KEY `idx_payment_method` (`payment_method`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `payment_settings`
--
ALTER TABLE `payment_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `provider_name` (`provider_name`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_owner_id` (`owner_id`),
  ADD KEY `idx_property_type` (`property_type`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `idx_average_rating` (`average_rating`),
  ADD KEY `idx_location` (`latitude`,`longitude`),
  ADD KEY `idx_properties_display_category` (`display_category_id`),
  ADD KEY `slug` (`slug`);

--
-- Indexes for table `property_amenities`
--
ALTER TABLE `property_amenities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_property_amenity` (`property_id`,`amenity_id`),
  ADD KEY `amenity_id` (`amenity_id`);

--
-- Indexes for table `property_availability`
--
ALTER TABLE `property_availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_property_date` (`property_id`,`date`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_is_available` (`is_available`);

--
-- Indexes for table `property_images`
--
ALTER TABLE `property_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_image_type` (`image_type`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `property_owners`
--
ALTER TABLE `property_owners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_verified` (`is_verified`);

--
-- Indexes for table `property_owner_blocks`
--
ALTER TABLE `property_owner_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `revoked_by` (`revoked_by`),
  ADD KEY `idx_property_owner_id` (`property_owner_id`),
  ADD KEY `idx_blocked_by` (`blocked_by`),
  ADD KEY `idx_block_type` (`block_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `property_owner_payouts`
--
ALTER TABLE `property_owner_payouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property_owner_id` (`property_owner_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_requested_at` (`requested_at`);

--
-- Indexes for table `property_policies`
--
ALTER TABLE `property_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_property_policy` (`property_id`,`cancellation_policy_id`),
  ADD KEY `cancellation_policy_id` (`cancellation_policy_id`);

--
-- Indexes for table `property_reports`
--
ALTER TABLE `property_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `property_rules`
--
ALTER TABLE `property_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_rule_type` (`rule_type`);

--
-- Indexes for table `property_types`
--
ALTER TABLE `property_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_sort_order` (`sort_order`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `refunds`
--
ALTER TABLE `refunds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refund_reference` (`refund_reference`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_payment_id` (`payment_id`),
  ADD KEY `idx_refund_reference` (`refund_reference`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_requested_at` (`requested_at`);

--
-- Indexes for table `refund_service_charges`
--
ALTER TABLE `refund_service_charges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_charge_name` (`charge_name`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_effective_from` (`effective_from`),
  ADD KEY `idx_effective_until` (`effective_until`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking_review` (`booking_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_guest_id` (`guest_id`),
  ADD KEY `idx_property_id` (`property_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `rewards_point_settings`
--
ALTER TABLE `rewards_point_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rewards_point_slots`
--
ALTER TABLE `rewards_point_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_min_amount` (`min_amount`),
  ADD KEY `idx_max_amount` (`max_amount`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `rewards_point_transactions`
--
ALTER TABLE `rewards_point_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_expiry_date` (`expiry_date`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_setting_key` (`setting_key`),
  ADD KEY `idx_is_public` (`is_public`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `host_id` (`host_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `user_blocks`
--
ALTER TABLE `user_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `revoked_by` (`revoked_by`),
  ADD KEY `idx_blocked_user_id` (`blocked_user_id`),
  ADD KEY `idx_blocked_by` (`blocked_by`),
  ADD KEY `idx_block_type` (`block_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `user_rewards_points`
--
ALTER TABLE `user_rewards_points`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_member_tier` (`member_status_tier_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD UNIQUE KEY `refresh_token` (`refresh_token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_session_token` (`session_token`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_earnings`
--
ALTER TABLE `admin_earnings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `admin_earnings_summary`
--
ALTER TABLE `admin_earnings_summary`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_payouts`
--
ALTER TABLE `admin_payouts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=186;

--
-- AUTO_INCREMENT for table `booking_guests`
--
ALTER TABLE `booking_guests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `cancellation_policies`
--
ALTER TABLE `cancellation_policies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `car_bookings`
--
ALTER TABLE `car_bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `display_categories`
--
ALTER TABLE `display_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `display_category_properties`
--
ALTER TABLE `display_category_properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `external_calendars`
--
ALTER TABLE `external_calendars`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `food_items`
--
ALTER TABLE `food_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `food_orders`
--
ALTER TABLE `food_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `food_order_items`
--
ALTER TABLE `food_order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_accounts_heads`
--
ALTER TABLE `hms_accounts_heads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `hms_accounts_transactions`
--
ALTER TABLE `hms_accounts_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `hms_accounts_vouchers`
--
ALTER TABLE `hms_accounts_vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_allowances`
--
ALTER TABLE `hms_allowances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hms_attendance`
--
ALTER TABLE `hms_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hms_bills`
--
ALTER TABLE `hms_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `hms_deductions`
--
ALTER TABLE `hms_deductions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hms_departments`
--
ALTER TABLE `hms_departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hms_designations`
--
ALTER TABLE `hms_designations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hms_employees`
--
ALTER TABLE `hms_employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hms_expenses`
--
ALTER TABLE `hms_expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_food_items`
--
ALTER TABLE `hms_food_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hms_food_orders`
--
ALTER TABLE `hms_food_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `hms_food_order_items`
--
ALTER TABLE `hms_food_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `hms_housekeeping`
--
ALTER TABLE `hms_housekeeping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hms_packages`
--
ALTER TABLE `hms_packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hms_payrolls`
--
ALTER TABLE `hms_payrolls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hms_rooms`
--
ALTER TABLE `hms_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `hms_room_types`
--
ALTER TABLE `hms_room_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_rosters`
--
ALTER TABLE `hms_rosters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `hms_shifts`
--
ALTER TABLE `hms_shifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hms_staff`
--
ALTER TABLE `hms_staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hms_staff_members`
--
ALTER TABLE `hms_staff_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_subscriptions`
--
ALTER TABLE `hms_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `member_status_tiers`
--
ALTER TABLE `member_status_tiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `messages_backup_1769410022550`
--
ALTER TABLE `messages_backup_1769410022550`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `owner_balances`
--
ALTER TABLE `owner_balances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `owner_payouts`
--
ALTER TABLE `owner_payouts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `owner_payout_items`
--
ALTER TABLE `owner_payout_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=252;

--
-- AUTO_INCREMENT for table `payment_settings`
--
ALTER TABLE `payment_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `property_amenities`
--
ALTER TABLE `property_amenities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1481;

--
-- AUTO_INCREMENT for table `property_availability`
--
ALTER TABLE `property_availability`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `property_images`
--
ALTER TABLE `property_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=854;

--
-- AUTO_INCREMENT for table `property_owners`
--
ALTER TABLE `property_owners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `property_owner_blocks`
--
ALTER TABLE `property_owner_blocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property_owner_payouts`
--
ALTER TABLE `property_owner_payouts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property_policies`
--
ALTER TABLE `property_policies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property_reports`
--
ALTER TABLE `property_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `property_rules`
--
ALTER TABLE `property_rules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `property_types`
--
ALTER TABLE `property_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `refunds`
--
ALTER TABLE `refunds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `refund_service_charges`
--
ALTER TABLE `refund_service_charges`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `rewards_point_settings`
--
ALTER TABLE `rewards_point_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rewards_point_slots`
--
ALTER TABLE `rewards_point_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `rewards_point_transactions`
--
ALTER TABLE `rewards_point_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2891;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `user_blocks`
--
ALTER TABLE `user_blocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_rewards_points`
--
ALTER TABLE `user_rewards_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_earnings`
--
ALTER TABLE `admin_earnings`
  ADD CONSTRAINT `admin_earnings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_earnings_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_earnings_ibfk_3` FOREIGN KEY (`property_owner_id`) REFERENCES `property_owners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`hms_room_id`) REFERENCES `hms_rooms` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `booking_guests`
--
ALTER TABLE `booking_guests`
  ADD CONSTRAINT `booking_guests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD CONSTRAINT `booking_modifications_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_modifications_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `car_bookings`
--
ALTER TABLE `car_bookings`
  ADD CONSTRAINT `car_bookings_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD CONSTRAINT `coupon_usage_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `display_category_properties`
--
ALTER TABLE `display_category_properties`
  ADD CONSTRAINT `fk_dcp_display_category` FOREIGN KEY (`display_category_id`) REFERENCES `display_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `external_calendars`
--
ALTER TABLE `external_calendars`
  ADD CONSTRAINT `external_calendars_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `food_items`
--
ALTER TABLE `food_items`
  ADD CONSTRAINT `food_items_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `food_orders`
--
ALTER TABLE `food_orders`
  ADD CONSTRAINT `food_orders_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `food_orders_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `food_orders_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `food_order_items`
--
ALTER TABLE `food_order_items`
  ADD CONSTRAINT `food_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `food_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `food_order_items_ibfk_2` FOREIGN KEY (`food_item_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_attendance`
--
ALTER TABLE `hms_attendance`
  ADD CONSTRAINT `hms_attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hms_employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_employees`
--
ALTER TABLE `hms_employees`
  ADD CONSTRAINT `fk_hms_employees_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`),
  ADD CONSTRAINT `hms_employees_ibfk_1` FOREIGN KEY (`designation_id`) REFERENCES `hms_designations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hms_employees_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `hms_departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hms_employees_ibfk_3` FOREIGN KEY (`shift_id`) REFERENCES `hms_shifts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hms_expenses`
--
ALTER TABLE `hms_expenses`
  ADD CONSTRAINT `hms_expenses_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_food_order_items`
--
ALTER TABLE `hms_food_order_items`
  ADD CONSTRAINT `hms_food_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `hms_food_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_payrolls`
--
ALTER TABLE `hms_payrolls`
  ADD CONSTRAINT `hms_payrolls_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hms_employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_rosters`
--
ALTER TABLE `hms_rosters`
  ADD CONSTRAINT `hms_rosters_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `hms_employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hms_rosters_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `hms_shifts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hms_staff`
--
ALTER TABLE `hms_staff`
  ADD CONSTRAINT `hms_staff_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_subscriptions`
--
ALTER TABLE `hms_subscriptions`
  ADD CONSTRAINT `hms_subscriptions_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `hms_packages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages_backup_1769410022550`
--
ALTER TABLE `messages_backup_1769410022550`
  ADD CONSTRAINT `messages_backup_1769410022550_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_backup_1769410022550_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_backup_1769410022550_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_backup_1769410022550_ibfk_4` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `owner_balances`
--
ALTER TABLE `owner_balances`
  ADD CONSTRAINT `owner_balances_ibfk_1` FOREIGN KEY (`property_owner_id`) REFERENCES `property_owners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `owner_payouts`
--
ALTER TABLE `owner_payouts`
  ADD CONSTRAINT `owner_payouts_ibfk_1` FOREIGN KEY (`property_owner_id`) REFERENCES `property_owners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `owner_payout_items`
--
ALTER TABLE `owner_payout_items`
  ADD CONSTRAINT `owner_payout_items_ibfk_1` FOREIGN KEY (`payout_id`) REFERENCES `owner_payouts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `owner_payout_items_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `fk_properties_display_category` FOREIGN KEY (`display_category_id`) REFERENCES `display_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `property_owners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_amenities`
--
ALTER TABLE `property_amenities`
  ADD CONSTRAINT `property_amenities_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_availability`
--
ALTER TABLE `property_availability`
  ADD CONSTRAINT `property_availability_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_images`
--
ALTER TABLE `property_images`
  ADD CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_owners`
--
ALTER TABLE `property_owners`
  ADD CONSTRAINT `property_owners_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_owner_blocks`
--
ALTER TABLE `property_owner_blocks`
  ADD CONSTRAINT `property_owner_blocks_ibfk_1` FOREIGN KEY (`property_owner_id`) REFERENCES `property_owners` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_owner_blocks_ibfk_2` FOREIGN KEY (`blocked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_owner_blocks_ibfk_3` FOREIGN KEY (`revoked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `property_owner_payouts`
--
ALTER TABLE `property_owner_payouts`
  ADD CONSTRAINT `property_owner_payouts_ibfk_1` FOREIGN KEY (`property_owner_id`) REFERENCES `property_owners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_policies`
--
ALTER TABLE `property_policies`
  ADD CONSTRAINT `property_policies_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_policies_ibfk_2` FOREIGN KEY (`cancellation_policy_id`) REFERENCES `cancellation_policies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_reports`
--
ALTER TABLE `property_reports`
  ADD CONSTRAINT `property_reports_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_reports_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `property_rules`
--
ALTER TABLE `property_rules`
  ADD CONSTRAINT `property_rules_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refunds`
--
ALTER TABLE `refunds`
  ADD CONSTRAINT `refunds_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refunds_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refunds_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD CONSTRAINT `ticket_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_blocks`
--
ALTER TABLE `user_blocks`
  ADD CONSTRAINT `user_blocks_ibfk_1` FOREIGN KEY (`blocked_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_blocks_ibfk_2` FOREIGN KEY (`blocked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_blocks_ibfk_3` FOREIGN KEY (`revoked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
