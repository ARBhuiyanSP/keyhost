const axios = require('axios');

async function testSettingsAPI() {
  try {
    console.log('\n🔍 Testing Settings API...\n');
    
    // Test public settings endpoint
    const apiUrl = 'http://localhost:5000/api/settings/public';
    
    console.log(`Calling: ${apiUrl}\n`);
    
    const response = await axios.get(apiUrl);
    
    console.log('Response Status:', response.status);
    console.log('Response Success:', response.data.success);
    console.log('\n=== Settings Data ===\n');
    
    const settings = response.data.data;
    
    // Check logo settings specifically
    console.log('Logo Settings:');
    console.log(`  site_logo: ${settings.site_logo ? `✅ Present (${settings.site_logo.substring(0, 50)}...)` : '❌ Missing'}`);
    console.log(`  site_favicon: ${settings.site_favicon ? `✅ Present (${settings.site_favicon.substring(0, 50)}...)` : '❌ Missing'}`);
    console.log(`  site_name: ${settings.site_name || '❌ Missing'}`);
    
    console.log('\nAll Public Settings:');
    Object.keys(settings).forEach(key => {
      const value = settings[key];
      const display = typeof value === 'string' && value.length > 50 
        ? `${value.substring(0, 50)}... (${value.length} chars)`
        : value;
      console.log(`  ${key}: ${display}`);
    });
    
    console.log('\n✅ API is working correctly!');
    
    if (!settings.site_logo) {
      console.log('\n⚠️  WARNING: site_logo is missing in API response!');
      console.log('   This means frontend won\'t show the logo.');
    } else {
      console.log('\n✅ site_logo is present in API response');
      console.log('   Frontend should be able to display it.');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing API:');
    if (error.code === 'ECONNREFUSED') {
      console.error('   Backend server is not running!');
      console.error('   Please start backend with: npm start');
    } else if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || 'Unknown error'}`);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

testSettingsAPI();

