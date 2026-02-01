const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306
});

connection.query('DESCRIBE users', (error, results) => {
    if (error) {
        console.error('Error describing users:', error);
    } else {
        console.log('Users table structure:', results);
    }

    connection.query('DESCRIBE properties', (error, results) => {
        if (error) {
            console.error('Error describing properties:', error);
        } else {
            console.log('Properties table structure:', results);
        }
        connection.end();
    });
});
