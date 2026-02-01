const axios = require('axios');

async function testAdminDashboard() {
  try {
    console.log('🔍 Testing Admin Dashboard with Authentication...\n');
    
    // Step 1: Login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@keyhost.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');
    
    // Step 2: Test admin dashboard with token
    console.log('\n2. Testing admin dashboard with authentication...');
    const dashboardResponse = await axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (dashboardResponse.data.success) {
      console.log('✅ Admin dashboard API working!');
      console.log('📊 Dashboard data:', JSON.stringify(dashboardResponse.data.data, null, 2));
    } else {
      console.log('❌ Admin dashboard failed:', dashboardResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminDashboard();
