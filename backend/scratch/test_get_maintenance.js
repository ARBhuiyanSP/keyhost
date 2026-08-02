const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: 'd:/88i/booking-systme/backend/.env' });

async function run() {
  try {
    const userId = 59;
    const userType = 'property_owner';
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign({ userId, userType }, secret, { expiresIn: '1h' });

    console.log('Fetching tasks for property 77...');
    const response = await axios.get('http://localhost:5000/api/property-owner/hms/maintenance?property_id=77', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('GET Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error status:', error.response.status);
      console.error('❌ API Error data:', error.response.data);
    } else {
      console.error('❌ Connection Error:', error.message);
    }
  }
  process.exit(0);
}

run();
