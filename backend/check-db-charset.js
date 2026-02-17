const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection
const checkDb = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'keyhost_booking_system'
        });

        console.log('Connected to database.');

        const [rows] = await connection.execute("SHOW CREATE TABLE properties");
        console.log('Table Schema:');
        console.log(rows[0]['Create Table']);

        // Also check the specific row if possible (optional, but helpful)
        // const [data] = await connection.execute("SELECT id, description FROM properties WHERE id = 46");
        // console.log('Sample Data:', data[0]);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkDb();
