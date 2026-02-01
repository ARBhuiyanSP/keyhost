-- Check data types of users and bookings tables
-- Run this FIRST to see what data types are being used

SHOW COLUMNS FROM users WHERE Field = 'id';
SHOW COLUMNS FROM bookings WHERE Field = 'id';
SHOW COLUMNS FROM member_status_tiers WHERE Field = 'id';

