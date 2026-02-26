const { pool } = require('./config/database');

async function updateGoogleSettings() {
    try {
        const clientId = 'YOUR_GOOGLE_CLIENT_ID';
        const clientSecret = 'YOUR_GOOGLE_CLIENT_SECRET';

        // UPSERT client_id
        await pool.execute(
            `INSERT INTO system_settings (setting_key, setting_value, setting_type, is_public, description) 
       VALUES (?, ?, 'string', TRUE, 'Google Client ID') 
       ON DUPLICATE KEY UPDATE setting_value = ?`,
            ['google_client_id', clientId, clientId]
        );

        // UPSERT client_secret
        await pool.execute(
            `INSERT INTO system_settings (setting_key, setting_value, setting_type, is_public, description) 
       VALUES (?, ?, 'string', FALSE, 'Google Client Secret') 
       ON DUPLICATE KEY UPDATE setting_value = ?`,
            ['google_client_secret', clientSecret, clientSecret]
        );

        console.log('Successfully updated Google settings in database.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateGoogleSettings();
