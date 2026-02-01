-- =============================================
-- OWNER PAYOUTS SYSTEM
-- =============================================
-- This script creates tables for tracking owner payouts and balances

-- =============================================
-- 1. OWNER PAYOUTS TABLE
-- =============================================
CREATE TABLE owner_payouts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_owner_id BIGINT UNSIGNED NOT NULL,
    payout_reference VARCHAR(50) UNIQUE NOT NULL,
    
    -- Payout Period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Payout Details
    total_earnings DECIMAL(12, 2) NOT NULL,
    total_commission_paid DECIMAL(12, 2) DEFAULT 0.00,
    net_payout DECIMAL(12, 2) NOT NULL,
    
    -- Payment Details
    payment_method ENUM('bank_transfer', 'bkash', 'nagad', 'rocket', 'cash') NOT NULL,
    payment_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    payment_reference VARCHAR(100) NULL,
    
    -- Bank Details (if applicable)
    bank_name VARCHAR(100) NULL,
    account_number VARCHAR(50) NULL,
    routing_number VARCHAR(20) NULL,
    mobile_number VARCHAR(20) NULL,
    
    -- Notes
    notes TEXT NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_owner_id) REFERENCES property_owners(id) ON DELETE CASCADE,
    INDEX idx_property_owner_id (property_owner_id),
    INDEX idx_payout_reference (payout_reference),
    INDEX idx_payment_status (payment_status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

-- =============================================
-- 2. OWNER BALANCE TRACKING TABLE
-- =============================================
CREATE TABLE owner_balances (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_owner_id BIGINT UNSIGNED NOT NULL,
    
    -- Balance Details
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    total_payouts DECIMAL(12, 2) DEFAULT 0.00,
    current_balance DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Commission Details
    commission_paid_to_admin DECIMAL(12, 2) DEFAULT 0.00,
    commission_pending DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Last Updated
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_owner_id) REFERENCES property_owners(id) ON DELETE CASCADE,
    UNIQUE KEY unique_owner (property_owner_id),
    INDEX idx_property_owner_id (property_owner_id),
    INDEX idx_current_balance (current_balance)
);

-- =============================================
-- 3. OWNER PAYOUT ITEMS TABLE (Detailed breakdown)
-- =============================================
CREATE TABLE owner_payout_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payout_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NOT NULL,
    
    -- Item Details
    booking_total DECIMAL(10, 2) NOT NULL,
    admin_commission DECIMAL(10, 2) NOT NULL,
    owner_earnings DECIMAL(10, 2) NOT NULL,
    
    -- Status
    commission_paid_to_admin BOOLEAN DEFAULT FALSE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payout_id) REFERENCES owner_payouts(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_payout_id (payout_id),
    INDEX idx_booking_id (booking_id)
);

-- =============================================
-- 4. INSERT INITIAL BALANCE RECORDS FOR EXISTING OWNERS
-- =============================================
INSERT INTO owner_balances (property_owner_id, total_earnings, total_payouts, current_balance, commission_paid_to_admin, commission_pending)
SELECT 
    po.id,
    COALESCE(SUM(b.property_owner_earnings), 0) as total_earnings,
    0 as total_payouts,
    COALESCE(SUM(b.property_owner_earnings), 0) as current_balance,
    COALESCE(SUM(CASE WHEN ae.payment_status = 'paid' THEN ae.commission_amount ELSE 0 END), 0) as commission_paid_to_admin,
    COALESCE(SUM(CASE WHEN ae.payment_status = 'pending' THEN ae.commission_amount ELSE 0 END), 0) as commission_pending
FROM property_owners po
LEFT JOIN properties p ON po.id = p.owner_id
LEFT JOIN bookings b ON p.id = b.property_id AND b.payment_status = 'paid'
LEFT JOIN admin_earnings ae ON b.id = ae.booking_id
GROUP BY po.id
ON DUPLICATE KEY UPDATE
    total_earnings = VALUES(total_earnings),
    current_balance = VALUES(current_balance),
    commission_paid_to_admin = VALUES(commission_paid_to_admin),
    commission_pending = VALUES(commission_pending),
    last_updated = NOW();

