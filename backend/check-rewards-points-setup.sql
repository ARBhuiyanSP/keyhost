-- Check Rewards Points System Setup
-- Run these queries to verify everything is set up correctly

-- 1. Check if rewards_point_slots table exists and has data
SELECT '=== REWARDS POINT SLOTS ===' as check_type;
SELECT COUNT(*) as total_slots FROM rewards_point_slots;
SELECT * FROM rewards_point_slots WHERE is_active = TRUE ORDER BY min_amount ASC;

-- 2. Check if rewards_point_settings table exists and has data
SELECT '=== REWARDS POINT SETTINGS ===' as check_type;
SELECT COUNT(*) as total_settings FROM rewards_point_settings;
SELECT * FROM rewards_point_settings WHERE is_active = TRUE;

-- 3. Check if member_status_tiers table exists and has data
SELECT '=== MEMBER STATUS TIERS ===' as check_type;
SELECT COUNT(*) as total_tiers FROM member_status_tiers;
SELECT * FROM member_status_tiers WHERE is_active = TRUE ORDER BY min_points ASC;

-- 4. Check if user_rewards_points table exists
SELECT '=== USER REWARDS POINTS TABLE ===' as check_type;
SELECT COUNT(*) as total_users_with_points FROM user_rewards_points;
SELECT * FROM user_rewards_points LIMIT 5;

-- 5. Check if rewards_point_transactions table exists
SELECT '=== REWARDS POINT TRANSACTIONS ===' as check_type;
SELECT COUNT(*) as total_transactions FROM rewards_point_transactions;
SELECT * FROM rewards_point_transactions ORDER BY created_at DESC LIMIT 10;

-- 6. Check recent bookings with payment status
SELECT '=== RECENT PAID BOOKINGS ===' as check_type;
SELECT 
    b.id as booking_id,
    b.booking_reference,
    b.guest_id,
    b.total_amount,
    b.payment_status,
    b.status,
    b.created_at
FROM bookings b
WHERE b.payment_status = 'paid'
ORDER BY b.created_at DESC
LIMIT 10;

-- 7. Check if any bookings have points transactions
SELECT '=== BOOKINGS WITH POINTS TRANSACTIONS ===' as check_type;
SELECT 
    b.id as booking_id,
    b.booking_reference,
    b.total_amount,
    b.payment_status,
    rpt.transaction_type,
    rpt.points,
    rpt.created_at as points_awarded_at
FROM bookings b
LEFT JOIN rewards_point_transactions rpt ON b.id = rpt.booking_id AND rpt.transaction_type = 'earned'
WHERE b.payment_status = 'paid'
ORDER BY b.created_at DESC
LIMIT 10;

