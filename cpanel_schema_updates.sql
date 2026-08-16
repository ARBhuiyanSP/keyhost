-- Schema updates to apply on CPanel database
-- Generated: 2026-08-08T04:22:55.019Z

ALTER TABLE `bookings` ADD COLUMN `host_proposed_price` decimal(10,2) NULL DEFAULT 'NULL';
ALTER TABLE `bookings` ADD COLUMN `original_calculated_price` decimal(10,2) NULL DEFAULT 'NULL';
