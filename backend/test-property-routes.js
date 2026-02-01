const axios = require('axios');

async function testPropertyRoutes() {
  console.log('\n🧪 Testing Property Owner Routes...\n');
  
  const baseUrl = 'http://localhost:5000/api/property-owner';
  
  // You'll need to get a valid token first
  const token = 'YOUR_TOKEN_HERE'; // Replace with actual property owner token
  
  const routes = [
    { method: 'GET', path: '/properties', description: 'List properties' },
    { method: 'GET', path: '/properties/32', description: 'Get single property' },
    { method: 'POST', path: '/properties', description: 'Create property' },
    { method: 'PUT', path: '/properties/32', description: 'Update property' },
    { method: 'DELETE', path: '/properties/32', description: 'Delete property' },
  ];
  
  console.log('Testing routes (without auth - will show 401 if route exists):\n');
  
  for (const route of routes) {
    try {
      const url = baseUrl + route.path;
      console.log(`Testing: ${route.method} ${url}`);
      
      const response = await axios({
        method: route.method,
        url: url,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        validateStatus: () => true // Don't throw on any status
      });
      
      if (response.status === 404) {
        console.log(`  ❌ NOT FOUND - Route doesn't exist\n`);
      } else if (response.status === 401) {
        console.log(`  ✅ EXISTS (needs auth)\n`);
      } else if (response.status === 403) {
        console.log(`  ✅ EXISTS (forbidden - need property owner role)\n`);
      } else {
        console.log(`  ✅ Status: ${response.status}\n`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('  ❌ Backend not running!\n');
        break;
      } else {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }
  }
  
  console.log('\n=== Route Registration Check ===\n');
  console.log('If routes show "NOT FOUND", backend needs restart!');
  console.log('If routes show "EXISTS", they are registered correctly.');
  console.log('\nTo restart backend:');
  console.log('  1. Stop current backend (Ctrl+C)');
  console.log('  2. Run: npm start');
  console.log('  3. Test again\n');
}

testPropertyRoutes();



