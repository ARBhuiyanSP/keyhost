const { pool } = require('./config/database');

async function fixLogoNaming() {
  try {
    console.log('\n🔧 Fixing logo naming issue...\n');
    
    // Get current logo_url value
    const [logoUrl] = await pool.execute(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'logo_url'
    `);
    
    const [siteLogoResult] = await pool.execute(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'site_logo'
    `);
    
    console.log('Current status:');
    console.log(`  logo_url: ${logoUrl.length > 0 ? logoUrl[0].setting_value.length + ' characters' : 'Not found'}`);
    console.log(`  site_logo: ${siteLogoResult.length > 0 ? siteLogoResult[0].setting_value.length + ' characters' : 'Not found'}`);
    
    // If logo_url has data but site_logo doesn't, copy it
    if (logoUrl.length > 0 && logoUrl[0].setting_value && logoUrl[0].setting_value.length > 100) {
      const logoData = logoUrl[0].setting_value;
      
      // Update site_logo with logo_url data
      await pool.execute(`
        INSERT INTO system_settings (setting_key, setting_value, setting_type, is_public, description)
        VALUES ('site_logo', ?, 'string', TRUE, 'Site logo image')
        ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        is_public = TRUE,
        updated_at = NOW()
      `, [logoData]);
      
      console.log('\n✅ Copied logo_url to site_logo');
    }
    
    // Also ensure site_logo is properly set
    if (siteLogoResult.length > 0 && siteLogoResult[0].setting_value && siteLogoResult[0].setting_value.length > 100) {
      await pool.execute(`
        UPDATE system_settings 
        SET is_public = TRUE 
        WHERE setting_key = 'site_logo'
      `);
      console.log('✅ site_logo marked as public');
    }
    
    // Verify final status
    console.log('\n=== Final Status ===\n');
    const [finalCheck] = await pool.execute(`
      SELECT setting_key, LENGTH(setting_value) as length, is_public
      FROM system_settings
      WHERE setting_key IN ('site_logo', 'logo_url', 'site_favicon', 'favicon_url')
      ORDER BY setting_key
    `);
    
    finalCheck.forEach(setting => {
      console.log(`${setting.setting_key}:`);
      console.log(`  Length: ${setting.length} characters`);
      console.log(`  Public: ${setting.is_public ? '✅ Yes' : '❌ No'}`);
      console.log(`  Status: ${setting.length > 100 ? '✅ Has data' : '⚠️  Empty'}\n`);
    });
    
    console.log('✅ Fix completed!\n');
    console.log('Next steps:');
    console.log('  1. Restart backend server');
    console.log('  2. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('  3. Hard reload page (Ctrl+Shift+R)');
    console.log('  4. Logo should now appear!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixLogoNaming();

