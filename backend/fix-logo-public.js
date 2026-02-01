const { pool } = require('./config/database');

async function fixLogoPublic() {
  try {
    console.log('\n🔧 Fixing logo and settings public flags...\n');
    
    // List of settings that should be public
    const publicSettings = [
      'site_name',
      'site_tagline', 
      'site_description',
      'site_logo',
      'site_favicon',
      'contact_email',
      'contact_phone',
      'support_email',
      'support_phone',
      'site_address',
      'currency',
      'timezone',
      'registration_enabled',
      'facebook_url',
      'twitter_url',
      'instagram_url',
      'linkedin_url',
      'youtube_url',
      'tiktok_url',
      'google_analytics_id',
      'seo_meta_title',
      'seo_meta_description',
      'seo_keywords',
      'seo_og_image'
    ];
    
    // Update all public settings
    const placeholders = publicSettings.map(() => '?').join(',');
    await pool.execute(`
      UPDATE system_settings 
      SET is_public = TRUE 
      WHERE setting_key IN (${placeholders})
    `, publicSettings);
    
    console.log('✅ Updated public flags for', publicSettings.length, 'settings\n');
    
    // Verify logo and favicon
    console.log('=== Logo & Favicon Status ===\n');
    const [logoSettings] = await pool.execute(`
      SELECT 
        setting_key, 
        LENGTH(setting_value) as length,
        is_public,
        setting_type
      FROM system_settings
      WHERE setting_key IN ('site_logo', 'site_favicon', 'site_name')
      ORDER BY setting_key
    `);
    
    if (logoSettings.length === 0) {
      console.log('⚠️  No logo settings found. Please upload logo from Admin Panel.\n');
    } else {
      logoSettings.forEach(setting => {
        console.log(`${setting.setting_key}:`);
        console.log(`  ├─ Type: ${setting.setting_type}`);
        console.log(`  ├─ Length: ${setting.length} characters`);
        console.log(`  ├─ Public: ${setting.is_public ? '✅ Yes' : '❌ No'}`);
        console.log(`  └─ Status: ${setting.length > 100 ? '✅ Has data' : '⚠️  Empty or too short'}\n`);
      });
    }
    
    // Show all public settings
    console.log('=== All Public Settings ===\n');
    const [allPublic] = await pool.execute(`
      SELECT setting_key, LENGTH(setting_value) as length
      FROM system_settings
      WHERE is_public = TRUE
      ORDER BY setting_key
    `);
    
    console.log(`Total public settings: ${allPublic.length}\n`);
    allPublic.forEach(s => {
      console.log(`  ✓ ${s.setting_key} (${s.length} chars)`);
    });
    
    console.log('\n✅ Fix completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Restart your backend server');
    console.log('  2. Clear browser cache');
    console.log('  3. Reload your website');
    console.log('  4. Logo should now appear in navbar and footer\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

// Run the fix
console.log('\n🚀 Starting logo fix script...');
fixLogoPublic();

