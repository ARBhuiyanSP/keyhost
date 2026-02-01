const { pool } = require('./config/database');

async function checkSettings() {
  try {
    console.log('\n=== Checking System Settings ===\n');
    
    // Get all settings
    const [settings] = await pool.execute(`
      SELECT setting_key, 
             LEFT(setting_value, 50) as value_preview,
             setting_type, 
             is_public,
             LENGTH(setting_value) as value_length
      FROM system_settings
      ORDER BY setting_key
    `);
    
    console.log('Total settings:', settings.length);
    console.log('\n--- All Settings ---');
    settings.forEach(setting => {
      console.log(`\n${setting.setting_key}:`);
      console.log(`  Type: ${setting.setting_type}`);
      console.log(`  Public: ${setting.is_public ? 'Yes' : 'No'}`);
      console.log(`  Length: ${setting.value_length} characters`);
      console.log(`  Preview: ${setting.value_preview}${setting.value_length > 50 ? '...' : ''}`);
    });
    
    // Check specifically for logo and favicon
    console.log('\n\n=== Logo & Favicon Check ===\n');
    const [logoSettings] = await pool.execute(`
      SELECT setting_key, 
             LENGTH(setting_value) as length,
             is_public
      FROM system_settings
      WHERE setting_key IN ('site_logo', 'site_favicon')
    `);
    
    if (logoSettings.length === 0) {
      console.log('❌ No logo or favicon found in database');
    } else {
      logoSettings.forEach(setting => {
        console.log(`${setting.setting_key}:`);
        console.log(`  Length: ${setting.length} characters`);
        console.log(`  Public: ${setting.is_public ? '✅ Yes' : '❌ No'}`);
        console.log(`  Status: ${setting.length > 100 ? '✅ Has data' : '❌ Empty or too short'}`);
      });
    }
    
    // Check public settings
    console.log('\n\n=== Public Settings ===\n');
    const [publicSettings] = await pool.execute(`
      SELECT setting_key
      FROM system_settings
      WHERE is_public = TRUE
      ORDER BY setting_key
    `);
    
    console.log('Public settings count:', publicSettings.length);
    console.log('Public settings:', publicSettings.map(s => s.setting_key).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking settings:', error);
    process.exit(1);
  }
}

checkSettings();

