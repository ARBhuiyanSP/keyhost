-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 01, 2026 at 02:07 AM
-- Server version: 11.4.12-MariaDB-cll-lve
-- PHP Version: 8.4.23

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
(16, 185, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-23 21:29:51', '2026-05-23 21:29:51'),
(17, 186, 74, 28, 4000.00, 10.00, 400.00, 0.00, 0.00, 400.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-24 01:43:16', '2026-05-24 01:43:16'),
(18, 187, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-05-24 05:10:27', NULL, NULL, 'active', '2026-05-24 05:08:39', '2026-05-24 05:10:27'),
(19, 188, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-25 19:10:17', '2026-05-25 19:10:17'),
(20, 189, 69, 27, 2000.00, 10.00, 200.00, 0.00, 0.00, 200.00, 'pending', NULL, NULL, NULL, 'active', '2026-05-25 19:31:37', '2026-05-25 19:31:37'),
(21, 192, 69, 27, 2000.00, 10.00, 200.00, 0.00, 0.00, 200.00, 'paid', '2026-05-26 06:44:31', NULL, NULL, 'active', '2026-05-26 06:42:19', '2026-05-26 06:44:31'),
(22, 194, 70, 27, 12000.00, 10.00, 1200.00, 0.00, 0.00, 1200.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-01 10:34:54', '2026-06-01 10:34:54'),
(23, 195, 70, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-02 20:55:39', '2026-06-02 20:55:39'),
(24, 196, 70, 27, 5000.00, 10.00, 500.00, 0.00, 0.00, 500.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-02 20:59:56', '2026-06-02 20:59:56'),
(25, 197, 80, 27, 55.00, 10.00, 5.50, 0.00, 0.00, 5.50, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 06:09:25', '2026-06-04 06:09:25'),
(26, 198, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 11:49:14', '2026-06-04 11:49:14'),
(27, 199, 68, 27, 4000.00, 10.00, 400.00, 0.00, 0.00, 400.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 12:29:14', '2026-06-04 12:29:14'),
(28, 200, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 12:33:31', '2026-06-04 12:33:31'),
(29, 201, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 12:36:29', '2026-06-04 12:36:29'),
(30, 202, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 13:08:47', '2026-06-04 13:08:47'),
(31, 203, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 13:52:37', '2026-06-04 13:52:37'),
(32, 204, 80, 27, 4.00, 10.00, 0.40, 0.00, 0.00, 0.40, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 14:12:52', '2026-06-04 14:12:52'),
(33, 205, 77, 29, 20.00, 10.00, 2.00, 0.00, 0.00, 2.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 14:31:36', '2026-06-04 14:31:36'),
(34, 206, 77, 29, 20.00, 10.00, 2.00, 0.00, 0.00, 2.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-04 14:32:20', '2026-06-04 14:32:20'),
(35, 207, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-05 06:41:15', '2026-06-05 06:41:15'),
(36, 208, 68, 27, 5200.00, 10.00, 520.00, 0.00, 0.00, 520.00, 'paid', '2026-06-05 10:01:05', NULL, NULL, 'active', '2026-06-05 09:59:44', '2026-06-05 10:01:05'),
(37, 209, 80, 27, 2300.00, 10.00, 230.00, 0.00, 0.00, 230.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-07 15:25:07', '2026-06-07 15:25:07'),
(38, 213, 77, 29, 20.00, 10.00, 1.50, 0.00, 0.00, 1.50, 'pending', NULL, NULL, NULL, 'active', '2026-06-08 09:05:52', '2026-06-08 09:05:52'),
(39, 214, 77, 29, 20.00, 10.00, 1.50, 0.00, 0.00, 1.50, 'pending', NULL, NULL, NULL, 'active', '2026-06-08 09:07:00', '2026-06-08 09:07:00'),
(40, 215, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-08 09:11:13', '2026-06-08 09:11:13'),
(41, 216, 77, 29, 20.00, 10.00, 1.50, 0.00, 0.00, 1.50, 'paid', '2026-06-08 09:12:48', NULL, NULL, 'active', '2026-06-08 09:11:47', '2026-06-08 09:12:48'),
(42, 218, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-08 09:36:39', '2026-06-08 09:36:39'),
(43, 219, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-08 09:38:58', '2026-06-08 09:38:58'),
(44, 220, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-08 09:45:24', '2026-06-08 09:45:24'),
(45, 221, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-08 13:12:52', NULL, NULL, 'active', '2026-06-08 13:08:58', '2026-06-08 13:12:52'),
(46, 246, 77, 29, 813.33, 10.00, 81.33, 0.00, 0.00, 81.33, 'pending', NULL, NULL, NULL, 'active', '2026-06-14 06:55:02', '2026-06-14 06:55:02'),
(47, 248, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-15 08:30:59', '2026-06-15 08:30:59'),
(48, 251, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-16 07:29:18', '2026-06-16 07:29:18'),
(49, 252, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-16 09:04:02', NULL, NULL, 'active', '2026-06-16 09:01:53', '2026-06-16 09:04:02'),
(50, 254, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-17 09:05:30', NULL, NULL, 'active', '2026-06-17 09:02:11', '2026-06-17 09:05:30'),
(51, 256, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-18 12:37:48', NULL, NULL, 'active', '2026-06-18 12:36:28', '2026-06-18 12:37:48'),
(52, 258, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-19 15:12:32', '2026-06-19 15:12:32'),
(53, 259, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-19 21:24:59', NULL, NULL, 'active', '2026-06-19 21:23:57', '2026-06-19 21:24:59'),
(54, 261, 80, 27, 10000.00, 10.00, 1000.00, 0.00, 0.00, 1000.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-20 12:01:35', '2026-06-20 12:01:35'),
(55, 276, 89, 27, 5000.00, 10.00, 500.00, 0.00, 0.00, 500.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-22 05:05:56', '2026-06-22 05:05:56'),
(56, 277, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-22 11:02:19', '2026-06-22 11:02:19'),
(57, 278, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-22 11:31:56', NULL, NULL, 'active', '2026-06-22 11:30:45', '2026-06-22 11:31:56'),
(58, 279, 69, 27, 6000.00, 10.00, 600.00, 0.00, 0.00, 600.00, 'paid', '2026-06-22 18:21:49', NULL, NULL, 'active', '2026-06-22 18:14:26', '2026-06-22 18:21:49'),
(59, 281, 80, 27, 2000.00, 10.00, 200.00, 0.00, 0.00, 200.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-23 05:03:39', '2026-06-23 05:03:39'),
(60, 283, 77, 29, 30.00, 10.00, 3.00, 0.00, 0.00, 3.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-24 08:16:23', '2026-06-24 08:16:23'),
(61, 285, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-25 08:13:10', NULL, NULL, 'active', '2026-06-25 08:09:23', '2026-06-25 08:13:10'),
(62, 287, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-26 10:16:24', NULL, NULL, 'active', '2026-06-26 10:12:27', '2026-06-26 10:16:24'),
(63, 289, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-06-27 05:25:37', NULL, NULL, 'active', '2026-06-27 05:15:57', '2026-06-27 05:25:37'),
(64, 293, 80, 27, 55.00, 10.00, 5.50, 0.00, 0.00, 5.50, 'paid', '2026-06-28 10:21:15', NULL, NULL, 'active', '2026-06-28 10:20:19', '2026-06-28 10:21:15'),
(65, 296, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-30 02:36:31', '2026-06-30 02:36:31'),
(66, 297, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-06-30 19:50:07', '2026-06-30 19:50:07'),
(67, 299, 70, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-01 04:11:36', '2026-07-01 04:11:36'),
(68, 300, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-01 12:31:08', '2026-07-01 12:31:08'),
(69, 301, 80, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-01 16:05:24', '2026-07-01 16:05:24'),
(70, 303, 69, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-07-03 17:11:21', NULL, NULL, 'active', '2026-07-03 17:09:58', '2026-07-03 17:11:21'),
(71, 304, 80, 27, 3000.00, 10.00, 300.00, 0.00, 0.00, 300.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-04 14:06:45', '2026-07-04 14:06:45'),
(72, 305, 76, 28, 3000.00, 10.00, 300.00, 0.00, 0.00, 300.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-06 07:41:56', '2026-07-06 07:41:56'),
(73, 306, 70, 27, 3000.00, 10.00, 300.00, 0.00, 0.00, 300.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-06 07:45:28', '2026-07-06 07:45:28'),
(74, 307, 80, 27, 6000.00, 10.00, 600.00, 0.00, 0.00, 600.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-06 07:54:59', '2026-07-06 07:54:59'),
(75, 315, 75, 28, 24000.00, 10.00, 2400.00, 0.00, 0.00, 2400.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-12 06:25:37', '2026-07-12 06:25:37'),
(76, 318, 80, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'paid', '2026-07-13 10:47:52', NULL, NULL, 'active', '2026-07-13 10:44:01', '2026-07-13 10:47:52'),
(77, 325, 69, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-16 23:42:59', '2026-07-16 23:42:59'),
(78, 327, 80, 27, 12000.00, 10.00, 1200.00, 0.00, 0.00, 1200.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-17 11:40:01', '2026-07-17 11:40:01'),
(79, 328, 80, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-17 17:58:38', '2026-07-17 17:58:38'),
(80, 329, 89, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'paid', '2026-07-18 06:36:58', NULL, NULL, 'active', '2026-07-18 06:31:29', '2026-07-18 06:36:58'),
(81, 330, 70, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'paid', '2026-07-18 16:49:34', NULL, NULL, 'active', '2026-07-18 16:46:23', '2026-07-18 16:49:34'),
(82, 331, 89, 27, 3000.00, 10.00, 300.00, 0.00, 0.00, 300.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-18 18:22:26', '2026-07-18 18:22:26'),
(83, 332, 76, 28, 15000.00, 10.00, 1500.00, 0.00, 0.00, 1500.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-19 13:19:44', '2026-07-19 13:19:44'),
(84, 333, 74, 28, 4000.00, 10.00, 400.00, 0.00, 0.00, 400.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-20 08:56:58', '2026-07-20 08:56:58'),
(85, 334, 69, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-20 09:06:01', '2026-07-20 09:06:01'),
(86, 335, 70, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-20 09:10:49', '2026-07-20 09:10:49'),
(87, 336, 70, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-20 09:16:42', '2026-07-20 09:16:42'),
(88, 337, 70, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-20 09:37:40', '2026-07-20 09:37:40'),
(89, 338, 89, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-07-21 06:45:45', NULL, NULL, 'active', '2026-07-21 06:43:05', '2026-07-21 06:45:45'),
(90, 339, 89, 27, 2500.00, 10.00, 250.00, 0.00, 0.00, 250.00, 'paid', '2026-07-21 06:48:20', NULL, NULL, 'active', '2026-07-21 06:47:22', '2026-07-21 06:48:20'),
(91, 357, 89, 27, 3000.00, 10.00, 300.00, 0.00, 0.00, 300.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-22 13:32:47', '2026-07-22 13:32:47'),
(92, 358, 69, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-22 17:46:58', '2026-07-22 17:46:58'),
(93, 359, 69, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-22 17:48:38', '2026-07-22 17:48:38'),
(94, 367, 101, 42, 1199.00, 10.00, 119.90, 0.00, 0.00, 119.90, 'pending', NULL, NULL, NULL, 'active', '2026-07-25 06:21:04', '2026-07-25 06:21:04'),
(95, 368, 89, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-25 07:45:40', '2026-07-25 07:45:40'),
(96, 370, 89, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'paid', '2026-07-26 05:39:48', NULL, NULL, 'active', '2026-07-26 05:37:43', '2026-07-26 05:39:48'),
(97, 374, 69, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-26 14:08:33', '2026-07-26 14:08:33'),
(98, 375, 89, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'paid', '2026-07-26 14:47:00', NULL, NULL, 'active', '2026-07-26 14:46:17', '2026-07-26 14:47:00'),
(99, 376, 89, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-26 18:48:00', '2026-07-26 18:48:00'),
(100, 382, 80, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-28 09:00:45', '2026-07-28 09:00:45'),
(101, 385, 80, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-28 10:00:40', '2026-07-28 10:00:40'),
(102, 390, 69, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-29 04:49:20', '2026-07-29 04:49:20'),
(103, 394, 70, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-29 16:02:22', '2026-07-29 16:02:22'),
(104, 395, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 09:36:54', '2026-07-30 09:36:54'),
(105, 396, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 09:41:44', '2026-07-30 09:41:44'),
(106, 398, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'paid', '2026-07-30 09:59:32', NULL, NULL, 'active', '2026-07-30 09:58:47', '2026-07-30 09:59:32'),
(107, 399, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'paid', '2026-07-30 10:01:06', NULL, NULL, 'active', '2026-07-30 10:00:22', '2026-07-30 10:01:06'),
(108, 401, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:08:14', '2026-07-30 10:08:14'),
(109, 402, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:09:38', '2026-07-30 10:09:38'),
(110, 403, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:11:09', '2026-07-30 10:11:09'),
(111, 404, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:11:56', '2026-07-30 10:11:56'),
(112, 405, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:12:16', '2026-07-30 10:12:16'),
(113, 406, 75, 28, 3000.00, 10.00, 300.00, 0.00, 0.00, 300.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:14:03', '2026-07-30 10:14:03'),
(114, 407, 80, 27, 3500.00, 10.00, 350.00, 0.00, 0.00, 350.00, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:14:34', '2026-07-30 10:14:34'),
(115, 408, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:16:20', '2026-07-30 10:16:20'),
(116, 409, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:21:07', '2026-07-30 10:21:07'),
(117, 410, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:22:38', '2026-07-30 10:22:38'),
(118, 411, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:23:36', '2026-07-30 10:23:36'),
(119, 412, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:25:58', '2026-07-30 10:25:58'),
(120, 413, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 10:26:22', '2026-07-30 10:26:22'),
(121, 414, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-30 11:32:34', '2026-07-30 11:32:34'),
(122, 419, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-07-31 02:11:41', '2026-07-31 02:11:41'),
(123, 429, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-08-01 05:34:16', '2026-08-01 05:34:16'),
(124, 430, 77, 29, 5.00, 10.00, 0.50, 0.00, 0.00, 0.50, 'pending', NULL, NULL, NULL, 'active', '2026-08-01 05:34:37', '2026-08-01 05:34:37');

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
(6, 'Gym', 'fas fa-dumbbell', 'entertainment', 0, '2025-10-12 19:40:43'),
(7, 'Laundry', 'fas fa-tshirt', 'basic', 1, '2025-10-12 19:40:43'),
(8, 'Balcony', 'fas fa-home', 'outdoor', 1, '2025-10-12 19:40:43'),
(9, 'TV', 'fas fa-tv', 'entertainment', 1, '2025-10-12 19:40:43'),
(10, 'Security', 'fas fa-shield-alt', 'safety', 1, '2025-10-12 19:40:43'),
(11, 'Elevator', 'fas fa-elevator', 'accessibility', 1, '2025-10-12 19:40:43'),
(12, 'Pet Friendly', 'fas fa-paw', 'basic', 0, '2025-10-12 19:40:43'),
(13, 'Breakfast', 'fas fa-coffee', 'basic', 1, '2025-10-12 19:40:43'),
(14, 'Room Service', 'fas fa-concierge-bell', 'basic', 1, '2025-10-12 19:40:43'),
(16, 'Street Parking ', NULL, 'accessibility', 1, '2026-07-01 12:40:10');

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
  `guest_nationality` varchar(100) DEFAULT NULL,
  `guest_nid_number` varchar(50) DEFAULT NULL,
  `guest_passport_number` varchar(50) DEFAULT NULL,
  `guest_nid_document_url` text DEFAULT NULL,
  `guest_passport_document_url` text DEFAULT NULL,
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
  `security_deposit_deduction_amount` decimal(10,2) DEFAULT 0.00,
  `booking_type` enum('short_stay','monthly') NOT NULL DEFAULT 'short_stay',
  `months_count` int(11) DEFAULT NULL,
  `extra_days` int(11) DEFAULT NULL,
  `monthly_rate_used` decimal(12,2) DEFAULT NULL,
  `advance_amount` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_reference`, `guest_id`, `property_id`, `hms_room_id`, `check_in_date`, `check_out_date`, `check_in_time`, `check_out_time`, `number_of_guests`, `number_of_children`, `number_of_infants`, `base_price`, `cleaning_fee`, `security_deposit`, `extra_guest_fee`, `service_fee`, `tax_amount`, `admin_commission_rate`, `admin_commission_amount`, `property_owner_earnings`, `total_amount`, `currency`, `status`, `payment_status`, `payment_method`, `payment_notes`, `payment_link_token`, `special_requests`, `cancellation_reason`, `coupon_code`, `discount_amount`, `booking_source`, `guest_name`, `guest_email`, `guest_phone`, `guest_nationality`, `guest_nid_number`, `guest_passport_number`, `guest_nid_document_url`, `guest_passport_document_url`, `booking_date`, `confirmed_at`, `payment_deadline`, `cancelled_at`, `created_at`, `updated_at`, `points_redeemed`, `points_discount`, `source`, `external_booking_id`, `is_non_refundable`, `security_deposit_status`, `security_deposit_claim_amount`, `security_deposit_claim_reason`, `security_deposit_claim_at`, `security_deposit_deduction_amount`, `booking_type`, `months_count`, `extra_days`, `monthly_rate_used`, `advance_amount`) VALUES
(174, 'KH9358673L1', 64, 77, NULL, '2026-05-19', '2026-05-20', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'undefined undefined', 'atiqur.cumilla@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 07:28:55', '2026-05-17 07:28:55', '2026-05-17 03:48:55', '2026-05-23 05:26:20', '2026-05-17 07:28:55', '2026-05-23 05:26:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(175, 'KH3079281ZA', 64, 77, NULL, '2026-05-27', '2026-05-29', '15:00:00', '11:00:00', 1, 0, 0, 30.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 3.50, 31.50, 35.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'undefined undefined', 'atiqur.cumilla@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 07:35:07', '2026-05-17 07:35:07', '2026-05-17 03:55:07', '2026-05-23 05:26:20', '2026-05-17 07:35:07', '2026-05-23 05:26:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(176, 'KH007535SWG', 64, 75, NULL, '2026-05-18', '2026-05-19', '15:00:00', '11:00:00', 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 240.00, 2160.00, 2400.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'KEY20', 600.00, 'website', 'undefined undefined', 'atiqur.cumilla@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 08:53:27', '2026-05-17 08:53:27', '2026-05-17 05:13:27', '2026-05-23 05:26:21', '2026-05-17 08:53:27', '2026-05-23 05:26:21', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(177, 'KH278157YLG', 68, 80, NULL, '2026-05-17', '2026-05-18', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'Key20', 500.00, 'website', 'undefined undefined', 'noredef70@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 10:21:18', '2026-05-17 10:21:18', '2026-05-17 06:41:18', '2026-05-23 05:26:21', '2026-05-17 10:21:18', '2026-05-23 05:26:21', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(178, 'KH18090428I', 69, 70, NULL, '2026-05-17', '2026-05-18', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'KEY20', 500.00, 'website', 'undefined undefined', 'adnansami229atbd@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 10:36:20', '2026-05-17 10:36:20', '2026-05-17 06:56:20', '2026-05-23 05:26:21', '2026-05-17 10:36:20', '2026-05-23 05:26:21', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(179, 'KH0459351YO', 68, 80, NULL, '2026-05-18', '2026-05-19', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, 'Key20', 500.00, 'website', 'undefined undefined', 'noredef70@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 11:24:05', '2026-05-17 11:25:10', '2026-05-17 07:44:05', NULL, '2026-05-17 11:24:05', '2026-05-17 11:25:10', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(180, 'KH884077QN3', 71, 70, NULL, '2026-05-23', '2026-05-24', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'undefined undefined', 'smjoy619@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-17 19:41:24', '2026-05-17 19:43:16', '2026-05-17 16:01:24', NULL, '2026-05-17 19:41:24', '2026-05-17 19:43:16', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(181, 'KH874673NXB', 56, 74, NULL, '2026-05-22', '2026-06-15', '15:00:00', '11:00:00', 1, 0, 0, 96000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 9600.00, 86400.00, 96000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'undefined undefined', 'titubiniamin@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-19 09:27:54', '2026-05-19 09:27:54', '2026-05-19 05:47:54', '2026-05-23 05:26:22', '2026-05-19 09:27:54', '2026-05-23 05:26:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(182, 'KH1119484O6', 75, 77, NULL, '2026-05-26', '2026-05-27', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', NULL, NULL, NULL, NULL, NULL, '2026-05-23 05:28:31', '2026-05-23 05:28:31', '2026-05-23 01:48:31', '2026-05-23 05:49:20', '2026-05-23 05:28:31', '2026-05-23 05:49:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(183, 'KH983306HXP', 50, 77, NULL, '2026-06-09', '2026-06-10', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'paid', 'sslcommerz', NULL, NULL, NULL, 'Test', NULL, 0.00, 'website', 'Md. Imtiaz Hanif', 'sakil.imtiaz@gmail.com', '01774853552504', NULL, NULL, NULL, NULL, NULL, '2026-05-23 08:13:03', '2026-05-23 08:14:14', '2026-05-23 04:15:03', '2026-05-23 08:48:26', '2026-05-23 08:13:03', '2026-05-23 08:48:26', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(184, 'KH76638005Z', 77, 80, NULL, '2026-05-24', '2026-05-25', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Ashiqur Rahman vevo', 'asifboycocgame@gmail.com', 'G-1779561817279', NULL, NULL, NULL, NULL, NULL, '2026-05-23 19:32:46', '2026-05-23 19:32:46', '2026-05-23 15:34:46', '2026-05-23 19:34:58', '2026-05-23 19:32:46', '2026-05-23 19:34:58', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(185, 'KH79100661V', 77, 69, NULL, '2026-05-24', '2026-05-25', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Ashiqur Rahman', 'asifboycocgame@gmail.com', 'G-1779561817279', NULL, NULL, NULL, NULL, NULL, '2026-05-23 21:29:51', '2026-05-23 21:29:51', '2026-05-23 17:31:51', '2026-05-23 21:32:42', '2026-05-23 21:29:51', '2026-05-23 21:32:42', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(186, 'KH995998LA0', 59, 74, NULL, '2026-05-25', '2026-05-26', '15:00:00', '11:00:00', 1, 0, 0, 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 400.00, 3600.00, 4000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-05-24 01:43:16', '2026-05-24 01:43:15', '2026-05-23 21:45:15', '2026-05-24 01:45:58', '2026-05-24 01:43:16', '2026-05-24 01:45:58', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(187, 'KH319476Z4G', 77, 69, NULL, '2026-05-24', '2026-05-25', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Ashiqur Rahman', 'asifboycocgame@gmail.com', 'G-1779561817279', NULL, NULL, NULL, NULL, NULL, '2026-05-24 05:08:39', '2026-05-24 05:10:31', '2026-05-24 01:10:39', NULL, '2026-05-24 05:08:39', '2026-05-24 05:10:31', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(188, 'KH217343PEW', 80, 69, NULL, '2026-05-26', '2026-05-27', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Ashraf Ayon', 'ashrafayon64@gmail.com', 'G-1779709548945', NULL, NULL, NULL, NULL, NULL, '2026-05-25 19:10:17', '2026-05-25 19:10:17', '2026-05-25 15:12:17', '2026-05-25 19:12:38', '2026-05-25 19:10:17', '2026-05-25 19:12:38', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(189, 'KH497585LRU', 80, 69, NULL, '2026-05-26', '2026-05-27', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'KEY20', 500.00, 'website', 'Ashraf Ayon', 'ashrafayon64@gmail.com', 'G-1779709548945', NULL, NULL, NULL, NULL, NULL, '2026-05-25 19:31:37', '2026-05-25 19:31:37', '2026-05-25 15:33:37', '2026-05-25 19:33:38', '2026-05-25 19:31:37', '2026-05-25 19:33:38', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(190, 'HMS-1779774379329-55', NULL, 88, 16, '2026-05-25', '2026-05-26', NULL, NULL, 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, 6000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'John Doe', '', '+8801712345678', NULL, NULL, NULL, NULL, NULL, '2026-05-26 05:46:19', NULL, NULL, NULL, '2026-05-26 05:46:19', '2026-05-26 05:47:52', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(191, 'HMS-1779775571204-19', NULL, 88, 17, '2026-05-25', '2026-05-26', NULL, NULL, 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, 6000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Test Guest', '', '01700000000', NULL, NULL, NULL, NULL, NULL, '2026-05-26 06:06:11', NULL, NULL, NULL, '2026-05-26 06:06:11', '2026-05-26 06:06:55', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(192, 'KH739725NY6', 80, 69, 14, '2026-05-26', '2026-05-27', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, 'KEY20', 500.00, 'website', 'Ashraf Ayon', 'ashrafayon64@gmail.com', 'G-1779709548945', NULL, NULL, NULL, NULL, NULL, '2026-05-26 06:42:19', '2026-05-26 06:44:35', '2026-05-26 02:44:19', NULL, '2026-05-26 06:42:19', '2026-05-26 06:44:35', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(193, 'EXT-C5A9E07C', NULL, 68, NULL, '2026-05-28', '2026-05-29', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-30 08:52:20', NULL, NULL, NULL, '2026-05-30 08:52:20', '2026-05-30 08:52:20', 0, 0.00, 'Airbnb', '7f662ec65913-03427e3d55387c4b4b6e210c9db21226@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(194, 'KH094511WSG', 83, 70, 13, '2026-06-02', '2026-06-07', '15:00:00', '11:00:00', 2, 0, 0, 12500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 1200.00, 10800.00, 12000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 500.00, 'website', 'Sabit Bhai', 'sabitbhai9@gmail.com', 'G-1780310008840', NULL, NULL, NULL, NULL, NULL, '2026-06-01 10:34:54', '2026-06-01 10:34:54', '2026-06-01 06:36:54', '2026-06-01 10:37:48', '2026-06-01 10:34:54', '2026-06-01 10:37:48', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(195, 'KH739134FSS', 85, 70, 13, '2026-06-04', '2026-06-05', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Suman Goswami', 'sumanch5795@gmail.com', 'G-1780433711854', NULL, NULL, NULL, NULL, NULL, '2026-06-02 20:55:39', '2026-06-02 20:55:39', '2026-06-02 16:57:39', '2026-06-02 20:58:35', '2026-06-02 20:55:39', '2026-06-02 20:58:35', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(196, 'KH996313X0A', 85, 70, 13, '2026-06-04', '2026-06-06', '15:00:00', '11:00:00', 2, 0, 0, 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 500.00, 4500.00, 5000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Check in time 5-6 pm', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Suman Goswami', 'sumanch5795@gmail.com', 'G-1780433711854', NULL, NULL, NULL, NULL, NULL, '2026-06-02 20:59:56', '2026-06-02 20:59:56', '2026-06-02 17:01:56', '2026-06-02 21:02:35', '2026-06-02 20:59:56', '2026-06-02 21:02:35', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(197, 'KH3651023GZ', 88, 80, NULL, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 2, 0, 0, 55.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 5.50, 49.50, 55.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Please provide towel and oven', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Mostafa Al hasan', 'mostafaalhasan96@gmail.com', '01839108819', NULL, NULL, NULL, NULL, NULL, '2026-06-04 06:09:25', '2026-06-04 06:09:25', '2026-06-04 02:11:25', '2026-06-04 06:11:27', '2026-06-04 06:09:25', '2026-06-04 06:11:27', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(198, 'KH7549699J4', 88, 80, NULL, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Mostafa Al hasan', 'mostafaalhasan96@gmail.com', '01839108819', NULL, NULL, NULL, NULL, NULL, '2026-06-04 11:49:14', '2026-06-04 11:49:14', '2026-06-04 07:51:14', '2026-06-04 11:51:33', '2026-06-04 11:49:14', '2026-06-04 11:51:33', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(199, 'KH154224934', 91, 68, NULL, '2026-06-04', '2026-06-05', '15:00:00', '11:00:00', 3, 0, 0, 6000.00, 0.00, 0.00, 1000.00, 0.00, 0.00, 10.00, 400.00, 3600.00, 4000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 3000.00, 'website', 'Iftakhar Foysal', 'iftakhar.foysal.if@gmail.com', '01810145451', NULL, NULL, NULL, NULL, NULL, '2026-06-04 12:29:14', '2026-06-04 12:29:14', '2026-06-04 08:31:14', '2026-06-04 12:31:33', '2026-06-04 12:29:14', '2026-06-04 12:31:33', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(200, 'KH4118327H3', 88, 80, NULL, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Towel,oven', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Mostafa Al hasan', 'mostafaalhasan96@gmail.com', '01839108819', NULL, NULL, NULL, NULL, NULL, '2026-06-04 12:33:31', '2026-06-04 12:33:31', '2026-06-04 08:35:31', '2026-06-04 12:35:33', '2026-06-04 12:33:31', '2026-06-04 12:35:33', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(201, 'KH589317XG2', 88, 80, NULL, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Mostafa Al hasan', 'mostafaalhasan96@gmail.com', '01839108819', NULL, NULL, NULL, NULL, NULL, '2026-06-04 12:36:29', '2026-06-04 12:36:29', '2026-06-04 08:38:29', '2026-06-04 12:38:33', '2026-06-04 12:36:29', '2026-06-04 12:38:33', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(202, 'KH527383V1B', 92, 80, NULL, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Muna Azim', 'munaazim999@gmail.com', '01687308285', NULL, NULL, NULL, NULL, NULL, '2026-06-04 13:08:47', '2026-06-04 13:08:47', '2026-06-04 09:10:47', '2026-06-04 13:11:34', '2026-06-04 13:08:47', '2026-06-04 13:11:34', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(203, 'KH157323FIX', 92, 80, NULL, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Towel and oven facilities ', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Muna Azim', 'munaazim999@gmail.com', '01687308285', NULL, NULL, NULL, NULL, NULL, '2026-06-04 13:52:37', '2026-06-04 13:52:37', '2026-06-04 09:54:37', '2026-06-04 13:55:34', '2026-06-04 13:52:37', '2026-06-04 13:55:34', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(204, 'KH3726524FB', 93, 80, NULL, '2026-07-16', '2026-07-17', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.40, 3.60, 4.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'KEY20', 2496.00, 'website', 'Wazeer Ali', 'wajedbro@gmail.com', 'G-1780582341828', NULL, NULL, NULL, NULL, NULL, '2026-06-04 14:12:52', '2026-06-04 14:12:52', '2026-06-04 10:14:52', '2026-06-04 14:14:59', '2026-06-04 14:12:52', '2026-06-04 14:14:59', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(205, 'KH496750OR6', 89, 77, 7, '2026-06-05', '2026-06-06', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-06-04 14:31:36', '2026-06-04 14:31:36', '2026-06-04 10:33:36', '2026-06-04 14:33:59', '2026-06-04 14:31:36', '2026-06-04 14:33:59', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(206, 'KH540499ZJT', 89, 77, 7, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 2.00, 18.00, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-06-04 14:32:20', '2026-06-04 14:32:20', '2026-06-04 10:34:20', '2026-06-04 14:34:59', '2026-06-04 14:32:20', '2026-06-04 14:34:59', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(207, 'KH675712AF7', 94, 69, 14, '2026-06-06', '2026-06-07', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Will check in at morning 6 am.', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Junayed Rayan', 'junayedrayan4@gmail.com', 'G-1780641377223', NULL, NULL, NULL, NULL, NULL, '2026-06-05 06:41:15', '2026-06-05 06:41:15', '2026-06-05 02:43:15', '2026-06-05 06:43:35', '2026-06-05 06:41:15', '2026-06-05 06:43:35', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(208, 'KH584193ANZ', 68, 68, NULL, '2026-06-05', '2026-06-06', '15:00:00', '11:00:00', 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 520.00, 4680.00, 5200.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 800.00, 'website', 'Nore Def', 'noredef70@gmail.com', '01779013252961', NULL, NULL, NULL, NULL, NULL, '2026-06-05 09:59:44', '2026-06-05 10:01:09', '2026-06-05 06:01:44', NULL, '2026-06-05 09:59:44', '2026-06-05 10:01:09', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(209, 'KH9076665DV', 95, 80, NULL, '2026-06-08', '2026-06-09', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 230.00, 2070.00, 2300.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 1 minute(s) — booking automatically cancelled', NULL, 200.00, 'website', 'Bangali Vau', 'bangalivau16@gmail.com', 'G-1780845303432', NULL, NULL, NULL, NULL, NULL, '2026-06-07 15:25:07', NULL, NULL, '2026-06-07 15:28:55', '2026-06-07 15:25:07', '2026-06-07 15:28:55', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(210, 'HMS-1780902089727-49', NULL, 78, 1, '2026-06-08', '2026-06-10', NULL, NULL, 1, 0, 0, 20.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 20.00, 20.00, 'BDT', 'confirmed', 'pending', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'test', '', '017285485125', NULL, NULL, NULL, NULL, NULL, '2026-06-08 07:01:29', NULL, NULL, NULL, '2026-06-08 07:01:29', '2026-06-08 07:01:29', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(211, 'HMS-1780902117394-99', NULL, 89, 21, '2026-06-02', '2026-06-03', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Mumu', '', '019040015230', NULL, NULL, NULL, NULL, NULL, '2026-06-08 07:01:57', NULL, NULL, NULL, '2026-06-08 07:01:57', '2026-06-09 15:46:42', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(212, 'HMS-1780904006670-13', NULL, 89, 25, '2026-06-08', '2026-06-09', NULL, NULL, 1, 0, 0, 2300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2300.00, 2300.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Adel jawad', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-08 07:33:26', NULL, NULL, NULL, '2026-06-08 07:33:26', '2026-06-09 16:46:46', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(213, 'KH552424MUS', 89, 77, 7, '2026-06-08', '2026-06-09', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 1.50, 13.50, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Cancelled by property owner', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:05:52', NULL, NULL, '2026-06-08 09:06:36', '2026-06-08 09:05:52', '2026-06-08 09:06:36', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(214, 'KH620700EA3', 89, 77, 7, '2026-06-08', '2026-06-09', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 1.50, 13.50, 20.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:07:00', '2026-06-08 09:07:00', '2026-06-08 05:09:00', '2026-06-08 09:09:46', '2026-06-08 09:07:00', '2026-06-08 09:09:46', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(215, 'KH873099JUJ', 75, 80, NULL, '2026-06-09', '2026-06-10', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 1 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:11:13', NULL, NULL, '2026-06-08 09:15:45', '2026-06-08 09:11:13', '2026-06-08 09:15:45', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(216, 'KH907377JAW', 75, 77, 7, '2026-06-09', '2026-06-10', '15:00:00', '11:00:00', 1, 0, 0, 15.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 1.50, 13.50, 20.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:11:47', '2026-06-08 10:21:56', '2026-06-08 05:13:47', NULL, '2026-06-08 09:11:47', '2026-06-09 08:49:57', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(217, 'EXT-C42AA957', NULL, 70, NULL, '2026-06-08', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:30:00', NULL, NULL, NULL, '2026-06-08 09:30:00', '2026-06-08 09:30:00', 0, 0.00, 'Airbnb', '7f662ec65913-edf671eecdc5c69d3fe803f39a81c8a3@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(218, 'KH399759VRL', 96, 69, NULL, '2026-06-11', '2026-06-12', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 1 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'Kamruddin Ashrafi Nafi', 'realashrafi@gmail.com', 'G-1780911236388', NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:36:39', NULL, NULL, '2026-06-08 09:40:45', '2026-06-08 09:36:39', '2026-06-08 09:40:45', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(219, 'KH538307HVZ', 96, 69, NULL, '2026-06-11', '2026-06-12', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 1 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'Kamruddin Ashrafi Nafi', 'realashrafi@gmail.com', '01627977966', NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:38:58', NULL, NULL, '2026-06-08 09:40:46', '2026-06-08 09:38:58', '2026-06-08 09:40:46', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(220, 'KH9249773ZN', 96, 69, NULL, '2026-06-11', '2026-06-12', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Kindly make sure the room is clean.', 'Host did not respond within 1 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'Kamruddin Ashrafi Nafi', 'realashrafi@gmail.com', '01627977966', NULL, NULL, NULL, NULL, NULL, '2026-06-08 09:45:24', NULL, NULL, '2026-06-08 09:50:45', '2026-06-08 09:45:24', '2026-06-08 09:50:45', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(221, 'KH138195BQB', 97, 80, NULL, '2026-06-08', '2026-06-09', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Purple Shade', 'purpleshade824@gmail.com', 'G-1780924120215', NULL, NULL, NULL, NULL, NULL, '2026-06-08 13:08:58', '2026-06-08 13:12:57', '2026-06-08 09:39:49', NULL, '2026-06-08 13:08:58', '2026-06-08 13:12:57', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(222, 'HMS-1780929141705-96', NULL, 89, 25, '2026-06-08', '2026-06-09', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Sultan Iqbal', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-08 14:32:21', NULL, NULL, NULL, '2026-06-08 14:32:21', '2026-06-09 16:44:21', 0, 0.00, 'Booking.com', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(223, 'HMS-1780994648854-35', NULL, 89, 25, '2026-06-09', '2026-06-10', NULL, NULL, 1, 0, 0, 2200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2200.00, 2200.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Sayed Ahmed Sparsho', '', '01728452826', NULL, NULL, NULL, NULL, NULL, '2026-06-09 08:44:08', NULL, NULL, NULL, '2026-06-09 08:44:08', '2026-06-09 16:44:24', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(224, 'HMS-1781023342209-81', NULL, 89, 21, '2026-06-03', '2026-06-04', NULL, NULL, 1, 0, 0, 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000.00, 5000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Toufiqur Rahman', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:42:22', NULL, NULL, NULL, '2026-06-09 16:42:22', '2026-06-10 16:06:58', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(225, 'HMS-1781023397306-61', NULL, 89, 21, '2026-06-04', '2026-06-05', NULL, NULL, 1, 0, 0, 3999.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3999.00, 3999.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'iftakhar Alam', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:43:17', NULL, NULL, NULL, '2026-06-09 16:43:17', '2026-06-10 16:17:00', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(226, 'HMS-1781023444363-60', NULL, 89, 21, '2026-06-06', '2026-06-07', NULL, NULL, 1, 0, 0, 2000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2000.00, 2000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Salem', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:44:04', NULL, NULL, NULL, '2026-06-09 16:44:04', '2026-06-10 16:16:05', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(227, 'HMS-1781023771677-16', NULL, 89, 25, '2026-06-02', '2026-06-03', NULL, NULL, 1, 0, 0, 2800.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2800.00, 2800.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Saidul Bhuyan', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:49:31', NULL, NULL, NULL, '2026-06-09 16:49:31', '2026-06-10 16:16:15', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(228, 'HMS-1781023823563-45', NULL, 89, 25, '2026-06-03', '2026-06-05', NULL, NULL, 1, 0, 0, 5200.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5200.00, 5200.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Tarek prodhan', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:50:23', NULL, NULL, NULL, '2026-06-09 16:50:23', '2026-06-10 16:18:08', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(229, 'HMS-1781023877122-44', NULL, 89, 25, '2026-06-05', '2026-06-08', NULL, NULL, 1, 0, 0, 7500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 7500.00, 7500.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Jaber Al Mijan', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:51:17', NULL, NULL, NULL, '2026-06-09 16:51:17', '2026-06-10 16:18:17', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(230, 'HMS-1781023933896-98', NULL, 89, 23, '2026-06-03', '2026-06-04', NULL, NULL, 1, 0, 0, 2000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2000.00, 2000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Ashiqur Rahman', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:52:13', NULL, NULL, NULL, '2026-06-09 16:52:13', '2026-06-10 16:18:24', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(231, 'HMS-1781023978829-80', NULL, 89, 23, '2026-06-04', '2026-06-05', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Abid Mahmud', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:52:58', NULL, NULL, NULL, '2026-06-09 16:52:58', '2026-06-10 16:19:01', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(232, 'HMS-1781024040328-68', NULL, 89, 23, '2026-06-05', '2026-06-08', NULL, NULL, 1, 0, 0, 6500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6500.00, 6500.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Rafin Islam', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:54:00', NULL, NULL, NULL, '2026-06-09 16:54:00', '2026-06-10 16:19:10', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(233, 'HMS-1781024080448-22', NULL, 89, 23, '2026-06-08', '2026-06-10', NULL, NULL, 1, 0, 0, 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4000.00, 4000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Rafin Islam', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:54:40', NULL, NULL, NULL, '2026-06-09 16:54:40', '2026-06-10 16:19:23', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(234, 'HMS-1781024130183-17', NULL, 89, 23, '2026-06-10', '2026-06-14', NULL, NULL, 1, 0, 0, 8000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 8000.00, 8000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Sumon Ahmed', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:55:30', NULL, NULL, NULL, '2026-06-09 16:55:30', '2026-06-21 15:03:04', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(235, 'HMS-1781024196388-89', NULL, 89, 22, '2026-06-03', '2026-06-04', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'sabit', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:56:36', NULL, NULL, NULL, '2026-06-09 16:56:36', '2026-06-10 16:22:37', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(236, 'HMS-1781024236863-95', NULL, 89, 22, '2026-06-04', '2026-06-06', NULL, NULL, 1, 0, 0, 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000.00, 5000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Sumon Goswami', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:57:16', NULL, NULL, NULL, '2026-06-09 16:57:16', '2026-06-10 16:22:44', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(237, 'HMS-1781024272805-58', NULL, 89, 22, '2026-06-06', '2026-06-07', NULL, NULL, 1, 0, 0, 2000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2000.00, 2000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Mostofa', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:57:52', NULL, NULL, NULL, '2026-06-09 16:57:52', '2026-06-10 16:22:49', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(238, 'HMS-1781024322739-57', NULL, 89, 22, '2026-06-07', '2026-07-01', NULL, NULL, 1, 0, 0, 36000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 36000.00, 36000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Tahmid Wasif ', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-09 16:58:42', NULL, NULL, NULL, '2026-06-09 16:58:42', '2026-06-21 15:22:49', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(239, 'HMS-1781106688168-39', NULL, 89, 25, '2026-06-10', '2026-06-12', NULL, NULL, 1, 0, 0, 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4000.00, 4000.00, 'BDT', 'checked_out', 'paid', 'cash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Sanaullah Rashid', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-10 15:51:28', NULL, NULL, NULL, '2026-06-10 15:51:28', '2026-06-12 09:11:09', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(240, 'EXT-A0F040A9', NULL, 70, NULL, '2026-06-09', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-11 00:15:00', NULL, NULL, NULL, '2026-06-11 00:15:00', '2026-06-11 00:15:00', 0, 0.00, 'Airbnb', '7f662ec65913-942468ef45d6f3cd2262bc9fed3fd284@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(241, 'EXT-86B4F8EF', NULL, 70, NULL, '2026-06-10', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-12 00:00:00', NULL, NULL, NULL, '2026-06-12 00:00:00', '2026-06-12 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-f111472708409b2ae9d74ab9d6c63a17@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(242, 'HMS-1781255524670-15', NULL, 89, 25, '2026-06-12', '2026-06-14', NULL, NULL, 1, 0, 0, 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4000.00, 4000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Sanaullah Rashid', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-12 09:12:04', NULL, NULL, NULL, '2026-06-12 09:12:04', '2026-06-21 15:24:03', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(243, 'EXT-81365A8A', NULL, 70, NULL, '2026-06-11', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-13 00:00:00', NULL, NULL, NULL, '2026-06-13 00:00:00', '2026-06-13 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-c91d7c5e3d736ae7408728060966a159@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(244, 'EXT-734C1200', NULL, 69, NULL, '2026-06-13', '2026-06-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-13 12:30:00', NULL, NULL, NULL, '2026-06-13 12:30:00', '2026-06-13 12:30:00', 0, 0.00, 'Airbnb', '7f662ec65913-e903d257b387d0e04453e9c25bc0675f@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(245, 'EXT-72E96A2C', NULL, 70, NULL, '2026-06-12', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-14 00:00:00', NULL, NULL, NULL, '2026-06-14 00:00:00', '2026-06-14 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-b60518d70930c98f34b97cb687144d4c@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(246, 'KH102269MXA', 89, 77, 7, '2026-06-14', '2026-08-14', '15:00:00', '11:00:00', 1, 0, 0, 400.00, 0.00, 50.00, 0.00, 0.00, 0.00, 10.00, 81.33, 732.00, 863.33, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-06-14 06:55:02', '2026-06-14 06:55:02', '2026-06-14 03:25:02', '2026-06-14 07:25:38', '2026-06-14 06:55:02', '2026-06-14 07:25:38', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'monthly', 2, 1, 400.00, 50.00),
(247, 'EXT-40A105F6', NULL, 70, NULL, '2026-06-13', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-15 00:00:00', NULL, NULL, NULL, '2026-06-15 00:00:00', '2026-06-15 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-e903d257b387d0e04453e9c25bc0675f@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(248, 'KH259611HLO', 69, 69, NULL, '2026-06-15', '2026-06-16', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'adnan sami', 'adnansami229atbd@gmail.com', '01779014136358', NULL, NULL, NULL, NULL, NULL, '2026-06-15 08:30:59', '2026-06-15 08:30:59', '2026-06-15 05:00:59', '2026-06-15 09:01:26', '2026-06-15 08:30:59', '2026-06-15 09:01:26', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(249, 'EXT-1A680239', NULL, 70, NULL, '2026-06-14', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-16 00:00:00', NULL, NULL, NULL, '2026-06-16 00:00:00', '2026-06-16 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-ef73b805ce869451587a3ddd59b09db5@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(250, 'EXT-0A19C7D4', NULL, 69, NULL, '2026-06-14', '2026-06-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-16 00:00:00', NULL, NULL, NULL, '2026-06-16 00:00:00', '2026-06-16 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-ef73b805ce869451587a3ddd59b09db5@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(251, 'KH958282ZQL', 99, 69, NULL, '2026-06-17', '2026-06-18', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Please, share me the exact location and the host contact number ', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Martin Bawm', 'martinbawm0007@gmail.com', 'G-1781593022234', NULL, NULL, NULL, NULL, NULL, '2026-06-16 07:29:18', '2026-06-16 07:29:18', '2026-06-16 03:59:18', '2026-06-16 07:59:59', '2026-06-16 07:29:18', '2026-06-16 07:59:59', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(252, 'KH513637BUO', 100, 69, NULL, '2026-06-17', '2026-06-18', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, 'Share the location and the host contact number ', NULL, NULL, 0.00, 'website', 'martinluther bawm', 'martinlutherbawm98@gmail.com', 'G-1781600451623', NULL, NULL, NULL, NULL, NULL, '2026-06-16 09:01:53', '2026-06-16 09:04:07', '2026-06-16 05:31:53', NULL, '2026-06-16 09:01:53', '2026-06-16 09:04:07', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(253, 'EXT-8BAB22F3', NULL, 70, NULL, '2026-06-15', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-17 00:15:00', NULL, NULL, NULL, '2026-06-17 00:15:00', '2026-06-17 00:15:00', 0, 0.00, 'Airbnb', '7f662ec65913-32dfbd0b53b1f229f7b357dea1a49d3d@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(254, 'KH931833H0Q', 102, 80, NULL, '2026-06-17', '2026-06-18', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Rafeu TPM', 'rafeu.it@gmail.com', 'G-1781686878170', NULL, NULL, NULL, NULL, NULL, '2026-06-17 09:02:11', '2026-06-17 09:05:35', '2026-06-17 05:32:11', NULL, '2026-06-17 09:02:11', '2026-06-17 09:05:35', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(255, 'EXT-F35433AC', NULL, 70, NULL, '2026-06-16', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-18 00:00:00', NULL, NULL, NULL, '2026-06-18 00:00:00', '2026-06-18 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-f00c125bd8e10e6ae40bdb4b36959346@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(256, 'KH18882487B', 105, 80, NULL, '2026-06-19', '2026-06-20', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-06-18 12:36:28', '2026-06-18 12:37:52', '2026-06-18 09:06:28', NULL, '2026-06-18 12:36:28', '2026-06-20 04:55:42', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(257, 'EXT-5A51096A', NULL, 70, NULL, '2026-06-17', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-19 00:00:00', NULL, NULL, NULL, '2026-06-19 00:00:00', '2026-06-19 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-5eafbd903142e6cde7e449b7361e5771@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(258, 'KH9524043YD', 102, 80, NULL, '2026-06-20', '2026-06-21', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Rafeu TPM', 'rafeu.it@gmail.com', 'G-1781686878170', NULL, NULL, NULL, NULL, NULL, '2026-06-19 15:12:32', '2026-06-19 15:12:32', '2026-06-19 11:42:32', '2026-06-19 15:43:26', '2026-06-19 15:12:32', '2026-06-19 15:43:26', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL);
INSERT INTO `bookings` (`id`, `booking_reference`, `guest_id`, `property_id`, `hms_room_id`, `check_in_date`, `check_out_date`, `check_in_time`, `check_out_time`, `number_of_guests`, `number_of_children`, `number_of_infants`, `base_price`, `cleaning_fee`, `security_deposit`, `extra_guest_fee`, `service_fee`, `tax_amount`, `admin_commission_rate`, `admin_commission_amount`, `property_owner_earnings`, `total_amount`, `currency`, `status`, `payment_status`, `payment_method`, `payment_notes`, `payment_link_token`, `special_requests`, `cancellation_reason`, `coupon_code`, `discount_amount`, `booking_source`, `guest_name`, `guest_email`, `guest_phone`, `guest_nationality`, `guest_nid_number`, `guest_passport_number`, `guest_nid_document_url`, `guest_passport_document_url`, `booking_date`, `confirmed_at`, `payment_deadline`, `cancelled_at`, `created_at`, `updated_at`, `points_redeemed`, `points_discount`, `source`, `external_booking_id`, `is_non_refundable`, `security_deposit_status`, `security_deposit_claim_amount`, `security_deposit_claim_reason`, `security_deposit_claim_at`, `security_deposit_deduction_amount`, `booking_type`, `months_count`, `extra_days`, `monthly_rate_used`, `advance_amount`) VALUES
(259, 'KH2378601C8', 105, 80, NULL, '2026-06-20', '2026-06-21', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-06-19 21:23:57', '2026-06-19 21:25:06', '2026-06-19 17:53:57', NULL, '2026-06-19 21:23:57', '2026-06-20 04:55:24', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(260, 'EXT-B112BC9A', NULL, 70, NULL, '2026-06-18', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-20 00:00:00', NULL, NULL, NULL, '2026-06-20 00:00:00', '2026-06-20 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-688939fd8631be206d650d7bbf8abb0b@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(261, 'KH895796BUD', 107, 80, NULL, '2026-06-21', '2026-06-25', '15:00:00', '11:00:00', 1, 0, 0, 10000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 1000.00, 9000.00, 10000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, 'Testing booking request flow. Please ignore. 😊🚀 ১২৩৪৫৬. This is a special request field to test how the system handles Bangla Unicode, emojis, long text, and special characters such as <, >, \' \" ; -- etc. Thank you!', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Test User', 'testbooking@example.com', '01712345679', NULL, NULL, NULL, NULL, NULL, '2026-06-20 12:01:35', '2026-06-20 12:01:35', '2026-06-20 08:31:35', '2026-06-20 12:32:20', '2026-06-20 12:01:35', '2026-06-20 12:32:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(262, 'EXT-601E692D', NULL, 70, NULL, '2026-06-19', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-21 00:00:00', NULL, NULL, NULL, '2026-06-21 00:00:00', '2026-06-21 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-0ecc729a80fec9ea7f73fd09a99647a5@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(263, 'HMS-1782052498969-51', NULL, 89, 23, '2026-06-14', '2026-06-15', NULL, NULL, 1, 0, 0, 2000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2000.00, 2000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Sumon Ahmad', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:34:58', NULL, NULL, NULL, '2026-06-21 14:34:58', '2026-06-22 05:55:47', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(264, 'HMS-1782052552534-34', NULL, 89, 23, '2026-06-15', '2026-06-16', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Mr. Adnan', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:35:52', NULL, NULL, NULL, '2026-06-21 14:35:52', '2026-06-22 05:55:39', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(265, 'HMS-1782052623746-94', NULL, 89, 23, '2026-06-16', '2026-06-17', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Fatema Akter', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:37:03', NULL, NULL, NULL, '2026-06-21 14:37:03', '2026-06-22 05:55:56', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(266, 'HMS-1782052662972-28', NULL, 89, 23, '2026-06-17', '2026-06-18', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Martin Brown', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:37:42', NULL, NULL, NULL, '2026-06-21 14:37:42', '2026-06-22 05:56:04', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(267, 'HMS-1782052763122-29', NULL, 89, 23, '2026-06-18', '2026-06-27', NULL, NULL, 1, 0, 0, 22500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 22500.00, 22500.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Ilas Khan', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:39:23', NULL, NULL, NULL, '2026-06-21 14:39:23', '2026-06-27 14:19:31', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(268, 'HMS-1782053292038-47', NULL, 89, 25, '2026-06-14', '2026-06-17', NULL, NULL, 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, 6000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Rafin Islam', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:48:12', NULL, NULL, NULL, '2026-06-21 14:48:12', '2026-06-22 05:55:25', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(269, 'HMS-1782053509081-76', NULL, 89, 25, '2026-06-17', '2026-06-18', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Rafeu Riyan', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:51:49', NULL, NULL, NULL, '2026-06-21 14:51:49', '2026-06-22 05:54:59', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(270, 'HMS-1782053566897-35', NULL, 89, 25, '2026-06-19', '2026-06-21', NULL, NULL, 1, 0, 0, 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000.00, 5000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Sheikh Jaber Al Meezan', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:52:46', NULL, NULL, NULL, '2026-06-21 14:52:46', '2026-06-22 05:54:48', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(271, 'HMS-1782053834737-27', NULL, 89, 21, '2026-06-14', '2026-06-15', NULL, NULL, 1, 0, 0, 2000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2000.00, 2000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Sayek Ahmed', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:57:14', NULL, NULL, NULL, '2026-06-21 14:57:14', '2026-06-22 05:54:32', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(272, 'HMS-1782053919911-71', NULL, 89, 21, '2026-06-20', '2026-07-01', NULL, NULL, 1, 0, 0, 19800.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 19800.00, 19800.00, 'BDT', 'checked_in', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'SAM', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:58:39', NULL, NULL, NULL, '2026-06-21 14:58:39', '2026-07-22 07:19:13', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(273, 'HMS-1782053982280-44', NULL, 89, 26, '2026-06-19', '2026-06-21', NULL, NULL, 1, 0, 0, 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 4000.00, 4000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Argnya Roy Usnno', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 14:59:42', NULL, NULL, NULL, '2026-06-21 14:59:42', '2026-06-21 15:30:56', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(274, 'HMS-1782054054340-67', NULL, 89, 27, '2026-06-19', '2026-07-01', NULL, NULL, 1, 0, 0, 25000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 25000.00, 25000.00, 'BDT', 'checked_out', 'paid', 'cash', 'Received in Bkash', NULL, '', NULL, NULL, 0.00, 'admin', 'Anjuman Ara', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-21 15:00:54', NULL, NULL, NULL, '2026-06-21 15:00:54', '2026-06-24 07:55:18', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(275, 'EXT-8FAD1740', NULL, 70, NULL, '2026-06-20', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-22 00:00:00', NULL, NULL, NULL, '2026-06-22 00:00:00', '2026-06-22 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-7d732347662e5420dd0a5cb498fa32f7@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(276, 'KH756355IS0', 59, 89, 23, '2026-07-27', '2026-07-28', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 500.00, 2500.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, '99be2bc1cabba48c0f98302afb05a55ee76eccb20d1488b4bee135b4736155f4', '', 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'adnan Sami ', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-06-22 05:05:56', '2026-06-22 05:07:57', '2026-06-22 01:37:57', '2026-06-22 05:38:17', '2026-06-22 05:05:56', '2026-06-27 14:23:26', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(277, 'KH1398433NP', 109, 80, NULL, '2026-06-27', '2026-06-28', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Tarik Ibrahim', 'tarikibrahim777@gmail.com', '+8801674526850', NULL, NULL, NULL, NULL, NULL, '2026-06-22 11:02:19', '2026-06-22 11:02:19', '2026-06-22 07:32:19', '2026-06-22 11:32:38', '2026-06-22 11:02:19', '2026-06-22 11:32:38', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(278, 'KH8459014WE', 105, 80, NULL, '2026-06-22', '2026-06-23', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-06-22 11:30:45', '2026-06-22 11:32:03', '2026-06-22 08:00:45', NULL, '2026-06-22 11:30:45', '2026-06-24 07:55:10', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(279, 'KH066179O9C', 111, 69, NULL, '2026-06-24', '2026-06-27', '15:00:00', '11:00:00', 2, 0, 0, 7500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 600.00, 5400.00, 6000.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 1500.00, 'website', 'Sayed Malek', 'm.sayed.malak@gmail.com', '1774307483', NULL, NULL, NULL, NULL, NULL, '2026-06-22 18:14:26', '2026-06-22 18:21:49', '2026-06-22 14:44:26', NULL, '2026-06-22 18:14:26', '2026-06-24 08:18:56', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(280, 'EXT-3F886CE7', NULL, 70, NULL, '2026-06-21', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-23 00:00:00', NULL, NULL, NULL, '2026-06-23 00:00:00', '2026-06-23 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-adc4571cffcd8399ea0813f8e87cb723@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(281, 'KH019788LC3', 80, 80, NULL, '2026-06-24', '2026-06-25', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 200.00, 1800.00, 2000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', 'KEY20', 500.00, 'website', 'Ashraf Ayon', 'ashrafayon64@gmail.com', 'G-1779709548945', NULL, NULL, NULL, NULL, NULL, '2026-06-23 05:03:39', '2026-06-23 05:03:39', '2026-06-23 01:33:39', '2026-06-23 05:37:37', '2026-06-23 05:03:39', '2026-06-23 05:37:37', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(282, 'EXT-93016A97', NULL, 70, NULL, '2026-06-22', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-24 00:00:00', NULL, NULL, NULL, '2026-06-24 00:00:00', '2026-06-24 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-b2e7ffb392c00de1d9f4b2048f2de806@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(283, 'KH983893ZCB', 89, 77, NULL, '2026-06-24', '2026-06-26', '15:00:00', '11:00:00', 1, 0, 0, 30.00, 0.00, 5.00, 0.00, 0.00, 0.00, 10.00, 3.00, 27.00, 35.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-06-24 08:16:23', '2026-06-24 08:16:23', '2026-06-24 04:46:23', '2026-06-24 08:55:00', '2026-06-24 08:16:23', '2026-06-24 08:55:00', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(284, 'EXT-09818E00', NULL, 70, NULL, '2026-06-23', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-25 00:00:00', NULL, NULL, NULL, '2026-06-25 00:00:00', '2026-06-25 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-bef3dd0066332d1434f2e5e8c2628790@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(285, 'KH963745FDJ', 113, 80, NULL, '2026-06-26', '2026-06-27', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Sadia Haque', 'sadia.haque1817@gmail.com', 'G-1782374940151', NULL, NULL, NULL, NULL, NULL, '2026-06-25 08:09:23', '2026-06-25 08:13:14', '2026-06-25 04:39:23', NULL, '2026-06-25 08:09:23', '2026-06-25 08:13:14', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(286, 'EXT-A3C44309', NULL, 70, NULL, '2026-06-24', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-26 00:00:00', NULL, NULL, NULL, '2026-06-26 00:00:00', '2026-06-26 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-03fbce00745f7e7e857117fb16da743d@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(287, 'KH747516HFH', 115, 69, 14, '2026-06-28', '2026-06-29', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Marzuk Ahmed', 'marzukahmed06@gmail.com', 'G-1782468725394', NULL, NULL, NULL, NULL, NULL, '2026-06-26 10:12:27', '2026-06-26 10:16:28', '2026-06-26 06:42:27', NULL, '2026-06-26 10:12:27', '2026-06-28 15:12:35', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(288, 'EXT-FD53023D', NULL, 70, NULL, '2026-06-25', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-27 00:00:00', NULL, NULL, NULL, '2026-06-27 00:00:00', '2026-06-27 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-55ca54c3d697df230528fca42f1f3b29@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(289, 'KH357416UEW', 69, 69, 14, '2026-06-27', '2026-06-28', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'adnan sami', 'adnansami229atbd@gmail.com', '01779014136358', NULL, NULL, NULL, NULL, NULL, '2026-06-27 05:15:57', '2026-06-27 05:25:41', '2026-06-27 01:45:57', NULL, '2026-06-27 05:15:57', '2026-06-27 05:25:41', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(290, 'HMS-1782570386486-47', NULL, 89, 23, '2026-06-27', '2026-06-28', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'cash', '24.com', NULL, '', NULL, NULL, 0.00, 'admin', 'adnan Sami', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-27 14:26:26', NULL, NULL, NULL, '2026-06-27 14:26:26', '2026-07-25 13:37:33', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(291, 'HMS-1782570650368-94', NULL, 89, 23, '2026-06-28', '2026-06-29', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'confirmed', 'pending', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Marzuk Ahmed', '', '', NULL, NULL, NULL, NULL, NULL, '2026-06-27 14:30:50', NULL, NULL, NULL, '2026-06-27 14:30:50', '2026-06-27 14:30:50', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(292, 'EXT-EE73E290', NULL, 70, NULL, '2026-06-26', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-28 00:00:00', NULL, NULL, NULL, '2026-06-28 00:00:00', '2026-06-28 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-5d6cfa4b3363bcc40833b77fff31999d@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(293, 'KH019354TAG', 105, 80, NULL, '2026-06-28', '2026-06-29', '15:00:00', '11:00:00', 1, 0, 0, 55.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 5.50, 49.50, 55.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-06-28 10:20:19', '2026-06-28 10:21:21', '2026-06-28 06:50:19', NULL, '2026-06-28 10:20:19', '2026-06-28 10:21:21', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(294, 'EXT-38ECE9D2', NULL, 70, NULL, '2026-06-27', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-29 00:00:00', NULL, NULL, NULL, '2026-06-29 00:00:00', '2026-06-29 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-44560e5d52666a6d114ea03ff2d9b713@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(295, 'EXT-438545C5', NULL, 70, NULL, '2026-06-28', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-30 00:00:00', NULL, NULL, NULL, '2026-06-30 00:00:00', '2026-06-30 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-4ed33bb7879e570f5f3300ad603a35b8@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(296, 'KH9910608EX', 119, 69, 14, '2026-07-02', '2026-07-03', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Ashek Mustafiz', 'asd_rah2007@yahoo.com', '01718128450', NULL, NULL, NULL, NULL, NULL, '2026-06-30 02:36:31', '2026-06-30 02:36:31', '2026-06-29 23:06:31', '2026-06-30 03:07:09', '2026-06-30 02:36:31', '2026-06-30 03:07:09', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(297, 'KH007438044', 105, 80, 28, '2026-07-03', '2026-07-04', '15:00:00', '11:00:00', 4, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-06-30 19:50:07', '2026-06-30 19:50:07', '2026-06-30 16:20:07', '2026-06-30 20:20:12', '2026-06-30 19:50:07', '2026-06-30 20:20:12', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(298, 'EXT-9D7B4143', NULL, 70, NULL, '2026-06-29', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-01 00:00:00', NULL, NULL, NULL, '2026-07-01 00:00:00', '2026-07-01 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-531c8886ce93b245166a7a334f9b3c38@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(299, 'KH096738SSZ', 123, 70, 13, '2026-07-01', '2026-07-02', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Abdul Hoque', 'abdulhoque949@gmail.com', 'G-1782879020416', NULL, NULL, NULL, NULL, NULL, '2026-07-01 04:11:36', '2026-07-01 04:11:36', '2026-07-01 00:41:36', '2026-07-01 04:41:47', '2026-07-01 04:11:36', '2026-07-01 04:41:47', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(300, 'KH068185828', 126, 69, 14, '2026-07-02', '2026-07-03', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Md Moshadul haque', 'shadafnell@gmail.com', '01712377318', NULL, NULL, NULL, NULL, NULL, '2026-07-01 12:31:08', '2026-07-01 12:31:08', '2026-07-01 09:01:08', '2026-07-01 13:01:22', '2026-07-01 12:31:08', '2026-07-01 13:01:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(301, 'KH9249032GL', 105, 80, 28, '2026-07-03', '2026-07-04', '15:00:00', '11:00:00', 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-07-01 16:05:24', '2026-07-01 16:05:24', '2026-07-01 12:35:24', '2026-07-01 16:36:20', '2026-07-01 16:05:24', '2026-07-01 16:36:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(302, 'EXT-EF1297A9', NULL, 70, NULL, '2026-06-30', '2026-07-01', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-02 00:00:00', NULL, NULL, NULL, '2026-07-02 00:00:00', '2026-07-02 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-06791fde6345849b7dd688ce8e8a79e6@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(303, 'KH598690RHN', 136, 69, 14, '2026-07-03', '2026-07-04', '15:00:00', '11:00:00', 2, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Faraz Rahman', 'farazrahmanworks@gmail.com', 'G-1783098590139', NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:09:58', '2026-07-03 17:11:24', '2026-07-03 13:39:58', NULL, '2026-07-03 17:09:58', '2026-07-03 17:11:24', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(304, 'KH0054791F0', 140, 80, 28, '2026-07-04', '2026-07-05', '15:00:00', '11:00:00', 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 300.00, 2700.00, 3000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Rakibul Bashar', 'rakibul.eee.200105160@aust.edu', 'G-1783173981608', NULL, NULL, NULL, NULL, NULL, '2026-07-04 14:06:45', '2026-07-04 14:06:45', '2026-07-04 10:36:45', '2026-07-04 14:36:52', '2026-07-04 14:06:45', '2026-07-04 14:36:52', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(305, 'KH716181MX5', 59, 76, NULL, '2026-07-06', '2026-07-07', '15:00:00', '11:00:00', 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 300.00, 2700.00, 3000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 30 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-06 07:41:56', NULL, NULL, '2026-07-06 08:16:12', '2026-07-06 07:41:56', '2026-07-06 08:16:12', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(306, 'KH928812O86', 89, 70, 13, '2026-07-06', '2026-07-07', '15:00:00', '11:00:00', 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 300.00, 2700.00, 3000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-07-06 07:45:28', '2026-07-06 07:45:28', '2026-07-06 04:15:28', '2026-07-06 08:16:12', '2026-07-06 07:45:28', '2026-07-06 08:16:12', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(307, 'KH499235ECZ', 146, 80, 28, '2026-07-06', '2026-07-08', '15:00:00', '11:00:00', 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 600.00, 5400.00, 6000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'mijanur rahman', 'mijanurrahman504@gmail.com', 'G-1783324471138', NULL, NULL, NULL, NULL, NULL, '2026-07-06 07:54:59', '2026-07-06 07:54:59', '2026-07-06 04:24:59', '2026-07-06 08:25:12', '2026-07-06 07:54:59', '2026-07-06 08:25:12', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(308, 'EXT-26734D6D', NULL, 70, NULL, '2026-07-09', '2026-07-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-09 15:00:00', NULL, NULL, NULL, '2026-07-09 15:00:00', '2026-07-09 15:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-94f4bb99a4ef4d4eba82b021a5534f9a@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(309, 'EXT-0DA679F4', NULL, 69, NULL, '2026-07-09', '2026-07-11', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-09 15:00:00', NULL, NULL, NULL, '2026-07-09 15:00:00', '2026-07-09 15:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-94f4bb99a4ef4d4eba82b021a5534f9a@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(310, 'EXT-50CCC0BE', NULL, 69, NULL, '2026-07-12', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-09 15:00:00', NULL, NULL, NULL, '2026-07-09 15:00:00', '2026-07-09 15:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-14158d45727526145ef514139eeb669e@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(311, 'EXT-3D4FE2A2', NULL, 68, NULL, '2026-07-09', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-09 15:00:00', NULL, NULL, NULL, '2026-07-09 15:00:00', '2026-07-09 15:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-94f4bb99a4ef4d4eba82b021a5534f9a@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(312, 'EXT-0E620A17', NULL, 70, NULL, '2026-07-10', '2026-07-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-12 00:00:00', NULL, NULL, NULL, '2026-07-12 00:00:00', '2026-07-12 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-a62a523cc487878e60d46d74888f630e@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(313, 'EXT-1BFEAA0B', NULL, 69, NULL, '2026-07-10', '2026-07-11', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-12 00:00:00', NULL, NULL, NULL, '2026-07-12 00:00:00', '2026-07-12 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-a62a523cc487878e60d46d74888f630e@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(314, 'EXT-C7E5A846', NULL, 68, NULL, '2026-07-10', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-12 00:00:01', NULL, NULL, NULL, '2026-07-12 00:00:01', '2026-07-12 00:00:01', 0, 0.00, 'Airbnb', '7f662ec65913-a62a523cc487878e60d46d74888f630e@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(315, 'KH537762ZGQ', 151, 75, NULL, '2026-07-21', '2026-07-29', '15:00:00', '11:00:00', 1, 0, 0, 24000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 2400.00, 21600.00, 24000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 30 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'Habiba Shahadat', 'habiba.shahadat@sslcommerz.com', 'G-1783837518471', NULL, NULL, NULL, NULL, NULL, '2026-07-12 06:25:37', NULL, NULL, '2026-07-12 06:55:43', '2026-07-12 06:25:37', '2026-07-12 06:55:43', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(316, 'EXT-C3051505', NULL, 70, NULL, '2026-07-11', '2026-07-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-13 00:00:00', NULL, NULL, NULL, '2026-07-13 00:00:00', '2026-07-13 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-bbd7583a3450b1e03259b837a7580620@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(317, 'EXT-9D7ED7A7', NULL, 68, NULL, '2026-07-11', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-13 00:00:01', NULL, NULL, NULL, '2026-07-13 00:00:01', '2026-07-13 00:00:01', 0, 0.00, 'Airbnb', '7f662ec65913-bbd7583a3450b1e03259b837a7580620@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(318, 'KH44145227C', 154, 80, 28, '2026-07-16', '2026-07-17', '15:00:00', '11:00:00', 3, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, 'Do your best hospitality ', NULL, NULL, 0.00, 'website', 'Email Number', 'emailnumber726@gmail.com', 'G-1783939343460', NULL, NULL, NULL, NULL, NULL, '2026-07-13 10:44:01', '2026-07-13 10:47:56', '2026-07-13 07:14:01', NULL, '2026-07-13 10:44:01', '2026-07-13 10:47:56', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(319, 'EXT-DBE42048', NULL, 70, NULL, '2026-07-12', '2026-07-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-14 00:00:00', NULL, NULL, NULL, '2026-07-14 00:00:00', '2026-07-14 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-14158d45727526145ef514139eeb669e@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(320, 'EXT-7C47E950', NULL, 68, NULL, '2026-07-12', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-14 00:00:00', NULL, NULL, NULL, '2026-07-14 00:00:00', '2026-07-14 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-14158d45727526145ef514139eeb669e@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(321, 'EXT-BE2787D4', NULL, 70, NULL, '2026-07-13', '2026-07-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-15 00:00:00', NULL, NULL, NULL, '2026-07-15 00:00:00', '2026-07-15 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-ef03f9f1ff8e5238ed8eff4753b66276@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(322, 'EXT-987D1A89', NULL, 68, NULL, '2026-07-13', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-15 00:00:01', NULL, NULL, NULL, '2026-07-15 00:00:01', '2026-07-15 00:00:01', 0, 0.00, 'Airbnb', '7f662ec65913-ef03f9f1ff8e5238ed8eff4753b66276@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(323, 'EXT-9F9CFB93', NULL, 70, NULL, '2026-07-14', '2026-07-15', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-16 00:00:00', NULL, NULL, NULL, '2026-07-16 00:00:00', '2026-07-16 00:00:00', 0, 0.00, 'Airbnb', '7f662ec65913-64a91eb31fd101f1a729c45efa29619a@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(324, 'EXT-E07E79EF', NULL, 68, NULL, '2026-07-14', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-16 00:00:01', NULL, NULL, NULL, '2026-07-16 00:00:01', '2026-07-16 00:00:01', 0, 0.00, 'Airbnb', '7f662ec65913-64a91eb31fd101f1a729c45efa29619a@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(325, 'KH3791524PA', 157, 69, 14, '2026-07-17', '2026-07-18', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Mohammad Shams', 'mohdshamskhan02@gmail.com', '019 9939 1626', NULL, NULL, NULL, NULL, NULL, '2026-07-16 23:42:59', '2026-07-16 23:42:59', '2026-07-16 20:12:59', '2026-07-17 00:13:33', '2026-07-16 23:42:59', '2026-07-17 00:13:33', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(326, 'EXT-618F59A9', NULL, 68, NULL, '2026-07-15', '2026-07-16', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Airbnb (Not available)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-17 00:00:01', NULL, NULL, NULL, '2026-07-17 00:00:01', '2026-07-17 00:00:01', 0, 0.00, 'Airbnb', '7f662ec65913-bcf8ad2890c14f2cddfc15092f576e5f@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(327, 'KH4011639MZ', 154, 80, 28, '2026-07-17', '2026-07-21', '15:00:00', '11:00:00', 1, 0, 0, 14000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 1200.00, 10800.00, 12000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 2000.00, 'website', 'Email Number', 'emailnumber726@gmail.com', 'G-1783939343460', NULL, NULL, NULL, NULL, NULL, '2026-07-17 11:40:01', '2026-07-17 11:40:01', '2026-07-17 08:10:01', '2026-07-17 12:10:36', '2026-07-17 11:40:01', '2026-07-17 12:10:36', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(328, 'KH118112PSP', 158, 80, 28, '2026-07-19', '2026-07-20', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'New Phone', 'new105475@gmail.com', 'G-1784311101899', NULL, NULL, NULL, NULL, NULL, '2026-07-17 17:58:38', '2026-07-17 17:58:38', '2026-07-17 14:28:38', '2026-07-17 18:29:23', '2026-07-17 17:58:38', '2026-07-17 18:29:23', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(329, 'KH289751WO1', 159, 89, 21, '2026-07-18', '2026-07-19', '15:00:00', '11:00:00', 2, 0, 0, 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 1500.00, 'website', 'towheed hossain', 'towheed.hossain@gmail.com', 'G-1784356034826', NULL, NULL, NULL, NULL, NULL, '2026-07-18 06:31:29', '2026-07-18 06:37:02', '2026-07-18 03:03:45', NULL, '2026-07-18 06:31:29', '2026-07-22 07:15:46', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(330, 'KH183125MSY', 160, 70, 13, '2026-07-19', '2026-07-20', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Pran Rahman', 'pranrahman96@gmail.com', 'G-1784393153026', NULL, NULL, NULL, NULL, NULL, '2026-07-18 16:46:23', '2026-07-18 16:49:37', '2026-07-18 13:16:23', NULL, '2026-07-18 16:46:23', '2026-07-18 16:49:37', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(331, 'KH946547KNC', 105, 89, 22, '2026-07-19', '2026-07-20', '15:00:00', '11:00:00', 2, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 300.00, 2700.00, 3000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 30 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-07-18 18:22:26', NULL, NULL, '2026-07-18 18:55:20', '2026-07-18 18:22:26', '2026-07-18 18:55:20', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(332, 'KH184474B73', 162, 76, NULL, '2026-07-20', '2026-07-25', '15:00:00', '11:00:00', 4, 0, 0, 15000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 1500.00, 13500.00, 15000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Central ', NULL, 0.00, 'website', 'Md Khan', 'md4612122@gmail.com', 'G-1784467166411', NULL, NULL, NULL, NULL, NULL, '2026-07-19 13:19:44', NULL, NULL, '2026-07-19 13:22:17', '2026-07-19 13:19:44', '2026-07-19 13:22:17', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(333, 'KH8185933SZ', 59, 74, NULL, '2026-07-21', '2026-07-22', '15:00:00', '11:00:00', 1, 0, 0, 4000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 400.00, 3600.00, 4000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 30 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-20 08:56:58', NULL, NULL, '2026-07-20 09:29:58', '2026-07-20 08:56:58', '2026-07-20 09:29:58', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(334, 'KH361933XCH', 59, 69, 14, '2026-07-20', '2026-07-21', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-20 09:06:01', '2026-07-20 09:06:01', '2026-07-20 05:36:01', '2026-07-20 09:36:58', '2026-07-20 09:06:01', '2026-07-20 09:36:58', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(335, 'KH6495510HO', 59, 70, 13, '2026-07-20', '2026-07-21', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-20 09:10:49', '2026-07-20 09:10:49', '2026-07-20 05:40:49', '2026-07-20 09:40:58', '2026-07-20 09:10:49', '2026-07-20 09:40:58', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(336, 'KH0025826NJ', 59, 70, 13, '2026-07-21', '2026-07-22', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-20 09:16:42', '2026-07-20 09:16:42', '2026-07-20 05:46:42', '2026-07-20 09:46:58', '2026-07-20 09:16:42', '2026-07-20 09:46:58', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(337, 'KH260782QU3', 59, 70, 13, '2026-07-22', '2026-07-23', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-20 09:37:40', '2026-07-20 09:37:40', '2026-07-20 06:07:40', '2026-07-20 10:07:59', '2026-07-20 09:37:40', '2026-07-20 10:07:59', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(338, 'KH185436OY8', 146, 89, 26, '2026-07-21', '2026-07-22', '15:00:00', '11:00:00', 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 500.00, 'website', 'mijanur rahman', 'mijanurrahman504@gmail.com', 'G-1783324471138', NULL, NULL, NULL, NULL, NULL, '2026-07-21 06:43:05', '2026-07-21 06:45:49', '2026-07-21 03:14:26', NULL, '2026-07-21 06:43:05', '2026-07-22 07:04:04', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(339, 'KH442749WVI', 146, 89, 27, '2026-07-21', '2026-07-22', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 250.00, 2250.00, 2500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 1000.00, 'website', 'mijanur rahman', 'mijanurrahman504@gmail.com', 'G-1783324471138', NULL, NULL, NULL, NULL, NULL, '2026-07-21 06:47:22', '2026-07-21 06:48:24', '2026-07-21 03:17:22', NULL, '2026-07-21 06:47:22', '2026-07-22 07:04:00', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(340, 'HMS-1784619890916-32', NULL, 89, 21, '2026-07-19', '2026-07-20', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Towheed Hossain', '', '+8801718136090', NULL, NULL, NULL, NULL, NULL, '2026-07-21 07:44:50', NULL, NULL, NULL, '2026-07-21 07:44:50', '2026-07-21 10:20:35', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(341, 'HMS-1784620115271-13', NULL, 89, 22, '2026-07-19', '2026-07-20', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Md. Tawfiqur Rahman', '', '+8801783710486', NULL, NULL, NULL, NULL, NULL, '2026-07-21 07:48:35', NULL, NULL, NULL, '2026-07-21 07:48:35', '2026-07-21 10:55:28', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(342, 'EXT-1167E3E0', NULL, 70, NULL, '2026-07-21', '2026-07-23', NULL, NULL, 1, 0, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 'BDT', 'confirmed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'Reserved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-21 08:00:00', NULL, NULL, NULL, '2026-07-21 08:00:00', '2026-07-21 08:00:00', 0, 0.00, 'Airbnb', '1418fb94e984-255ccd51d22a285d1da166375f7ae48e@airbnb.com', 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(343, 'HMS-1784620859239-45', NULL, 89, 23, '2026-07-14', '2026-07-20', NULL, NULL, 1, 0, 0, 18000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 18000.00, 18000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Sumon Ahmed', '', '+8801614243236', NULL, NULL, NULL, NULL, NULL, '2026-07-21 08:00:59', NULL, NULL, NULL, '2026-07-21 08:00:59', '2026-07-21 08:01:11', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(344, 'HMS-1784627569354-71', NULL, 89, 25, '2026-07-16', '2026-07-21', NULL, NULL, 1, 0, 0, 15500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 15500.00, 15500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Sultan Mahmud Chowdhury', '', '+8801973133929', NULL, NULL, NULL, NULL, NULL, '2026-07-21 09:52:49', NULL, NULL, NULL, '2026-07-21 09:52:49', '2026-07-21 09:53:01', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL);
INSERT INTO `bookings` (`id`, `booking_reference`, `guest_id`, `property_id`, `hms_room_id`, `check_in_date`, `check_out_date`, `check_in_time`, `check_out_time`, `number_of_guests`, `number_of_children`, `number_of_infants`, `base_price`, `cleaning_fee`, `security_deposit`, `extra_guest_fee`, `service_fee`, `tax_amount`, `admin_commission_rate`, `admin_commission_amount`, `property_owner_earnings`, `total_amount`, `currency`, `status`, `payment_status`, `payment_method`, `payment_notes`, `payment_link_token`, `special_requests`, `cancellation_reason`, `coupon_code`, `discount_amount`, `booking_source`, `guest_name`, `guest_email`, `guest_phone`, `guest_nationality`, `guest_nid_number`, `guest_passport_number`, `guest_nid_document_url`, `guest_passport_document_url`, `booking_date`, `confirmed_at`, `payment_deadline`, `cancelled_at`, `created_at`, `updated_at`, `points_redeemed`, `points_discount`, `source`, `external_booking_id`, `is_non_refundable`, `security_deposit_status`, `security_deposit_claim_amount`, `security_deposit_claim_reason`, `security_deposit_claim_at`, `security_deposit_deduction_amount`, `booking_type`, `months_count`, `extra_days`, `monthly_rate_used`, `advance_amount`) VALUES
(345, 'HMS-1784629463624-94', NULL, 89, 27, '2026-07-17', '2026-07-18', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Md Shariar Mahbub Joy', '', '+8801716009518', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:24:23', NULL, NULL, NULL, '2026-07-21 10:24:23', '2026-07-21 10:24:37', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(346, 'HMS-1784629558880-35', NULL, 89, 27, '2026-07-16', '2026-07-16', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Md. Rifat Jahan Rabbi', '', '+8801320768844', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:25:58', NULL, NULL, NULL, '2026-07-21 10:25:58', '2026-07-21 10:26:09', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(347, 'HMS-1784629668844-14', NULL, 89, 26, '2026-07-15', '2026-07-16', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Achiful Islam ', '', '+8801890520930', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:27:48', NULL, NULL, NULL, '2026-07-21 10:27:48', '2026-07-21 10:27:57', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(348, 'HMS-1784629886425-82', NULL, 89, 26, '2026-07-14', '2026-07-15', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', 'cash', '', '438474cd7a20fc45614ce87b7590f944501115e1647daf40be6e51b623b3112a', '', NULL, NULL, 0.00, 'admin', 'Md. obaydullah', '', '+8801612125576', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:31:26', NULL, NULL, NULL, '2026-07-21 10:31:26', '2026-07-21 10:43:54', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(349, 'HMS-1784629922485-89', NULL, 89, 27, '2026-07-14', '2026-07-15', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Md. Obaydullah', '', '+8801612125576', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:32:02', NULL, NULL, NULL, '2026-07-21 10:32:02', '2026-07-21 10:43:51', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(350, 'HMS-1784630709530-33', NULL, 89, 26, '2026-07-16', '2026-07-17', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Md. Abul Kalam Azad Molla', '', '+8801677599065', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:45:09', NULL, NULL, NULL, '2026-07-21 10:45:09', '2026-07-21 10:45:21', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(351, 'HMS-1784630769208-11', NULL, 89, 26, '2026-07-17', '2026-07-18', NULL, NULL, 1, 0, 0, 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500.00, 2500.00, 'BDT', 'checked_out', 'paid', 'bkash', '', NULL, '', NULL, NULL, 0.00, 'admin', 'Achiful Islam', '', '+880190520930', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:46:09', NULL, NULL, NULL, '2026-07-21 10:46:09', '2026-07-22 07:18:21', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(352, 'HMS-1784631388164-29', NULL, 89, 22, '2026-07-16', '2026-07-17', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Achiful Islam', '', '+8801890520930', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:56:28', NULL, NULL, NULL, '2026-07-21 10:56:28', '2026-07-22 07:06:22', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(353, 'HMS-1784631449743-33', NULL, 89, 22, '2026-07-17', '2026-07-18', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Sayed Ahmed Sparsho', '', '+8801728452826', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:57:29', NULL, NULL, NULL, '2026-07-21 10:57:29', '2026-07-22 07:06:18', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(354, 'HMS-1784631539524-44', NULL, 89, 21, '2026-07-17', '2026-07-18', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Mohammad Sajedur Rahman', '', '+8801717056821', NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:58:59', NULL, NULL, NULL, '2026-07-21 10:58:59', '2026-07-22 07:06:04', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(355, 'HMS-1784631681439-12', NULL, 89, 21, '2026-07-16', '2026-07-17', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Md Hasibis Islam Khan', '', '+8801841712003', NULL, NULL, NULL, NULL, NULL, '2026-07-21 11:01:21', NULL, NULL, NULL, '2026-07-21 11:01:21', '2026-07-22 07:01:39', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(356, 'HMS-1784647739814-48', NULL, 89, 23, '2026-07-21', '2026-07-23', NULL, NULL, 1, 0, 0, 6305.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6305.00, 6305.00, 'BDT', 'checked_out', 'paid', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Nazmul Hassan Chowdhury ', '', '+880 18 1935 0624', NULL, NULL, NULL, NULL, NULL, '2026-07-21 15:28:59', NULL, NULL, NULL, '2026-07-21 15:28:59', '2026-07-23 07:33:38', 0, 0.00, 'Booking.com', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(357, 'KH167501P7S', 165, 89, 26, '2026-07-25', '2026-07-26', '15:00:00', '11:00:00', 2, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 300.00, 2700.00, 3000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'SHEIKH FARID', 'sheikhfarid282@gmail.com', 'G-1784726899708', NULL, NULL, NULL, NULL, NULL, '2026-07-22 13:32:47', '2026-07-22 13:32:47', '2026-07-22 10:02:47', '2026-07-22 14:03:01', '2026-07-22 13:32:47', '2026-07-22 14:03:01', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(358, 'KH418254HYJ', 165, 69, 14, '2026-07-26', '2026-07-27', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'SHEIKH FARID', 'sheikhfarid282@gmail.com', 'G-1784726899708', NULL, NULL, NULL, NULL, NULL, '2026-07-22 17:46:58', '2026-07-22 17:46:58', '2026-07-22 14:16:58', '2026-07-22 18:17:06', '2026-07-22 17:46:58', '2026-07-22 18:17:06', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(359, 'KH518804AA9', 165, 69, 14, '2026-07-27', '2026-07-28', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'SHEIKH FARID', 'sheikhfarid282@gmail.com', 'G-1784726899708', NULL, NULL, NULL, NULL, NULL, '2026-07-22 17:48:38', '2026-07-22 17:48:38', '2026-07-22 14:18:38', '2026-07-22 18:19:06', '2026-07-22 17:48:38', '2026-07-22 18:19:06', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(360, 'HMS-1784781684296-14', NULL, 89, 21, '2026-07-24', '2026-07-26', NULL, NULL, 1, 0, 0, 6300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6300.00, 6300.00, 'BDT', 'cancelled', 'pending', NULL, NULL, '02bcc3c3da04d8f22d0b3c21e1fd3b4e57252393495bb562eab1b47cbd346db1', '', NULL, NULL, 0.00, 'admin', 'Dr. Piku Hossen', '', '+8801981498007', NULL, NULL, NULL, NULL, NULL, '2026-07-23 04:41:24', NULL, NULL, '2026-07-23 07:38:05', '2026-07-23 04:41:24', '2026-07-23 07:38:05', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(361, 'HMS-1784789252030-44', NULL, 89, 23, '2026-07-26', '2026-07-27', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, 'f5ba7796e8c69c01c4d549d298dd7ae7d79b2c3dd6c8e8b27cf20d7ab1c922fc', '', NULL, NULL, 0.00, 'admin', 'Md. Sheikh Farid', '', '‪+8801871665393‬ ', NULL, NULL, NULL, NULL, NULL, '2026-07-23 06:47:32', '2026-07-23 06:50:30', NULL, NULL, '2026-07-23 06:47:32', '2026-07-27 16:16:26', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(362, 'HMS-1784794429669-72', NULL, 89, 21, '2026-07-23', '2026-07-24', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '0b52277acec013c2096ee61bed075670300b77bab8af4ad88211ec6175124cde', '', NULL, NULL, 0.00, 'admin', 'Nazmul Hassan Chowdhury ', '', '+880 18 1935 0624', NULL, NULL, NULL, NULL, NULL, '2026-07-23 08:13:49', '2026-07-23 08:18:03', NULL, NULL, '2026-07-23 08:13:49', '2026-07-25 13:37:28', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(363, 'HMS-1784811124936-48', NULL, 89, 26, '2026-07-23', '2026-07-24', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '1b86dbeae98534e4835b0c36e1e997099118d9f7bf4076979e66610f208d7a9e', '', NULL, NULL, 0.00, 'admin', 'Md. Mosfique Istiaque Anik', '', '‪+880 1707‑371452‬', NULL, NULL, NULL, NULL, NULL, '2026-07-23 12:52:04', '2026-07-23 13:40:02', NULL, NULL, '2026-07-23 12:52:04', '2026-07-24 09:39:09', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(364, 'HMS-1784885724925-52', NULL, 89, 26, '2026-07-24', '2026-07-25', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '9f70a5a73a55e17b4605613724a8ed1ba36092f9fbfb7ba0ca0ef7c182d6a10c', '', NULL, NULL, 0.00, 'admin', 'Masudur Rahman', '', '+880 1730-027433', NULL, NULL, NULL, NULL, NULL, '2026-07-24 09:35:24', '2026-07-24 09:37:04', NULL, NULL, '2026-07-24 09:35:24', '2026-07-25 04:48:06', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(365, 'HMS-1784885872274-39', NULL, 89, 27, '2026-07-24', '2026-07-25', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '6ada494ec9a5a58c833f20d0a204b7bef052de397b10b106e3d9fc7c37ea45d6', '', NULL, NULL, 0.00, 'admin', 'Masudur Rahman', '', '+880 1730-027433', NULL, NULL, NULL, NULL, NULL, '2026-07-24 09:37:52', '2026-07-24 09:40:15', NULL, NULL, '2026-07-24 09:37:52', '2026-07-25 04:48:03', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(366, 'HMS-1784911690686-33', NULL, 89, 21, '2026-07-24', '2026-07-25', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 4000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, 'e60df35fc5d04ba593c0d5859ef58db561ea94d25a4daf62e320bd2226155f6e', '', NULL, NULL, 0.00, 'admin', 'MD. SOFIUL ALAM', '', '‪+880 1734‑801516‬', NULL, NULL, NULL, NULL, NULL, '2026-07-24 16:48:10', '2026-07-24 16:53:44', NULL, NULL, '2026-07-24 16:48:10', '2026-07-25 13:34:15', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(367, 'KH464527EFO', 59, 101, NULL, '2026-07-25', '2026-07-26', '15:00:00', '11:00:00', 1, 0, 0, 1199.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 119.90, 1079.10, 1199.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-25 06:21:04', '2026-07-25 06:21:04', '2026-07-25 02:51:04', '2026-07-25 06:51:45', '2026-07-25 06:21:04', '2026-07-25 06:51:45', 0, 0.00, 'Internal', NULL, 1, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(368, 'KH540641Z1O', 167, 89, 21, '2026-07-25', '2026-07-26', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Daiyan Khan', 'khandaiyan25@gmail.com', 'G-1784965448759', NULL, NULL, NULL, NULL, NULL, '2026-07-25 07:45:40', '2026-07-25 07:45:40', '2026-07-25 04:15:40', '2026-07-25 08:16:25', '2026-07-25 07:45:40', '2026-07-25 08:16:25', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(369, 'HMS-1784972714530-13', NULL, 89, 21, '2026-07-25', '2026-07-26', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, 'ccfe05e79356181ba96bdadf8973109dbf7ef96a02f69fa24a98a24b25ffd36c', '', NULL, NULL, 0.00, 'admin', 'Orisul Daiyan Khan', '', '‪+880 1755‑739668‬', NULL, NULL, NULL, NULL, NULL, '2026-07-25 09:45:14', '2026-07-25 09:49:39', NULL, NULL, '2026-07-25 09:45:14', '2026-07-26 09:23:17', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(370, 'KH2636956RH', 168, 89, 21, '2026-07-27', '2026-07-28', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'ZARIN TASNIM MIHIKA', 'zarintasnimmihika@gmail.com', 'G-1784996704212', NULL, NULL, NULL, NULL, NULL, '2026-07-26 05:37:43', '2026-07-26 05:39:52', '2026-07-26 02:07:43', NULL, '2026-07-26 05:37:43', '2026-07-27 16:16:29', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(371, 'HMS-1785058581971-30', 101, 78, 1, '2026-07-26', '2026-07-27', NULL, NULL, 1, 0, 0, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 10.00, 'BDT', 'confirmed', 'pending', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Atiqur Rahman Bhuiyan', 'arb.cumilla@gmail.com', '01851562688', 'Bangladeshi', '32453', '234234234', '/uploads/documents/hms-nid-1785061235348-1785061235348-886766332.webp', '/uploads/documents/hms-passport-1785061235427-1785061235428-540374878.webp', '2026-07-26 09:36:22', NULL, NULL, NULL, '2026-07-26 09:36:22', '2026-07-26 10:20:35', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(372, 'HMS-1785070282336-52', NULL, 89, 27, '2026-07-26', '2026-07-29', NULL, NULL, 1, 0, 0, 10500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10500.00, 10500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, 'dd15385a0caefebe7504ac2947cfccc4358328e48e7c400dd133400bd251fe09', '', NULL, NULL, 0.00, 'admin', 'MD. Nuruzzaman Talukder Rakib', '', '‪+880 1621‑889147‬', 'Bangladeshi', '6008276930', NULL, '/uploads/documents/hms-nid-1785070282336-1785070282336-726357130.webp', NULL, '2026-07-26 12:51:22', NULL, NULL, '2026-07-27 10:07:06', '2026-07-26 12:51:22', '2026-07-27 10:07:06', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(373, 'HMS-1785070448118-86', NULL, 89, 26, '2026-07-26', '2026-07-29', NULL, NULL, 1, 0, 0, 9000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 9000.00, 9000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, 'ff4446c3b9e6f9a6aee95685fb21efef5ebfe6e63824ab7810379798bc8e95fd', '', NULL, NULL, 0.00, 'admin', 'MD. Nuruzzaman Talukder Rakib', '', '‪+880 1621‑889147‬', 'Bangladeshi', '6008276930', NULL, '/uploads/documents/hms-nid-1785070282336-1785070282336-726357130.webp', NULL, '2026-07-26 12:54:08', NULL, NULL, '2026-07-27 10:07:02', '2026-07-26 12:54:08', '2026-07-27 10:07:02', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(374, 'KH91315551M', 169, 69, 14, '2026-07-27', '2026-07-28', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'SHAHANAWAZ KABIR', 'shahanawazkabir@gmail.com', '01811905129', NULL, NULL, NULL, NULL, NULL, '2026-07-26 14:08:33', '2026-07-26 14:08:33', '2026-07-26 10:38:33', '2026-07-26 14:38:39', '2026-07-26 14:08:33', '2026-07-26 14:38:39', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(375, 'KH177457P76', 169, 89, 22, '2026-07-27', '2026-07-28', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, NULL, NULL, NULL, NULL, 0.00, 'website', 'SHAHANAWAZ KABIR', 'shahanawazkabir@gmail.com', '01811905129', NULL, NULL, NULL, NULL, NULL, '2026-07-26 14:46:17', '2026-07-26 14:47:06', '2026-07-26 11:16:17', NULL, '2026-07-26 14:46:17', '2026-07-28 08:39:36', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(376, 'KH6804978QU', 170, 89, 23, '2026-07-28', '2026-07-29', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Hemento Sufi', 'hementosufi@gmail.com', 'G-1785091591054', NULL, NULL, NULL, NULL, NULL, '2026-07-26 18:48:00', '2026-07-26 18:48:00', '2026-07-26 15:18:00', '2026-07-26 19:18:06', '2026-07-26 18:48:00', '2026-07-26 19:18:06', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(377, 'HMS-1785146901837-66', NULL, 89, 26, '2026-07-27', '2026-07-28', NULL, NULL, 1, 0, 0, 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000.00, 5000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, 'd16af1de3c91dc8b351e55c0544dbba6559645c6fd7d6f0046ad27b0cb0c4e16', '', NULL, NULL, 0.00, 'admin', 'MD. Nuruzzanam Takukder Rakib', '', '+8801621889147', 'Bangladeshi', NULL, NULL, NULL, NULL, '2026-07-27 10:08:21', '2026-07-27 10:11:49', NULL, NULL, '2026-07-27 10:08:21', '2026-07-28 08:39:25', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(378, 'HMS-1785165634500-40', NULL, 89, 23, '2026-07-27', '2026-07-28', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '7fa884cca34ba94b22b5322e59495a1c1fec0d511ddbcccddc9491a6009dd6cf', '', NULL, NULL, 0.00, 'admin', 'MD. JAHIRUL ISLAM', '', '+880 1683-066422', NULL, NULL, NULL, NULL, NULL, '2026-07-27 15:20:34', '2026-07-27 15:23:16', NULL, NULL, '2026-07-27 15:20:34', '2026-07-28 06:28:01', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(379, 'HMS-1785219426978-59', 169, 89, 22, '2026-07-28', '2026-07-29', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, '7a504b9aa526a30a5b930a0a76f6107962ea6a3f4ab00acc0b4547794e4615ac', '', NULL, NULL, 0.00, 'admin', 'SHAHANAWAZ KABIR', 'shahanawazkabir@gmail.com', '01811905129', NULL, NULL, NULL, '/uploads/documents/hms-nid-1785219426978-1785219426978-746792775.webp', NULL, '2026-07-28 06:17:07', '2026-07-28 07:04:58', NULL, NULL, '2026-07-28 06:17:07', '2026-07-28 08:39:31', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(380, 'HMS-1785227906534-59', NULL, 89, 27, '2026-07-29', '2026-07-30', NULL, NULL, 12, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, '', 'Cancelled by property owner', NULL, 0.00, 'admin', 'Adnan Asif', '', '‪+8801846820256‬', 'Bangladeshi', '7815224808', NULL, '/uploads/documents/hms-nid-1785227906534-1785227906534-127676561.webp', NULL, '2026-07-28 08:38:26', NULL, NULL, '2026-07-28 08:39:58', '2026-07-28 08:38:26', '2026-07-28 08:39:58', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(381, 'HMS-1785228101631-72', NULL, 89, 27, '2026-07-29', '2026-07-30', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '92e69ce373c877232969a100d52a5ba412ee3bdf3275b5f63568a215f72917f8', '', NULL, NULL, 0.00, 'admin', 'Adnan Asif', '', '‪+8801846820256‬', 'Bangladeshi', '7815224808', NULL, '/uploads/documents/hms-nid-1785227906534-1785227906534-127676561.webp', NULL, '2026-07-28 08:41:41', '2026-07-28 08:47:45', NULL, NULL, '2026-07-28 08:41:41', '2026-07-30 13:03:28', 0, 0.00, 'Social Media', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(382, 'KH245726FZZ', 59, 80, 28, '2026-08-02', '2026-08-03', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'AR Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', NULL, NULL, NULL, NULL, NULL, '2026-07-28 09:00:45', '2026-07-28 09:00:45', '2026-07-28 05:30:45', '2026-07-28 09:30:57', '2026-07-28 09:00:45', '2026-07-28 09:30:57', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(383, 'HMS-1785229695290-21', 101, 78, 1, '2026-07-29', '2026-07-30', NULL, NULL, 1, 0, 0, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 10.00, 'BDT', 'confirmed', 'paid', 'cash', 'ok', '3cd72a462b848981f2c24d670066a048a72f36abb03d257b6e104b945ca22a47', '', NULL, NULL, 0.00, 'admin', 'Atiqur Rahman Bhuiyan', 'arb.cumilla@gmail.com', '01851562688', 'Bangladeshi', '32453', '234234234', '/uploads/documents/hms-nid-1785061235348-1785061235348-886766332.webp', '/uploads/documents/hms-passport-1785061235427-1785061235428-540374878.webp', '2026-07-28 09:08:15', NULL, NULL, NULL, '2026-07-28 09:08:15', '2026-07-30 10:03:48', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(384, 'HMS-1785232510100-11', NULL, 89, 23, '2026-07-28', '2026-07-30', NULL, NULL, 2, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, 6000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '555ef729288502c4b8f3e782b7a676e03afa779da418c2d2b08c81e2bca0cbbd', '', NULL, NULL, 0.00, 'admin', 'Sumon Ahmed', '', '+8801646886190', 'Bangladeshi', '6402100751', NULL, '/uploads/documents/hms-nid-1785232510100-1785232510101-216604168.webp', '', '2026-07-28 09:55:10', '2026-07-28 10:11:57', NULL, NULL, '2026-07-28 09:55:10', '2026-07-30 13:03:23', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(385, 'KH840859C9M', 105, 80, 28, '2026-07-29', '2026-07-30', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Sheikh Jaber Al Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', NULL, NULL, NULL, NULL, NULL, '2026-07-28 10:00:40', '2026-07-28 10:00:40', '2026-07-28 06:30:40', '2026-07-28 10:30:57', '2026-07-28 10:00:40', '2026-07-28 10:30:57', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(386, 'HMS-1785234178904-46', NULL, 89, 21, '2026-07-29', '2026-07-30', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, '5ca3492abc9fee885f3dfef9a9b54ed1ae3476a2b7c4bd8d8fcb4cb68ec1b6be', '', 'Cancelled by property owner', NULL, 0.00, 'admin', 'Sheikh Jaber Al Meezan', '', '+8801786251558', NULL, '914 342 6923', NULL, NULL, NULL, '2026-07-28 10:22:58', NULL, NULL, '2026-07-28 14:40:51', '2026-07-28 10:22:58', '2026-07-28 14:40:51', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(387, 'HMS-1785249720392-58', NULL, 89, 21, '2026-07-29', '2026-07-31', NULL, NULL, 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, 6000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, 'b87929dcff2393fb61184183d06670c5ba0642fc531fca1470d907108900dc10', '', NULL, NULL, 0.00, 'admin', 'Sheikh Jaber Al Meezan', '', '+880 1786-251558', NULL, '914 342 6923', NULL, '', '', '2026-07-28 14:42:00', '2026-07-28 14:57:42', NULL, NULL, '2026-07-28 14:42:00', '2026-07-31 09:59:26', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(388, 'HMS-1785253503985-44', NULL, 89, 25, '2026-07-28', '2026-07-29', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, '736996cfeaa3004e93c358aad5e9b542286549e8047c7fc09e58c53a5c2e8103', '', NULL, NULL, 0.00, 'admin', 'Md. Rakibul Hasan', '', '‪+880 1344‑382076‬', NULL, NULL, NULL, NULL, NULL, '2026-07-28 15:45:03', '2026-07-28 15:52:44', NULL, NULL, '2026-07-28 15:45:03', '2026-07-28 16:46:54', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(389, 'HMS-1785261327789-64', 109, 89, 25, '2026-07-29', '2026-07-31', NULL, NULL, 1, 0, 0, 7000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 7000.00, 7000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, 'dcb8a4857b6f62ed34790857e4b300411c9cbcc31a2ec1f39dc22004acccf2a8', '', 'Cancelled by property owner', NULL, 0.00, 'admin', 'Dhdhfd', '', 'Ffg', NULL, NULL, NULL, NULL, NULL, '2026-07-28 17:55:27', NULL, NULL, '2026-07-28 19:11:24', '2026-07-28 17:55:27', '2026-07-28 19:11:24', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(390, 'KH560286HYK', 115, 69, 14, '2026-07-30', '2026-07-31', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Marzuk Ahmed', 'marzukahmed06@gmail.com', 'G-1782468725394', NULL, NULL, NULL, NULL, NULL, '2026-07-29 04:49:20', '2026-07-29 04:49:20', '2026-07-29 01:19:20', '2026-07-29 05:20:16', '2026-07-29 04:49:20', '2026-07-29 05:20:16', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(391, 'HMS-1785330732314-32', NULL, 89, 26, '2026-07-29', '2026-07-30', NULL, NULL, 2, 0, 0, 2700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2700.00, 2700.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '5a95e6d65c6c24f62841433974c21684402b46daaf0157965359e87ab05ef152', '', NULL, NULL, 0.00, 'admin', 'Md. Ashraf Uddin Utshob', '', '+880 1687-128768', NULL, '5107862624', NULL, '/uploads/documents/hms-nid-1785330732314-1785330732315-957902768.webp', NULL, '2026-07-29 13:12:12', '2026-07-29 13:20:32', NULL, NULL, '2026-07-29 13:12:12', '2026-07-30 13:03:05', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(392, 'HMS-1785336435104-23', NULL, 89, 25, '2026-07-29', '2026-07-30', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, '24c7be81d9124d5bac68d043927db36295acbd10e8f68660501ada2548e85976', '', NULL, NULL, 0.00, 'admin', 'Abdullah Sabit Anwar Chowdhury', '', '+880 1709-086571', NULL, '2415094743', NULL, NULL, NULL, '2026-07-29 14:47:15', '2026-07-29 14:50:14', NULL, NULL, '2026-07-29 14:47:15', '2026-07-30 13:03:09', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(393, 'HMS-1785337112661-52', NULL, 89, 22, '2026-07-30', '2026-08-01', NULL, NULL, 2, 0, 0, 6300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6300.00, 6300.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, '5719c22f8c8665cf532c1ccdd6ec8e8729d0c2b7fcad9c2a8820dd60ffebb8cb', '', NULL, NULL, 0.00, 'admin', 'SM Tarique Mahmood', '', '+8801971212127', NULL, '820858473', NULL, NULL, NULL, '2026-07-29 14:58:32', '2026-07-29 17:14:13', NULL, NULL, '2026-07-29 14:58:32', '2026-07-31 09:59:00', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(394, 'KH942392XYL', 173, 70, 13, '2026-07-29', '2026-07-30', '15:00:00', '11:00:00', 2, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Adibur Rahman', 'adibrhmn3452@gmail.com', 'G-1785340752315', NULL, NULL, NULL, NULL, NULL, '2026-07-29 16:02:22', '2026-07-29 16:02:22', '2026-07-29 12:32:22', '2026-07-29 16:32:38', '2026-07-29 16:02:22', '2026-07-29 16:32:38', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(395, 'KH2140497D6', 89, 77, 7, '2026-08-19', '2026-08-20', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-07-30 09:36:54', '2026-07-30 09:36:54', '2026-07-30 06:06:54', '2026-07-30 10:07:22', '2026-07-30 09:36:54', '2026-07-30 10:07:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(396, 'KH504369QLG', 89, 77, 7, '2026-08-20', '2026-08-21', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-07-30 09:41:44', '2026-07-30 09:41:44', '2026-07-30 06:11:44', '2026-07-30 10:12:22', '2026-07-30 09:41:44', '2026-07-30 10:12:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(397, 'HMS-1785405444065-61', NULL, 89, 25, '2026-07-30', '2026-07-31', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', 'sslcommerz', NULL, 'f5b030baa26ae8cfed65270c397229dba69f56cdefbff08f6f399ac605ee3d2f', '', NULL, NULL, 0.00, 'admin', 'Mohammad Asraful Islam Asif', '', '+880 1621-628292', NULL, NULL, NULL, NULL, NULL, '2026-07-30 09:57:24', '2026-07-30 11:29:31', NULL, NULL, '2026-07-30 09:57:24', '2026-07-31 09:58:48', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(398, 'KH5279814XG', 89, 77, 7, '2026-08-21', '2026-08-22', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'paid', NULL, NULL, NULL, NULL, 'ok', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-07-30 09:58:47', '2026-07-30 09:59:32', '2026-07-30 06:28:47', '2026-07-30 10:00:53', '2026-07-30 09:58:47', '2026-07-30 10:00:53', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(399, 'KH622016GMY', 75, 77, 7, '2026-08-06', '2026-08-07', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'paid', NULL, NULL, NULL, NULL, 'taka nai', NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:00:22', '2026-07-30 10:01:06', '2026-07-30 06:30:22', '2026-07-30 10:01:43', '2026-07-30 10:00:22', '2026-07-30 10:01:43', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(400, 'HMS-1785405881751-13', NULL, 89, 23, '2026-07-30', '2026-07-31', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'checked_out', 'paid', NULL, NULL, '57c8debe2fd2d16ca74a82a6654a65aead5f2c5625abd2a57c91a0c742a747d1', '', NULL, NULL, 0.00, 'admin', 'Gazi. Nowrin Bokul', '', '+8801921008954', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:04:41', '2026-07-30 11:30:54', NULL, NULL, '2026-07-30 10:04:41', '2026-07-31 09:53:19', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(401, 'KH094417855', 56, 77, 7, '2026-08-21', '2026-08-22', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Bini Amin', 'titubiniamin@gmail.com', '01775561819073', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:08:14', '2026-07-30 10:08:14', '2026-07-30 06:38:14', '2026-07-30 10:38:22', '2026-07-30 10:08:14', '2026-07-30 10:38:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(402, 'KH1789655WM', 56, 77, 7, '2026-08-23', '2026-08-24', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Bini Amin', 'titubiniamin@gmail.com', '01775561819073', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:09:38', '2026-07-30 10:09:38', '2026-07-30 06:39:38', '2026-07-30 10:40:22', '2026-07-30 10:09:38', '2026-07-30 10:40:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(403, 'KH269334KQN', 56, 77, 7, '2026-08-11', '2026-08-12', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Bini Amin', 'titubiniamin@gmail.com', '01775561819073', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:11:09', '2026-07-30 10:11:09', '2026-07-30 06:41:09', '2026-07-30 10:41:22', '2026-07-30 10:11:09', '2026-07-30 10:41:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(404, 'KH31623869R', 75, 77, 7, '2026-08-05', '2026-08-06', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:11:56', '2026-07-30 10:11:56', '2026-07-30 06:41:56', '2026-07-30 10:42:22', '2026-07-30 10:11:56', '2026-07-30 10:42:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(405, 'KH336530PIV', 56, 77, 7, '2026-09-28', '2026-09-29', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Bini Amin', 'titubiniamin@gmail.com', '01775561819073', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:12:16', '2026-07-30 10:12:16', '2026-07-30 06:42:16', '2026-07-30 10:44:23', '2026-07-30 10:12:16', '2026-07-30 10:44:23', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(406, 'KH443215R0H', 174, 75, NULL, '2026-08-20', '2026-08-21', '15:00:00', '11:00:00', 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 300.00, 2700.00, 3000.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Host did not respond within 30 minute(s) — booking automatically cancelled', NULL, 0.00, 'website', 'Info .', 'info@keyhost24.com', 'G-1785406440531', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:14:03', NULL, NULL, '2026-07-30 10:48:22', '2026-07-30 10:14:03', '2026-07-30 10:48:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(407, 'KH474624Q1F', 174, 80, 28, '2026-08-27', '2026-08-28', '15:00:00', '11:00:00', 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 350.00, 3150.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Info .', 'info@keyhost24.com', 'G-1785406440531', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:14:34', '2026-07-30 10:14:34', '2026-07-30 06:44:34', '2026-07-30 10:45:22', '2026-07-30 10:14:34', '2026-07-30 10:45:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(408, 'KH580081AN1', 56, 77, 7, '2026-08-13', '2026-08-14', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Bini Amin', 'titubiniamin@gmail.com', '01775561819073', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:16:20', '2026-07-30 10:16:20', '2026-07-30 06:46:20', '2026-07-30 10:46:22', '2026-07-30 10:16:20', '2026-07-30 10:46:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(409, 'KH867709PZF', 75, 77, 7, '2026-08-08', '2026-08-09', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:21:07', '2026-07-30 10:21:07', '2026-07-30 06:51:07', '2026-07-30 10:51:22', '2026-07-30 10:21:07', '2026-07-30 10:51:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(410, 'KH958496TG6', 56, 77, 7, '2026-10-15', '2026-10-16', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Bini Amin', 'titubiniamin@gmail.com', '01775561819073', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:22:38', '2026-07-30 10:22:38', '2026-07-30 06:52:38', '2026-07-30 10:53:22', '2026-07-30 10:22:38', '2026-07-30 10:53:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(411, 'KH016571LTU', 56, 77, 7, '2026-09-23', '2026-09-24', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Bini Amin', 'titubiniamin@gmail.com', '01775561819073', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:23:36', '2026-07-30 10:23:36', '2026-07-30 06:53:36', '2026-07-30 10:54:22', '2026-07-30 10:23:36', '2026-07-30 10:54:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(412, 'KH158304JF6', 147, 77, 7, '2026-09-24', '2026-09-25', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Atiqur Rahman Bhuiyan', 'atiqur.earn@gmail.com', 'G-1783326605578', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:25:58', '2026-07-30 10:25:58', '2026-07-30 06:55:58', '2026-07-30 10:56:22', '2026-07-30 10:25:58', '2026-07-30 10:56:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(413, 'KH182218DRX', 75, 77, 7, '2026-08-01', '2026-08-02', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Farhad Ali', 'farhadali0507@gmail.com', 'G-1779514102952', NULL, NULL, NULL, NULL, NULL, '2026-07-30 10:26:22', '2026-07-30 10:26:22', '2026-07-30 06:56:22', '2026-07-30 10:57:22', '2026-07-30 10:26:22', '2026-07-30 10:57:22', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(414, 'KH154459S0I', 147, 77, 7, '2026-08-20', '2026-08-21', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Atiqur Rahman Bhuiyan', 'atiqur.earn@gmail.com', 'G-1783326605578', NULL, NULL, NULL, NULL, NULL, '2026-07-30 11:32:34', '2026-07-30 11:32:34', '2026-07-30 08:02:34', '2026-07-30 12:55:41', '2026-07-30 11:32:34', '2026-07-30 12:55:41', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(415, 'HMS-1785416657581-44', NULL, 89, 21, '2026-07-31', '2026-08-01', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_in', 'paid', NULL, NULL, 'c2e519d1b2b53a5aeb355ace1980e0caea56b677b6c0d854b91097b1f4d6d81b', '', NULL, NULL, 0.00, 'admin', 'Sheikh Jaber Al Meezan', '', '+8801786251558', NULL, '914 342 6923', NULL, NULL, NULL, '2026-07-30 13:04:17', '2026-07-30 13:13:32', NULL, NULL, '2026-07-30 13:04:17', '2026-07-31 00:01:56', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(416, 'HMS-1785417176693-61', NULL, 89, 26, '2026-07-31', '2026-08-01', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, '6cb099fea8ca24a1b37fab53ebdeb1d8d93e3d76509c68fa1182c2e6e0c11722', '', NULL, NULL, 0.00, 'admin', 'Sayed Marduk Ahmed', '', '‪+880 1716‑306114‬', NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:12:56', '2026-07-30 13:22:43', NULL, NULL, '2026-07-30 13:12:56', '2026-07-31 09:51:45', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(417, 'HMS-1785433619608-66', NULL, 89, 27, '2026-07-30', '2026-07-31', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_out', 'paid', NULL, NULL, 'c61834bed3d969734cf965bc883537da40519c8dd70af6e7eaf505c6c419afdd', '', NULL, NULL, 0.00, 'admin', 'Nahian Sadik Rafi', '', '‪+880 1760‑192875‬', NULL, NULL, NULL, '/uploads/documents/hms-nid-1785433619608-1785433619608-133558850.webp', NULL, '2026-07-30 17:46:59', '2026-07-30 17:48:03', NULL, NULL, '2026-07-30 17:46:59', '2026-07-31 09:49:20', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(418, 'HMS-1785447297193-24', NULL, 89, 27, '2026-08-01', '2026-08-01', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, '05b7126f6708fe273603e0b8d7841fe92bf451093b1cbdd31e2291521befcdef', '', NULL, NULL, 0.00, 'admin', 'Mujaid billah', '', '‪+880 1902‑033050', NULL, NULL, NULL, '', '', '2026-07-30 21:34:57', '2026-07-30 23:08:45', NULL, NULL, '2026-07-30 21:34:57', '2026-07-31 00:01:44', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(419, 'KH901572TGQ', 147, 77, 7, '2026-07-31', '2026-08-01', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Atiqur Rahman Bhuiyan', 'atiqur.earn@gmail.com', 'G-1783326605578', NULL, NULL, NULL, NULL, NULL, '2026-07-31 02:11:41', '2026-07-31 02:11:41', '2026-07-30 22:41:41', '2026-07-31 02:42:31', '2026-07-31 02:11:41', '2026-07-31 02:42:31', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(420, 'HMS-1785477948318-95', NULL, 89, 23, '2026-08-01', '2026-08-02', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'cancelled', 'pending', NULL, NULL, 'ab2479eff007e0a4270f0b1ccd7e49ed00d8d9bb1f80f31a72b9d5e8816fa0f4', '', NULL, NULL, 0.00, 'admin', 'Mohammad Ashraful Islam Asif', '', '+8801621628292', NULL, NULL, NULL, NULL, NULL, '2026-07-31 06:05:48', NULL, NULL, '2026-07-31 06:08:55', '2026-07-31 06:05:48', '2026-07-31 06:08:55', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(421, 'HMS-1785478202596-92', NULL, 89, 23, '2026-08-01', '2026-08-03', NULL, NULL, 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, 6000.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, 'abdc8667cb94d0e344c5c34308b29ba0562bf801c87f5a2ba888daad59ca671e', '', NULL, NULL, 0.00, 'admin', 'Mohammad Ashraful Islam Asif', '', '+8801621628292', NULL, NULL, NULL, NULL, NULL, '2026-07-31 06:10:02', '2026-07-31 12:29:54', NULL, NULL, '2026-07-31 06:10:02', '2026-07-31 12:30:01', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(422, 'HMS-1785478290865-46', NULL, 89, 25, '2026-08-01', '2026-08-03', NULL, NULL, 1, 0, 0, 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, 6000.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, 'f919babf533cbdb6b115718c2f8be54f8e6637f0c7b13904b419de0e79347554', '', NULL, NULL, 0.00, 'admin', 'Mohammad Ashraful islam Asif', '', '+8801621628292', NULL, NULL, NULL, NULL, NULL, '2026-07-31 06:11:30', '2026-07-31 12:07:46', NULL, NULL, '2026-07-31 06:11:30', '2026-07-31 12:07:51', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(423, 'HMS-1785484990025-15', NULL, 89, 27, '2026-07-31', '2026-08-01', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, 'd4829007cb2ef2c5ff9236edd5f5bdd86be47e331d1898cad75098134e1ced59', '', NULL, NULL, 0.00, 'admin', 'Shariar Saum', '', '+880 1540-405011', NULL, NULL, NULL, NULL, NULL, '2026-07-31 08:03:10', '2026-07-31 12:06:28', NULL, NULL, '2026-07-31 08:03:10', '2026-07-31 13:05:11', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(424, 'HMS-1785491661552-90', NULL, 89, 26, '2026-07-31', '2026-08-01', NULL, NULL, 1, 0, 0, 2700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2700.00, 2700.00, 'BDT', 'checked_in', 'paid', NULL, NULL, 'dd3ff1881c6934c420a99cd70686dd734a66867f4d43cac46ad3beb6ca84e4e5', '', NULL, NULL, 0.00, 'admin', 'Nahian Sadik Rafi', '', '‪+880 1760‑192875‬', NULL, NULL, NULL, NULL, NULL, '2026-07-31 09:54:21', '2026-07-31 10:03:38', NULL, NULL, '2026-07-31 09:54:21', '2026-07-31 10:07:41', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL);
INSERT INTO `bookings` (`id`, `booking_reference`, `guest_id`, `property_id`, `hms_room_id`, `check_in_date`, `check_out_date`, `check_in_time`, `check_out_time`, `number_of_guests`, `number_of_children`, `number_of_infants`, `base_price`, `cleaning_fee`, `security_deposit`, `extra_guest_fee`, `service_fee`, `tax_amount`, `admin_commission_rate`, `admin_commission_amount`, `property_owner_earnings`, `total_amount`, `currency`, `status`, `payment_status`, `payment_method`, `payment_notes`, `payment_link_token`, `special_requests`, `cancellation_reason`, `coupon_code`, `discount_amount`, `booking_source`, `guest_name`, `guest_email`, `guest_phone`, `guest_nationality`, `guest_nid_number`, `guest_passport_number`, `guest_nid_document_url`, `guest_passport_document_url`, `booking_date`, `confirmed_at`, `payment_deadline`, `cancelled_at`, `created_at`, `updated_at`, `points_redeemed`, `points_discount`, `source`, `external_booking_id`, `is_non_refundable`, `security_deposit_status`, `security_deposit_claim_amount`, `security_deposit_claim_reason`, `security_deposit_claim_at`, `security_deposit_deduction_amount`, `booking_type`, `months_count`, `extra_days`, `monthly_rate_used`, `advance_amount`) VALUES
(425, 'HMS-1785503063417-50', NULL, 89, 23, '2026-07-31', '2026-08-01', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_in', 'paid', 'sslcommerz', NULL, 'a8d2324806c86935478c0a16df27ecd0f019f944e4b5a4d5f1bc208728dca801', '', NULL, NULL, 0.00, 'admin', 'MD Rejwan Kabir', '', '‪+880 1930‑299774‬', NULL, NULL, NULL, NULL, NULL, '2026-07-31 13:04:23', '2026-07-31 13:27:23', NULL, NULL, '2026-07-31 13:04:23', '2026-07-31 14:49:50', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(426, 'HMS-1785514582955-23', NULL, 89, 25, '2026-07-31', '2026-08-01', NULL, NULL, 1, 0, 0, 3500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3500.00, 3500.00, 'BDT', 'confirmed', 'paid', 'sslcommerz', NULL, 'f861e7a013ab497e11082f211f3f88fef4ed73764c29188cfda0ac8935443e4b', '', NULL, NULL, 0.00, 'admin', 'Shuvo', '', '‪+880 1601‑141023‬', NULL, NULL, NULL, NULL, NULL, '2026-07-31 16:16:22', '2026-07-31 17:03:10', NULL, NULL, '2026-07-31 16:16:22', '2026-07-31 17:03:13', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(427, 'HMS-1785530779387-53', NULL, 89, 21, '2026-08-01', '2026-08-02', NULL, NULL, 1, 0, 0, 3000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3000.00, 3000.00, 'BDT', 'checked_in', 'paid', NULL, NULL, '2092532912eeb27b3375021de400acba59c836c472d43f184b73838dbeabdb43', '', NULL, NULL, 0.00, 'admin', 'Sheikh Jaber Al Meezan', '', '+880 1786-251558', NULL, '914 342 6923', NULL, NULL, NULL, '2026-07-31 20:46:19', '2026-07-31 20:49:29', NULL, NULL, '2026-07-31 20:46:19', '2026-08-01 03:57:29', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(428, 'HMS-1785562183334-41', 101, 78, 1, '2026-08-21', '2026-08-22', NULL, NULL, 1, 0, 0, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 10.00, 'BDT', 'checked_in', 'pending', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Atiqur Rahman Bhuiyan', 'arb.cumilla@gmail.com', '01851562688', 'Bangladeshi', '32453', '234234234', '/uploads/documents/hms-nid-1785061235348-1785061235348-886766332.webp', '/uploads/documents/hms-passport-1785061235427-1785061235428-540374878.webp', '2026-08-01 05:29:43', NULL, NULL, NULL, '2026-08-01 05:29:43', '2026-08-01 05:30:24', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(429, 'KH456534RRG', 89, 77, 7, '2026-08-21', '2026-08-22', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-08-01 05:34:16', '2026-08-01 05:34:16', '2026-08-01 02:04:16', '2026-08-01 06:04:26', '2026-08-01 05:34:16', '2026-08-01 06:04:26', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(430, 'KH477531QTD', 89, 77, 7, '2026-08-20', '2026-08-21', '15:00:00', '11:00:00', 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 10.00, 0.50, 4.50, 5.00, 'BDT', 'cancelled', 'pending', NULL, NULL, NULL, NULL, 'Payment deadline expired - booking automatically cancelled', NULL, 0.00, 'website', 'Global Soft Park', 'globalsoftpark@gmail.com', 'G-1780553822800', NULL, NULL, NULL, NULL, NULL, '2026-08-01 05:34:37', '2026-08-01 05:34:37', '2026-08-01 02:04:37', '2026-08-01 06:05:26', '2026-08-01 05:34:37', '2026-08-01 06:05:26', 0, 0.00, 'Internal', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL),
(431, 'HMS-1785562555410-14', 101, 77, 7, '2026-08-26', '2026-08-27', NULL, NULL, 1, 0, 0, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5.00, 5.00, 'BDT', 'confirmed', 'pending', NULL, NULL, NULL, '', NULL, NULL, 0.00, 'admin', 'Atiqur Rahman Bhuiyan', 'arb.cumilla@gmail.com', '01851562688', 'Bangladeshi', '32453', '234234234', '/uploads/documents/hms-nid-1785061235348-1785061235348-886766332.webp', '/uploads/documents/hms-passport-1785061235427-1785061235428-540374878.webp', '2026-08-01 05:35:55', NULL, NULL, NULL, '2026-08-01 05:35:55', '2026-08-01 05:35:55', 0, 0.00, 'Walk-in', NULL, 0, 'pending', 0.00, NULL, NULL, 0.00, 'short_stay', NULL, NULL, NULL, NULL);

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
  `nid_number` varchar(50) DEFAULT NULL,
  `passport_number` varchar(50) DEFAULT NULL,
  `is_primary_guest` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_guests`
--

INSERT INTO `booking_guests` (`id`, `booking_id`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `nid_number`, `passport_number`, `is_primary_guest`, `created_at`) VALUES
(1, 380, 'Saiara Rahman', 'Adhora', NULL, NULL, NULL, 'female', '7816938158', NULL, 0, '2026-07-28 08:38:26'),
(4, 384, 'Zannatul', 'Fatema', NULL, '+8801941074173', NULL, 'female', '9166860600', NULL, 0, '2026-07-28 17:05:38');

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
(15, 74, 52, 70, '2026-06-07 06:54:49', '2026-05-22 15:46:19', '2026-06-07 06:54:49'),
(16, 74, 59, 77, '2026-05-22 16:30:28', '2026-05-22 16:30:28', '2026-05-22 16:30:28'),
(17, 103, 52, 80, '2026-06-18 12:03:18', '2026-06-18 11:59:54', '2026-06-18 12:03:18'),
(18, 142, 52, 89, '2026-07-05 08:00:38', '2026-07-05 08:00:38', '2026-07-05 08:00:38'),
(19, 75, 53, 74, '2026-07-28 05:10:46', '2026-07-28 05:10:46', '2026-07-28 05:10:46'),
(20, 59, 52, 80, '2026-07-28 05:11:35', '2026-07-28 05:11:35', '2026-07-28 05:11:35'),
(21, 172, 127, 93, '2026-07-29 09:35:43', '2026-07-29 09:35:43', '2026-07-29 09:35:43');

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
(3, 'KEY20', 'KEY20', '20% Discount', 'percentage', 20.00, 1.00, NULL, NULL, 8, NULL, '2026-05-17', '2030-05-26', 1, '2026-05-17 08:51:23', '2026-06-23 05:03:39');

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
(4, 3, 68, 179, 500.00, '2026-05-17 11:24:05'),
(5, 3, 80, 189, 500.00, '2026-05-25 19:31:37'),
(6, 3, 80, 192, 500.00, '2026-05-26 06:42:19'),
(7, 3, 93, 204, 1.00, '2026-06-04 14:12:52');

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
(50, 3, 70, '2026-04-13 05:01:18'),
(51, 2, 99, '2026-07-09 02:38:39'),
(52, 3, 99, '2026-07-09 02:38:39'),
(53, 2, 101, '2026-07-09 02:38:46'),
(54, 3, 95, '2026-07-09 02:39:16'),
(55, 2, 95, '2026-07-09 02:39:16'),
(56, 2, 93, '2026-07-09 02:39:29'),
(57, 3, 93, '2026-07-09 02:39:29'),
(58, 2, 102, '2026-07-09 12:08:52'),
(59, 3, 102, '2026-07-09 12:08:52');

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

--
-- Dumping data for table `external_calendars`
--

INSERT INTO `external_calendars` (`id`, `property_id`, `provider_name`, `ical_url`, `last_sync`, `created_at`, `updated_at`) VALUES
(5, 70, 'Airbnb', 'https://www.airbnb.com/calendar/ical/1630058835176569897.ics?t=78427f4622db454fa010bf2ca5a14516', '2026-08-01 02:00:00', '2026-05-30 08:50:49', '2026-08-01 06:00:00'),
(6, 69, 'Airbnb', 'https://www.airbnb.com/calendar/ical/1603526764922115502.ics?t=e0d26927e7644ee58abc8aea29439a99', '2026-08-01 02:05:52', '2026-05-30 08:51:43', '2026-08-01 06:05:52'),
(7, 68, 'Airbnb', 'https://www.airbnb.com/calendar/ical/1470925441962184852.ics?t=ef71efd51ffc43b095a2c632e3a6217e', '2026-08-01 02:00:01', '2026-05-30 08:52:19', '2026-08-01 06:00:01');

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
(15, 68, 80, '2026-05-17 11:22:31'),
(16, 121, 89, '2026-06-30 08:37:37');

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
(11, 59, 'Refunds/Cancellations', 'expense', NULL, 0, '2026-05-05 08:20:59'),
(12, 52, 'Platform Commission', 'expense', NULL, 0, '2026-05-26 06:44:31');

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
(102, 59, 78, 4, 69948.20, 'debit', 'Salary Payment - Tanjim (May/2026)', 'payroll', 5, '2026-05-23', '2026-05-23 08:34:45'),
(103, 81, 88, 1, 6000.00, 'credit', 'Room Revenue - Booking #190 (Ref: HMS-MANUAL-1779774453349-190)', 'payment', 257, '2026-05-26', '2026-05-26 05:47:33'),
(104, 81, 88, 1, 6000.00, 'credit', 'Room Revenue - Booking #191 (Ref: HMS-MANUAL-1779775602562-191)', 'payment', 258, '2026-05-26', '2026-05-26 06:06:42'),
(105, 81, 88, 3, 500.00, 'credit', 'Laundry service for guest', 'voucher', 1, '2026-05-26', '2026-05-26 06:20:32'),
(106, 52, 69, 1, 2000.00, 'credit', 'Room Revenue - Booking #192 (Ref: SSL-REF1779777754305)', 'payment', 260, '2026-05-26', '2026-05-26 06:44:31'),
(107, 52, 69, 12, 200.00, 'debit', 'Platform Commission - Booking #192', 'commission', 192, '2026-05-26', '2026-05-26 06:44:31'),
(108, 52, 89, 1, 2300.00, 'credit', 'Room Revenue - Booking #212 (Ref: HMS-MANUAL-1780904006672-212)', 'payment', 277, '2026-06-08', '2026-06-08 07:33:26'),
(109, 59, 77, 1, 20.00, 'credit', 'Room Revenue - Booking #216 (Ref: SSL-REF1780909914620)', 'payment', 280, '2026-06-08', '2026-06-08 09:12:48'),
(110, 59, 77, 10, 1.50, 'debit', 'Platform Commission - Booking #216', 'commission', 216, '2026-06-08', '2026-06-08 09:12:48'),
(111, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #222 (Ref: HMS-MANUAL-1780929141706-222)', 'payment', 283, '2026-06-08', '2026-06-08 14:32:21'),
(112, 52, 89, 1, 2200.00, 'credit', 'Room Revenue - Booking #223 (Ref: HMS-MANUAL-1780994750760-223)', 'payment', 284, '2026-06-09', '2026-06-09 08:45:50'),
(113, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #211 (Ref: HMS-MANUAL-EDIT-1781019962394-211)', 'payment', 285, '2026-06-09', '2026-06-09 15:46:02'),
(114, 52, 89, 1, 5000.00, 'credit', 'Final Settlement (Room Portion) - Booking #224', 'payment', 286, '2026-06-10', '2026-06-10 16:06:58'),
(115, 52, 89, 1, 4000.00, 'credit', 'Room Revenue - Booking #239 (Ref: HMS-MANUAL-1781107795212-239)', 'payment', 287, '2026-06-10', '2026-06-10 16:09:55'),
(116, 52, 89, 1, 4000.00, 'credit', 'Room Revenue - Booking #238 (Ref: HMS-MANUAL-1781107812712-238)', 'payment', 288, '2026-06-10', '2026-06-10 16:10:12'),
(117, 52, 89, 1, 3999.00, 'credit', 'Room Revenue - Booking #225 (Ref: HMS-MANUAL-1781107926378-225)', 'payment', 289, '2026-06-10', '2026-06-10 16:12:06'),
(118, 52, 89, 1, 2000.00, 'credit', 'Room Revenue - Booking #226 (Ref: HMS-MANUAL-1781107947579-226)', 'payment', 290, '2026-06-10', '2026-06-10 16:12:27'),
(119, 52, 89, 1, 2800.00, 'credit', 'Room Revenue - Booking #227 (Ref: HMS-MANUAL-1781107959045-227)', 'payment', 291, '2026-06-10', '2026-06-10 16:12:39'),
(120, 52, 89, 1, 5200.00, 'credit', 'Room Revenue - Booking #228 (Ref: HMS-MANUAL-1781107972977-228)', 'payment', 292, '2026-06-10', '2026-06-10 16:12:52'),
(121, 52, 89, 1, 7500.00, 'credit', 'Room Revenue - Booking #229 (Ref: HMS-MANUAL-1781107986906-229)', 'payment', 293, '2026-06-10', '2026-06-10 16:13:06'),
(122, 52, 89, 1, 2000.00, 'credit', 'Room Revenue - Booking #230 (Ref: HMS-MANUAL-1781107997049-230)', 'payment', 294, '2026-06-10', '2026-06-10 16:13:17'),
(123, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #231 (Ref: HMS-MANUAL-1781108009052-231)', 'payment', 295, '2026-06-10', '2026-06-10 16:13:29'),
(124, 52, 89, 1, 6500.00, 'credit', 'Room Revenue - Booking #232 (Ref: HMS-MANUAL-1781108021495-232)', 'payment', 296, '2026-06-10', '2026-06-10 16:13:41'),
(125, 52, 89, 1, 2000.00, 'credit', 'Room Revenue - Booking #237 (Ref: HMS-MANUAL-1781108036560-237)', 'payment', 297, '2026-06-10', '2026-06-10 16:13:56'),
(126, 52, 89, 1, 5000.00, 'credit', 'Room Revenue - Booking #236 (Ref: HMS-MANUAL-1781108047530-236)', 'payment', 298, '2026-06-10', '2026-06-10 16:14:07'),
(127, 52, 89, 1, 4000.00, 'credit', 'Room Revenue - Booking #233 (Ref: HMS-MANUAL-1781108090945-233)', 'payment', 299, '2026-06-10', '2026-06-10 16:14:50'),
(128, 52, 89, 1, 8000.00, 'credit', 'Room Revenue - Booking #234 (Ref: HMS-MANUAL-1781108106301-234)', 'payment', 300, '2026-06-10', '2026-06-10 16:15:06'),
(129, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #235 (Ref: HMS-MANUAL-1781108130595-235)', 'payment', 301, '2026-06-10', '2026-06-10 16:15:30'),
(130, 52, 89, 1, 4000.00, 'credit', 'Room Revenue - Booking #239 (Ref: HMS-MANUAL-1781255469654-239)', 'payment', 302, '2026-06-12', '2026-06-12 09:11:09'),
(131, 52, 89, 1, 13000.00, 'credit', 'Room Revenue - Booking #274 (Ref: HMS-MANUAL-1782055014648-274)', 'payment', 316, '2026-06-21', '2026-06-21 15:16:54'),
(132, 52, 89, 1, 4000.00, 'credit', 'Room Revenue - Booking #273 (Ref: HMS-MANUAL-1782055042434-273)', 'payment', 317, '2026-06-21', '2026-06-21 15:17:22'),
(133, 52, 89, 1, 17999.00, 'credit', 'Room Revenue - Booking #272 (Ref: HMS-MANUAL-1782055069682-272)', 'payment', 318, '2026-06-21', '2026-06-21 15:17:49'),
(134, 52, 89, 1, 2000.00, 'credit', 'Room Revenue - Booking #271 (Ref: HMS-MANUAL-1782055227396-271)', 'payment', 319, '2026-06-21', '2026-06-21 15:20:27'),
(135, 52, 89, 1, 5000.00, 'credit', 'Room Revenue - Booking #270 (Ref: HMS-MANUAL-1782055320801-270)', 'payment', 320, '2026-06-21', '2026-06-21 15:22:00'),
(136, 52, 89, 1, 36000.00, 'credit', 'Room Revenue - Booking #238 (Ref: HMS-MANUAL-1782055360734-238)', 'payment', 321, '2026-06-21', '2026-06-21 15:22:40'),
(137, 52, 89, 1, 4000.00, 'credit', 'Room Revenue - Booking #242 (Ref: HMS-MANUAL-1782055427998-242)', 'payment', 322, '2026-06-21', '2026-06-21 15:23:48'),
(138, 52, 89, 1, 2000.00, 'credit', 'Room Revenue - Booking #263 (Ref: HMS-MANUAL-1782055457567-263)', 'payment', 323, '2026-06-21', '2026-06-21 15:24:17'),
(139, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #264 (Ref: HMS-MANUAL-1782055474367-264)', 'payment', 324, '2026-06-21', '2026-06-21 15:24:34'),
(140, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #265 (Ref: HMS-MANUAL-1782055484376-265)', 'payment', 325, '2026-06-21', '2026-06-21 15:24:44'),
(141, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #266 (Ref: HMS-MANUAL-1782055495362-266)', 'payment', 326, '2026-06-21', '2026-06-21 15:24:55'),
(142, 52, 89, 1, 10000.00, 'credit', 'Room Revenue - Booking #267 (Ref: HMS-MANUAL-1782055518483-267)', 'payment', 327, '2026-06-21', '2026-06-21 15:25:18'),
(143, 52, 89, 1, 6000.00, 'credit', 'Room Revenue - Booking #268 (Ref: HMS-MANUAL-1782055527963-268)', 'payment', 328, '2026-06-21', '2026-06-21 15:25:27'),
(144, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #269 (Ref: HMS-MANUAL-1782055539058-269)', 'payment', 329, '2026-06-21', '2026-06-21 15:25:39'),
(145, 52, 69, 1, 2500.00, 'credit', 'Room Revenue - Booking #287 (Ref: SSL-REF1782468828438)', 'payment', 341, '2026-06-26', '2026-06-26 10:16:24'),
(146, 52, 69, 12, 250.00, 'debit', 'Platform Commission - Booking #287', 'commission', 287, '2026-06-26', '2026-06-26 10:16:24'),
(147, 52, 69, 1, 2500.00, 'credit', 'Room Revenue - Booking #289 (Ref: SSL-REF1782537888829)', 'payment', 343, '2026-06-27', '2026-06-27 05:25:37'),
(148, 52, 69, 12, 250.00, 'debit', 'Platform Commission - Booking #289', 'commission', 289, '2026-06-27', '2026-06-27 05:25:37'),
(149, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #290 (Ref: HMS-MANUAL-1782570416655-290)', 'payment', 344, '2026-06-27', '2026-06-27 14:26:56'),
(150, 52, 80, 1, 55.00, 'credit', 'Room Revenue - Booking #293 (Ref: SSL-REF1782642031619)', 'payment', 346, '2026-06-28', '2026-06-28 10:21:15'),
(151, 52, 80, 12, 5.50, 'debit', 'Platform Commission - Booking #293', 'commission', 293, '2026-06-28', '2026-06-28 10:21:15'),
(152, 52, 69, 1, 2500.00, 'credit', 'Room Revenue - Booking #303 (Ref: SSL-REF1783098605239)', 'payment', 353, '2026-07-03', '2026-07-03 17:11:21'),
(153, 52, 69, 12, 250.00, 'debit', 'Platform Commission - Booking #303', 'commission', 303, '2026-07-03', '2026-07-03 17:11:21'),
(154, 52, 80, 1, 3500.00, 'credit', 'Room Revenue - Booking #318 (Ref: SSL-REF1783939460283)', 'payment', 358, '2026-07-13', '2026-07-13 10:47:52'),
(155, 52, 80, 12, 350.00, 'debit', 'Platform Commission - Booking #318', 'commission', 318, '2026-07-13', '2026-07-13 10:47:52'),
(156, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #329 (Ref: SSL-REF1784356470827)', 'payment', 363, '2026-07-18', '2026-07-18 06:36:58'),
(157, 52, 89, 12, 350.00, 'debit', 'Platform Commission - Booking #329', 'commission', 329, '2026-07-18', '2026-07-18 06:36:58'),
(158, 52, 70, 1, 3500.00, 'credit', 'Room Revenue - Booking #330 (Ref: SSL-REF1784393331139)', 'payment', 365, '2026-07-18', '2026-07-18 16:49:34'),
(159, 52, 70, 12, 350.00, 'debit', 'Platform Commission - Booking #330', 'commission', 330, '2026-07-18', '2026-07-18 16:49:34'),
(160, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #338 (Ref: SSL-REF1784616289143)', 'payment', 371, '2026-07-21', '2026-07-21 06:45:45'),
(161, 52, 89, 12, 250.00, 'debit', 'Platform Commission - Booking #338', 'commission', 338, '2026-07-21', '2026-07-21 06:45:45'),
(162, 52, 89, 1, 2500.00, 'credit', 'Room Revenue - Booking #339 (Ref: SSL-REF1784616452089)', 'payment', 373, '2026-07-21', '2026-07-21 06:48:20'),
(163, 52, 89, 12, 250.00, 'debit', 'Platform Commission - Booking #339', 'commission', 339, '2026-07-21', '2026-07-21 06:48:20'),
(164, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #340 (Ref: HMS-MANUAL-1784619890917-340)', 'payment', 374, '2026-07-21', '2026-07-21 07:44:50'),
(165, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #341 (Ref: HMS-MANUAL-1784620115272-341)', 'payment', 375, '2026-07-21', '2026-07-21 07:48:35'),
(166, 52, 89, 1, 18000.00, 'credit', 'Room Revenue - Booking #343 (Ref: HMS-MANUAL-1784620859240-343)', 'payment', 376, '2026-07-21', '2026-07-21 08:00:59'),
(167, 52, 89, 1, 15500.00, 'credit', 'Room Revenue - Booking #344 (Ref: HMS-MANUAL-1784627569355-344)', 'payment', 377, '2026-07-21', '2026-07-21 09:52:49'),
(168, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #345 (Ref: HMS-MANUAL-1784629463625-345)', 'payment', 378, '2026-07-21', '2026-07-21 10:24:23'),
(169, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #346 (Ref: HMS-MANUAL-1784629558881-346)', 'payment', 379, '2026-07-21', '2026-07-21 10:25:58'),
(170, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #347 (Ref: HMS-MANUAL-1784629668845-347)', 'payment', 380, '2026-07-21', '2026-07-21 10:27:48'),
(171, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #349 (Ref: HMS-MANUAL-1784629922486-349)', 'payment', 381, '2026-07-21', '2026-07-21 10:32:02'),
(172, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #348 (Ref: HMS-MANUAL-1784630618264-348)', 'payment', 382, '2026-07-21', '2026-07-21 10:43:38'),
(173, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #350 (Ref: HMS-MANUAL-1784630709531-350)', 'payment', 383, '2026-07-21', '2026-07-21 10:45:09'),
(174, 52, 89, 1, 2494.00, 'credit', 'Room Revenue - Booking #351 (Ref: HMS-MANUAL-1784630782993-351)', 'payment', 384, '2026-07-21', '2026-07-21 10:46:22'),
(175, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #352 (Ref: HMS-MANUAL-1784631388165-352)', 'payment', 385, '2026-07-21', '2026-07-21 10:56:28'),
(176, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #353 (Ref: HMS-MANUAL-1784631449744-353)', 'payment', 386, '2026-07-21', '2026-07-21 10:57:29'),
(177, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #354 (Ref: HMS-MANUAL-1784631539525-354)', 'payment', 387, '2026-07-21', '2026-07-21 10:58:59'),
(178, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #355 (Ref: HMS-MANUAL-1784631681441-355)', 'payment', 388, '2026-07-21', '2026-07-21 11:01:21'),
(179, 52, 89, 1, 6305.00, 'credit', 'Room Revenue - Booking #356 (Ref: HMS-MANUAL-1784647739815-356)', 'payment', 389, '2026-07-21', '2026-07-21 15:28:59'),
(180, 52, 89, 1, 6.00, 'credit', 'Final Settlement (Room Portion) - Booking #351', 'payment', 390, '2026-07-22', '2026-07-22 07:18:22'),
(181, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #361 (Ref: SSL-HMSPAY1784789363867)', 'payment', 394, '2026-07-23', '2026-07-23 06:50:26'),
(182, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #362 (Ref: SSL-HMSPAY1784794655954)', 'payment', 395, '2026-07-23', '2026-07-23 08:17:59'),
(183, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #363 (Ref: SSL-HMSPAY1784813905167)', 'payment', 396, '2026-07-23', '2026-07-23 13:39:57'),
(184, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #364 (Ref: SSL-HMSPAY1784885782986)', 'payment', 397, '2026-07-24', '2026-07-24 09:37:00'),
(185, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #365 (Ref: SSL-HMSPAY1784885986783)', 'payment', 398, '2026-07-24', '2026-07-24 09:40:12'),
(186, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #366 (Ref: SSL-HMSPAY1784911990110)', 'payment', 399, '2026-07-24', '2026-07-24 16:53:39'),
(187, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #369 (Ref: SSL-HMSPAY1784972895614)', 'payment', 402, '2026-07-25', '2026-07-25 09:49:31'),
(188, 52, 89, 1, 500.00, 'credit', 'Final Settlement (Room Portion) - Booking #366', 'payment', 403, '2026-07-25', '2026-07-25 13:34:15'),
(189, 52, 89, 1, 500.00, 'credit', 'Room Revenue - Booking #366 (Ref: INV-HMS-1784911690686-33-9629)', 'payment', 404, '2026-07-25', '2026-07-25 13:34:46'),
(190, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #370 (Ref: SSL-REF1785044311309)', 'payment', 406, '2026-07-26', '2026-07-26 05:39:48'),
(191, 52, 89, 12, 350.00, 'debit', 'Platform Commission - Booking #370', 'commission', 370, '2026-07-26', '2026-07-26 05:39:48'),
(192, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #375 (Ref: SSL-REF1785077187989)', 'payment', 409, '2026-07-26', '2026-07-26 14:47:00'),
(193, 52, 89, 12, 350.00, 'debit', 'Platform Commission - Booking #375', 'commission', 375, '2026-07-26', '2026-07-26 14:47:00'),
(194, 52, 89, 1, 5000.00, 'credit', 'Room Revenue - Booking #377 (Ref: SSL-HMSPAY1785147004337)', 'payment', 411, '2026-07-27', '2026-07-27 10:11:49'),
(195, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #378 (Ref: SSL-HMSPAY1785165748527)', 'payment', 412, '2026-07-27', '2026-07-27 15:23:17'),
(196, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #379 (Ref: SSL-HMSPAY1785222267764)', 'payment', 413, '2026-07-28', '2026-07-28 07:04:58'),
(197, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #381 (Ref: SSL-HMSPAY1785228396654)', 'payment', 414, '2026-07-28', '2026-07-28 08:47:48'),
(198, 52, 89, 1, 6000.00, 'credit', 'Room Revenue - Booking #384 (Ref: SSL-HMSPAY1785233398513)', 'payment', 417, '2026-07-28', '2026-07-28 10:11:59'),
(199, 52, 89, 1, 6000.00, 'credit', 'Room Revenue - Booking #387 (Ref: SSL-HMSPAY1785250620712)', 'payment', 418, '2026-07-28', '2026-07-28 14:57:44'),
(200, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #388 (Ref: SSL-HMSPAY1785253924296)', 'payment', 419, '2026-07-28', '2026-07-28 15:52:45'),
(201, 52, 89, 1, 2700.00, 'credit', 'Room Revenue - Booking #391 (Ref: SSL-HMSPAY1785331137265)', 'payment', 421, '2026-07-29', '2026-07-29 13:20:35'),
(202, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #392 (Ref: SSL-HMSPAY1785336525109)', 'payment', 422, '2026-07-29', '2026-07-29 14:50:17'),
(203, 52, 89, 1, 6300.00, 'credit', 'Room Revenue - Booking #393 (Ref: SSL-HMSPAY1785345219717)', 'payment', 424, '2026-07-29', '2026-07-29 17:14:15'),
(204, 59, 77, 1, 5.00, 'credit', 'Room Revenue - Booking #398 (Ref: CR-1785405572201-398)', 'payment', 430, '2026-07-30', '2026-07-30 09:59:32'),
(205, 59, 77, 10, 0.50, 'debit', 'Platform Commission - Booking #398', 'commission', 398, '2026-07-30', '2026-07-30 09:59:32'),
(206, 59, 77, 11, 5.00, 'debit', 'Refund for Booking #398 - Ref: REF-1785405653643-398', 'refund', 17, '2026-07-30', '2026-07-30 10:01:03'),
(207, 59, 77, 1, 5.00, 'credit', 'Room Revenue - Booking #399 (Ref: CR-1785405666189-399)', 'payment', 433, '2026-07-30', '2026-07-30 10:01:06'),
(208, 59, 77, 10, 0.50, 'debit', 'Platform Commission - Booking #399', 'commission', 399, '2026-07-30', '2026-07-30 10:01:06'),
(209, 59, 77, 11, 5.00, 'debit', 'Refund for Booking #399 - Ref: REF-1785405703800-399', 'refund', 18, '2026-07-30', '2026-07-30 10:01:55'),
(210, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #397 (Ref: SSL-HMSPAY1785410912121)', 'payment', 450, '2026-07-30', '2026-07-30 11:29:32'),
(211, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #400 (Ref: CR-1785411054306-400)', 'payment', 453, '2026-07-30', '2026-07-30 11:30:54'),
(212, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #415 (Ref: CR-1785417212160-415)', 'payment', 458, '2026-07-30', '2026-07-30 13:13:32'),
(213, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #416 (Ref: CR-1785417763696-416)', 'payment', 461, '2026-07-30', '2026-07-30 13:22:44'),
(214, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #417 (Ref: CR-1785433683617-417)', 'payment', 464, '2026-07-30', '2026-07-30 17:48:06'),
(215, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #418 (Ref: SSL-HMSPAY1785452876714)', 'payment', 465, '2026-07-30', '2026-07-30 23:08:47'),
(216, 52, 89, 1, 2700.00, 'credit', 'Room Revenue - Booking #424 (Ref: CR-1785492218360-424)', 'payment', 470, '2026-07-31', '2026-07-31 10:03:38'),
(217, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #423 (Ref: SSL-HMSPAY1785499556658)', 'payment', 471, '2026-07-31', '2026-07-31 12:06:30'),
(218, 52, 89, 1, 6000.00, 'credit', 'Room Revenue - Booking #422 (Ref: SSL-HMSPAY1785499627168)', 'payment', 472, '2026-07-31', '2026-07-31 12:07:47'),
(219, 52, 89, 1, 6000.00, 'credit', 'Room Revenue - Booking #421 (Ref: SSL-HMSPAY1785500955929)', 'payment', 473, '2026-07-31', '2026-07-31 12:29:56'),
(220, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #425 (Ref: SSL-HMSPAY1785504405544)', 'payment', 474, '2026-07-31', '2026-07-31 13:27:26'),
(221, 52, 89, 1, 3500.00, 'credit', 'Room Revenue - Booking #426 (Ref: SSL-HMSPAY1785517349455)', 'payment', 476, '2026-07-31', '2026-07-31 17:03:10'),
(222, 52, 89, 1, 3000.00, 'credit', 'Room Revenue - Booking #427 (Ref: CR-1785530969653-427)', 'payment', 480, '2026-07-31', '2026-07-31 20:49:30');

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

--
-- Dumping data for table `hms_accounts_vouchers`
--

INSERT INTO `hms_accounts_vouchers` (`id`, `host_id`, `property_id`, `voucher_no`, `type`, `date`, `total_amount`, `remarks`, `created_by`, `created_at`) VALUES
(1, 81, 88, 'R432457', 'receipt', '2026-05-26', 500.00, '', 81, '2026-05-26 06:20:32');

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
(1, 59, 'House Rent', 'percentage', 50.00, '2026-04-26 05:17:05'),
(2, 52, 'Basic Salary', 'fixed', 10000.00, '2026-06-11 06:52:10');

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

--
-- Dumping data for table `hms_bills`
--

INSERT INTO `hms_bills` (`id`, `host_id`, `booking_id`, `guest_name`, `service_name`, `amount`, `created_at`) VALUES
(13, 52, 366, 'MD. SOFIUL ALAM', 'Extra guests', 500.00, '2026-07-25 05:14:53');

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
(4, 59, 'Operation', '---', 'active', '2026-05-23 08:25:03', '2026-05-23 08:25:03'),
(5, 81, 'Front Office', 'Front office operations and guest services', 'active', '2026-05-26 06:14:47', '2026-05-26 06:14:47'),
(6, 52, 'Management', 'Management', 'active', '2026-06-11 06:50:16', '2026-06-11 06:50:16'),
(7, 52, 'Non Management', 'Non Management', 'active', '2026-06-11 06:50:43', '2026-06-11 06:50:43'),
(8, 52, 'Operation', 'Operation', 'active', '2026-06-11 06:51:03', '2026-06-11 06:51:03');

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
(5, 59, 'Accountant', '---', 'active', '2026-05-23 08:26:00', '2026-05-23 08:26:00'),
(6, 81, 'Front Desk Executive', '', 'active', '2026-05-26 06:12:55', '2026-05-26 06:12:55');

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
(2, 78, 1, 4, 'clean', 'medium', 'gfgf', NULL, '2026-05-05 13:10:26', '2026-05-05 07:10:09', '2026-05-05 07:10:26'),
(3, 88, 16, 0, 'cleaning', 'medium', '', NULL, NULL, '2026-05-26 05:48:42', '2026-05-26 05:49:15'),
(4, 88, 18, 0, 'inspected', 'medium', '', NULL, '2026-05-26 02:08:21', '2026-05-26 06:07:34', '2026-05-26 06:08:21');

-- --------------------------------------------------------

--
-- Table structure for table `hms_invoices`
--

CREATE TABLE `hms_invoices` (
  `id` int(11) NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `invoice_type` varchar(50) DEFAULT 'full',
  `amount` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `items_json` text DEFAULT NULL,
  `generated_at` datetime DEFAULT current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_invoices`
--

INSERT INTO `hms_invoices` (`id`, `booking_id`, `invoice_number`, `invoice_type`, `amount`, `notes`, `items_json`, `generated_at`, `created_at`) VALUES
(1, 366, 'INV-HMS-1784911690686-33-9629', 'partial', 500.00, NULL, '[{\"type\":\"extra\",\"amount\":500,\"label\":\"Extra Services (Partial)\",\"description\":\"Service charges and extra room amenities\"}]', '2026-07-25 09:34:46', '2026-07-25 09:34:46'),
(2, 373, 'INV-HMS-1785070448118-86-2826', 'partial', 4500.00, NULL, '[{\"type\":\"room\",\"amount\":4500,\"label\":\"Accommodation: Room 105 (Partial)\",\"description\":\"Executive Suite · Keyhost Bashundhara unit\"}]', '2026-07-26 08:54:23', '2026-07-26 08:54:23');

-- --------------------------------------------------------

--
-- Table structure for table `hms_maintenance_notifications`
--

CREATE TABLE `hms_maintenance_notifications` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `notification_date` date NOT NULL,
  `is_sent` tinyint(1) DEFAULT 0,
  `sent_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_maintenance_tasks`
--

CREATE TABLE `hms_maintenance_tasks` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `property_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `task_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT 0.00,
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurrence_interval` int(11) DEFAULT 0,
  `next_due_date` date DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_maintenance_types`
--

CREATE TABLE `hms_maintenance_types` (
  `id` int(11) NOT NULL,
  `host_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hms_maintenance_types`
--

INSERT INTO `hms_maintenance_types` (`id`, `host_id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 59, 'Pest Control', 'Regular pest control and bug spraying.', '2026-07-09 09:09:59', '2026-07-09 09:09:59'),
(2, 59, 'Plumbing & Pipe Fixing', 'Plumbing checks, leaks repairs, and pipe fixing.', '2026-07-09 09:09:59', '2026-07-09 09:09:59'),
(3, 59, 'AC Servicing & Repair', 'AC cleaning, gas refilling, and repairs.', '2026-07-09 09:09:59', '2026-07-09 09:09:59'),
(4, 59, 'Painting & Touch-up', 'Painting touch-ups, wall repair, and refinishing.', '2026-07-09 09:09:59', '2026-07-09 09:09:59'),
(5, 59, 'Electrical & Wire Check', 'Electrical switch, wiring, and appliance inspections.', '2026-07-09 09:09:59', '2026-07-09 09:09:59'),
(6, 59, 'General Quality Inspection', 'Routine room quality and cleanliness inspection.', '2026-07-09 09:09:59', '2026-07-09 09:09:59'),
(7, 52, 'Pest Control', 'Regular pest control and bug spraying.', '2026-07-11 12:14:27', '2026-07-11 12:14:27'),
(8, 52, 'AC Servicing & Repair', 'AC cleaning, gas refilling, and repairs.', '2026-07-11 12:14:27', '2026-07-11 12:14:27'),
(9, 52, 'Plumbing & Pipe Fixing', 'Plumbing checks, leaks repairs, and pipe fixing.', '2026-07-11 12:14:27', '2026-07-11 12:14:27'),
(10, 52, 'Electrical & Wire Check', 'Electrical switch, wiring, and appliance inspections.', '2026-07-11 12:14:27', '2026-07-11 12:14:27'),
(11, 52, 'General Quality Inspection', 'Routine room quality and cleanliness inspection.', '2026-07-11 12:14:27', '2026-07-11 12:14:27'),
(12, 52, 'Painting & Touch-up', 'Painting touch-ups, wall repair, and refinishing.', '2026-07-11 12:14:27', '2026-07-11 12:14:27'),
(13, 75, 'Pest Control', 'Regular pest control and bug spraying.', '2026-07-28 05:04:14', '2026-07-28 05:04:14'),
(14, 75, 'Plumbing & Pipe Fixing', 'Plumbing checks, leaks repairs, and pipe fixing.', '2026-07-28 05:04:14', '2026-07-28 05:04:14'),
(15, 75, 'AC Servicing & Repair', 'AC cleaning, gas refilling, and repairs.', '2026-07-28 05:04:14', '2026-07-28 05:04:14'),
(16, 75, 'Electrical & Wire Check', 'Electrical switch, wiring, and appliance inspections.', '2026-07-28 05:04:14', '2026-07-28 05:04:14'),
(17, 75, 'General Quality Inspection', 'Routine room quality and cleanliness inspection.', '2026-07-28 05:04:14', '2026-07-28 05:04:14'),
(18, 75, 'Painting & Touch-up', 'Painting touch-ups, wall repair, and refinishing.', '2026-07-28 05:04:14', '2026-07-28 05:04:14');

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
(1, 78, '101', 'Standard', '1st', 10.00, 'occupied', '[]', '[\"/uploads/rooms/hms-room-1785217486045-604923938.webp\",\"/uploads/rooms/hms-room-1785133491565-4094112.webp\"]', '2026-04-21 09:42:36', '2026-08-01 05:30:24'),
(2, 78, '102', 'Deluxe', '1st', 2500.00, 'available', '[]', '[\"/uploads/rooms/hms-room-1785057297669-725790396.webp\",\"/uploads/rooms/hms-room-1785057276676-200974588.webp\",\"/uploads/rooms/hms-room-1785057276719-582427248.webp\"]', '2026-04-22 04:46:18', '2026-07-26 09:14:57'),
(3, 78, '201', 'Executive Suite', '2nd', 5000.00, 'available', '[]', NULL, '2026-04-22 05:14:54', '2026-04-22 05:14:54'),
(4, 78, '202', 'Executive Suite', '2nd', 5000.00, 'available', '[]', NULL, '2026-04-22 05:14:54', '2026-04-22 05:14:54'),
(5, 78, '203', 'Executive Suite', '2nd', 5000.00, 'available', '[]', NULL, '2026-04-22 05:14:54', '2026-04-22 05:14:54'),
(6, 78, '301', 'Penthouse', '3rd', 10000.00, 'available', '[]', '[\"/uploads/rooms/hms-room-1776837802814-453399316.webp\",\"/uploads/rooms/hms-room-1776837802950-501778318.webp\",\"/uploads/rooms/hms-room-1776837803071-415129616.webp\",\"/uploads/rooms/hms-room-1776837803185-181445928.webp\",\"/uploads/rooms/hms-room-1776837803265-149123595.webp\",\"/uploads/rooms/hms-room-1776837803431-990404244.webp\"]', '2026-04-22 06:03:23', '2026-04-22 06:03:23'),
(7, 77, 'Entire Place', 'room', '1', 5.00, 'occupied', '[]', '[\"/uploads/properties/prop-1776748949018-849122918.webp\",\"/uploads/properties/prop-1776748949077-673326158.webp\",\"/uploads/properties/prop-1776748949078-997939413.webp\",\"/uploads/properties/prop-1776748949078-946238831.webp\",\"/uploads/properties/prop-1776748949079-362828889.webp\",\"/uploads/properties/prop-1776748949080-570666938.webp\",\"/uploads/properties/prop-1776748949080-460153548.webp\"]', '2026-05-24 01:44:45', '2026-07-30 09:34:44'),
(8, 82, 'Entire Place', 'room', '1', 0.00, 'available', '[]', '[]', '2026-05-24 10:17:49', '2026-05-24 10:17:49'),
(9, 84, 'Entire Place', 'room', '1', 0.00, 'available', '[]', '[]', '2026-05-24 10:19:56', '2026-05-24 10:19:56'),
(10, 85, 'Entire Place', 'room', '1', 0.00, 'available', '[]', '[]', '2026-05-24 10:27:17', '2026-05-24 10:27:17'),
(11, 86, 'Entire Place', 'room', '1', 0.00, 'available', '[]', '[]', '2026-05-26 04:48:31', '2026-05-26 04:48:31'),
(12, 87, 'Entire Place', 'room', '1', 0.00, 'available', '[]', '[]', '2026-05-26 04:59:36', '2026-05-26 04:59:36'),
(13, 70, 'Entire Place', 'room', '1', 3500.00, 'available', '[]', '[\"/uploads/properties/prop-1774946904596-554519145.webp\",\"/uploads/properties/prop-1774946904598-906486603.webp\"]', '2026-05-26 05:05:07', '2026-07-15 11:40:35'),
(14, 69, 'Entire Place', 'room', '1', 3500.00, 'dirty', '[]', '[\"/uploads/properties/prop-1774946292286-329981000.webp\",\"/uploads/properties/prop-1774946292296-513356222.webp\",\"/uploads/properties/prop-1774946292297-755190144.webp\"]', '2026-05-26 05:08:42', '2026-07-08 09:33:10'),
(15, 88, 'Entire Place', 'room', '1', 0.00, 'available', '[]', '[]', '2026-05-26 05:18:58', '2026-05-26 05:18:58'),
(16, 88, '102', 'Standard', '1st', 6000.00, 'maintenance', '[]', NULL, '2026-05-26 05:44:42', '2026-05-26 05:49:15'),
(17, 88, '103', 'Standard', '1st', 6000.00, 'dirty', '[]', NULL, '2026-05-26 05:44:42', '2026-05-26 06:06:55'),
(18, 88, '104', 'Standard', '2nd', 7000.00, 'available', '[]', '[]', '2026-05-26 06:03:56', '2026-05-26 06:08:07'),
(19, 88, '105', 'Standard', '2nd', 6000.00, 'available', '[]', NULL, '2026-05-26 06:04:22', '2026-05-26 06:04:22'),
(20, 88, '106', 'Standard', '2nd', 6000.00, 'available', '[]', NULL, '2026-05-26 06:04:22', '2026-05-26 06:04:22'),
(21, 89, '104', 'Executive Suite', '1st', 3500.00, 'occupied', '[]', '[\"/uploads/rooms/hms-room-1784400111272-340895806.webp\"]', '2026-05-26 09:50:49', '2026-08-01 03:57:29'),
(22, 89, '101', 'Deluxe', '1st Floor', 3500.00, 'occupied', '[]', '[\"/uploads/rooms/hms-room-1784536037056-863796292.webp\"]', '2026-05-26 10:04:54', '2026-07-31 09:59:00'),
(23, 89, '102', 'Deluxe', '1st Floor', 3500.00, 'occupied', '[]', '[\"http://localhost:5000/uploads/rooms/hms-room-1779789934367-311734129.webp\",\"http://localhost:5000/uploads/rooms/hms-room-1779789934538-336245572.webp\",\"/uploads/rooms/hms-room-1783159950255-304335836.webp\"]', '2026-05-26 10:05:34', '2026-07-31 14:49:50'),
(25, 89, '103', 'Deluxe', '1st floor', 3500.00, 'dirty', '[]', '[]', '2026-06-08 06:58:17', '2026-07-30 13:03:09'),
(26, 89, '105', 'Executive Suite', '1st Floor', 3000.00, 'occupied', '[]', '[]', '2026-06-21 14:14:06', '2026-07-31 10:07:41'),
(27, 89, '106', 'Executive Suite', '1st Floor', 3500.00, 'occupied', '[]', '[]', '2026-06-21 14:14:38', '2026-07-31 13:05:11'),
(28, 80, 'Entire Place', 'room', '1', 3500.00, 'available', '[]', '[\"/uploads/properties/prop-1779006643838-420176868.webp\",\"/uploads/properties/prop-1779006643840-102084149.webp\"]', '2026-06-29 14:04:07', '2026-07-13 10:04:27'),
(29, 105, 'Entire Place', 'room', '1', 2199.00, 'available', '[]', '[\"/uploads/properties/prop-1784559459110-824510978.webp\",\"/uploads/properties/prop-1784559459113-382862987.webp\",\"/uploads/properties/prop-1784559459113-873076848.webp\",\"/uploads/properties/prop-1784559459114-642200363.webp\",\"/uploads/properties/prop-1784559459114-858318404.webp\",\"/uploads/properties/prop-1784559459115-893552733.webp\",\"/uploads/properties/prop-1784559459115-391313715.webp\"]', '2026-07-20 15:11:44', '2026-07-20 15:11:44'),
(30, 106, 'Entire Place', 'room', '1', 1899.00, 'available', '[]', '[\"/uploads/properties/prop-1784559653667-215596733.webp\",\"/uploads/properties/prop-1784559653668-82738285.webp\",\"/uploads/properties/prop-1784559653668-226843964.webp\",\"/uploads/properties/prop-1784559653668-742625066.webp\",\"/uploads/properties/prop-1784559653669-244273511.webp\"]', '2026-07-20 15:11:44', '2026-07-20 15:11:44'),
(31, 107, 'Entire Place', 'room', '1', 1599.00, 'available', '[]', '[\"/uploads/properties/prop-1784560085625-557087345.webp\",\"/uploads/properties/prop-1784560085626-747218830.webp\",\"/uploads/properties/prop-1784560085626-771956796.webp\",\"/uploads/properties/prop-1784560085626-813954314.webp\",\"/uploads/properties/prop-1784560085627-760474186.webp\"]', '2026-07-20 15:11:44', '2026-07-20 15:11:44'),
(32, 108, 'Entire Place', 'room', '1', 2299.00, 'available', '[]', '[\"/uploads/properties/prop-1784561108981-606428845.webp\",\"/uploads/properties/prop-1784561108981-165127183.webp\",\"/uploads/properties/prop-1784561108982-243706770.webp\",\"/uploads/properties/prop-1784561108982-130445028.webp\",\"/uploads/properties/prop-1784561108982-696472368.webp\",\"/uploads/properties/prop-1784561108982-659213094.webp\",\"/uploads/properties/prop-1784561108983-613942090.webp\"]', '2026-07-20 15:23:09', '2026-07-20 15:25:09'),
(33, 109, 'Entire Place', 'room', '1', 0.00, 'available', '[]', '[]', '2026-07-20 15:25:34', '2026-07-20 15:25:34'),
(34, 110, 'Entire Place', 'room', '1', 1899.00, 'available', '[]', '[\"/uploads/properties/prop-1784561280811-641711541.webp\",\"/uploads/properties/prop-1784561280812-718136615.webp\",\"/uploads/properties/prop-1784561280812-783043249.webp\",\"/uploads/properties/prop-1784561280813-321957252.webp\",\"/uploads/properties/prop-1784561280813-12562704.webp\"]', '2026-07-20 15:26:15', '2026-07-20 15:28:01');

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
(3, 59, 'active', 'basic', '2026-05-04 15:21:46', '2026-05-11 15:21:46', '2026-08-05 04:20:24', 1, '2026-05-04 09:21:46', '2026-07-06 08:20:24', 1),
(4, 52, 'active', 'basic', '2026-07-19 08:27:10', '2026-07-26 08:27:10', '2026-08-28 09:09:49', 1, '2026-05-26 04:46:09', '2026-07-29 13:09:49', 1),
(5, 81, 'expired', 'basic', NULL, NULL, '2026-06-25 01:15:12', 0, '2026-05-26 05:15:12', '2026-06-26 04:00:00', 1),
(6, 50, 'expired', 'basic', '2026-06-29 03:39:47', '2026-07-06 03:39:47', NULL, 1, '2026-06-29 07:39:47', '2026-07-07 04:00:00', 2),
(7, 64, 'expired', 'basic', '2026-06-29 03:39:52', '2026-07-06 03:39:52', NULL, 1, '2026-06-29 07:39:52', '2026-07-07 04:00:00', 2),
(8, 138, 'inactive', 'basic', NULL, NULL, NULL, 0, '2026-07-04 08:01:59', '2026-07-04 08:01:59', NULL),
(9, 129, 'inactive', 'basic', NULL, NULL, NULL, 0, '2026-07-10 09:46:24', '2026-07-10 09:46:24', NULL),
(10, 163, 'active', 'basic', NULL, NULL, '2026-08-19 11:11:48', 0, '2026-07-20 15:11:44', '2026-07-20 15:11:48', 1),
(11, 75, 'trialing', 'basic', '2026-07-28 01:03:39', '2026-08-04 01:03:39', NULL, 1, '2026-07-28 05:03:39', '2026-07-28 05:03:39', 2);

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
(10, 14, 74, 'Hello, I\'m interested in your property. Could you provide more details about the amenities and check-in times? Thank you!', 1, '2026-05-22 15:26:55'),
(11, 15, 74, 'Hi Reservation2! I\'ll be visiting...', 1, '2026-05-22 15:46:19'),
(12, 16, 74, 'Hello, I\'m interested in your property. Please let me know more details.', 1, '2026-05-22 16:30:28'),
(13, 15, 52, 'Test', 0, '2026-06-07 06:54:49'),
(14, 17, 103, 'ভাই আমি বুকিং করতে চাচ্ছি', 1, '2026-06-18 11:59:54'),
(15, 17, 103, 'Hlw brother ', 1, '2026-06-18 12:03:05'),
(16, 17, 103, 'Hlw', 1, '2026-06-18 12:03:18'),
(17, 18, 142, 'Hi KeyHost ! I\'ll be visiting...', 1, '2026-07-05 08:00:38'),
(18, 19, 75, 'Hi Rony! I\'ll be visiting...', 0, '2026-07-28 05:10:46'),
(19, 20, 59, 'Hi KeyHost ! I\'ll bhie visiting...', 0, '2026-07-28 05:11:35'),
(20, 21, 172, 'Hi MD RASHEDUL! I\'ll be visiting...contact number plz', 0, '2026-07-29 09:35:43');

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
(105, 185, 'REF1779571810709', NULL, 2500.00, 'PENDING', '2026-05-23 21:30:10', '2026-05-23 21:30:10', 0, 0.00, NULL, NULL),
(106, 187, 'REF1779599353353', '260524111026943591557a00f42', 2500.00, 'Success', '2026-05-24 05:09:13', '2026-05-24 05:10:27', 0, 0.00, NULL, NULL),
(107, 192, 'REF1779777754305', '260526124429238701957959bcd', 2000.00, 'Success', '2026-05-26 06:42:34', '2026-05-26 06:44:31', 0, 0.00, NULL, NULL),
(108, 197, 'REF1780553395997', NULL, 55.00, 'PENDING', '2026-06-04 06:09:55', '2026-06-04 06:09:55', 0, 0.00, NULL, NULL),
(109, 199, 'REF1780576182706', NULL, 4000.00, 'PENDING', '2026-06-04 12:29:42', '2026-06-04 12:29:42', 0, 0.00, NULL, NULL),
(110, 200, 'REF1780576421892', NULL, 2500.00, 'PENDING', '2026-06-04 12:33:41', '2026-06-04 12:33:41', 0, 0.00, NULL, NULL),
(111, 201, 'REF1780576598376', NULL, 2500.00, 'PENDING', '2026-06-04 12:36:38', '2026-06-04 12:36:38', 0, 0.00, NULL, NULL),
(112, 202, 'REF1780578559468', NULL, 2500.00, 'PENDING', '2026-06-04 13:09:19', '2026-06-04 13:09:19', 0, 0.00, NULL, NULL),
(113, 203, 'REF1780581285487', NULL, 2500.00, 'PENDING', '2026-06-04 13:54:45', '2026-06-04 13:54:45', 0, 0.00, NULL, NULL),
(114, 204, 'REF1780582382391', NULL, 4.00, 'PENDING', '2026-06-04 14:13:02', '2026-06-04 14:13:02', 0, 0.00, NULL, NULL),
(115, 206, 'REF1780583577139', NULL, 20.00, 'PENDING', '2026-06-04 14:32:57', '2026-06-04 14:32:57', 0, 0.00, NULL, NULL),
(116, 208, 'REF1780653606558', '26060516010445142259853dd00', 5200.00, 'Success', '2026-06-05 10:00:06', '2026-06-05 10:01:05', 0, 0.00, NULL, NULL),
(117, 214, 'REF1780909626822', NULL, 20.00, 'PENDING', '2026-06-08 09:07:06', '2026-06-08 09:07:06', 0, 0.00, NULL, NULL),
(118, 216, 'REF1780909914620', '260608153035AVyjpI8nqYdSB', 20.00, 'Success', '2026-06-08 09:11:54', '2026-06-08 09:30:36', 0, 0.00, NULL, NULL),
(119, 221, 'REF1780924207367', '26060819125096819703047dee2', 2500.00, 'Success', '2026-06-08 13:10:07', '2026-06-08 13:12:52', 0, 0.00, NULL, NULL),
(120, 248, 'REF1781512323919', NULL, 2500.00, 'PENDING', '2026-06-15 08:32:03', '2026-06-15 08:32:03', 0, 0.00, NULL, NULL),
(121, 251, 'REF1781594977735', NULL, 2500.00, 'PENDING', '2026-06-16 07:29:37', '2026-06-16 07:29:37', 0, 0.00, NULL, NULL),
(122, 252, 'REF1781600570387', '2606161504015160911344a8041', 2500.00, 'Success', '2026-06-16 09:02:50', '2026-06-16 09:04:02', 0, 0.00, NULL, NULL),
(123, 254, 'REF1781686940643', '2606171505280210898538b2398', 2500.00, 'Success', '2026-06-17 09:02:20', '2026-06-17 09:05:30', 0, 0.00, NULL, NULL),
(124, 256, 'REF1781786197748', '260618183746595966554efb62a', 2500.00, 'Success', '2026-06-18 12:36:37', '2026-06-18 12:37:47', 0, 0.00, NULL, NULL),
(125, 258, 'REF1781881970028', NULL, 2500.00, 'PENDING', '2026-06-19 15:12:50', '2026-06-19 15:12:50', 0, 0.00, NULL, NULL),
(126, 259, 'REF1781904252903', '260620324575559507796c3969', 2500.00, 'Success', '2026-06-19 21:24:12', '2026-06-19 21:24:58', 0, 0.00, NULL, NULL),
(127, 261, 'REF1781956931945', NULL, 10000.00, 'PENDING', '2026-06-20 12:02:11', '2026-06-20 12:02:11', 0, 0.00, NULL, NULL),
(128, NULL, 'HMS1782051171405', NULL, 10.00, 'Cancelled', '2026-06-21 14:12:51', '2026-06-21 14:13:07', 0, 0.00, 1, 52),
(129, 277, 'REF1782126182944', NULL, 2500.00, 'Cancelled', '2026-06-22 11:03:02', '2026-06-22 11:13:32', 0, 0.00, NULL, NULL),
(130, 278, 'REF1782127857007', '26062217315410759221883e4ba', 2500.00, 'Success', '2026-06-22 11:30:57', '2026-06-22 11:31:56', 0, 0.00, NULL, NULL),
(131, 279, 'REF1782152466457', '2606230214121887313603f645', 6000.00, 'Success', '2026-06-22 18:21:06', '2026-06-22 18:21:49', 0, 0.00, NULL, NULL),
(132, 285, 'REF1782375061861', '260625141309176012732cd1315', 2500.00, 'Success', '2026-06-25 08:11:01', '2026-06-25 08:13:10', 0, 0.00, NULL, NULL),
(133, NULL, 'HMS1782398271723', NULL, 10.00, 'PENDING', '2026-06-25 14:37:51', '2026-06-25 14:37:51', 0, 0.00, 1, 52),
(134, NULL, 'HMS1782398364521', NULL, 10.00, 'Cancelled', '2026-06-25 14:39:24', '2026-06-25 14:39:38', 0, 0.00, 1, 52),
(135, NULL, 'HMS1782398974284', NULL, 10.00, 'Cancelled', '2026-06-25 14:49:34', '2026-06-25 14:49:45', 0, 0.00, 1, 52),
(136, NULL, 'HMS1782399110626', NULL, 10.00, 'Cancelled', '2026-06-25 14:51:50', '2026-06-25 14:53:04', 0, 0.00, 1, 52),
(137, 287, 'REF1782468828438', '260626161623072040861163527', 2500.00, 'Success', '2026-06-26 10:13:48', '2026-06-26 10:16:24', 0, 0.00, NULL, NULL),
(138, 289, 'REF1782537888829', '26062711253638478855176c530', 2500.00, 'Success', '2026-06-27 05:24:48', '2026-06-27 05:25:37', 0, 0.00, NULL, NULL),
(139, 293, 'REF1782642031619', '260628162114693146218ac257a', 55.00, 'Success', '2026-06-28 10:20:31', '2026-06-28 10:21:15', 0, 0.00, NULL, NULL),
(140, 297, 'REF1782849062413', NULL, 2500.00, 'Cancelled', '2026-06-30 19:51:02', '2026-06-30 19:51:38', 0, 0.00, NULL, NULL),
(141, 301, 'REF1782921935680', NULL, 2500.00, 'PENDING', '2026-07-01 16:05:35', '2026-07-01 16:05:35', 0, 0.00, NULL, NULL),
(142, NULL, 'HMS1783074741129', NULL, 10.00, 'PENDING', '2026-07-03 10:32:21', '2026-07-03 10:32:21', 0, 0.00, 1, 132),
(143, 303, 'REF1783098605239', '260703231119555845542be5607', 2500.00, 'Success', '2026-07-03 17:10:05', '2026-07-03 17:11:20', 0, 0.00, NULL, NULL),
(144, 304, 'REF1783174012379', NULL, 3000.00, 'PENDING', '2026-07-04 14:06:52', '2026-07-04 14:06:52', 0, 0.00, NULL, NULL),
(145, NULL, 'HMS1783180323595', NULL, 10.00, 'PENDING', '2026-07-04 15:52:03', '2026-07-04 15:52:03', 0, 0.00, 1, 52),
(146, 306, 'REF1783323935076', NULL, 3000.00, 'Cancelled', '2026-07-06 07:45:35', '2026-07-06 07:51:25', 0, 0.00, NULL, NULL),
(147, 306, 'REF1783324296693', NULL, 3000.00, 'PENDING', '2026-07-06 07:51:36', '2026-07-06 07:51:36', 0, 0.00, NULL, NULL),
(148, 307, 'REF1783324519474', NULL, 6000.00, 'PENDING', '2026-07-06 07:55:19', '2026-07-06 07:55:19', 0, 0.00, NULL, NULL),
(149, 318, 'REF1783939460283', '260713164750954547099fe3536', 3500.00, 'Success', '2026-07-13 10:44:20', '2026-07-13 10:47:52', 0, 0.00, NULL, NULL),
(150, 327, 'REF1784288422092', NULL, 12000.00, 'PENDING', '2026-07-17 11:40:22', '2026-07-17 11:40:22', 0, 0.00, NULL, NULL),
(151, 328, 'REF1784311145647', NULL, 3500.00, 'PENDING', '2026-07-17 17:59:05', '2026-07-17 17:59:05', 0, 0.00, NULL, NULL),
(152, 329, 'REF1784356470827', '26071812365602007016819dd68', 3500.00, 'Success', '2026-07-18 06:34:30', '2026-07-18 06:36:58', 0, 0.00, NULL, NULL),
(153, 330, 'REF1784393331139', '2607182249315823064631ce18b', 3500.00, 'Success', '2026-07-18 16:48:51', '2026-07-18 16:49:33', 0, 0.00, NULL, NULL),
(154, NULL, 'HMS1784535778190', NULL, 10.00, 'PENDING', '2026-07-20 08:22:58', '2026-07-20 08:22:58', 0, 0.00, 1, 52),
(155, 337, 'REF1784540266020', NULL, 3500.00, 'PENDING', '2026-07-20 09:37:46', '2026-07-20 09:37:46', 0, 0.00, NULL, NULL),
(156, NULL, 'HMS1784560263456', '2607202111426973397071b9b9e', 10.00, 'Success', '2026-07-20 15:11:03', '2026-07-20 15:11:44', 0, 0.00, 1, 163),
(157, 338, 'REF1784616289143', '26072112454354257150480ee17', 2500.00, 'Success', '2026-07-21 06:44:49', '2026-07-21 06:45:45', 0, 0.00, NULL, NULL),
(158, 339, 'REF1784616452089', '260721124817462969861175ab1', 2500.00, 'Success', '2026-07-21 06:47:32', '2026-07-21 06:48:19', 0, 0.00, NULL, NULL),
(159, 348, 'HMSPAY1784629999213', NULL, 3000.00, 'PENDING', '2026-07-21 10:33:19', '2026-07-21 10:33:19', 0, 0.00, NULL, NULL),
(160, 357, 'REF1784727209786', NULL, 3000.00, 'Cancelled', '2026-07-22 13:33:29', '2026-07-22 13:34:07', 0, 0.00, NULL, NULL),
(161, 361, 'HMSPAY1784789311841', NULL, 3500.00, 'PENDING', '2026-07-23 06:48:31', '2026-07-23 06:48:31', 0, 0.00, NULL, NULL),
(162, 361, 'HMSPAY1784789363867', '2607231250246464806375c7cd0', 3500.00, 'Success', '2026-07-23 06:49:23', '2026-07-23 06:50:26', 0, 0.00, NULL, NULL),
(163, 362, 'HMSPAY1784794541712', NULL, 3500.00, 'PENDING', '2026-07-23 08:15:41', '2026-07-23 08:15:41', 0, 0.00, NULL, NULL),
(164, 362, 'HMSPAY1784794593073', NULL, 3000.00, 'PENDING', '2026-07-23 08:16:33', '2026-07-23 08:16:33', 0, 0.00, NULL, NULL),
(165, 362, 'HMSPAY1784794655954', '260723141757328785314297bc5', 3000.00, 'Success', '2026-07-23 08:17:35', '2026-07-23 08:17:59', 0, 0.00, NULL, NULL),
(166, 363, 'HMSPAY1784813905167', '260723193956925821729be5b6c', 3000.00, 'Success', '2026-07-23 13:38:25', '2026-07-23 13:39:57', 0, 0.00, NULL, NULL),
(167, 364, 'HMSPAY1784885746417', NULL, 3000.00, 'PENDING', '2026-07-24 09:35:46', '2026-07-24 09:35:46', 0, 0.00, NULL, NULL),
(168, 364, 'HMSPAY1784885782986', '26072415365975250554664012b', 3000.00, 'Success', '2026-07-24 09:36:22', '2026-07-24 09:37:00', 0, 0.00, NULL, NULL),
(169, 365, 'HMSPAY1784885986783', '2607241540117714690139c558b', 3500.00, 'Success', '2026-07-24 09:39:46', '2026-07-24 09:40:12', 0, 0.00, NULL, NULL),
(170, 366, 'HMSPAY1784911990110', '260724225338399844271ebcd92', 3500.00, 'Success', '2026-07-24 16:53:10', '2026-07-24 16:53:39', 0, 0.00, NULL, NULL),
(171, 368, 'REF1784965556510', NULL, 3500.00, 'PENDING', '2026-07-25 07:45:56', '2026-07-25 07:45:56', 0, 0.00, NULL, NULL),
(172, 369, 'HMSPAY1784972895614', '260725154930796477628e07c4a', 3500.00, 'Success', '2026-07-25 09:48:15', '2026-07-25 09:49:31', 0, 0.00, NULL, NULL),
(173, 370, 'REF1785044311309', '260726113947594810664be4903', 3500.00, 'Success', '2026-07-26 05:38:31', '2026-07-26 05:39:48', 0, 0.00, NULL, NULL),
(174, 374, 'REF1785074947377', NULL, 3500.00, 'PENDING', '2026-07-26 14:09:07', '2026-07-26 14:09:07', 0, 0.00, NULL, NULL),
(175, 375, 'REF1785077187989', '2607262046592069471546a2b03', 3500.00, 'Success', '2026-07-26 14:46:27', '2026-07-26 14:47:00', 0, 0.00, NULL, NULL),
(176, 377, 'HMSPAY1785147004337', '2607271611474991657272c8283', 5000.00, 'Success', '2026-07-27 10:10:04', '2026-07-27 10:11:49', 0, 0.00, NULL, NULL),
(177, 378, 'HMSPAY1785165748527', '26072721231586498873522e953', 3000.00, 'Success', '2026-07-27 15:22:28', '2026-07-27 15:23:16', 0, 0.00, NULL, NULL),
(178, 379, 'HMSPAY1785222267764', '2607281304578618150005bb189', 3500.00, 'Success', '2026-07-28 07:04:27', '2026-07-28 07:04:58', 0, 0.00, NULL, NULL),
(179, 381, 'HMSPAY1785228396654', '260728144743033222616bcc58f', 3000.00, 'Success', '2026-07-28 08:46:36', '2026-07-28 08:47:45', 0, 0.00, NULL, NULL),
(180, 384, 'HMSPAY1785232681044', NULL, 6000.00, 'PENDING', '2026-07-28 09:58:01', '2026-07-28 09:58:01', 0, 0.00, NULL, NULL),
(181, 384, 'HMSPAY1785232766903', NULL, 6000.00, 'PENDING', '2026-07-28 09:59:26', '2026-07-28 09:59:26', 0, 0.00, NULL, NULL),
(182, 385, 'REF1785232915728', NULL, 3500.00, 'PENDING', '2026-07-28 10:01:55', '2026-07-28 10:01:55', 0, 0.00, NULL, NULL),
(183, 384, 'HMSPAY1785233398513', '260728161155099988410d74aeb', 6000.00, 'Success', '2026-07-28 10:09:58', '2026-07-28 10:11:57', 0, 0.00, NULL, NULL),
(184, 387, 'HMSPAY1785250620712', '260728205739195064027872713', 6000.00, 'Success', '2026-07-28 14:57:00', '2026-07-28 14:57:42', 0, 0.00, NULL, NULL),
(185, 388, 'HMSPAY1785253647641', NULL, 3500.00, 'PENDING', '2026-07-28 15:47:27', '2026-07-28 15:47:27', 0, 0.00, NULL, NULL),
(186, 388, 'HMSPAY1785253924296', '2607282152412806552090c8299', 3500.00, 'Success', '2026-07-28 15:52:04', '2026-07-28 15:52:44', 0, 0.00, NULL, NULL),
(187, 389, 'HMSPAY1785261424722', NULL, 7000.00, 'PENDING', '2026-07-28 17:57:04', '2026-07-28 17:57:04', 0, 0.00, NULL, NULL),
(188, 391, 'HMSPAY1785330863412', NULL, 2700.00, 'PENDING', '2026-07-29 13:14:23', '2026-07-29 13:14:23', 0, 0.00, NULL, NULL),
(189, 391, 'HMSPAY1785331137265', '260729192031399800292b7380f', 2700.00, 'Success', '2026-07-29 13:18:57', '2026-07-29 13:20:32', 0, 0.00, NULL, NULL),
(190, 392, 'HMSPAY1785336525109', '260729205013748565113300e45', 3000.00, 'Success', '2026-07-29 14:48:45', '2026-07-29 14:50:14', 0, 0.00, NULL, NULL),
(191, 394, 'REF1785341037096', NULL, 3500.00, 'PENDING', '2026-07-29 16:03:57', '2026-07-29 16:03:57', 0, 0.00, NULL, NULL),
(192, 393, 'HMSPAY1785345219717', '26072923141277285393981f944', 6300.00, 'Success', '2026-07-29 17:13:39', '2026-07-29 17:14:13', 0, 0.00, NULL, NULL),
(193, 413, 'REF1785407295119', NULL, 5.00, 'PENDING', '2026-07-30 10:28:15', '2026-07-30 10:28:15', 0, 0.00, NULL, NULL),
(194, 397, 'HMSPAY1785410912121', '26073017293071641772728a36a', 3500.00, 'Success', '2026-07-30 11:28:32', '2026-07-30 11:29:31', 0, 0.00, NULL, NULL),
(195, 418, 'HMSPAY1785452845355', NULL, 3000.00, 'PENDING', '2026-07-30 23:07:25', '2026-07-30 23:07:25', 0, 0.00, NULL, NULL),
(196, 418, 'HMSPAY1785452876714', '2607315084375582239779ccbb', 3000.00, 'Success', '2026-07-30 23:07:56', '2026-07-30 23:08:45', 0, 0.00, NULL, NULL),
(197, 423, 'HMSPAY1785499556658', '260731180626437256581ade3c2', 3000.00, 'Success', '2026-07-31 12:05:56', '2026-07-31 12:06:28', 0, 0.00, NULL, NULL),
(198, 422, 'HMSPAY1785499627168', '260731180745333277590f1dc11', 6000.00, 'Success', '2026-07-31 12:07:07', '2026-07-31 12:07:46', 0, 0.00, NULL, NULL),
(199, 421, 'HMSPAY1785499689386', NULL, 6000.00, 'PENDING', '2026-07-31 12:08:09', '2026-07-31 12:08:09', 0, 0.00, NULL, NULL),
(200, 421, 'HMSPAY1785500955929', '260731182953029398822ab7851', 6000.00, 'Success', '2026-07-31 12:29:15', '2026-07-31 12:29:54', 0, 0.00, NULL, NULL),
(201, 425, 'HMSPAY1785504405544', '2607311927210971456614edae9', 3000.00, 'Success', '2026-07-31 13:26:45', '2026-07-31 13:27:23', 0, 0.00, NULL, NULL),
(202, 426, 'HMSPAY1785515486706', NULL, 3500.00, 'PENDING', '2026-07-31 16:31:26', '2026-07-31 16:31:26', 0, 0.00, NULL, NULL),
(203, 426, 'HMSPAY1785517349455', '2607312303084947634892b3f9c', 3500.00, 'Success', '2026-07-31 17:02:29', '2026-07-31 17:03:10', 0, 0.00, NULL, NULL);

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

--
-- Dumping data for table `owner_payouts`
--

INSERT INTO `owner_payouts` (`id`, `property_owner_id`, `payout_reference`, `start_date`, `end_date`, `total_earnings`, `total_commission_paid`, `net_payout`, `payment_method`, `payment_status`, `payment_date`, `payment_reference`, `bank_name`, `account_number`, `routing_number`, `mobile_number`, `notes`, `created_at`, `updated_at`) VALUES
(10, 27, 'OWNER-PAYOUT-REQ-1781258759242-27', '2026-06-12', '2026-06-12', 6930.00, 0.00, 6930.00, 'bank_transfer', 'processing', NULL, NULL, NULL, NULL, NULL, NULL, 'Payout being processed by admin', '2026-06-12 10:05:59', '2026-06-29 06:52:10'),
(11, 27, 'OWNER-PAYOUT-REQ-1782773110673-27', '2026-06-29', '2026-06-29', 31549.50, 0.00, 31549.50, 'bank_transfer', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-29 22:45:10', '2026-06-29 22:45:10');

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

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`email`, `token`, `created_at`) VALUES
('globalsoftpark@gmail.com', '5E6VhOku6rCSpwQQNP3uArcRISoHxKhh', '2026-07-10 10:41:11');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `received_by` varchar(100) DEFAULT NULL,
  `account_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `payment_reference`, `payment_method`, `payment_type`, `transaction_type`, `amount`, `dr_amount`, `cr_amount`, `running_balance`, `currency`, `gateway_transaction_id`, `bank_tran_id`, `gateway_response`, `notes`, `status`, `payment_date`, `processed_at`, `created_at`, `updated_at`, `received_by`, `account_name`) VALUES
(237, 174, 'DR-1779002935911-174', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'cancelled', '2026-05-17 07:28:55', NULL, '2026-05-17 07:28:55', '2026-05-23 05:26:20', NULL, NULL),
(238, 175, 'DR-1779003308012-175', NULL, 'booking', 'owner_accepted', 35.00, 35.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳35', 'cancelled', '2026-05-17 07:35:08', NULL, '2026-05-17 07:35:08', '2026-05-23 05:26:20', NULL, NULL),
(239, 176, 'DR-1779008007537-176', NULL, 'booking', 'owner_accepted', 2400.00, 2400.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2400', 'cancelled', '2026-05-17 08:53:27', NULL, '2026-05-17 08:53:27', '2026-05-23 05:26:21', NULL, NULL),
(240, 177, 'DR-1779013278160-177', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'cancelled', '2026-05-17 10:21:18', NULL, '2026-05-17 10:21:18', '2026-05-23 05:26:21', NULL, NULL),
(241, 178, 'DR-1779014180906-178', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'cancelled', '2026-05-17 10:36:20', NULL, '2026-05-17 10:36:20', '2026-05-23 05:26:21', NULL, NULL),
(242, 179, 'DR-1779017045938-179', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'completed', '2026-05-17 11:24:05', NULL, '2026-05-17 11:24:05', '2026-05-17 11:25:06', NULL, NULL),
(243, 179, 'SSL-REF1779017054438', 'sslcommerz', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', 'REF1779017054438', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2000.00', 'completed', '2026-05-17 11:25:06', NULL, '2026-05-17 11:25:06', '2026-05-17 11:25:06', NULL, NULL),
(244, 180, 'DR-1779046884079-180', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-05-17 19:41:24', NULL, '2026-05-17 19:41:24', '2026-05-17 19:43:11', NULL, NULL),
(245, 180, 'SSL-REF1779046905611', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1779046905611', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-05-17 19:43:11', NULL, '2026-05-17 19:43:11', '2026-05-17 19:43:11', NULL, NULL),
(246, 181, 'DR-1779182874676-181', NULL, 'booking', 'owner_accepted', 96000.00, 96000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳96000', 'cancelled', '2026-05-19 09:27:54', NULL, '2026-05-19 09:27:54', '2026-05-23 05:26:22', NULL, NULL),
(247, 182, 'DR-1779514111973-182', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'cancelled', '2026-05-23 05:28:31', NULL, '2026-05-23 05:28:31', '2026-05-23 05:49:20', NULL, NULL),
(248, 183, 'DR-1779523983308-183', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'completed', '2026-05-23 08:13:03', NULL, '2026-05-23 08:13:03', '2026-05-23 08:14:09', NULL, NULL),
(249, 183, 'SSL-REF1779523999520', 'sslcommerz', 'booking', 'guest_payment', 20.00, 0.00, 20.00, 0.00, 'BDT', 'REF1779523999520', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳20.00', 'completed', '2026-05-23 08:14:09', NULL, '2026-05-23 08:14:09', '2026-05-23 08:14:09', NULL, NULL),
(250, 184, 'DR-1779564766389-184', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-05-23 19:32:46', NULL, '2026-05-23 19:32:46', '2026-05-23 19:34:58', NULL, NULL),
(251, 185, 'DR-1779571791009-185', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-05-23 21:29:51', NULL, '2026-05-23 21:29:51', '2026-05-23 21:32:42', NULL, NULL),
(252, 186, 'DR-1779586996006-186', NULL, 'booking', 'owner_accepted', 4000.00, 4000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳4000', 'cancelled', '2026-05-24 01:43:16', NULL, '2026-05-24 01:43:16', '2026-05-24 01:45:58', NULL, NULL),
(253, 187, 'DR-1779599319489-187', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-05-24 05:08:39', NULL, '2026-05-24 05:08:39', '2026-05-24 05:10:27', NULL, NULL),
(254, 187, 'SSL-REF1779599353353', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1779599353353', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-05-24 05:10:27', NULL, '2026-05-24 05:10:27', '2026-05-24 05:10:27', NULL, NULL),
(255, 188, 'DR-1779736217346-188', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-05-25 19:10:17', NULL, '2026-05-25 19:10:17', '2026-05-25 19:12:38', NULL, NULL),
(256, 189, 'DR-1779737497587-189', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'cancelled', '2026-05-25 19:31:37', NULL, '2026-05-25 19:31:37', '2026-05-25 19:33:38', NULL, NULL),
(257, 190, 'HMS-MANUAL-1779774453349-190', 'cash', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-05-26 05:47:33', NULL, '2026-05-26 05:47:33', '2026-05-26 05:47:33', NULL, NULL),
(258, 191, 'HMS-MANUAL-1779775602562-191', 'cash', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-05-26 06:06:42', NULL, '2026-05-26 06:06:42', '2026-05-26 06:06:42', NULL, NULL),
(259, 192, 'DR-1779777739727-192', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'completed', '2026-05-26 06:42:19', NULL, '2026-05-26 06:42:19', '2026-05-26 06:44:31', NULL, NULL),
(260, 192, 'SSL-REF1779777754305', 'sslcommerz', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', 'REF1779777754305', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2000.00', 'completed', '2026-05-26 06:44:31', NULL, '2026-05-26 06:44:31', '2026-05-26 06:44:31', NULL, NULL),
(261, 194, 'DR-1780310094513-194', NULL, 'booking', 'owner_accepted', 12000.00, 12000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳12000', 'cancelled', '2026-06-01 10:34:54', NULL, '2026-06-01 10:34:54', '2026-06-01 10:37:48', NULL, NULL),
(262, 195, 'DR-1780433739137-195', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-02 20:55:39', NULL, '2026-06-02 20:55:39', '2026-06-02 20:58:35', NULL, NULL),
(263, 196, 'DR-1780433996315-196', NULL, 'booking', 'owner_accepted', 5000.00, 5000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5000', 'cancelled', '2026-06-02 20:59:56', NULL, '2026-06-02 20:59:56', '2026-06-02 21:02:35', NULL, NULL),
(264, 197, 'DR-1780553365104-197', NULL, 'booking', 'owner_accepted', 55.00, 55.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳55', 'cancelled', '2026-06-04 06:09:25', NULL, '2026-06-04 06:09:25', '2026-06-04 06:11:27', NULL, NULL),
(265, 198, 'DR-1780573754972-198', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-04 11:49:14', NULL, '2026-06-04 11:49:14', '2026-06-04 11:51:33', NULL, NULL),
(266, 199, 'DR-1780576154226-199', NULL, 'booking', 'owner_accepted', 4000.00, 4000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳4000', 'cancelled', '2026-06-04 12:29:14', NULL, '2026-06-04 12:29:14', '2026-06-04 12:31:33', NULL, NULL),
(267, 200, 'DR-1780576411834-200', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-04 12:33:31', NULL, '2026-06-04 12:33:31', '2026-06-04 12:35:33', NULL, NULL),
(268, 201, 'DR-1780576589319-201', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-04 12:36:29', NULL, '2026-06-04 12:36:29', '2026-06-04 12:38:33', NULL, NULL),
(269, 202, 'DR-1780578527385-202', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-04 13:08:47', NULL, '2026-06-04 13:08:47', '2026-06-04 13:11:34', NULL, NULL),
(270, 203, 'DR-1780581157325-203', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-04 13:52:37', NULL, '2026-06-04 13:52:37', '2026-06-04 13:55:34', NULL, NULL),
(271, 204, 'DR-1780582372657-204', NULL, 'booking', 'owner_accepted', 4.00, 4.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳4', 'cancelled', '2026-06-04 14:12:52', NULL, '2026-06-04 14:12:52', '2026-06-04 14:14:59', NULL, NULL),
(272, 205, 'DR-1780583496752-205', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'cancelled', '2026-06-04 14:31:36', NULL, '2026-06-04 14:31:36', '2026-06-04 14:33:59', NULL, NULL),
(273, 206, 'DR-1780583540502-206', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'cancelled', '2026-06-04 14:32:20', NULL, '2026-06-04 14:32:20', '2026-06-04 14:34:59', NULL, NULL),
(274, 207, 'DR-1780641675714-207', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-05 06:41:15', NULL, '2026-06-05 06:41:15', '2026-06-05 06:43:35', NULL, NULL),
(275, 208, 'DR-1780653584196-208', NULL, 'booking', 'owner_accepted', 5200.00, 5200.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5200', 'completed', '2026-06-05 09:59:44', NULL, '2026-06-05 09:59:44', '2026-06-05 10:01:05', NULL, NULL),
(276, 208, 'SSL-REF1780653606558', 'sslcommerz', 'booking', 'guest_payment', 5200.00, 0.00, 5200.00, 0.00, 'BDT', 'REF1780653606558', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳5200.00', 'completed', '2026-06-05 10:01:05', NULL, '2026-06-05 10:01:05', '2026-06-05 10:01:05', NULL, NULL),
(277, 212, 'HMS-MANUAL-1780904006672-212', 'cash', 'booking', 'guest_payment', 2300.00, 0.00, 2300.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-06-08 07:33:26', NULL, '2026-06-08 07:33:26', '2026-06-08 07:33:26', NULL, NULL),
(278, 214, 'DR-1780909620702-214', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'cancelled', '2026-06-08 09:07:00', NULL, '2026-06-08 09:07:00', '2026-06-08 09:09:46', NULL, NULL),
(279, 216, 'DR-1780909907379-216', NULL, 'booking', 'owner_accepted', 20.00, 20.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳20', 'completed', '2026-06-08 09:11:47', NULL, '2026-06-08 09:11:47', '2026-06-08 09:12:48', NULL, NULL),
(280, 216, 'SSL-REF1780909914620', 'sslcommerz', 'booking', 'guest_payment', 20.00, 0.00, 20.00, 0.00, 'BDT', 'REF1780909914620', 'BGT165720260608139165', NULL, 'Guest payment received via SSLCommerz - Total paid: ৳20.00', 'completed', '2026-06-08 09:12:48', NULL, '2026-06-08 09:12:48', '2026-06-08 09:12:48', NULL, NULL),
(281, 221, 'DR-1780924189074-221', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Owner accepted booking request - Receivable amount: ৳2500.00', 'completed', '2026-06-08 13:09:49', NULL, '2026-06-08 13:09:49', '2026-06-08 13:12:52', NULL, NULL),
(282, 221, 'SSL-REF1780924207367', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1780924207367', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-08 13:12:52', NULL, '2026-06-08 13:12:52', '2026-06-08 13:12:52', NULL, NULL),
(283, 222, 'HMS-MANUAL-1780929141706-222', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-06-08 14:32:21', NULL, '2026-06-08 14:32:21', '2026-06-08 14:32:21', NULL, NULL),
(284, 223, 'HMS-MANUAL-1780994750760-223', 'cash', 'booking', 'guest_payment', 2200.00, 0.00, 2200.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-09 08:45:50', NULL, '2026-06-09 08:45:50', '2026-06-09 08:45:50', NULL, NULL),
(285, 211, 'HMS-MANUAL-EDIT-1781019962394-211', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation edit payment', 'completed', '2026-06-09 15:46:02', NULL, '2026-06-09 15:46:02', '2026-06-09 15:46:02', NULL, NULL),
(286, 224, 'SETTLE-224-1781107618133', 'cash', 'booking', 'payment', 5000.00, 0.00, 5000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Final settlement at checkout', 'completed', NULL, NULL, '2026-06-10 16:06:58', '2026-06-10 16:06:58', NULL, NULL),
(287, 239, 'HMS-MANUAL-1781107795212-239', 'cash', 'booking', 'guest_payment', 4000.00, 0.00, 4000.00, 0.00, 'BDT', NULL, NULL, NULL, 'bkash received.', 'completed', '2026-06-10 16:09:55', NULL, '2026-06-10 16:09:55', '2026-06-10 16:09:55', NULL, NULL),
(288, 238, 'HMS-MANUAL-1781107812712-238', 'cash', 'booking', 'guest_payment', 4000.00, 0.00, 4000.00, 0.00, 'BDT', NULL, NULL, NULL, 'bkash received.', 'completed', '2026-06-10 16:10:12', NULL, '2026-06-10 16:10:12', '2026-06-10 16:10:12', NULL, NULL),
(289, 225, 'HMS-MANUAL-1781107926378-225', 'cash', 'booking', 'guest_payment', 3999.00, 0.00, 3999.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:12:06', NULL, '2026-06-10 16:12:06', '2026-06-10 16:12:06', NULL, NULL),
(290, 226, 'HMS-MANUAL-1781107947579-226', 'cash', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:12:27', NULL, '2026-06-10 16:12:27', '2026-06-10 16:12:27', NULL, NULL),
(291, 227, 'HMS-MANUAL-1781107959045-227', 'cash', 'booking', 'guest_payment', 2800.00, 0.00, 2800.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:12:39', NULL, '2026-06-10 16:12:39', '2026-06-10 16:12:39', NULL, NULL),
(292, 228, 'HMS-MANUAL-1781107972977-228', 'cash', 'booking', 'guest_payment', 5200.00, 0.00, 5200.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:12:52', NULL, '2026-06-10 16:12:52', '2026-06-10 16:12:52', NULL, NULL),
(293, 229, 'HMS-MANUAL-1781107986906-229', 'cash', 'booking', 'guest_payment', 7500.00, 0.00, 7500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:13:06', NULL, '2026-06-10 16:13:06', '2026-06-10 16:13:06', NULL, NULL),
(294, 230, 'HMS-MANUAL-1781107997049-230', 'cash', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:13:17', NULL, '2026-06-10 16:13:17', '2026-06-10 16:13:17', NULL, NULL),
(295, 231, 'HMS-MANUAL-1781108009052-231', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:13:29', NULL, '2026-06-10 16:13:29', '2026-06-10 16:13:29', NULL, NULL),
(296, 232, 'HMS-MANUAL-1781108021495-232', 'cash', 'booking', 'guest_payment', 6500.00, 0.00, 6500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:13:41', NULL, '2026-06-10 16:13:41', '2026-06-10 16:13:41', NULL, NULL),
(297, 237, 'HMS-MANUAL-1781108036560-237', 'cash', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:13:56', NULL, '2026-06-10 16:13:56', '2026-06-10 16:13:56', NULL, NULL),
(298, 236, 'HMS-MANUAL-1781108047530-236', 'cash', 'booking', 'guest_payment', 5000.00, 0.00, 5000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:14:07', NULL, '2026-06-10 16:14:07', '2026-06-10 16:14:07', NULL, NULL),
(299, 233, 'HMS-MANUAL-1781108090945-233', 'cash', 'booking', 'guest_payment', 4000.00, 0.00, 4000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:14:50', NULL, '2026-06-10 16:14:50', '2026-06-10 16:14:50', NULL, NULL),
(300, 234, 'HMS-MANUAL-1781108106301-234', 'cash', 'booking', 'guest_payment', 8000.00, 0.00, 8000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:15:06', NULL, '2026-06-10 16:15:06', '2026-06-10 16:15:06', NULL, NULL),
(301, 235, 'HMS-MANUAL-1781108130595-235', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-10 16:15:30', NULL, '2026-06-10 16:15:30', '2026-06-10 16:15:30', NULL, NULL),
(302, 239, 'HMS-MANUAL-1781255469654-239', 'cash', 'booking', 'guest_payment', 4000.00, 0.00, 4000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-06-12 09:11:09', NULL, '2026-06-12 09:11:09', '2026-06-12 09:11:09', NULL, NULL),
(303, 246, 'DR-1781420102271-246', NULL, 'booking', 'owner_accepted', 863.33, 863.33, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳863.3333333333334', 'cancelled', '2026-06-14 06:55:02', NULL, '2026-06-14 06:55:02', '2026-06-14 07:25:38', NULL, NULL),
(304, 248, 'DR-1781512259614-248', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-15 08:30:59', NULL, '2026-06-15 08:30:59', '2026-06-15 09:01:26', NULL, NULL),
(305, 251, 'DR-1781594958284-251', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-16 07:29:18', NULL, '2026-06-16 07:29:18', '2026-06-16 07:59:59', NULL, NULL),
(306, 252, 'DR-1781600513640-252', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-16 09:01:53', NULL, '2026-06-16 09:01:53', '2026-06-16 09:04:02', NULL, NULL),
(307, 252, 'SSL-REF1781600570387', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1781600570387', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-16 09:04:02', NULL, '2026-06-16 09:04:02', '2026-06-16 09:04:02', NULL, NULL),
(308, 254, 'DR-1781686931836-254', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-17 09:02:11', NULL, '2026-06-17 09:02:11', '2026-06-17 09:05:30', NULL, NULL),
(309, 254, 'SSL-REF1781686940643', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1781686940643', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-17 09:05:30', NULL, '2026-06-17 09:05:30', '2026-06-17 09:05:30', NULL, NULL),
(310, 256, 'DR-1781786188828-256', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-18 12:36:28', NULL, '2026-06-18 12:36:28', '2026-06-18 12:37:48', NULL, NULL),
(311, 256, 'SSL-REF1781786197748', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1781786197748', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-18 12:37:48', NULL, '2026-06-18 12:37:48', '2026-06-18 12:37:48', NULL, NULL),
(312, 258, 'DR-1781881952407-258', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-19 15:12:32', NULL, '2026-06-19 15:12:32', '2026-06-19 15:43:26', NULL, NULL),
(313, 259, 'DR-1781904237863-259', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-19 21:23:57', NULL, '2026-06-19 21:23:57', '2026-06-19 21:24:59', NULL, NULL),
(314, 259, 'SSL-REF1781904252903', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1781904252903', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-19 21:24:59', NULL, '2026-06-19 21:24:59', '2026-06-19 21:24:59', NULL, NULL),
(315, 261, 'DR-1781956895799-261', NULL, 'booking', 'owner_accepted', 10000.00, 10000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳10000', 'cancelled', '2026-06-20 12:01:35', NULL, '2026-06-20 12:01:35', '2026-06-20 12:32:20', NULL, NULL),
(316, 274, 'HMS-MANUAL-1782055014648-274', 'cash', 'booking', 'guest_payment', 13000.00, 0.00, 13000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:16:54', NULL, '2026-06-21 15:16:54', '2026-06-21 15:16:54', NULL, NULL),
(317, 273, 'HMS-MANUAL-1782055042434-273', 'cash', 'booking', 'guest_payment', 4000.00, 0.00, 4000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:17:22', NULL, '2026-06-21 15:17:22', '2026-06-21 15:17:22', NULL, NULL),
(318, 272, 'HMS-MANUAL-1782055069682-272', 'cash', 'booking', 'guest_payment', 17999.00, 0.00, 17999.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:17:49', NULL, '2026-06-21 15:17:49', '2026-06-21 15:17:49', NULL, NULL),
(319, 271, 'HMS-MANUAL-1782055227396-271', 'cash', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:20:27', NULL, '2026-06-21 15:20:27', '2026-06-21 15:20:27', NULL, NULL),
(320, 270, 'HMS-MANUAL-1782055320801-270', 'cash', 'booking', 'guest_payment', 5000.00, 0.00, 5000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:22:00', NULL, '2026-06-21 15:22:00', '2026-06-21 15:22:00', NULL, NULL),
(321, 238, 'HMS-MANUAL-1782055360734-238', 'cash', 'booking', 'guest_payment', 36000.00, 0.00, 36000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:22:40', NULL, '2026-06-21 15:22:40', '2026-06-21 15:22:40', NULL, NULL),
(322, 242, 'HMS-MANUAL-1782055427998-242', 'cash', 'booking', 'guest_payment', 4000.00, 0.00, 4000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:23:47', NULL, '2026-06-21 15:23:47', '2026-06-21 15:23:47', NULL, NULL),
(323, 263, 'HMS-MANUAL-1782055457567-263', 'cash', 'booking', 'guest_payment', 2000.00, 0.00, 2000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:24:17', NULL, '2026-06-21 15:24:17', '2026-06-21 15:24:17', NULL, NULL),
(324, 264, 'HMS-MANUAL-1782055474367-264', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:24:34', NULL, '2026-06-21 15:24:34', '2026-06-21 15:24:34', NULL, NULL),
(325, 265, 'HMS-MANUAL-1782055484376-265', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:24:44', NULL, '2026-06-21 15:24:44', '2026-06-21 15:24:44', NULL, NULL),
(326, 266, 'HMS-MANUAL-1782055495362-266', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:24:55', NULL, '2026-06-21 15:24:55', '2026-06-21 15:24:55', NULL, NULL),
(327, 267, 'HMS-MANUAL-1782055518483-267', 'cash', 'booking', 'guest_payment', 10000.00, 0.00, 10000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:25:18', NULL, '2026-06-21 15:25:18', '2026-06-21 15:25:18', NULL, NULL),
(328, 268, 'HMS-MANUAL-1782055527963-268', 'cash', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:25:27', NULL, '2026-06-21 15:25:27', '2026-06-21 15:25:27', NULL, NULL),
(329, 269, 'HMS-MANUAL-1782055539058-269', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Received in Bkash', 'completed', '2026-06-21 15:25:39', NULL, '2026-06-21 15:25:39', '2026-06-21 15:25:39', NULL, NULL),
(330, 276, 'DR-1782104877367-276', NULL, 'booking', 'owner_accepted', 5000.00, 5000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Owner accepted booking request - Receivable amount: ৳5000.00', 'cancelled', '2026-06-22 05:07:57', NULL, '2026-06-22 05:07:57', '2026-06-22 05:38:17', NULL, NULL),
(331, 277, 'DR-1782126139846-277', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-22 11:02:19', NULL, '2026-06-22 11:02:19', '2026-06-22 11:32:38', NULL, NULL),
(332, 278, 'DR-1782127845902-278', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-22 11:30:45', NULL, '2026-06-22 11:30:45', '2026-06-22 11:31:56', NULL, NULL),
(333, 278, 'SSL-REF1782127857007', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1782127857007', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-22 11:31:56', NULL, '2026-06-22 11:31:56', '2026-06-22 11:31:56', NULL, NULL),
(334, 279, 'DR-1782152066182-279', NULL, 'booking', 'owner_accepted', 6000.00, 6000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳6000', 'completed', '2026-06-22 18:14:26', NULL, '2026-06-22 18:14:26', '2026-06-22 18:21:49', NULL, NULL),
(335, 279, 'SSL-REF1782152466457', 'sslcommerz', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', 'REF1782152466457', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳6000.00', 'completed', '2026-06-22 18:21:49', NULL, '2026-06-22 18:21:49', '2026-06-22 18:21:49', NULL, NULL),
(336, 281, 'DR-1782191019791-281', NULL, 'booking', 'owner_accepted', 2000.00, 2000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2000', 'cancelled', '2026-06-23 05:03:39', NULL, '2026-06-23 05:03:39', '2026-06-23 05:37:37', NULL, NULL),
(337, 283, 'DR-1782288983896-283', NULL, 'booking', 'owner_accepted', 35.00, 35.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳35', 'cancelled', '2026-06-24 08:16:23', NULL, '2026-06-24 08:16:23', '2026-06-24 08:55:00', NULL, NULL),
(338, 285, 'DR-1782374963749-285', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-25 08:09:23', NULL, '2026-06-25 08:09:23', '2026-06-25 08:13:10', NULL, NULL),
(339, 285, 'SSL-REF1782375061861', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1782375061861', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-25 08:13:10', NULL, '2026-06-25 08:13:10', '2026-06-25 08:13:10', NULL, NULL),
(340, 287, 'DR-1782468747519-287', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-26 10:12:27', NULL, '2026-06-26 10:12:27', '2026-06-26 10:16:24', NULL, NULL),
(341, 287, 'SSL-REF1782468828438', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1782468828438', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-26 10:16:24', NULL, '2026-06-26 10:16:24', '2026-06-26 10:16:24', NULL, NULL),
(342, 289, 'DR-1782537357419-289', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-06-27 05:15:57', NULL, '2026-06-27 05:15:57', '2026-06-27 05:25:37', NULL, NULL),
(343, 289, 'SSL-REF1782537888829', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1782537888829', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-06-27 05:25:37', NULL, '2026-06-27 05:25:37', '2026-06-27 05:25:37', NULL, NULL),
(344, 290, 'HMS-MANUAL-1782570416655-290', 'cash', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', NULL, NULL, NULL, '24.com', 'completed', '2026-06-27 14:26:56', NULL, '2026-06-27 14:26:56', '2026-06-27 14:26:56', NULL, NULL),
(345, 293, 'DR-1782642019357-293', NULL, 'booking', 'owner_accepted', 55.00, 55.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳55', 'completed', '2026-06-28 10:20:19', NULL, '2026-06-28 10:20:19', '2026-06-28 10:21:15', NULL, NULL),
(346, 293, 'SSL-REF1782642031619', 'sslcommerz', 'booking', 'guest_payment', 55.00, 0.00, 55.00, 0.00, 'BDT', 'REF1782642031619', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳55.00', 'completed', '2026-06-28 10:21:15', NULL, '2026-06-28 10:21:15', '2026-06-28 10:21:15', NULL, NULL),
(347, 296, 'DR-1782786991062-296', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-30 02:36:31', NULL, '2026-06-30 02:36:31', '2026-06-30 03:07:09', NULL, NULL),
(348, 297, 'DR-1782849007441-297', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-06-30 19:50:07', NULL, '2026-06-30 19:50:07', '2026-06-30 20:20:12', NULL, NULL),
(349, 299, 'DR-1782879096741-299', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-07-01 04:11:36', NULL, '2026-07-01 04:11:36', '2026-07-01 04:41:47', NULL, NULL),
(350, 300, 'DR-1782909068188-300', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-07-01 12:31:08', NULL, '2026-07-01 12:31:08', '2026-07-01 13:01:22', NULL, NULL),
(351, 301, 'DR-1782921924907-301', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'cancelled', '2026-07-01 16:05:24', NULL, '2026-07-01 16:05:24', '2026-07-01 16:36:20', NULL, NULL),
(352, 303, 'DR-1783098598693-303', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-07-03 17:09:58', NULL, '2026-07-03 17:09:58', '2026-07-03 17:11:21', NULL, NULL),
(353, 303, 'SSL-REF1783098605239', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1783098605239', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-07-03 17:11:21', NULL, '2026-07-03 17:11:21', '2026-07-03 17:11:21', NULL, NULL),
(354, 304, 'DR-1783174005482-304', NULL, 'booking', 'owner_accepted', 3000.00, 3000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3000', 'cancelled', '2026-07-04 14:06:45', NULL, '2026-07-04 14:06:45', '2026-07-04 14:36:52', NULL, NULL),
(355, 306, 'DR-1783323928815-306', NULL, 'booking', 'owner_accepted', 3000.00, 3000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3000', 'cancelled', '2026-07-06 07:45:28', NULL, '2026-07-06 07:45:28', '2026-07-06 08:16:12', NULL, NULL),
(356, 307, 'DR-1783324499237-307', NULL, 'booking', 'owner_accepted', 6000.00, 6000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳6000', 'cancelled', '2026-07-06 07:54:59', NULL, '2026-07-06 07:54:59', '2026-07-06 08:25:12', NULL, NULL),
(357, 318, 'DR-1783939441455-318', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'completed', '2026-07-13 10:44:01', NULL, '2026-07-13 10:44:01', '2026-07-13 10:47:52', NULL, NULL),
(358, 318, 'SSL-REF1783939460283', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'REF1783939460283', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-13 10:47:52', NULL, '2026-07-13 10:47:52', '2026-07-13 10:47:52', NULL, NULL),
(359, 325, 'DR-1784245379155-325', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-16 23:42:59', NULL, '2026-07-16 23:42:59', '2026-07-17 00:13:33', NULL, NULL),
(360, 327, 'DR-1784288401166-327', NULL, 'booking', 'owner_accepted', 12000.00, 12000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳12000', 'cancelled', '2026-07-17 11:40:01', NULL, '2026-07-17 11:40:01', '2026-07-17 12:10:36', NULL, NULL),
(361, 328, 'DR-1784311118116-328', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-17 17:58:38', NULL, '2026-07-17 17:58:38', '2026-07-17 18:29:23', NULL, NULL),
(362, 329, 'DR-1784356425187-329', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Owner accepted booking request - Receivable amount: ৳3500.00', 'completed', '2026-07-18 06:33:45', NULL, '2026-07-18 06:33:45', '2026-07-18 06:36:58', NULL, NULL),
(363, 329, 'SSL-REF1784356470827', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'REF1784356470827', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-18 06:36:58', NULL, '2026-07-18 06:36:58', '2026-07-18 06:36:58', NULL, NULL),
(364, 330, 'DR-1784393183128-330', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'completed', '2026-07-18 16:46:23', NULL, '2026-07-18 16:46:23', '2026-07-18 16:49:34', NULL, NULL),
(365, 330, 'SSL-REF1784393331139', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'REF1784393331139', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-18 16:49:34', NULL, '2026-07-18 16:49:34', '2026-07-18 16:49:34', NULL, NULL),
(366, 334, 'DR-1784538361936-334', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-20 09:06:01', NULL, '2026-07-20 09:06:01', '2026-07-20 09:36:58', NULL, NULL),
(367, 335, 'DR-1784538649554-335', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-20 09:10:49', NULL, '2026-07-20 09:10:49', '2026-07-20 09:40:58', NULL, NULL),
(368, 336, 'DR-1784539002584-336', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-20 09:16:42', NULL, '2026-07-20 09:16:42', '2026-07-20 09:46:58', NULL, NULL),
(369, 337, 'DR-1784540260784-337', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-20 09:37:40', NULL, '2026-07-20 09:37:40', '2026-07-20 10:07:59', NULL, NULL),
(370, 338, 'DR-1784616266074-338', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Owner accepted booking request - Receivable amount: ৳2500.00', 'completed', '2026-07-21 06:44:26', NULL, '2026-07-21 06:44:26', '2026-07-21 06:45:45', NULL, NULL),
(371, 338, 'SSL-REF1784616289143', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1784616289143', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-07-21 06:45:45', NULL, '2026-07-21 06:45:45', '2026-07-21 06:45:45', NULL, NULL),
(372, 339, 'DR-1784616442751-339', NULL, 'booking', 'owner_accepted', 2500.00, 2500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳2500', 'completed', '2026-07-21 06:47:22', NULL, '2026-07-21 06:47:22', '2026-07-21 06:48:20', NULL, NULL),
(373, 339, 'SSL-REF1784616452089', 'sslcommerz', 'booking', 'guest_payment', 2500.00, 0.00, 2500.00, 0.00, 'BDT', 'REF1784616452089', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2500.00', 'completed', '2026-07-21 06:48:20', NULL, '2026-07-21 06:48:20', '2026-07-21 06:48:20', NULL, NULL),
(374, 340, 'HMS-MANUAL-1784619890917-340', 'cash', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 07:44:50', NULL, '2026-07-21 07:44:50', '2026-07-21 07:44:50', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(375, 341, 'HMS-MANUAL-1784620115272-341', 'cash', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 07:48:35', NULL, '2026-07-21 07:48:35', '2026-07-21 07:48:35', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(376, 343, 'HMS-MANUAL-1784620859240-343', 'cash', 'booking', 'guest_payment', 18000.00, 0.00, 18000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 08:00:59', NULL, '2026-07-21 08:00:59', '2026-07-21 08:00:59', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(377, 344, 'HMS-MANUAL-1784627569355-344', 'cash', 'booking', 'guest_payment', 15500.00, 0.00, 15500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 09:52:49', NULL, '2026-07-21 09:52:49', '2026-07-21 09:52:49', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(378, 345, 'HMS-MANUAL-1784629463625-345', 'cash', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:24:23', NULL, '2026-07-21 10:24:23', '2026-07-21 10:24:23', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(379, 346, 'HMS-MANUAL-1784629558881-346', 'cash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:25:58', NULL, '2026-07-21 10:25:58', '2026-07-21 10:25:58', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(380, 347, 'HMS-MANUAL-1784629668845-347', 'cash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:27:48', NULL, '2026-07-21 10:27:48', '2026-07-21 10:27:48', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(381, 349, 'HMS-MANUAL-1784629922486-349', 'cash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:32:02', NULL, '2026-07-21 10:32:02', '2026-07-21 10:32:02', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(382, 348, 'HMS-MANUAL-1784630618264-348', 'cash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-07-21 10:43:38', NULL, '2026-07-21 10:43:38', '2026-07-21 10:43:38', NULL, NULL),
(383, 350, 'HMS-MANUAL-1784630709531-350', 'cash', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:45:09', NULL, '2026-07-21 10:45:09', '2026-07-21 10:45:09', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(384, 351, 'HMS-MANUAL-1784630782993-351', 'bkash', 'booking', 'guest_payment', 2494.00, 0.00, 2494.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS payment', 'completed', '2026-07-21 10:46:22', NULL, '2026-07-21 10:46:22', '2026-07-21 10:46:22', NULL, NULL),
(385, 352, 'HMS-MANUAL-1784631388165-352', 'cash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:56:28', NULL, '2026-07-21 10:56:28', '2026-07-21 10:56:28', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(386, 353, 'HMS-MANUAL-1784631449744-353', 'cash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:57:29', NULL, '2026-07-21 10:57:29', '2026-07-21 10:57:29', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(387, 354, 'HMS-MANUAL-1784631539525-354', 'cash', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 10:58:59', NULL, '2026-07-21 10:58:59', '2026-07-21 10:58:59', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(388, 355, 'HMS-MANUAL-1784631681441-355', 'cash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 11:01:21', NULL, '2026-07-21 11:01:21', '2026-07-21 11:01:21', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(389, 356, 'HMS-MANUAL-1784647739815-356', 'cash', 'booking', 'guest_payment', 6305.00, 0.00, 6305.00, 0.00, 'BDT', NULL, NULL, NULL, 'Manual HMS reservation creation', 'completed', '2026-07-21 15:28:59', NULL, '2026-07-21 15:28:59', '2026-07-21 15:28:59', 'KeyHost  Homes', 'Petty Cash-KeyHost '),
(390, 351, 'SETTLE-351-1784704701516', 'cash', 'booking', 'payment', 6.00, 0.00, 6.00, 0.00, 'BDT', NULL, NULL, NULL, 'Final settlement at checkout', 'completed', NULL, NULL, '2026-07-22 07:18:21', '2026-07-22 07:18:21', NULL, NULL),
(391, 357, 'DR-1784727167503-357', NULL, 'booking', 'owner_accepted', 3000.00, 3000.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3000', 'cancelled', '2026-07-22 13:32:47', NULL, '2026-07-22 13:32:47', '2026-07-22 14:03:01', NULL, NULL),
(392, 358, 'DR-1784742418256-358', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-22 17:46:58', NULL, '2026-07-22 17:46:58', '2026-07-22 18:17:06', NULL, NULL),
(393, 359, 'DR-1784742518808-359', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-22 17:48:38', NULL, '2026-07-22 17:48:38', '2026-07-22 18:19:06', NULL, NULL),
(394, 361, 'SSL-HMSPAY1784789363867', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1784789363867', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-23 06:50:26', NULL, '2026-07-23 06:50:26', '2026-07-23 06:50:26', NULL, NULL),
(395, 362, 'SSL-HMSPAY1784794655954', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1784794655954', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-23 08:17:59', NULL, '2026-07-23 08:17:59', '2026-07-23 08:17:59', NULL, NULL),
(396, 363, 'SSL-HMSPAY1784813905167', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1784813905167', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-23 13:39:57', NULL, '2026-07-23 13:39:57', '2026-07-23 13:39:57', NULL, NULL),
(397, 364, 'SSL-HMSPAY1784885782986', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1784885782986', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-24 09:37:00', NULL, '2026-07-24 09:37:00', '2026-07-24 09:37:00', NULL, NULL),
(398, 365, 'SSL-HMSPAY1784885986783', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1784885986783', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-24 09:40:12', NULL, '2026-07-24 09:40:12', '2026-07-24 09:40:12', NULL, NULL),
(399, 366, 'SSL-HMSPAY1784911990110', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1784911990110', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-24 16:53:39', NULL, '2026-07-24 16:53:39', '2026-07-24 16:53:39', NULL, NULL),
(400, 367, 'DR-1784960464530-367', NULL, 'booking', 'owner_accepted', 1199.00, 1199.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳1199', 'cancelled', '2026-07-25 06:21:04', NULL, '2026-07-25 06:21:04', '2026-07-25 06:51:45', NULL, NULL),
(401, 368, 'DR-1784965540643-368', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-25 07:45:40', NULL, '2026-07-25 07:45:40', '2026-07-25 08:16:25', NULL, NULL),
(402, 369, 'SSL-HMSPAY1784972895614', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1784972895614', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-25 09:49:31', NULL, '2026-07-25 09:49:31', '2026-07-25 09:49:31', NULL, NULL),
(403, 366, 'SETTLE-366-1784986455304', 'cash', 'booking', 'payment', 500.00, 0.00, 500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Final settlement at checkout', 'completed', NULL, NULL, '2026-07-25 13:34:15', '2026-07-25 13:34:15', NULL, NULL),
(404, 366, 'INV-HMS-1784911690686-33-9629', 'mobile_banking', 'booking', 'guest_payment', 500.00, 0.00, 500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Payment received for Invoice #INV-HMS-1784911690686-33-9629', 'completed', '2026-07-25 13:34:46', NULL, '2026-07-25 13:34:46', '2026-07-25 13:34:46', 'KeyHost  Homes', 'bKash Merchant'),
(405, 370, 'DR-1785044263700-370', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'completed', '2026-07-26 05:37:43', NULL, '2026-07-26 05:37:43', '2026-07-26 05:39:48', NULL, NULL),
(406, 370, 'SSL-REF1785044311309', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'REF1785044311309', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-26 05:39:48', NULL, '2026-07-26 05:39:48', '2026-07-26 05:39:48', NULL, NULL),
(407, 374, 'DR-1785074913157-374', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-26 14:08:33', NULL, '2026-07-26 14:08:33', '2026-07-26 14:38:39', NULL, NULL),
(408, 375, 'DR-1785077177460-375', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'completed', '2026-07-26 14:46:17', NULL, '2026-07-26 14:46:17', '2026-07-26 14:47:00', NULL, NULL),
(409, 375, 'SSL-REF1785077187989', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'REF1785077187989', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-26 14:47:00', NULL, '2026-07-26 14:47:00', '2026-07-26 14:47:00', NULL, NULL),
(410, 376, 'DR-1785091680499-376', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-26 18:48:00', NULL, '2026-07-26 18:48:00', '2026-07-26 19:18:06', NULL, NULL),
(411, 377, 'SSL-HMSPAY1785147004337', 'sslcommerz', 'booking', 'guest_payment', 5000.00, 0.00, 5000.00, 0.00, 'BDT', 'HMSPAY1785147004337', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳5000.00', 'completed', '2026-07-27 10:11:49', NULL, '2026-07-27 10:11:49', '2026-07-27 10:11:49', NULL, NULL),
(412, 378, 'SSL-HMSPAY1785165748527', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1785165748527', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-27 15:23:17', NULL, '2026-07-27 15:23:17', '2026-07-27 15:23:17', NULL, NULL),
(413, 379, 'SSL-HMSPAY1785222267764', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1785222267764', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-28 07:04:58', NULL, '2026-07-28 07:04:58', '2026-07-28 07:04:58', NULL, NULL);
INSERT INTO `payments` (`id`, `booking_id`, `payment_reference`, `payment_method`, `payment_type`, `transaction_type`, `amount`, `dr_amount`, `cr_amount`, `running_balance`, `currency`, `gateway_transaction_id`, `bank_tran_id`, `gateway_response`, `notes`, `status`, `payment_date`, `processed_at`, `created_at`, `updated_at`, `received_by`, `account_name`) VALUES
(414, 381, 'SSL-HMSPAY1785228396654', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1785228396654', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-28 08:47:48', NULL, '2026-07-28 08:47:48', '2026-07-28 08:47:48', NULL, NULL),
(415, 382, 'DR-1785229245729-382', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-28 09:00:45', NULL, '2026-07-28 09:00:45', '2026-07-28 09:30:57', NULL, NULL),
(416, 385, 'DR-1785232840862-385', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-28 10:00:40', NULL, '2026-07-28 10:00:40', '2026-07-28 10:30:57', NULL, NULL),
(417, 384, 'SSL-HMSPAY1785233398513', 'sslcommerz', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', 'HMSPAY1785233398513', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳6000.00', 'completed', '2026-07-28 10:11:59', NULL, '2026-07-28 10:11:59', '2026-07-28 10:11:59', NULL, NULL),
(418, 387, 'SSL-HMSPAY1785250620712', 'sslcommerz', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', 'HMSPAY1785250620712', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳6000.00', 'completed', '2026-07-28 14:57:44', NULL, '2026-07-28 14:57:44', '2026-07-28 14:57:44', NULL, NULL),
(419, 388, 'SSL-HMSPAY1785253924296', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1785253924296', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-28 15:52:45', NULL, '2026-07-28 15:52:45', '2026-07-28 15:52:45', NULL, NULL),
(420, 390, 'DR-1785300560288-390', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-29 04:49:20', NULL, '2026-07-29 04:49:20', '2026-07-29 05:20:16', NULL, NULL),
(421, 391, 'SSL-HMSPAY1785331137265', 'sslcommerz', 'booking', 'guest_payment', 2700.00, 0.00, 2700.00, 0.00, 'BDT', 'HMSPAY1785331137265', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳2700.00', 'completed', '2026-07-29 13:20:35', NULL, '2026-07-29 13:20:35', '2026-07-29 13:20:35', NULL, NULL),
(422, 392, 'SSL-HMSPAY1785336525109', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1785336525109', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-29 14:50:17', NULL, '2026-07-29 14:50:17', '2026-07-29 14:50:17', NULL, NULL),
(423, 394, 'DR-1785340942395-394', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-29 16:02:22', NULL, '2026-07-29 16:02:22', '2026-07-29 16:32:38', NULL, NULL),
(424, 393, 'SSL-HMSPAY1785345219717', 'sslcommerz', 'booking', 'guest_payment', 6300.00, 0.00, 6300.00, 0.00, 'BDT', 'HMSPAY1785345219717', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳6300.00', 'completed', '2026-07-29 17:14:15', NULL, '2026-07-29 17:14:15', '2026-07-29 17:14:15', NULL, NULL),
(425, 395, 'DR-1785404214051-395', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 09:36:54', NULL, '2026-07-30 09:36:54', '2026-07-30 10:07:22', NULL, NULL),
(426, 396, 'DR-1785404504371-396', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 09:41:44', NULL, '2026-07-30 09:41:44', '2026-07-30 10:12:22', NULL, NULL),
(427, 396, 'BKASH_TR00113Wtaquz1785405441310', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR00113Wtaquz1785405441310', NULL, '{\"paymentID\":\"TR00113Wtaquz1785405441310\",\"status\":\"cancel\",\"signature\":\"1xUqfbl5fP\",\"apiVersion\":\"1.2.0-beta/\"}', 'bKash payment initiated', 'failed', NULL, NULL, '2026-07-30 09:57:21', '2026-07-30 09:57:44', NULL, NULL),
(428, 398, 'DR-1785405527984-398', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'completed', '2026-07-30 09:58:47', NULL, '2026-07-30 09:58:47', '2026-07-30 09:59:32', NULL, NULL),
(429, 398, 'BKASH_TR0011ROzUbQK1785405535532', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011ROzUbQK1785405535532', NULL, NULL, 'bKash payment initiated', 'pending', NULL, NULL, '2026-07-30 09:58:55', '2026-07-30 09:58:55', NULL, NULL),
(430, 398, 'CR-1785405572201-398', 'bkash', 'booking', 'guest_payment', 5.00, 0.00, 5.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DGU9VH2FSB - Total: ৳5.00', 'completed', '2026-07-30 09:59:32', NULL, '2026-07-30 09:59:32', '2026-07-30 09:59:32', NULL, NULL),
(431, 399, 'DR-1785405622018-399', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'completed', '2026-07-30 10:00:22', NULL, '2026-07-30 10:00:22', '2026-07-30 10:01:06', NULL, NULL),
(432, 399, 'BKASH_TR0011iPsBsh61785405630947', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011iPsBsh61785405630947', NULL, NULL, 'bKash payment initiated', 'pending', NULL, NULL, '2026-07-30 10:00:31', '2026-07-30 10:00:31', NULL, NULL),
(433, 399, 'CR-1785405666189-399', 'bkash', 'booking', 'guest_payment', 5.00, 0.00, 5.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DGU0VH4BZC - Total: ৳5.00', 'completed', '2026-07-30 10:01:06', NULL, '2026-07-30 10:01:06', '2026-07-30 10:01:06', NULL, NULL),
(434, 383, 'BKASH_TR0011Hvlguxe1785405840828', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011Hvlguxe1785405840828', NULL, NULL, 'bKash payment initiated for HMS booking via link', 'pending', '2026-07-30 10:04:00', NULL, '2026-07-30 10:04:00', '2026-07-30 10:04:00', NULL, NULL),
(435, 401, 'DR-1785406094419-401', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:08:14', NULL, '2026-07-30 10:08:14', '2026-07-30 10:38:22', NULL, NULL),
(436, 402, 'DR-1785406178967-402', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:09:38', NULL, '2026-07-30 10:09:38', '2026-07-30 10:40:22', NULL, NULL),
(437, 403, 'DR-1785406269335-403', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:11:09', NULL, '2026-07-30 10:11:09', '2026-07-30 10:41:22', NULL, NULL),
(438, 404, 'DR-1785406316239-404', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:11:56', NULL, '2026-07-30 10:11:56', '2026-07-30 10:42:22', NULL, NULL),
(439, 405, 'DR-1785406336532-405', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:12:16', NULL, '2026-07-30 10:12:16', '2026-07-30 10:43:22', NULL, NULL),
(440, 407, 'DR-1785406474626-407', NULL, 'booking', 'owner_accepted', 3500.00, 3500.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳3500', 'cancelled', '2026-07-30 10:14:34', NULL, '2026-07-30 10:14:34', '2026-07-30 10:45:22', NULL, NULL),
(441, 408, 'DR-1785406580083-408', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:16:20', NULL, '2026-07-30 10:16:20', '2026-07-30 10:46:22', NULL, NULL),
(442, 409, 'DR-1785406867710-409', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:21:07', NULL, '2026-07-30 10:21:07', '2026-07-30 10:51:22', NULL, NULL),
(443, 409, 'BKASH_TR0011HQurLxJ1785406879084', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011HQurLxJ1785406879084', NULL, NULL, 'bKash payment initiated', 'cancelled', NULL, NULL, '2026-07-30 10:21:19', '2026-07-30 10:51:22', NULL, NULL),
(444, 410, 'DR-1785406958499-410', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:22:38', NULL, '2026-07-30 10:22:38', '2026-07-30 10:53:22', NULL, NULL),
(445, 411, 'DR-1785407016572-411', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:23:36', NULL, '2026-07-30 10:23:36', '2026-07-30 10:54:22', NULL, NULL),
(446, 412, 'DR-1785407158306-412', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:25:58', NULL, '2026-07-30 10:25:58', '2026-07-30 10:56:22', NULL, NULL),
(447, 413, 'DR-1785407182221-413', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 10:26:22', NULL, '2026-07-30 10:26:22', '2026-07-30 10:57:22', NULL, NULL),
(448, 413, 'BKASH_TR0011Ze4wfeB1785407212625', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011Ze4wfeB1785407212625', NULL, NULL, 'bKash payment initiated', 'cancelled', NULL, NULL, '2026-07-30 10:26:52', '2026-07-30 10:57:22', NULL, NULL),
(449, 413, 'BKASH_TR0011ZOGnZfx1785407311146', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011ZOGnZfx1785407311146', NULL, NULL, 'bKash payment initiated', 'cancelled', NULL, NULL, '2026-07-30 10:28:31', '2026-07-30 10:57:22', NULL, NULL),
(450, 397, 'SSL-HMSPAY1785410912121', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1785410912121', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-30 11:29:32', NULL, '2026-07-30 11:29:32', '2026-07-30 11:29:32', NULL, NULL),
(451, 400, 'BKASH_TR0011ZYvy1ck1785411014545', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011ZYvy1ck1785411014545', NULL, NULL, 'bKash payment initiated for HMS booking via link', 'pending', '2026-07-30 11:30:14', NULL, '2026-07-30 11:30:14', '2026-07-30 11:30:14', NULL, NULL),
(452, 400, 'DR-AUTO-1785411054304-400', NULL, 'booking', 'owner_accepted', 0.00, 0.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Automatic DR entry for successful payment - ৳0.00', 'completed', '2026-07-30 11:30:54', NULL, '2026-07-30 11:30:54', '2026-07-30 11:30:54', NULL, NULL),
(453, 400, 'CR-1785411054306-400', 'bkash', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DGU8VKRWJE - Total: ৳3500.00', 'completed', '2026-07-30 11:30:54', NULL, '2026-07-30 11:30:54', '2026-07-30 11:30:54', NULL, NULL),
(454, 414, 'DR-1785411154460-414', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-30 11:32:34', NULL, '2026-07-30 11:32:34', '2026-07-30 12:55:41', NULL, NULL),
(455, 414, 'BKASH_TR0011SWWWORQ1785411175216', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011SWWWORQ1785411175216', NULL, '{\"paymentID\":\"TR0011SWWWORQ1785411175216\",\"status\":\"cancel\",\"signature\":\"5SbE110gj7\",\"apiVersion\":\"1.2.0-beta/\"}', 'bKash payment initiated', 'failed', NULL, NULL, '2026-07-30 11:32:55', '2026-07-30 11:33:05', NULL, NULL),
(456, 415, 'BKASH_TR0011i9FJYQC1785417172284', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011i9FJYQC1785417172284', NULL, NULL, 'bKash payment initiated for HMS booking via link', 'pending', '2026-07-30 13:12:52', NULL, '2026-07-30 13:12:52', '2026-07-30 13:12:52', NULL, NULL),
(457, 415, 'DR-AUTO-1785417212158-415', NULL, 'booking', 'owner_accepted', 0.00, 0.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Automatic DR entry for successful payment - ৳0.00', 'completed', '2026-07-30 13:13:32', NULL, '2026-07-30 13:13:32', '2026-07-30 13:13:32', NULL, NULL),
(458, 415, 'CR-1785417212160-415', 'bkash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DGU5VPOHZ3 - Total: ৳3000.00', 'completed', '2026-07-30 13:13:32', NULL, '2026-07-30 13:13:32', '2026-07-30 13:13:32', NULL, NULL),
(459, 416, 'BKASH_TR0011rM7p1Qw1785417726665', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011rM7p1Qw1785417726665', NULL, NULL, 'bKash payment initiated for HMS booking via link', 'pending', '2026-07-30 13:22:06', NULL, '2026-07-30 13:22:06', '2026-07-30 13:22:06', NULL, NULL),
(460, 416, 'DR-AUTO-1785417763691-416', NULL, 'booking', 'owner_accepted', 0.00, 0.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Automatic DR entry for successful payment - ৳0.00', 'completed', '2026-07-30 13:22:43', NULL, '2026-07-30 13:22:43', '2026-07-30 13:22:43', NULL, NULL),
(461, 416, 'CR-1785417763696-416', 'bkash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DGU4VQ6AVA - Total: ৳3000.00', 'completed', '2026-07-30 13:22:43', NULL, '2026-07-30 13:22:43', '2026-07-30 13:22:43', NULL, NULL),
(462, 417, 'BKASH_TR0011LupcG2m1785433655787', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011LupcG2m1785433655787', NULL, NULL, 'bKash payment initiated for HMS booking via link', 'pending', '2026-07-30 17:47:35', NULL, '2026-07-30 17:47:35', '2026-07-30 17:47:35', NULL, NULL),
(463, 417, 'DR-AUTO-1785433683614-417', NULL, 'booking', 'owner_accepted', 0.00, 0.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Automatic DR entry for successful payment - ৳0.00', 'completed', '2026-07-30 17:48:03', NULL, '2026-07-30 17:48:03', '2026-07-30 17:48:03', NULL, NULL),
(464, 417, 'CR-1785433683617-417', 'bkash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DGU4W3H03O - Total: ৳3000.00', 'completed', '2026-07-30 17:48:03', NULL, '2026-07-30 17:48:03', '2026-07-30 17:48:03', NULL, NULL),
(465, 418, 'SSL-HMSPAY1785452876714', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1785452876714', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-30 23:08:47', NULL, '2026-07-30 23:08:47', '2026-07-30 23:08:47', NULL, NULL),
(466, 419, 'DR-1785463901584-419', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-07-31 02:11:41', NULL, '2026-07-31 02:11:41', '2026-07-31 02:42:31', NULL, NULL),
(467, 419, 'BKASH_TR0011V6UwbuU1785464028875', 'bkash', 'booking', 'payment_initiated', 5.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011V6UwbuU1785464028875', NULL, '{\"paymentID\":\"TR0011V6UwbuU1785464028875\",\"status\":\"cancel\",\"signature\":\"uA4M05uX3b\",\"apiVersion\":\"1.2.0-beta/\"}', 'bKash payment initiated', 'failed', NULL, NULL, '2026-07-31 02:13:48', '2026-07-31 02:14:00', NULL, NULL),
(468, 424, 'BKASH_TR0011CzWE5eC1785492184678', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011CzWE5eC1785492184678', NULL, NULL, 'bKash payment initiated for HMS booking via link', 'pending', '2026-07-31 10:03:04', NULL, '2026-07-31 10:03:04', '2026-07-31 10:03:04', NULL, NULL),
(469, 424, 'DR-AUTO-1785492218358-424', NULL, 'booking', 'owner_accepted', 0.00, 0.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Automatic DR entry for successful payment - ৳0.00', 'completed', '2026-07-31 10:03:38', NULL, '2026-07-31 10:03:38', '2026-07-31 10:03:38', NULL, NULL),
(470, 424, 'CR-1785492218360-424', 'bkash', 'booking', 'guest_payment', 2700.00, 0.00, 2700.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DGV1WMFJTJ - Total: ৳2700.00', 'completed', '2026-07-31 10:03:38', NULL, '2026-07-31 10:03:38', '2026-07-31 10:03:38', NULL, NULL),
(471, 423, 'SSL-HMSPAY1785499556658', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1785499556658', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-31 12:06:30', NULL, '2026-07-31 12:06:30', '2026-07-31 12:06:30', NULL, NULL),
(472, 422, 'SSL-HMSPAY1785499627168', 'sslcommerz', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', 'HMSPAY1785499627168', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳6000.00', 'completed', '2026-07-31 12:07:47', NULL, '2026-07-31 12:07:47', '2026-07-31 12:07:47', NULL, NULL),
(473, 421, 'SSL-HMSPAY1785500955929', 'sslcommerz', 'booking', 'guest_payment', 6000.00, 0.00, 6000.00, 0.00, 'BDT', 'HMSPAY1785500955929', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳6000.00', 'completed', '2026-07-31 12:29:56', NULL, '2026-07-31 12:29:56', '2026-07-31 12:29:56', NULL, NULL),
(474, 425, 'SSL-HMSPAY1785504405544', 'sslcommerz', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', 'HMSPAY1785504405544', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3000.00', 'completed', '2026-07-31 13:27:26', NULL, '2026-07-31 13:27:26', '2026-07-31 13:27:26', NULL, NULL),
(475, 426, 'BKASH_TR0011Q56ctjr1785515413787', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011Q56ctjr1785515413787', NULL, '{\"paymentID\":\"TR0011Q56ctjr1785515413787\",\"status\":\"cancel\",\"signature\":\"beavHmgKj6\",\"apiVersion\":\"1.2.0-beta/\"}', 'bKash payment initiated for HMS booking via link', 'failed', '2026-07-31 16:30:14', NULL, '2026-07-31 16:30:14', '2026-07-31 16:31:14', NULL, NULL),
(476, 426, 'SSL-HMSPAY1785517349455', 'sslcommerz', 'booking', 'guest_payment', 3500.00, 0.00, 3500.00, 0.00, 'BDT', 'HMSPAY1785517349455', NULL, NULL, 'Guest payment received via SSLCommerz - Total paid: ৳3500.00', 'completed', '2026-07-31 17:03:10', NULL, '2026-07-31 17:03:10', '2026-07-31 17:03:10', NULL, NULL),
(477, 427, 'BKASH_TR0011tt6ENXm1785530845097', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011tt6ENXm1785530845097', NULL, '{\"paymentID\":\"TR0011tt6ENXm1785530845097\",\"status\":\"cancel\",\"signature\":\"his96bWOzV\",\"apiVersion\":\"1.2.0-beta/\"}', 'bKash payment initiated for HMS booking via link', 'failed', '2026-07-31 20:47:25', NULL, '2026-07-31 20:47:25', '2026-07-31 20:48:38', NULL, NULL),
(478, 427, 'BKASH_TR0011TXhekTe1785530936658', 'bkash', '', 'payment_initiated', 0.00, 0.00, 0.00, 0.00, 'BDT', 'TR0011TXhekTe1785530936658', NULL, NULL, 'bKash payment initiated for HMS booking via link', 'pending', '2026-07-31 20:48:56', NULL, '2026-07-31 20:48:56', '2026-07-31 20:48:56', NULL, NULL),
(479, 427, 'DR-AUTO-1785530969651-427', NULL, 'booking', 'owner_accepted', 0.00, 0.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Automatic DR entry for successful payment - ৳0.00', 'completed', '2026-07-31 20:49:29', NULL, '2026-07-31 20:49:29', '2026-07-31 20:49:29', NULL, NULL),
(480, 427, 'CR-1785530969653-427', 'bkash', 'booking', 'guest_payment', 3000.00, 0.00, 3000.00, 0.00, 'BDT', NULL, NULL, NULL, 'Guest payment received via bKash TXN:DH13064BRF - Total: ৳3000.00', 'completed', '2026-07-31 20:49:29', NULL, '2026-07-31 20:49:29', '2026-07-31 20:49:29', NULL, NULL),
(481, 429, 'DR-1785562456536-429', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-08-01 05:34:16', NULL, '2026-08-01 05:34:16', '2026-08-01 06:04:26', NULL, NULL),
(482, 430, 'DR-1785562477534-430', NULL, 'booking', 'owner_accepted', 5.00, 5.00, 0.00, 0.00, 'BDT', NULL, NULL, NULL, 'Auto-accepted booking - Receivable amount: ৳5', 'cancelled', '2026-08-01 05:34:37', NULL, '2026-08-01 05:34:37', '2026-08-01 06:05:26', NULL, NULL);

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
  `internal_name` varchar(255) DEFAULT NULL,
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
  `is_single_unit` tinyint(1) DEFAULT 0,
  `slug` varchar(255) DEFAULT NULL,
  `auto_accept_bookings` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_rent_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_stay_type` enum('both','monthly_only') NOT NULL DEFAULT 'both',
  `monthly_min_stay_nights` int(11) NOT NULL DEFAULT 30,
  `monthly_rent_amount` decimal(12,2) DEFAULT NULL,
  `monthly_advance_amount` decimal(12,2) DEFAULT NULL,
  `monthly_furnished` tinyint(1) NOT NULL DEFAULT 1,
  `monthly_wifi_included` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_electricity_included` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_gas_included` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_water_included` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_cleaning_included` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_service_charge_included` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_inclusions_notes` text DEFAULT NULL,
  `monthly_security_deposit` decimal(12,2) DEFAULT NULL,
  `monthly_cancellation_policy` enum('flexible','moderate','strict','custom') NOT NULL DEFAULT 'moderate',
  `monthly_approved` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`id`, `owner_id`, `title`, `internal_name`, `description`, `property_type`, `property_category`, `address`, `city`, `state`, `country`, `postal_code`, `latitude`, `longitude`, `bedrooms`, `bathrooms`, `max_guests`, `size_sqft`, `floor_number`, `base_price`, `cleaning_fee`, `security_deposit`, `extra_guest_fee`, `currency`, `status`, `is_featured`, `is_instant_book`, `is_non_refundable`, `check_in_time`, `check_out_time`, `minimum_stay`, `maximum_stay`, `average_rating`, `total_reviews`, `created_at`, `updated_at`, `display_category_id`, `is_hms_enabled`, `is_single_unit`, `slug`, `auto_accept_bookings`, `monthly_rent_enabled`, `monthly_stay_type`, `monthly_min_stay_nights`, `monthly_rent_amount`, `monthly_advance_amount`, `monthly_furnished`, `monthly_wifi_included`, `monthly_electricity_included`, `monthly_gas_included`, `monthly_water_included`, `monthly_cleaning_included`, `monthly_service_charge_included`, `monthly_inclusions_notes`, `monthly_security_deposit`, `monthly_cancellation_policy`, `monthly_approved`) VALUES
(68, 27, 'Peaceful 3BR Near Evercare & NSU', NULL, '\nLiving room  Sofa set, smart TV, dining table\n\nFully equipped kitchen  Fridge, gas stove, microwave, kettle, cookware & utensils\n\nAir conditioning  In all bedrooms\n\nWi-Fi  Fast and reliable, suitable for work or streaming\n\nGenerator backup  No worries during load-shedding\n\nPerfect for up to 6 guests looking for comfort and convenience.', 'apartment', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 3, 3, 6, NULL, NULL, 6000.00, 0.00, 0.00, 500.00, 'BDT', 'inactive', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-03-31 04:45:48', '2026-06-25 14:50:20', NULL, 1, 0, 'peaceful-3br-near-evercare-nsu-68', 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(69, 27, 'Private Deluxe Suite near Evercare & NSU', NULL, 'Relax in this modern AC suite featuring a plush double bed, private ensuite bathroom with hotwater shower, and a comfy seating area. Enjoy a mini fridge, flatscreen TV, ceiling fan, wardrobe, and free WiFi. Thoughtful touches include fresh linens, toiletries and a welcome note with local tips. Ideal for couples or solo travellers seeking comfort near local restaurants and shops.', 'room', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 1, 1, 2, NULL, NULL, 3500.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '14:00:00', '00:00:00', 1, NULL, 0.00, 0, '2026-03-31 08:36:05', '2026-07-08 09:33:10', NULL, 1, 1, 'private-deluxe-suite-near-evercare-nsu-69', 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(70, 27, 'Private AC Suite Near Evercare, NSU & ISD', NULL, 'Welcome to a clean, comfortable, and private stay in Bashundhara Residential Area (Block A, Road 1)  just minutes from Evercare Hospital, North South University (NSU), and ISD.\n\nThe Space\n- Comfortable queen-size bed\n-Air conditioning\n-Private attached bathroom with shower\n-High-speed WiFi\n-Small seating area\n-Fresh linens', 'room', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 1, 1, 2, NULL, NULL, 3500.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '14:00:00', '00:00:00', 1, NULL, 0.00, 0, '2026-03-31 08:46:37', '2026-07-15 11:40:35', NULL, 1, 1, 'private-ac-suite-near-evercare-nsu-isd-70', 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(73, 26, '3BR apartment near evercare', NULL, ' Spacious 3BR Apartment  2 Ensuites  Balcony  Bashundhara\nUnwind in a clean, cozy, and fully furnished  apartment located in the heart of Bashundhara Block A, Dhaka. Ideal for families, business travelers, or small groups enjoy AC in every room, fast Wi-Fi, private balconies, and 24/7 security. Flexible check-in/out and weekly cleaning .\n\n Whats Nearby:\n\n️ Jamuna Future Park 5 mins\n\n Evercare Hospital  7 mins\n\n Dhaka Airport  20 mins\n\n Baridhara Diplomatic Zone  10 mins', 'apartment', 'premium', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 3, 3, 6, 1650, NULL, 6000.00, 0.00, 0.00, 500.00, 'BDT', 'suspended', 1, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-03-31 12:55:52', '2026-05-24 08:41:52', NULL, 0, 1, '3br-apartment-near-evercare-73', 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(74, 28, ' 3 Bedroom Furnished Apartment for Rent in Mirpur Original 10 ️Dhaka Bangladesh ', NULL, ' 3 Bedroom Furnished Apartment for Rent in Mirpur Original 10 ️Dhaka Bangladesh \n\n Location: Mirpur Original 10, West Side, Near Dhaka Metro Rail (Metro 10 Station) Bangladesh \n মেট্রোর একদম পাশে  Easy Communication\n\n\n\n Apartment Features:\n️ Fully Furnished Luxury Flat\n️ 3 Spacious Bedrooms\n️ 1 Attached Bathroom  2 Common Bathrooms\n️ Elegant Drawing Room with Android TV\n️ Dining Space\n️ Modern Kitchen\n️ 3 Verandas (Open & Airy)\n️ Fridge  Oven\n️ Pure It Water Filter\n️ Kitchen Accessories\n️ High Speed Internet\n️ 1 Time Daily Cleaning Service \n️ Car Parking (On Demand  Chargeable)\n️ Catering Service Available (On Demand)\n\n Youll find everything you need for a perfect comfortable stay!\n\n Booking Requirement:\n Valid NID / Passport Copy Required', 'apartment', 'standard', 'Rony.Section-6,Block-A,Road-5,Plot-3,Mirpur,Dhaka-1216.Bangladesh.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1216', NULL, NULL, 3, 3, 6, 1175, NULL, 4000.00, 0.00, 0.00, 500.00, 'BDT', 'active', 1, 0, 0, '12:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-04-02 11:31:42', '2026-05-24 01:42:24', NULL, 0, 1, '3-bedroom-furnished-apartment-for-rent-in-mirpur-74', 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(75, 28, ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড!  Mirpur Dhaka Bangladesh.', NULL, ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড! \nMirpur Dhaka Bangladesh.\nPerfect Stay  Prime Location  Ready to Move\n\n Why This Apartment is Special?\n\n Location: Mirpur Original 10.Just beside Metro 10 Station (West Side)  Just Walking Distance \n Inside the Apartment Youll Get:\n️ 2 Luxury Furnished Bedrooms\n️1 AC Room for Premium Comfort\n Smart Android TV\n️ Complete Kitchen\n Fridge  Oven  Pureit Water Filter\n High Speed Internet\n Daily one time Cleaning Service (FREE)\n Car Parking Available.(chargeable)\n Catering Service Available.\n Perfect for:\n️ Family Stay\n️ বিদেশ থেকে আসা Guest\n️ Corporate People\n️ Short Term Luxury Stay\n', 'apartment', 'standard', 'Rony.Section-6,Block-A,Road-5,Plot-3,Mirpur,Dhaka-1216.Bangladesh.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1216', NULL, NULL, 2, 2, 4, 650, NULL, 3000.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '12:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-04-02 11:36:40', '2026-05-24 01:42:24', NULL, 0, 1, 'mirpur-dhaka-bangladesh-75', 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(76, 28, ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট 1 ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড!  Mirpur Dhaka Bangladesh.', NULL, ' ২ বেডরুম ফার্নিশড অ্যাপার্টমেন্ট ভাড়া মিরপুর অরিজিনাল ১০ মেট্রোর পাশেই ফুল ফার্নিশড! \nMirpur Dhaka Bangladesh.\nPerfect Stay  Prime Location  Ready to Move\n\n Why This Apartment is Special?\n\n Location: Mirpur Original 10.Just beside Metro 10 Station (West Side)  Just Walking Distance \n Inside the Apartment Youll Get:\n️ 2 Luxury Furnished Bedrooms\n️1 AC Room for Premium Comfort\n Smart Android TV\n️ Complete Kitchen\n Fridge  Oven  Pureit Water Filter\n High Speed Internet\n Daily one time Cleaning Service (FREE)\n Car Parking Available.(chargeable)\n Catering Service Available.\n Perfect for:\n️ Family Stay\n️ বিদেশ থেকে আসা Guest\n️ Corporate People\n️ Short Term Luxury Stay\n', 'apartment', 'standard', 'Rony.Section-6,Block-A,Road-5,Plot-3,Mirpur,Dhaka-1216.Bangladesh.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1216', NULL, NULL, 2, 2, 4, 600, NULL, 3000.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '12:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-04-02 11:40:41', '2026-05-24 01:42:24', NULL, 0, 1, '1-mirpur-dhaka-bangladesh-76', 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(77, 29, 'CC  TV Sweet Bedroom Attached Washroom & Balcony at Muhammadpur  Sat Masjid Housing', NULL, 'Special discount for a limited Time.\nAuto Applied on the selected date.\n𝐅𝐥𝐚𝐭 𝟏𝟔 𝐃𝐢𝐬𝐜𝐨𝐮𝐧𝐭\n\n 𝐅𝐚𝐜𝐢𝐥𝐢𝐭𝐢𝐞𝐬\n️ AC\n️ Attached Washroom\n️ Attached Balcony\n️ Fan, Bed & Light\n️ Free WiFi\n️ Kitchen Access (Guests must bring their own essentials  oil, salt, masala, etc.)\n️ Bike Parking Available  100 BDT/day\n\n Please Note: \n All guests must upload a clear photo of their NID or Passport in the Travela app after completing the payment\n Strictly Prohibited: No drugs, alcohol, or smoking allowed inside the property.\n No check-in after 12AM\n No check-in allowed without proper NIDs of all the guests', 'room', 'premium', 'Jannat Tower, Sat Masjid Housing Road, Dhaka, Bangladesh', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1207', 23.75821860, 90.35242660, 1, 1, 2, 150, NULL, 5.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 4.00, 1, '2026-04-21 05:19:34', '2026-07-30 09:34:44', 2, 1, 1, 'cc-tv-sweet-bedroom-attached-washroom-balcony-77', 1, 1, 'both', 30, 400.00, 50.00, 1, 1, 1, 1, 1, 1, 1, NULL, 50.00, 'moderate', 1),
(78, 29, 'Hotel Jannat ', NULL, 'Hotel Jannat ', 'hotels', 'premium', 'Jannat Tower, Sat Masjid Housing Road, Dhaka, Bangladesh', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1207', 23.75821860, 90.35242660, 20, 1, 2, NULL, NULL, 3000.00, 0.00, 0.00, 0.00, 'BDT', 'suspended', 1, 0, 0, '15:00:00', '11:00:00', 1, NULL, 4.00, 1, '2026-04-21 08:52:36', '2026-07-06 08:20:24', NULL, 1, 0, 'hotel-jannat-78', 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(80, 27, 'Private AC Suite near Evercare, NSU, IUB', 'Room 103', 'Welcome to a clean, comfortable, and private stay in Bashundhara Residential Area (Block A, Road 1)  just minutes from Evercare Hospital, North South University (NSU), and ISD.\n\nThe Space\n- Comfortable queen-size bed\n-Air conditioning\n-Private attached bathroom with shower\n-High-speed WiFi\n-Small seating area\n-Fresh linens', 'room', 'standard', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 1, 1, 4, NULL, NULL, 3500.00, 0.00, 0.00, 0.00, 'BDT', 'active', 1, 0, 0, '14:00:00', '12:00:00', 1, NULL, 0.00, 0, '2026-05-17 08:26:06', '2026-07-13 10:04:27', NULL, 1, 1, 'private-ac-suite-near-evercare-nsu-iub-80', 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(81, 31, 'Test Cozy Apartment in Gulshan', NULL, 'This is a test property listing for QA purposes. It is not a real apartment. It has two bedrooms, a living area, kitchen, WiFi, and air conditioning. Located in Gulshan, Dhaka.', 'apartment', 'standard', 'House 10, Road 11, Gulshan 1', 'Dhaka', 'Dhaka Division', 'Bangladesh', '', 23.80203126, 90.40891724, 1, 1, 2, 800, NULL, 4000.00, 0.00, 0.00, 0.00, 'BDT', 'suspended', 0, 0, 0, '15:00:00', '11:00:00', 1, 30, 0.00, 0, '2026-05-22 15:03:39', '2026-05-24 08:42:27', NULL, 0, 1, 'test-cozy-apartment-in-gulshan-81', 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(88, 34, 'Test Property for HMS', NULL, 'This is a test property for demonstrating the HMS features of the KeyHost platform.', 'room', 'standard', '', '', '', 'Bangladesh', '', NULL, NULL, 1, 1, 2, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'BDT', 'in_progress', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-05-26 05:17:56', '2026-06-26 04:00:00', NULL, 0, 1, NULL, 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(89, 27, 'Keyhost Bashundhara unit', NULL, 'Keyhost Bashundhara block A', 'room', 'standard', 'KeyHost Homes Bashundhara Unit A1, Road Number 1, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81222470, 90.42753750, 6, 6, 12, NULL, NULL, 2500.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-05-26 09:50:49', '2026-07-21 06:44:40', NULL, 1, 0, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(90, 37, 'Cozy home ', '262/1 sultangong road Rayerbazar Nimtola mondir ', 'Comfortable and clean 3-bedroom apartment located in West Dhanmondi. The apartment is fully furnished and includes Wi-Fi, air conditioning, kitchen, refrigerator, hot water, and a spacious living area. It is located in a safe and quiet neighborhood, close to restaurants, supermarkets, pharmacies, and public transport. Perfect for families, business travelers, and tourists.', 'apartment', 'standard', '262/1 Sultangong Road, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1209', 23.74337530, 90.36532220, 3, 3, 6, 1100, NULL, 3500.00, 100.00, 10000.00, 500.00, 'BDT', 'in_progress', 0, 0, 1, '20:00:00', '11:00:00', 3, 30, 0.00, 0, '2026-06-30 06:19:49', '2026-06-30 10:26:20', NULL, 0, 1, NULL, 0, 1, 'both', 30, 90000.00, 25000.00, 1, 1, 0, 1, 1, 1, 1, 'Monthly rent includes furnished apartment, WiFi, gas, water, cleaning, and service charge. Electricity bill is charged separately based on actual usage.\n', 15000.00, 'moderate', 1),
(91, 37, 'Cosy home ', 'West Dhanmondi 3BR flat 5B', 'Enjoy a comfortable and fully furnished 3-bedroom apartment in West Dhanmondi. The apartment includes WiFi, gas, water, cleaning, and service charge. It is located in a safe and quiet neighborhood with easy access to restaurants, supermarkets, pharmacies, hospitals, and public transport. Ideal for families, business travelers, and tourists.', 'apartment', 'standard', '262/1 Sultangong Road, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1209', 23.74337530, 90.36532220, 3, 3, 6, NULL, NULL, 3500.00, 100.00, 10000.00, 500.00, 'BDT', 'active', 0, 0, 1, '20:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-06-30 06:54:54', '2026-06-30 10:25:03', NULL, 0, 1, NULL, 0, 1, 'both', 30, 80000.00, 25000.00, 1, 1, 0, 1, 1, 1, 1, 'Monthly rent includes furnished apartment, WiFi, gas, water, cleaning, and service charge. Electricity bill is charged separately based on actual usage.\n', 15000.00, 'moderate', 0),
(92, 40, 'Amicus Rahman Castle, 1.Kathalbagan, Green Road Dhaka ', 'Flat No B -4', 'Nearby Panthapath Signal, Green Life Medical College Hospital, Labaid cancer Hospital, SQUARE Hospital, Bashundhara shopping malls and others ', 'apartment', 'luxury', 'Amicus Rahman Castle, Green Road, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1215', 23.74810147, 90.38819075, 3, 4, 4, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'BDT', 'pending_approval', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-01 12:24:26', '2026-07-01 12:45:11', NULL, 0, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(93, 41, 'Premium apartment -Uttara 18 RUAP, lake view, South face, Near Metro', 'Krishnachura', 'Brand new flat at RUAP gated community, best location to stay at Dhaka. The flat is South face, in front of playground, lakeside view and very near to Dhaka Metro Uttara centre station.\nThis is a Central located area where you will get everything with in your reach. \nYou will get shopping mall, big Masjid and all home delivery service etc available with high security.', 'apartment', 'premium', 'Uttara Sector 18, Rajuk Uttara Apartment Project, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1230', 23.85643800, 90.35597090, 3, 4, 6, 1654, NULL, 2000.00, 500.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-02 06:26:20', '2026-07-09 02:39:24', NULL, 0, 1, NULL, 0, 1, 'both', 30, 50000.00, 30000.00, 1, 1, 1, 1, 0, 1, 1, 'Electricity bill up to 2000 tk, extra bill will be paid by the tenant. Monthly 1 LP gas cylinder 12kg will be provided.', 30000.00, 'moderate', 1),
(94, 44, 'Room', NULL, 'One bed room with washroom, Almirah, queen size bed, one chair, washroom.', 'room', 'standard', 'House 762, Road 23, Block F, Bashundhara, Dhaka ', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1229', NULL, NULL, 1, 1, 2, NULL, NULL, 2200.00, 0.00, 2200.00, 0.00, 'BDT', 'in_progress', 0, 0, 1, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-02 14:40:49', '2026-07-02 14:52:52', NULL, 0, 1, NULL, 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(95, 45, 'Cozy 2BR Rooftop Apartment in Bashundhara R/A', '7', 'Enjoy a serene escape surrounded by nature, with three large glass windows filling the space with sunlight and scenic views. Located in a peaceful family-only building with rooftop access, this cozy stay is just steps away from restaurants, cafés, grocery stores, and a gym. Perfect for travelers seeking comfort, convenience, and a relaxing atmosphere.\nThe space: 2 Bedrooms with 2 Bathrooms. Kitchen with all cooking wares and utensils would be provided. Air conditioning available in master bed.\n\nOnly for families/similar gender friends', 'apartment', 'standard', 'Shetara, Road Number 7, House 415/E, Block-D Bashundhara, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1229', 23.81530432, 90.43590405, 2, 2, 4, NULL, NULL, 3500.00, 0.00, 0.00, 1000.00, 'BDT', 'active', 0, 0, 1, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-03 09:48:06', '2026-07-06 06:43:56', NULL, 0, 1, NULL, 0, 1, 'both', 30, 80000.00, 25000.00, 1, 1, 1, 1, 1, 0, 0, NULL, NULL, 'moderate', 1),
(96, 46, 'Luxurious Sea View Couple Room', 'Sea View Couple', '- 1 Bed Room King Size Bed\n- AC\n- Drawing Room With Sufa\n- Attached Wash Room\n- Sea View Balcony', 'room', 'premium', 'World Beach Resort, Cox\'s Bazar - Chittagong Road, Cox\'s Bazar, Bangladesh', 'Cox\'s Bazar District', 'Chittagong Division', 'Bangladesh', '4700', 21.41632570, 91.98582170, 1, 1, 2, 250, NULL, 2500.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '12:30:00', '11:00:00', 2, 365, 0.00, 0, '2026-07-03 10:07:57', '2026-07-06 06:43:52', NULL, 0, 1, NULL, 1, 1, 'both', 30, 45000.00, 90000.00, 1, 1, 1, 0, 1, 1, 1, NULL, 45000.00, 'flexible', 1),
(97, 48, 'A2Jigatola,Dhanmondi AreaCozy Beautiful Bedroom With Attached Washroom & Belcony', 'A2Jigatola,Dhanmondi AreaCozy Beautiful Bedroom With Attached Washroom & Belcony', ' Property Description:\nEnsure 100 Safety.No Disturbance.\n100 safe and secure Private Non-AC Room - Only for Guests.\n Only Couple allow.Family & singel Male & Female Friendly.\nPlease Note: You Guys Must have 18 and need photocopy of nid picture both side or passport picture & both person selfi.need every person doccument.\n\n PIs don\'t come wear School or college dress.\n\n\n Location:\nNear by Jigatola cha & Chill and Jigatola shawpno. Just a 5-10minute walking from the main \nJigatola & 15 no Bus Stand, Dhanmondi. near by ibna sina,popular, bangladesh medical  hospital.Also near by beautiful Lake.making it very convenient for transportation and daily travel.\nNote️: Located on the 4th floor (3rd press on lift).\n\n\n Facilities you will Enjoy :\n Non- Ac, Cozy Room with Belcony. \n Attached Washroom\n High-Speed Wi-Fi\n Mirror\n Hanger u Can keep ur stuff.\n 24/7 Security \n️ Foodpanda Delivery Allowed.\n\n Guest Preparation: Please bring your own:\n Towel\n Complimentary Items\nOne bottle Water\n Glass & plate\nTissue\n Handwash (in washroom)\nShower Gel.                                         cooking facilities.\n House Rules:\n Smoking (only in Belcony area)\n Any permanent damage to the property will be charged.\n Strictly Not Allowed:\n Drugs / Alcohol / Weed / yaba or any kind of Drugs.\n Loud behavior / Loud Noise/Shoes inside the room.\n Guests entering after 10:00 PM\n\n Important Notes: short Stays guest Once Check in & Once Check-out After booking, no date change or refund is not allowed.Please respect house rules to maintain a peaceful environment for all.', 'room', 'standard', 'Aysha\'s Genesis, Plot 44/c Abdul hai road jigatola,Dhanmondi, Dhaka-1209.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1209', 23.74060463, 90.37016898, 1, 1, 2, 300, NULL, 1849.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '11:00:00', '10:00:00', 1, 30, 0.00, 0, '2026-07-03 14:11:42', '2026-07-04 11:08:29', NULL, 0, 1, NULL, 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(98, 48, 'A1 Jigatola,Dhanmondi AreaCozy Beautiful Room With Attached Washroom & Belcony', 'A1 Jigatola,Dhanmondi AreaCozy Beautiful Room With Attached Washroom & Belcony', ' Property Description\nEnsure Safety.No Disturbance.\nsafe and secure Private Non-AC Room - Only for Guests.\nOnly Couple allow.Family & singel Male & Female Friendly.\nPlease Note: You Guys Must have 18 and need photocopy of nid picture both side or passport picture & both person selfi.need every person doccument.\n\n PIs don\'t come wear School or college dress.\n\n\n Location:\nNear by Jigatola cha & Chill and Jigatola shawpno. Just a 5-10minute walking from the Jigatola & 15 no Bus Stand, Dhanmondi. near by ibna sina,popular, bangladesh medical  hospital.Also near by beautiful Lake.making it very convenient for transportation and daily travel.\nNote️: Located on the 4th floor (3rd press on lift).\n\n\n Facilities you will Enjoy :\n Non- Ac, Cozy Room with Belcony. \n Attached Washroom\n High-Speed Wi-Fi\n Mirror\n Hanger u Can keep ur stuff.\n 24/7 Security \n️ homemade vegetarian food available for breakfast lunch dinner & Foodpanda Delivery Allowed.\n\n Guest Preparation: Please bring your own Towel. \n                                                                            Complimentary Items\nOne bottle Water & Water Purifier. \n Glass & plate\nTissue\n Handwash (in washroom)\nShower Gel.                                         cooking facilities.\n House Rules:\n\n Smoking (only in Belcony area)\n️Any permanent damage to the property will be charged.\n Strictly Not Allowed:\n Alcohol / Weed / yaba or any kind of Drugs.\n Loud behavior / Loud Noise/Shoes inside the room.\n Guests entering after 10:00 PM\n\n Important Notes: short Stays guest Once Check-in & Once Check-out. After booking, no date change.Please respect house rules to maintain a peaceful environment for all.', 'room', 'standard', 'Ayshas Genesis\" Plot 44/C, Abdul Hai Road, Zigatola, Dhanmondi, Dhaka-1209.', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1209', 23.74060463, 90.37016898, 1, 1, 2, 300, NULL, 1849.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '11:00:00', '10:00:00', 1, 30, 0.00, 0, '2026-07-03 14:30:15', '2026-07-04 11:08:08', NULL, 0, 1, NULL, 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(99, 50, 'Lake Circus Heritage', 'Lake Circus Heritage', 'Lake Circus Heritage in Dhaka offers a spacious, recently renovated apartment with two bedrooms and two bathrooms. The living room features a sofa and dining area, complemented by a balcony with garden view.', 'apartment', 'standard', 'Dolphin Goli, Kalabagan, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '1205', 23.75095390, 90.38002740, 2, 2, 5, 1000, NULL, 4000.00, 200.00, 500.00, 500.00, 'BDT', 'active', 0, 0, 1, '14:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-04 09:39:26', '2026-07-06 06:43:47', NULL, 0, 1, NULL, 0, 1, 'both', 30, 80000.00, 80000.00, 1, 0, 1, 1, 1, 1, 0, NULL, 20000.00, 'moderate', 1),
(100, 55, 'Azreen Tower 9f n 9g', 'West khulshi chattogram ', 'Entire Luxurious 4 Bedroom (2AC  & 2 Non ac)  Apartment at Chittagong  West Khulshi.\n\nNOT ALLOWED :\n1) Pets \n 2) Events \n3) Commercial photography and filming .\n\nSTRICTLY PROHIBITED :\n1) Local guests/guests. \n2) Alcoholic drinks any kinds .\n3) Smok any kind inside apartments .\n\nFINES :\n\n1) Smok fine taka 1000/-\n\nADDITIONAL RULES :\n\n1) Extra bed charges taka 1500/- per bed per night .\n2) Smooker can smok in dedicated area which is situated at belcony of donning and living room.  \n3) kitchen ameneties and utensils need to be cleaned and back to same as before.  If not will be charged as cleaning \nasper volume.\n4) Washing machine please pay 1st to care taker taka 500/- per wash cash. Care taker will run the machine . \n5) Dryer machine please pay 1st to care taker taka 500/- per dry cash. Care taker will run the machine . \n\nQUIET HOURS : \n\nStart 11:00 pm End 8:00 am ', 'apartment', 'standard', '136d BADC Road, Chattogram, Bangladesh', 'Chittagong District', 'Chittagong Division', 'Bangladesh', '4202', 22.36637100, 91.80286930, 4, 4, 8, 3837, NULL, 7999.00, 0.00, 2000.00, 1500.00, 'BDT', 'active', 0, 0, 1, '14:00:00', '12:00:00', 1, 28, 0.00, 0, '2026-07-07 07:58:10', '2026-07-12 11:30:07', NULL, 0, 0, NULL, 1, 1, 'both', 30, 170000.00, 170000.00, 1, 1, 0, 0, 1, 1, 1, NULL, 10000.00, 'strict', 1),
(101, 42, 'Private Bedroom with Attached Washroom and Balcony at Bashundhara Riverview, South Keraniganj, Dhaka', 'Bashundhara Riverview ', ' 100 safe & sceure for all guests. \n\n  Allow: Unmarried/ Married couple & any tipes of guest.\n\n️ Parking: Free\n\n️  Identy Card: After paying for the booking, please provide a photocopy of at least 1 guest\'s NID or passport or birth certificate.\n\nBashundhara Riverview experience comfort, convenience, and a homely atmosphere at this well-maintained family apartment located in the peaceful residential area of South Keraniganj, Dhaka.', 'room', 'standard', 'চায়না বিল্ডিং, লিফটের- ৬, ফ্লাট নং- এ-৬, রোড নম্বর- ৬, ব্লক- সি, বসুন্ধরা রিভারভিউ, পুরাতন আদ-দীন হাসপাতালের কাছে, দক্ষিণ কেরানীগঞ্জ, ঢাকা', 'Dhaka', 'Dhaka Division', 'Bangladesh', '', 23.66842411, 90.42562366, 1, 2, 2, NULL, NULL, 1199.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '12:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-08 05:25:23', '2026-07-08 08:12:52', NULL, 0, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(102, 56, 'Dhanmondi Ac,Smart tv,Self check in Room Shankar Zafrabad', 'Zafrabad Shankar ', ' Cozy Private Room \n Bangladesh Eye️️ Hospital & Ibn Sina Hospital 10/a,Bangladesh medical those are located Shankar Bus Stand.Those hospital distance 5min by ricksha.\nMohammadpur bus stand is near about 5min by ricksha\nIbn sina hospital 9/a,Fazlul haque colorectal hospital,Dhanmondi 15,unimarat,mena bazar,Almas  distance 7-10min by ricksha.\n\nZigatola bus stand and Rifles square Cineplex distance 10-15min\nAllow\nUnmarried Couple/married Couple/Family\n\nBut You Guys Must have 18 and need nid copyfront side&Back sideor passport copy or birth certificate with student id or job id)\n and need every person documents \nAfter booking send it to my wts app number\n\nEnjoy a peaceful stay in this cozy and budget-friendly room.making it ideal for quick access.\n\n️Room Facilities-\nLIft\nATTACH BATH\nmicro-oven\nFridge\nwater filter\nKitchen & Cooking Facilities available \nplate glass\nsmart lock\nSMART TV\"\nGEYSER\nWIFI\nFAN\nFOOD PANDA ALLOW \nmicroven \n\nHouse Rules :\nThe main gate closes at 11 PM at night. So be sure you are in before the mentioned time after that guest not allowed\nPlease wear decent dress.\nThe lift remains closed from 2 pm to 3 pm daily.\nPlease use the place as your own and keep it clean as much as you can when checking out.\nPlease turn off AC, Fan, Light when checking out for saving the environment.\nIncase of any major damage to the property, you have to pay compensation. \n\nParking Allow-\nBike-100Tk per day Car parking 300tk per day\n\nNOT ALLOWED-\n\nDon\'t wear School & College dress.\n Alcohol, Parties and Loud music are not allowed inside the apartment.\nSmoking is allowed only in room but not weed \nPlease do not throw anything from balcony or window', 'room', 'luxury', 'West Dhanmondi & Shangkar, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '', 23.74888710, 90.36369681, 1, 1, 2, NULL, NULL, 2400.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '10:55:00', '10:00:00', 1, NULL, 0.00, 0, '2026-07-09 09:37:12', '2026-07-09 12:09:02', NULL, 0, 0, NULL, 0, 1, 'both', 30, 65000.00, 65000.00, 1, 1, 1, 1, 1, 1, 1, 'included all', 65000.00, 'moderate', 1),
(103, 58, 'Hotel Air Inn', 'Hotel Air Inn', '', 'room', 'standard', '', '', '', 'Bangladesh', '', NULL, NULL, 1, 1, 2, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'BDT', 'in_progress', 0, 0, 0, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-13 05:45:41', '2026-07-13 05:45:48', NULL, 0, 1, NULL, 0, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(104, 59, 'Cozy Bedroom in Dhanmondi 15.', 'R5', 'Enjoy a peaceful stay in the heart of Dhanmondi 15!\n\nJust a 2-minute walk from Ibn Sina Hospital and Satmasjid Road, our cozy accommodation offers the perfect blend of comfort and convenience.\n\nEverything you need is within easy reach:\nHospitals\nSchools\nCafés\n️Restaurants\nShopping & daily essentials\n\nWe provide FREE:\nHigh-speed Wi-Fi\nFresh bed linens\nClean blankets\nSoap & hand wash\nTissue\nBottled water\n️Access to a comfortable shared living space\n\nWhether you\'re visiting with family, traveling for medical appointments, business, or simply exploring Dhaka, you\'ll enjoy a clean, calm, and welcoming place to relax.\n\nBook your stay today and experience comfort, convenience, and great hospitality!\n', 'room', 'budget', 'Dhanmondi Beauty Hub, Road 8/A, Dhaka, Bangladesh', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1209', 23.74324520, 90.37161720, 1, 1, 2, 120, NULL, 1300.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 0, '12:00:00', '10:00:00', 1, NULL, 0.00, 0, '2026-07-19 14:55:19', '2026-07-19 17:14:02', NULL, 0, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(105, 60, 'AC room with attached bath and balcony .', 'sourab', 'Nid,passport or Driving licence need before your check in', 'room', 'budget', 'Bashundhara R/A Block J, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '', 23.81869053, 90.45257158, 1, 1, 2, NULL, NULL, 2199.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '11:00:00', '10:00:00', 1, 1, 0.00, 0, '2026-07-20 14:50:35', '2026-07-21 18:40:18', NULL, 1, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(106, 60, 'non ac with attached bath and balcony ', '01893140989', 'Nid,Passport or driving licences needs before your check in ', 'room', 'budget', 'Basundhara Residential Area, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '', 23.81914410, 90.45259540, 1, 1, 2, NULL, NULL, 1899.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '11:00:00', '10:00:00', 1, NULL, 0.00, 0, '2026-07-20 14:58:46', '2026-07-21 18:40:15', NULL, 1, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(107, 60, 'just a room , bath beside the room main door', NULL, 'nid,passport or driving licences needs before your check in ', 'room', 'standard', 'Basundhara Residential Area, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '', 23.81914410, 90.45259540, 1, 1, 2, NULL, NULL, 1599.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '11:00:00', '10:00:00', 1, NULL, 0.00, 0, '2026-07-20 15:05:46', '2026-07-21 18:40:12', NULL, 1, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(108, 60, 'ac room with attached bath and balcony ', NULL, 'nid,passport and driving licences needs before your check in ', 'room', 'budget', 'Basundhara Residential Area, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '', 23.81914410, 90.45259540, 1, 1, 2, NULL, NULL, 2299.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '11:00:00', '10:00:00', 1, NULL, 0.00, 0, '2026-07-20 15:23:09', '2026-07-27 18:40:29', NULL, 1, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(110, 60, 'Non ac with attached bath and balcony ', NULL, 'Nid,passport and driving licences needs before your check in ', 'room', 'standard', 'Basundhara Residential Area, Dhaka, Bangladesh', 'Dhaka District', 'Dhaka Division', 'Bangladesh', '', 23.81914410, 90.45259540, 1, 1, 2, NULL, NULL, 1899.00, 0.00, 0.00, 0.00, 'BDT', 'active', 0, 0, 1, '11:00:00', '10:00:00', 1, NULL, 0.00, 0, '2026-07-20 15:26:15', '2026-07-27 18:40:26', NULL, 1, 1, NULL, 1, 0, 'both', 30, NULL, NULL, 1, 0, 0, 0, 0, 0, 0, NULL, NULL, 'moderate', 0),
(111, 61, 'Apartment ', 'Shawpna Nagar-1', 'It is 1338 sft. full furnished flat in 10th floor of 14 storied building at Shawapna Nagar Residential Area-1, New Shagufta Road, Mirpur -9, Pallabi, (near  Mirpur DOHS), Dhaka. The apartment building is fully secured with three-tier CC Camera from main entrance gate to apartment door. There are all shopping facilities including Shapna Super Shop remains within the boundary wall. Big playground with walkways are available inside the  boundary.', 'apartment', 'standard', 'Shawpna Nagar Residential Area-1, Mirpur-9, Pallabi, Dhaka 1216', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1216', 23.83119026, 90.37639455, 3, 2, 5, 1338, NULL, 4500.00, 0.00, 90000.00, 0.00, 'BDT', 'pending_approval', 0, 0, 1, '15:00:00', '11:00:00', 1, NULL, 0.00, 0, '2026-07-31 10:16:04', '2026-07-31 11:44:01', NULL, 0, 1, NULL, 0, 1, 'both', 30, 60000.00, 60000.00, 1, 1, 0, 0, 1, 1, 1, NULL, 60000.00, 'moderate', 0);

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
(1291, 78, 4, '2026-04-21 09:06:11'),
(1292, 78, 6, '2026-04-21 09:06:11'),
(1293, 78, 9, '2026-04-21 09:06:11'),
(1475, 81, 1, '2026-05-22 15:19:25'),
(1476, 81, 2, '2026-05-22 15:19:25'),
(1477, 81, 4, '2026-05-22 15:19:25'),
(1478, 81, 8, '2026-05-22 15:19:25'),
(1479, 81, 9, '2026-05-22 15:19:25'),
(1480, 81, 10, '2026-05-22 15:19:25'),
(1553, 89, 3, '2026-05-26 09:55:16'),
(1554, 89, 8, '2026-05-26 09:55:16'),
(1555, 89, 11, '2026-05-26 09:55:16'),
(1556, 89, 4, '2026-05-26 09:55:16'),
(1568, 68, 1, '2026-06-04 12:27:02'),
(1569, 68, 2, '2026-06-04 12:27:02'),
(1570, 68, 3, '2026-06-04 12:27:02'),
(1571, 68, 8, '2026-06-04 12:27:02'),
(1572, 68, 9, '2026-06-04 12:27:02'),
(1573, 68, 10, '2026-06-04 12:27:02'),
(1574, 68, 11, '2026-06-04 12:27:02'),
(1621, 90, 2, '2026-06-30 06:34:03'),
(1622, 90, 1, '2026-06-30 06:34:03'),
(1623, 90, 9, '2026-06-30 06:34:03'),
(1624, 90, 4, '2026-06-30 06:34:03'),
(1625, 90, 8, '2026-06-30 06:34:03'),
(1626, 90, 11, '2026-06-30 06:34:03'),
(1641, 91, 2, '2026-06-30 08:14:52'),
(1642, 91, 1, '2026-06-30 08:14:52'),
(1643, 91, 9, '2026-06-30 08:14:52'),
(1644, 91, 4, '2026-06-30 08:14:52'),
(1645, 91, 8, '2026-06-30 08:14:52'),
(1646, 91, 11, '2026-06-30 08:14:52'),
(1732, 92, 1, '2026-07-01 12:45:11'),
(1733, 92, 2, '2026-07-01 12:45:11'),
(1734, 92, 3, '2026-07-01 12:45:11'),
(1735, 92, 4, '2026-07-01 12:45:11'),
(1736, 92, 8, '2026-07-01 12:45:11'),
(1737, 92, 9, '2026-07-01 12:45:11'),
(1738, 92, 10, '2026-07-01 12:45:11'),
(1739, 92, 11, '2026-07-01 12:45:11'),
(1778, 93, 4, '2026-07-02 06:46:53'),
(1779, 93, 8, '2026-07-02 06:46:53'),
(1780, 93, 11, '2026-07-02 06:46:53'),
(1781, 93, 3, '2026-07-02 06:46:53'),
(1782, 93, 16, '2026-07-02 06:46:53'),
(1783, 93, 9, '2026-07-02 06:46:53'),
(1784, 93, 10, '2026-07-02 06:46:53'),
(1785, 93, 1, '2026-07-02 06:46:53'),
(1786, 93, 2, '2026-07-02 06:46:53'),
(1807, 94, 1, '2026-07-02 14:52:52'),
(1824, 95, 2, '2026-07-03 09:56:59'),
(1825, 95, 1, '2026-07-03 09:56:59'),
(1826, 95, 10, '2026-07-03 09:56:59'),
(1827, 95, 4, '2026-07-03 09:56:59'),
(1828, 95, 8, '2026-07-03 09:56:59'),
(1829, 95, 3, '2026-07-03 09:56:59'),
(1830, 95, 16, '2026-07-03 09:56:59'),
(1831, 95, 11, '2026-07-03 09:56:59'),
(1906, 96, 1, '2026-07-03 19:37:43'),
(1907, 96, 2, '2026-07-03 19:37:43'),
(1908, 96, 3, '2026-07-03 19:37:43'),
(1909, 96, 8, '2026-07-03 19:37:43'),
(1910, 96, 9, '2026-07-03 19:37:43'),
(1911, 96, 10, '2026-07-03 19:37:43'),
(1912, 96, 11, '2026-07-03 19:37:43'),
(1913, 96, 14, '2026-07-03 19:37:43'),
(1914, 96, 16, '2026-07-03 19:37:43'),
(1970, 99, 2, '2026-07-04 09:52:03'),
(1971, 99, 10, '2026-07-04 09:52:03'),
(1972, 99, 4, '2026-07-04 09:52:03'),
(1973, 99, 8, '2026-07-04 09:52:03'),
(1974, 99, 16, '2026-07-04 09:52:03'),
(1975, 98, 1, '2026-07-04 11:08:08'),
(1976, 98, 4, '2026-07-04 11:08:08'),
(1977, 98, 8, '2026-07-04 11:08:08'),
(1978, 98, 10, '2026-07-04 11:08:08'),
(1979, 98, 11, '2026-07-04 11:08:08'),
(1980, 97, 1, '2026-07-04 11:08:29'),
(1981, 97, 4, '2026-07-04 11:08:29'),
(1982, 97, 8, '2026-07-04 11:08:29'),
(1983, 97, 10, '2026-07-04 11:08:29'),
(1984, 97, 11, '2026-07-04 11:08:29'),
(2043, 101, 10, '2026-07-08 05:40:06'),
(2044, 101, 4, '2026-07-08 05:40:06'),
(2045, 101, 8, '2026-07-08 05:40:06'),
(2046, 101, 3, '2026-07-08 05:40:06'),
(2047, 101, 16, '2026-07-08 05:40:06'),
(2048, 101, 11, '2026-07-08 05:40:06'),
(2049, 69, 1, '2026-07-08 09:33:10'),
(2050, 69, 2, '2026-07-08 09:33:10'),
(2051, 69, 8, '2026-07-08 09:33:10'),
(2052, 69, 9, '2026-07-08 09:33:10'),
(2053, 69, 10, '2026-07-08 09:33:10'),
(2054, 69, 11, '2026-07-08 09:33:10'),
(2055, 100, 1, '2026-07-08 11:48:27'),
(2056, 100, 2, '2026-07-08 11:48:27'),
(2057, 100, 3, '2026-07-08 11:48:27'),
(2058, 100, 4, '2026-07-08 11:48:27'),
(2059, 100, 7, '2026-07-08 11:48:27'),
(2060, 100, 8, '2026-07-08 11:48:27'),
(2061, 100, 11, '2026-07-08 11:48:27'),
(2102, 102, 1, '2026-07-09 10:00:38'),
(2103, 102, 2, '2026-07-09 10:00:38'),
(2104, 102, 3, '2026-07-09 10:00:38'),
(2105, 102, 4, '2026-07-09 10:00:38'),
(2106, 102, 9, '2026-07-09 10:00:38'),
(2107, 102, 11, '2026-07-09 10:00:38'),
(2108, 80, 1, '2026-07-13 10:04:27'),
(2109, 80, 2, '2026-07-13 10:04:27'),
(2110, 80, 9, '2026-07-13 10:04:27'),
(2111, 80, 10, '2026-07-13 10:04:27'),
(2112, 80, 11, '2026-07-13 10:04:27'),
(2113, 80, 16, '2026-07-13 10:04:27'),
(2114, 70, 1, '2026-07-15 11:40:35'),
(2115, 70, 2, '2026-07-15 11:40:35'),
(2116, 70, 9, '2026-07-15 11:40:35'),
(2117, 70, 11, '2026-07-15 11:40:35'),
(2118, 70, 16, '2026-07-15 11:40:35'),
(2138, 104, 1, '2026-07-19 15:06:37'),
(2139, 104, 14, '2026-07-19 15:06:37'),
(2140, 104, 10, '2026-07-19 15:06:37'),
(2141, 104, 4, '2026-07-19 15:06:37'),
(2142, 104, 3, '2026-07-19 15:06:37'),
(2163, 105, 2, '2026-07-20 14:57:39'),
(2164, 105, 1, '2026-07-20 14:57:39'),
(2165, 105, 10, '2026-07-20 14:57:39'),
(2166, 105, 8, '2026-07-20 14:57:39'),
(2167, 105, 3, '2026-07-20 14:57:39'),
(2175, 106, 1, '2026-07-20 15:00:53'),
(2176, 106, 10, '2026-07-20 15:00:53'),
(2177, 106, 8, '2026-07-20 15:00:53'),
(2178, 106, 3, '2026-07-20 15:00:53'),
(2190, 107, 1, '2026-07-20 15:08:05'),
(2191, 107, 2, '2026-07-20 15:08:05'),
(2192, 107, 10, '2026-07-20 15:08:05'),
(2208, 108, 8, '2026-07-20 15:25:08'),
(2209, 108, 3, '2026-07-20 15:25:08'),
(2210, 108, 10, '2026-07-20 15:25:08'),
(2211, 108, 2, '2026-07-20 15:25:08'),
(2212, 108, 1, '2026-07-20 15:25:08'),
(2224, 110, 3, '2026-07-20 15:28:00'),
(2225, 110, 8, '2026-07-20 15:28:00'),
(2226, 110, 1, '2026-07-20 15:28:00'),
(2227, 110, 2, '2026-07-20 15:28:00'),
(2228, 77, 1, '2026-07-30 09:34:44'),
(2229, 77, 2, '2026-07-30 09:34:44'),
(2230, 77, 3, '2026-07-30 09:34:44'),
(2231, 77, 4, '2026-07-30 09:34:44'),
(2232, 77, 8, '2026-07-30 09:34:44'),
(2233, 77, 9, '2026-07-30 09:34:44'),
(2234, 77, 10, '2026-07-30 09:34:44'),
(2235, 77, 11, '2026-07-30 09:34:44'),
(2236, 77, 14, '2026-07-30 09:34:44'),
(2296, 111, 1, '2026-07-31 11:44:01'),
(2297, 111, 2, '2026-07-31 11:44:01'),
(2298, 111, 3, '2026-07-31 11:44:01'),
(2299, 111, 4, '2026-07-31 11:44:01'),
(2300, 111, 8, '2026-07-31 11:44:01'),
(2301, 111, 9, '2026-07-31 11:44:01'),
(2302, 111, 10, '2026-07-31 11:44:01');

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
(20, 77, '2026-05-30', 1, 12.00, 1, '2026-05-23 08:08:34', '2026-05-23 08:08:34'),
(21, 80, '2026-06-01', 0, 2500.00, 1, '2026-05-31 10:02:57', '2026-05-31 10:02:57'),
(22, 80, '2026-06-02', 0, 2500.00, 1, '2026-05-31 10:02:57', '2026-05-31 10:02:57'),
(23, 80, '2026-06-03', 0, 2500.00, 1, '2026-06-03 14:43:56', '2026-06-03 14:43:56'),
(24, 80, '2026-06-04', 1, 5200.00, 1, '2026-06-03 14:43:56', '2026-06-04 12:20:56'),
(25, 70, '2026-06-03', 0, 2500.00, 1, '2026-06-03 14:44:18', '2026-06-03 14:44:18'),
(26, 70, '2026-06-04', 0, 2500.00, 1, '2026-06-03 14:44:18', '2026-06-03 14:44:18'),
(27, 69, '2026-06-03', 0, 2500.00, 1, '2026-06-03 14:44:30', '2026-06-03 14:44:30'),
(28, 69, '2026-06-04', 0, 2500.00, 1, '2026-06-03 14:44:30', '2026-06-03 14:44:30'),
(29, 68, '2026-06-03', 0, 2500.00, 1, '2026-06-03 14:44:48', '2026-06-03 14:44:48'),
(30, 68, '2026-06-04', 1, 5000.00, 1, '2026-06-03 14:44:48', '2026-06-04 12:22:47'),
(31, 80, '2026-06-05', 1, 5200.00, 1, '2026-06-04 12:20:59', '2026-06-04 12:21:07'),
(32, 70, '2026-06-07', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(33, 70, '2026-06-08', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(34, 70, '2026-06-09', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(35, 70, '2026-06-10', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(36, 70, '2026-06-12', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(37, 70, '2026-06-13', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(38, 70, '2026-06-11', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(39, 70, '2026-06-14', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(40, 70, '2026-06-15', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(41, 70, '2026-06-16', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(42, 70, '2026-06-17', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(43, 70, '2026-06-18', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(44, 70, '2026-06-19', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(45, 70, '2026-06-20', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(46, 70, '2026-06-27', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(47, 70, '2026-06-26', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(48, 70, '2026-06-25', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(49, 70, '2026-06-24', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(50, 70, '2026-06-23', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(51, 70, '2026-06-22', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(52, 70, '2026-06-29', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(53, 70, '2026-06-21', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(54, 70, '2026-06-28', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(55, 70, '2026-06-30', 0, NULL, 1, '2026-06-07 15:17:25', '2026-06-07 15:17:25'),
(56, 69, '2026-06-10', 0, 2500.00, 1, '2026-06-08 15:57:00', '2026-06-08 15:57:00'),
(57, 69, '2026-06-11', 0, 2500.00, 1, '2026-06-08 15:57:00', '2026-06-08 15:57:00'),
(58, 69, '2026-06-12', 0, 2500.00, 1, '2026-06-08 15:57:00', '2026-06-08 15:57:00'),
(59, 69, '2026-06-13', 0, 2500.00, 1, '2026-06-08 15:57:00', '2026-06-08 15:57:00'),
(60, 69, '2026-06-08', 0, 2500.00, 1, '2026-06-08 15:57:15', '2026-06-08 15:57:15'),
(61, 80, '2026-06-09', 0, 2500.00, 1, '2026-06-08 16:14:38', '2026-06-08 16:14:38'),
(62, 80, '2026-06-10', 0, 2500.00, 1, '2026-06-10 10:27:38', '2026-06-10 10:27:38'),
(63, 80, '2026-06-11', 0, 2500.00, 1, '2026-06-10 10:27:38', '2026-06-10 10:27:38'),
(64, 69, '2026-06-18', 0, 2500.00, 1, '2026-06-17 12:09:17', '2026-06-17 12:09:17'),
(65, 69, '2026-06-19', 0, 2500.00, 1, '2026-06-17 12:09:17', '2026-06-17 12:09:17'),
(66, 69, '2026-06-20', 0, 2500.00, 1, '2026-06-17 12:09:17', '2026-06-17 12:09:17'),
(67, 69, '2026-06-21', 0, 2500.00, 1, '2026-06-17 12:09:17', '2026-06-17 12:09:17'),
(68, 69, '2026-06-22', 0, NULL, 1, '2026-06-21 06:12:43', '2026-06-21 06:12:43'),
(69, 69, '2026-06-23', 0, NULL, 1, '2026-06-21 06:12:43', '2026-06-21 06:12:43'),
(70, 69, '2026-06-24', 1, 2800.00, 1, '2026-06-21 06:13:23', '2026-06-21 06:13:45'),
(71, 80, '2026-06-21', 0, 2500.00, 1, '2026-06-21 06:28:02', '2026-06-21 06:28:02'),
(72, 69, '2026-06-27', 1, 2500.00, 1, '2026-06-27 09:05:54', '2026-06-27 09:05:54'),
(73, 80, '2026-06-29', 1, 2500.00, 1, '2026-06-29 14:00:54', '2026-06-29 14:00:54'),
(74, 96, '2026-07-03', 0, NULL, 1, '2026-07-03 10:22:34', '2026-07-03 10:22:34'),
(75, 96, '2026-07-04', 0, NULL, 1, '2026-07-03 10:22:34', '2026-07-03 10:22:34'),
(76, 96, '2026-07-05', 0, NULL, 1, '2026-07-03 10:22:34', '2026-07-03 10:22:34'),
(77, 96, '2026-07-09', 0, NULL, 1, '2026-07-03 10:22:34', '2026-07-03 10:22:34'),
(78, 96, '2026-07-06', 0, NULL, 1, '2026-07-03 10:22:34', '2026-07-03 10:22:34'),
(79, 96, '2026-07-08', 0, NULL, 1, '2026-07-03 10:22:34', '2026-07-03 10:22:34'),
(80, 96, '2026-07-07', 0, NULL, 1, '2026-07-03 10:22:34', '2026-07-03 10:22:34'),
(81, 96, '2026-08-04', 1, 5000.00, 2, '2026-07-03 10:23:39', '2026-07-03 10:23:39'),
(82, 96, '2026-08-05', 1, 5000.00, 2, '2026-07-03 10:23:39', '2026-07-03 10:23:39'),
(83, 96, '2026-08-06', 1, 5000.00, 2, '2026-07-03 10:23:39', '2026-07-03 10:23:39'),
(84, 96, '2026-08-07', 1, 5000.00, 2, '2026-07-03 10:23:39', '2026-07-03 10:23:39'),
(85, 96, '2026-08-08', 1, 5000.00, 2, '2026-07-03 10:23:39', '2026-07-03 10:23:39'),
(86, 99, '2026-07-11', 1, 4000.00, 1, '2026-07-04 10:05:57', '2026-07-05 10:57:42'),
(87, 99, '2026-07-10', 1, 4000.00, 1, '2026-07-04 10:06:08', '2026-07-05 10:57:42'),
(88, 99, '2026-07-09', 1, 4000.00, 1, '2026-07-04 10:06:13', '2026-07-05 10:57:42'),
(89, 99, '2026-07-07', 1, 4000.00, 1, '2026-07-04 10:06:17', '2026-07-05 10:57:42'),
(90, 99, '2026-07-08', 1, 4000.00, 1, '2026-07-04 10:06:22', '2026-07-05 10:57:42'),
(91, 99, '2026-07-06', 1, 4000.00, 1, '2026-07-04 10:06:26', '2026-07-05 10:57:48'),
(92, 99, '2026-07-05', 0, 4000.00, 1, '2026-07-04 10:06:29', '2026-07-05 10:57:29'),
(93, 99, '2026-07-12', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(94, 99, '2026-07-13', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(95, 99, '2026-07-14', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(96, 99, '2026-07-15', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(97, 99, '2026-07-16', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(98, 99, '2026-07-17', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(99, 99, '2026-07-18', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(100, 99, '2026-07-19', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(101, 99, '2026-07-20', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(102, 99, '2026-07-21', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(103, 99, '2026-07-22', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(104, 99, '2026-07-23', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(105, 99, '2026-07-24', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(106, 99, '2026-07-25', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(107, 99, '2026-07-26', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(108, 99, '2026-07-27', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(109, 99, '2026-07-28', 1, 4000.00, 1, '2026-07-04 10:06:38', '2026-07-05 10:57:42'),
(110, 100, '2026-07-08', 0, 7999.00, 1, '2026-07-07 08:21:52', '2026-07-07 08:25:42'),
(111, 100, '2026-07-09', 0, 7999.00, 1, '2026-07-07 08:23:15', '2026-07-07 08:25:42'),
(112, 100, '2026-07-10', 0, 7999.00, 1, '2026-07-07 08:25:42', '2026-07-07 08:25:42'),
(113, 100, '2026-07-11', 0, 7999.00, 1, '2026-07-07 08:25:42', '2026-07-07 08:25:42'),
(114, 100, '2026-07-12', 0, 7999.00, 1, '2026-07-07 08:25:42', '2026-07-07 08:25:42'),
(115, 100, '2026-07-16', 0, 7999.00, 1, '2026-07-07 08:25:42', '2026-07-07 08:25:42'),
(116, 100, '2026-07-17', 0, 7999.00, 1, '2026-07-07 08:25:42', '2026-07-07 08:25:42'),
(117, 100, '2026-07-18', 0, 7999.00, 1, '2026-07-07 08:25:42', '2026-07-07 08:25:42'),
(118, 100, '2026-07-07', 0, 7999.00, 1, '2026-07-07 08:26:00', '2026-07-07 08:26:00');

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
(837, 78, '/uploads/properties/prop-1776761627682-546004899.webp', 'main', 'Property image 1', 0, 1, '2026-04-21 09:06:11'),
(838, 78, '/uploads/properties/prop-1776761627684-157140098.webp', 'gallery', 'Property image 2', 1, 1, '2026-04-21 09:06:11'),
(839, 78, '/uploads/properties/prop-1776761627684-330473896.webp', 'gallery', 'Property image 3', 2, 1, '2026-04-21 09:06:11'),
(840, 78, '/uploads/properties/prop-1776761627685-315807482.webp', 'gallery', 'Property image 4', 3, 1, '2026-04-21 09:06:11'),
(841, 78, '/uploads/properties/prop-1776761627686-343372384.webp', 'gallery', 'Property image 5', 4, 1, '2026-04-21 09:06:11'),
(842, 78, '/uploads/properties/prop-1776761627687-762773367.webp', 'gallery', 'Property image 6', 5, 1, '2026-04-21 09:06:11'),
(852, 81, '/uploads/properties/prop-1779463165921-364360388.webp', 'main', 'Property image 1', 0, 1, '2026-05-22 15:19:26'),
(853, 81, '/uploads/properties/prop-1779463165923-724249010.webp', 'gallery', 'Property image 2', 1, 1, '2026-05-22 15:19:26'),
(893, 68, '/uploads/properties/prop-1779611841082-86245882.webp', 'main', 'Property image 1', 0, 1, '2026-06-04 12:27:02'),
(894, 68, '/uploads/properties/prop-1779611841084-898688294.webp', 'gallery', 'Property image 2', 1, 1, '2026-06-04 12:27:02'),
(895, 68, '/uploads/properties/prop-1779611841086-152744274.webp', 'gallery', 'Property image 3', 2, 1, '2026-06-04 12:27:02'),
(896, 68, '/uploads/properties/prop-1779611841087-819449671.webp', 'gallery', 'Property image 4', 3, 1, '2026-06-04 12:27:02'),
(897, 68, '/uploads/properties/prop-1779611841089-851306103.webp', 'gallery', 'Property image 5', 4, 1, '2026-06-04 12:27:02'),
(898, 68, '/uploads/properties/prop-1779611841090-736495341.webp', 'gallery', 'Property image 6', 5, 1, '2026-06-04 12:27:02'),
(899, 68, '/uploads/properties/prop-1779611841091-399543048.webp', 'gallery', 'Property image 7', 6, 1, '2026-06-04 12:27:02'),
(900, 68, '/uploads/properties/prop-1779611841092-133614656.webp', 'gallery', 'Property image 8', 7, 1, '2026-06-04 12:27:02'),
(906, 89, '/uploads/properties/prop-1779789316300-853245779.webp', 'main', 'Property image 1', 0, 1, '2026-06-08 06:58:52'),
(907, 89, '/uploads/properties/prop-1779789316303-490509287.webp', 'gallery', 'Property image 2', 1, 1, '2026-06-08 06:58:52'),
(908, 89, '/uploads/properties/prop-1779789316305-426187252.webp', 'gallery', 'Property image 3', 2, 1, '2026-06-08 06:58:52'),
(909, 89, '/uploads/properties/prop-1779789316306-343810711.webp', 'gallery', 'Property image 4', 3, 1, '2026-06-08 06:58:52'),
(910, 89, '/uploads/properties/prop-1779789316307-341103719.webp', 'gallery', 'Property image 5', 4, 1, '2026-06-08 06:58:52'),
(911, 89, '/uploads/properties/prop-1779789316309-919723736.webp', 'gallery', 'Property image 6', 5, 1, '2026-06-08 06:58:52'),
(912, 89, '/uploads/properties/prop-1779789316310-452902056.webp', 'gallery', 'Property image 7', 6, 1, '2026-06-08 06:58:52'),
(913, 89, '/uploads/properties/prop-1779789316311-661918783.webp', 'gallery', 'Property image 8', 7, 1, '2026-06-08 06:58:52'),
(914, 89, '/uploads/properties/prop-1779789316312-204465620.webp', 'gallery', 'Property image 9', 8, 1, '2026-06-08 06:58:52'),
(926, 91, '/uploads/properties/prop-1782807292533-613186969.webp', 'main', 'Property image 1', 0, 1, '2026-06-30 08:14:52'),
(927, 91, '/uploads/properties/prop-1782807292535-543981446.webp', 'gallery', 'Property image 2', 1, 1, '2026-06-30 08:14:52'),
(928, 91, '/uploads/properties/prop-1782807292535-557144475.webp', 'gallery', 'Property image 3', 2, 1, '2026-06-30 08:14:52'),
(929, 91, '/uploads/properties/prop-1782807292535-719689815.webp', 'gallery', 'Property image 4', 3, 1, '2026-06-30 08:14:52'),
(930, 91, '/uploads/properties/prop-1782807292536-852100244.webp', 'gallery', 'Property image 5', 4, 1, '2026-06-30 08:14:52'),
(931, 91, '/uploads/properties/prop-1782807292536-236887022.webp', 'gallery', 'Property image 6', 5, 1, '2026-06-30 08:14:52'),
(932, 91, '/uploads/properties/prop-1782807292537-35060874.webp', 'gallery', 'Property image 7', 6, 1, '2026-06-30 08:14:52'),
(933, 91, '/uploads/properties/prop-1782807292537-627537439.webp', 'gallery', 'Property image 8', 7, 1, '2026-06-30 08:14:52'),
(934, 91, '/uploads/properties/prop-1782807292538-959808989.webp', 'gallery', 'Property image 9', 8, 1, '2026-06-30 08:14:52'),
(935, 91, '/uploads/properties/prop-1782807292539-579491109.webp', 'gallery', 'Property image 10', 9, 1, '2026-06-30 08:14:52'),
(936, 92, '/uploads/properties/prop-1782909911304-294580765.webp', 'main', 'Property image 1', 0, 1, '2026-07-01 12:45:11'),
(937, 92, '/uploads/properties/prop-1782909911306-29437266.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-01 12:45:11'),
(940, 93, '/uploads/properties/prop-1782974813263-773558541.webp', 'main', 'Property image 1', 0, 1, '2026-07-02 06:46:53'),
(941, 93, '/uploads/properties/prop-1782974813264-13349029.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-02 06:46:53'),
(942, 93, '/uploads/properties/prop-1782974813265-314826320.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-02 06:46:53'),
(943, 93, '/uploads/properties/prop-1782974813265-179117500.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-02 06:46:53'),
(944, 93, '/uploads/properties/prop-1782974813265-708753917.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-02 06:46:53'),
(945, 93, '/uploads/properties/prop-1782974813266-420916671.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-02 06:46:53'),
(946, 93, '/uploads/properties/prop-1782974813266-776728045.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-02 06:46:53'),
(947, 93, '/uploads/properties/prop-1782974813266-105156865.webp', 'gallery', 'Property image 8', 7, 1, '2026-07-02 06:46:53'),
(948, 93, '/uploads/properties/prop-1782974813266-997496860.webp', 'gallery', 'Property image 9', 8, 1, '2026-07-02 06:46:53'),
(949, 93, '/uploads/properties/prop-1782974813266-107326149.webp', 'gallery', 'Property image 10', 9, 1, '2026-07-02 06:46:53'),
(950, 95, '/uploads/properties/prop-1783072619850-951274528.webp', 'main', 'Property image 1', 0, 1, '2026-07-03 09:57:00'),
(951, 95, '/uploads/properties/prop-1783072619852-398662445.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-03 09:57:00'),
(952, 95, '/uploads/properties/prop-1783072619853-680854706.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-03 09:57:00'),
(953, 95, '/uploads/properties/prop-1783072619853-878675480.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-03 09:57:00'),
(954, 95, '/uploads/properties/prop-1783072619853-652889360.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-03 09:57:00'),
(955, 95, '/uploads/properties/prop-1783072619853-612836225.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-03 09:57:00'),
(956, 95, '/uploads/properties/prop-1783072619854-367455768.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-03 09:57:00'),
(957, 95, '/uploads/properties/prop-1783072619854-702718549.webp', 'gallery', 'Property image 8', 7, 1, '2026-07-03 09:57:00'),
(958, 95, '/uploads/properties/prop-1783072619854-458553981.webp', 'gallery', 'Property image 9', 8, 1, '2026-07-03 09:57:00'),
(959, 95, '/uploads/properties/prop-1783072619854-34899212.webp', 'gallery', 'Property image 10', 9, 1, '2026-07-03 09:57:00'),
(999, 96, '/uploads/properties/prop-1783074012232-203850056.webp', 'main', 'Property image 1', 0, 1, '2026-07-03 19:37:43'),
(1000, 96, '/uploads/properties/prop-1783074012233-917041864.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-03 19:37:43'),
(1001, 96, '/uploads/properties/prop-1783074012233-390570967.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-03 19:37:43'),
(1002, 96, '/uploads/properties/prop-1783074012233-614688644.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-03 19:37:43'),
(1003, 99, '/uploads/properties/prop-1783158723539-653842772.webp', 'main', 'Property image 1', 0, 1, '2026-07-04 09:52:03'),
(1004, 99, '/uploads/properties/prop-1783158723541-900521146.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-04 09:52:03'),
(1005, 99, '/uploads/properties/prop-1783158723542-762655319.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-04 09:52:03'),
(1006, 99, '/uploads/properties/prop-1783158723543-261694122.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-04 09:52:03'),
(1007, 99, '/uploads/properties/prop-1783158723544-709250236.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-04 09:52:03'),
(1008, 99, '/uploads/properties/prop-1783158723545-907896295.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-04 09:52:03'),
(1009, 99, '/uploads/properties/prop-1783158723547-258831039.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-04 09:52:03'),
(1010, 98, '/uploads/properties/prop-1783089428233-624270373.webp', 'main', 'Property image 1', 0, 1, '2026-07-04 11:08:08'),
(1011, 98, '/uploads/properties/prop-1783089428233-983472557.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-04 11:08:08'),
(1012, 98, '/uploads/properties/prop-1783089428234-450841199.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-04 11:08:08'),
(1013, 98, '/uploads/properties/prop-1783089428234-312617271.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-04 11:08:08'),
(1014, 98, '/uploads/properties/prop-1783089428234-284054926.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-04 11:08:08'),
(1015, 98, '/uploads/properties/prop-1783089428235-718618951.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-04 11:08:08'),
(1016, 98, '/uploads/properties/prop-1783089428235-687508143.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-04 11:08:08'),
(1017, 98, '/uploads/properties/prop-1783089428235-414682559.webp', 'gallery', 'Property image 8', 7, 1, '2026-07-04 11:08:08'),
(1018, 98, '/uploads/properties/prop-1783089428236-45300343.webp', 'gallery', 'Property image 9', 8, 1, '2026-07-04 11:08:08'),
(1019, 97, '/uploads/properties/prop-1783088546597-623470008.webp', 'main', 'Property image 1', 0, 1, '2026-07-04 11:08:29'),
(1020, 97, '/uploads/properties/prop-1783088546599-678180425.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-04 11:08:29'),
(1021, 97, '/uploads/properties/prop-1783088546599-96702596.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-04 11:08:29'),
(1022, 97, '/uploads/properties/prop-1783088546600-556314019.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-04 11:08:29'),
(1023, 97, '/uploads/properties/prop-1783088546600-521342525.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-04 11:08:29'),
(1024, 97, '/uploads/properties/prop-1783088546600-143003367.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-04 11:08:29'),
(1025, 97, '/uploads/properties/prop-1783088546601-560874007.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-04 11:08:29'),
(1026, 97, '/uploads/properties/prop-1783088546601-174739901.webp', 'gallery', 'Property image 8', 7, 1, '2026-07-04 11:08:29'),
(1037, 101, '/uploads/properties/prop-1783489206251-650323612.webp', 'main', 'Property image 1', 0, 1, '2026-07-08 05:40:06'),
(1038, 101, '/uploads/properties/prop-1783489206252-498096792.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-08 05:40:06'),
(1039, 69, '/uploads/properties/prop-1774946292286-329981000.webp', 'main', 'Property image 1', 0, 1, '2026-07-08 09:33:10'),
(1040, 69, '/uploads/properties/prop-1774946292296-513356222.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-08 09:33:10'),
(1041, 69, '/uploads/properties/prop-1774946292297-755190144.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-08 09:33:10'),
(1042, 100, '/uploads/properties/prop-1783412154404-131196941.webp', 'main', 'Property image 1', 0, 1, '2026-07-08 11:48:27'),
(1043, 100, '/uploads/properties/prop-1783412154406-288103048.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-08 11:48:27'),
(1044, 100, '/uploads/properties/prop-1783412154407-712803348.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-08 11:48:27'),
(1045, 100, '/uploads/properties/prop-1783412154408-206428026.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-08 11:48:27'),
(1046, 100, '/uploads/properties/prop-1783412154409-36045139.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-08 11:48:27'),
(1047, 100, '/uploads/properties/prop-1783412154409-85710306.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-08 11:48:27'),
(1048, 100, '/uploads/properties/prop-1783412154410-577258892.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-08 11:48:27'),
(1049, 100, '/uploads/properties/prop-1783412154411-364380104.webp', 'gallery', 'Property image 8', 7, 1, '2026-07-08 11:48:27'),
(1080, 102, '/uploads/properties/prop-1783590946278-457187057.webp', 'main', 'Property image 1', 0, 1, '2026-07-09 10:00:38'),
(1081, 102, '/uploads/properties/prop-1783590946280-927767294.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-09 10:00:38'),
(1082, 102, '/uploads/properties/prop-1783590946280-946048309.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-09 10:00:38'),
(1083, 102, '/uploads/properties/prop-1783590946280-579986995.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-09 10:00:38'),
(1084, 102, '/uploads/properties/prop-1783590946281-432099227.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-09 10:00:38'),
(1085, 102, '/uploads/properties/prop-1783590946281-525676070.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-09 10:00:38'),
(1086, 102, '/uploads/properties/prop-1783590946281-195387465.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-09 10:00:38'),
(1087, 102, '/uploads/properties/prop-1783590946282-200832311.webp', 'gallery', 'Property image 8', 7, 1, '2026-07-09 10:00:38'),
(1088, 102, '/uploads/properties/prop-1783590946282-490673004.webp', 'gallery', 'Property image 9', 8, 1, '2026-07-09 10:00:38'),
(1089, 102, '/uploads/properties/prop-1783590946282-921772318.webp', 'gallery', 'Property image 10', 9, 1, '2026-07-09 10:00:38'),
(1090, 80, '/uploads/properties/prop-1779006643838-420176868.webp', 'main', 'Property image 1', 0, 1, '2026-07-13 10:04:27'),
(1091, 80, '/uploads/properties/prop-1779006643840-102084149.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-13 10:04:27'),
(1092, 70, '/uploads/properties/prop-1774946904596-554519145.webp', 'main', 'Property image 1', 0, 1, '2026-07-15 11:40:35'),
(1093, 70, '/uploads/properties/prop-1774946904598-906486603.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-15 11:40:35'),
(1094, 104, '/uploads/properties/prop-1784473597727-352230295.webp', 'main', 'Property image 1', 0, 1, '2026-07-19 15:06:38'),
(1095, 104, '/uploads/properties/prop-1784473597728-345505903.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-19 15:06:38'),
(1096, 104, '/uploads/properties/prop-1784473597729-608546329.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-19 15:06:38'),
(1097, 104, '/uploads/properties/prop-1784473597729-717694694.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-19 15:06:38'),
(1098, 104, '/uploads/properties/prop-1784473597730-500262102.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-19 15:06:38'),
(1099, 104, '/uploads/properties/prop-1784473597730-658120945.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-19 15:06:38'),
(1100, 104, '/uploads/properties/prop-1784473597731-140850550.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-19 15:06:38'),
(1101, 104, '/uploads/properties/prop-1784473597731-527158623.webp', 'gallery', 'Property image 8', 7, 1, '2026-07-19 15:06:38'),
(1102, 104, '/uploads/properties/prop-1784473597732-3994541.webp', 'gallery', 'Property image 9', 8, 1, '2026-07-19 15:06:38'),
(1103, 104, '/uploads/properties/prop-1784473597732-999340352.webp', 'gallery', 'Property image 10', 9, 1, '2026-07-19 15:06:38'),
(1104, 105, '/uploads/properties/prop-1784559459110-824510978.webp', 'main', 'Property image 1', 0, 1, '2026-07-20 14:57:39'),
(1105, 105, '/uploads/properties/prop-1784559459113-382862987.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-20 14:57:39'),
(1106, 105, '/uploads/properties/prop-1784559459113-873076848.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-20 14:57:39'),
(1107, 105, '/uploads/properties/prop-1784559459114-642200363.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-20 14:57:39'),
(1108, 105, '/uploads/properties/prop-1784559459114-858318404.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-20 14:57:39'),
(1109, 105, '/uploads/properties/prop-1784559459115-893552733.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-20 14:57:39'),
(1110, 105, '/uploads/properties/prop-1784559459115-391313715.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-20 14:57:39'),
(1111, 106, '/uploads/properties/prop-1784559653667-215596733.webp', 'main', 'Property image 1', 0, 1, '2026-07-20 15:00:53'),
(1112, 106, '/uploads/properties/prop-1784559653668-82738285.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-20 15:00:53'),
(1113, 106, '/uploads/properties/prop-1784559653668-226843964.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-20 15:00:53'),
(1114, 106, '/uploads/properties/prop-1784559653668-742625066.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-20 15:00:53'),
(1115, 106, '/uploads/properties/prop-1784559653669-244273511.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-20 15:00:53'),
(1116, 107, '/uploads/properties/prop-1784560085625-557087345.webp', 'main', 'Property image 1', 0, 1, '2026-07-20 15:08:05'),
(1117, 107, '/uploads/properties/prop-1784560085626-747218830.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-20 15:08:05'),
(1118, 107, '/uploads/properties/prop-1784560085626-771956796.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-20 15:08:05'),
(1119, 107, '/uploads/properties/prop-1784560085626-813954314.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-20 15:08:05'),
(1120, 107, '/uploads/properties/prop-1784560085627-760474186.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-20 15:08:05'),
(1121, 108, '/uploads/properties/prop-1784561108981-606428845.webp', 'main', 'Property image 1', 0, 1, '2026-07-20 15:25:09'),
(1122, 108, '/uploads/properties/prop-1784561108981-165127183.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-20 15:25:09'),
(1123, 108, '/uploads/properties/prop-1784561108982-243706770.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-20 15:25:09'),
(1124, 108, '/uploads/properties/prop-1784561108982-130445028.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-20 15:25:09'),
(1125, 108, '/uploads/properties/prop-1784561108982-696472368.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-20 15:25:09'),
(1126, 108, '/uploads/properties/prop-1784561108982-659213094.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-20 15:25:09'),
(1127, 108, '/uploads/properties/prop-1784561108983-613942090.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-20 15:25:09'),
(1128, 110, '/uploads/properties/prop-1784561280811-641711541.webp', 'main', 'Property image 1', 0, 1, '2026-07-20 15:28:01'),
(1129, 110, '/uploads/properties/prop-1784561280812-718136615.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-20 15:28:01'),
(1130, 110, '/uploads/properties/prop-1784561280812-783043249.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-20 15:28:01'),
(1131, 110, '/uploads/properties/prop-1784561280813-321957252.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-20 15:28:01'),
(1132, 110, '/uploads/properties/prop-1784561280813-12562704.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-20 15:28:01'),
(1133, 77, '/uploads/properties/prop-1776748949018-849122918.webp', 'main', 'Property image 1', 0, 1, '2026-07-30 09:34:44'),
(1134, 77, '/uploads/properties/prop-1776748949077-673326158.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-30 09:34:44'),
(1135, 77, '/uploads/properties/prop-1776748949078-997939413.webp', 'gallery', 'Property image 3', 2, 1, '2026-07-30 09:34:44'),
(1136, 77, '/uploads/properties/prop-1776748949078-946238831.webp', 'gallery', 'Property image 4', 3, 1, '2026-07-30 09:34:44'),
(1137, 77, '/uploads/properties/prop-1776748949079-362828889.webp', 'gallery', 'Property image 5', 4, 1, '2026-07-30 09:34:44'),
(1138, 77, '/uploads/properties/prop-1776748949080-570666938.webp', 'gallery', 'Property image 6', 5, 1, '2026-07-30 09:34:44'),
(1139, 77, '/uploads/properties/prop-1776748949080-460153548.webp', 'gallery', 'Property image 7', 6, 1, '2026-07-30 09:34:44'),
(1148, 111, '/uploads/properties/prop-1785496328334-39081064.webp', 'main', 'Property image 1', 0, 1, '2026-07-31 11:44:01'),
(1149, 111, '/uploads/properties/prop-1785496328336-924860509.webp', 'gallery', 'Property image 2', 1, 1, '2026-07-31 11:44:01');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `mfs_provider` varchar(20) DEFAULT NULL,
  `mfs_wallet_number` varchar(20) DEFAULT NULL,
  `mfs_account_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_owners`
--

INSERT INTO `property_owners` (`id`, `user_id`, `business_name`, `business_license`, `tax_id`, `bank_account_number`, `bank_name`, `bank_routing_number`, `commission_rate`, `is_verified`, `verification_documents`, `created_at`, `updated_at`, `mfs_provider`, `mfs_wallet_number`, `mfs_account_name`) VALUES
(17, 21, 'Flat Owner - Keyhost', '123456', '321654', '987563214587', 'Brac Bank', '321465719', 10.00, 0, NULL, '2025-10-19 09:37:39', '2026-03-29 10:14:59', NULL, NULL, NULL),
(18, 1, 'admin Business', NULL, NULL, NULL, NULL, NULL, 10.00, 1, NULL, '2025-10-28 09:48:28', '2025-10-28 09:48:28', NULL, NULL, NULL),
(26, 49, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-03-30 15:06:57', '2026-03-30 15:06:57', NULL, NULL, NULL),
(27, 52, 'KeyHost ', '', '', '', '', '', 10.00, 1, NULL, '2026-03-31 04:45:06', '2026-07-25 13:25:18', NULL, NULL, NULL),
(28, 53, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-04-02 11:30:49', '2026-04-02 11:30:49', NULL, NULL, NULL),
(29, 59, 'Hotel Jannat', '123456', '3254345', '234324', 'sadsa', '234323', 10.00, 0, NULL, '2026-04-19 09:45:52', '2026-05-23 05:30:29', NULL, NULL, NULL),
(30, 64, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-05-02 05:12:31', '2026-05-02 05:12:31', NULL, NULL, NULL),
(31, 74, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-05-22 15:01:56', '2026-05-22 15:01:56', NULL, NULL, NULL),
(32, 75, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-05-24 10:17:00', '2026-05-24 10:17:00', NULL, NULL, NULL),
(33, 79, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-05-24 10:23:10', '2026-05-24 10:23:10', NULL, NULL, NULL),
(34, 81, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-05-26 05:13:42', '2026-05-26 05:13:42', NULL, NULL, NULL),
(35, 50, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-06-29 07:37:00', '2026-06-29 07:37:00', NULL, NULL, NULL),
(36, 110, '', '', '', '', '', '', 10.00, 0, NULL, '2026-06-30 03:45:27', '2026-07-06 04:17:18', NULL, NULL, NULL),
(37, 120, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-06-30 06:00:58', '2026-06-30 06:00:58', NULL, NULL, NULL),
(38, 121, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-06-30 08:37:56', '2026-06-30 08:37:56', NULL, NULL, NULL),
(39, 122, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-06-30 15:17:17', '2026-06-30 15:17:17', NULL, NULL, NULL),
(40, 125, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-01 11:09:41', '2026-07-01 11:09:41', NULL, NULL, NULL),
(41, 127, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-02 06:25:38', '2026-07-02 06:25:38', NULL, NULL, NULL),
(42, 128, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-02 06:34:35', '2026-07-02 06:34:35', NULL, NULL, NULL),
(43, 129, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-02 10:00:45', '2026-07-02 10:00:45', NULL, NULL, NULL),
(44, 130, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-02 14:38:13', '2026-07-02 14:38:13', NULL, NULL, NULL),
(45, 131, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-03 09:47:06', '2026-07-03 09:47:06', NULL, NULL, NULL),
(46, 132, '', '', '', '', '', '', 10.00, 0, NULL, '2026-07-03 10:07:19', '2026-07-03 10:30:58', NULL, NULL, NULL),
(47, 133, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-03 12:42:05', '2026-07-03 12:42:05', NULL, NULL, NULL),
(48, 135, '', '', '', '1121011516319', 'Mercantile Bank plc', '140261183', 10.00, 0, NULL, '2026-07-03 14:10:09', '2026-07-03 15:17:44', NULL, NULL, NULL),
(49, 138, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0, NULL, '2026-07-04 08:01:58', '2026-07-04 08:01:58', NULL, NULL, NULL),
(50, 139, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-04 09:32:25', '2026-07-04 09:32:25', NULL, NULL, NULL),
(51, 141, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-04 14:06:27', '2026-07-04 14:06:27', NULL, NULL, NULL),
(52, 143, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-05 12:25:24', '2026-07-05 12:25:24', NULL, NULL, NULL),
(53, 145, '', '', '', '', '', '', 10.00, 0, NULL, '2026-07-06 04:07:15', '2026-07-06 04:09:16', NULL, NULL, NULL),
(54, 148, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-06 16:55:27', '2026-07-06 16:55:27', NULL, NULL, NULL),
(55, 149, 'Halal Trade', 'APPT/CHTG/009166/2025', '343273654051', '1101009119774', 'Jamuna Bank PLC', '130270605', 10.00, 0, NULL, '2026-07-07 07:56:43', '2026-07-11 10:21:28', NULL, NULL, NULL),
(56, 150, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-09 09:36:37', '2026-07-09 09:36:37', NULL, NULL, NULL),
(57, 152, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-12 11:24:03', '2026-07-12 11:24:03', NULL, NULL, NULL),
(58, 153, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-12 16:33:51', '2026-07-12 16:33:51', NULL, NULL, NULL),
(59, 155, '', '', '', '', '', '', 10.00, 0, NULL, '2026-07-15 12:13:47', '2026-07-19 18:24:21', NULL, NULL, NULL),
(60, 163, '', '', '', '', '', '', 10.00, 0, NULL, '2026-07-20 14:49:17', '2026-07-20 15:04:02', NULL, NULL, NULL),
(61, 176, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-31 10:14:56', '2026-07-31 10:14:56', NULL, NULL, NULL),
(62, 178, NULL, NULL, NULL, NULL, NULL, NULL, 10.00, 0, NULL, '2026-07-31 14:06:41', '2026-07-31 14:06:41', NULL, NULL, NULL);

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
(6, 'Flight', 'Booked All Airlines Flight Ticket', 99, 0, '2026-03-09 05:04:42', '2026-04-15 07:55:46', '/images/flight.png'),
(7, 'Monthly', 'Monthly rent', 4, 1, '2026-06-14 06:51:46', '2026-06-14 06:51:46', '/images/nav-icon-monthy.png');

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
(16, 183, 249, 'REF-1779526106627-183', 20.00, 20.00, 0.00, 0.00, 0.00, 20.00, 'Approved by Admin', 'full', 'Original Paid: ৳20. Policy Status: Eligible', 'processing', NULL, NULL, NULL, '{\"APIConnect\":\"FAILED_SAME_REQ_IN_SAME_MIN\",\"bank_tran_id\":\"REF1779523999520\"}', '2026-05-23 08:48:26', '2026-06-29 06:54:58', NULL, '2026-05-23 08:48:26', '2026-06-29 06:54:58'),
(17, 398, 430, 'REF-1785405653643-398', 5.00, 5.00, 0.00, 0.00, 0.00, 5.00, 'Approved by Admin', 'full', 'Original Paid: ৳5. Policy Status: Eligible', 'completed', NULL, NULL, NULL, '{\"success\":true,\"originalTransactionID\":\"DGU9VH2FSB\",\"amount\":\"5.00\",\"refundTrxID\":\"DGU6VH4CNY\",\"statusMessage\":\"Successful\"}', '2026-07-30 10:00:53', '2026-07-30 10:01:03', NULL, '2026-07-30 10:00:53', '2026-07-30 10:01:03'),
(18, 399, 433, 'REF-1785405703800-399', 5.00, 5.00, 0.00, 0.00, 0.00, 5.00, 'Approved by Admin', 'full', 'Original Paid: ৳5. Policy Status: Eligible', 'completed', NULL, NULL, NULL, '{\"success\":true,\"originalTransactionID\":\"DGU0VH4BZC\",\"amount\":\"5.00\",\"refundTrxID\":\"DGU0VH5S5O\",\"statusMessage\":\"Successful\"}', '2026-07-30 10:01:43', '2026-07-30 10:01:55', NULL, '2026-07-30 10:01:43', '2026-07-30 10:01:55');

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
(1, 'platform_name', 'Keyhost Homes', 'string', 'Website name displayed in header and title', 1, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(2, 'default_currency', 'BDT', 'string', 'Default currency', 1, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(3, 'commission_rate', '10', 'number', 'Default commission rate for property owners', 0, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(4, 'max_guests_per_property', '20', 'number', 'Maximum guests allowed per property', 0, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(5, 'booking_advance_days', '365', 'number', 'Maximum days in advance for booking', 1, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(6, 'cancellation_hours', '24', 'number', 'Hours before check-in for free cancellation', 1, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(7, 'support_email', 'info@keyhost24.com', 'string', 'Support email address', 1, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(8, 'support_phone', '+8801730353300', 'string', 'Support phone number', 1, '2025-10-12 14:54:15', '2026-07-30 09:57:57'),
(12, 'timezone', 'Asia/Dhaka', 'string', 'Default timezone for the platform', 1, '2025-10-20 07:48:11', '2026-07-30 09:57:57'),
(13, 'maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode', 1, '2025-10-20 07:48:11', '2026-07-30 09:57:57'),
(14, 'registration_enabled', 'true', 'boolean', 'Allow new user registration', 1, '2025-10-20 07:48:11', '2026-07-30 09:57:57'),
(15, 'email_verification_required', 'true', 'boolean', 'Require email verification for new accounts', 1, '2025-10-20 07:48:11', '2026-07-30 09:57:57'),
(16, 'phone_verification_required', 'false', 'boolean', 'Require phone verification for new accounts', 1, '2025-10-20 07:48:11', '2026-07-30 09:57:57'),
(35, 'site_logo', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAA8CAMAAAAUhQWjAAABgFBMVEUAAADrpy77xk73tTcYFA8yJxbxuUfVly0jGxFKNhpXRieQaSpzVyj+1FineCvLljaJaC9pVy20hjQ8MhpCNRu4hC3MhxdFOiNlSyWseSrPpUr82GTEiSjboTfCiy54WSeVdjaZczLZqEfinSZLOiJaQx2qhDl6ZDWjdy3kmhk8KhQ7NSJiTCfYkhn+53G4gixnSBq0dxqXaBuDZy+xdxuveSfjrUNVOhe5lkfZs1XsoRz/wTtZQiN0UxyUaCZNQyaBXSOoaxOIcjqbczHKnETFpVBBLRWTeUGqhkV5UhuGXBipikWvi0S3lUjszGUyKyFiSR5vTByFWBiYZhuee0OkbRu5kUXElDzDnUlaQR1tTSCTXROVWxGeahmMdkKYgkqicBuifUG/kjzAjjLInU7/8XhXPyBbUTJjPxBxSxhxYTaOXx6DXCOEWiGRZRyfZBWfbyuZdkChbxykbiKhi0zMiR7YpT/Xs1ndsU7TtWjgq0D/4F3/9YMAAAAAAAAAAACIDkSHAAAAgHRSTlMA/Pz9BRL59worL5BR/azSbTeuExnL/BlIzc778/XRZ3CO6/0nNZNRlP0kEjj9//FR9pRW0O7wR6jS/f9GUq0abPZWrdG0KHPOeneSrZf1FDtqkK/Kzcm6rEBlzfXIWHCp0q+y+P9BJG+DO7WFoHn9yqq8/3nc2brmvtr//wAAAIHFI2YAAAj+SURBVHja7Vr3Uxs9Ez6t2lWfu3HDDVwAYwgltEAIkPKm97y9f7339sd/upPuLBeS/EQuM9EMMzpLPunRPrv7aI1hfGqf2tW0O+Qtg7b90eBw17+9fNBkj8hHgmOBeeu9S3FwqFY+DiRbmEHVS88ftDgD8Co0+TDs1wDMFbs9X5sdpGmEoZkGD3pJh2KBwLFs5NsYY2tmdPEQ45ZhtAKjJBzICoNu6AFphJZmRgvsPPzQbsOrRMNY6lfA278lkPQqCPndCSjE/ZHB7sO8YeSziMFFL7EuT1rgBW39wuh6ILh1yO5r/lE/BPHhIeTyDAtX+e/P+/mEAjk7hO5Czu6Cdw7Md9fcLIZUjIMDd1esmxzaDBYbt61023uUTI//HIErCSZiVktmRoSjNF7GvhnmkUXwHoSkMisJ9fht2FO9NS+rei1cUAbpMOUwFKLtU/CsJAKpQZw5/Ij9S6xuymyP49NvuVFv77K0+UGbcIJYDcbcp4AkkAZ+E39mRr37npPEmFWDzGyeBy63bWEwZ0Yv4GYSqZWCfWPaJBVP+Qjh1TvT5ioBSqSPiEN/Q9VG3X4u6HUh1ikNzwsSJbGzERDaxuVk5pGGSHTddAoFroKwv7df9djYm0V6YRW/DoFbZPdvfdNluJZU5bjAeQdxJzCCg7G3Du0FbTTNRbJHOB+IFd/zAKWSq4CJM1Cn/ESoYGhMjS52EGNSYTVhd45/kHc8X10rIBWClwI579OStqkltyMkVpROzmH2vkIbr/5daa3K/v1/Vv5sfygkFuJqaasKCDhnY/Y08GadcfhXdK+H7JwXfD1AUZTODn794ai1jPzIIcChL3l1U7/kVmsbtB5BW4PCnBc4B/9RvWbxenzNL+VWc7l8PpcvhdYiwXMpPDGSy+XCF1LxEZWHSEurOc37iN1ze5lVfZWTnpv+zWp4Yqur4r253Mkv87mTjK1ZhMkDJbvMMn6HRp29eGiRc0SNFG4qoTIWxlr7DDNVUELXtbRax6MXd8uFu3UJfrXMImLmVcgwHVZXTmcWMI/9j3zz0/GRfeT8tBeznD44O1pacHbPg4c+v3v3hfjCzovv73I+Rs8hvIGQLBuJvW9c71Qvoiuwt71yjxgLiIW48wy5c4C0FJDmZKrcPpCTVxR4cxMpFZE/jQ5qEG/DPfgu6q7u8xWlvmFL7bEis9f1UWBA53YADRXD0/iTVtGC6kXGdn2MjpSJqpXARguwvqjyP2ZN204ztDPPkVMYJI6VKWF9SwX4KNAXlekLVszq3eiFN/C16PBZhMMg254sUblRjnaC+bZUhDwEolcOm7C+DgxxNyabt0+NDfBSahmSFaHL8y5JhqnQIk2+MhUMD7em4vFz9DDcVaw6lzGLBrcO+1HAwMdjfiLIhWTCvSmpJIAUZ3dj7zFec6jmNuv7DdAdwi3wun/TnBst+nhX4KhNDxYiXozXLgYS1axpcaYdAwFlkfyEmCvgrqyKsOmaLWXDecdKyARplvxdYJ9NzjAvC3t/EGFvC8/cUhZxaGGqLdcYCnL1NzQg9fikDhWQNK5rK7VkbqAI4e7JxOtPcPF9RMaZMNH71q1TyG8hxDIzQLoZ0Xw9qr5E39qa6FzGqJcJm/sDuhYxy9clEpKe8DkX5H6jQ4mc/e1tD/hXrPqeSFKDOt8QC00hWUQFRzSuL2cVWZvqQHjLka08BrKofeGGAmLkWnyA4eGYN+Z7ADHPoWOR8luq2hMte8AfG3ZxMHVHU9SyJpZzUN+YABJTC7/VIoEJHHFY41I65dNAZrhvVqBmBaEKZpHMDb8HwRle5wgmTOjjG7O+1cDZSSBx+I0skkZI22AXaTqDOsOxK9LhFBCbTSlaWgEVSVOwfmtq7B/pedQqhslqgFh+QovOyZ430buALHGsKdPKoKGfXwrFkdTuTALJIY4mDjLPYBTNcODnv03gqONDdw4QGVAbwuNL84BQHYgzV68aG6ilen85uIgnrOHN0KDRm9zx10tTQMTViaOMXnnA5WACoRJJfGsPNrSLUXbWw/oH27LztINhjKQ8iOJsWgeiB3Wro1kk2iKtoSgBEb8o6dJVO2yO1dwEtUqlkMtawHFB3smJvPyKqL7+cJyCMA50sDnlVdliUW3nHtKQbA+aQXIipR+vaQLzYMLZER97dcw5+iWWjKaLm7cj8WBL+vx2vPdhMTfemaCC2d8SbqqQuB5+TsJ7ochArtRAnhLD9BGwZitv0HZbd3nq7ny14zxWXIxtQtzR6V/LhVff79Q2x3fnpZ3T2rjaT49PN12itPHmKGY42RiVm710a3QvWog+4w/Svdboqeb4fzyNtIiNMG6H8YWxqkBCiZCFx/J+i7A4/nADC6i6R/NBHahaDUVfG0DPBcQUqsCMVmx0EMqrYEVmg1w4V3+KYqbWlc/20dGkdrt9dGRNvClWI7Y4dLmozapVWDZ4m3fuKRws22CMLUj7ozYjIgZ4EJJ9bRfj+qW5qFEcsMwV1+YQQr5p5AWWRhW4SXce1X8V4ijgwPPstrKJVYPabRMxeCBjgI/r6PKyqVUeou4JicLFVbQ+FkgWMKzaAJzQXXQaynRSRmhB3drCDqmdilxn1qHqkgqzX4uvPX9rEcDh9dHZHffqCkcpEa8YAwawaK4B3pZMfzmILz6OQkJEaswYvgdtYEzgSL2zxGReLbscLAKq2FqBuFVclq5TPjgmWvVOpdkU/K9n+BIGThmJa9mwjlggTU+GK+EfnTCNZbZKTRqWURQSh603SVbASCSOAIkgyuMuoGcKh6xluDj7BO9TLTMK3eo5Rl8ImmwyC6Z99Iy+hs5TVR/dlr8ZcvRDBpTSvNmRLvMFgixxUCGppd+NFR+ruhrZUWLC+rvft/1tJ6rSSSTXOfj0hplUIELRKmVmljfiQp9douIvUsg1OeEXHPPEFuOXGdqUWoAcx5rAwji7xsZeTc6kQFrhiFvJxOFyvqkKpl+MSWMNh6knaPidpjyk0qQjxBcS+dvIzvBLotg0USMoni0Ph/qPbEuSU+bXw51E/jsK+T2ZcxknlpUzrcmyQTTv+CP4/7NP7VP71LT2f0WftHA1k1cIAAAAAElFTkSuQmCC', 'string', '', 1, '2025-10-22 05:05:19', '2026-07-30 09:57:57'),
(51, 'site_name', 'KeyHost 24', 'string', '', 1, '2025-10-22 05:07:24', '2026-07-30 09:57:57'),
(52, 'contact_email', 'info@keyhost24.com', 'string', '', 1, '2025-10-22 05:07:24', '2026-07-30 09:57:57'),
(144, 'site_favicon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAaHElEQVR4nO16d1hUV/P/nHu3sMgCywJSpCpqQJIoiiUooKDRaCxxSTS+wZIXW2xRE9uby8auIcZYUSzYEnejIDaImgUriaBIRxCk97YLLGy58/1j3cT+YuL3V57Hzz/w7Dn3zJk5M3OmHIA3eIM3eIM3eIM3eB1ABIII5P93Gn8L/yc2hQxQf9HD/2eEQFAmoQEA7p2ccSzr7HIPRCCyR7+9LqRE+nABAFKOTF2Z+UvYVAAAhYLhvE4arwyGYSh8tDHF+iELsGoVVt6RxgAAIDLU6xACIpBMxpMHABDz9cCAlhvTsCl/Y+WBlRIbAAD8vyWEx1VeETFyRsO5sTosWqjDls34IGH+7j/nwesxjV+YMcOKfwqsx1QJYtM6rPxjxa0d8+eLn97Lq+JvfYgIhBDAHcxyh0GO2avd7PTzxPbmUFhJqZzcLIVcPoGSInV8abP1Sj/J1nsIBAgBfNW9ISIcDj9s4So6PsfOXPlN7942gvIqSsm3FJlY97DgVd1vzCmtEy70/WT3FUQAQsir0nh1AcgYCU8CcvbXrp8Fe3WtOd5VhCIORSCnSFNyOVE/asRwc8bT0/QT6GiFmmYdW1jBDR9kcXbDxcr3OWMWxXd0ioZMQttk1RAlr4fY2Tr/ppO4zZ1HE6hp5KtzKsWjBJx2rwF9eXvM7c1A10bBwxruubvqMRMkNrsIBCbpCbyysDuHx73w6Q0T5mgvDsP6uOC2xIjAPT4iiYVhhMC5/wTMy47sX6u5OAh/3z0i6s/vDar6UqE/TmPDig090nZ66SuOv6NTbPb7dfW4cW7GsUOLRgXc2xNQgDc/ZItjJ5XCX58BwzAUdBKd1gBkgCJSYM999/EQV3HVLCGvPairiNetA3k6JQgVrdB1be8PIm8oZIydt11JOLel9hO9ts6sXqVrZLnWN9o5Lsfe+Sjyl8foPnNKyDAUkUrZHcx8h8E26fMEAu14M1rpSREK2ylRpoZn+53Xx6eOyRiG93bP9K8FVP08a0vKhvDNte18i+T6NrPT4xfZRmZnSzWISDpjEp0SgIF5io1f7/tN3958qa0tAWV1B1SqOMin24hrdzGodBbagmLO53YO3Ln23sJBbEY+ZOVVA4/WQA8Xc+igTaG43vx4m0fsDJ+zRA/hgI/7BSPzp6UT/D3tik44izUOqjYKimtYBMISd3sOdBF3hUKl01xQN7zr2R1nV5dWQE0jAZHIArp5dwOwE0NNTlPyzWSTkInL9pQyDENJpVL2HwlAJpPQISFyfUz48FnvebVFmXIpyCziRufXWB9o0ZjUC7m17h72mn/3dmr7UMu1BLEFH3LyVXXldeZb8op1lyzMzbiOwqpxrrb1y5ydzQXX8yx3BCyMXyiTTKZD5HI9gEFlw6VSlK9b4uDe5bd7fZ1U4hs5/Nu1ao+NZSphnthcbW1rWhPa0655JsfMDESW5lD4oKE59yEvokJleaGLKa+jW1cc7OnWvtwp0M2jJKXlTvwt96Fh4VI1EIC/7ROM1wszT2GWtLlXqe7ycEzeOXbTs3LjQMLaATvwsj+WHPOvjpg6zPvptRK2SCYW7O3ekRX1jv7s7oV9AAynDgCgYIADQCBmTf+I9ri+mBvpmzpzZqzwyRUoiF05cJHy9EB8eNSvMXqFZPDTNLZ/OrFbxfmPCrBmCd45OWMhAIBC4f/SOOGlg/IQCQUg19vS633EXbTdKuqg7lbtiE3InKMSwZ9KhAA2ABKpAEhiie6PRXezBn2k7OB9v/TEtYwL23vwf2/4VOuVnU3cg+RU/9m/xPyxfWCSl317cF1hxgQAyEyERAoA2AAp6BlkKbvtPoF8Mxvs4FpHHDw4QXVh+/v83xsGar28solNlpwESv/YnrzNb5ZGR8eGbpLfMtIAAAhwTeQFzogpG+AfstP+HV2E2FT9IQD8GBCQ9FITeKkAsjxrCACApaDd3kYkwHYTy+Il0qVNixFIIEnSASSBFICVSSQ0yIk+f8Mnc6xEvFSZzI4eLZFrxhApAgAoPIEgIpVxwCyTQ2uCOlSNtgYKSWB0Vlt/BVNzU661Vk+TNqQeIMNQcvtsnXSRwYZlEgmtYGo42TXmS80txQ+RYShYGK4Z88jReckkWmQY6hp5mItlFZRW1ewIEqQJIXoEIC8yg5cKwCvbFgEAWNqstrmlkpiatjlFRV0VQrhfq0LB0AGJwCZCIhUAchYAIGTVz3HGbxWMPwdltphoU0MC7rcQQu6w949z+nK4AmjVYLNxHiEEEYGEh4O63ZpUce0tHa3aOL3JLOnvRYf8TVAmgcSsGhLgJUcSAjoAuGT8VAGJNDIMC+HhmP/jaA6RSjtSDk50J6wamxuUVSAH1nh7vYzPFwIRCQGATV/LLJLWulfqFIGYFzd9zXPnApC0hK1dknZIQh+kyCyeHk/aNf7j1sujtQ+jfTB62djBAIZTNQoLAODiev9wzPoEmzMWpO9nJFbPrBEZ0i9h+6cjXxRe72QYs9JTH6S3xfniufDBXz++9ovQiVsA6JAQ0J+TDpsX4Nm4i2cuhiKlaA8rsD6matTXm2iK/dvUGt6gL67uAiB4cd17Untxy0yuyDGSNrVMRZblCmjNKDszzSw+t4N/KUl5ZOTq26HIsH+ejNHZRn25RBQwMDe5h6+NR1s1naVs00WyXJvSqsJMUVchBNfVtwVnlFj5/WtdXN7NPZ85Wlu1Tmu36HOmuEqrssV8bytu3WpHodLvRqqqpIQ/v//M1YvqwKD/L7wFOhUHMAxQUinNXt/63jYHYfNiE54KqloQ1G2taMFjSVWL3X2d/aLB7//73w0bVuwQB1psKuvtyjPhi7uDwMkZQEgAMwogOUMtj8za/Nlh10DN03GAgQawp5e93/2tnm2xvXsK+gCXDx1temisqwI7Cxru5tOR/RbdmoOAJJYZ/e933FojhWIT0COoulBaIbQ2wZ1s5YOixp6Tpv8Yn25c8x9pgBGGBIjgoeUfjLDlFC53syoJqmjkaAubPZeUW8uPeHkt7pBI5EgIxabuePeCdy/TYL1JV52JkMPJvtdwu/gBf+WYteeSXi5oY+BCwcV146bbmeXtNDPV8c0trfVdhEJOSjb9of/S+IuJjD8tdIggybl7XPo5pO8a/A5n5P3CdlV6gdm3+ZyQQ6s2LajvDPMA/8UJPg5CABUMcgKl56/8+q33Ap7AnG5Tun8ZtuvGXgKOgACACn8OYhJmHbUu4jrYc7iNdaCvqKEFhGvTyrMipefmDbwVXZsikcvZp70yAhAilbK5x6dY16mJd3NRhoO5VbuJgEdRtvY2HKWWBx16XQUBQIQAlszuzwJAgUSC40QWQ9KcXEUeWsdBVyXjFtSnRPpw+89O1XaGr04nDQzDUIFS0MVuW91LKGj/sFkvVrWIR5+USZA++ciZJQIARQA5JqamwHZg5t0ibU2NkqhbW3r091QpGsvu/XILJDxgmGfqeomMP40MUHm5Ze+5WVT8JrbmrueZmND1rUJNWVG5jkvpkW/GIY+XwmSMJ08uJxolio50saA5+pqUGYhIVBVmnY78Oi2A8Ed/uZwWobl5F2JuadleWt7UJpFIDJuRSeiA2iREQEpIq9+rzi0hv2X3GX7+Rvs+BD3weBr2Qc7DdndhvIhIpWxiuP8T1SKhQwshUmCrSuvEhXllmj6DXCC7UKu8kB3o96CCt1/AbQOxNW8QIQTzrX7nIgLx9PICZIDi0no1tLWjprW1CyEEA7ySXn86bDyxQ9u2Wd7d6VvbcmU0e0c2Y/LT827tGvul5lIwJm8bmAdA4OyavjOvMw66A1OFzR0x3liTNCvrJ+ZjVwAAYy3R+DeB8QurOzNcW7TTBeVzrWsurXStAMKDC5sDRjSdGoRlcWPyE45stX2SIoGc6BFXVTH9Mf5bv9UAxtC6c3glH2BIjJY0Xd487PC7ZvSyt4SwPe9sKKeiqet1Vq/mW3TkTbc2q11ZVKiCwgqzzYhITqx0iCnT+yabePDMb96JPRkwpd4zaITZr+dpyUckRJ6BKT5c0l+uvbnNf+WA4U4bOFoVXEsS7L3DXRJu3XxBKDs5gK5u3XLjdva4O0FDOP1oTvLFO6dmr1BBr0yqI9tKrC1fZsV5ODQ1o721qDXkOMB1SASGBZB2lrXOAxEIwwC1dOnWLun7g69hxseIlQuxNXlaa9mpQF3tCS/M3eGKsqV9dgLQTxQ3AAC2LPis+2+rHO5j8nBsSF1cqTj0+bsAAGlRo77H/LnYfm0sXvp2wNbHz8VY3JBtntnrzg/9C5U/e2Dt6UFYc2GsslUxCfUJfnj92276Y0v9/wUAIJHAKxViX7kkZoyrBw2KEHz36aWVjt1FUzS1dW5NDdUdqibtvRp118ipW65HM4zOeA0RhmEIJCZS0qQk3fKZyx0mdpPHDp46eEBVpWlpSVlLmu+wruOaM/PhSnzRio923N8sk7B0lieDAFKQSoE1Xmlbli2zc4cExlbUPtrMwsqJx+OpSspbkh/Wd9syb+e532QSpEPkoH9Vnl4ZT4aiC/jMjBnum5cvdwDgGcZfUKU1hr6LmBjL+BWeieWnghBLlmPB0UDloZlenwDQRvt95nvmT22igGHKTXczjDszZ6ktPDrwp7Xtfx34WEPECAIAspeooLFP8HVQkEXO+VmX2bvT8N42N0w5MKI5I271SACAlMgw7gtpIpCn10cGqJfRfK1ABIIMUI+fMBpUnPpvhUhjUhIZ9p5z2c0vUrByLt5c36MoarrjJU38YGzJWcomn5w3BQAgJeXFQjDug2EY6qn2GEEZ0P+bmvCEWr5K5dVYlTmxZpRXxdV/FWB2CCYxHgXrQ0f2BloA55f2Pqq/NR7b85eyd0/NmQ/wZ8enczXLp0zutfcpjcxe2L7SJnXP8ONxkV87A/yl0i/d3CPmY1cMHFjzq6QSs0Lwypoed0NHjXcFAJBJgAeED3HLe+5ojfNFtnAx5sYvXGFgREL/t84SwzCUoW6HVNahwB3X9300FOA1+gQF48+RSST0uY0bRb9vcs+tPWiJaXvfyYrZ9Z0TwMuFYGT+4pYPgpruzmnGpEC8uKz7tVmSJU/k+ilhwAXgQuzinhuqf+qHWLUUCxPnbwR4JIQXnKjBDID4hCE3N8rvNF5ww9qf+7QlbPtkICIQGSPh/SPmH5eiLEImUIT32pX/vWlL2T4xZh4cmhcduckZ4K9I7nnMX902Zkpr2pxWvPEBxq/odQ66yQRGhmK+m+sUt3HaOACACwuAD0DD+dU+XzXEDEXMmYn3z8/ZaxCCweafxzz4IDf/p3FxeL4P6n62b8vd1fvqTxtnuxpp/F1z+NPbphyc8nnCvtVuAABbj2CXrO2eDY1HXLH+qDMWHR+WG7Nr7ROaoGCAY2T+5uEpX6jTQ1F93g/PLPI4AmHIRZlh3UjmO+vL3zikpWyxw3NrR0159K0JAA0nFvosKYnyRiyZiwXn/3UUwNABRoU/x+h0DVz5cAtixp7FqwGoOz8Q28/44JkfZgcDADAShnf3yCwJwKPA5QXvCZ77o7ERkvzjsFX9nevWV6gtU8vbvSaDrlnNKqtW83g82sU0L0xsLeLUCnrl5Tx0CQoM21L2+Bq3do9dMcDfcWNrYTqcjq3cPeNA5XyUddAkBPQ/LFzZ1aPL0Ysu1sq+NJfo9FxHuqS5+4wxK85G31wCgiHbiPryuqDpzlbFBz2CBpPScuGZ5NphU0JCQtTGplJoaKjJuhkg7+bMGwvVZbrsHI1coze5r2fJZV27RbqdS8ePLn2EoXnpbRG9J8mWMQxS4VLAp9PwZwRgZP7G9vc397Er+cpEW90Bptb829V9wvzmyvcDAFyM/N7eWyAvcOxmbgLdHKiGJsgpz+8Yq2lRKoG0rmuoUpoE+1mENtU1w5kLTWunHy75JiVMy+2/D7SRX35p3UsUF+8kVvm0syJgQYAudkCqlYTNKLb49ySp4qBsSTdByLZydfTCIVMHeyqjPN62F6Te0ypENpYl/PbqH/4o6Vvav1f5z04+DkEAvA62Wcm/mtQ0MXDh6VgAgOu7JgUO6A+/8TgdGmht5eVW2Rx46+PYz/EbLQVPCeEJu5JJJDSREjZ+7aANHhY5XzU2N6sJz4yfUSo+4DdXvv/QoUMm8RGM1ejZX1ZeTzUbXYdCDRBOuxW/8S2tsm5WbIzSyUagnD1guFNo0m/Z6vhbuq+mHy765sICLb//PtAycxhbN/PYhF5OGh8t2kJBTddVKSUeQ4oruYVigZrysKuKOhMeEBqyrUx9c4mjIPTHGyduP7CefCXmjypbGzZQZNoWGhdX1t2cd3+ck01TENQ3tnU0q3g3E6tXBS48HStjJDxZRITAb/5pxd3bHatZVTuvo75Z3dv8waw7e4YdIVKKBYZ54tCfEECWpxwRWMLybK40t5nU2wppQWurVu9sWffhtT2SiUG8gyff8UxXMMxRc58AK18zcw6BxiqTnN+V8utpNsdnTNNHNVTUY3V2LqhQnDdlW+7WTIbljdkBHetnLLAZZrP/fHdxXb/7pdy6rNKu48d/m7RxxhZZ8ok07yF3C00TRNwW0ss2//Dp8ODQIdvK1HFhYPrp1qsXGonTlYbCIrh3/S5Mnt43Qsm65aWlszsANKY0R886ezuIliy5KRjqLzrm3//+2cQfxg7o6dw2hW1VsnqNmlv0sAXrG9nrAHrydJb4AhMANj5ilm9fq1vxIrpWpNTxQWBuB6YCFkBkDVWNpgViC7YHl1JBerJqT2pzv6ix/spTNtwy1yvnCvLTi8RbnLpb5DXUdyTP3peq/XLsd9b+vbYkeDs19curdvw9uWLYdGl0dG4mA7wblT4YFpmqIyFInXLvt87NtmIFoREKqlynSjb98ZOM8eR1MbV5u7iI9ephnv9Z8IQ+w9Uir9o/btOfCptSRvZ733EZ6Eyh7KEyt5s91RvaVdBU0YSWfA3RqlvYmgaWulXiPl2yPj76eT2C5zpBBePPCZQm6WTMBN+Bdlnxzg48ESBPp6f5NEto5PIoCvQ6SM5idxapHWImjjY9aaJtsI6Xp6VdV340aX3UziLjWitn7e862pm5YGPS1O9mofPB/Q05XyTLifpJ8kaTpODA4uAQd7Pkfa7OQovijsBPAxYcPWFca+fOTDPnh2PPjPuox/AO23fVqTdaxgpU9/369uVJgUNAX6/UQ3sb0Ws6CE3p9Y0tNCet3CU0eM3FIwoGOIFS0D3N6wvvSKMQTq+b4OvnXhxvIwJRWwvoWb0WQK+h75R0/dHEpdeNd92bD7PVBQJFYsPVa7ovJ2/csaj2UKiLyYzo4vbju6+JeiinXdV3qPrk1XoumrEz+UdEHSEUjQ+O+E3jCPiDtRqzYkt+jbV4Uuy6xHDrtkAp6HbMn+890DnheLeu6F2o8pnst0B+6mbEQMGQpclqSQQK5je6R/sHuUhYsZs+807DZ60qvYevU1E426Fjm1s1YMrVoQaE9K0St+ljVp2PfhHz/xXGBCZWGjyw8mCfRuVRZ6zY64hn1viuTT706WI2KRhVP/XB43OcTr29FLsA/JXNXUpBi4Q1znnXvrFtiFwwKRCAQCYDPAAg6Qfen/gw0gmTI3oW5UQFHsUEHyyJm3AGESnZoxdhMz/MESas6n7q9hZHvLj1ww8ADEVQg8Igdfk/XodrDrsiJgzBP/aOX/yrdOjimr12WLffki3f64KXNo78DAAAX6E89lIhnN/6yfD071xUp1e9tzk18sPVqBiOpbsccf8st33wqIVmnHth+33+uSX2GbGL7FKnj1/tZFgHOAwDFINIKda6p2uOCLE8+u0H5afHyvC0C+Z9b4XJBz8e+gSjwAfZ8nc2Xl/vjBkHx48yjhmiOxM4NKdXROkeV8Rfh+LdqJHfXlr//pKCCHvVmdWDQgEAIsPgpVllp5ESZngLuGb5Ho/0g+Oi8bw3pm+yw++n9lwHwAcG4M83gZVpCV1kC1zvHglzOwkMGspZkr9CZUSkzq0d9s3dyKGn7h0ctzFHNnVq2u4hsjNr/Y9f3jX3bQDDu4G/cn8K5F8NCj2/plfr9YiRgQAAkZFhXEOYTsO+OX3X5H7fDVHhi9kHRx5dv3R9n8f3/I9hjKV3MjvNMiOHnsLzPpixyQF//MzjCwAOyCRAG+P0lMgw0/1zvBMOze/zDQD9Z63g8XX8FcjJOhzwE14dkdaUOPWX0rOfrdL8Gnzn4U8Bd28cnDbEMPevuN9Y4d2/OPi9uP94ZyZtGmqYI5PQhjEKTq8aOifjOxcWT7+FOXt9z86TzDN7nOY/Yp5hgIphxrv+/v27v3Wc6oNXvrLpWP9J/2kAFDD+wDESkTH+ZseWB+yIDPOZAADA+D9Z2jKmtWGI3OT13YqU+7iYs8O9OC86+Bf1ETHmbhNjwtbgcQDPZphGIciYsc5xzOB9l7+f2A/AkBAp/A1C2P657+S0jS5tbSecMXfv21dToya5dOZh9Utz5vBwoKVSwurbCuc78YsDf7tRqbxX7z159c+pxxQMy5EmGTzr/Qvb+RxTj3Es3zZq9r7UWAXjbxx7pkERBgB1LRy6uBqguh6xtgnYh1Xt0NYOoNfxn7uPQCnoZBIJHSI9VyJ0DVvIMbHpnXaKsQ2XSjEgEfQKf5azKOr2L7fKeo+5cUdVa8erHVpZXL6cEILhAf+sXEYAgBzZurXLgTlvH9v9xagggGedS6aM4VWmJXQBeNLenwdEJMf+M2H0qa/8J8tWjx4u2zTb9+cV7396hgmadGrrHFvDnBfn/8b/S27KBI+PGbUkcuGIAVFhXodXrNggfoyH1wH60SZerDWvUib7u3hZheivvXX+0DsrHSIBoDwZwJe0nJ/7+PF5kEkkdJZnDfHKtkWJpyeGQyLl5WWLEomc/Rtvip8AwwDllQ1EIodnOtBv8AZv8AZv8AZv8AT+BywWvXr4e7l0AAAAAElFTkSuQmCC', 'string', 'Setting for site_favicon', 1, '2025-10-22 05:17:44', '2026-07-30 09:57:57'),
(411, 'admin_commission_rate', '10', 'number', 'Default admin commission rate percentage', 0, '2025-10-28 06:09:49', '2026-07-30 09:57:57'),
(412, 'admin_tax_rate', '0', 'number', 'Tax rate on admin commission', 0, '2025-10-28 06:09:49', '2026-07-30 09:57:57'),
(413, 'commission_calculation_method', 'percentage', 'string', 'Commission calculation method (percentage or fixed)', 0, '2025-10-28 06:09:49', '2026-07-30 09:57:57'),
(414, 'minimum_payout_amount', '100', 'number', 'Minimum amount required for payout', 0, '2025-10-28 06:09:49', '2026-07-30 09:57:57'),
(415, 'payout_frequency', 'monthly', 'string', 'Payout frequency (weekly, monthly, quarterly)', 0, '2025-10-28 06:09:49', '2026-07-30 09:57:57'),
(438, 'bkash_enabled', 'true', 'boolean', 'Enable bKash payment gateway', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(439, 'bkash_merchant_id', 'KeyHost', 'string', 'bKash merchant ID', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(440, 'bkash_merchant_key', 'GpqzffQ0fbt2z0JcPDBu2AsAtc', 'string', 'bKash merchant key', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(441, 'bkash_merchant_secret', 'lBHrsJwlKURPWfKzvXV1FPsSr4IBm2F09WxbToOXJXrGm9g9d9Tr', 'string', 'bKash merchant secret', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(442, 'bkash_api_url', 'https://tokenized.pay.bka.sh/v1.2.0-beta', 'string', 'bKash API base URL', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(443, 'bkash_callback_url', 'http://localhost:3000/payment/callback', 'string', 'bKash payment callback URL', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(444, 'bkash_currency', 'BDT', 'string', 'bKash payment currency', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(445, 'bkash_intent', 'sale', 'string', 'bKash payment intent', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(446, 'bkash_mode', 'sandbox', 'string', 'bKash payment mode (sandbox/live)', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(447, 'bkash_success_url', 'http://localhost:3000/payment/success', 'string', 'bKash payment success redirect URL', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(448, 'bkash_fail_url', 'http://localhost:3000/payment/fail', 'string', 'bKash payment failure redirect URL', 0, '2025-10-29 08:56:13', '2026-07-30 09:57:57'),
(482, 'enable_bkash', 'true', 'boolean', 'Setting for enable_bkash', 1, '2025-10-29 09:00:26', '2026-07-30 09:57:57'),
(483, 'enable_nagad', 'false', 'boolean', 'Setting for enable_nagad', 1, '2025-10-29 09:00:26', '2026-07-30 09:57:57'),
(519, 'sms_sender_id', '01844015754', 'string', 'Setting for sms_sender_id', 0, '2025-11-11 07:06:03', '2026-07-30 09:57:57'),
(520, 'sms_api_key', 'b4a37e3c2c368a44', 'string', 'Setting for sms_api_key', 0, '2025-11-11 07:06:03', '2026-07-30 09:57:57'),
(521, 'sms_secret_key', '7e0ba143', 'string', 'Setting for sms_secret_key', 0, '2025-11-11 07:06:03', '2026-07-30 09:57:57'),
(560, 'payment_time_limit_minutes', '30', 'number', 'Setting for payment_time_limit_minutes', 0, '2025-11-12 05:35:35', '2026-07-30 09:57:57'),
(912, 'sms_enabled', 'true', 'boolean', 'Setting for sms_enabled', 0, '2025-12-10 04:53:32', '2026-07-30 09:57:57'),
(993, 'primary_color', '#E41D57', 'string', 'Setting for primary_color', 0, '2025-12-21 08:50:15', '2026-07-30 09:57:57'),
(1035, 'secondary_color', '#E41D57', 'string', 'Setting for secondary_color', 0, '2025-12-21 08:50:39', '2026-07-30 09:57:57'),
(1458, 'site_description', 'Find Your Comfort', 'string', 'Setting for site_description', 1, '2026-02-23 07:13:57', '2026-07-30 09:57:57'),
(1502, 'enable_sslcommerz', 'true', 'boolean', 'Setting for enable_sslcommerz', 1, '2026-02-25 15:16:59', '2026-07-30 09:57:57'),
(1547, 'sslcommerz_store_id', 'keyhost0live', 'string', 'Setting for sslcommerz_store_id', 0, '2026-02-25 15:17:40', '2026-07-30 09:57:57'),
(1548, 'sslcommerz_store_password', '69B795058626C68204', 'string', 'Setting for sslcommerz_store_password', 0, '2026-02-25 15:17:40', '2026-07-30 09:57:57'),
(1549, 'google_client_id', '82849880523-pdlo06m2e6n46eunf951sfv4cgt4a8kb.apps.googleusercontent.com', 'string', 'Google Client ID', 1, '2026-02-26 02:51:19', '2026-07-30 09:57:57'),
(1550, 'google_client_secret', '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', 'string', 'Google Client Secret', 0, '2026-02-26 02:51:19', '2026-07-30 09:57:57'),
(1551, 'smtp_host', 'smtp.gmail.com', 'string', 'SMTP Server', 0, '2026-02-26 05:07:23', '2026-07-30 09:57:57'),
(1552, 'smtp_port', '465', 'string', 'SMTP Port', 0, '2026-02-26 05:07:24', '2026-07-30 09:57:57'),
(1553, 'smtp_encryption', 'ssl', 'string', 'SMTP Encryption', 0, '2026-02-26 05:07:24', '2026-07-30 09:57:57'),
(1554, 'smtp_username', 'arbhuiyan.pits@gmail.com', 'string', 'SMTP Username', 0, '2026-02-26 05:07:24', '2026-07-30 09:57:57'),
(1555, 'smtp_password', 'zgnd avpj klry ygpt', 'string', 'SMTP Password', 0, '2026-02-26 05:07:24', '2026-07-30 09:57:57'),
(1556, 'mail_from_address', 'arbhuiyan.pits@gmail.com', 'string', 'Mail From Address', 0, '2026-02-26 05:07:24', '2026-07-30 09:57:57'),
(1557, 'mail_from_name', 'Keyhost Homes', 'string', 'Mail From Name', 0, '2026-02-26 05:07:24', '2026-07-30 09:57:57'),
(1613, 'sslcommerz_is_live', 'true', 'boolean', 'Setting for sslcommerz_is_live', 0, '2026-03-03 04:54:56', '2026-07-30 09:57:57'),
(1614, 'google_maps_api_key', 'AIzaSyBaZ6hlAV5zVfCzQZqY4KGrQqqv8zjrbu0', 'string', 'Setting for google_maps_api_key', 1, '2026-03-03 04:54:56', '2026-07-30 09:57:57'),
(1843, 'contact_phone', '+8801730353300', 'string', 'Setting for contact_phone', 1, '2026-03-14 05:21:48', '2026-07-30 09:57:57'),
(1902, 'site_address', 'Rupayan Centre(8th Floor), 72\r\nMohakhali C/A, Dhaka-1212, Bangladesh', 'string', 'Setting for site_address', 1, '2026-03-16 10:17:50', '2026-07-30 09:57:57'),
(2080, 'terms_of_service', 'KeyHost24 â€” Terms & Conditions  \r\n\r\nWelcome to KeyHost24. By accessing our website and booking our services, you agree to comply with and be bound by the following Terms & Conditions.\r\n\r\n---\r\n\r\n### 1. About Us\r\nKeyHost24 provides short-term rental and accommodation management services for guests seeking comfortable and reliable stays.\r\n\r\n---\r\n\r\n### 2. Booking & Payments\r\n- All bookings must be confirmed with advance or full payment.  \r\n- Prices are subject to availability, seasonal demand, and promotional offers.  \r\n- Payments can be made via approved methods including cards, mobile financial services, and online payment gateways.  \r\n\r\n---\r\n\r\n### 3. Check-in & Check-out\r\n- Standard Check-in Time: [Insert Time]  \r\n- Standard Check-out Time: [Insert Time]  \r\n- Early check-in or late check-out is subject to availability and may incur additional charges.  \r\n\r\n---\r\n\r\n### 4. Guest Responsibilities\r\nGuests agree to:\r\n- Provide valid identification at check-in  \r\n- Maintain the property in good condition  \r\n- Follow all house rules and regulations  \r\n- Avoid illegal, unsafe, or disruptive behavior  \r\n\r\n---\r\n\r\n### 5. Property Use\r\n- The property must be used only for residential purposes  \r\n- Subletting or unauthorized guests are not allowed  \r\n- Parties or events are strictly prohibited unless approved  \r\n\r\n---\r\n\r\n### 6. Damage & Loss\r\n- Guests are responsible for any damage caused during their stay  \r\n- Costs for repair or replacement will be charged or deducted from the security deposit  \r\n\r\n---\r\n\r\n### 7. Cancellation & Refund\r\nAll cancellations, refunds, and rescheduling are governed by our Refund & Cancellation Policy available on the website.\r\n\r\n---\r\n\r\n### 8. Security Deposit\r\n- A refundable security deposit may be required  \r\n- The deposit will be returned after inspection at checkout  \r\n- Deductions may apply for damages or violations  \r\n\r\n---\r\n\r\n### 9. Limitation of Liability\r\nKeyHost24 shall not be held responsible for:\r\n- Loss or theft of personal belongings  \r\n- Injuries or accidents occurring during the stay  \r\n- Delays or disruptions caused by external factors beyond our control  \r\n\r\n---\r\n\r\n### 10. Privacy & Data Protection\r\nWe respect your privacy. All personal information is handled according to our Privacy Policy.\r\n\r\n---\r\n\r\n### 11. Third-Party Services\r\n- We may use third-party services (e.g., payment gateways) for processing transactions  \r\n- KeyHost24 is not responsible for failures or issues arising from third-party services  \r\n\r\n---\r\n\r\n### 12. Website Use\r\n- Users agree not to misuse the website or attempt unauthorized access  \r\n- All content on the website is the property of KeyHost24 and may not be copied or reused without permission  \r\n\r\n---\r\n\r\n### 13. Policy Updates\r\nKeyHost24 reserves the right to modify these Terms & Conditions at any time without prior notice. Updated versions will be posted on the website.\r\n\r\n---\r\n\r\n### 14. Governing Law\r\nThese Terms & Conditions are governed by the laws of Bangladesh.\r\n\r\n---\r\n\r\n### 15. Contact Information\r\nFor any inquiries, please contact:\r\n\r\nKeyHost24 Support Team  \r\nEmail: info@keyhost24.com  \r\nPhone/WhatsApp: [01730353300]\r\n\r\n---\r\n\r\nBy booking with KeyHost24, you confirm that you have read, understood, and agreed to these Terms & Conditions.', 'string', 'Setting for terms_of_service', 1, '2026-03-29 10:00:33', '2026-07-30 09:57:57'),
(2141, 'privacy_policy', '----', 'string', 'Setting for privacy_policy', 1, '2026-03-29 10:07:44', '2026-07-30 09:57:57'),
(2142, 'refund_policy', 'KeyHost24 â€” Refund, Cancellation & Rescheduling Policy  \r\n\r\nAt KeyHost24, we strive to provide a reliable and transparent booking experience. This policy outlines the conditions for cancellations, refunds, and booking modifications.\r\n\r\n---\r\n\r\n### 1. Booking Confirmation\r\nAll reservations are confirmed only after receiving a partial or full payment. By confirming a booking, the guest agrees to all policies stated herein.\r\n\r\n---\r\n\r\n### 2. Cancellation Policy\r\n\r\na. Standard Cancellation (Flexible Rate)  \r\n- Free cancellation up to 48 hours before check-in  \r\n- 100% refund of advance payment  \r\n\r\nb. Late Cancellation  \r\n- Cancellations within 48 hours of check-in are non-refundable\r\n\r\nc. No-Show  \r\n- Failure to check in on the scheduled date will result in full booking charge with no refund\r\n\r\n---\r\n\r\n### 3. Non-Refundable Bookings (If Applicable)\r\nCertain promotional or discounted bookings may be marked as Non-Refundable.  \r\n- No refund will be provided under any circumstances  \r\n- Date changes may not be permitted  \r\n\r\n---\r\n\r\n### 4. Early Check-Out\r\n- No refund will be issued for unused nights after check-in  \r\n- Full stay amount remains payable\r\n\r\n---\r\n\r\n### 5. Refund Processing Timeline\r\n- All approved refunds will be processed within 7â€“10 working days  \r\n- Refunds will be issued via the original mode of payment  \r\n- Delays caused by banks, payment gateways, or mobile financial services are beyond our control  \r\n\r\n---\r\n\r\n### 6. Rescheduling / Date Modification\r\n- Changes are allowed if requested at least 48 hours before check-in  \r\n- Subject to availability  \r\n- Rate differences may apply  \r\n\r\n---\r\n\r\n### 7. Security Deposit (If Applicable)\r\n- Refundable upon checkout after inspection  \r\n- Deductions may apply for:\r\n  - Damages  \r\n  - Missing items  \r\n  - Rule violations  \r\n\r\n---\r\n\r\n### 8. Host-Initiated Cancellation\r\nIn rare cases where KeyHost24 must cancel:\r\n- Full refund will be issued, OR  \r\n- Alternative accommodation of similar or higher standard will be provided  \r\n\r\n---\r\n\r\n### 9. Force Majeure / Exceptional Circumstances\r\nRefunds or credits may be considered in events beyond control, including:\r\n- Natural disasters  \r\n- Government restrictions  \r\n- Medical emergencies  \r\n\r\n(Valid documentation required)\r\n\r\n---\r\n\r\n### 10. Third-Party & Data Responsibility\r\n- KeyHost24 does not share customer data with unauthorized third parties  \r\n- Any integrated third-party service complies with applicable data protection standards  \r\n- KeyHost24 is not responsible for external service disruptions beyond its control  \r\n\r\n---\r\n\r\n### 11. Policy Acceptance\r\nDuring checkout, guests must confirm that they have read and agreed to:\r\n- Terms & Conditions  \r\n- Privacy Policy  \r\n- Refund & Cancellation Policy  \r\n\r\n---\r\n\r\n### 12. Contact Information\r\nFor any queries regarding cancellations or refunds:\r\n\r\nKeyHost24 Support Team  \r\nEmail: info@keyhost24.com  \r\nPhone/WhatsApp: [01730353300]\r\n\r\n---\r\n\r\nNote: KeyHost24 reserves the right to update this policy at any time without prior notice.', 'string', 'Setting for refund_policy', 1, '2026-03-29 10:07:44', '2026-07-30 09:57:57'),
(2701, 'pending_booking_timeout_minutes', '30', 'number', 'Setting for pending_booking_timeout_minutes', 0, '2026-05-23 04:02:20', '2026-07-30 09:57:57'),
(2891, 'sms_template_booking_request_host', 'New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Review & accept here: {booking_url}', 'string', 'Test booking request SMS template', 0, '2026-06-07 04:20:38', '2026-07-30 09:57:57'),
(2892, 'sms_template_booking_accepted_guest', 'Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay.', 'string', 'SMS template setting for booking accepted guest', 0, '2026-06-07 04:20:38', '2026-07-30 09:57:57'),
(2893, 'sms_template_booking_paid_host', 'Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully. Guest: {guest_name}. Check-in: {check_in_date}.', 'string', 'SMS template setting for booking paid host', 0, '2026-06-07 04:20:38', '2026-07-30 09:57:57'),
(2894, 'sms_template_booking_paid_guest', 'Thank you {guest_name}! Payment of {amount} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}.', 'string', 'SMS template setting for booking paid guest', 0, '2026-06-07 04:20:38', '2026-07-30 09:57:57'),
(2895, 'sms_template_checkout_guest', 'Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!', 'string', 'SMS template setting for checkout guest', 0, '2026-06-07 04:20:38', '2026-07-30 09:57:57'),
(2896, 'sms_template_refund_guest', 'Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}.', 'string', 'SMS template setting for refund guest', 0, '2026-06-07 04:20:38', '2026-07-30 09:57:57'),
(2897, 'sms_template_refund_host', 'Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}.', 'string', 'SMS template setting for refund host', 0, '2026-06-07 04:20:38', '2026-07-30 09:57:57'),
(3177, 'auto_approve_reviews', 'true', 'boolean', 'Setting for auto_approve_reviews', 0, '2026-07-03 12:15:37', '2026-07-30 09:57:57'),
(3605, 'facebook_url', 'https://www.facebook.com/keyhosthomes', 'string', 'Setting for facebook_url', 1, '2026-07-19 10:06:08', '2026-07-30 09:57:57'),
(3678, 'sms_gateway_type', 'whatsapp', 'string', 'Setting for sms_gateway_type', 0, '2026-07-20 09:09:53', '2026-07-30 09:57:57'),
(3679, 'bkash_is_live', 'true', 'boolean', 'Whether bKash tokenized API is live', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3680, 'bkash_username', '01730353300', 'string', 'bKash API Username', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3681, 'bkash_password', '|zx}|<T53@3', 'string', 'bKash API Password', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3682, 'bkash_api_associated_email', '', 'string', 'bKash API Registered Email', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3683, 'nagad_is_live', 'false', 'boolean', 'Whether Nagad API is live', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3684, 'nagad_api_url', 'http://sandbox.mymoid.com:9090', 'string', 'Nagad API URL', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3685, 'nagad_merchant_id', '', 'string', 'Nagad Merchant ID', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3686, 'nagad_private_key', '', 'string', 'Nagad Private Key', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3687, 'nagad_public_key', '', 'string', 'Nagad Public Key', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3688, 'nagad_merchant_private_key', '', 'string', 'Nagad Merchant Private Key', 0, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3689, 'google_places_enabled', 'true', 'boolean', 'Whether Google Places autocomplete is enabled', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57'),
(3690, 'google_api_associated_email', '', 'string', 'Google Places associated account email', 1, '2026-07-26 08:54:29', '2026-07-30 09:57:57');

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
  `auto_accept_bookings` tinyint(1) DEFAULT 0,
  `phone_verification_otp` varchar(6) DEFAULT NULL,
  `phone_verification_expires_at` timestamp NULL DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `nid_number` varchar(50) DEFAULT NULL,
  `passport_number` varchar(50) DEFAULT NULL,
  `nid_document_url` text DEFAULT NULL,
  `passport_document_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `user_type`, `host_id`, `email_verified_at`, `phone_verified_at`, `is_active`, `profile_image`, `date_of_birth`, `gender`, `address`, `city`, `state`, `country`, `postal_code`, `two_factor_enabled`, `two_factor_secret`, `last_login_at`, `login_attempts`, `locked_until`, `language`, `timezone`, `email_notifications`, `sms_notifications`, `created_at`, `updated_at`, `bio`, `work`, `school`, `is_superhost`, `languages`, `google_id`, `auto_accept_bookings`, `phone_verification_otp`, `phone_verification_expires_at`, `nationality`, `nid_number`, `passport_number`, `nid_document_url`, `passport_document_url`) VALUES
(1, 'Admin', 'User', 'admin@keyhost.com', '+8801712345678', '$2a$12$bADSG1hhKuOgx6sgInD3Le7g2mW4M/AfHdxjvAnSynUKumb15auhm', 'admin', NULL, '2025-10-12 19:40:43', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-31 02:14:48', 0, NULL, 'en', 'UTC', 1, 0, '2025-10-12 19:40:43', '2026-07-31 02:14:48', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Super', 'Admin', 'superadmin@keyhost.com', '+8801712345679', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'admin', NULL, '2025-10-12 19:40:43', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 6, '2026-07-03 12:33:53', 'en', 'UTC', 1, 0, '2025-10-12 19:40:43', '2026-07-03 12:03:53', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Guest', 'User', 'guest@keyhost.com', '01932570096', '$2a$12$ZRtBHaDsifn2cNMw3c5QoOiNa.6000D641EY5hmQIMgqYWX.sSPQ6', 'guest', NULL, '2025-10-13 09:49:21', NULL, 1, NULL, '2025-10-01', 'male', 'dhaka', 'Dhaka', 'Dhaka', 'Bangladesh', NULL, 0, NULL, '2026-02-23 06:12:56', 0, NULL, 'en', 'UTC', 1, 0, '2025-10-13 09:49:21', '2026-02-23 06:12:56', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'Property Owner', 'User', 'owner@keyhost.com', '+8801932570096', '$2a$12$bADSG1hhKuOgx6sgInD3Le7g2mW4M/AfHdxjvAnSynUKumb15auhm', 'property_owner', NULL, '2025-10-19 09:37:39', NULL, 1, NULL, '1992-10-19', 'male', 'Dhaka', 'Dhaka', 'Dhaka', 'Bangladesh', NULL, 0, NULL, '2026-04-25 06:40:38', 0, NULL, 'en', 'UTC', 1, 0, '2025-10-19 09:37:39', '2026-04-25 06:40:38', NULL, NULL, NULL, 0, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'Bini', 'Amin', 'amin@keyhost.com', '01911518462', '$2a$12$Kw9tKmfpUnj6gGErCoTTGO91z9Wsm5E6266FOmcvXeXDls.v1MHbC', 'guest', NULL, '2026-02-01 05:15:16', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-02-01 05:15:16', '2026-02-01 05:15:16', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'Reservation1', '.', 'reservation1@keyhosthomes.com', '01774849026736', '$2a$12$3UIl6VI5QZzVp17sik46UebBF4sF.Pl/7fwigO0mmlqJJSKxWsEFW', 'property_owner', NULL, '2026-03-30 05:37:06', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJDIWXfD0YyyP6vfyaUWNqiM_bVQ0mLNSlsok26i0QpLNsHaw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-22 17:38:11', 0, NULL, 'en', 'UTC', 1, 0, '2026-03-30 05:37:06', '2026-07-20 09:15:01', NULL, NULL, NULL, 0, NULL, '102708877439960281828', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(50, 'Md. Imtiaz', 'Hanif', 'sakil.imtiaz@gmail.com', '01774853552504', '$2a$12$2HiAc7MQKbzOMh7u5iPmK.47Bmv1hgxgIfxVAr3QZus1TSsN9RLFe', 'property_owner', NULL, '2026-03-30 06:52:32', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLwI2s1aYvKtyxgQoXfLfDJu3mziLzaCoVb93R2pvYYHdYue7iHYg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-28 03:26:22', 0, NULL, 'en', 'UTC', 1, 0, '2026-03-30 06:52:32', '2026-07-28 03:26:22', NULL, NULL, NULL, 0, NULL, '103083555536008779942', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'Test', 'Guest', 'rolay60533@fengnu.com', '01711111111', '$2a$12$trtLJaF2OG.t65MXgg3kweONkdNgPI0FlT0XrYAev1Ui9LRad0pHC', 'guest', NULL, '2026-03-31 01:59:14', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-03-31 01:59:14', '2026-03-31 01:59:14', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'KeyHost ', 'Homes', 'reservation2@keyhosthomes.com', '01730353300', '$2a$12$CM2nDwRQbqOca/VXJWtzPuyqJNi3sMyxX2bfcgVJVJPePDqzugDHq', 'property_owner', NULL, '2026-03-31 04:44:42', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIt1mwW1W9IjXqk5co9VzuK45gIYbu40sqsEYMZ7R5AIwtI6A=s96-c', NULL, NULL, '', '', '', '', '', 0, NULL, '2026-07-30 22:49:17', 0, NULL, 'en', 'UTC', 1, 0, '2026-03-31 04:44:42', '2026-07-30 22:49:17', '', NULL, NULL, 0, NULL, '117819244221922854397', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'Rony', 'Noor', 'ronynoor2015@gmail.com', '+8801715000636', '$2a$12$Wce4kQ7hEpOc0PpA4HBfO.Ow8d8Wx7fpML186gyZpi02qpljQtcfS', 'property_owner', NULL, '2026-04-02 11:30:49', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-30 10:21:11', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-02 11:30:49', '2026-07-30 10:21:11', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'Tarafder', 'Md Ruhul Amin', 'tarafderamin@gmail.com', '01775416231151', '$2a$12$KUEXysHZaDfHBP8kJEdHRex.sX3ITl30DhI00Q4UK12tREZ1Abx66', 'guest', NULL, '2026-04-05 19:10:31', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJ0osTmvVTsbbWyW5jUTGGvq3v3QrPEwmltjZRe0RIv5DacPw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-04-05 19:10:31', '2026-05-18 05:18:43', NULL, NULL, NULL, 0, NULL, '105794295834654476222', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'Saif', 'Tarafder', 'saif607@gmail.com', '01775468190527', '$2a$12$PrrsYeQtz/RNf16JoeG1IuUfCVZdyz/OfGavFER1qe4VTqQ/9WEVm', 'guest', NULL, '2026-04-06 09:36:30', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK_fc2lVRfyG3mjTvdRPnWQ7ZLK9CyL7SccBDp-IkC2RDgzwFUJ6g=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-28 17:59:02', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-06 09:36:30', '2026-07-28 17:59:02', NULL, NULL, NULL, 0, NULL, '108600706256610741426', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, 'Bini', 'Amin', 'titubiniamin@gmail.com', '01775561819073', '$2a$12$qH7zAKGbnyjZESJkgwEIU.UIi1nFNITBFdmiH6CHMr8Cu7r6wXSe2', 'guest', NULL, '2026-04-07 11:36:59', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJHMH4h_JpKNrOesJdQNo6juprbGP8N0Q7xpmuQbH39UIIIDTotLQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-30 10:11:03', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-07 11:36:59', '2026-07-30 10:11:03', NULL, NULL, NULL, 0, NULL, '111595828045881219195', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(57, 'tanzim', 'islam', 'tanzimislam426@gmail.com', '01775564391768', '$2a$12$PL3W8YFv.cjleVKtdI.v8OtuXLSUJeo5i3B3mY1Imyuojpfmn7egK', 'guest', NULL, '2026-04-07 12:19:51', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIEFsA05yBuiKFP7kSEsPBz58pi9CpNMje2O_1EztHBVMIqDz0Z=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-10 10:08:41', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-07 12:19:51', '2026-06-10 10:08:41', NULL, NULL, NULL, 0, NULL, '115537929237544952939', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(58, 'Tanbir', 'Islam', 'tanbirislam96@gmail.com', '01775564409811', '$2a$12$j7hvWoTQq/pO3ltZ202/Pub9BZixSV1JofJG3AcNGdgRdKO5UHNPW', 'guest', NULL, '2026-04-07 12:20:09', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIT_yx_63S5oZCWRD7_Igt4WvduM8276t1_nqHenKUZ900_FJnC=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-04 08:37:58', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-07 12:20:09', '2026-07-04 08:37:58', NULL, NULL, NULL, 0, NULL, '113831420183700882709', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'AR', 'Bhuiyan', 'arbhuiyan.pits@gmail.com', '01729714503', '$2a$12$sUxztG3mD6NnVgK.N5md9ODA7DLj60thAWEDP9K64fhp0/pZD34Wu', 'property_owner', NULL, '2026-04-13 04:36:34', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocId7BcdtkzA_iHXyUgI2ZxgseX145xWVNmH8eMZdECNBZhbsQ=s96-c', NULL, NULL, '', '', '', '', '', 0, NULL, '2026-08-01 05:35:17', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-13 04:36:34', '2026-08-01 05:35:17', '', NULL, NULL, 0, NULL, '117579869875687587616', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, 'Manager', '', 'manager@keyhost.com', '23454', '$2a$12$.izwmwynuhHJ6EhBQvdLPO0qkc9kofnRbiWQYIBq1dGG9SBErcYIa', 'staff', 59, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-02 07:13:10', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-26 05:40:27', '2026-05-02 07:13:10', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(64, 'Atiqur Rahman', 'Bhuiyan', 'atiqur.cumilla@gmail.com', '01777529947564', '$2a$12$9AmssTPm0WcC5T226M0EY.lbHxKcp9EUoBmI5OYIYnSpSxI/t2S3a', 'property_owner', NULL, '2026-04-30 06:19:07', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIbPRlza_XvPh4GUtTyflJoBN3CIDIccreLK1BQgU0ModIDCA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-29 07:36:39', 0, NULL, 'en', 'UTC', 1, 0, '2026-04-30 06:19:07', '2026-06-29 07:36:39', NULL, NULL, NULL, 0, NULL, '108711246270744898816', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, 'Mr.', 'HK-Staff', 'hkstaff@keyhost.com', '123421', '$2a$12$5B2QayPGBTQHsxYRaD4Bs.xqsLx6Mo7nrXWUIsyz.QzeSWPbrPkt.', 'staff', 59, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-03 06:45:20', '2026-05-23 06:51:09', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 'Tasin', 'Abir', 'mdabir01870770010@gmail.com', '01761808367', '$2a$12$WO5rkTQaILb4r9T8kY55auVzNsIuPds9lfnKMpzvnuXvTWgILuMYO', 'guest', NULL, '2026-05-12 19:21:43', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-12 19:21:43', '2026-05-12 19:21:43', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, 'Tech', 'Tonic', 'techtonic.dhk@gmail.com', '01779006970248', '$2a$12$F3i/UP.Lg4NCbdOr.fFHHuKrqjio3JuLOja8mERnlfakGDkQNXTKa', 'guest', NULL, '2026-05-17 08:36:10', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK3CUz0Bhu74L8KItwj8WJncmXMK64krtDr_1bJaN5Fugx7BA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-21 08:41:38', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 08:36:10', '2026-05-21 08:41:38', NULL, NULL, NULL, 0, NULL, '113680803738321795005', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(68, 'Nore', 'Def', 'noredef70@gmail.com', '01779013252961', '$2a$12$lZ39HPutoiAiiPMGQEuUS.4k//UGfM0Ns8HeLl57BWdcGO2jPXkaa', 'guest', NULL, '2026-05-17 10:20:52', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJDjGckstwVYuQKPfdOwzw9TSpTO9TROpn22rBKPSWsa61PwA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 10:20:52', '2026-05-18 05:20:06', NULL, NULL, NULL, 0, NULL, '104833284078655758639', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, 'adnan', 'sami', 'adnansami229atbd@gmail.com', '01779014136358', '$2a$12$SmshEiPjpM9JXzTxqYBb.e20NE6eZjCk3U5A8nwB.A5dl.2YflxCq', 'guest', NULL, '2026-05-17 10:35:36', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLfk1Y5RLa7i1o60ntQMenGYigRDIRcC4_9NGzl7Ig5sxr1B690=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-16 13:05:50', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 10:35:36', '2026-07-16 13:05:50', NULL, NULL, NULL, 0, NULL, '109783368443009686440', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(70, 'Md Akib', 'Hossain', 'mdakibhossain697@gmail.com', '01779022108052', '$2a$12$xrpQvFGD4eywIUrQQ7.OD.gYXntyovJr8anhjAs2wWnXRkiuVkvry', 'guest', NULL, '2026-05-17 12:48:28', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLDeUNDDUa_vOSO5k6bR02W-7Z-AN3WLikY-B8uJZCUqJpULw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 12:48:28', '2026-05-18 05:20:24', NULL, NULL, NULL, 0, NULL, '105815656359125256466', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(71, 'MJ11', 'Gaming', 'smjoy619@gmail.com', '01779046308360', '$2a$12$S4zXFOF6kEZ0.rpBeywyMOs1OVhNayaFhOwre3EY3ZgXmcBetTon2', 'guest', NULL, '2026-05-17 19:31:48', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJgL--XR0lM2W_xU74KKCMH8ujZiJF-qjm4wWCS370xpSbl1YMf4Q=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-17 19:31:48', '2026-05-18 05:20:31', NULL, NULL, NULL, 0, NULL, '107845648885798043245', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, 'Muhib', 'Rahman', 'muhibrahman98@gmail.com', 'G-1779083716247', '$2a$12$1dzHIBE31FxLZALwQhOfIuxZXkZZLnGITsibCvazxyiKD/mVd5YtO', 'guest', NULL, '2026-05-18 05:55:16', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLRW5QMyUJH7DC7xLH6uxvAubwXroZccDB-PxlIKjksjA98DA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-18 05:55:16', '2026-05-18 05:55:16', NULL, NULL, NULL, 0, NULL, '109084105730950549091', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, 'Bini', 'Amin', 'titubiniaminphoto@gmail.com', 'G-1779271574345', '$2a$12$7Pr8LJVRJfjBhHxiRlPSbO0MACS5I5ghIlVAQXk/gTRczwyU1qRsK', 'guest', NULL, '2026-05-20 10:06:14', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIUJCRzAgGpFRkS6qc4Oc44qfsTHfTcarepTUexjuOVbKExQw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-20 10:06:14', '2026-05-20 10:06:14', NULL, NULL, NULL, 0, NULL, '100328090505222812066', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(74, 'Test', 'Agent', 'testuser@example.com', '01555555555', '$2a$12$BS2u4qIW5zZB.9Ge/99NUOVVtbNKDzKn2DSLwgNkArrxCBAUNwfa6', 'property_owner', NULL, '2026-05-22 15:01:56', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-22 15:01:56', '2026-05-22 15:01:56', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(75, 'Farhad', 'Ali', 'farhadali0507@gmail.com', 'G-1779514102952', '$2a$12$fnX9iDVTMQTCJS31tWY17Opohm7XUgKPtFBehFx/RuL.hv3iVMjGa', 'property_owner', NULL, '2026-05-23 05:28:22', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLQ5ljR94swyMfy8DB0nMwIoLlTxwlRRsxDfePY3P6TYLburfE=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-30 10:25:47', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 05:28:22', '2026-07-30 10:25:47', NULL, NULL, NULL, 0, NULL, '117371253437301383532', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(76, 'Tanjim', '', 'tanjim@gmail.com', '0139856852', '$2a$12$AMZzVmDCDyTuDE4.bMS2uei8on0Aa6YnBa7JwMBbA6bbK5b3UT0Oe', 'staff', 59, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-23 08:30:31', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 08:29:25', '2026-05-23 08:30:31', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(77, 'Ashiqur', 'Rahman', 'asifboycocgame@gmail.com', 'G-1779561817279', '$2a$12$5nWCXdI578wt/YlA/J0gyueCZ0P3J1wsqgAOQkDU/AnHbhO5dUN8m', 'guest', NULL, '2026-05-23 18:43:37', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJNIN4ftDkOfPD4fM9p9kFzenLPaDpWpoFAlDasXLNdilma65tG=s96-c', NULL, NULL, '', '', '', '', '', 0, NULL, '2026-06-17 21:03:45', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 18:43:37', '2026-06-17 21:03:45', NULL, NULL, NULL, 0, NULL, '100773045449747558359', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(78, 'Tasnim', 'Islam', 'tasnimislam017@gmail.com', 'G-1779565224287', '$2a$12$s/u86se3yPx2W9/KbCnI..A.TIFpPFw2ZebX5aD/m/tiDGeupF2HG', 'guest', NULL, '2026-05-23 19:40:24', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLodpuH2z1uf-YRpd_ASRG8csWj2MhlATibLVeJeajSKJd8YA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-23 19:40:24', '2026-05-23 19:40:24', NULL, NULL, NULL, 0, NULL, '118075528480833678691', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(79, 'Runa', 'Akter', 'iamkaziruna@gmail.com', 'G-1779618181403', '$2a$12$gOilLQgVui7AVhajDIiQsO2CJwMReMwL6anXezkANkAi5wFstzVVq', 'property_owner', NULL, '2026-05-24 10:23:01', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIcjR9HDbulQ3jUo8qmh6Nw9olxojQ6pWHn4klBSpIIVkLGvw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-24 10:23:01', '2026-05-24 10:23:10', NULL, NULL, NULL, 0, NULL, '103877307740195999427', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(80, 'Ashraf', 'Ayon', 'ashrafayon64@gmail.com', 'G-1779709548945', '$2a$12$8liAI3/HBK6nH88OlXP.yuO55ohQTj0ANx0ja2VD8mb7IWXHnMj.S', 'guest', NULL, '2026-05-25 11:45:48', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIBwt9oh7HiQ8W_fUcbb-h_n7EFuKGSCLDWYfoVUsSdXJpX1MeiQw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-06 14:13:33', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-25 11:45:48', '2026-07-06 14:13:33', NULL, NULL, NULL, 0, NULL, '113180452066208462758', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(81, 'Test', 'User', 'newhost2626@mailinator.com', '01712345678', '$2a$12$ABjABcDu./mNQfN2LdMAReUDTmupkO/wJqv1wy2srzqxk1TrPZNhC', 'property_owner', NULL, '2026-05-26 05:13:42', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-05-26 06:01:19', 0, NULL, 'en', 'UTC', 1, 0, '2026-05-26 05:13:42', '2026-06-24 02:51:46', NULL, NULL, NULL, 0, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(82, 'Tanzila', 'ishara', 'tanzilaishara00@gmail.com', 'G-1780166769098', '$2a$12$9jb8MzNfMjj2CJLKjGxL.OiHTGCvfewPEgj6cb8eyrWEsIw42CHW2', 'guest', NULL, '2026-05-30 18:46:09', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocI6ALwLjM8QhL4F3VbAJ04cm5rbuPBrz_AhpMvJ0TTRB58RHA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-05-30 18:46:09', '2026-05-30 18:46:09', NULL, NULL, NULL, 0, NULL, '116514117264325917576', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(83, 'Sabit', 'Bhai', 'sabitbhai9@gmail.com', 'G-1780310008840', '$2a$12$t7e.aTmml8od.44dGTHpZejAxXu5xI83LVd/9aKfl8BrgDGtCcQY6', 'guest', NULL, '2026-06-01 10:33:28', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJdE9WrbZQMO5rKTvts4PgQ4AuVTqscZOUzl0DUkPZ8p3riXA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-01 10:33:28', '2026-06-01 10:33:28', NULL, NULL, NULL, 0, NULL, '113663854879554835221', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(84, 'Ashikur', 'Rahman', 'ashikurahman1337@gmail.com', 'G-1780411503817', '$2a$12$5RN79EzVaJbM6dGB2OjUAOBRZBtEee6o20IK8k51G6eUPzpy.7RYW', 'guest', NULL, '2026-06-02 14:45:03', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJVhMKFREyd3pjxrVyVCmqk-qSm0G9f6589BCCrSdJHRvLFBg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-02 14:45:03', '2026-06-02 14:45:03', NULL, NULL, NULL, 0, NULL, '113564090995088450054', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(85, 'Suman', 'Goswami', 'sumanch5795@gmail.com', 'G-1780433711854', '$2a$12$XT0VzYbZ8qWuZ5m1QnlaxOaQbD0nFov2yOZDoGdJjLo9VKw3HC6OK', 'guest', NULL, '2026-06-02 20:55:11', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLXju9qVOz4IDDSbU2BWRdsN_5k72ufnVKXJND-BjEw0JfxbQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-02 20:55:11', '2026-06-02 20:55:11', NULL, NULL, NULL, 0, NULL, '103666446795169626808', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(86, 'MD SAMS E', 'Tabriz', 'md.samsetabrizraad@gmail.com', '01534634467', '$2a$12$yHtidv5/jMgdczOYb8NpIewV/n7o.s3mlcHR5Y6CZ5IkKlDhtI8UO', 'guest', NULL, '2026-06-03 10:08:15', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-03 10:08:15', '2026-06-03 10:08:15', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(87, 'MD.', 'IHTESHAMUZZAMAN', 'ihteshamrifat1276@gmail.com', 'G-1780490997454', '$2a$12$u7WhLz1G1DoYPYeYYD2R4u4TdzCmxnUp1tYCNzwG6Ulf/OKiwP2X6', 'guest', NULL, '2026-06-03 12:49:57', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKNLWcESbSRKUBIBpWhxUE4JvOZe98xijx_7f3oAE1RiTu6rvdOiw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-17 03:30:20', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-03 12:49:57', '2026-07-17 03:30:20', NULL, NULL, NULL, 0, NULL, '113665926733775715840', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(88, 'Mostafa', 'Al hasan', 'mostafaalhasan96@gmail.com', '01839108819', '$2a$12$wvm9gWORbjd/i9vidV6/wO6LabgNlHyeoDNB5llbc9w0haSrNX3za', 'guest', NULL, '2026-06-04 06:07:27', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-04 06:07:27', '2026-06-04 06:07:27', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(89, 'Global Soft', 'Park', 'globalsoftpark@gmail.com', 'G-1780553822800', '$2a$12$IgeaNu3WF6IUQfqcfVBFzOJwc0ebbRrJQ5CBQkXEw4LyBSnaZQqv6', 'guest', NULL, '2026-06-04 06:17:02', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIXEf8siQbEB9p3DK2sUPkxHMuxpjgXc9y_g6LZgBrudGc6XVWR=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-08-01 05:34:13', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-04 06:17:02', '2026-08-01 05:34:13', NULL, NULL, NULL, 0, NULL, '116147842561859907480', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(90, 'Abid', 'Mahamud', 'abidmahamood88@gmail.com', 'G-1780558011026', '$2a$12$C.VpO/53o0MXOYBTpsM4h.RMWBLdYbNsaMVq1CA9CFUDF77YFmnKq', 'guest', NULL, '2026-06-04 07:26:51', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIk_UZC_HARviaaKDoT_CqWn-H3fLqa6y6ponHcQuhw-1Ndu2fx7A=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-04 07:26:51', '2026-06-04 07:26:51', NULL, NULL, NULL, 0, NULL, '106931770237744037065', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(91, 'Iftakhar', 'Foysal', 'iftakhar.foysal.if@gmail.com', '01810145451', '$2a$12$kZkWHdEl0CbTXTNqqMcfsOzCzDdqxIo39OyQ81VyRGqVhewIXLF1a', 'guest', NULL, '2026-06-04 12:20:23', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-04 12:20:23', '2026-06-04 12:20:23', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(92, 'Muna', 'Azim', 'munaazim999@gmail.com', '01687308285', '$2a$12$f1K2h.RB4MQBpR2Y7VyxrOygfW0LchpZSCQ9ny4JPRxAoXoOyfvt.', 'guest', NULL, '2026-06-04 13:08:33', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-04 13:08:33', '2026-06-04 13:08:33', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(93, 'Wazeer', 'Ali', 'wajedbro@gmail.com', 'G-1780582341828', '$2a$12$NR/v4Shv759fzy7J44DTr.fHaIu/CV07ia79IesRNTALNhPzVQvBS', 'guest', NULL, '2026-06-04 14:12:21', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIdIVL_LMOTKlUbhx5svW0NrIV68Y_q_GW8Wfswq6ihsgzyL7I=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-04 14:12:21', '2026-06-04 14:12:21', NULL, NULL, NULL, 0, NULL, '115322631299831926974', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(94, 'Junayed', 'Rayan', 'junayedrayan4@gmail.com', 'G-1780641377223', '$2a$12$7vEvd1nGxwzOUA4j8v0stu.7oMtO86RQKIxRiGW3.1MitiyuNlG3S', 'guest', NULL, '2026-06-05 06:36:17', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJuJioGHPBXto0repLsLDiXZwzuGH-COlME3pmlawFsdpha1Q=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-05 06:36:17', '2026-06-05 06:36:17', NULL, NULL, NULL, 0, NULL, '112000891631159242783', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(95, 'Bangali', 'Vau', 'bangalivau16@gmail.com', 'G-1780845303432', '$2a$12$kVBgEyz2uzpPh/gEpsahbeh1Vo/1HzWj9bJMNgmMka/0B.yPZLHDu', 'guest', NULL, '2026-06-07 15:15:03', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLBm9cZTPo47LA0V66mulCp_xu3riTcykay8w1clgIe3wxMXRB9=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-07 15:15:03', '2026-06-07 15:15:03', NULL, NULL, NULL, 0, NULL, '101106485972214566616', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(96, 'Kamruddin Ashrafi', 'Nafi', 'realashrafi@gmail.com', '01627977966', '$2a$12$pVosY8XWOWhzoLsmWzQKI.yFjXryVmxK6GW.kdmo7p4dOyRAY9QaG', 'guest', NULL, '2026-06-08 09:33:56', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIP_IjQV1H9i_kXK7hoGSK3GFnbKzzpwx9_OvrW-ll_04Ag-DA=s96-c', '2026-06-08', 'male', '', '', '', '', '', 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-08 09:33:56', '2026-06-08 09:37:38', '', NULL, NULL, 0, NULL, '106588502303206004920', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(97, 'Purple', 'Shade', 'purpleshade824@gmail.com', 'G-1780924120215', '$2a$12$MJ3TSoFZTjeCWXqpk8qN9.Yz4sm.7ynolbiRUafLEIe95/hhoZ5Ym', 'guest', NULL, '2026-06-08 13:08:40', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKxZvbglno3qFFJX4MCmF9RFUc8JO5gvzWHZroGwwbue6cdOQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-08 13:08:40', '2026-06-08 13:08:40', NULL, NULL, NULL, 0, NULL, '100113104783163878781', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(98, 'Sumon', 'Ahmed', 'sumonahmed016sa@gmail.com', 'G-1781085574936', '$2a$12$s4P8JcjWZ26YqHpFzmWXTOlx6zgio18KDipnNPtYEub6GID8zrw/e', 'guest', NULL, '2026-06-10 09:59:34', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIx6OdE09LuhaMXoZhD7QvEBGRTeaXfRFUg7HURuHl4izvqh6w=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-10 09:59:34', '2026-06-10 09:59:34', NULL, NULL, NULL, 0, NULL, '108572892273883594771', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(99, 'Martin', 'Bawm', 'martinbawm0007@gmail.com', 'G-1781593022234', '$2a$12$WeHgXf.Nn40qAoBaBnla4.VnStoCDnkrKv4lfPtBDtTsqSAFNIsBW', 'guest', NULL, '2026-06-16 06:57:02', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLPi8UWuHpo3-bgIiKCjAFaJiXDQxAhnCPUZ--E6HfZ2gK-LNbc=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-16 06:57:02', '2026-06-16 06:57:02', NULL, NULL, NULL, 0, NULL, '107190000098140841048', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(100, 'martinluther', 'bawm', 'martinlutherbawm98@gmail.com', 'G-1781600451623', '$2a$12$tnj.ONvu5Rz07x..mkijCe6oyYTvGkPs5Y67o0v07/0hkOqe6/Cqu', 'guest', NULL, '2026-06-16 09:00:51', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKRiPRYWCKwA66swkePHh2bLmY-FpgtY15G_pXwwPGWDaPojs0=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-16 09:00:51', '2026-06-16 09:00:51', NULL, NULL, NULL, 0, NULL, '118158820975613843131', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(101, 'Atiqur Rahman', 'Bhuiyan', 'arb.cumilla@gmail.com', '01851562688', '$2a$12$esWVlQHhhsmwkKmY0c1LX.JWm01lSZyVKAqHi44b0O2i4UTWyPs5u', 'guest', NULL, '2026-06-16 10:19:18', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-16 10:24:44', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-16 10:19:18', '2026-07-26 10:20:35', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, 'Bangladeshi', '32453', '234234234', '/uploads/documents/hms-nid-1785061235348-1785061235348-886766332.webp', '/uploads/documents/hms-passport-1785061235427-1785061235428-540374878.webp'),
(102, 'Rafeu', 'TPM', 'rafeu.it@gmail.com', 'G-1781686878170', '$2a$12$s0XE9LF02O3CQBa1G6UAte.Ml8k5DqUJYsLmjrUaWf9AS98sFLfHy', 'guest', NULL, '2026-06-17 09:01:18', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIiTemTR6i8ltyRLdbn-7N6K1eKAqB3jyovxeFXgY5zZHxENb43=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-17 09:01:18', '2026-06-17 09:01:18', NULL, NULL, NULL, 0, NULL, '117779783996917851939', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(103, 'jahangir', 'alam', 'jahangir.ovs@gmail.com', 'G-1781695484819', '$2a$12$Rldtp7ZwRFmY6/KtrFxDtuqnm9MOBwBrRXymgkOtJNoxPF5VwkmU.', 'guest', NULL, '2026-06-17 11:24:44', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIJ0U8br4R83Br1UTAZPJfQ305y9SEYe8jZtsoCce4Av5wcF_gitw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-17 11:24:44', '2026-06-17 11:24:44', NULL, NULL, NULL, 0, NULL, '110188464041679333462', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(104, 'rafsan', 'ahmed', 'rafsan002211@gmail.com', 'G-1781709449927', '$2a$12$HHaZT7k.VNWjX8xz2omt4.bkP/9kOV6kmufgplqfHcgnzgErqIK.C', 'guest', NULL, '2026-06-17 15:17:29', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLqz2chgjAIGNzlUNqkV4jdOzsneNexv4P3TdlBNEq7Gf5M5seV=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-17 15:17:29', '2026-06-17 15:17:29', NULL, NULL, NULL, 0, NULL, '103870736652970206215', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(105, 'Sheikh Jaber Al', 'Meezan', 'shkjaber94@gmail.com', 'G-1781786049101', '$2a$12$kOzcz1ExWq0bQ6wYy1zLRuun1CBKEX1iu.NFqDv7iiPcQjJfG9aTy', 'guest', NULL, '2026-06-18 12:34:09', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIYXuKqtBSZh5HA6eR8sCE4HJIUxd6vIIj2xgbZFvhjCg_Zl73q7Q=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-28 09:53:47', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-18 12:34:09', '2026-07-28 09:53:47', NULL, NULL, NULL, 0, NULL, '102907759552331465893', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(106, 'Dejjay', 'Abid', 'dejjayabid66@gmail.com', 'G-1781829484791', '$2a$12$Z3mXZhJvPoEZyn8W4opcM.QbZRI5n2.79zCbLhAeR7RwgNyp1KlFe', 'guest', NULL, '2026-06-19 00:38:04', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK8E2ZyeAToW86AXciiZ9QEviKm2r3ZF8W4C1aWoHLRmFa9fQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-19 00:38:04', '2026-06-19 00:38:04', NULL, NULL, NULL, 0, NULL, '104638995507643452010', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(107, 'Test', 'User', 'testbooking@example.com', '01712345679', '$2a$12$Ixcj2bzKpUsn74k35xIYHuh.i3qZ1Y2DpJDnR8SaaxKJtENHSFabO', 'guest', NULL, '2026-06-20 12:00:48', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-20 12:00:48', '2026-06-20 12:00:48', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(108, 'Mahedi Hamid', 'Abir', 'mahedihamid47@gmail.com', 'G-1782031701124', '$2a$12$g4kMUAbvlMIOpBg2txenuu8S0oFseanqsyxTErWB0r.ScPtTX47K.', 'guest', NULL, '2026-06-21 08:48:21', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIeLRZY9Zixw7jmnSdhvI139Dz9pp88ylq9TWMX0vyZoAkC5xjxzg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-26 10:56:19', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-21 08:48:21', '2026-07-26 10:56:19', NULL, NULL, NULL, 0, NULL, '117124495427751419984', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(109, 'Tarik', 'Ibrahim', 'tarikibrahim777@gmail.com', '+8801674526850', '$2a$12$oQ0ig63jketuzBjBp.hZ8uFAmTNo8RTys8BXBD0y3/w2TXIL..wZq', 'guest', NULL, '2026-06-22 11:01:08', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-22 11:01:08', '2026-06-22 11:01:08', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(110, 'Mr.', 'Sam', 'shahporag220@gmail.com', '01350512141', '$2a$12$oX6EP.pVkIQpe2G468WJ9.Xxyc2MxnbLfCfCTWM.JTWLEf/OvZJfy', 'property_owner', NULL, '2026-06-22 16:46:25', '2026-06-30 10:44:00', 1, NULL, '1995-07-02', 'male', 'H Block Road 2', 'Bashundhara R/A, Dhaka', 'Dhaka', 'Bangladesh ', '1229', 0, NULL, '2026-06-30 03:45:11', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-22 16:46:25', '2026-07-06 04:17:18', 'Hello! I\'m here to give you proper good hospitality. You can make your quality time here without any hesitation. You can Feel FREE & SECURE with us. Thank you 😊🙏', NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(111, 'Sayed', 'Malek', 'm.sayed.malak@gmail.com', '1774307483', '$2a$12$vPvprCO3BcSbYiI/LZ3QduBCevc.NYlEJ8jwDG8essLLoeeLcFnT2', 'guest', NULL, '2026-06-22 18:10:51', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-22 18:10:51', '2026-06-22 18:10:51', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(112, 'Akram', 'Hossain', 'akram.hossain.ah@gmail.com', '01676769095', '$2a$12$9bTEdvSSCh4kO2m9hUfaQe6FZlL8pbO4hO2zDV5R50ASUqBIFdMPe', 'guest', NULL, '2026-06-24 07:53:41', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-24 07:53:41', '2026-06-24 07:53:41', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(113, 'Sadia', 'Haque', 'sadia.haque1817@gmail.com', 'G-1782374940151', '$2a$12$vGynhFdaGfQLrQFiNZGLSOY2bSlNEZXWn5sf3aTaIU5mSE4bXzMwm', 'guest', NULL, '2026-06-25 08:09:00', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIzWsm3SzVkbMtE0tEdrQ1mQLcbqq5dHgjPhFM7AoOAgMqA8OaE=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-25 10:40:54', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-25 08:09:00', '2026-06-25 10:40:54', NULL, NULL, NULL, 0, NULL, '115843536118972079721', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(114, 'Abdullah', 'Al Mahmud', 'abdullahalmahmudsiam@gmail.com', 'G-1782416082394', '$2a$12$XvZs.tvBIEtydSZ6KDWtZu1K7F2GPkGY7qJM/zcy1wyk5OjE4rq0i', 'guest', NULL, '2026-06-25 19:34:42', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKPykp3efKfrv7CkXTvIbWiupMyeeH8ODFeFnbEgSgmxItt76KEDw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-25 19:34:42', '2026-06-25 19:34:42', NULL, NULL, NULL, 0, NULL, '113193982568189676897', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(115, 'Marzuk', 'Ahmed', 'marzukahmed06@gmail.com', 'G-1782468725394', '$2a$12$PceaR7jsB1/dPtGZSn4KdOWrXCcxr7vrhWUDDTr7qNHt6wI56s.mm', 'guest', NULL, '2026-06-26 10:12:05', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJaxunbTBZeVIWYyYavLCP5RS2wxeLN05u32mOFW8gNuvF32xtqHQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-29 03:30:10', 0, NULL, 'en', 'UTC', 1, 0, '2026-06-26 10:12:05', '2026-07-29 03:30:10', NULL, NULL, NULL, 0, NULL, '117052863133189028553', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(116, 'Your', 'Getaway', '21shwag@gmail.com', 'G-1782567948031', '$2a$12$KVr2OCkZWJHZTDi5d.zow.fDIchsdXfGez4PgQTCjJOPMJCHja15W', 'guest', NULL, '2026-06-27 13:45:48', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKjYk95YGeIC4L8aaD-5cCal9Za6zD_C4RzUwzk9XSFp7lr5Q=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-27 13:45:48', '2026-06-27 13:45:48', NULL, NULL, NULL, 0, NULL, '102533678645324344629', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(117, 'Christina Jacklin', 'Costa', 'christinajacklincosta@gmail.com', 'G-1782583731423', '$2a$12$zLNG0TpyABAbTBeaH8Ad2Oh8n0CW84.nPuNz18hK2UubZBned1hva', 'guest', NULL, '2026-06-27 18:08:51', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIwkHxk9r5eqioIEK0m_VsB26xHbmZk7Ag9I4IWgNvXjArcytX-oQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-27 18:08:51', '2026-06-27 18:08:51', NULL, NULL, NULL, 0, NULL, '111127393996866458679', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(118, 'Amirul Islam', 'Rakib', 'rakibalom79@gmail.com', 'G-1782659599327', '$2a$12$.euDe2xj/wl//vQo7pEiMeP/Rxn5c1cOFgs4oDzgVUVrKZzVhJ7Z2', 'guest', NULL, '2026-06-28 15:13:19', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIwQwP77f3yzpsxKyNhgzsp5Zb2JCqT8duIwVN_Z_3EXJERDJA-=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-28 15:13:19', '2026-06-28 15:13:19', NULL, NULL, NULL, 0, NULL, '107357647039844473935', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(119, 'Ashek', 'Mustafiz', 'asd_rah2007@yahoo.com', '01718128450', '$2a$12$f349hhML3nN2LxH3lIbOMeZ9bYYVFFbfPu7XhYQMA5kPA2nKg5Ipa', 'guest', NULL, '2026-06-30 02:35:59', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-30 02:35:59', '2026-06-30 02:35:59', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(120, 'Nishar', 'Rannaghor', 'n.rannaghor@gmail.com', 'G-1782799187583', '$2a$12$FpgxEN62MuJzEEyRC0pqKOglwTuuV7vJEOBIECJE6XFGTmpRjJNgq', 'property_owner', NULL, '2026-06-30 05:59:47', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLTKOHrOLjFxAVz3q47_Jpt2NU2RyLTYWYnnGz9wpkB_bOMka4=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-30 05:59:47', '2026-06-30 06:00:58', NULL, NULL, NULL, 0, NULL, '113611969129610237397', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(121, 'Taniya', 'Akther', 'fdrakib9@gmail.com', '01771934020', '$2a$12$ISTCKXNFH.CTPXxFlGJCTObk7cUusnLWAZ0pG7kRipTwrNO289ojO', 'property_owner', NULL, '2026-06-30 08:35:18', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-30 08:35:18', '2026-06-30 08:37:56', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(122, 'geon', 'ricky', 'geonricky@gmail.com', 'G-1782832626284', '$2a$12$.XDLwR9F/AMRb9xgR8Zt2e5prrk7qYrA.EN/6oAPiaqy4chhztocy', 'property_owner', NULL, '2026-06-30 15:17:06', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKxvYh_sWNz47JzLwKJC8YCHdEEEX35Ko4v6eQp6kZ3s_9km7k=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-06-30 15:17:06', '2026-06-30 15:17:17', NULL, NULL, NULL, 0, NULL, '100964149411915153522', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(123, 'Abdul', 'Hoque', 'abdulhoque949@gmail.com', 'G-1782879020416', '$2a$12$JrxlA7jSUXulm/qwRsUFBelTWxweXP6HIz7Qb01QG9uakWpsmpcP2', 'guest', NULL, '2026-07-01 04:10:20', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIlSyPmrDF4azJBuvn3HUyxjssMHBXdaD7XmHYt-lMjzAf7lA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-01 04:10:20', '2026-07-01 04:10:20', NULL, NULL, NULL, 0, NULL, '101245490553010070149', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(124, 'sherlock', 'holms', 'sherlockholms018@gmail.com', 'G-1782900386858', '$2a$12$NkLHDDh6l4H0zmAfzptGIuuXhRLISX9VcgxWwyjADRKnz4f.OAFTi', 'guest', NULL, '2026-07-01 10:06:26', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIn15bAC0ZwTzSKUkzc5GjbUTfN08HQz4dN4VQRmbJObgXh6w=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-01 10:06:26', '2026-07-01 10:06:26', NULL, NULL, NULL, 0, NULL, '111873589149704159219', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(125, 'K M ABDUL', 'MAZID', 'kmabdulmazid@gmail.com', '+8801911431309', '$2a$12$U9fc5AZ9VQdorWXYfHAKVuLUCpW/hZpvn.QsfK52CDSropIvFvlIG', 'property_owner', NULL, '2026-07-01 11:09:41', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-11 04:41:10', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-01 11:09:41', '2026-07-11 04:41:10', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(126, 'Md', 'Moshadul haque', 'shadafnell@gmail.com', '01712377318', '$2a$12$cqqbleA415Qsahq2nrsRJejROFkwloXQ5Pff74Rl3gQwKZN49O9EG', 'guest', NULL, '2026-07-01 12:24:54', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-01 12:24:54', '2026-07-01 12:24:54', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(127, 'MD RASHEDUL', 'ISLAM', 'rashedulbusiness36@gmail.com', 'G-1782973522016', '$2a$12$OZruFnPFPI2vxk0sNMpwCOhdJeVHkIP.mb2tDerJrcOPbxDDRbwju', 'property_owner', NULL, '2026-07-02 06:25:22', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJBK96ayV1uzUOj7Hemc2u40WMEQLlNGew73u8DlKX1t4Rbvg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-02 06:25:22', '2026-07-02 06:25:38', NULL, NULL, NULL, 0, NULL, '100877380284704890998', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(128, 'Khan A Z M', 'Saifullah', 'saifullahkhanshahjada@gmail.com', '+8801721048923', '$2a$12$e73jSzDIgfjMCMtOsvBHaeLiUGYFqIPxALNYbFDiPu6reWtHqchSu', 'property_owner', NULL, '2026-07-02 06:34:35', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLiTGGS6K4htdKMqZEoGtCbAYF6cSO3vvcGgbIpuc4IGl9wIw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-18 18:47:55', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-02 06:34:35', '2026-07-18 18:47:55', NULL, NULL, NULL, 0, NULL, '107926549700837344668', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(129, 'Md', 'Yasin', 'yasin01339844895@gmail.com', '01339844895', '$2a$12$5WZo9u825JM5t7zdh8E70uN3nTUPjC36DB5AksbAHKaRNMSoodbJW', 'property_owner', NULL, '2026-07-02 10:00:14', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIGVm7a9F-loLMNcoZcte_ur3_-PsXp-1FizRj3Jck_UW1H1A=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 5, '2026-07-10 10:19:28', 'en', 'UTC', 1, 0, '2026-07-02 10:00:14', '2026-07-10 09:49:28', NULL, NULL, NULL, 0, NULL, '100529128115962054939', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(130, 'mir ershad', 'hossain', 'mirershadhhossain1971@gmail.com', 'G-1783003020939', '$2a$12$ScYbrQUJugkpA.hYt3cpdedS7TXsWFOHElJfvtRrLqjXIlRY3IC0y', 'property_owner', NULL, '2026-07-02 14:37:00', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJzu9N-u8jPiOyWv9JJWJqFZqYg9Z65R0ZNYNyO0a_y4AnNFg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-02 14:37:00', '2026-07-02 14:38:13', NULL, NULL, NULL, 0, NULL, '106293204989574246410', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(131, 'Saiful', 'Islam', 'evatravels1965@gmail.com', '01748318100', '$2a$12$joCRD6S3LYEBNsoa4JJ2a.AGUvX/sLfVXbLXalZGJCzzkm2mwynZO', 'property_owner', NULL, '2026-07-03 09:47:06', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-03 09:47:06', '2026-07-03 09:47:06', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(132, 'Rahatul', 'Islam Ridu', 'reservation.wbr@gmail.com', '01885993677', '$2a$12$SWa65QtaUGGVZVRtvnz2F.dE.T8TpncAcgti7aJ3Vr9Q9ycH4PsKO', 'property_owner', NULL, '2026-07-03 10:07:19', '2026-07-03 10:25:32', 1, NULL, '1999-10-15', 'male', 'World Beach Resort, Kolatoli Mor.', 'Cox\'s Bazar', 'Cox’s Bazar ', 'Bangladesh', '4700', 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-03 10:07:19', '2026-07-03 10:30:58', 'Welcome to Your Perfect Coastal Getaway\n​Experience the ultimate blend of comfort, luxury, and warm hospitality at our property. Located just moments away from the world\'s longest natural sandy beach, our hotel is designed to be your serene sanctuary, whether you are traveling for a relaxing family vacation, a romantic escape, or a successful business trip.', NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(133, 'রিতু', 'খানম', 'rituanamul9@e-mail.com', '01778775833', '$2a$12$ku08YonL5rclbRQV56YVIOn9aaidtDL3Mww2N/6.4Mo5gz4apumd6', 'property_owner', NULL, '2026-07-03 12:42:05', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-03 12:42:05', '2026-07-03 12:42:05', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(134, 'ritu', 'anamul', 'rituanamul9@gmail.com', 'G-1783082556451', '$2a$12$mckIqbwGB.wlce16GiMP5.54Fd4qhurHh5WbsP4hTzmWKkRvzIq2u', 'guest', NULL, '2026-07-03 12:42:36', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJHMrA8d5DDAtaTAgApvBNofamllrUqy2C0WRNcUUrb8-Gakw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-03 12:42:36', '2026-07-03 12:42:36', NULL, NULL, NULL, 0, NULL, '101853869226843934793', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(135, 'Saurov', 'Sarker', 'saurov03@gmail.com', '01922321008', '$2a$12$5ERselDO.N/ygk9PqG1efea.xyiNZMcGXtGbx287zLUIfKdtiSeFy', 'property_owner', NULL, '2026-07-03 14:10:09', NULL, 1, NULL, '1993-11-10', 'male', 'Aysha’s Genesis\" located at Plot #44/C, Abdul Hai Road, Zigatola, Dhanmondi, Dhaka-1209.', 'Dhaka', 'Dhaka', 'Bangladesh', '1209', 0, NULL, NULL, 1, NULL, 'en', 'UTC', 1, 0, '2026-07-03 14:10:09', '2026-07-10 18:35:55', 'Hello,this your host Saurov Sarker. Your stay will be safe & security,my first priority. ', NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(136, 'Faraz', 'Rahman', 'farazrahmanworks@gmail.com', 'G-1783098590139', '$2a$12$TEox.vqNrg5q9KxhkeDtSOPvnP0/2nx.auwkPIksFA8JriJg56n1y', 'guest', NULL, '2026-07-03 17:09:50', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJTHzNj0oVwjFpaksPuicMUihGjitU3e9v7GvQYc478Ck0HepFd=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-03 17:09:50', '2026-07-03 17:09:50', NULL, NULL, NULL, 0, NULL, '114436129794539070208', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(137, 'Ahsanul haque', 'Rumi', 'ahsanulhaquerumi9@gmail.com', 'G-1783128446012', '$2a$12$1wtzs8M/Wu3MQs/gGIN3JuOHoNZ.19UK8ObKnSKOs3xJPVd4Qndmq', 'guest', NULL, '2026-07-04 01:27:26', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIxkAGLZccpkEbECZEV-OHhJedXWJVnUXH3dO6bR9una1qM9g=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-04 01:27:26', '2026-07-04 01:27:26', NULL, NULL, NULL, 0, NULL, '103121114002544471429', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(138, 'Sumaiya', 'Manik', 'sumaiyabin12@gmail.com', '01855250840', '$2a$12$MXHjGqlulD4a5ixp25ADxOU0cv9Z6FkoLH3X/ef6J5pzO3Ct5FOq.', 'property_owner', NULL, '2026-07-04 06:16:02', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-04 06:16:02', '2026-07-04 08:01:59', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(139, 'Muhammad Musawwir', 'Gaffar', 'musawwir.legalkey@gmail.com', '+8801679404347', '$2a$12$QbCgojYuIF.RqdDBabvdS.k1OSOdVVi/5g9uSD6ZnViEFW2X43Cwm', 'property_owner', NULL, '2026-07-04 09:32:25', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-04 10:04:35', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-04 09:32:25', '2026-07-04 10:04:35', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(140, 'Rakibul', 'Bashar', 'rakibul.eee.200105160@aust.edu', 'G-1783173981608', '$2a$12$pwkX.8Jq2fbw.uIkpee/pOCaohOEqN9EokhhYR4BkdnrzdWQacSgu', 'guest', NULL, '2026-07-04 14:06:21', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJvMBAM4SO8yESZBVy-KlWV3dRQ5FpoG0dFRLJnmK9Ve3Ze-kol=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-04 14:06:21', '2026-07-04 14:06:21', NULL, NULL, NULL, 0, NULL, '105667737622011639493', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(141, 'Syed', 'S Zanan', 'szsyedshafi@gmail.com', '8801713042194', '$2a$12$0BeMnItyix8TSjQDpATdKu.z93FBA7LQm9nwRVKt1wAGZy0FyGj5.', 'property_owner', NULL, '2026-07-04 14:06:27', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-04 14:06:27', '2026-07-04 14:25:17', NULL, NULL, NULL, 0, NULL, NULL, 0, '263374', '2026-07-04 14:30:17', NULL, NULL, NULL, NULL, NULL),
(142, 'johir', 'emon', 'emonjohir7@gmail.com', 'G-1783238430831', '$2a$12$WB56tUZpuU.2uEc0OhEVE.CCZP7HDGIAaHC6MFyy7QnqHzeT2hCZS', 'guest', NULL, '2026-07-05 08:00:30', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJ8IDNXMmOqralUikIDIuLLRHHpu57zMfyn2oqqVwKgj6vvuZc=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-05 08:00:30', '2026-07-05 08:00:30', NULL, NULL, NULL, 0, NULL, '103857077093151833069', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(143, 'ENTREPRENEURS', 'User', 'worldwidetrade18@gmail.com', 'G-1783254314336', '$2a$12$VTKeJfuGSECE0g3MWpiVxO6VGG1pcCsvyRS/CrCX7Sr8ZxUuHyrsu', 'property_owner', NULL, '2026-07-05 12:25:14', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJcmfgQo4yQ_JHGbRgLg65xO16jMT5Zelh7OLso_jyMka7ASg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-05 12:25:14', '2026-07-05 12:25:24', NULL, NULL, NULL, 0, NULL, '107651806203818273303', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(144, 'Mahmudul', 'Hasan', 'rifad617670@gmail.com', 'G-1783308526811', '$2a$12$FAGZhMHcLh98ZtbyYcb95.ZtcSVwhW8ZEHQKK2FJqs/2V7czoXMnK', 'guest', NULL, '2026-07-06 03:28:46', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIBT7j3dyf81x7NmaQEowbJHiBSen_batWbXVfD9sh73q5kog=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-06 03:28:46', '2026-07-06 03:28:46', NULL, NULL, NULL, 0, NULL, '103476763468394918812', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(145, 'Md', 'Ovi', 'videodownload004@gmail.com', '01972631958', '$2a$12$onaDBmRu9aAHo4mK6q0nYukZEChh1Pfav4XHigVUNhf2Rb4MFsxKW', 'property_owner', NULL, '2026-07-06 04:07:15', NULL, 1, NULL, NULL, 'male', '', '', '', '', '', 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-06 04:07:15', '2026-07-06 04:09:16', '', NULL, NULL, 0, NULL, NULL, 0, '153408', '2026-07-06 04:13:36', NULL, NULL, NULL, NULL, NULL),
(146, 'mijanur', 'rahman', 'mijanurrahman504@gmail.com', 'G-1783324471138', '$2a$12$DcuH5nISRNji47bk1NYkqenDXtlZJkB.3ZWS5UH6kb.5.TzOlW6D.', 'guest', NULL, '2026-07-06 07:54:31', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIzzatY6RLjRWw-NNwLcZcMzbHGhzzfVCafLAGxzGN6DcMeZISh=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-23 10:14:23', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-06 07:54:31', '2026-07-23 10:14:23', NULL, NULL, NULL, 0, NULL, '100761041487043522936', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `user_type`, `host_id`, `email_verified_at`, `phone_verified_at`, `is_active`, `profile_image`, `date_of_birth`, `gender`, `address`, `city`, `state`, `country`, `postal_code`, `two_factor_enabled`, `two_factor_secret`, `last_login_at`, `login_attempts`, `locked_until`, `language`, `timezone`, `email_notifications`, `sms_notifications`, `created_at`, `updated_at`, `bio`, `work`, `school`, `is_superhost`, `languages`, `google_id`, `auto_accept_bookings`, `phone_verification_otp`, `phone_verification_expires_at`, `nationality`, `nid_number`, `passport_number`, `nid_document_url`, `passport_document_url`) VALUES
(147, 'Atiqur Rahman', 'Bhuiyan', 'atiqur.earn@gmail.com', 'G-1783326605578', '$2a$12$3qKPWzEUkfEbClqIh7JdM.xdZmlTP.KQ6orA8.hzhE48qBJDKiY2e', 'guest', NULL, '2026-07-06 08:30:05', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocL77C6kw4eFWshWcKaRyeUoF91iig-bH-Uj2OETfFGqQiD7JA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-30 10:25:22', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-06 08:30:05', '2026-07-30 10:25:22', NULL, NULL, NULL, 0, NULL, '106485540244147034715', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(148, 'Afnanul', 'Hassan', 'hassanafnanul@gmail.com', 'G-1783356902428', '$2a$12$4/tzDf.5JAn/xlEY9ky3I.QZ1ZNUsV3Zb48c74xO70T744cnJzXcW', 'property_owner', NULL, '2026-07-06 16:55:02', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK-oXUduersx2KXwz87VFrdsx9OMmbUqhFFU2dYrRifHTwrhB0=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-06 16:55:02', '2026-07-06 16:55:27', NULL, NULL, NULL, 0, NULL, '103821800238271560651', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(149, 'Mohammad ali ahsan', 'Khan', '9fn9gwestkhulshiflat@gmail.com', '+8801711746707', '$2a$12$a8lHbrTCscOpkFWhhXJr/OoaUiKSz5nvJ1jDCzcAq3Y1lsKfS.ecC', 'property_owner', NULL, '2026-07-07 07:56:43', NULL, 1, NULL, '1965-08-07', 'male', '136/D,BADC Road, West Khulshi', 'Chattogram', 'Chattogram', 'Bangladesh', '4202', 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-07 07:56:43', '2026-07-11 10:21:28', '', NULL, NULL, 0, NULL, NULL, 1, '473203', '2026-07-11 10:24:33', NULL, NULL, NULL, NULL, NULL),
(150, 'Life is a', 'Journey', 'hellolifeisajourney@gmail.com', 'G-1783589786566', '$2a$12$utsLfJF1Wr4jp2WR5qoGKOO4CczKJIWhFUFZpqf39IocKeeeLsViS', 'property_owner', NULL, '2026-07-09 09:36:26', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJuy_7ZJrdTTUy6jVJzqjHI_KT5rW4PcDO9ra98d-6F-n3Qznk=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-09 09:36:26', '2026-07-09 09:36:37', NULL, NULL, NULL, 0, NULL, '106601612287269797238', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(151, 'Habiba', 'Shahadat', 'habiba.shahadat@sslcommerz.com', 'G-1783837518471', '$2a$12$syffQQjl2zqafHCNgT4CyuGusCWfvpY6ReSfduzJQ.2idIbB9FP/i', 'guest', NULL, '2026-07-12 06:25:18', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIrxzTLWpq-63wK0rQfzXclxj4FzLTDOA9mItoPe3b5IieZ1w=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-12 06:25:18', '2026-07-12 06:25:18', NULL, NULL, NULL, 0, NULL, '100649097374257512413', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(152, 'Achiya', 'Akter', 'achiyaakter98765@gmail.com', 'G-1783855436421', '$2a$12$OWBKzWAZ3s76kplZaCKsQ.NxS0YMPuGl.qIX5PQJHVNjtB31oeZcG', 'property_owner', NULL, '2026-07-12 11:23:56', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLhr7edPhBs_SImKIXInRCuTshiGazAZuduYHvyODKRH_fjZg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-12 11:23:56', '2026-07-12 11:24:03', NULL, NULL, NULL, 0, NULL, '114878610823453070387', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(153, 'Haven Planners Online', 'User', 'havenplannersonline@gmail.com', 'G-1783873986949', '$2a$12$ieoEl48fROsLYJsEEIihi.FHZeVNHFqork/04gkfCCNADcN.4npcC', 'property_owner', NULL, '2026-07-12 16:33:06', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocI8pJoJ9rkunoUTfhIqjU96A2ro3GU6MtMOLnsNebfrazXIg8o=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:44:57', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-12 16:33:06', '2026-07-13 05:44:57', NULL, NULL, NULL, 0, NULL, '105715948059060766012', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(154, 'Email', 'Number', 'emailnumber726@gmail.com', 'G-1783939343460', '$2a$12$Oxb4QUTSZcXkCrHsfD/X8eYgbSjO3tG8N5ZT1JQrA18fKlf2QXlPi', 'guest', NULL, '2026-07-13 10:42:23', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJ-nRhfNDHCGV8sZTkoJ1MelEWxvwFGmW_vZBPigUWzy_XeXQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-13 10:42:23', '2026-07-13 10:42:23', NULL, NULL, NULL, 0, NULL, '108316656230568139071', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(155, 'NAZ', 'ARNOB', 'nazs.arnob@hotmail.com', '01782078353', '$2a$12$UyKxhkS9nXRZAWD2PzDdJuM/Ao8Q4G5Gff4xYHoqpEsHG8ExumyFC', 'property_owner', NULL, '2026-07-15 12:13:47', NULL, 1, NULL, '1999-06-27', 'male', 'Dhanmondi 15, Road 8a', 'Dhaka', 'Dhaka Division', 'Bangladesh', '1209', 0, NULL, '2026-07-25 01:46:05', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-15 12:13:47', '2026-07-25 01:46:05', 'Hi, this is Naz. I hope you enjoy your stay!', NULL, NULL, 0, NULL, NULL, 0, '111211', '2026-07-19 18:29:28', NULL, NULL, NULL, NULL, NULL),
(156, 'Murshalin', 'Khan', 'khanmurshalin6@gmail.com', 'G-1784209721278', '$2a$12$wu2k9Y/9yhzUYPDn8tgV5ucI4ed4fj9NDkDh.RYURLhnSkvC/skRG', 'guest', NULL, '2026-07-16 13:48:41', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKkS1HBJXWePbAIKqyd-8vDCcOnkEH1oNdS-GjnbmuDH2sh0q_o=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-07-28 10:09:42', 0, NULL, 'en', 'UTC', 1, 0, '2026-07-16 13:48:41', '2026-07-28 10:09:42', NULL, NULL, NULL, 0, NULL, '103558092041657090536', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(157, 'Mohammad', 'Shams', 'mohdshamskhan02@gmail.com', '019 9939 1626', '$2a$12$fGa.6hs/pDIdvLP/6h0WtuPaTqtVb0jklmNC7Jq6YXJ4cKgl94SoO', 'guest', NULL, '2026-07-16 23:42:25', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-16 23:42:25', '2026-07-16 23:42:25', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(158, 'New', 'Phone', 'new105475@gmail.com', 'G-1784311101899', '$2a$12$4el9ymfhdjUEjRhvFpsK8uOfbWSHDvlmPz/szRy6Zet9X6hIaG5bS', 'guest', NULL, '2026-07-17 17:58:21', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK7g-bFL42QuKdS8UaenPzLCZu9ch7VAcYumuAKxJnlsGwdJA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-17 17:58:21', '2026-07-17 17:58:21', NULL, NULL, NULL, 0, NULL, '117884268113208943057', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(159, 'towheed', 'hossain', 'towheed.hossain@gmail.com', 'G-1784356034826', '$2a$12$e2x4Y92a2Vab.v3D4i2aq.GAleTBMwBK1ywnam607B0WsKe8moKtS', 'guest', NULL, '2026-07-18 06:27:14', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJbnKFte1l6_nbQYb1G2FKUZwuaADWJ86JorVQUBowGmIga6i0=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-18 06:27:14', '2026-07-18 06:27:14', NULL, NULL, NULL, 0, NULL, '108375551635776035942', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(160, 'Pran', 'Rahman', 'pranrahman96@gmail.com', 'G-1784393153026', '$2a$12$S3Dmymto/uxLPcSe6eyJveIs4fu6Xoozl9iV4vCX1SKeWChuIvWOu', 'guest', NULL, '2026-07-18 16:45:53', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIBGhwyfuCFIyoLGntv9XY37asVQRr4qUXV0uAvWGOJUI1UGmDZ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-18 16:45:53', '2026-07-18 16:45:53', NULL, NULL, NULL, 0, NULL, '102240451949859888222', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(161, 'Masud', 'Rana', 'mranaasha@gmail.com', 'G-1784397401292', '$2a$12$YKeb8SD07EAK3Q30Gg5PRua4nzV4PzN1xA.ZSZ23y2k3r.SNdwJq2', 'guest', NULL, '2026-07-18 17:56:41', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJWbWHvRILTCGil5F4olXgUpFv410JDwiTDewVCVAb66oENtZrO=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-18 17:56:41', '2026-07-18 17:56:41', NULL, NULL, NULL, 0, NULL, '110716949610417724858', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(162, 'Md', 'Khan', 'md4612122@gmail.com', 'G-1784467166411', '$2a$12$.2K51FRb5MdkfNAT3l6kcueFYNSLJLfMia6NVFG4ACRQt4a0M/fkO', 'guest', NULL, '2026-07-19 13:19:26', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKCLAAk2wusxUBinGMTeAo7qCOmpeX9Jz-v9A_tXB2bv6V6zg=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-19 13:19:26', '2026-07-19 13:19:26', NULL, NULL, NULL, 0, NULL, '104943538356434042767', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(163, 'Shahoriar', 'Sourab', 'shahoriarsourab@gmail.com', '01893140989', '$2a$12$dN5TDLi2Zz28duclmwgeAekVecFHqESXZtnSpfP.CWTbx7xC5YLti', 'property_owner', NULL, '2026-07-20 14:49:02', '2026-07-20 15:03:52', 1, 'https://lh3.googleusercontent.com/a/ACg8ocIR09ETXpOegdS-lc8bV85jZppmkcN-hAwbbmKSj2rFaqu8du2x=s96-c', '2026-07-13', 'male', 'basundhara R/A ,block-H,Road no-4', 'dhaka', 'dhaka', 'bangladesh', '1218', 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-20 14:49:02', '2026-07-20 15:04:02', '100% safe and couple friendly rooms', NULL, NULL, 0, NULL, '103354598541711032767', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(164, 'RAZ', 'KHAN', 'rkeesg8@gmail.com', 'G-1784708293416', '$2a$12$T46hJVU7vCY5az8/iqOss.xPufpDBWZv3xvuAx80PGDemGZ6kP5GG', 'guest', NULL, '2026-07-22 08:18:13', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLnWlvUMsY_JRRgC1e5KsiG8aUBchd_botKp5aOijAsFMpCxQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-22 08:18:13', '2026-07-22 08:18:13', NULL, NULL, NULL, 0, NULL, '114674420628629808998', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(165, 'SHEIKH', 'FARID', 'sheikhfarid282@gmail.com', 'G-1784726899708', '$2a$12$X92EqKMAOV9RxdXu7ng78eKHDuo3hw6tGgH9iL0cYNJppftMRio16', 'guest', NULL, '2026-07-22 13:28:19', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJ-0tlDVfw3NMcmwCV5-Cz8Il8rQ5Lxa4jyT2N9eaPJIY3Dw0Ak=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-22 13:28:19', '2026-07-22 13:28:19', NULL, NULL, NULL, 0, NULL, '110014502956010261652', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(166, 'Pku', 'Flix', 'pkuflix23@gmail.com', 'G-1784780934022', '$2a$12$Ld/nQbBzoI1ZiHMF3qwA0e.lrHqqbIOxm4iqd8D7OUc3KvUKsl3pK', 'guest', NULL, '2026-07-23 04:28:54', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIt3-cGWenY6qkAfnKY_y03qtjHk-Z75Qmp_iKIZxJGx_BpnOo=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-23 04:28:54', '2026-07-23 04:28:54', NULL, NULL, NULL, 0, NULL, '109500928919226231714', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(167, 'Daiyan', 'Khan', 'khandaiyan25@gmail.com', 'G-1784965448759', '$2a$12$NVJg3wFJ7HvuLhoDksLjUuKie9THKVWqLVCfEL4yT3NOU.6Vw01JC', 'guest', NULL, '2026-07-25 07:44:08', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIEEJr9_XaswPWJuOzj2NtgC50gKeH70yopTz-R9Mn5CLttWcbO=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-25 07:44:08', '2026-07-25 07:44:08', NULL, NULL, NULL, 0, NULL, '115617407360539083904', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(168, 'ZARIN TASNIM', 'MIHIKA', 'zarintasnimmihika@gmail.com', 'G-1784996704212', '$2a$12$DbtiDdALcz/HwhFU8d5S0u.sKd18ZR3a/g4AP1YjrFICdyKC4nONu', 'guest', NULL, '2026-07-25 16:25:04', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocIvXJ3vFpRSZIhRRjhaDgfe7Qa0EHwBAEpnbRbTmV8qmwrGU9w=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-25 16:25:04', '2026-07-25 16:25:04', NULL, NULL, NULL, 0, NULL, '112410866534316481789', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(169, 'SHAHANAWAZ', 'KABIR', 'shahanawazkabir@gmail.com', '01811905129', '$2a$12$u.U1dN9GP4qA5HmUKGbE..XGKrmxnX5FO0aSUoYdQGmxZdzZvVHw6', 'guest', NULL, '2026-07-26 14:08:20', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-26 14:08:20', '2026-07-28 06:17:07', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '/uploads/documents/hms-nid-1785219426978-1785219426978-746792775.webp', NULL),
(170, 'Hemento', 'Sufi', 'hementosufi@gmail.com', 'G-1785091591054', '$2a$12$0FykzxIWmy8IwxcqArEI5eSHxFa5vqV31yA4Pki5OYPHg4GZMqew6', 'guest', NULL, '2026-07-26 18:46:31', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocKcYrcgY3ZhLRqreMZ25Llo0Uj9lKl6KCm9sC3UoGa7l7kxh8jx=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-26 18:46:31', '2026-07-26 18:46:31', NULL, NULL, NULL, 0, NULL, '103539933957060474482', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(171, 'Sabit', 'Mahmud', 'sabitmahmud1995@gmail.com', 'G-1785171014237', '$2a$12$fF8INro1PG1oaXpPX8Y/1.C7OKEX/WRu5CUi4a82kQLrzs4xpL3vW', 'guest', NULL, '2026-07-27 16:50:14', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJeEs0urmPpywD86HA8Gzxnbu7Y9r_N17S9bm08zHjcspvlnA=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-27 16:50:14', '2026-07-27 16:50:14', NULL, NULL, NULL, 0, NULL, '117842694228260959856', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(172, 'Aloy', 'Chowdhury', 'aloychowdhury084@gmail.com', 'G-1785317719080', '$2a$12$YON22vmhwQ.hUgKXoGvWw.aJ9Us7176n2vvYyGWdId2biuGV4ZOOm', 'guest', NULL, '2026-07-29 09:35:19', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLVEZLBuXjxqKUzTdvU2r2glU26eqy-mQgMTne29kzmaOmpBw=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-29 09:35:19', '2026-07-29 09:35:19', NULL, NULL, NULL, 0, NULL, '113198898029469991452', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(173, 'Adibur', 'Rahman', 'adibrhmn3452@gmail.com', 'G-1785340752315', '$2a$12$RfjM0sHw7pxF3u0yhxCX6.mTLJimtIsqVfq0sLLg8/SMkzJgF/c66', 'guest', NULL, '2026-07-29 15:59:12', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLcqzMGWcAdyxO6ZMklkNGBC6vw_ToLOPZVq18TsGfq225Y-A=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-29 15:59:12', '2026-07-29 15:59:12', NULL, NULL, NULL, 0, NULL, '103464615810765072781', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(174, 'Info', '.', 'info@keyhost24.com', 'G-1785406440531', '$2a$12$bzhfngLkw1X2cy9Ir5uBDe9JYeNmGGoH9HFgWZQKLjJSl.ESOWIfG', 'guest', NULL, '2026-07-30 10:14:00', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocK3WPFfNL3WeUUObpz8d3yAyo_0JVJQgN9eNS8_oLxKweDPMQ=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-30 10:14:00', '2026-07-30 10:14:00', NULL, NULL, NULL, 0, NULL, '118169943049086648846', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(175, 'MD', 'A.Hossain', 'ma3222340@gmail.com', 'G-1785479967013', '$2a$12$ECEFBHEhULDHVc5HuGTmNOlgDx/7zcbYa6y7CpwDoKPr/O7OTa2fK', 'guest', NULL, '2026-07-31 06:39:27', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocLmN0-AvHFBrLG8HciCTl3OJHPcRoiSsay4KaQh5ERdgyHrn-c=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-31 06:39:27', '2026-07-31 06:39:27', NULL, NULL, NULL, 0, NULL, '114562987844278911094', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(176, 'Md.', 'Rahman', 'mizan3012@gmail.com', '01715001349', '$2a$12$fnoYHMH75X8On6Ae.9i0.eyFYsF3.9EPm6XyHuCNYOyCHOBARFXju', 'property_owner', NULL, '2026-07-31 10:14:56', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-31 10:14:56', '2026-07-31 10:14:56', NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(177, 'Shujat', 'User', 'shujat.qasim@gmail.com', 'G-1785506737986', '$2a$12$.2fMhEXkJ1unehJyHx/q/.aGL3jAWk0E0smMbV3BSjAQ7pdNzkLoG', 'guest', NULL, '2026-07-31 14:05:37', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocJU_72J5cTBtwSNQwNAYTTKySpZBilLvx8GFZEnfE4Kp7_EOdmL=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-31 14:05:37', '2026-07-31 14:05:37', NULL, NULL, NULL, 0, NULL, '115246448360488133137', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(178, 'Shujat', 'Kasim', 'rtc.shujat@gmail.com', 'G-1785506788802', '$2a$12$.JgwNGvJkUil8Ggp6xTJW.6cr7yORX/PzWnvHGCSB637IoPUaa73y', 'property_owner', NULL, '2026-07-31 14:06:28', NULL, 1, 'https://lh3.googleusercontent.com/a/ACg8ocItPFKrn0FhHCMQbjQB66mzR6CUpJxaP-c23wZYeIdkh7hdGVvK=s96-c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 'en', 'UTC', 1, 0, '2026-07-31 14:06:28', '2026-07-31 14:06:41', NULL, NULL, NULL, 0, NULL, '106245715641701925451', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

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

--
-- Dumping data for table `user_blocks`
--

INSERT INTO `user_blocks` (`id`, `blocked_user_id`, `blocked_by`, `block_type`, `reason`, `description`, `block_duration`, `block_scope`, `status`, `blocked_at`, `expires_at`, `revoked_at`, `revoked_by`, `created_at`, `updated_at`) VALUES
(11, 81, 1, 'permanent', 'Blocked by admin', NULL, NULL, 'all', 'active', '2026-06-24 02:51:46', NULL, NULL, NULL, '2026-06-24 02:51:46', '2026-06-24 02:51:46');

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
(33, 68, 98, 98, 0, 1, '2026-06-05 10:01:05', '2026-05-17 10:21:20'),
(34, 69, 25, 25, 0, 1, '2026-06-27 05:25:37', '2026-05-17 10:36:22'),
(35, 71, 25, 25, 0, 1, '2026-05-17 19:43:11', '2026-05-17 19:41:27'),
(36, 52, 0, 0, 0, 1, '2026-05-18 05:28:13', '2026-05-18 05:28:13'),
(37, 56, 0, 0, 0, 1, '2026-05-19 09:27:56', '2026-05-19 09:27:56'),
(38, 75, 0, 0, 0, 1, '2026-05-23 05:28:33', '2026-05-23 05:28:33'),
(39, 50, 0, 0, 0, 1, '2026-05-23 08:13:06', '2026-05-23 08:13:06'),
(40, 77, 25, 25, 0, 1, '2026-05-24 05:10:27', '2026-05-23 19:32:48'),
(41, 59, 0, 0, 0, 1, '2026-05-24 01:43:17', '2026-05-24 01:43:17'),
(42, 80, 20, 20, 0, 1, '2026-05-26 06:44:31', '2026-05-25 19:10:19'),
(43, 83, 0, 0, 0, 1, '2026-06-01 10:34:56', '2026-06-01 10:34:56'),
(44, 85, 0, 0, 0, 1, '2026-06-02 20:55:41', '2026-06-02 20:55:41'),
(45, 88, 0, 0, 0, 1, '2026-06-04 06:09:27', '2026-06-04 06:09:27'),
(46, 91, 0, 0, 0, 1, '2026-06-04 12:29:17', '2026-06-04 12:29:17'),
(47, 92, 0, 0, 0, 1, '2026-06-04 13:08:48', '2026-06-04 13:08:48'),
(48, 93, 0, 0, 0, 1, '2026-06-04 14:12:53', '2026-06-04 14:12:53'),
(49, 89, 0, 0, 0, 1, '2026-06-04 14:31:38', '2026-06-04 14:31:38'),
(50, 94, 0, 0, 0, 1, '2026-06-05 06:41:17', '2026-06-05 06:41:17'),
(51, 97, 25, 25, 0, 1, '2026-06-08 13:12:52', '2026-06-08 13:10:01'),
(52, 99, 0, 0, 0, 1, '2026-06-16 07:29:21', '2026-06-16 07:29:21'),
(53, 100, 25, 25, 0, 1, '2026-06-16 09:04:02', '2026-06-16 09:01:56'),
(54, 102, 25, 25, 0, 1, '2026-06-17 09:05:30', '2026-06-17 09:02:14'),
(55, 105, 75, 75, 0, 1, '2026-06-22 11:31:56', '2026-06-18 12:36:31'),
(56, 107, 0, 0, 0, 1, '2026-06-20 12:01:38', '2026-06-20 12:01:38'),
(57, 109, 0, 0, 0, 1, '2026-06-22 11:02:22', '2026-06-22 11:02:22'),
(58, 111, 90, 90, 0, 1, '2026-06-22 18:21:49', '2026-06-22 18:14:31'),
(59, 113, 25, 25, 0, 1, '2026-06-25 08:13:10', '2026-06-25 08:09:25'),
(60, 115, 25, 25, 0, 1, '2026-06-26 10:16:24', '2026-06-26 10:12:30'),
(61, 119, 0, 0, 0, 1, '2026-06-30 02:36:33', '2026-06-30 02:36:33'),
(62, 123, 0, 0, 0, 1, '2026-07-01 04:11:39', '2026-07-01 04:11:39'),
(63, 126, 0, 0, 0, 1, '2026-07-01 12:31:11', '2026-07-01 12:31:11'),
(64, 136, 25, 25, 0, 1, '2026-07-03 17:11:21', '2026-07-03 17:10:00'),
(65, 140, 0, 0, 0, 1, '2026-07-04 14:06:46', '2026-07-04 14:06:46'),
(66, 146, 50, 50, 0, 1, '2026-07-21 06:48:20', '2026-07-06 07:55:01'),
(67, 154, 35, 35, 0, 1, '2026-07-13 10:47:52', '2026-07-13 10:44:03'),
(68, 157, 0, 0, 0, 1, '2026-07-16 23:43:01', '2026-07-16 23:43:01'),
(69, 158, 0, 0, 0, 1, '2026-07-17 17:58:41', '2026-07-17 17:58:41'),
(70, 159, 35, 35, 0, 1, '2026-07-18 06:36:58', '2026-07-18 06:34:15'),
(71, 160, 35, 35, 0, 1, '2026-07-18 16:49:34', '2026-07-18 16:46:25'),
(72, 165, 0, 0, 0, 1, '2026-07-22 13:32:49', '2026-07-22 13:32:49'),
(73, 167, 0, 0, 0, 1, '2026-07-25 07:45:42', '2026-07-25 07:45:42'),
(74, 168, 35, 35, 0, 1, '2026-07-26 05:39:48', '2026-07-26 05:37:45'),
(75, 169, 70, 70, 0, 1, '2026-07-28 07:04:58', '2026-07-26 14:08:34'),
(76, 170, 0, 0, 0, 1, '2026-07-26 18:48:03', '2026-07-26 18:48:03'),
(77, 173, 0, 0, 0, 1, '2026-07-29 16:02:25', '2026-07-29 16:02:25'),
(78, 147, 0, 0, 0, 1, '2026-07-30 10:26:41', '2026-07-30 10:26:41');

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
(53, 68, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY4LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNjUzNTIxLCJleHAiOjE3ODEyNTgzMjF9.q7Viyg4iV-RYJOEI79C_O17vXgNwOGfI2Sbu-dDdUGI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY4LCJpYXQiOjE3ODA2NTM1MjEsImV4cCI6MTc4MzI0NTUyMX0.5-hySDrbrdSKBShwPGP2SK5gTYdLOr9memC77YTJdQ0', NULL, NULL, NULL, 1, '2026-07-05 09:58:41', '2026-05-17 10:20:52', '2026-06-05 09:58:41'),
(54, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDEzODcxLCJleHAiOjE3Nzk2MTg2NzF9.4qNT2JwMqhOX8JDDUNOiRiL0NUtY6daBqFf-N_EY3n8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwMTM4NzEsImV4cCI6MTc4MTYwNTg3MX0.tLVAVYcps0-8tH2JZrf_lOttEmFxlx0mUJwPYqPoFmw', NULL, NULL, NULL, 0, '2026-05-21 08:41:27', '2026-05-17 10:31:11', '2026-05-21 08:41:27'),
(55, 69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgyNTM3MjY0LCJleHAiOjE3ODMxNDIwNjR9.CeNW-kdig9CHe2sQaScXSrLqz4ZSSrXqn0PpQ1UeoFY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJpYXQiOjE3ODI1MzcyNjQsImV4cCI6MTc4NTEyOTI2NH0.KZTNjgTBRJDo0ZvyVZQlE-HMSxWUItKHqPs14wKL8bI', NULL, NULL, NULL, 1, '2026-07-27 05:14:24', '2026-05-17 10:35:36', '2026-06-27 05:14:24'),
(56, 70, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDIyMTA4LCJleHAiOjE3Nzk2MjY5MDh9.FenRZ8VsfA2JH7ba87vE2rJE-OhavoKhzbAfnXeOpQI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcwLCJpYXQiOjE3NzkwMjIxMDgsImV4cCI6MTc4MTYxNDEwOH0.7_i9ObXV-cOnuiQaVDt--aYVFjnY_vjCXn7I9ACUKbE', NULL, NULL, NULL, 1, '2026-06-16 12:48:28', '2026-05-17 12:48:28', '2026-05-17 12:48:28'),
(57, 71, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcxLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNjI5MjQ4LCJleHAiOjE3ODEyMzQwNDh9.-gAD7SSMaE1Raqu258VsZyapClkli3Ton1vLu_Btqtc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcxLCJpYXQiOjE3ODA2MjkyNDgsImV4cCI6MTc4MzIyMTI0OH0.RP-C2SC5mUvZRhiMWLdMM2DWay8WPooG2KwlQuwwUls', NULL, NULL, NULL, 1, '2026-07-05 03:14:08', '2026-05-17 19:31:48', '2026-06-05 03:14:08'),
(58, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkwNjM0MzQsImV4cCI6MTc3OTY2ODIzNH0.4CM7txVJJ9YrCAPZ7QYeEWZSHVFRE2onNUKp47MboDE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTA2MzQzNCwiZXhwIjoxNzgxNjU1NDM0fQ.VmmVJ63w1HT-zlWRpuVkyGStI5ao47ikK2PJe9ZPuoA', NULL, NULL, NULL, 0, '2026-05-18 00:39:04', '2026-05-18 00:17:14', '2026-05-18 00:39:04'),
(59, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5Nzg5MDE1LCJleHAiOjE3ODAzOTM4MTV9.gxpgXnu7LWSj1FUog0zC4esi4rMey0GJdCZdu8Z4t74', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk3ODkwMTUsImV4cCI6MTc4MjM4MTAxNX0.6WGUeME4GxiBiEqH2ee8yPY4Z9ty_nwEki1f212oTJo', NULL, NULL, NULL, 1, '2026-06-25 09:50:15', '2026-05-18 00:39:11', '2026-05-26 09:50:15'),
(60, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MDgwMTU5LCJleHAiOjE3Nzk2ODQ5NTl9.-ElwNRYhA-vAk36AVjUmTY2erA8jSNbvCsBO7P0K2X4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkwODAxNTksImV4cCI6MTc4MTY3MjE1OX0.JdY2NAJRrH6_uZXuJD7mZIQsHURBEdnVkalFotDhdpY', NULL, NULL, NULL, 0, '2026-05-18 13:52:13', '2026-05-18 04:55:59', '2026-05-18 13:52:13'),
(61, 72, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcyLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MDgzNzE2LCJleHAiOjE3Nzk2ODg1MTZ9.2SJ4OxZKwAhQxamAYaC9wC2jLeB2HwNl_crIRijyA8I', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcyLCJpYXQiOjE3NzkwODM3MTYsImV4cCI6MTc4MTY3NTcxNn0.H9rhhKjs4WRU1VW6xF1mzM00JPASlzp6vjR6BTvvFjI', NULL, NULL, NULL, 1, '2026-06-17 05:55:16', '2026-05-18 05:55:16', '2026-05-18 05:55:16'),
(62, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MTEyMzQxLCJleHAiOjE3Nzk3MTcxNDF9.X2zymj1Tp0ULNjVnJusCwAxRKFjh8nPtcWkL8mQJmbk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkxMTIzNDEsImV4cCI6MTc4MTcwNDM0MX0.Z-pWDLhlDUSNCkU5fhyDLtjEWxLf-KG2WUHinANzPmo', NULL, NULL, NULL, 0, '2026-05-18 13:54:45', '2026-05-18 13:52:21', '2026-05-18 13:54:45'),
(63, 56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MTgyODYwLCJleHAiOjE3Nzk3ODc2NjB9.g2R8By-wciABWAFp2yHF9bdNuW9kr1xDMo3iwQjQf0A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJpYXQiOjE3NzkxODI4NjAsImV4cCI6MTc4MTc3NDg2MH0.Rf1fQkZoqMrXoRjbBDVwvfXzp6ov5f7LnHd6LxK_74g', NULL, NULL, NULL, 0, '2026-05-19 09:38:07', '2026-05-19 09:27:40', '2026-05-19 09:38:07'),
(64, 56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MTgzNTE1LCJleHAiOjE3Nzk3ODgzMTV9._2_0W7vqZ7DQtoi69H9FM_z4hqS6SCYzSyX4gSw6EvU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJpYXQiOjE3NzkxODM1MTUsImV4cCI6MTc4MTc3NTUxNX0.yv0NXYj4a-0ju1EXwdqlp611x2laUgxsyDCyPE1htOM', NULL, NULL, NULL, 1, '2026-06-18 09:38:35', '2026-05-19 09:38:35', '2026-05-19 09:38:35'),
(65, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MjU0MjA1LCJleHAiOjE3Nzk4NTkwMDV9.HPzIkeLcGW-yllPpMc5Wz7Y61UznkqNEpw969Y7xh2c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkyNTQyMDUsImV4cCI6MTc4MTg0NjIwNX0.UYmiahQ4sEfADpMGlUtrHcPc9DF1diLtwOhLHKqz4fc', NULL, NULL, NULL, 0, '2026-05-20 10:52:11', '2026-05-20 05:16:45', '2026-05-20 10:52:11'),
(66, 73, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjczLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MjcxNTc0LCJleHAiOjE3Nzk4NzYzNzR9.qtnLQ3HFs5cetEh0qsxsdSvyqkCeYx6rhLJKbtapKqg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjczLCJpYXQiOjE3NzkyNzE1NzQsImV4cCI6MTc4MTg2MzU3NH0.DK4NKx08Bo07JtJDW1bz0fzKAAgjuMLX1_jLbHDDjLQ', NULL, NULL, NULL, 1, '2026-06-19 10:06:14', '2026-05-20 10:06:14', '2026-05-20 10:06:14'),
(67, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5Mjc0MzM5LCJleHAiOjE3Nzk4NzkxMzl9.rYvriDik1h4yfUTAf3oEQLrm8bt11zqtLAvuJV2Ocr4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkyNzQzMzksImV4cCI6MTc4MTg2NjMzOX0.XKT6i44hPfr8D2JSamO7zpYrJh8uMz5FwucSnEhx2OM', NULL, NULL, NULL, 0, '2026-05-20 15:03:06', '2026-05-20 10:52:19', '2026-05-20 15:03:06'),
(68, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MzQyMjczLCJleHAiOjE3Nzk5NDcwNzN9.3116yGAnsGtdAc53WYP4geLRNoosr1xzgGyDi93CF2c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3NzkzNDIyNzMsImV4cCI6MTc4MTkzNDI3M30.hqnqyZZK-N2OcE5wJWl5M3QFl0W4MEj_Yway0sVkQL0', NULL, NULL, NULL, 0, '2026-05-24 09:49:44', '2026-05-21 05:44:33', '2026-05-24 09:49:44'),
(69, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3NzkzNTIxNTksImV4cCI6MTc3OTk1Njk1OX0.vVqzPgRdtx_Y9j4vGlYO7ybV_qWTQ8NTFHeKpoKQC_g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTM1MjE1OSwiZXhwIjoxNzgxOTQ0MTU5fQ.OxLlHMcfuWZclmAOyLPSx1jVVWpTJdoxj6apSY9O3tA', NULL, NULL, NULL, 1, '2026-06-20 08:29:19', '2026-05-21 08:29:19', '2026-05-21 08:29:19'),
(70, 67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MzUyODk4LCJleHAiOjE3Nzk5NTc2OTh9.8FkM3UP-hzzyW8jDBdpyNFIqy3KEarhGsRhk7EsZggM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY3LCJpYXQiOjE3NzkzNTI4OTgsImV4cCI6MTc4MTk0NDg5OH0.XiUuU233eu1KHaDa2XJ8mh7CObk04o4gz7LA9xRMKp4', NULL, NULL, NULL, 0, '2026-05-21 08:42:29', '2026-05-21 08:41:38', '2026-05-21 08:42:29'),
(71, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5MzUyOTU1LCJleHAiOjE3Nzk5NTc3NTV9.BYTgq3-xxv3LXoXInL30UmhLUvhS8My05YO6HQYEHBw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3NzkzNTI5NTUsImV4cCI6MTc4MTk0NDk1NX0.2Od4hTLVwd_6NUv8nefTdN3IaTC2CSAsmXv5VxuGES0', NULL, NULL, NULL, 0, '2026-05-23 08:30:07', '2026-05-21 08:42:35', '2026-05-23 08:30:07'),
(72, 55, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5MzcxMjc4LCJleHAiOjE3Nzk5NzYwNzh9.yWAdXa1VpkxGj92DGuHVloc7GQH0QWMSZHvRciPZ4MI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU1LCJpYXQiOjE3NzkzNzEyNzgsImV4cCI6MTc4MTk2MzI3OH0.pGiKHthM-w3RasKY7VEhqeyFI1mZPfn9wV9BYwwInKw', NULL, NULL, NULL, 1, '2026-06-20 13:47:58', '2026-05-21 13:47:58', '2026-05-21 13:47:58'),
(73, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjE5ODgsImV4cCI6MTc4MDA2Njc4OH0.AxWkAyeXJP7tmV-MFAbHbhWwdFgVA5iaL9tDbCHud0s', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2MTk4OCwiZXhwIjoxNzgyMDUzOTg4fQ.wbVNOgP8kijM8F33CPZibE45mUA14U0daBIf23pYZ4k', NULL, NULL, NULL, 1, '2026-06-21 14:59:48', '2026-05-22 14:59:48', '2026-05-22 14:59:48'),
(74, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjE5ODksImV4cCI6MTc4MDA2Njc4OX0.UV0ET5-n8x7XLIVKCbLyHPocwPPHXww09j1yh19WP4c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2MTk4OSwiZXhwIjoxNzgyMDUzOTg5fQ.QqenSoC4AVOiNKiGySCOl3aQmnvN6pW2bf_JEwO41uY', NULL, NULL, NULL, 1, '2026-06-21 14:59:49', '2026-05-22 14:59:49', '2026-05-22 14:59:49'),
(75, 74, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NDYyMTE2LCJleHAiOjE3ODAwNjY5MTZ9.EFrPhFnAhQRRR19tNFNebFLIl5_dHbbQh2DPPdGCAMM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc0LCJpYXQiOjE3Nzk0NjIxMTYsImV4cCI6MTc4MjA1NDExNn0.G0VIuatg95ZKrMH4XI65tcwhzsMzg9M_qX3ZaUn7Ugk', NULL, NULL, NULL, 1, '2026-06-21 15:01:56', '2026-05-22 15:01:56', '2026-05-22 15:01:56'),
(76, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjMyNDAsImV4cCI6MTc4MDA2ODA0MH0.V9ZskSbaJ6WYakt_TaxkdTv8_Ish_WjaYoWBZSiPZnU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2MzI0MCwiZXhwIjoxNzgyMDU1MjQwfQ.ab3HEn10QH_Ej2a0a3iK9_UXG_w3F6RtR92EQ73USWo', NULL, NULL, NULL, 1, '2026-06-21 15:20:40', '2026-05-22 15:20:40', '2026-05-22 15:20:40'),
(77, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk0NjY3OTcsImV4cCI6MTc4MDA3MTU5N30.M-6kf5AmjplltTsNj_F4trtjA3rZC8t6cRoa5nL4MEw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTQ2Njc5NywiZXhwIjoxNzgyMDU4Nzk3fQ.8aj7Oy2ig3DruSNmd9myQLkj9IVaGURRNZwLjNY13fs', NULL, NULL, NULL, 0, '2026-05-23 05:29:24', '2026-05-22 16:19:57', '2026-05-23 05:29:24'),
(78, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTE0MTAyLCJleHAiOjE3ODAxMTg5MDJ9.EcdpyAFGF2FREkvZmsIZ-OFY5NSkLGG6LA6RE3gpGMY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3Nzk1MTQxMDIsImV4cCI6MTc4MjEwNjEwMn0.Rn96_JwcXb4d0opaxQ3Eg-62WNm5b5tCWUuQUhfZl7U', NULL, NULL, NULL, 0, '2026-05-24 10:22:39', '2026-05-23 05:28:22', '2026-05-24 10:22:39'),
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
(95, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNDI3MzM5LCJleHAiOjE3ODEwMzIxMzl9.rtzMPQ43U0frH9x5PIB5u36qV75npfaKB7BjjUPw7gI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3ODA0MjczMzksImV4cCI6MTc4MzAxOTMzOX0.s66_VrSXy3cqH5m2M39DxE3REs4hbdJ2UbDDyrYuJbk', NULL, NULL, NULL, 1, '2026-07-02 19:08:59', '2026-05-23 08:06:56', '2026-06-02 19:08:59'),
(96, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIzNzcyLCJleHAiOjE3ODAxMjg1NzJ9.tFsT3PmmkZD7PClyD87sVkBmJFesoRJjQM5MXup1tbU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzk1MjM3NzIsImV4cCI6MTc4MjExNTc3Mn0.5IImwdgc_cKxfM_tr-QX3_POLnjGXYMdX654i8NQtFw', NULL, NULL, NULL, 0, '2026-05-23 08:10:25', '2026-05-23 08:09:32', '2026-05-23 08:10:25'),
(97, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTIzODM0LCJleHAiOjE3ODAxMjg2MzR9.FVP01n9pgiT9URaeQ4ZQZ9u-0Ly1cAtshdN6Lc_fiRE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjM4MzQsImV4cCI6MTc4MjExNTgzNH0.yGTq_xNdrL1nmHPLJAYlQZXhW3fDrOuwt6aQZ_2YAno', NULL, NULL, NULL, 0, '2026-05-23 08:13:20', '2026-05-23 08:10:34', '2026-05-23 08:13:20'),
(98, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk1MjQwMTQsImV4cCI6MTc4MDEyODgxNH0.8C8PQ1kqbZjpTgC41Vi9CnXUNHcSSgbGfiMzhBvvZMk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTUyNDAxNCwiZXhwIjoxNzgyMTE2MDE0fQ.EfLTpXw9VmM1o2byWcXb_E6p846NoNWWxuL-_Jkb-vk', NULL, NULL, NULL, 0, '2026-05-23 08:16:34', '2026-05-23 08:13:34', '2026-05-23 08:16:34'),
(99, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI0MjA3LCJleHAiOjE3ODAxMjkwMDd9.mk1PGSIpoMCAV5wIDifAszxfIWDHg_oGme2ihNO9oAE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjQyMDcsImV4cCI6MTc4MjExNjIwN30.iDur_GLG9xakUCuubcrg2zOgCJNMtPjt9wAs4z4ewl8', NULL, NULL, NULL, 0, '2026-05-23 08:30:13', '2026-05-23 08:16:47', '2026-05-23 08:30:13'),
(100, 76, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc2LCJ1c2VyVHlwZSI6InN0YWZmIiwiaWF0IjoxNzc5NTI1MDMxLCJleHAiOjE3ODAxMjk4MzF9.eETa-qyfEBVwCdXzuY4rfK-LAuulfSrq8ADzk-iYPTs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc2LCJpYXQiOjE3Nzk1MjUwMzEsImV4cCI6MTc4MjExNzAzMX0.Ebn1vrE7rM05ukCIQOJlPrW10IcPs--mHC1WkQNyy10', NULL, NULL, NULL, 0, '2026-05-23 08:32:59', '2026-05-23 08:30:31', '2026-05-23 08:32:59'),
(101, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1MTg4LCJleHAiOjE3ODAxMjk5ODh9.ujzsuBAo5jDa23KnL-sjmVJm_KICm5QG4vUj6mh160o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3Nzk1MjUxODgsImV4cCI6MTc4MjExNzE4OH0.QHUjEMWbifgDHRJ6iF_p_OyNLedNfGce4tTTvjnS7cY', NULL, NULL, NULL, 0, '2026-05-24 10:20:37', '2026-05-23 08:33:08', '2026-05-24 10:20:37'),
(102, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1NzI0LCJleHAiOjE3ODAxMzA1MjR9.GyBE76a9pMDzloy41R0gm8srg4BF47yg44-LAwGHmUQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3Nzk1MjU3MjQsImV4cCI6MTc4MjExNzcyNH0.gcq1qKXjDV4xppM7_xpWkBIcJBqAA9UsZYZprRu7K4Q', NULL, NULL, NULL, 0, '2026-05-23 08:42:45', '2026-05-23 08:42:04', '2026-05-23 08:42:45'),
(103, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1ODAwLCJleHAiOjE3ODAxMzA2MDB9.eHWFvosgwestptSb4jYfuc-ODH_NvvqpZjAfHE1W2JA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk1MjU4MDAsImV4cCI6MTc4MjExNzgwMH0.653BJTn2IOuUFzCGxuXibUejRmCzXCc9TGkq2bf-iiA', NULL, NULL, NULL, 0, '2026-05-23 08:43:39', '2026-05-23 08:43:20', '2026-05-23 08:43:39'),
(104, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1ODUxLCJleHAiOjE3ODAxMzA2NTF9.ARLQWrQXTOWILaDWUDkT39alGHtt_dwnZ8m76F8iNY0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3Nzk1MjU4NTEsImV4cCI6MTc4MjExNzg1MX0.00_u3sOqoeWRRo64daIzHQjE8Pa0kxmSE3cbJGmxRQU', NULL, NULL, NULL, 0, '2026-05-23 08:44:37', '2026-05-23 08:44:11', '2026-05-23 08:44:37'),
(105, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NTI1ODgyLCJleHAiOjE3ODAxMzA2ODJ9.jzIQxt32jXUcE11kpVQQcu04qfBQDDCX4vvYmrftbSo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk1MjU4ODIsImV4cCI6MTc4MjExNzg4Mn0.kjVyRwLgTFEm3BZpWwcrdHWwK3_O_D0hedqoBB8va7U', NULL, NULL, NULL, 0, '2026-05-24 08:38:26', '2026-05-23 08:44:42', '2026-05-24 08:38:26'),
(106, 77, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxNzMwMTk0LCJleHAiOjE3ODIzMzQ5OTR9.EMEW9UyIXTXqDRPzuZrIz4YPrjH5ilVQX_0ZG1CJ7Lk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJpYXQiOjE3ODE3MzAxOTQsImV4cCI6MTc4NDMyMjE5NH0.VDxwrp37q_jxrY6foKXO4oMCPjOpO9jVdK8DCQ34p7w', NULL, NULL, NULL, 1, '2026-07-17 21:03:14', '2026-05-23 18:43:37', '2026-06-17 21:03:14'),
(107, 78, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc4LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTY1MjI0LCJleHAiOjE3ODAxNzAwMjR9.I0jhDYBOrmJydUbCmnoMqKE2MEqAI_tq967TnBbblcc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc4LCJpYXQiOjE3Nzk1NjUyMjQsImV4cCI6MTc4MjE1NzIyNH0.YTWfaLN3i-Fu-HWsluPpimI0kxdW5ClTlWAXr4Q9iIE', NULL, NULL, NULL, 1, '2026-06-22 19:40:24', '2026-05-23 19:40:24', '2026-05-23 19:40:24'),
(108, 77, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NTk4MTMzLCJleHAiOjE3ODAyMDI5MzN9.u2m0T7xsEev0vAwnAlsAZc23dnFsXRmSOFF3nY_DYCE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJpYXQiOjE3Nzk1OTgxMzMsImV4cCI6MTc4MjE5MDEzM30.VR-YvQNIevmIAXgKQtSSr968LSeC0BtRPO8S1d6jabE', NULL, NULL, NULL, 1, '2026-06-23 04:48:53', '2026-05-24 04:48:53', '2026-05-24 04:48:53'),
(109, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwMzM3NzYyLCJleHAiOjE3ODA5NDI1NjJ9.FAxb4UJteTsZN-b74hQSbUw88HVSFOxgQU7SVQBu0wk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODAzMzc3NjIsImV4cCI6MTc4MjkyOTc2Mn0.69J2fqvynBBFSAFGrF5LRsauzkfxa8QzMi9D8OSPCbs', NULL, NULL, NULL, 1, '2026-07-01 18:16:02', '2026-05-24 05:18:04', '2026-06-01 18:16:02'),
(110, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk2MTE5MTIsImV4cCI6MTc4MDIxNjcxMn0.j0Im1BlM88ydgbReV57d_XuZiTObM7sza1RXdbszte4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTYxMTkxMiwiZXhwIjoxNzgyMjAzOTEyfQ.SOlVamWw1J8T1pI-kJfaiMZfgFlLhqB9m1H1VB_wp5I', NULL, NULL, NULL, 0, '2026-05-24 08:39:16', '2026-05-24 08:38:32', '2026-05-24 08:39:16'),
(111, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjExOTY1LCJleHAiOjE3ODAyMTY3NjV9.r2_e9TZXDs_b8WeW7QGCu-UCP3dW31BT4Ehwg8BKpzQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk2MTE5NjUsImV4cCI6MTc4MjIwMzk2NX0.NWx4PTJoMouB01QNR5LfVFyOUGBWyWdqzuc-4EXIXEw', NULL, NULL, NULL, 0, '2026-05-24 08:41:03', '2026-05-24 08:39:25', '2026-05-24 08:41:03'),
(112, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk2MTIwODUsImV4cCI6MTc4MDIxNjg4NX0.bC6y0Dn5yrEdvSSymBKnlIQk0A2obX9F3CkVvnNyys4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTYxMjA4NSwiZXhwIjoxNzgyMjA0MDg1fQ.galyFJA-OTQVsYUt7QiKj1s7E1ITj3eLkPg4KDg5STM', NULL, NULL, NULL, 0, '2026-05-24 08:42:42', '2026-05-24 08:41:25', '2026-05-24 08:42:42'),
(113, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjEyMTY4LCJleHAiOjE3ODAyMTY5Njh9.yNCSGH1mWAqcWFGmUS2c8tIo6_DW05I0ykQ0mRlnvh4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk2MTIxNjgsImV4cCI6MTc4MjIwNDE2OH0.yJaE1Ss3Nsc0QSL8bB9lc8cdtu5POYnuBTu89Ops6Tk', NULL, NULL, NULL, 0, '2026-05-24 09:50:56', '2026-05-24 08:42:48', '2026-05-24 09:50:56'),
(114, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwMzc2Mjc0LCJleHAiOjE3ODA5ODEwNzR9.Yv4-db4YEHcz3K48jpgInN91GbR5zYcAjq6fMx8Lz7k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODAzNzYyNzQsImV4cCI6MTc4Mjk2ODI3NH0.t83RxQ_24Gnfd-zSEv9bEX8KR1jezKn5C83lQBO4zeY', NULL, NULL, NULL, 1, '2026-07-02 04:57:54', '2026-05-24 09:49:53', '2026-06-02 04:57:54'),
(115, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjE2MjY5LCJleHAiOjE3ODAyMjEwNjl9.WLNSXz5TnUWtUZVg3SW3SHkiwyCaq1AaohRXePPxu1g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3Nzk2MTYyNjksImV4cCI6MTc4MjIwODI2OX0.QCSwBfraJmeJGLYAW76o0UIJM7Svdr5UKcDtj3JWUNg', NULL, NULL, NULL, 0, '2026-05-24 09:51:23', '2026-05-24 09:51:09', '2026-05-24 09:51:23'),
(116, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgxNTk1OTc1LCJleHAiOjE3ODIyMDA3NzV9.JRlIBmrstsQZcsucbx0eos_4KXmuOPhW7JtN_mE9nhA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODE1OTU5NzUsImV4cCI6MTc4NDE4Nzk3NX0.ftJ6gxBBtKRQa56Hp-HiI57wnZ5PW8UXN6fmKL48F2Y', NULL, NULL, NULL, 1, '2026-07-16 07:46:15', '2026-05-24 09:51:31', '2026-06-16 07:46:15');
INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `device_info`, `ip_address`, `user_agent`, `is_active`, `expires_at`, `created_at`, `updated_at`) VALUES
(117, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NjE3ODA1LCJleHAiOjE3ODAyMjI2MDV9.Br3fjUk03IBk1Yh2IL5b-mQw9DJYzEoHqemBwlL8uRg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3Nzk2MTc4MDUsImV4cCI6MTc4MjIwOTgwNX0.Pb7X1R3yV3fue9TEuyJXRAUuTjXq6Uwpjv6UBtUOVIs', NULL, NULL, NULL, 1, '2026-06-23 10:16:45', '2026-05-24 10:16:45', '2026-05-24 10:16:45'),
(118, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjE4MDQ5LCJleHAiOjE3ODAyMjI4NDl9.NmVjabLN_AiC8ErIbhg6DX8M9iDGdpaA1CQNIPuU8Dg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzk2MTgwNDksImV4cCI6MTc4MjIxMDA0OX0.YySGUFGjltF9B2SB5gogQ-rIVOKV4yQWyJDUtfWA1z0', NULL, NULL, NULL, 1, '2026-06-23 10:20:49', '2026-05-24 10:20:49', '2026-05-24 10:20:49'),
(119, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjE4MDgyLCJleHAiOjE3ODAyMjI4ODJ9.hzUArGOjgmuHZv_1Gvq129xflL_BDYm_o2kr8NAz7TA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3Nzk2MTgwODIsImV4cCI6MTc4MjIxMDA4Mn0.pAd8jOfOzShAntmKovlX8_8-DRqnkPVRufp1b3Klcck', NULL, NULL, NULL, 0, '2026-05-24 10:22:24', '2026-05-24 10:21:22', '2026-05-24 10:22:24'),
(120, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjE4MTY4LCJleHAiOjE3ODAyMjI5Njh9.BGvl_gaeAYL2OLfDN8GnGuSqPBko5inU4rHE0a5B92Y', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3Nzk2MTgxNjgsImV4cCI6MTc4MjIxMDE2OH0.HIkL14-ye3nIagHxbTcF2qKrYpy_kFpdGmmatAZ6s48', NULL, NULL, NULL, 0, '2026-05-24 10:30:07', '2026-05-24 10:22:48', '2026-05-24 10:30:07'),
(121, 79, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzc5NjE4MTgxLCJleHAiOjE3ODAyMjI5ODF9.z-hTJVtZn5kYevvua-2t6glESz0AUaVyEYuMHRJUodw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc5LCJpYXQiOjE3Nzk2MTgxODEsImV4cCI6MTc4MjIxMDE4MX0.HgRS9t_zdtCKaLczdo2Li4ZYSU69OflmZko0U6rk18s', NULL, NULL, NULL, 0, '2026-05-24 10:23:52', '2026-05-24 10:23:01', '2026-05-24 10:23:52'),
(122, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwMjg2NjY3LCJleHAiOjE3ODA4OTE0Njd9.jasV2koyfz7B8IZioXlI3H6kNPYdnotNxY_IPMt-IGo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODAyODY2NjcsImV4cCI6MTc4Mjg3ODY2N30.ZsuF0FvscBZZHTZ8WOd3gsCeoIx3n7UoB1gbn2o1Zrk', NULL, NULL, NULL, 1, '2026-07-01 04:04:27', '2026-05-24 10:27:06', '2026-06-01 04:04:27'),
(123, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjE4NjIxLCJleHAiOjE3ODAyMjM0MjF9.jgEiKq3BQTCvfrKWRGPrURXxF8VEMfKDdI-7jWhLRpQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3Nzk2MTg2MjEsImV4cCI6MTc4MjIxMDYyMX0.pvRUlZv06UeIEiFhIEda27ekxMdhrdTQsAIdbeBHrjU', NULL, NULL, NULL, 0, '2026-05-24 10:31:01', '2026-05-24 10:30:21', '2026-05-24 10:31:01'),
(124, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjE4NjkyLCJleHAiOjE3ODAyMjM0OTJ9.xttmwZuTsZnAW-Tqwj8p-kqbmxomDqNCNHfkXJanIqw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3Nzk2MTg2OTIsImV4cCI6MTc4MjIxMDY5Mn0.5QWOizb2FrRg9sLTeipZPcm7LlOrKh_jaT0ukzf1cDM', NULL, NULL, NULL, 0, '2026-05-24 10:48:07', '2026-05-24 10:31:32', '2026-05-24 10:48:07'),
(125, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NjI5ODU4LCJleHAiOjE3ODAyMzQ2NTh9.HpPOJx5PJzUAsrJjG_TiZ3LIoZE4t1rfaIhGNxOWbyo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3Nzk2Mjk4NTgsImV4cCI6MTc4MjIyMTg1OH0.sLTD7PMdHtGc7hcWEpCgA8a8AWRrkBwpZnFuNlPSVMw', NULL, NULL, NULL, 1, '2026-06-23 13:37:38', '2026-05-24 13:37:38', '2026-05-24 13:37:38'),
(126, 80, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxMzQ5ODkxLCJleHAiOjE3ODE5NTQ2OTF9.erdM4-396JVcJpmbPVpez38_hCBOGcjWle0vBjMlY18', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgwLCJpYXQiOjE3ODEzNDk4OTEsImV4cCI6MTc4Mzk0MTg5MX0.MkSQ4bSCc_xB2Te6is_0cb_Tk5SHcFXSTI-43on-O7Q', NULL, NULL, NULL, 1, '2026-07-13 11:24:51', '2026-05-25 11:45:48', '2026-06-13 11:24:51'),
(127, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk3NzA1OTQsImV4cCI6MTc4MDM3NTM5NH0.C-TmWPCl00STe_XDptMRxRHlzgTI98i4r0Tm44Tz6vw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTc3MDU5NCwiZXhwIjoxNzgyMzYyNTk0fQ.rWLWxvPXCRGacQSkCrP6JRj8smee_F6gIsaHdGWyftY', NULL, NULL, NULL, 1, '2026-06-25 04:43:14', '2026-05-26 04:43:14', '2026-05-26 04:43:14'),
(128, 81, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgxLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NzcyNDIyLCJleHAiOjE3ODAzNzcyMjJ9.7ZUEdRL47601cDaSwjLnhZfxld3KsLjfKfpbBgIzAHE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgxLCJpYXQiOjE3Nzk3NzI0MjIsImV4cCI6MTc4MjM2NDQyMn0.UJiLvQUkBaBftMaogFoI6d-fGvTQ4mSSasLtFvozLqM', NULL, NULL, NULL, 1, '2026-06-25 05:13:42', '2026-05-26 05:13:42', '2026-05-26 05:13:42'),
(129, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3Nzk3NzI0OTcsImV4cCI6MTc4MDM3NzI5N30.R90Jf8lsPTWgEVuF8zipNSX5Apat2dYg-kgb6M-CpD4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3OTc3MjQ5NywiZXhwIjoxNzgyMzY0NDk3fQ.Gf-JqeYNrEmjTwCmCyOqX426USwsVeVzOSbuDEaQsXE', NULL, NULL, NULL, 1, '2026-06-25 05:14:57', '2026-05-26 05:14:57', '2026-05-26 05:14:57'),
(130, 81, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgxLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5NzczODcxLCJleHAiOjE3ODAzNzg2NzF9.rjgb6cKKlwUgafbDmG3p84-7k-F2yN_ERVAv-IjYbN0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgxLCJpYXQiOjE3Nzk3NzM4NzEsImV4cCI6MTc4MjM2NTg3MX0.512lEclrSz5PkJf-lBjO7vrpeLlz7UGtVn-hHAFXJ2w', NULL, NULL, NULL, 0, '2026-05-26 06:00:34', '2026-05-26 05:37:51', '2026-05-26 06:00:34'),
(131, 81, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgxLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzc5Nzc1Mjc5LCJleHAiOjE3ODAzODAwNzl9.vQmCTKTnrZkan8KGpPY4uHG8WEIlVg8w-018aS7r6Kc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgxLCJpYXQiOjE3Nzk3NzUyNzksImV4cCI6MTc4MjM2NzI3OX0.ANroueUm_GS5Jgd5rL4VyCog3Nv8nlqp8J9iUEzAKww', NULL, NULL, NULL, 1, '2026-06-25 06:01:19', '2026-05-26 06:01:19', '2026-05-26 06:01:19'),
(132, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA0ODYyMzYsImV4cCI6MTc4MTA5MTAzNn0.NlPHeMZIS6smGdgA8pojM5Yj0d-6ydh6hMhGCQIX1xc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDQ4NjIzNiwiZXhwIjoxNzgzMDc4MjM2fQ.luyD0dSE_cImf_0LCFDdWANq7hd-4yOmw13zT2M-Suw', NULL, NULL, NULL, 1, '2026-07-03 11:30:36', '2026-05-26 09:54:59', '2026-06-03 11:30:36'),
(133, 82, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgyLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwMTY2NzY5LCJleHAiOjE3ODA3NzE1Njl9.z52C7GqHjo4g9rVY50YKB3V8h80jz6IhcNSurS6tSn8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgyLCJpYXQiOjE3ODAxNjY3NjksImV4cCI6MTc4Mjc1ODc2OX0.3P0xtY_hOdWWzIsawrFJ0539hS1KCOO5WmWW0LkSYQo', NULL, NULL, NULL, 1, '2026-06-29 18:46:09', '2026-05-30 18:46:09', '2026-05-30 18:46:09'),
(134, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwMjg2NzA4LCJleHAiOjE3ODA4OTE1MDh9.XdzOiyxk8p2DscNyfUZ9fZP041oIdh5tgWKg5ZT1d30', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3ODAyODY3MDgsImV4cCI6MTc4Mjg3ODcwOH0.NgwoUTLOGTqGgoKejU4bZNGCGC1Avb9F12Y5eBtaY9U', NULL, NULL, NULL, 0, '2026-06-04 06:16:08', '2026-06-01 04:05:08', '2026-06-04 06:16:08'),
(135, 83, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgzLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwMzEwMDA4LCJleHAiOjE3ODA5MTQ4MDh9.yZc9P2PGriVin07eOq-BvB4N3vjl2_35hHhtFRIX__s', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgzLCJpYXQiOjE3ODAzMTAwMDgsImV4cCI6MTc4MjkwMjAwOH0.PnXn2nNEzQbAoZT7jGuqz83tQsZINFSNeMQJBorzh1o', NULL, NULL, NULL, 1, '2026-07-01 10:33:28', '2026-06-01 10:33:28', '2026-06-01 10:33:28'),
(136, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTQ4MzE1LCJleHAiOjE3ODE1NTMxMTV9.7hN0dHfr16qaG-Vli13jJG7PDZ7aVYwdoGRM7bdzPgs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODA5NDgzMTUsImV4cCI6MTc4MzU0MDMxNX0.79ufnPZtszCmFdAKAp_luvdtu8aCdrg558RNb3gb3Yo', NULL, NULL, NULL, 1, '2026-07-08 19:51:55', '2026-06-01 18:49:25', '2026-06-08 19:51:55'),
(137, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTk0MDA4LCJleHAiOjE3ODE1OTg4MDh9.e2RAUZx0Gd3wPwpLzpFQuwyHQgCkk8keROXLB2vigTM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODA5OTQwMDgsImV4cCI6MTc4MzU4NjAwOH0._HVlquIOsj252vmIjcYbLoySRF2Zwqb5d8-SfgaxNfs', NULL, NULL, NULL, 1, '2026-07-09 08:33:28', '2026-06-02 04:58:05', '2026-06-09 08:33:28'),
(138, 84, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNDExNTAzLCJleHAiOjE3ODEwMTYzMDN9.TNv37fAs6mKCKddCVK1_xmFNlo76_BDdIYSbxOPnHkw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJpYXQiOjE3ODA0MTE1MDMsImV4cCI6MTc4MzAwMzUwM30.HjecIJRtCPIU6nbVnGO-oiL2yxDvbUUlgg04xSm8W_E', NULL, NULL, NULL, 1, '2026-07-02 14:45:03', '2026-06-02 14:45:03', '2026-06-02 14:45:03'),
(139, 85, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgyODMyNjA3LCJleHAiOjE3ODM0Mzc0MDd9.Fh9a4gO_95dAg_hKY6_n7oB6joiUHMGkfKRKiSvGgRo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg1LCJpYXQiOjE3ODI4MzI2MDcsImV4cCI6MTc4NTQyNDYwN30.NOfuZsW0e4RVNk_1VZRYd8ixgy2bBPDC4askwtidq78', NULL, NULL, NULL, 1, '2026-07-30 15:16:47', '2026-06-02 20:55:11', '2026-06-30 15:16:47'),
(140, 86, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNDgxMjk1LCJleHAiOjE3ODEwODYwOTV9.qM3Wv7qsKfXV0tIG4FdsNawSdGNL3_eS4VrDhIcJDu0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg2LCJpYXQiOjE3ODA0ODEyOTUsImV4cCI6MTc4MzA3MzI5NX0.zYse3XOQX6GNe38wDue-CzSWclU7rqyRcvSJLXaSE9E', NULL, NULL, NULL, 1, '2026-07-03 10:08:15', '2026-06-03 10:08:15', '2026-06-03 10:08:15'),
(141, 87, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNDkwOTk3LCJleHAiOjE3ODEwOTU3OTd9.SfAMXquDeM7tTsmeG4CUvC8okRF-a7w5M9YR9SOO3w8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg3LCJpYXQiOjE3ODA0OTA5OTcsImV4cCI6MTc4MzA4Mjk5N30.ubdTlQ6lcl_Z7rIgryE4GJjDEcKNrXpUENJB3rQ94qI', NULL, NULL, NULL, 1, '2026-07-03 12:49:57', '2026-06-03 12:49:57', '2026-06-03 12:49:57'),
(142, 88, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg4LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNTUzMjQ3LCJleHAiOjE3ODExNTgwNDd9.RgsW1YsPZnG8m_KxhlX937CAWcAyBgHNp7zB4tcPUdw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg4LCJpYXQiOjE3ODA1NTMyNDcsImV4cCI6MTc4MzE0NTI0N30.-qMvojPAmVmeV_dV_mqG4H9gaErsN_QjIUvVWjJfgvQ', NULL, NULL, NULL, 1, '2026-07-04 06:07:27', '2026-06-04 06:07:27', '2026-06-04 06:07:27'),
(143, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwNTUzNzc2LCJleHAiOjE3ODExNTg1NzZ9.Kl-m_-1cxAzpLaSbsCgDKES6kUfps4o7sXsC4KHW-bM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA1NTM3NzYsImV4cCI6MTc4MzE0NTc3Nn0.-VitcOIlRvX4WvJsh24jXMMM3CIJFYPOCFHCKuKdylc', NULL, NULL, NULL, 0, '2026-06-04 06:16:51', '2026-06-04 06:16:16', '2026-06-04 06:16:51'),
(144, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNTUzODIyLCJleHAiOjE3ODExNTg2MjJ9.nxgQHAoN5BxPQC47-HDZM96g04kuEvD-WVQtsnSaOq0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODA1NTM4MjIsImV4cCI6MTc4MzE0NTgyMn0.ICBm1S8boMSkK6Hj-qHahgMW_uXjAnHXhIvMifEOORM', NULL, NULL, NULL, 0, '2026-06-04 09:30:23', '2026-06-04 06:17:02', '2026-06-04 09:30:23'),
(145, 90, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxODI5NDUzLCJleHAiOjE3ODI0MzQyNTN9.7WrEm_wkvNmnqQqDQRwIrBgNmvU7LZxx6b1B7HxvcBo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkwLCJpYXQiOjE3ODE4Mjk0NTMsImV4cCI6MTc4NDQyMTQ1M30.lRPKT2wtsieP8ITcD_VfZG18uAX25-fscXDuRARkZkc', NULL, NULL, NULL, 1, '2026-07-19 00:37:33', '2026-06-04 07:26:51', '2026-06-19 00:37:33'),
(146, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwNTY1NDMzLCJleHAiOjE3ODExNzAyMzN9.O2NglHyQoRV139v5aYiaN4IcxzVtnMGAzOsViZsvqjo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA1NjU0MzMsImV4cCI6MTc4MzE1NzQzM30.-Jtd_N0-90LwrCRe-GdxYeMBd0cwwnZy3rEQqVR5dvE', NULL, NULL, NULL, 0, '2026-06-04 09:35:29', '2026-06-04 09:30:33', '2026-06-04 09:35:29'),
(147, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA1NjU3NDUsImV4cCI6MTc4MTE3MDU0NX0.16honQQXXJ8yeg7kVUPbHgeFR-2E1ZfPL61hEVUE9jA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDU2NTc0NSwiZXhwIjoxNzgzMTU3NzQ1fQ.DLkqeSOJ0TchWwAjMIjKbqgwGym4rrcsY9ilVAlmw5E', NULL, NULL, NULL, 0, '2026-06-04 14:31:11', '2026-06-04 09:35:45', '2026-06-04 14:31:11'),
(148, 91, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkxLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNTc1NjIzLCJleHAiOjE3ODExODA0MjN9.lzVJwshLkWvNm0JSoBcjHUR-7y8d9WrYp6XOaxc2IXk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkxLCJpYXQiOjE3ODA1NzU2MjMsImV4cCI6MTc4MzE2NzYyM30.gZYD_w83_8lG8u7qM-T2U6EDRlgpaXwzSCm86JLIA2M', NULL, NULL, NULL, 1, '2026-07-04 12:20:23', '2026-06-04 12:20:23', '2026-06-04 12:20:23'),
(149, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA1NzU5NjMsImV4cCI6MTc4MTE4MDc2M30.N6iGVbGxb0y4jvbAiN1-BRWHUZV0lyY0tn0gKYG97Qo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDU3NTk2MywiZXhwIjoxNzgzMTY3OTYzfQ.5t3it-_PLQCjmOKy07xFJTPCEtYk-Kvn_5TrsAMp3d8', NULL, NULL, NULL, 1, '2026-07-04 12:26:03', '2026-06-04 12:26:03', '2026-06-04 12:26:03'),
(150, 92, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkyLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNTc4NTEzLCJleHAiOjE3ODExODMzMTN9.H4I01BH0fkBMC5x3MK8saq63PxZdTR80dqiYA6UZtcc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkyLCJpYXQiOjE3ODA1Nzg1MTMsImV4cCI6MTc4MzE3MDUxM30.1L9JXb5Nff0y8hbkA2ArWXj0FY-DxmoBs9RoefxL6nE', NULL, NULL, NULL, 1, '2026-07-04 13:08:33', '2026-06-04 13:08:33', '2026-06-04 13:08:33'),
(151, 93, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkzLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNTgyMzQxLCJleHAiOjE3ODExODcxNDF9.a7Fgwz_4dsewKM-IyIqkRHk2R6i1J2LA9BezC7fHmUs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjkzLCJpYXQiOjE3ODA1ODIzNDEsImV4cCI6MTc4MzE3NDM0MX0.2PoDKnQq0fwgGzVry1fUfnU_rQkXt9LIGXL9i_M42II', NULL, NULL, NULL, 1, '2026-07-04 14:12:21', '2026-06-04 14:12:21', '2026-06-04 14:12:21'),
(152, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNTgzNDkwLCJleHAiOjE3ODExODgyOTB9.khm4iF3k0sXgWZvKGM4CHyAqw4V5FBa2ffgWJz9lBXg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODA1ODM0OTAsImV4cCI6MTc4MzE3NTQ5MH0.tHA21Z-Iw1Yq-fhvWrl4ypq_1fHd6dKu4q6veVKk7rw', NULL, NULL, NULL, 0, '2026-06-05 08:50:57', '2026-06-04 14:31:30', '2026-06-05 08:50:57'),
(153, 94, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk0LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwNjQxMzc3LCJleHAiOjE3ODEyNDYxNzd9.vQhM-Cd7ce95gg_RpJ9V0E3Om1UXuAO2PcVjurve2Vs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk0LCJpYXQiOjE3ODA2NDEzNzcsImV4cCI6MTc4MzIzMzM3N30.4MntlV6WG8dPIe7v4RKEhpvItDZKDmvHMWrydkGKRMY', NULL, NULL, NULL, 1, '2026-07-05 06:36:17', '2026-06-05 06:36:17', '2026-06-05 06:36:17'),
(154, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwNjQ5NDcxLCJleHAiOjE3ODEyNTQyNzF9.MxcGiWSYVPVDDeJQM8mjHIZ0s8UhhPGMdLhA--U0g6w', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA2NDk0NzEsImV4cCI6MTc4MzI0MTQ3MX0.L5nVLZ1QVH_WJ5kI2o2-bsAmlPancd6bUwd7UGcusNE', NULL, NULL, NULL, 0, '2026-06-07 09:38:37', '2026-06-05 08:51:11', '2026-06-07 09:38:37'),
(155, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwNjQ5NjAzLCJleHAiOjE3ODEyNTQ0MDN9.zPjP-pYZUIqDya2wInGc14qGmjRWNxbNeDgJxVRmNYU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA2NDk2MDMsImV4cCI6MTc4MzI0MTYwM30.TLX3aKMiySmcVqNrFpV6-AMev2pUmEn2WBftuoIeUfI', NULL, NULL, NULL, 0, '2026-06-08 12:38:58', '2026-06-05 08:53:23', '2026-06-08 12:38:58'),
(156, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgyNDYzMDcwLCJleHAiOjE3ODMwNjc4NzB9.UpAjtSfFdiQbKQXYY2f9MRDDbEK9CDfryAtOrOZtETY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3ODI0NjMwNzAsImV4cCI6MTc4NTA1NTA3MH0.KUd31INi7nQ3BzDLmdH3KHO35DfCsYy5mXqnheqBdLc', NULL, NULL, NULL, 1, '2026-07-26 08:37:50', '2026-06-05 08:56:47', '2026-06-26 08:37:50'),
(157, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA4MTUzNDMsImV4cCI6MTc4MTQyMDE0M30.qqCCnpfCzOT2aaur0-lgmW5mqt3AxwByRV6yroLL3jw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDgxNTM0MywiZXhwIjoxNzgzNDA3MzQzfQ.DiE3FwZXwpZTl5q_3UEYPN02V-qyN4HLm9a48jXZi4k', NULL, NULL, NULL, 1, '2026-07-07 06:55:43', '2026-06-07 06:55:43', '2026-06-07 06:55:43'),
(158, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA4MjUxMzUsImV4cCI6MTc4MTQyOTkzNX0.7JES9GVutO8bvIxB2jqf0D0cr9vgF-II-afrbAGvlUE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDgyNTEzNSwiZXhwIjoxNzgzNDE3MTM1fQ.e1NLL1f8Wx3xK2enD5BUYyyisHtTq90o6fiPj0vhIFI', NULL, NULL, NULL, 0, '2026-06-08 06:47:52', '2026-06-07 09:38:55', '2026-06-08 06:47:52'),
(159, 95, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwODQ1MzAzLCJleHAiOjE3ODE0NTAxMDN9.DRgwxpCHn88TtDAL0z-4asbe80BrqqJ8GsBFYwyfypI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk1LCJpYXQiOjE3ODA4NDUzMDMsImV4cCI6MTc4MzQzNzMwM30.MKNl5tGm9Jb4YZNWG_k6byLR_10d4jAeX7VbLo0xhQE', NULL, NULL, NULL, 1, '2026-07-07 15:15:03', '2026-06-07 15:15:03', '2026-06-07 15:15:03'),
(160, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTAxODM2LCJleHAiOjE3ODE1MDY2MzZ9.Wgud1QrFCl8yllyqL2y1JE93T2y4C_6laxakpSl_zug', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA5MDE4MzYsImV4cCI6MTc4MzQ5MzgzNn0.PEfcMTHbCNO1vyMT_H9oV0BHKb7j16Xh0rQC-haER0c', NULL, NULL, NULL, 0, '2026-06-08 09:05:29', '2026-06-08 06:57:16', '2026-06-08 09:05:29'),
(161, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwOTA5NTQ5LCJleHAiOjE3ODE1MTQzNDl9.d9IPsqD_Ay_5SEmTiA3F74BFZWAb0Mh4OdyG6o_OCwE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODA5MDk1NDksImV4cCI6MTc4MzUwMTU0OX0.DZaTQ1F5aArIXGXtUKQsLB6-UK3YEJT26rfl7_qCB4c', NULL, NULL, NULL, 0, '2026-06-08 09:06:03', '2026-06-08 09:05:49', '2026-06-08 09:06:03'),
(162, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTA5NTc2LCJleHAiOjE3ODE1MTQzNzZ9.9E9814ofH3AOZr73MOzE7-cP-uhqbU_MbSOPAijiA84', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA5MDk1NzYsImV4cCI6MTc4MzUwMTU3Nn0.aNmAjiJzQ-DbiiCzPS4t42VPbxyzLLAhDi_YHC0ShJ8', NULL, NULL, NULL, 0, '2026-06-08 09:06:41', '2026-06-08 09:06:16', '2026-06-08 09:06:41'),
(163, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwOTA5NjE3LCJleHAiOjE3ODE1MTQ0MTd9.TEgaIUFelj5C-dXFKC0rNVWo6tGLEAxkDk-1fgUhWio', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODA5MDk2MTcsImV4cCI6MTc4MzUwMTYxN30.4CNCQ1ufwRplGSt2g44f91b6AU6oO0i1ZiLyMosdJMY', NULL, NULL, NULL, 0, '2026-06-08 09:09:56', '2026-06-08 09:06:57', '2026-06-08 09:09:56'),
(164, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTA5ODA5LCJleHAiOjE3ODE1MTQ2MDl9.8nrfIb5SavhlJ2zjq26anfVZbpTQVH1Dizxli6veOf4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA5MDk4MDksImV4cCI6MTc4MzUwMTgwOX0.XXC07Z4S90kc3G38s95POVkl9VwRpVsxYY7zjRKiEpo', NULL, NULL, NULL, 0, '2026-06-08 10:03:04', '2026-06-08 09:10:09', '2026-06-08 10:03:04'),
(165, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTA5ODY0LCJleHAiOjE3ODE1MTQ2NjR9.xCYToq1sU_jx8BXXQ8cwl2T5ghEzXgUY6-g8ha37Lzo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3ODA5MDk4NjQsImV4cCI6MTc4MzUwMTg2NH0.N5GVeGP19MhnerWGnu7AOe-WUeOLbEuhwvKkDpdJMf8', NULL, NULL, NULL, 1, '2026-07-08 09:11:04', '2026-06-08 09:11:04', '2026-06-08 09:11:04'),
(166, 96, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwOTExMjM2LCJleHAiOjE3ODE1MTYwMzZ9.pbEj6LNRuHT0Bj3IK36Aav2c8iiZNjaUZH_Z38ZFC9k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk2LCJpYXQiOjE3ODA5MTEyMzYsImV4cCI6MTc4MzUwMzIzNn0.V3qK0q9VR7a1GQo0jB6GN98GR5EkIOFs_sUgB1qwv7w', NULL, NULL, NULL, 1, '2026-07-08 09:33:56', '2026-06-08 09:33:56', '2026-06-08 09:33:56'),
(167, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA5MTI5OTksImV4cCI6MTc4MTUxNzc5OX0.QePpgAU1odNM5xSDUh3GXdar54rqX834yrntGaMd_1k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDkxMjk5OSwiZXhwIjoxNzgzNTA0OTk5fQ.1LOBN4tdcB-5xdqfu0zN43tEmpnGe0cvZ6J9lKXoV4Q', NULL, NULL, NULL, 0, '2026-06-09 04:57:01', '2026-06-08 10:03:19', '2026-06-09 04:57:01'),
(168, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA5MTQ2NTEsImV4cCI6MTc4MTUxOTQ1MX0.Qm4WnSWR43_wGov3F6T_1CpVsDVc5l4m7TLNtih6gRU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDkxNDY1MSwiZXhwIjoxNzgzNTA2NjUxfQ.7ZYMQ_1uJsZyQ6-4AF_lyy2BHililuuqGVLkpkYnENs', NULL, NULL, NULL, 1, '2026-07-08 10:30:51', '2026-06-08 10:30:51', '2026-06-08 10:30:51'),
(169, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTIyMzQ2LCJleHAiOjE3ODE1MjcxNDZ9.1Ec9PPJBBMTjoAU0ToIUTkg28NHsaTpDAHXZg3qNdAM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA5MjIzNDYsImV4cCI6MTc4MzUxNDM0Nn0.YM64CnLNzm5vZ4UotiCdjEbkYUOi0nze1OLM6T9KIhQ', NULL, NULL, NULL, 1, '2026-07-08 12:39:06', '2026-06-08 12:39:06', '2026-06-08 12:39:06'),
(170, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgxNTMwNDgyLCJleHAiOjE3ODIxMzUyODJ9.nhrK4qMXKw1MKAUdKxPqfBpP5QZYxoJcazdYyPf3wes', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODE1MzA0ODIsImV4cCI6MTc4NDEyMjQ4Mn0.w4cs3MW3obCb1IQA8Yub7F2a2SPF2MksaSKsaMrlnTE', NULL, NULL, NULL, 1, '2026-07-15 13:34:42', '2026-06-08 12:46:04', '2026-06-15 13:34:42'),
(171, 97, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgwOTI0MTIwLCJleHAiOjE3ODE1Mjg5MjB9.67D0DqNskxVIsHRLjYzSVrhNHV3EudGTOQsyDNsxJ5w', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk3LCJpYXQiOjE3ODA5MjQxMjAsImV4cCI6MTc4MzUxNjEyMH0.EX6HM-mRN4rB6v9BWiJKcEAMW8cpJw7nq7VOdrGNJaE', NULL, NULL, NULL, 1, '2026-07-08 13:08:40', '2026-06-08 13:08:40', '2026-06-08 13:08:40'),
(172, 57, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgyNzg1MTE5LCJleHAiOjE3ODMzODk5MTl9.MIEMnyl_QX9Eh2HNkZ5tXoiu_FG9EE6P5xTNk-GuL4I', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJpYXQiOjE3ODI3ODUxMTksImV4cCI6MTc4NTM3NzExOX0.TYkYHy91-BdOXZCdJENDYOaF-MieEhWdlBuAxA_o-PE', NULL, NULL, NULL, 0, '2026-07-03 11:57:06', '2026-06-08 20:06:21', '2026-07-03 11:57:06'),
(173, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA5Nzg1MTEsImV4cCI6MTc4MTU4MzMxMX0.niHT6TCKDPK7gegf7AUiAZLB8Oiock3tCmK3oWQBnPg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDk3ODUxMSwiZXhwIjoxNzgzNTcwNTExfQ.ji2Xv_iuzTmpE6wx1OgSA52bI37iSTYcs6l6WLx3h2Y', NULL, NULL, NULL, 1, '2026-07-09 04:15:11', '2026-06-09 04:15:11', '2026-06-09 04:15:11'),
(174, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgwOTgxMDI5LCJleHAiOjE3ODE1ODU4Mjl9.k9cwY67axy0Na1dLlCP7LuBPpAUnNl4Ej77jzB6-F-k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODA5ODEwMjksImV4cCI6MTc4MzU3MzAyOX0.VphZQy4bxw_vGflgHINLmrGJAWjnpJzwTknX05k6V_c', NULL, NULL, NULL, 0, '2026-06-14 06:50:45', '2026-06-09 04:57:09', '2026-06-14 06:50:45'),
(175, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODA5ODkyOTMsImV4cCI6MTc4MTU5NDA5M30.H7Gkc0hx0y4AiqAvljYbtpSG4mCDsAnOnhJZTBeBQ4A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MDk4OTI5MywiZXhwIjoxNzgzNTgxMjkzfQ.SfAr1U0puUOsDpRMgbEQnrcnZ6K44h6jBXHgdEPRPlU', NULL, NULL, NULL, 0, '2026-06-09 07:15:53', '2026-06-09 07:14:53', '2026-06-09 07:15:53'),
(176, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgxNjA1ODgyLCJleHAiOjE3ODIyMTA2ODJ9.qDIEqe2eWLCQOQ9Wvp7cTLpeBCq3zICXbYkIB1R1KEM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODE2MDU4ODIsImV4cCI6MTc4NDE5Nzg4Mn0.sD7WDzBO9iAJX20l9ynaEjaUAhAB8hEsplENrh2yQE0', NULL, NULL, NULL, 1, '2026-07-16 10:31:22', '2026-06-09 08:33:38', '2026-06-16 10:31:22'),
(177, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODEwMDk3ODQsImV4cCI6MTc4MTYxNDU4NH0.hLYBGEBkQhZ7ijG1bb2FdkPfDIpLzz7hrHAScwK-5PA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTAwOTc4NCwiZXhwIjoxNzgzNjAxNzg0fQ.Oy0e1IwvlREMsI48dDb-boU9FL8yzbU8faQ9s6Q2nWc', NULL, NULL, NULL, 1, '2026-07-09 12:56:24', '2026-06-09 12:56:24', '2026-06-09 12:56:24'),
(178, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODEwMzE0NTUsImV4cCI6MTc4MTYzNjI1NX0.wFfhpayHQSkAN0JF4gGFywe9dHJhO12F22L4md4jm7U', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTAzMTQ1NSwiZXhwIjoxNzgzNjIzNDU1fQ.kfb5DYd3evGkLmr-cxTt5o1YBo4Tw_U09Zulb7JTGa4', NULL, NULL, NULL, 1, '2026-07-09 18:57:35', '2026-06-09 18:57:35', '2026-06-09 18:57:35'),
(179, 98, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk4LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxMDg1NTc0LCJleHAiOjE3ODE2OTAzNzR9.L0j7-zT4Ua5arzXzKL5fcdt8547Gq9gxjxfGd6cS9JY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk4LCJpYXQiOjE3ODEwODU1NzQsImV4cCI6MTc4MzY3NzU3NH0.wC1PY3LuSRn7P8GIXau8nseiAx7JUCc5k6owIAxXxms', NULL, NULL, NULL, 1, '2026-07-10 09:59:34', '2026-06-10 09:59:34', '2026-06-10 09:59:34'),
(180, 57, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxMDg2MTIxLCJleHAiOjE3ODE2OTA5MjF9.tyMS3mhCSpuzL-R2oJ02BUUudCEXcDEcIhEU96qRMrs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU3LCJpYXQiOjE3ODEwODYxMjEsImV4cCI6MTc4MzY3ODEyMX0.2V2-a35EUqJbCWfCmyhBib0XxBuX7kGiSvLNC7Qbry0', NULL, NULL, NULL, 1, '2026-07-10 10:08:41', '2026-06-10 10:08:41', '2026-06-10 10:08:41'),
(181, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODEwOTUzNzUsImV4cCI6MTc4MTcwMDE3NX0.RudrYHtancNFD5J2NDov5GrYdtysZEYDL-XvPVfCN9Y', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTA5NTM3NSwiZXhwIjoxNzgzNjg3Mzc1fQ.BoV5J4hnbUp3vizX7wu8g4KIrivdDF-N4yKQoE7I2i4', NULL, NULL, NULL, 1, '2026-07-10 12:42:55', '2026-06-10 12:42:55', '2026-06-10 12:42:55'),
(182, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODExMDQyODcsImV4cCI6MTc4MTcwOTA4N30.qWgc2oSmkXRjlLH_kD3qy2VqXJSG26AC8DmZabiFmn4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTEwNDI4NywiZXhwIjoxNzgzNjk2Mjg3fQ.PmzSRUFlLad1XBIn0t_yYQ4haL7fqzG-TjzDhObbKSI', NULL, NULL, NULL, 1, '2026-07-10 15:11:27', '2026-06-10 15:11:27', '2026-06-10 15:11:27'),
(183, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODExMDY1ODksImV4cCI6MTc4MTcxMTM4OX0.tgfPXRvy5T-KvXoAgjA6vbMZUYi-vQSFW12o8ly48j4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTEwNjU4OSwiZXhwIjoxNzgzNjk4NTg5fQ.3UbM2gqWC3bJ-QEmFcU4mJA75dHl6L6Pp0VMtrjQc2E', NULL, NULL, NULL, 1, '2026-07-10 15:49:49', '2026-06-10 15:49:49', '2026-06-10 15:49:49'),
(184, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODExMjgxMDQsImV4cCI6MTc4MTczMjkwNH0.m2BOUCJbvQxeQjWNyoHUyYVSGNM0SCPb30NhNoO0_BM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTEyODEwNCwiZXhwIjoxNzgzNzIwMTA0fQ.aW72nsLDfnyCt6E2tyzijuy0J54-FyodYEp8ij-8R3Y', NULL, NULL, NULL, 1, '2026-07-10 21:48:24', '2026-06-10 21:48:24', '2026-06-10 21:48:24'),
(185, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODE0MTk4NjIsImV4cCI6MTc4MjAyNDY2Mn0.vaEzBn6aYXqt4tNr2Th4_eZzhBlBZDzdbK2SSdXuPHE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTQxOTg2MiwiZXhwIjoxNzg0MDExODYyfQ.UdjGjkn3XV0yaCc_2wkK6_Q_NGCSHMi5rGhnsp7xZsE', NULL, NULL, NULL, 0, '2026-06-14 06:51:52', '2026-06-14 06:51:02', '2026-06-14 06:51:52'),
(186, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgxNDE5OTI1LCJleHAiOjE3ODIwMjQ3MjV9.IA-dP-SIsnrNuIkySk6ZpmVCBZSu-pD1RAjoY_68MgQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODE0MTk5MjUsImV4cCI6MTc4NDAxMTkyNX0.LyK5GQpiKxL7IBKBzrY3crQKV3OCpjBRrMZcwTxalCo', NULL, NULL, NULL, 0, '2026-06-14 06:54:04', '2026-06-14 06:52:05', '2026-06-14 06:54:04'),
(187, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODE0MTk5NjcsImV4cCI6MTc4MjAyNDc2N30.Sv1MjSjh-c57glREsgkKGoORp-oHVb2wxEFXhStiLyQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTQxOTk2NywiZXhwIjoxNzg0MDExOTY3fQ.fBZIwo9L1YrnQkb_kCDfmp1Ak0jIlpxbpWrdjfkZmto', NULL, NULL, NULL, 1, '2026-07-14 06:52:47', '2026-06-14 06:52:47', '2026-06-14 06:52:47'),
(188, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxNDIwMDk2LCJleHAiOjE3ODIwMjQ4OTZ9.-TD4cZXxKBPrw7A-0g1dL1YrwnrYuUIOaAg06I5IRTs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODE0MjAwOTYsImV4cCI6MTc4NDAxMjA5Nn0.3dVzUMhxSe7C1v3B2NqpA3ZJcuGS1Wp4PC4dDaWKUYY', NULL, NULL, NULL, 0, '2026-06-14 06:55:15', '2026-06-14 06:54:56', '2026-06-14 06:55:15'),
(189, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgxNDIwMTI3LCJleHAiOjE3ODIwMjQ5Mjd9.vfoagz4Xe1kjhZc_2CCIg1zSOCCvO5QIMr0Y8jAicdU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODE0MjAxMjcsImV4cCI6MTc4NDAxMjEyN30.HzWKLBHujrXLFcHcN8lZld1OFWvnmg9hUAsd8dU_uxk', NULL, NULL, NULL, 0, '2026-06-14 13:25:05', '2026-06-14 06:55:27', '2026-06-14 13:25:05'),
(190, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODE0MjU5NTUsImV4cCI6MTc4MjAzMDc1NX0.LPfo4mNSEvImDH9OTep1w9GlkFjyfh-grHDZEWWIdNg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MTQyNTk1NSwiZXhwIjoxNzg0MDE3OTU1fQ.XXDurjQVyYIl6Yj1SPbt2MWQ-_keOpp3e3BEWNzdR8A', NULL, NULL, NULL, 1, '2026-07-14 08:32:35', '2026-06-14 08:32:35', '2026-06-14 08:32:35'),
(191, 99, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxNTkzMDIyLCJleHAiOjE3ODIxOTc4MjJ9.dHwD5SY7bSs5VE5_2-qbvuQsc82JPPiy-sDxt25vHTs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk5LCJpYXQiOjE3ODE1OTMwMjIsImV4cCI6MTc4NDE4NTAyMn0.OHopRSvKHk-n0qAeTLVU3ODuVjkVijX8pQp8fNdJTG0', NULL, NULL, NULL, 1, '2026-07-16 06:57:02', '2026-06-16 06:57:02', '2026-06-16 06:57:02'),
(192, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyMjA3NTczLCJleHAiOjE3ODI4MTIzNzN9.FbxWbLZAk73Sa6OA31Kj37ebRp4geukmYwqhLciv05M', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODIyMDc1NzMsImV4cCI6MTc4NDc5OTU3M30.m8_OzY8khSL4CXSl-M6vjCdqs19rA0exQx4yGB26LiI', NULL, NULL, NULL, 1, '2026-07-23 09:39:33', '2026-06-16 07:47:15', '2026-06-23 09:39:33'),
(193, 100, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MTYwMDQ1MSwiZXhwIjoxNzgyMjA1MjUxfQ.TvhUVX_OunXrZk_Q6qxoT_PY4IZhLOxcUugMlGjBkA8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMCwiaWF0IjoxNzgxNjAwNDUxLCJleHAiOjE3ODQxOTI0NTF9.9p7qkl2xQ5h1bWKB_hoO8c8YS7F2lWRZAuAOVJQcRks', NULL, NULL, NULL, 1, '2026-07-16 09:00:51', '2026-06-16 09:00:51', '2026-06-16 09:00:51'),
(194, 101, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MTYwNTE1OCwiZXhwIjoxNzgyMjA5OTU4fQ.fE4jMYVcly3U6xozX3bODWmMmrVGKEXbxm4UT2ZI4GU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMSwiaWF0IjoxNzgxNjA1MTU4LCJleHAiOjE3ODQxOTcxNTh9.r_Zbgoh4frCyQEd5Wwn6YpQINPvyho0Iz3DAcXhyOIM', NULL, NULL, NULL, 0, '2026-06-16 10:19:27', '2026-06-16 10:19:18', '2026-06-16 10:19:27'),
(195, 101, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MTYwNTE4NiwiZXhwIjoxNzgyMjA5OTg2fQ.9deHlw5n9AwqWcqjn4oVGKi9VGcdLR19emWYxM6csEk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMSwiaWF0IjoxNzgxNjA1MTg2LCJleHAiOjE3ODQxOTcxODZ9.6AUcnYglm7UdwadKBWcRLzgB2HamU20qDVsjDtLjWtM', NULL, NULL, NULL, 0, '2026-06-16 10:24:26', '2026-06-16 10:19:46', '2026-06-16 10:24:26'),
(196, 101, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjI4ODU1NiwiZXhwIjoxNzgyODkzMzU2fQ.CTIQG9KMnKOH8O--vmI2EO2mgmOsDK705T8tirAdbYU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMSwiaWF0IjoxNzgyMjg4NTU2LCJleHAiOjE3ODQ4ODA1NTZ9.QVDQ4EvyoxWLfDfaYvZqi6wMX87TgYxWXJgAcIYKbT0', NULL, NULL, NULL, 1, '2026-07-24 08:09:16', '2026-06-16 10:24:44', '2026-06-24 08:09:16'),
(197, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyMjc2Njk5LCJleHAiOjE3ODI4ODE0OTl9.fojlKRsgmmrkSehsyr8-Yg8q01O8gs_isbYQEGain1w', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODIyNzY2OTksImV4cCI6MTc4NDg2ODY5OX0.5gyn-pdxZ1WJsqkVd_FyaWdtj2ioVPMkuYk39zsl3GE', NULL, NULL, NULL, 0, '2026-06-24 08:15:57', '2026-06-17 02:07:00', '2026-06-24 08:15:57'),
(198, 102, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MTY4Njg3OCwiZXhwIjoxNzgyMjkxNjc4fQ.kMlW-Fe8PZqTI_n7qDr6PdGIervXWZCrMH-qSKfc9s8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMiwiaWF0IjoxNzgxNjg2ODc4LCJleHAiOjE3ODQyNzg4Nzh9.kBdbwqnFHmSmjdhzhHoGLyoh7nFVQBklwXV67VbLUEo', NULL, NULL, NULL, 1, '2026-07-17 09:01:18', '2026-06-17 09:01:18', '2026-06-17 09:01:18'),
(199, 103, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjMwMDI5NiwiZXhwIjoxNzgyOTA1MDk2fQ.JLtQH__bktJvIFkEFIJafJcIhPIY3CwAdTjDena5Cb8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwMywiaWF0IjoxNzgyMzAwMjk2LCJleHAiOjE3ODQ4OTIyOTZ9.-dq86Xqkgh7FIYsZLcLxmcsJf_tJHL9oMMfuimiiHY8', NULL, NULL, NULL, 1, '2026-07-24 11:24:56', '2026-06-17 11:24:44', '2026-06-24 11:24:56'),
(200, 104, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MTcwOTQ0OSwiZXhwIjoxNzgyMzE0MjQ5fQ.I53g2Z1eb-3Ar8ZIY_er-JfUR65R6c6bZHZ2Ui2AL04', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNCwiaWF0IjoxNzgxNzA5NDQ5LCJleHAiOjE3ODQzMDE0NDl9.ZCeg9CnmugNq_32c0MVY5y1OTykiz4BrugQ_rAeUbe4', NULL, NULL, NULL, 1, '2026-07-17 15:17:29', '2026-06-17 15:17:29', '2026-06-17 15:17:29'),
(201, 77, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgxNzMwMjI1LCJleHAiOjE3ODIzMzUwMjV9.rgv0dd0Tq5Jf9pbD40s7US2Df1H8gEQt_7t_5ceVAcI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc3LCJpYXQiOjE3ODE3MzAyMjUsImV4cCI6MTc4NDMyMjIyNX0.hMEaQEUq50Y9UjWMmgqiN6SbPzdCoP0P9DivP1lyTlQ', NULL, NULL, NULL, 1, '2026-07-17 21:03:45', '2026-06-17 21:03:45', '2026-06-17 21:03:45'),
(202, 105, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjU5OTM5MCwiZXhwIjoxNzgzMjA0MTkwfQ.DfcGglUNXyOrJ8IRtWqB7K8x6VT56BEVoSbpGvMF8nw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNSwiaWF0IjoxNzgyNTk5MzkwLCJleHAiOjE3ODUxOTEzOTB9.WVX3esbDEzd16875-fZWIp1zNqJV4kOlaF1FENIZ0Sw', NULL, NULL, NULL, 1, '2026-07-27 22:29:50', '2026-06-18 12:34:09', '2026-06-27 22:29:50'),
(203, 106, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDA1MDU1NywiZXhwIjoxNzg0NjU1MzU3fQ.utRCZ-dNGZkINktgXMAHobHHzF9Z12csrtg50ais4K4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNiwiaWF0IjoxNzg0MDUwNTU3LCJleHAiOjE3ODY2NDI1NTd9.HwG-Y1NBJgJr3f408jE7mQmVv9U_OvL_5mrUGVaQ8RM', NULL, NULL, NULL, 1, '2026-08-13 17:35:57', '2026-06-19 00:38:04', '2026-07-14 17:35:57'),
(204, 107, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MTk1Njg0OCwiZXhwIjoxNzgyNTYxNjQ4fQ.KpMlv3VI5vtRZ9_DYHAbl3VvUOrX69jC-_1V_1ZBNAE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNywiaWF0IjoxNzgxOTU2ODQ4LCJleHAiOjE3ODQ1NDg4NDh9.KRumaHaaLHsq_-lghiGeQFAFpUjVHzartdcUGAurNLw', NULL, NULL, NULL, 1, '2026-07-20 12:00:48', '2026-06-20 12:00:48', '2026-06-20 12:00:48'),
(205, 108, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwOCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjAzMTcwMSwiZXhwIjoxNzgyNjM2NTAxfQ.fX99JMAzpj7qH5FaZdQ342b5mSldgKQv3qIgsbbLp_o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwOCwiaWF0IjoxNzgyMDMxNzAxLCJleHAiOjE3ODQ2MjM3MDF9.l2TyUJ3CtZ3EXW45g8UZU7B5fSybhQ6pjpBLjt63HIA', NULL, NULL, NULL, 1, '2026-07-21 08:48:21', '2026-06-21 08:48:21', '2026-06-21 08:48:21'),
(206, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyMDUxMDM3LCJleHAiOjE3ODI2NTU4Mzd9.V7vXGivdCNIHjgqIY3d2RviOsdsOZjtihKI7Fl0LAH8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODIwNTEwMzcsImV4cCI6MTc4NDY0MzAzN30.jH7fyoGvOenLgIXXnW9hyVYGEtQxPQ8uUZpcRN5B3bw', NULL, NULL, NULL, 0, '2026-06-25 14:41:02', '2026-06-21 14:10:37', '2026-06-25 14:41:02'),
(207, 109, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwOSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjEyNjA2OCwiZXhwIjoxNzgyNzMwODY4fQ.1PTrcTG10VrMIysETKG4ylDe0PVhzfyfRlT_rWZdxio', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwOSwiaWF0IjoxNzgyMTI2MDY4LCJleHAiOjE3ODQ3MTgwNjh9.jrria8LeUaNRx5ktnKrRPfEZBCh0ZNzmYPrHUjkp_Vw', NULL, NULL, NULL, 1, '2026-07-22 11:01:08', '2026-06-22 11:01:08', '2026-06-22 11:01:08'),
(208, 110, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4Mjc5MTA4NywiZXhwIjoxNzgzMzk1ODg3fQ.eb0fDVRHqo9hk39bDUca9z4VnL1uPbM4XoiyK5o14lY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMCwiaWF0IjoxNzgyNzkxMDg3LCJleHAiOjE3ODUzODMwODd9.3Ljbxmbnoie2vcqkjAAAAfcsmbl80UGp71llhHgnPEM', NULL, NULL, NULL, 1, '2026-07-30 03:44:47', '2026-06-22 16:46:25', '2026-06-30 03:44:47'),
(209, 49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyMTQ5ODkxLCJleHAiOjE3ODI3NTQ2OTF9.hPdoYdnLHMD9F0iBpY-AhQwe9hApyP5PePUAOb1bhY0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJpYXQiOjE3ODIxNDk4OTEsImV4cCI6MTc4NDc0MTg5MX0.tyD3yY6ZmOyX4mGRZ1t7IMgtJ-VrjVy61M25rVX3PhI', NULL, NULL, NULL, 0, '2026-06-22 17:38:56', '2026-06-22 17:38:11', '2026-06-22 17:38:56'),
(210, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyNzczMDAzLCJleHAiOjE3ODMzNzc4MDN9.jNIjPSs7Iu67XILb8aIOMFg7EhRK6BttHilapQcZHIQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODI3NzMwMDMsImV4cCI6MTc4NTM2NTAwM30.t8UjsCXoZApZpDEuMguwIJss4KYJHNOVCP-FXndBfT8', NULL, NULL, NULL, 1, '2026-07-29 22:43:23', '2026-06-22 17:40:11', '2026-06-29 22:43:23'),
(211, 111, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjE1MTg1MSwiZXhwIjoxNzgyNzU2NjUxfQ.rIkT7tepxDg9OAbWWc9RghEg_p2Zu6afXe0q0DXb2Qw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMSwiaWF0IjoxNzgyMTUxODUxLCJleHAiOjE3ODQ3NDM4NTF9.2rcPZrGjDK-_mBdzcezF6lmzUYMCd5AHi91dxJmqki4', NULL, NULL, NULL, 1, '2026-07-22 18:10:51', '2026-06-22 18:10:51', '2026-06-22 18:10:51'),
(212, 80, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgzMzQ3MTg1LCJleHAiOjE3ODM5NTE5ODV9.UJEUz48XyIKi90sLGqbdnP9noTkRA1nptwBmkKfD274', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgwLCJpYXQiOjE3ODMzNDcxODUsImV4cCI6MTc4NTkzOTE4NX0.kgzkgMTOiTU0CzB8gu2ZFrMrZ891lDokAnW7kfEEBj8', NULL, NULL, NULL, 1, '2026-08-05 14:13:05', '2026-06-23 05:03:23', '2026-07-06 14:13:05'),
(213, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODI4MTQ4ODEsImV4cCI6MTc4MzQxOTY4MX0.t1aYLiCFKFHHb6WPSRtI7ZqngAKX0HQJe3Fy_kJQ23Y', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MjgxNDg4MSwiZXhwIjoxNzg1NDA2ODgxfQ.J8Nfo4Bn0nIUgD9HN3nrOuN3gDedn0fhBdTSMulmRt4', NULL, NULL, NULL, 1, '2026-07-30 10:21:21', '2026-06-23 09:40:29', '2026-06-30 10:21:21'),
(214, 112, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjI4NzYyMSwiZXhwIjoxNzgyODkyNDIxfQ.ILCYkM0MVgJqPcyFIKFRF_6HNkzDaKrNwBUE1VkEAMY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMiwiaWF0IjoxNzgyMjg3NjIxLCJleHAiOjE3ODQ4Nzk2MjF9.ci8nQnLMhxlXhB2yagH9aRaIkdW0rVhSLy1BZ7fJSl8', NULL, NULL, NULL, 1, '2026-07-24 07:53:41', '2026-06-24 07:53:41', '2026-06-24 07:53:41'),
(215, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyODk4NzcwLCJleHAiOjE3ODM1MDM1NzB9.ItZJpOmETl0aAk9kxJOVhvluGKAC5iM6IwP3k2Y-q0A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODI4OTg3NzAsImV4cCI6MTc4NTQ5MDc3MH0.3pD175X6swVpuli9ni4Qu_zijaDy6dKQKVPdzEdk65w', NULL, NULL, NULL, 1, '2026-07-31 09:39:30', '2026-06-24 08:10:23', '2026-07-01 09:39:30'),
(216, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NTM1NjgwLCJleHAiOjE3ODUxNDA0ODB9.hbTkAY8QY4OQLWVribb8tSUJVTXW_WR0LEpj6puhpvM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODQ1MzU2ODAsImV4cCI6MTc4NzEyNzY4MH0.ZVZLAhSBSf5g09k22tgmMEipSUd84P8ex1wNxP7tWRo', NULL, NULL, NULL, 1, '2026-08-19 08:21:20', '2026-06-24 08:11:31', '2026-07-20 08:21:20'),
(217, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgyMjg4OTY2LCJleHAiOjE3ODI4OTM3NjZ9.FpCtuO9-LzrhKMjXPq1guTqrG10vzWLrbFSiN7yCXJ0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODIyODg5NjYsImV4cCI6MTc4NDg4MDk2Nn0.nd3Heqwe9hIF0Nk2ge54_oEpJNaNJfW-6SvtDSkuLvs', NULL, NULL, NULL, 0, '2026-06-24 08:16:31', '2026-06-24 08:16:06', '2026-06-24 08:16:31'),
(218, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyMjg5MDAyLCJleHAiOjE3ODI4OTM4MDJ9.98mSRBmfEXb_eDjtelYe3nXly45D6GfR7w6NmJsKYQ0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODIyODkwMDIsImV4cCI6MTc4NDg4MTAwMn0.eobAs8GZCruTswTIdanpGXSMUiLf6UoIU1CLHi-K0XQ', NULL, NULL, NULL, 0, '2026-06-29 06:41:34', '2026-06-24 08:16:42', '2026-06-29 06:41:34'),
(219, 113, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjM3NDk0MCwiZXhwIjoxNzgyOTc5NzQwfQ.09tsHpVeSsFYB54MBHjmA4uwbcwpOM5lVaGC10q_kpg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMywiaWF0IjoxNzgyMzc0OTQwLCJleHAiOjE3ODQ5NjY5NDB9.NUrbLFlRrdj8HzL_OhsNqjaIpqGf75kqVvJK-0ho5sw', NULL, NULL, NULL, 1, '2026-07-25 08:09:00', '2026-06-25 08:09:00', '2026-06-25 08:09:00'),
(220, 113, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjM4NDA1NCwiZXhwIjoxNzgyOTg4ODU0fQ.7I8pu5RovY3pwzrWRCT30c37ngL7GHueazUWuZJfmM0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMywiaWF0IjoxNzgyMzg0MDU0LCJleHAiOjE3ODQ5NzYwNTR9.wb71DUAd42gvuBmx2xgQ-zFVVswg_0XL-WRFRjvGRnE', NULL, NULL, NULL, 1, '2026-07-25 10:40:54', '2026-06-25 10:40:54', '2026-06-25 10:40:54'),
(221, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyMzk4NDgyLCJleHAiOjE3ODMwMDMyODJ9.AeQZhYAJJOOKSOdSo7f0dj4MEaBmU-XcFKfr5OX4TiQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODIzOTg0ODIsImV4cCI6MTc4NDk5MDQ4Mn0.bj40lsfz1eWIWEw_-G2UCe73EHGLZM6Ne6wT36BvJNw', NULL, NULL, NULL, 0, '2026-06-25 14:51:20', '2026-06-25 14:41:22', '2026-06-25 14:51:20'),
(222, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzMTgwMjMzLCJleHAiOjE3ODM3ODUwMzN9.fkHqgfcitDQaB5raFawse0G7rh0GFRkj22IvizkUvm0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODMxODAyMzMsImV4cCI6MTc4NTc3MjIzM30.YbHnQLLdjd12P1vxvHHfEhBUULl0uiSeTI-EgkjE2uI', NULL, NULL, NULL, 1, '2026-08-03 15:50:33', '2026-06-25 14:51:31', '2026-07-04 15:50:33'),
(223, 114, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjQxNjA4MiwiZXhwIjoxNzgzMDIwODgyfQ.R3cuNC_EHttkGDJW-C7KTo-QQBAjW9VBKP-YQfeCHT8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNCwiaWF0IjoxNzgyNDE2MDgyLCJleHAiOjE3ODUwMDgwODJ9.AoGxYLvsNZ7Bwh0CBrVtEahU9a-LK2d55GvGejMn8vY', NULL, NULL, NULL, 1, '2026-07-25 19:34:42', '2026-06-25 19:34:42', '2026-06-25 19:34:42'),
(224, 115, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjQ2ODcyNSwiZXhwIjoxNzgzMDczNTI1fQ.CEEaVxTJ4ih6ogx5p5FUSM6zI8ZSqhnvM54Gt_AfbvE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNSwiaWF0IjoxNzgyNDY4NzI1LCJleHAiOjE3ODUwNjA3MjV9.a430ZvFjKQe6n4cXE0RbUNhhKJhm3Ov7wwWueyYMGYs', NULL, NULL, NULL, 1, '2026-07-26 10:12:05', '2026-06-26 10:12:05', '2026-06-26 10:12:05'),
(225, 69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg0MjA3MTM5LCJleHAiOjE3ODQ4MTE5Mzl9.-FaK0hm-VD-TVP8qqxrvOvXXWex7u-M4ECOe8pYrY6g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJpYXQiOjE3ODQyMDcxMzksImV4cCI6MTc4Njc5OTEzOX0.v7WFgu0rjaNYU5vhhW01K-jXEhJtUTelI2K7vvaRke8', NULL, NULL, NULL, 1, '2026-08-15 13:05:39', '2026-06-27 05:14:53', '2026-07-16 13:05:39'),
(226, 116, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjU2Nzk0OCwiZXhwIjoxNzgzMTcyNzQ4fQ.Dhyb_--_Uqw3W_QcNU5aO2N-ejSo93OrVtPVLYg4BCg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNiwiaWF0IjoxNzgyNTY3OTQ4LCJleHAiOjE3ODUxNTk5NDh9.z5qjD_LI7hWDcr6nLH4D6h1jS_RRkQ8e8wilH-UVn90', NULL, NULL, NULL, 1, '2026-07-27 13:45:48', '2026-06-27 13:45:48', '2026-06-27 13:45:48'),
(227, 117, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjU4MzczMSwiZXhwIjoxNzgzMTg4NTMxfQ.eN7G47dL0LdmT-t-3ivmUeZ28qygeOcD4eee-bUOxYs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNywiaWF0IjoxNzgyNTgzNzMxLCJleHAiOjE3ODUxNzU3MzF9.o9s6YcwoNzheG_fsi6996znJuHAhb0URgpXeEKHr-4U', NULL, NULL, NULL, 1, '2026-07-27 18:08:51', '2026-06-27 18:08:51', '2026-06-27 18:08:51'),
(228, 105, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTIzMjQwMywiZXhwIjoxNzg1ODM3MjAzfQ.DBhp1ybgICE5zbFKDHy0YPb872RfSZkSNDSBywpqPV4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNSwiaWF0IjoxNzg1MjMyNDAzLCJleHAiOjE3ODc4MjQ0MDN9.7FzbFVv074XMxGIJ8RhgQc4rqjvfPBlyKC2NbTtAfW8', NULL, NULL, NULL, 1, '2026-08-27 09:53:23', '2026-06-28 10:19:34', '2026-07-28 09:53:23'),
(229, 118, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExOCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjY1OTU5OSwiZXhwIjoxNzgzMjY0Mzk5fQ.ugljXKopZV9qh98t1Qr6snTAFVAyicFqW7VAXkRE54U', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExOCwiaWF0IjoxNzgyNjU5NTk5LCJleHAiOjE3ODUyNTE1OTl9.DhEAnvfKGGqt1xLJ1Srk2GEh9NPFglkJiSOiKu_hbd0', NULL, NULL, NULL, 1, '2026-07-28 15:13:19', '2026-06-28 15:13:19', '2026-06-28 15:13:19'),
(230, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODI3MTUzMTUsImV4cCI6MTc4MzMyMDExNX0.hyDgq2PJrEP1lfW7NeaLQi82o7a9-Z7sAyT5a1FTYNQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MjcxNTMxNSwiZXhwIjoxNzg1MzA3MzE1fQ.ya4fEHo3oL8z-ZYgI8wbpTRsf0SLH_U3YZgnsbhcnbA', NULL, NULL, NULL, 0, '2026-06-29 07:34:14', '2026-06-29 06:41:55', '2026-06-29 07:34:14'),
(231, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODI3MTUzMTgsImV4cCI6MTc4MzMyMDExOH0.4rPkxf95wlvuqlvtzj-sCmEvDI9RJvxcDvsZjSvAoio', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MjcxNTMxOCwiZXhwIjoxNzg1MzA3MzE4fQ.wvyoHvwlg4w5VuhkSvkymbHoPZ2vgYE0xA2V6KgF9XE', NULL, NULL, NULL, 0, '2026-06-29 07:35:47', '2026-06-29 06:41:58', '2026-06-29 07:35:47'),
(232, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgyNzE4NDkzLCJleHAiOjE3ODMzMjMyOTN9.aocf8LnNfrh1URHfR2nUV34R1K27yUYJFQ_C5QzKMM8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3ODI3MTg0OTMsImV4cCI6MTc4NTMxMDQ5M30.BjNiAB_tGv4eIvszFE4oSool0aWnJf9fPks8j3uHhQI', NULL, NULL, NULL, 0, '2026-06-29 07:40:47', '2026-06-29 07:34:53', '2026-06-29 07:40:47'),
(233, 64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgyNzE4NTk5LCJleHAiOjE3ODMzMjMzOTl9.dLyNOuCN8X33c-qR4EjUJdZfyLYF8i2dZY_xpcvWkkA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY0LCJpYXQiOjE3ODI3MTg1OTksImV4cCI6MTc4NTMxMDU5OX0.HwZeAMoOCRjnCH-LlRwIg1z7eBLicxr3EnGt7lKJkrA', NULL, NULL, NULL, 0, '2026-06-29 09:00:08', '2026-06-29 07:36:39', '2026-06-29 09:00:08');
INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `device_info`, `ip_address`, `user_agent`, `is_active`, `expires_at`, `created_at`, `updated_at`) VALUES
(234, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzNTAzMTA4LCJleHAiOjE3ODQxMDc5MDh9.p-mKcNrvwQQz02hwDmLSv-UGxfdDlI6tq5f7XQPUTmk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODM1MDMxMDgsImV4cCI6MTc4NjA5NTEwOH0.RaUrcQJgklqIHA7jG7F7uW3qTXBO-HdnyhSYv6qIe5M', NULL, NULL, NULL, 1, '2026-08-07 09:31:48', '2026-06-29 22:43:47', '2026-07-08 09:31:48'),
(235, 119, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExOSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4Mjc4Njk1OSwiZXhwIjoxNzgzMzkxNzU5fQ.XcM65-rvL-4WDeMw9QES1T4ZY6jPkoV7orTrbqVq_eU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExOSwiaWF0IjoxNzgyNzg2OTU5LCJleHAiOjE3ODUzNzg5NTl9.VC2bgZkuDnPo-agx3QZNXyWnZtycF-NoElOev04c7kY', NULL, NULL, NULL, 1, '2026-07-30 02:35:59', '2026-06-30 02:35:59', '2026-06-30 02:35:59'),
(236, 110, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMCwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4NDk3Mjg4MywiZXhwIjoxNzg1NTc3NjgzfQ.pFFbMivu53uBrwFuins3L6-N-Vo29fdlRO70bye-ilU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExMCwiaWF0IjoxNzg0OTcyODgzLCJleHAiOjE3ODc1NjQ4ODN9.QenV21GMihdSKO1bpvyJe85vbsFZLCW9klu9spZ6yU0', NULL, NULL, NULL, 1, '2026-08-24 09:48:03', '2026-06-30 03:45:11', '2026-07-25 09:48:03'),
(237, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODI3OTQ0ODMsImV4cCI6MTc4MzM5OTI4M30.EByq7vArMf2i0nje68m9co3AVLkfg7_N1YpVA69wF1k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4Mjc5NDQ4MywiZXhwIjoxNzg1Mzg2NDgzfQ.CZa8Bh3xhsCxc74WSU-40qRrlKwE4AMwZu-QXOBPANc', NULL, NULL, NULL, 0, '2026-06-30 08:31:08', '2026-06-30 04:41:23', '2026-06-30 08:31:08'),
(238, 120, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMCwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzgzNTY3MCwiZXhwIjoxNzg0NDQwNDcwfQ.DLX623aKaHyIeebFhqwcM7xjpQ09QLT73FMH4WZTsro', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMCwiaWF0IjoxNzgzODM1NjcwLCJleHAiOjE3ODY0Mjc2NzB9.f9A0LznkNj_hPVXJBTMVlCXdttqPeJOzChdNp190Rho', NULL, NULL, NULL, 1, '2026-08-11 05:54:30', '2026-06-30 05:59:47', '2026-07-12 05:54:30'),
(239, 121, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjgwODUxOCwiZXhwIjoxNzgzNDEzMzE4fQ.p77oJeQC4SynaJUDpgYU5GYn_cJB7zSsiFabb_5SkzY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwiaWF0IjoxNzgyODA4NTE4LCJleHAiOjE3ODU0MDA1MTh9.-u0Surkr-gZrIpvpA7cECdCr4fEIQJElsHl-gJzmLYA', NULL, NULL, NULL, 1, '2026-07-30 08:35:18', '2026-06-30 08:35:18', '2026-06-30 08:35:18'),
(240, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODI4MDk4NTEsImV4cCI6MTc4MzQxNDY1MX0.FSEglMGuqMO5cOA1xR9RUwtwKUJopwgbiRS3MU2rSpU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MjgwOTg1MSwiZXhwIjoxNzg1NDAxODUxfQ.gTFVOjDhopHHUQmk6zZ7YZ9Rzrqp6aoXSRuohSV6Dbw', NULL, NULL, NULL, 0, '2026-07-05 08:07:30', '2026-06-30 08:57:31', '2026-07-05 08:07:30'),
(241, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODM0ODYwMDAsImV4cCI6MTc4NDA5MDgwMH0.ZczrkHSqDJ0itS_y_6iobnoWKTA_b7lwx_nss9rMTuI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MzQ4NjAwMCwiZXhwIjoxNzg2MDc4MDAwfQ.-nzAs-Rz1txhqN71gRr83aW_4pG2zHk48Ijmb-QHjEo', NULL, NULL, NULL, 1, '2026-08-07 04:46:40', '2026-06-30 10:21:28', '2026-07-08 04:46:40'),
(242, 122, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjgzMjYyNiwiZXhwIjoxNzgzNDM3NDI2fQ.rLVLf5e0pz3ftjCZWQy-ukwQKPLfQNfcdcY0s39S3Ho', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMiwiaWF0IjoxNzgyODMyNjI2LCJleHAiOjE3ODU0MjQ2MjZ9.hQMLZp8xMstqB6TwWlIeYHbrf4F-RtI-MZxOrGXIkbI', NULL, NULL, NULL, 1, '2026-07-30 15:17:06', '2026-06-30 15:17:06', '2026-06-30 15:17:06'),
(243, 123, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4Mjg3OTAyMCwiZXhwIjoxNzgzNDgzODIwfQ.TFemRUsZZZSd4qaSxZnlcKYHhfHhq8nhe4iSnbHb_zU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiaWF0IjoxNzgyODc5MDIwLCJleHAiOjE3ODU0NzEwMjB9.Lz-2c_V0NADneQUQMVDIlLvhsZXmzrXnXs6ALpCiagw', NULL, NULL, NULL, 1, '2026-07-31 04:10:20', '2026-07-01 04:10:20', '2026-07-01 04:10:20'),
(244, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODI4OTg3ODMsImV4cCI6MTc4MzUwMzU4M30.Rm3e-m2o4JeSyQoulGACS1D9BayRSgCmo8mNo2pqDp0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4Mjg5ODc4MywiZXhwIjoxNzg1NDkwNzgzfQ.i5ZaIBWebdDI12k3EnM-vGuli8CmE8_hJ9psw8uP-w8', NULL, NULL, NULL, 0, '2026-07-04 09:44:21', '2026-07-01 09:39:43', '2026-07-04 09:44:21'),
(245, 124, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjkwMDM4NiwiZXhwIjoxNzgzNTA1MTg2fQ.MrHwhPXqjN_8z-bpAm98hkveWEzKpnlYlnPw6QDsM3E', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNCwiaWF0IjoxNzgyOTAwMzg2LCJleHAiOjE3ODU0OTIzODZ9.-ywFPkV6qX8JpHHdHbXicmGFHdaDoY5Gn4r4FaG3F0I', NULL, NULL, NULL, 1, '2026-07-31 10:06:26', '2026-07-01 10:06:26', '2026-07-01 10:06:26'),
(246, 125, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzUzOTAzOCwiZXhwIjoxNzg0MTQzODM4fQ.ojRPtXmuc-AHQtYbK0W9w4jMrDoyFAb-4BYrB6MQaoA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNSwiaWF0IjoxNzgzNTM5MDM4LCJleHAiOjE3ODYxMzEwMzh9.C3hu2wtk77cL6GctbDaLlEmJRfexaG5So95lj3o89kI', NULL, NULL, NULL, 1, '2026-08-07 19:30:38', '2026-07-01 11:09:41', '2026-07-08 19:30:38'),
(247, 126, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MjkwODY5NCwiZXhwIjoxNzgzNTEzNDk0fQ.sdIgpk_qWHhs7jzcQ9hQ5e0UPCUZxETN9t5Pinfwbzo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNiwiaWF0IjoxNzgyOTA4Njk0LCJleHAiOjE3ODU1MDA2OTR9.K5a6ZvNSaRIYSCoO_cH_I-CdQh7-Hl57MPapGtF1BSI', NULL, NULL, NULL, 1, '2026-07-31 12:24:54', '2026-07-01 12:24:54', '2026-07-01 12:24:54'),
(248, 127, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4Mjk3MzUyMiwiZXhwIjoxNzgzNTc4MzIyfQ.O3MwfruwWXLeIt_CEu82vza_nYWh8zfpPxNtk-7c0VU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNywiaWF0IjoxNzgyOTczNTIyLCJleHAiOjE3ODU1NjU1MjJ9.70qNCYjjeg_zHyWUMzkLhtpg-Ld_vL_kKrb__a3vfMM', NULL, NULL, NULL, 1, '2026-08-01 06:25:22', '2026-07-02 06:25:22', '2026-07-02 06:25:22'),
(249, 128, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOCwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4Mjk3NDA3NSwiZXhwIjoxNzgzNTc4ODc1fQ.LLcVhu0k5Ute6Yf3Oc2NPCNEdlDMclEYyod-s_-S4y8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOCwiaWF0IjoxNzgyOTc0MDc1LCJleHAiOjE3ODU1NjYwNzV9.FLy-ySUPY3yJM3loxxEHRsfg_vzQCLSdzPZ2ZWH839E', NULL, NULL, NULL, 1, '2026-08-01 06:34:35', '2026-07-02 06:34:35', '2026-07-02 06:34:35'),
(250, 129, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzY3NTM4NCwiZXhwIjoxNzg0MjgwMTg0fQ.EjhpeCxJhPyWjiftCBcxptsyLEJCF3lr6L7YhsZeOmc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOSwiaWF0IjoxNzgzNjc1Mzg0LCJleHAiOjE3ODYyNjczODR9.QNdqyC5_FP82qfIScRbiXufdldG9b23Fs82EA6HmNKo', NULL, NULL, NULL, 1, '2026-08-09 09:23:04', '2026-07-02 10:00:14', '2026-07-10 09:23:04'),
(251, 130, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzAwMzAyMCwiZXhwIjoxNzgzNjA3ODIwfQ.2EXLwQktaTLZ0i8pVvjYdMS-rt9Gu2MPPKQyexSnOjE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMCwiaWF0IjoxNzgzMDAzMDIwLCJleHAiOjE3ODU1OTUwMjB9.xiAysxW52HCIoo1QsXVs33DASjE9yIDvx0IYe30Wi0o', NULL, NULL, NULL, 1, '2026-08-01 14:37:00', '2026-07-02 14:37:00', '2026-07-02 14:37:00'),
(252, 131, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzA3MjAyNiwiZXhwIjoxNzgzNjc2ODI2fQ.-_6zm_j4vGNZ1foM_gQb4ReJVk6aaVlMABw8dyzxqyQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMSwiaWF0IjoxNzgzMDcyMDI2LCJleHAiOjE3ODU2NjQwMjZ9.BX-Fn9EaO-8pipEnyvq5YKMfiyFEWGzHakP5bYMbSXk', NULL, NULL, NULL, 1, '2026-08-02 09:47:06', '2026-07-03 09:47:06', '2026-07-03 09:47:06'),
(253, 132, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMiwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzA3MzIzOSwiZXhwIjoxNzgzNjc4MDM5fQ.vXWkLu8ic6ufrJf6M3R6mLIbmbQPW5wepwVMg_HNCro', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMiwiaWF0IjoxNzgzMDczMjM5LCJleHAiOjE3ODU2NjUyMzl9.EFsiUd2VSmiYbQ8LMGbS9hYZff_KbWLAGZbbyEuf_oc', NULL, NULL, NULL, 1, '2026-08-02 10:07:19', '2026-07-03 10:07:19', '2026-07-03 10:07:19'),
(254, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0OTg1Nzc4LCJleHAiOjE3ODU1OTA1Nzh9.NtEY9gEDc6HQ0vdiRa7qXaMRkYIbQg12W4rkOh3OFzU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODQ5ODU3NzgsImV4cCI6MTc4NzU3Nzc3OH0.mIV82q8IiXMsYUjbRdLqN39UN92Hg_b4LOfQueu0Nug', NULL, NULL, NULL, 1, '2026-08-24 13:22:58', '2026-07-03 11:57:29', '2026-07-25 13:22:58'),
(255, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODMwODAyNzIsImV4cCI6MTc4MzY4NTA3Mn0.JP7QEnUaM9ds47YLtXGvJKWAnZENxKACD7fDDwJsWkc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MzA4MDI3MiwiZXhwIjoxNzg1NjcyMjcyfQ.1OPxy84OI8Ort3tdBa87-WTkPSsR7axcYyNRB0UPI0Q', NULL, NULL, NULL, 1, '2026-08-02 12:04:32', '2026-07-03 12:04:32', '2026-07-03 12:04:32'),
(256, 133, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMywidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzA4MjUyNSwiZXhwIjoxNzgzNjg3MzI1fQ.sr4hHD_wSCzIUYP0Ger58ry-pjqTktMC9Lb3ujW5M24', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzMywiaWF0IjoxNzgzMDgyNTI1LCJleHAiOjE3ODU2NzQ1MjV9.e7Z3imMI-0GRhyNjZl50I1RSgBBKbbXzl-MQqTjp7GU', NULL, NULL, NULL, 1, '2026-08-02 12:42:05', '2026-07-03 12:42:05', '2026-07-03 12:42:05'),
(257, 134, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzA4MjU1NiwiZXhwIjoxNzgzNjg3MzU2fQ.2mxEVyDAuY_lux4GbVvAN7nmoE1m_M3vmE3RXAkbm9A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNCwiaWF0IjoxNzgzMDgyNTU2LCJleHAiOjE3ODU2NzQ1NTZ9.nedFpYKoL-cIdhFdy7NqypeD3NbnjqjY6Vrtl3UfOQo', NULL, NULL, NULL, 1, '2026-08-02 12:42:36', '2026-07-03 12:42:36', '2026-07-03 12:42:36'),
(258, 135, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzcwODUxOCwiZXhwIjoxNzg0MzEzMzE4fQ.GmsB297GwUufnpxzmN4GRqLT-0VnGF6fKBNUuQ4vmp0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNSwiaWF0IjoxNzgzNzA4NTE4LCJleHAiOjE3ODYzMDA1MTh9.8bmbg38E-q2uZOjLiAKuaosqv8tFd4_uve_yQJvqyxo', NULL, NULL, NULL, 1, '2026-08-09 18:35:18', '2026-07-03 14:10:09', '2026-07-10 18:35:18'),
(259, 136, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzA5ODU5MCwiZXhwIjoxNzgzNzAzMzkwfQ.gw9wQa9qNhRxsbreE-u4qlBogSm2Ew06hABud9EcmIU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNiwiaWF0IjoxNzgzMDk4NTkwLCJleHAiOjE3ODU2OTA1OTB9.gHpyVgn4F42j2FQRmcgqxaES6zPNw5PR_1g98TNKZ-M', NULL, NULL, NULL, 1, '2026-08-02 17:09:50', '2026-07-03 17:09:50', '2026-07-03 17:09:50'),
(260, 137, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzEyODQ0NiwiZXhwIjoxNzgzNzMzMjQ2fQ.S8nm7WnKr9jLA6b9rhHUYc_dHXHMw6BuHtOJ6ZVGLx4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzNywiaWF0IjoxNzgzMTI4NDQ2LCJleHAiOjE3ODU3MjA0NDZ9.P30QmITz_SRyNolgvR4vaMjg-QEpsHisVEjUGHxiL5M', NULL, NULL, NULL, 1, '2026-08-03 01:27:26', '2026-07-04 01:27:26', '2026-07-04 01:27:26'),
(261, 138, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzOCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzE0NTc2MiwiZXhwIjoxNzgzNzUwNTYyfQ.V8Bh5xcashpMQw2oPyWaStKHDFf-RmDesmSAgdOqzBY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzOCwiaWF0IjoxNzgzMTQ1NzYyLCJleHAiOjE3ODU3Mzc3NjJ9.D_5nhEB087vPZZTwF6Z5A9rx9ilNXIyAbVrBlxXAyuE', NULL, NULL, NULL, 1, '2026-08-03 06:16:02', '2026-07-04 06:16:02', '2026-07-04 06:16:02'),
(262, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODMxNTM3NDIsImV4cCI6MTc4Mzc1ODU0Mn0.7KAvI64KjuvTnKaXGRNtIq1wWvILWvqZrXtiip1CDjg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MzE1Mzc0MiwiZXhwIjoxNzg1NzQ1NzQyfQ.QSNT__yIJ7YqHF7NPU9ENP_fvJAsxiV7tVyXjrfUUT8', NULL, NULL, NULL, 1, '2026-08-03 08:29:02', '2026-07-04 08:29:02', '2026-07-04 08:29:02'),
(263, 58, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU4LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg0NzA3MjU4LCJleHAiOjE3ODUzMTIwNTh9.YtQnyHAZpcL0a7-aE82XK3zgpVSQ-qXwPjYsYHTxQVY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU4LCJpYXQiOjE3ODQ3MDcyNTgsImV4cCI6MTc4NzI5OTI1OH0.5IKZFOxx4_XBCy4JImHZACyiJraXudr8Jv4G3hKWp48', NULL, NULL, NULL, 1, '2026-08-21 08:00:58', '2026-07-04 08:37:58', '2026-07-22 08:00:58'),
(264, 139, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzOSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzE1NzU0NSwiZXhwIjoxNzgzNzYyMzQ1fQ.ThGrhEIOXHBxlK5sw9Dds3U-XlixOFB_XHJHrwOfkww', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzOSwiaWF0IjoxNzgzMTU3NTQ1LCJleHAiOjE3ODU3NDk1NDV9.JdPXtx9GwHNGjIBI6mByk34erTA1m56n2_R-F5ZxSLk', NULL, NULL, NULL, 1, '2026-08-03 09:32:25', '2026-07-04 09:32:25', '2026-07-04 09:32:25'),
(265, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzMTU4MjcwLCJleHAiOjE3ODM3NjMwNzB9.sPoWv54Mr7lDRfDlaHoP2gdAUXHJTUwCkTMLxQXKifQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODMxNTgyNzAsImV4cCI6MTc4NTc1MDI3MH0.eHzWGVFb-lpHSBq73Y3HBmON_L0BvSR_3NRVAk9RV7M', NULL, NULL, NULL, 0, '2026-07-04 09:45:23', '2026-07-04 09:44:30', '2026-07-04 09:45:23'),
(266, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzMTU4MzMyLCJleHAiOjE3ODM3NjMxMzJ9.RYFmmIuYf9saogXKx8jTAJaoa2z_6ILNXLcSjVKFWPE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODMxNTgzMzIsImV4cCI6MTc4NTc1MDMzMn0.7H5t9F9EcGgfS8HeaRQGYzuKH57uMBqnNP_kEZ0ujTY', NULL, NULL, NULL, 0, '2026-07-06 08:29:53', '2026-07-04 09:45:32', '2026-07-06 08:29:53'),
(267, 139, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzOSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzE1OTQ3NSwiZXhwIjoxNzgzNzY0Mjc1fQ.2o_lsLos34MY0yRdPxMIXkf9xsNy7F2cSoZzUxPdZuI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzOSwiaWF0IjoxNzgzMTU5NDc1LCJleHAiOjE3ODU3NTE0NzV9.-UyU9lQSFLQvrZC7JRxYgPsEa67Occ2uLSxrxRonxAA', NULL, NULL, NULL, 1, '2026-08-03 10:04:35', '2026-07-04 10:04:35', '2026-07-04 10:04:35'),
(268, 140, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzE3Mzk4MSwiZXhwIjoxNzgzNzc4NzgxfQ.isbNEEfkc1636lswVjjlztcCBd_8KUnu5FStIEakahU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MCwiaWF0IjoxNzgzMTczOTgxLCJleHAiOjE3ODU3NjU5ODF9.yfcBZaMFQNLJNPeZimm_OCa0uHxY_DiMxEoZuRdDq1Q', NULL, NULL, NULL, 1, '2026-08-03 14:06:21', '2026-07-04 14:06:21', '2026-07-04 14:06:21'),
(269, 141, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzE3Mzk4NywiZXhwIjoxNzgzNzc4Nzg3fQ.1E8shDYx5aju0tltwjeZgJpkjrnwNwmTUCGGbufLsLE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MSwiaWF0IjoxNzgzMTczOTg3LCJleHAiOjE3ODU3NjU5ODd9.oU4ghXHqWDwsrLwJXSibKcBfJnpk9bfNGThJE8UrD2o', NULL, NULL, NULL, 1, '2026-08-03 14:06:27', '2026-07-04 14:06:27', '2026-07-04 14:06:27'),
(270, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NDU4NjkwLCJleHAiOjE3ODUwNjM0OTB9.-wEMoTB_mFr_8gToHcpdhmLfLVobFabhsWNaA3Yd4-0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODQ0NTg2OTAsImV4cCI6MTc4NzA1MDY5MH0.MDrpjugM5TFQfvYYuW9WfLy9mEMlr06pO7Y7V4_BzHU', NULL, NULL, NULL, 1, '2026-08-18 10:58:10', '2026-07-04 15:50:59', '2026-07-19 10:58:10'),
(271, 142, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzIzODQzMCwiZXhwIjoxNzgzODQzMjMwfQ.6mS1T2h9sdkAn2CzYOBcuspmNPRBdLbRRyG9Ha6_NT0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MiwiaWF0IjoxNzgzMjM4NDMwLCJleHAiOjE3ODU4MzA0MzB9.Hy-NS1YnUGjTq3iQZlgX2PsfdYRQxqn2Gm1Y53RQRdY', NULL, NULL, NULL, 1, '2026-08-04 08:00:30', '2026-07-05 08:00:30', '2026-07-05 08:00:30'),
(272, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzMjM4ODYzLCJleHAiOjE3ODM4NDM2NjN9.1iXnibxI4Dr2VBbJ05S_Gmcm2uGPH9Yf2fIaxwaBLGE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODMyMzg4NjMsImV4cCI6MTc4NTgzMDg2M30.lFNdezmdj3QXKz8mmIpB_BkE5Eh71FXdzVgowsnO5jA', NULL, NULL, NULL, 0, '2026-07-06 07:44:40', '2026-07-05 08:07:43', '2026-07-06 07:44:40'),
(273, 143, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzI1NDMxNCwiZXhwIjoxNzgzODU5MTE0fQ.ZTd0DMycq4qffCPESozPR_1gqTjoIQkpTW_MSktP7p0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0MywiaWF0IjoxNzgzMjU0MzE0LCJleHAiOjE3ODU4NDYzMTR9.Q0VN3Iwfa8cOSXPv9gistqJ9nNqXDBngqAgg53cSyZ4', NULL, NULL, NULL, 1, '2026-08-04 12:25:14', '2026-07-05 12:25:14', '2026-07-05 12:25:14'),
(274, 144, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzMwODUyNiwiZXhwIjoxNzgzOTEzMzI2fQ.QCtTEQNPIAGdPH_lpWs8bgDWlNhZp63K6E6EKN6JBw0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NCwiaWF0IjoxNzgzMzA4NTI2LCJleHAiOjE3ODU5MDA1MjZ9.47zIO2ratFPS45gwQd7gnamKmMfN7m9Ps0a6Ucg5Qtw', NULL, NULL, NULL, 1, '2026-08-05 03:28:46', '2026-07-06 03:28:46', '2026-07-06 03:28:46'),
(275, 145, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzMxMDgzNSwiZXhwIjoxNzgzOTE1NjM1fQ.idM-40EjV91gc9lUW4eq6kOIiUW2lfkMNIbhDmmv2M8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NSwiaWF0IjoxNzgzMzEwODM1LCJleHAiOjE3ODU5MDI4MzV9.phCZxQYb_RLs-jr1oz7niHFxkOOrMZIwfYGVj1iAWvo', NULL, NULL, NULL, 1, '2026-08-05 04:07:15', '2026-07-06 04:07:15', '2026-07-06 04:07:15'),
(276, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgzMzIzOTI2LCJleHAiOjE3ODM5Mjg3MjZ9.0fexuvoXAUiVtUClj6eY5Oo02OkrWRrDOgQwM_4ftOw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODMzMjM5MjYsImV4cCI6MTc4NTkxNTkyNn0.2iKN8CX6oX1ZMxu66KQyT79e7nrx1VMx6nwXN3D6Ub0', NULL, NULL, NULL, 0, '2026-07-06 08:19:10', '2026-07-06 07:45:26', '2026-07-06 08:19:10'),
(277, 146, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDYxNjE0NywiZXhwIjoxNzg1MjIwOTQ3fQ.MqRAhTBTPj4Nnxv-J7afQgOhlkHU1nenUYBDcKEDhYg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NiwiaWF0IjoxNzg0NjE2MTQ3LCJleHAiOjE3ODcyMDgxNDd9.QQz9je738AIaSbZmyCovhVE5pYOdjX2_At55fHMVWRc', NULL, NULL, NULL, 0, '2026-07-21 07:16:36', '2026-07-06 07:54:31', '2026-07-21 07:16:36'),
(278, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzMzI1OTYyLCJleHAiOjE3ODM5MzA3NjJ9.cw5uGTXKqWD_zjwsO7MhYrdvymFCi89YaQI3W83FAxQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODMzMjU5NjIsImV4cCI6MTc4NTkxNzk2Mn0.QcJjqmuY1ISBZoIle2iIYXWKQRcuYMgdNXO261dlQwY', NULL, NULL, NULL, 0, '2026-07-06 08:19:38', '2026-07-06 08:19:22', '2026-07-06 08:19:38'),
(279, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODMzMjU5ODgsImV4cCI6MTc4MzkzMDc4OH0.5rBFdDYeqvLOWQkY1z3tITfyAUw7u95pliY70XX-6go', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MzMyNTk4OCwiZXhwIjoxNzg1OTE3OTg4fQ.qhn39tNV22djdkbum9EmhRBkAB6HFA-vqS6gXZA9qwk', NULL, NULL, NULL, 0, '2026-07-06 08:20:30', '2026-07-06 08:19:48', '2026-07-06 08:20:30'),
(280, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzMzI2MDM2LCJleHAiOjE3ODM5MzA4MzZ9.rSByGOVRaniqblkievG4oXJh0POtejearHLWAG1Dd-w', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODMzMjYwMzYsImV4cCI6MTc4NTkxODAzNn0.ZaGd2OEKRvfw8qG5C05hSQ3hMEmWsOZtyZiFHoWg04M', NULL, NULL, NULL, 0, '2026-07-09 09:14:32', '2026-07-06 08:20:36', '2026-07-09 09:14:32'),
(281, 147, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzMyNjYwNSwiZXhwIjoxNzgzOTMxNDA1fQ.vs77S7pI2KEwSTegSvLtfgbnch6lpHoiYna6Rw656dw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NywiaWF0IjoxNzgzMzI2NjA1LCJleHAiOjE3ODU5MTg2MDV9.sU8ENLV8dzWht2nm0VMrKOC7KMzYjeBc_AKCtZo_vQ0', NULL, NULL, NULL, 0, '2026-07-06 08:36:28', '2026-07-06 08:30:05', '2026-07-06 08:36:28'),
(282, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzMzI2OTk2LCJleHAiOjE3ODM5MzE3OTZ9.ruz7n8RY-7xZGCI4v9Dmc7NTBfmYVRWSiAQIVi5zpck', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODMzMjY5OTYsImV4cCI6MTc4NTkxODk5Nn0.vgGPO8DI58aL9KjthBF80yQQcMpHLiftXSYHmtrxWTM', NULL, NULL, NULL, 0, '2026-07-06 08:36:58', '2026-07-06 08:36:36', '2026-07-06 08:36:58'),
(283, 80, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgwLCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgzMzQ3MjEzLCJleHAiOjE3ODM5NTIwMTN9.knnavwzOR0riBe5IyMe_isa84mc6m4hU_F5zlC22qkQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgwLCJpYXQiOjE3ODMzNDcyMTMsImV4cCI6MTc4NTkzOTIxM30.LKMJdVJP4hcR-Loi6Nigy-eztykXkDSYEq9gRp7H3pU', NULL, NULL, NULL, 1, '2026-08-05 14:13:33', '2026-07-06 14:13:33', '2026-07-06 14:13:33'),
(284, 148, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0OCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzM1NjkwMiwiZXhwIjoxNzgzOTYxNzAyfQ.wHRx47jhVStBBLmM4I8HApjt7uGQ6FZUX77SVvIaTgs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0OCwiaWF0IjoxNzgzMzU2OTAyLCJleHAiOjE3ODU5NDg5MDJ9.El8d-R_0ozhNtXipn78NQVEovx-s_qLlUJN3Yw5E2hc', NULL, NULL, NULL, 1, '2026-08-05 16:55:02', '2026-07-06 16:55:02', '2026-07-06 16:55:02'),
(285, 149, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0OSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzQxMTAwMywiZXhwIjoxNzg0MDE1ODAzfQ.otr1GJnMxpewaJd5zrhKaH6jrs9dhZFf4R1jTyxNevc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0OSwiaWF0IjoxNzgzNDExMDAzLCJleHAiOjE3ODYwMDMwMDN9.P1JlwcDsLZTL4kXmTmc3WFXiEOOKu6wPtIf3hvnIWqc', NULL, NULL, NULL, 1, '2026-08-06 07:56:43', '2026-07-07 07:56:43', '2026-07-07 07:56:43'),
(286, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQxMzEwMDUsImV4cCI6MTc4NDczNTgwNX0.N6BwpAA00DlW2aV-eIm4_ZM5BQWmw3g2OAHKj3EWv_w', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDEzMTAwNSwiZXhwIjoxNzg2NzIzMDA1fQ.bkVkpc3FSj1eAcQpB-Bdvk3T4B6zmufMjHwhit8BfUs', NULL, NULL, NULL, 1, '2026-08-14 15:56:45', '2026-07-08 04:46:45', '2026-07-15 15:56:45'),
(287, 128, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOCwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4NDQwMDQ2MiwiZXhwIjoxNzg1MDA1MjYyfQ.vyd1PjMWJRiYLCy2hHI9YmxpRjNetE4Gro9P4FnG788', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOCwiaWF0IjoxNzg0NDAwNDYyLCJleHAiOjE3ODY5OTI0NjJ9.5H8CuPRSQbxDTl_rqmhyLOwaY2HtQIloaOpmXEQ8ghs', NULL, NULL, NULL, 1, '2026-08-17 18:47:42', '2026-07-08 08:32:15', '2026-07-18 18:47:42'),
(288, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0MTEwNzU3LCJleHAiOjE3ODQ3MTU1NTd9.yAo9fEQ-2uHk-cKMD7UVJ9DMDYOvpsB4BRvD3OrgtjQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODQxMTA3NTcsImV4cCI6MTc4NjcwMjc1N30.F5AlToky3JTuCEstI8oBQBbFtdVb9-nULj3v7Yh8yHE', NULL, NULL, NULL, 1, '2026-08-14 10:19:17', '2026-07-08 09:32:37', '2026-07-15 10:19:17'),
(289, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODM1ODg0ODMsImV4cCI6MTc4NDE5MzI4M30.C1KnE283H6iHHpKs6iRA4en3xQ_JTCNRY2ZZv_o5XYg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MzU4ODQ4MywiZXhwIjoxNzg2MTgwNDgzfQ.AQkByY6ZY8qCeOJE0X_OmFVzq-yELvBzekWroj4J1oE', NULL, NULL, NULL, 0, '2026-07-10 10:32:15', '2026-07-09 09:14:43', '2026-07-10 10:32:15'),
(290, 150, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzU4OTc4NiwiZXhwIjoxNzg0MTk0NTg2fQ.fxGPoPEJknTnu892rfRdZoOv_LqIvc1owDNS6JgjWWY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MCwiaWF0IjoxNzgzNTg5Nzg2LCJleHAiOjE3ODYxODE3ODZ9.ObsSy5yAnqL4SqfVjOmT8rYoH6PD4nqm7b_ZBG4gMqw', NULL, NULL, NULL, 1, '2026-08-08 09:36:26', '2026-07-09 09:36:26', '2026-07-09 09:36:26'),
(291, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0ODk5Njk0LCJleHAiOjE3ODU1MDQ0OTR9.xEPTY79JSz4S0hw3jGysInHb2WRS3JMtuf277Ycq8M4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODQ4OTk2OTQsImV4cCI6MTc4NzQ5MTY5NH0.-4zGEQuFL_4d_5c6RQxZvZ-F6YM8MlyJR1cd7QyNAJQ', NULL, NULL, NULL, 1, '2026-08-23 13:28:14', '2026-07-10 10:29:17', '2026-07-24 13:28:14'),
(292, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzgzNjc5NzkzLCJleHAiOjE3ODQyODQ1OTN9.KK-dQ4EhODOybvVrUjYHBcSZ6ykxmmCINLVGONpO0zY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODM2Nzk3OTQsImV4cCI6MTc4NjI3MTc5NH0.TLwe5WOWHvD-eCWgKolShmfwEgNAgBtyEGlOjHyInVo', NULL, NULL, NULL, 0, '2026-07-10 10:39:47', '2026-07-10 10:36:34', '2026-07-10 10:39:47'),
(293, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODM2ODAwMDQsImV4cCI6MTc4NDI4NDgwNH0.4x6Ry96dh3uNJzF01BZWoqh97QaCVpqRsW_PuE9Cg7s', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MzY4MDAwNCwiZXhwIjoxNzg2MjcyMDA0fQ.o-teWOGIKpYPLRbhgej-dSjWdoJB0U7uXXv9hq2dvhs', NULL, NULL, NULL, 0, '2026-07-10 10:40:46', '2026-07-10 10:40:04', '2026-07-10 10:40:46'),
(294, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzNzM3ODM3LCJleHAiOjE3ODQzNDI2Mzd9.ex-isI4u1Z7nK2IpwnJFgWEVrzuvE5uJI8R2CKvlu34', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODM3Mzc4MzcsImV4cCI6MTc4NjMyOTgzN30.smmNIYBxnM7CmfEmyAXYgGElP1SdV28NX3SIJoC3ozY', NULL, NULL, NULL, 0, '2026-07-12 05:42:19', '2026-07-11 02:43:57', '2026-07-12 05:42:19'),
(295, 125, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4Mzc0NDg3MCwiZXhwIjoxNzg0MzQ5NjcwfQ.Rm3HjREJiRkKCdmxnGd7YyJOcDALP6bIbtCtMHEVQXs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNSwiaWF0IjoxNzgzNzQ0ODcwLCJleHAiOjE3ODYzMzY4NzB9.npnZFQiagkpE6toqGrNuoNnQaFoBW_eacVQaOMMC3V8', NULL, NULL, NULL, 1, '2026-08-10 04:41:10', '2026-07-11 04:41:10', '2026-07-11 04:41:10'),
(296, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzgzNzcxNTA4LCJleHAiOjE3ODQzNzYzMDh9.cFiuNAYMuSbUdsX8Sp7VybM3xLtDt2nu0yDmhWMCPhc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODM3NzE1MDgsImV4cCI6MTc4NjM2MzUwOH0.O4_hAaxfPgpWlPWkwi496frmo0BQxxsS8JEfaxwhB8U', NULL, NULL, NULL, 1, '2026-08-10 12:05:08', '2026-07-11 12:05:08', '2026-07-11 12:05:08'),
(297, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NjA5ODk5LCJleHAiOjE3ODUyMTQ2OTl9.rhL5qyLW6YcOACTIwSsHfNyFQaDGlpUqZHlWi6d5YTg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3ODQ2MDk4OTksImV4cCI6MTc4NzIwMTg5OX0.4ZM2k_q4-IEfrJAD18LqxXzpXc-INXkk3C_-tdWNhE8', NULL, NULL, NULL, 1, '2026-08-20 04:58:19', '2026-07-12 03:58:54', '2026-07-21 04:58:19'),
(298, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODM4MzQ5NTgsImV4cCI6MTc4NDQzOTc1OH0.VqV-7baSVndyEvrJz00tx9JEAkuU_WgXA50MPryx-BQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4MzgzNDk1OCwiZXhwIjoxNzg2NDI2OTU4fQ.bpcIkGnn-XGonLXxOdG9NqFeSnkHeux7OM3Lg0nYKJo', NULL, NULL, NULL, 1, '2026-08-11 05:42:38', '2026-07-12 05:42:38', '2026-07-12 05:42:38'),
(299, 151, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzgzNzUxOCwiZXhwIjoxNzg0NDQyMzE4fQ.RYYSKE0nEAz1MTzWBZoyzVJoN7UK0o4w2Gs9MlsFMcQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MSwiaWF0IjoxNzgzODM3NTE4LCJleHAiOjE3ODY0Mjk1MTh9.iuEXrbQ2HIDpTalSsMevjCEC1HV--9_WjJEuYebYLsI', NULL, NULL, NULL, 1, '2026-08-11 06:25:18', '2026-07-12 06:25:18', '2026-07-12 06:25:18'),
(300, 152, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4Mzg1NTQzNiwiZXhwIjoxNzg0NDYwMjM2fQ.c24gJGTjzbb23lmSsyFikIkqtcqwVZg08FIGaX6vHEs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MiwiaWF0IjoxNzgzODU1NDM2LCJleHAiOjE3ODY0NDc0MzZ9.NdpMRI6zjG_1W3wyXwCdGGzNIJWzyFZZ8UvBlhOSI2A', NULL, NULL, NULL, 1, '2026-08-11 11:23:56', '2026-07-12 11:23:56', '2026-07-12 11:23:56'),
(301, 153, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4Mzg3Mzk4NiwiZXhwIjoxNzg0NDc4Nzg2fQ.amVZJzuoHJT6hGVmojo3erwm0sou_WGa7aUTr-XTEWE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MywiaWF0IjoxNzgzODczOTg2LCJleHAiOjE3ODY0NjU5ODZ9.BWEsEJZ2BRV15nqpD5ycEJE11dWFCI_71MI04TzTRl8', NULL, NULL, NULL, 1, '2026-08-11 16:33:06', '2026-07-12 16:33:06', '2026-07-12 16:33:06'),
(302, 153, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MywidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4MzkyMTQ5NywiZXhwIjoxNzg0NTI2Mjk3fQ.GEOI64OmDOnVMcSdXYHI1N9jTmQohW-RcpoiYOitMeE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1MywiaWF0IjoxNzgzOTIxNDk3LCJleHAiOjE3ODY1MTM0OTd9.1fwWC-3fBTkYS3Npv5WkuKKFGAkkpUO5fsYZJwNvIaU', NULL, NULL, NULL, 1, '2026-08-12 05:44:57', '2026-07-13 05:44:57', '2026-07-13 05:44:57'),
(303, 154, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4MzkzOTM0MywiZXhwIjoxNzg0NTQ0MTQzfQ.Y83bgbu-X0W87bGzjTTRO3gvjFaNl6IBctck6OXzKtQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NCwiaWF0IjoxNzgzOTM5MzQzLCJleHAiOjE3ODY1MzEzNDN9.IEDMTrrWOdLthZ8zkh8UhKmLPuh4If5vJdLV2tQ2SEM', NULL, NULL, NULL, 1, '2026-08-12 10:42:23', '2026-07-13 10:42:23', '2026-07-13 10:42:23'),
(304, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NzE4NTA5LCJleHAiOjE3ODUzMjMzMDl9.0xS0XIAcO_rwPUYsnJw2TJVs2ffTBAyGxYPC89D7ki8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODQ3MTg1MDksImV4cCI6MTc4NzMxMDUwOX0.XvAZZywEnrBDtQJlEq6RZkqOT1SRh6fNxoyFe7zeCJY', NULL, NULL, NULL, 1, '2026-08-21 11:08:29', '2026-07-15 10:26:37', '2026-07-22 11:08:29'),
(305, 155, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4NDk0Mzk1MCwiZXhwIjoxNzg1NTQ4NzUwfQ.7KgXRZOa2X3XfBFGktLjWad4NIFs2Qkx00chWsuTbrM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NSwiaWF0IjoxNzg0OTQzOTUwLCJleHAiOjE3ODc1MzU5NTB9.J9dz2Lp94_dBp5Nn5oeFjo1oQT_tDJOu92JcdfBRpTg', NULL, NULL, NULL, 1, '2026-08-24 01:45:50', '2026-07-15 12:13:47', '2026-07-25 01:45:50'),
(306, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQ5ODU4ODEsImV4cCI6MTc4NTU5MDY4MX0.S1Pc4Rg6Q46cpZKWAtwv2aXMgGOhIhFaiC7g-rn3S_o', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDk4NTg4MSwiZXhwIjoxNzg3NTc3ODgxfQ.G5XEMOpbBfYQvX4T3nbjBJ3hk8S_PZACsbB4UYO7W5M', NULL, NULL, NULL, 1, '2026-08-24 13:24:41', '2026-07-15 15:56:53', '2026-07-25 13:24:41'),
(307, 69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg0MjA3MTUwLCJleHAiOjE3ODQ4MTE5NTB9.amUR5xUF9XqBmZBYTvFijIEs8AGqXBZ6uufqY4tOUoA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJpYXQiOjE3ODQyMDcxNTAsImV4cCI6MTc4Njc5OTE1MH0.iKi8aT_WbOm5_1NIOJYk45tTYeZuNPJefqsLHF8TK6U', NULL, NULL, NULL, 1, '2026-08-15 13:05:50', '2026-07-16 13:05:50', '2026-07-16 13:05:50'),
(308, 156, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTIzMzM3MSwiZXhwIjoxNzg1ODM4MTcxfQ.5TnloAN8adEXCHJB-62zqaPf-X-1wRHF1oJmDosHtTk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NiwiaWF0IjoxNzg1MjMzMzcxLCJleHAiOjE3ODc4MjUzNzF9.R-wO9_k9zaqcr4fkvNHDcsWQebDx1OaFSDAUSPHaA6U', NULL, NULL, NULL, 1, '2026-08-27 10:09:31', '2026-07-16 13:48:41', '2026-07-28 10:09:31'),
(309, 157, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDI0NTM0NSwiZXhwIjoxNzg0ODUwMTQ1fQ.JzlwzwSlCD_2lo9f2ZjjuNa7mIJNO0lDbsAITklF_0k', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NywiaWF0IjoxNzg0MjQ1MzQ1LCJleHAiOjE3ODY4MzczNDV9.0U5b7KLydE7zSPOkBzRJecNgAnfi6_C3f7jHdugVNk4', NULL, NULL, NULL, 1, '2026-08-15 23:42:25', '2026-07-16 23:42:25', '2026-07-16 23:42:25'),
(310, 87, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg3LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg0MjU5MDIwLCJleHAiOjE3ODQ4NjM4MjB9.deppxHDrGK4WyLlTcopSreq2znKRIe4PrqmWyLCTjBM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg3LCJpYXQiOjE3ODQyNTkwMjAsImV4cCI6MTc4Njg1MTAyMH0.DCcsTXE_cPAzOASUgMs2ev0RwvsE3xn7mUBju0Id0cA', NULL, NULL, NULL, 1, '2026-08-16 03:30:20', '2026-07-17 03:30:20', '2026-07-17 03:30:20'),
(311, 158, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1OCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDMxMTEwMSwiZXhwIjoxNzg0OTE1OTAxfQ.By5XTc6yozhy4bKmzkl_pAUldGtHjojeCa2BOkICIOs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1OCwiaWF0IjoxNzg0MzExMTAxLCJleHAiOjE3ODY5MDMxMDF9.4UXntwb0Cty7l_F7_OJ3AFskcctwI2xPOvJBH3HPVdk', NULL, NULL, NULL, 1, '2026-08-16 17:58:21', '2026-07-17 17:58:21', '2026-07-17 17:58:21'),
(312, 159, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1OSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDM1NjAzNCwiZXhwIjoxNzg0OTYwODM0fQ.QMQUW5GkQajXR4zeuBD_GLwwegniFhpzprBBluxwf3E', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1OSwiaWF0IjoxNzg0MzU2MDM0LCJleHAiOjE3ODY5NDgwMzR9.2Eg_1OoJ9mL-DrY-EHMsfK0FxOFeZzJePKHuHlarG34', NULL, NULL, NULL, 1, '2026-08-17 06:27:14', '2026-07-18 06:27:14', '2026-07-18 06:27:14'),
(313, 160, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTEyODk4NywiZXhwIjoxNzg1NzMzNzg3fQ.O0ROdrbBTEmYw_1R_52ZHFs3slXGGyJWkvokkLuoklI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MCwiaWF0IjoxNzg1MTI4OTg3LCJleHAiOjE3ODc3MjA5ODd9.EmTzqhtR1VKNRD5eqhxTI0Pa1J5hSbHuPxb1keUyW1c', NULL, NULL, NULL, 1, '2026-08-26 05:09:47', '2026-07-18 16:45:53', '2026-07-27 05:09:47'),
(314, 161, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDM5NzQwMSwiZXhwIjoxNzg1MDAyMjAxfQ.ST3jCA7MQvtJHUz5LcMTASpGPT6FC6LKyx3N77fjUbM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MSwiaWF0IjoxNzg0Mzk3NDAxLCJleHAiOjE3ODY5ODk0MDF9.rv8winMOFTulx1cN5sqQEbKBqFdGZ4OYemQl8dMRUYY', NULL, NULL, NULL, 1, '2026-08-17 17:56:41', '2026-07-18 17:56:41', '2026-07-18 17:56:41'),
(315, 128, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOCwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4NTEyMTAwOCwiZXhwIjoxNzg1NzI1ODA4fQ.oGhIgl5dc_b7fLG9rsSKKPWBu-1y-lnwO4DNvHjqZrQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyOCwiaWF0IjoxNzg1MTIxMDA4LCJleHAiOjE3ODc3MTMwMDh9.3kFkl5FAoK2nFuDe9pWUjgyhk-igG5n04iXeoBPPWEw', NULL, NULL, NULL, 1, '2026-08-26 02:56:48', '2026-07-18 18:47:55', '2026-07-27 02:56:48'),
(316, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQ0NDc4ODIsImV4cCI6MTc4NTA1MjY4Mn0.F_7LgbPckhJsB5rhrLaPLFrAA_PSuEV17xHLZu5e1dA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDQ0Nzg4MiwiZXhwIjoxNzg3MDM5ODgyfQ.Rg-_nucq_t-QdPyMetH5YDKRmWZ6mxld-vjQAMiyaJE', NULL, NULL, NULL, 0, '2026-07-20 08:27:26', '2026-07-19 07:58:02', '2026-07-20 08:27:26'),
(317, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NDY0MDAyLCJleHAiOjE3ODUwNjg4MDJ9.oWSyUfzrq33DDDvtt4jKJMBHrYz2dNVBRQXatQCezrY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODQ0NjQwMDIsImV4cCI6MTc4NzA1NjAwMn0.57EJWd4VaoXLip4PXUrGJKggABmMoJH75unnZkTyjQk', NULL, NULL, NULL, 1, '2026-08-18 12:26:42', '2026-07-19 12:26:42', '2026-07-19 12:26:42'),
(318, 162, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDQ2NzE2NiwiZXhwIjoxNzg1MDcxOTY2fQ.zStowHsaqQpz4fBhgYJjFV0uiVDbWIdLm7fRzueM5eE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MiwiaWF0IjoxNzg0NDY3MTY2LCJleHAiOjE3ODcwNTkxNjZ9.JEIiV3fUOFrxrMa05WZMEz0QvjouOMsMq6g17fCAKMY', NULL, NULL, NULL, 1, '2026-08-18 13:19:26', '2026-07-19 13:19:26', '2026-07-19 13:19:26'),
(319, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MTQ1Mzc2LCJleHAiOjE3ODU3NTAxNzZ9.xWcRvN_zkKSCvPzdObUs0V_ViVJmulMSntEnRgWRBno', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODUxNDUzNzYsImV4cCI6MTc4NzczNzM3Nn0.qqXCdi7EWgJHMWe9Stm8uyUiaybBMB-jm4nTMAWPcmY', NULL, NULL, NULL, 1, '2026-08-26 09:42:56', '2026-07-20 08:21:39', '2026-07-27 09:42:56'),
(320, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NTM2MDU1LCJleHAiOjE3ODUxNDA4NTV9.uydAVROARX3CHhFcqZFC8MIMnKYjGFY6HdrEUBzHzeY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODQ1MzYwNTUsImV4cCI6MTc4NzEyODA1NX0.9_j8TIdiTMA9OjhcjtBgV0dJSNBUbwklAZEFeQ_Sdlw', NULL, NULL, NULL, 0, '2026-07-20 08:50:06', '2026-07-20 08:27:35', '2026-07-20 08:50:06'),
(321, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQ1Mzc0MTcsImV4cCI6MTc4NTE0MjIxN30.SjlpDmwJvq27bsvFi_zDcmX_rA-DD-ch0IFpt1vzQwQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDUzNzQxNywiZXhwIjoxNzg3MTI5NDE3fQ.w2w-Huz2nkexIM4twGMvdE1wAgr1e4stdXiSkXSBwwo', NULL, NULL, NULL, 0, '2026-07-20 08:54:16', '2026-07-20 08:50:17', '2026-07-20 08:54:16'),
(322, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQ1Mzc3MDMsImV4cCI6MTc4NTE0MjUwM30.Uw70t7uu3JpSqQhThZrrwKgRb3UFJ1yvE8C5hCjQt_A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDUzNzcwMywiZXhwIjoxNzg3MTI5NzAzfQ.AwVcwtfNKzzfcfsABeNQBVtjZl9N72CSdn8ljDdffd0', NULL, NULL, NULL, 0, '2026-07-20 08:56:22', '2026-07-20 08:55:03', '2026-07-20 08:56:22'),
(323, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NTM3ODEwLCJleHAiOjE3ODUxNDI2MTB9.RQH9DV-hVeve-Zb_mcFg-__4WeBJld-Xj4i4n6n7VEM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODQ1Mzc4MTAsImV4cCI6MTc4NzEyOTgxMH0.qyk64N3RiwcqPqC2KpdDkaZQJ3W259lPdt_dzfvWObM', NULL, NULL, NULL, 0, '2026-07-20 09:04:08', '2026-07-20 08:56:50', '2026-07-20 09:04:08'),
(324, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQ1MzgyNjksImV4cCI6MTc4NTE0MzA2OX0.4f3m2obpQuH1tGjPj4dg1p38xuPjRBCnJQu73c9NzcE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDUzODI2OSwiZXhwIjoxNzg3MTMwMjY5fQ.mhadvuk5pS-dbw-epFUTc4kHb-BW8oPCIdmZyFGcRjE', NULL, NULL, NULL, 0, '2026-07-20 09:05:14', '2026-07-20 09:04:29', '2026-07-20 09:05:14'),
(325, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NTM4MzM5LCJleHAiOjE3ODUxNDMxMzl9.EBmR26ssTpv5Qax6yd6WlGlZTEP3BbI2tBRwUuIQU_4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODQ1MzgzMzksImV4cCI6MTc4NzEzMDMzOX0.kPLc42sS4GJeysd0P8FdvJUTgfHLavu4uoytB0CeuBE', NULL, NULL, NULL, 0, '2026-07-20 09:16:24', '2026-07-20 09:05:39', '2026-07-20 09:16:24'),
(326, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQ1Mzg0NjUsImV4cCI6MTc4NTE0MzI2NX0.W-cwjlylsMl3gVg-sZfgOudAGdciPTLMbXc5UrBn1vs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDUzODQ2NSwiZXhwIjoxNzg3MTMwNDY1fQ.wcjOv24jhmGM5FzmamxlObhMlyCMRo3vBsNm7v23MyE', NULL, NULL, NULL, 0, '2026-07-20 09:15:46', '2026-07-20 09:07:45', '2026-07-20 09:15:46'),
(327, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0NTM4OTk4LCJleHAiOjE3ODUxNDM3OTh9.3AoSpv8n-lTaDJhFMs_x9e2OOMc83wNw0GFVcYVxAYU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODQ1Mzg5OTgsImV4cCI6MTc4NzEzMDk5OH0.thR671aYuMSS8HMkcmWzQ86MWZd8Q8UBG10076qnHmI', NULL, NULL, NULL, 1, '2026-08-19 09:16:38', '2026-07-20 09:16:38', '2026-07-20 09:16:38'),
(328, 163, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDU1ODk0MiwiZXhwIjoxNzg1MTYzNzQyfQ.xDuW3WAEugBuDho5NEDwX1OGcIBk_YXRBAGyvfPnpf4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MywiaWF0IjoxNzg0NTU4OTQyLCJleHAiOjE3ODcxNTA5NDJ9.2T9w_Tp6AkTgLf3P2VQE4IFNNhDiEBpMjn53zE6Z024', NULL, NULL, NULL, 1, '2026-08-19 14:49:02', '2026-07-20 14:49:02', '2026-07-20 14:49:02'),
(329, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MjE2NjUyLCJleHAiOjE3ODU4MjE0NTJ9.x4KcO1YFeZocq7mQ-YYkKNaNyDGZl_gucDPgGnd8Dkw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3ODUyMTY2NTIsImV4cCI6MTc4NzgwODY1Mn0.Kk4mlA7XEOSCPeOVs6pyMgFQ0VU4YyUSrm-V4WmlGME', NULL, NULL, NULL, 1, '2026-08-27 05:30:52', '2026-07-21 04:58:50', '2026-07-28 05:30:52'),
(330, 164, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDcwODI5MywiZXhwIjoxNzg1MzEzMDkzfQ.9hVKT0oQBfdAHD8mnrIWXISBczRqYWw6mEqo8S26Up4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NCwiaWF0IjoxNzg0NzA4MjkzLCJleHAiOjE3ODczMDAyOTN9.zsB-mBJEfZid4i54jrlJb9BTVeomfrYzdLy8_-8ty5s', NULL, NULL, NULL, 1, '2026-08-21 08:18:13', '2026-07-22 08:18:13', '2026-07-22 08:18:13'),
(331, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MzI3ODAzLCJleHAiOjE3ODU5MzI2MDN9.LeFrqAbZGlCGAaFIRmP6B-XLvdmVpY9fXZ4TR6MSRl4', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODUzMjc4MDMsImV4cCI6MTc4NzkxOTgwM30.KMuZohXCt80LlSJdDAd_QzysGhKnH4-Pk1_axOGW6mo', NULL, NULL, NULL, 1, '2026-08-28 12:23:23', '2026-07-22 11:08:58', '2026-07-29 12:23:23'),
(332, 165, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDcyNjg5OSwiZXhwIjoxNzg1MzMxNjk5fQ.cbE4t_Ff-lujSuV3FD9fUhZUznG-RwRdpqUUFPzBsk0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NSwiaWF0IjoxNzg0NzI2ODk5LCJleHAiOjE3ODczMTg4OTl9.V3nJMl7_pnVthywHytFKczjWavjgXNkM6B1CxI-viTM', NULL, NULL, NULL, 1, '2026-08-21 13:28:19', '2026-07-22 13:28:19', '2026-07-22 13:28:19'),
(333, 166, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDc4MDkzNCwiZXhwIjoxNzg1Mzg1NzM0fQ.xtS5zGlZd68IRFFW408oMptT1caB-UQSIwV07OCGUD0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NiwiaWF0IjoxNzg0NzgwOTM0LCJleHAiOjE3ODczNzI5MzR9.bDDt_ZM3k1MdPhPXG6SHEgqK03jQbw_OeKZyDc1IRzE', NULL, NULL, NULL, 1, '2026-08-22 04:28:54', '2026-07-23 04:28:54', '2026-07-23 04:28:54'),
(334, 146, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDgwMTY2MywiZXhwIjoxNzg1NDA2NDYzfQ.yYxuK6-g_bY_KkQhmkZUVrw_zhwltk-sQTpBs1KL7OQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NiwiaWF0IjoxNzg0ODAxNjYzLCJleHAiOjE3ODczOTM2NjN9.YXB891XGn6iKK3hA9qcLKX1Y5MKD_cQEV5pqGVrHdms', NULL, NULL, NULL, 1, '2026-08-22 10:14:23', '2026-07-23 10:14:23', '2026-07-23 10:14:23'),
(335, 155, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NSwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4NDk0Mzk2NSwiZXhwIjoxNzg1NTQ4NzY1fQ.sX5NLqE2AYels0HYsceknT6VCYvSlWFMug3NcGLxHkY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NSwiaWF0IjoxNzg0OTQzOTY1LCJleHAiOjE3ODc1MzU5NjV9.tci8y-ieXpcjmpYtTKxFMSvpRiUH00fLPZfSjntc-pw', NULL, NULL, NULL, 1, '2026-08-24 01:46:05', '2026-07-25 01:46:05', '2026-07-25 01:46:05'),
(336, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0OTYwNDUyLCJleHAiOjE3ODU1NjUyNTJ9.1N259Rn4pWvfgs_Nh3R7-E9E5VwhMwHU9bEwTT_Pf2M', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODQ5NjA0NTIsImV4cCI6MTc4NzU1MjQ1Mn0.ZFrHhOQA7BhXQfvnb4Q1VxVGZS5LKz4_eLgKMhZ-OgU', NULL, NULL, NULL, 0, '2026-07-26 09:18:36', '2026-07-25 06:20:52', '2026-07-26 09:18:36'),
(337, 167, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDk2NTQ0OCwiZXhwIjoxNzg1NTcwMjQ4fQ.w4atOnXrSd9PHQz66BWwpnyRbY__HTDic-5tPtpcO2M', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2NywiaWF0IjoxNzg0OTY1NDQ4LCJleHAiOjE3ODc1NTc0NDh9.Um8ldYu-nHdd2Su0X-7CM08B0-tZXZxCPCeYd6D_KPo', NULL, NULL, NULL, 1, '2026-08-24 07:44:08', '2026-07-25 07:44:08', '2026-07-25 07:44:08'),
(338, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg0OTg1ODUzLCJleHAiOjE3ODU1OTA2NTN9.74rAP72kjgJKxBhzm8Al6u5qkuOZ3MSSmOTg3DVSxSI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODQ5ODU4NTMsImV4cCI6MTc4NzU3Nzg1M30.p0azYR6-sYm9fZLOj-uYw-o4TBkkPFqAxSWH63NH__4', NULL, NULL, NULL, 1, '2026-08-24 13:24:13', '2026-07-25 13:24:13', '2026-07-25 13:24:13'),
(339, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODQ5ODU4OTIsImV4cCI6MTc4NTU5MDY5Mn0.C90M0mURfGIGBdAP38u4KB09E7aJ_Hl9oW1sD6ktz28', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NDk4NTg5MiwiZXhwIjoxNzg3NTc3ODkyfQ.XYHH-jfmcEZDtVBkaRm-dvCGX1mPsFhAWkXySxsp1GA', NULL, NULL, NULL, 1, '2026-08-24 13:24:52', '2026-07-25 13:24:52', '2026-07-25 13:24:52'),
(340, 168, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2OCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NDk5NjcwNCwiZXhwIjoxNzg1NjAxNTA0fQ.5NuB7zqoA8W8xzWHxR9YoGXaK_gyafjwByhwKhidtrc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2OCwiaWF0IjoxNzg0OTk2NzA0LCJleHAiOjE3ODc1ODg3MDR9.XaJ4k6a3yfZEMnsEXKmcSEfL7AwmUCfHEz8FojJHnnQ', NULL, NULL, NULL, 1, '2026-08-24 16:25:04', '2026-07-25 16:25:04', '2026-07-25 16:25:04'),
(341, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODUwNTc1NjAsImV4cCI6MTc4NTY2MjM2MH0.6alZvKGcBCLf769vVdUr05mO7AOHvxt2FSjex9cqxkQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTA1NzU2MCwiZXhwIjoxNzg3NjQ5NTYwfQ.4Lx5HmmPaKAVO5EJ-LynQTHqAZuXWPIl6D3P8nlwy0U', NULL, NULL, NULL, 0, '2026-07-26 09:35:27', '2026-07-26 09:19:20', '2026-07-26 09:35:27'),
(342, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODUwNTc2NDIsImV4cCI6MTc4NTY2MjQ0Mn0.S9rQaQgRLesj5AD9nqtpShtFbUPpnHvkXLruqEGoN98', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTA1NzY0MiwiZXhwIjoxNzg3NjQ5NjQyfQ.y733aW37rF7wKB3jHGGi0vg6ZUvsx2_PWuqlB5As2AA', NULL, NULL, NULL, 0, '2026-07-30 22:48:26', '2026-07-26 09:20:42', '2026-07-30 22:48:26'),
(343, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MDU4NTM2LCJleHAiOjE3ODU2NjMzMzZ9.kUkEvUcnbCsBmsxUX2-zoMEQjE1PDnUyQ1F8pb7M6sE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODUwNTg1MzYsImV4cCI6MTc4NzY1MDUzNn0.iLKuXDm-9k4DMnVL5XSWELRiWPOpIFxO_LFt3fTuEfw', NULL, NULL, NULL, 0, '2026-07-26 10:19:19', '2026-07-26 09:35:36', '2026-07-26 10:19:19'),
(344, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MDYxMTY2LCJleHAiOjE3ODU2NjU5NjZ9.hiTPZe5qmCdUVDoK-t_kNw77pvelFVwppnewqYE9rgU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODUwNjExNjYsImV4cCI6MTc4NzY1MzE2Nn0.-rt0uH6SDiAHMQR64AnwSeFTqtE0uotADaCvoFLe6ns', NULL, NULL, NULL, 0, '2026-07-28 05:03:07', '2026-07-26 10:19:26', '2026-07-28 05:03:07'),
(345, 108, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwOCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTA2MzM3OSwiZXhwIjoxNzg1NjY4MTc5fQ.kXLghjMzPZC0ZJKf_GGNBfL1GvUdJPtjVDNs-RiWj_A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwOCwiaWF0IjoxNzg1MDYzMzc5LCJleHAiOjE3ODc2NTUzNzl9.WdTBqtmNgQoEnTIlndjjB4dlWeCFpvDZb8CosP-x_gQ', NULL, NULL, NULL, 1, '2026-08-25 10:56:19', '2026-07-26 10:56:19', '2026-07-26 10:56:19'),
(346, 169, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2OSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTA3NDkwMCwiZXhwIjoxNzg1Njc5NzAwfQ.RuAlWf0AQBOpIF2ZGQcdpT2DRmRwP9IG3Dt2sCLcYPI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2OSwiaWF0IjoxNzg1MDc0OTAwLCJleHAiOjE3ODc2NjY5MDB9.28xIX51zMQIOUplfMJO0-5s5l2KfXSF1gB4xzqheIdo', NULL, NULL, NULL, 1, '2026-08-25 14:08:20', '2026-07-26 14:08:20', '2026-07-26 14:08:20'),
(347, 170, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTA5MTU5MSwiZXhwIjoxNzg1Njk2MzkxfQ.Ub8SFmaeSp3CpjRoplm8Nhm1D1TIr800CD1i5pbHM3s', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MCwiaWF0IjoxNzg1MDkxNTkxLCJleHAiOjE3ODc2ODM1OTF9.EtxObHppQBHaD5K5kDkmb9C-R1UA9hWCpwH-icZfd0g', NULL, NULL, NULL, 1, '2026-08-25 18:46:31', '2026-07-26 18:46:31', '2026-07-26 18:46:31'),
(348, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODUxMzY0ODUsImV4cCI6MTc4NTc0MTI4NX0.Klrbtb-RcuYVB5RS6lwDWBMRPRSAOwCNtQDkqzEZytY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTEzNjQ4NSwiZXhwIjoxNzg3NzI4NDg1fQ.pMBXpd77ziqP_8hSlWJPB4p_ii9SUpbFhKPt8urW_og', NULL, NULL, NULL, 1, '2026-08-26 07:14:45', '2026-07-27 07:14:45', '2026-07-27 07:14:45'),
(349, 171, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTE3MTAxNCwiZXhwIjoxNzg1Nzc1ODE0fQ.MoEQEeRbHtETAWiLRUxKHSC50BIPeMJPy59jEG_tED0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MSwiaWF0IjoxNzg1MTcxMDE0LCJleHAiOjE3ODc3NjMwMTR9.vGrHCkIK9EqJ4DMd3u7m7s7yb3RHstcM18IqeWm-iCw', NULL, NULL, NULL, 1, '2026-08-26 16:50:14', '2026-07-27 16:50:14', '2026-07-27 16:50:14');
INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `refresh_token`, `device_info`, `ip_address`, `user_agent`, `is_active`, `expires_at`, `created_at`, `updated_at`) VALUES
(350, 50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MjA5MTgyLCJleHAiOjE3ODU4MTM5ODJ9.yA1kpvMgfYbwJkKxSx_dsvJwajYxAQjJfAab65cD3Bw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUwLCJpYXQiOjE3ODUyMDkxODIsImV4cCI6MTc4NzgwMTE4Mn0.bphhvXOa_8AlFquD2fpZGl8BdTzkjDGPFbNzPA4ezmo', NULL, NULL, NULL, 1, '2026-08-27 03:26:22', '2026-07-28 03:26:22', '2026-07-28 03:26:22'),
(351, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODUyMTE0MTksImV4cCI6MTc4NTgxNjIxOX0.3-eEwY3vIN5L-uaaPv3JJHAq380NYRe-AQHGAJq7vXE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTIxMTQxOSwiZXhwIjoxNzg3ODAzNDE5fQ.9pF7nxafOG45iShqSG3Cs0nJfg7-099R2xe4bFd58CY', NULL, NULL, NULL, 0, '2026-07-30 10:24:59', '2026-07-28 04:03:39', '2026-07-30 10:24:59'),
(352, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MjE0OTU5LCJleHAiOjE3ODU4MTk3NTl9.9P8Sl9_FWZasfWHeSATZMR4fHfJty6YUwQf5EO89hqU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3ODUyMTQ5NTksImV4cCI6MTc4NzgwNjk1OX0.JE4DBTCvpGVBM27CbBYbrhFRjw4wzPOexiCHLzpDX0M', NULL, NULL, NULL, 0, '2026-07-28 05:15:04', '2026-07-28 05:02:39', '2026-07-28 05:15:04'),
(353, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODUyMTUwMTMsImV4cCI6MTc4NTgxOTgxM30.rZJwiU6yjjRq4bOAtVLFR1UNUoE0QvtIjtKOmuQzaNI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTIxNTAxMywiZXhwIjoxNzg3ODA3MDEzfQ.Nxxqc9jtnTbmKuqX1ZDroWhg8-oS9HJi9oZlzTpOHe0', NULL, NULL, NULL, 0, '2026-07-28 05:05:07', '2026-07-28 05:03:33', '2026-07-28 05:05:07'),
(354, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MjE1MTE2LCJleHAiOjE3ODU4MTk5MTZ9.YWUHwOprPi2COhWnP0gKlknXQRtirvcTbs8RS9rW1SI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODUyMTUxMTYsImV4cCI6MTc4NzgwNzExNn0.6Vg-ptGyMfztN-tKqdnCwBRfSGQ77W3C1Z1yMz3JSJg', NULL, NULL, NULL, 0, '2026-07-29 00:18:28', '2026-07-28 05:05:16', '2026-07-29 00:18:28'),
(355, 105, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTIzMjQyNywiZXhwIjoxNzg1ODM3MjI3fQ.envM6PgN8kk0fNnbR0WVHtuyG3lEmPa0KkVuuTQdiJU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwNSwiaWF0IjoxNzg1MjMyNDI3LCJleHAiOjE3ODc4MjQ0Mjd9.VhEfceXb3GtDrBzY63O73tSMXN8q_mfQ3iHtJH3U1os', NULL, NULL, NULL, 1, '2026-08-27 09:53:47', '2026-07-28 09:53:47', '2026-07-28 09:53:47'),
(356, 156, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTIzMzM4MiwiZXhwIjoxNzg1ODM4MTgyfQ._SjHrr49EgDgF23bj0rXJD_5D87vdBLxErlcmP8VUfc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1NiwiaWF0IjoxNzg1MjMzMzgyLCJleHAiOjE3ODc4MjUzODJ9.7_E7D-qickKFdOje5iutWAn1evZQ-MnaKcM-D0qx8JA', NULL, NULL, NULL, 1, '2026-08-27 10:09:42', '2026-07-28 10:09:42', '2026-07-28 10:09:42'),
(357, 55, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU1LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg1MjYxNTQyLCJleHAiOjE3ODU4NjYzNDJ9.ogHKJ6-h6HVFhxpJSHkqQJzwm8ltC8ZwD3qkUA3Oc6c', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU1LCJpYXQiOjE3ODUyNjE1NDIsImV4cCI6MTc4Nzg1MzU0Mn0.tyJBjfy6YmR8je927xTTeBsq3QxFfpN0SbHSu1w5TAA', NULL, NULL, NULL, 1, '2026-08-27 17:59:02', '2026-07-28 17:59:02', '2026-07-28 17:59:02'),
(358, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODUyODQzMjksImV4cCI6MTc4NTg4OTEyOX0.EpPx3cpiFnLvy7kNyfMMsa_K7BYdslDaUoJBWxj_52M', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTI4NDMyOSwiZXhwIjoxNzg3ODc2MzI5fQ.sYsLQi_ucSLX_lCwN7OCh5_eu1HKMLTL7qxg0OmqAtM', NULL, NULL, NULL, 0, '2026-07-30 09:29:49', '2026-07-29 00:18:49', '2026-07-30 09:29:49'),
(359, 115, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTI5NTgxMCwiZXhwIjoxNzg1OTAwNjEwfQ.TFCPh0bihF4kfPLw_6BSSXPN-9P48Gq1h2w74GvuxgE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExNSwiaWF0IjoxNzg1Mjk1ODEwLCJleHAiOjE3ODc4ODc4MTB9.aHjqsLwYTnqIuZ_F2znui9Zp_sOPvn6K4gL5wbiwp8w', NULL, NULL, NULL, 1, '2026-08-28 03:30:10', '2026-07-29 03:30:10', '2026-07-29 03:30:10'),
(360, 172, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MiwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTMxNzcxOSwiZXhwIjoxNzg1OTIyNTE5fQ.v1_K3e2SCdvgLXATSek4_l1AYhQgl-rMezPWDnn_ymc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MiwiaWF0IjoxNzg1MzE3NzE5LCJleHAiOjE3ODc5MDk3MTl9.NhjFS-tiDV_aQgBFCjs_590SBpQSm7DfUm14T-G4fs4', NULL, NULL, NULL, 1, '2026-08-28 09:35:19', '2026-07-29 09:35:19', '2026-07-29 09:35:19'),
(361, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1MzMwNTIzLCJleHAiOjE3ODU5MzUzMjN9.-hhYx8d1jKcsIOsvu0URQcbuVaDZbYaR4sxZFrBaQbI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODUzMzA1MjMsImV4cCI6MTc4NzkyMjUyM30.ezceBnf19QOXW_HuXuaj0lUdr5MA4fa3k5F0KZbQOZQ', NULL, NULL, NULL, 1, '2026-08-28 13:08:43', '2026-07-29 13:08:43', '2026-07-29 13:08:43'),
(362, 173, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTM0MDc1MiwiZXhwIjoxNzg1OTQ1NTUyfQ.jywFY2_goAqPLtmT9h6-LER6C7glStT354QANHLZBXQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3MywiaWF0IjoxNzg1MzQwNzUyLCJleHAiOjE3ODc5MzI3NTJ9.DgH_UW8d2cmAffJPwAgmnNnMCrqrLjV85z0UTO-QQuA', NULL, NULL, NULL, 1, '2026-08-28 15:59:12', '2026-07-29 15:59:12', '2026-07-29 15:59:12'),
(363, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODU0MDM4MDAsImV4cCI6MTc4NjAwODYwMH0.TfHLj1rmlaam4j6M9v5wOE_MPcxjEEhK2p0kQZSOeBQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTQwMzgwMCwiZXhwIjoxNzg3OTk1ODAwfQ.5VoRETSf_VDM3PgotMCmoIAIAzUrkf95RVSSGkoVksI', NULL, NULL, NULL, 0, '2026-07-30 09:31:48', '2026-07-30 09:30:00', '2026-07-30 09:31:48'),
(364, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODU0MDM5ODUsImV4cCI6MTc4NjAwODc4NX0.AbLowRMmkeBGUGWvDfH3pctdDnB3fIXap3HOG1wBLEk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTQwMzk4NSwiZXhwIjoxNzg3OTk1OTg1fQ.E6_tfXgwqYxY1KOim2lNYu6ai9LdzjVDb_7cG-LnkyM', NULL, NULL, NULL, 0, '2026-07-30 10:03:01', '2026-07-30 09:33:05', '2026-07-30 10:03:01'),
(365, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NDA0MDQ4LCJleHAiOjE3ODYwMDg4NDh9.7C9yELse6fcica6v51q4azkZAE4KTSXrnTR0i7JKMYQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODU0MDQwNDgsImV4cCI6MTc4Nzk5NjA0OH0.sCQeHuwkvAL19N1j4eqTbjVY7nk6thkyxMvThY8ZmQM', NULL, NULL, NULL, 0, '2026-07-30 09:34:54', '2026-07-30 09:34:08', '2026-07-30 09:34:54'),
(366, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg1NDA0MTAyLCJleHAiOjE3ODYwMDg5MDJ9.-n2jWKG6_NZOMrV4DVUBzF4B8LLBgnY_2k0qS394G04', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODU0MDQxMDIsImV4cCI6MTc4Nzk5NjEwMn0.j1yBDXd4Nh_iMuywQlNeX89lE8QxL_r9LrIh83hKOS0', NULL, NULL, NULL, 0, '2026-07-30 09:37:50', '2026-07-30 09:35:02', '2026-07-30 09:37:50'),
(367, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODU0MDQzMjMsImV4cCI6MTc4NjAwOTEyM30.4uIm1x4fpNcSZG0FgnftHLhY7YZmYOhIkDCSGBKcf_A', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTQwNDMyMywiZXhwIjoxNzg3OTk2MzIzfQ.3P9mGeCLp-u5468qLWiEE5BmeKRMYuVWjIz90iVxGzM', NULL, NULL, NULL, 0, '2026-07-30 09:41:19', '2026-07-30 09:38:43', '2026-07-30 09:41:19'),
(368, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODU0MDQzNzcsImV4cCI6MTc4NjAwOTE3N30.jq9uBWKE5Lsr6_vmPWjhpPoFjEb0IYOZuxfd3nCYweA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTQwNDM3NywiZXhwIjoxNzg3OTk2Mzc3fQ.p6_8yF7foesU4-vBxXuvE9a-3K9dvXYgN1go1TTENFA', NULL, NULL, NULL, 0, '2026-07-30 10:07:30', '2026-07-30 09:39:37', '2026-07-30 10:07:30'),
(369, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg1NDA0NDg3LCJleHAiOjE3ODYwMDkyODd9.jinuOfoqBGzW2oOyjgZRm8liMKz6GZyHBKrcMI3fkuw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODU0MDQ0ODcsImV4cCI6MTc4Nzk5NjQ4N30.qIL70TpDf6mosjvjsvYe4RVGH4mFVZn0AJvP2J7cA9w', NULL, NULL, NULL, 0, '2026-07-30 10:03:12', '2026-07-30 09:41:27', '2026-07-30 10:03:12'),
(370, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NDA1NjA3LCJleHAiOjE3ODYwMTA0MDd9.rZLjfwh8JwL5qu2hgbumLJdWncVvpitLhtfRd6EOAj0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3ODU0MDU2MDcsImV4cCI6MTc4Nzk5NzYwN30.iDbOac4AzWxxA4PjFP9f-G4vM_6UCC7IRyFnp2dvb9M', NULL, NULL, NULL, 1, '2026-08-29 10:00:07', '2026-07-30 10:00:07', '2026-07-30 10:00:07'),
(371, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NDA1ODA1LCJleHAiOjE3ODYwMTA2MDV9.piTOSI2M0ui_14OnAC3Zc8Nm-I8dnamIhAa2981mxuM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODU0MDU4MDUsImV4cCI6MTc4Nzk5NzgwNX0.kBvos1w9oMyr0dBePPxw4Y02_RZYfYcfGR5dQasYKWs', NULL, NULL, NULL, 0, '2026-07-30 10:13:29', '2026-07-30 10:03:25', '2026-07-30 10:13:29'),
(372, 56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg1NDA2MDgwLCJleHAiOjE3ODYwMTA4ODB9.2atpRuh4n_gtslPy6ID1latfrBD6lSUi_pxk8kVGepI', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJpYXQiOjE3ODU0MDYwODAsImV4cCI6MTc4Nzk5ODA4MH0.pobw231vjSqFh9mCpl3-qQPvLvbbkPnrliW2G18oDk4', NULL, NULL, NULL, 1, '2026-08-29 10:08:00', '2026-07-30 10:08:00', '2026-07-30 10:08:00'),
(373, 56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg1NDA2MjYzLCJleHAiOjE3ODYwMTEwNjN9.smY2I1hN5F6rvBHjur9zgcs9h1r4MNg0YsP_93bVXwo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU2LCJpYXQiOjE3ODU0MDYyNjMsImV4cCI6MTc4Nzk5ODI2M30.Ekvu0UHtOWnX4-Dqh7rC9aXz5FQy6-Sjl1cTnS_YKfc', NULL, NULL, NULL, 1, '2026-08-29 10:11:03', '2026-07-30 10:11:03', '2026-07-30 10:11:03'),
(374, 174, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTQwNjQ0MCwiZXhwIjoxNzg2MDExMjQwfQ.TlzYaDQo1qfmG3S8742e4D5cRcF-ALVyQHrXjmIIZNM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NCwiaWF0IjoxNzg1NDA2NDQwLCJleHAiOjE3ODc5OTg0NDB9.kKLJu0bA8KDex6sBySAYe3oKaRgV2FYyL_1TH7Qkjbc', NULL, NULL, NULL, 0, '2026-07-30 10:17:33', '2026-07-30 10:14:00', '2026-07-30 10:17:33'),
(375, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODU0MDY3MTgsImV4cCI6MTc4NjAxMTUxOH0.dohYt-Pepzsx2g6hB9jegoOQLsdoADj_YeFAmxZsz58', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTQwNjcxOCwiZXhwIjoxNzg3OTk4NzE4fQ.XsU1E-P5Eog3ugBn1G-iEwnjLY2wUIt3gesLpC2iaY8', NULL, NULL, NULL, 0, '2026-07-30 10:20:12', '2026-07-30 10:18:38', '2026-07-30 10:20:12'),
(376, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg1NDA2ODQ1LCJleHAiOjE3ODYwMTE2NDV9.fXRa_vxh-CUGms6ITl-h5Ta9Qg0qpdgn3weB9TkMvqg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODU0MDY4NDUsImV4cCI6MTc4Nzk5ODg0NX0.1aIsMaqreU8VtmRKQgBrhAmc3HdRVnL4gx0UlLxh8LU', NULL, NULL, NULL, 0, '2026-07-30 10:21:53', '2026-07-30 10:20:45', '2026-07-30 10:21:53'),
(377, 53, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUzLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NDA2ODcxLCJleHAiOjE3ODYwMTE2NzF9.YjwzfIkwzRZGhoCftQvMGvrnA-LKWwf4fI-KqbM4HHo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUzLCJpYXQiOjE3ODU0MDY4NzEsImV4cCI6MTc4Nzk5ODg3MX0.aWod8yJaumn9tPvZfe1NtHmAFVS1UloOj9frJT0twZs', NULL, NULL, NULL, 1, '2026-08-29 10:21:11', '2026-07-30 10:21:11', '2026-07-30 10:21:11'),
(378, 147, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTQwNzEyMiwiZXhwIjoxNzg2MDExOTIyfQ.WxsTrel5HKpPZYdApCVq-pVfXfzZ6O-ERZQyBvLRqGQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0NywiaWF0IjoxNzg1NDA3MTIyLCJleHAiOjE3ODc5OTkxMjJ9.fd6n4dxU7TU-ox8WRLddq1NhJGuyw1Kk-E0ITBF1Las', NULL, NULL, NULL, 0, '2026-07-31 02:14:28', '2026-07-30 10:25:22', '2026-07-31 02:14:28'),
(379, 75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NDA3MTQ3LCJleHAiOjE3ODYwMTE5NDd9.o8kAA37xni5S0KA0dID_RrPCU0ooO9531yCgot4cvXY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJpYXQiOjE3ODU0MDcxNDcsImV4cCI6MTc4Nzk5OTE0N30.Vz3Fk4aBADSktDBAIX-98HX6OCg3b9tj1mwjN2PT13g', NULL, NULL, NULL, 1, '2026-08-29 10:25:47', '2026-07-30 10:25:47', '2026-07-30 10:25:47'),
(380, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODU0NDAzMzEsImV4cCI6MTc4NjA0NTEzMX0.3ZZ8saoagRlH5JmTVQZS3LxOgx19udjF5ZPWg_TZm4E', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTQ0MDMzMSwiZXhwIjoxNzg4MDMyMzMxfQ.x0jFL4_W1iGXJdEE5cQp5XCPrqSqylH_v5Nog8cDL7k', NULL, NULL, NULL, 1, '2026-08-29 19:38:51', '2026-07-30 19:38:51', '2026-07-30 19:38:51'),
(381, 52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NDUxNzU3LCJleHAiOjE3ODYwNTY1NTd9.VQPdeCjBKez-CNyCjLRqShU17JTOePVsapbQ5Q5-7nk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyLCJpYXQiOjE3ODU0NTE3NTcsImV4cCI6MTc4ODA0Mzc1N30.HpVH9aWcBCyd_PDeflDTYnDRn2QtJdPCBtPCWsZ1qqg', NULL, NULL, NULL, 1, '2026-08-29 22:49:17', '2026-07-30 22:49:17', '2026-07-30 22:49:17'),
(382, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3ODU0NjQwODgsImV4cCI6MTc4NjA2ODg4OH0.aQqd8ZHqV6oFMfV2wTCCCiYDzb7ypio9Tf8XTFvUYmM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc4NTQ2NDA4OCwiZXhwIjoxNzg4MDU2MDg4fQ.1bxHNVMJUos7VJBV6XrfbOBd_a2I2dkSfVqotiBB2SA', NULL, NULL, NULL, 0, '2026-07-31 11:08:59', '2026-07-31 02:14:48', '2026-07-31 11:08:59'),
(383, 175, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NSwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTQ3OTk2NywiZXhwIjoxNzg2MDg0NzY3fQ.wKzx_jvZ1lSHaPg27jtUy3jCog8NRazfed2klUbnp-I', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NSwiaWF0IjoxNzg1NDc5OTY3LCJleHAiOjE3ODgwNzE5Njd9.WBGRTW-sW8vmdOw5d8ljUsS--WsvWVezZtwgYV_Adbw', NULL, NULL, NULL, 1, '2026-08-30 06:39:27', '2026-07-31 06:39:27', '2026-07-31 06:39:27'),
(384, 176, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NiwidXNlclR5cGUiOiJwcm9wZXJ0eV9vd25lciIsImlhdCI6MTc4NTQ5Mjg5NiwiZXhwIjoxNzg2MDk3Njk2fQ.hoo8PsNmYJB531UzRvOIRss_I6TuPFHuHKxC-J7aqZM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NiwiaWF0IjoxNzg1NDkyODk2LCJleHAiOjE3ODgwODQ4OTZ9.-kGIfQg6Fxpe4btRcN4mCzeBYrsxaUTBEF7EPG22nYM', NULL, NULL, NULL, 1, '2026-08-30 10:14:56', '2026-07-31 10:14:56', '2026-07-31 10:14:56'),
(385, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NDk2MTQ5LCJleHAiOjE3ODYxMDA5NDl9.dLwoew0k5sAWi_eM95cVHaE3sojYe_BS8wPCRwFXgfk', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODU0OTYxNDksImV4cCI6MTc4ODA4ODE0OX0.6xXWPIdaYJS1B0_lOVOtdQSKSG2vLn_vCTpJBbAeoCQ', NULL, NULL, NULL, 1, '2026-08-30 11:09:09', '2026-07-31 11:09:09', '2026-07-31 11:09:09'),
(386, 177, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NywidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTUwNjczNywiZXhwIjoxNzg2MTExNTM3fQ.DEp9PeS6GEzjAxPZEtjWxAxSAam11ZsBIiTi1P38iPs', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NywiaWF0IjoxNzg1NTA2NzM3LCJleHAiOjE3ODgwOTg3Mzd9.oV7uRxNIKsVEvxNI6zGgYbQ0dbTIs7eWFRjdOW10RiI', NULL, NULL, NULL, 1, '2026-08-30 14:05:37', '2026-07-31 14:05:37', '2026-07-31 14:05:37'),
(387, 178, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3OCwidXNlclR5cGUiOiJndWVzdCIsImlhdCI6MTc4NTUwNjc4OCwiZXhwIjoxNzg2MTExNTg4fQ.GbVcLr_fyXD-v1wbPAQM7REBc1hV8jaaN0uH3l_cADg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3OCwiaWF0IjoxNzg1NTA2Nzg4LCJleHAiOjE3ODgwOTg3ODh9.1jx5ZebFgDDvfOTAJjI2--8B6HMzypYm86K1DOmon7M', NULL, NULL, NULL, 1, '2026-08-30 14:06:28', '2026-07-31 14:06:28', '2026-07-31 14:06:28'),
(388, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NTYyMTM0LCJleHAiOjE3ODYxNjY5MzR9.dhEVBP-vFPiGNuXGt8Df0poE7ynro20N3uF7TjFeBBQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODU1NjIxMzQsImV4cCI6MTc4ODE1NDEzNH0.L1Rg4_6ZsBBZQh0j9vQGZ8RuN2hmlO2AK2xzLcxbix8', NULL, NULL, NULL, 0, '2026-08-01 05:33:57', '2026-08-01 05:28:54', '2026-08-01 05:33:57'),
(389, 89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJ1c2VyVHlwZSI6Imd1ZXN0IiwiaWF0IjoxNzg1NTYyNDUzLCJleHAiOjE3ODYxNjcyNTN9.bWutlcNQd5ejs-IZLvhVqvgEjG4hVGubAH47PmdkSaw', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg5LCJpYXQiOjE3ODU1NjI0NTMsImV4cCI6MTc4ODE1NDQ1M30.HnQTuow2ykisA3VgmsewfAKiZzn29LGcjjY2E7gumM8', NULL, NULL, NULL, 0, '2026-08-01 05:35:06', '2026-08-01 05:34:13', '2026-08-01 05:35:06'),
(390, 59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJ1c2VyVHlwZSI6InByb3BlcnR5X293bmVyIiwiaWF0IjoxNzg1NTYyNTE3LCJleHAiOjE3ODYxNjczMTd9.Dqw_Bbxu_XdcuZW59ywFGqObfvj3y_86TpweBXLM-iY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU5LCJpYXQiOjE3ODU1NjI1MTcsImV4cCI6MTc4ODE1NDUxN30.wGVk-B6YpAoPJh1FH3t-CPgA28pjIVXeUUWKFE7C5dw', NULL, NULL, NULL, 1, '2026-08-31 05:35:17', '2026-08-01 05:35:17', '2026-08-01 05:35:17');

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
  ADD KEY `hms_room_id` (`hms_room_id`),
  ADD KEY `idx_bookings_availability` (`property_id`,`check_in_date`,`check_out_date`,`status`),
  ADD KEY `idx_bookings_guest_status` (`guest_id`,`status`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hms_accounts_tx_report` (`host_id`,`property_id`,`date`),
  ADD KEY `idx_hms_accounts_tx_head` (`account_head_id`,`date`);

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
-- Indexes for table `hms_invoices`
--
ALTER TABLE `hms_invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `hms_maintenance_notifications`
--
ALTER TABLE `hms_maintenance_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `hms_maintenance_tasks`
--
ALTER TABLE `hms_maintenance_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `hms_maintenance_types`
--
ALTER TABLE `hms_maintenance_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_host_type_name` (`host_id`,`name`);

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
  ADD KEY `slug` (`slug`),
  ADD KEY `idx_properties_owner_status` (`owner_id`,`status`),
  ADD KEY `idx_properties_monthly_search` (`monthly_rent_enabled`,`monthly_approved`),
  ADD KEY `idx_properties_created_sort` (`status`,`created_at` DESC);

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
  ADD KEY `idx_sort_order` (`sort_order`),
  ADD KEY `idx_property_images_main` (`property_id`,`image_type`,`is_active`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=432;

--
-- AUTO_INCREMENT for table `booking_guests`
--
ALTER TABLE `booking_guests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `display_categories`
--
ALTER TABLE `display_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `display_category_properties`
--
ALTER TABLE `display_category_properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `external_calendars`
--
ALTER TABLE `external_calendars`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `hms_accounts_transactions`
--
ALTER TABLE `hms_accounts_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=223;

--
-- AUTO_INCREMENT for table `hms_accounts_vouchers`
--
ALTER TABLE `hms_accounts_vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hms_allowances`
--
ALTER TABLE `hms_allowances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hms_attendance`
--
ALTER TABLE `hms_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hms_bills`
--
ALTER TABLE `hms_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `hms_deductions`
--
ALTER TABLE `hms_deductions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hms_departments`
--
ALTER TABLE `hms_departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `hms_designations`
--
ALTER TABLE `hms_designations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hms_invoices`
--
ALTER TABLE `hms_invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hms_maintenance_notifications`
--
ALTER TABLE `hms_maintenance_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_maintenance_tasks`
--
ALTER TABLE `hms_maintenance_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hms_maintenance_types`
--
ALTER TABLE `hms_maintenance_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `member_status_tiers`
--
ALTER TABLE `member_status_tiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=204;

--
-- AUTO_INCREMENT for table `owner_balances`
--
ALTER TABLE `owner_balances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `owner_payouts`
--
ALTER TABLE `owner_payouts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `owner_payout_items`
--
ALTER TABLE `owner_payout_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=483;

--
-- AUTO_INCREMENT for table `payment_settings`
--
ALTER TABLE `payment_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `property_amenities`
--
ALTER TABLE `property_amenities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2303;

--
-- AUTO_INCREMENT for table `property_availability`
--
ALTER TABLE `property_availability`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `property_images`
--
ALTER TABLE `property_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1150;

--
-- AUTO_INCREMENT for table `property_owners`
--
ALTER TABLE `property_owners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `refunds`
--
ALTER TABLE `refunds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4459;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=179;

--
-- AUTO_INCREMENT for table `user_blocks`
--
ALTER TABLE `user_blocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_rewards_points`
--
ALTER TABLE `user_rewards_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=391;

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
-- Constraints for table `hms_invoices`
--
ALTER TABLE `hms_invoices`
  ADD CONSTRAINT `hms_invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_maintenance_notifications`
--
ALTER TABLE `hms_maintenance_notifications`
  ADD CONSTRAINT `hms_maintenance_notifications_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `hms_maintenance_tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hms_maintenance_tasks`
--
ALTER TABLE `hms_maintenance_tasks`
  ADD CONSTRAINT `hms_maintenance_tasks_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hms_maintenance_tasks_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `hms_rooms` (`id`) ON DELETE SET NULL;

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
