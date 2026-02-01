const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306
});

const sql = `SHOW COLUMNS FROM users`;

connection.query(sql, (err, results) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(results, null, 2));
    connection.end();
});
