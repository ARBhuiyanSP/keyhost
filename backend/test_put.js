const axios = require('axios');
async function test() {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', {email: 'admin@gmail.com', password: 'password'});
    const token = login.data.token;
    const req = await axios.put('http://localhost:5000/api/admin/hms/packages/1', {
      name: 'Test Package', 
      price: 50, 
      billing_cycle: 'monthly', 
      is_trial: false, 
      duration_days: 30, 
      features: [], 
      is_active: true
    }, {headers: {Authorization: `Bearer ${token}`}});
    console.log('OK', req.data);
  } catch(e) {
    console.log('ERROR', e.response?.data || e.message);
  }
}
test();
