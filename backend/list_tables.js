const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keyhost_booking_system',
    port: process.env.DB_PORT || 3306
});

// Check sample data in property_availability
connection.query("SELECT * FROM property_availability LIMIT 10", (error, results) => {
    if (error) console.error(error);
    else console.log("availability rows:", JSON.stringify(results, null, 2));
    connection.end();
});
