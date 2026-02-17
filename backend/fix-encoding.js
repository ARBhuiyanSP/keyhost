const mysql = require('mysql2/promise');
require('dotenv').config();

const fixEncoding = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'keyhost_booking_system',
            charset: 'utf8mb4'
        });

        console.log('Connected to database.');

        // Columns to fix in properties table
        const columns = ['title', 'description', 'address', 'city', 'state', 'country'];

        for (const col of columns) {
            console.log(`Fixing column: ${col}...`);
            // This SQL attempts to take the current utf8mb4 string, treat it as latin1 bytes, 
            // and re-interpret those bytes as utf8mb4.
            // This fixes "Mojibake" where UTF-8 characters were saved as Latin1 characters.
            const query = `
            UPDATE properties 
            SET ${col} = CONVERT(CAST(CONVERT(${col} USING latin1) AS BINARY) USING utf8mb4)
            WHERE ${col} REGEXP '[\\x80-\\xFF]'
        `;

            const [result] = await connection.execute(query);
            console.log(`Updated ${result.changedRows} rows for column ${col}.`);
        }

        console.log('Done!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

fixEncoding();
