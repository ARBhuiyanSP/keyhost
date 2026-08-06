const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/properties/63');
    console.log("avail_data:", res.data.data.property.availability_data);
  } catch(e) {
    console.error(e.message);
  }
}
test();
