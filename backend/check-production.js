const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function checkProduction() {
    console.log('--- Production Helper Check ---');

    // 1. Check .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        console.log('✅ .env file found');
    } else {
        console.error('❌ .env file MISSING!');
        // Try to list files in current dir to help debug
        console.log('Files in current directory:', fs.readdirSync(__dirname));
    }

    // 2. Check JWT Secret
    if (process.env.JWT_SECRET) {
        console.log('✅ JWT_SECRET is set');
    } else {
        console.error('❌ JWT_SECRET is MISSING in environment variables');
    }

    // 3. Database Connection
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`DB Name: ${process.env.DB_NAME}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'keyhost_booking_system',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Database connected successfully');

        // 4. Check Tables
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Found tables:', tableNames.length);

        if (tableNames.includes('users')) {
            console.log('✅ "users" table exists');

            // Check for user
            const [users] = await connection.execute('SELECT id, email FROM users LIMIT 1');
            if (users.length > 0) {
                console.log(`✅ Found at least one user: ${users[0].email}`);
            } else {
                console.warn('⚠️ "users" table is empty');
            }

        } else {
            console.error('❌ "users" table missing');
        }

        if (tableNames.includes('user_sessions')) {
            console.log('✅ "user_sessions" table exists');
        } else {
            console.error('❌ "user_sessions" table missing');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    }
}

checkProduction().catch(console.error);
