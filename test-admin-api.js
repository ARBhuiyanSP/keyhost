const axios = require('axios');

async function testAdminAPI() {
  try {
    console.log('🔍 Testing Admin Dashboard API...\n');
    
    // Test 1: Check if backend is responding
    console.log('1. Testing backend health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }
    
    // Test 2: Test admin dashboard endpoint (without auth first)
    console.log('\n2. Testing admin dashboard endpoint...');
    try {
      const dashboardResponse = await axios.get('http://localhost:5000/api/admin/dashboard');
      console.log('✅ Admin dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Admin dashboard failed:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.log('🔐 Authentication required - this is expected');
      }
    }
    
    // Test 3: Test properties endpoint (public)
    console.log('\n3. Testing properties endpoint...');
    try {
      const propertiesResponse = await axios.get('http://localhost:5000/api/properties');
      console.log('✅ Properties endpoint working:', propertiesResponse.data);
    } catch (error) {
      console.log('❌ Properties endpoint failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAPI();
