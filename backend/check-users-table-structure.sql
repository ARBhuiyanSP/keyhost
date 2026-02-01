-- Check users and bookings table structure to match foreign key types

-- Check users table id column
SHOW COLUMNS FROM users WHERE Field = 'id';

-- Check bookings table id column  
SHOW COLUMNS FROM bookings WHERE Field = 'id';

-- Check if users.id has index (should be PRIMARY KEY)
SHOW INDEX FROM users WHERE Key_name = 'PRIMARY';

-- Check if bookings.id has index (should be PRIMARY KEY)
SHOW INDEX FROM bookings WHERE Key_name = 'PRIMARY';

