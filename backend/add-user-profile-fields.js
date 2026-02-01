const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

console.log('🔄 Adding profile fields to users table...\n');

const alterTableSQL = `
ALTER TABLE users
ADD COLUMN bio TEXT NULL,
ADD COLUMN work VARCHAR(255) NULL,
ADD COLUMN school VARCHAR(255) NULL,
ADD COLUMN is_superhost BOOLEAN DEFAULT FALSE,
ADD COLUMN languages JSON NULL;
`;

// Check if columns exist first to avoid errors
const checkColumnSQL = `
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'keyhost_booking_system'}' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'bio';
`;

connection.query(checkColumnSQL, (error, results) => {
    if (error) {
        console.error('❌ Failed to check columns:', error.message);
        connection.end();
        process.exit(1);
    }

    if (results.length > 0) {
        console.log('✅ Profile fields already exist');
        connection.end();
        process.exit(0);
    } else {
        connection.query(alterTableSQL, (error) => {
            if (error) {
                console.error('❌ Failed to add profile fields:', error.message);
                connection.end();
                process.exit(1);
            }
            console.log('✅ Profile fields added to users table');
            connection.end();
            process.exit(0);
        });
    }
});
