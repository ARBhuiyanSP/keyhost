const { pool } = require('./backend/config/database');

async function addDefaultSettings() {
  try {
    console.log('Adding default settings to system_settings table...');
    
    const defaultSettings = [
      ['platform_name', 'Keyhost Homes', 'string', 'Website name displayed in header and title', true],
      ['logo_url', '', 'string', 'Site logo URL or base64 data', true],
      ['favicon_url', '', 'string', 'Site favicon URL or base64 data', true],
      ['timezone', 'Asia/Dhaka', 'string', 'Default timezone for the platform', true],
      ['maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode', true],
      ['registration_enabled', 'true', 'boolean', 'Allow new user registration', true],
      ['email_verification_required', 'true', 'boolean', 'Require email verification for new accounts', true],
      ['phone_verification_required', 'false', 'boolean', 'Require phone verification for new accounts', true],
    ];
    
    for (const [key, value, type, description, isPublic] of defaultSettings) {
      await pool.execute(`
        INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        description = VALUES(description),
        is_public = VALUES(is_public)
      `, [key, value, type, description, isPublic]);
    }
    
    console.log('Default settings added successfully!');
    
  } catch (error) {
    console.error('Error adding default settings:', error);
  } finally {
    process.exit(0);
  }
}

addDefaultSettings();




