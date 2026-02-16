const axios = require('axios');

// CHANGE THIS TO YOUR PRODUCTION API URL
const BASE_URL = process.env.REACT_APP_API_URL || 'https://your-domain.com/api';
// Example: 'https://keyhosthomes.com/api'

async function debugApi() {
    console.log(`Checking API at: ${BASE_URL}`);

    try {
        console.log('--- Testing /health Endpoint ---');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check success:', health.data);
    } catch (err) {
        console.error('❌ Health check failed:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            url: err.config?.url
        });
    }

    try {
        console.log('\n--- Testing /auth/login (Dummy) ---');
        // Send a known bad login to verify it hits the auth handler NOT 404
        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'wrongpassword123'
        });
        console.log('Login response:', login.data);
    } catch (err) {
        if (err.response?.status === 401) {
            console.log('✅ Login endpoint reached! (401 Unauthorized as expected)');
            console.log('Response:', err.response.data);
        } else {
            console.error('❌ Login failed with unexpected error:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                url: err.config?.url
            });
        }
    }
}

// Check if user has axios installed locally before running
try {
    debugApi();
} catch (e) {
    console.error("Please run 'npm install axios' in this directory first.");
}
