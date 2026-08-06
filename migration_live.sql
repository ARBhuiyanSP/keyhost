-- =========================================================================
-- KEYHOST LIVE DATABASE MIGRATION SCRIPT
-- RUN THIS SCRIPT ON YOUR LIVE SERVER DATABASE via phpMyAdmin (SQL Tab)
-- =========================================================================

-- 1. Sync payment_method in bookings table for past bKash/Nagad transactions (fixes $0 stats)
UPDATE bookings b
JOIN payments p ON p.booking_id = b.id
SET b.payment_method = p.payment_method
WHERE p.transaction_type = 'guest_payment' 
  AND p.status = 'completed' 
  AND b.payment_method IS NULL;

-- 2. Add columns to bookings table to support price negotiation
ALTER TABLE bookings ADD COLUMN host_proposed_price DECIMAL(10,2) DEFAULT NULL AFTER total_amount;
ALTER TABLE bookings ADD COLUMN original_calculated_price DECIMAL(10,2) DEFAULT NULL AFTER host_proposed_price;