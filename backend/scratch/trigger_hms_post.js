const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: 'd:/88i/booking-systme/backend/.env' });

async function run() {
  try {
    const userId = 59;
    const userType = 'property_owner';
    const secret = process.env.JWT_SECRET;
    
    console.log('JWT Secret:', secret);

    const token = jwt.sign({ userId, userType }, secret, { expiresIn: '1h' });
    console.log('Signed Token:', token);

    const payload = {
      property_id: 77,
      room_id: 7, // Valid room ID to test locking query
      task_type: 'pest_control',
      description: 'Test Room Maintenance from script',
      cost: 2500,
      status: 'scheduled',
      start_date: '2026-07-08',
      end_date: '2026-07-08',
      is_recurring: false,
      recurrence_interval: '0',
      lock_room: true
    };

    console.log('Sending post payload...');
    const response = await axios.post('http://localhost:5000/api/property-owner/hms/maintenance', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Response:', response.data);
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
