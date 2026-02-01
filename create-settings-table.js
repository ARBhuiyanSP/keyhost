const { pool } = require('./backend/config/database');

async function createAdminSettingsTable() {
  try {
    console.log('Creating admin_settings table...');
    
    // Create table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value LONGTEXT,
        setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Table created successfully!');
    
    // Insert default settings
    const defaultSettings = [
      ['site_name', 'Keyhost Homes', 'string', 'Website name displayed in header and title', true],
      ['site_description', 'Premium property booking platform', 'string', 'Website description for SEO', true],
      ['contact_email', 'admin@keyhosthomes.com', 'string', 'Primary contact email', true],
      ['contact_phone', '+88-01700-000000', 'string', 'Primary contact phone', true],
      ['support_email', 'support@keyhosthomes.com', 'string', 'Support email for customer service', true],
      ['commission_rate', '10', 'number', 'Platform commission rate percentage', false],
      ['currency', 'BDT', 'string', 'Default currency for the platform', true],
      ['timezone', 'Asia/Dhaka', 'string', 'Default timezone for the platform', true],
      ['maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode', true],
      ['registration_enabled', 'true', 'boolean', 'Allow new user registration', true],
      ['email_verification_required', 'true', 'boolean', 'Require email verification for new accounts', true],
      ['phone_verification_required', 'false', 'boolean', 'Require phone verification for new accounts', true],
      ['max_properties_per_owner', '50', 'number', 'Maximum properties a single owner can list', false],
      ['max_guests_per_booking', '20', 'number', 'Maximum guests allowed per booking', false],
      ['logo_url', '', 'string', 'Site logo URL or base64 data', true],
      ['favicon_url', '', 'string', 'Site favicon URL or base64 data', true],
      ['seo_title', 'Keyhost Homes - Premium Property Booking', 'string', 'SEO meta title', true],
      ['seo_description', 'Book your perfect accommodation in Bangladesh with Keyhost Homes', 'string', 'SEO meta description', true],
      ['seo_keywords', 'property booking, hotels, rooms, villas, apartments, Bangladesh', 'string', 'SEO keywords', true],
      ['google_analytics_id', '', 'string', 'Google Analytics tracking ID', false],
      ['google_site_verification', '', 'string', 'Google Search Console verification code', false],
      ['adsense_client_id', '', 'string', 'Google AdSense client ID', false],
      ['adsense_enabled', 'false', 'boolean', 'Enable Google AdSense ads', false],
      ['adsense_auto_ads', 'false', 'boolean', 'Enable Google AdSense auto ads', false],
      ['cancellation_policy', 'Standard 24-hour cancellation policy', 'string', 'Cancellation policy text', true],
      ['terms_of_service', 'Terms of service content...', 'string', 'Terms of service text', true],
      ['privacy_policy', 'Privacy policy content...', 'string', 'Privacy policy text', true],
      ['refund_policy', 'Refund policy content...', 'string', 'Refund policy text', true]
    ];
    
    console.log('Inserting default settings...');
    
    for (const [key, value, type, description, isPublic] of defaultSettings) {
      await pool.execute(`
        INSERT INTO admin_settings (setting_key, setting_value, setting_type, description, is_public)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        setting_type = VALUES(setting_type),
        description = VALUES(description),
        is_public = VALUES(is_public)
      `, [key, value, type, description, isPublic]);
    }
    
    console.log('Default settings inserted successfully!');
    console.log('Admin settings table setup completed!');
    
  } catch (error) {
    console.error('Error creating admin settings table:', error);
  } finally {
    process.exit(0);
  }
}

createAdminSettingsTable();

