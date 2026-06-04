const { pool } = require('../backend/config/database');

async function checkSettings() {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM system_settings WHERE setting_key = ?',
            ['google_client_id']
        );
        console.log('System Settings for google_client_id:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking settings:', error);
        process.exit(1);
    }
}

checkSettings();
