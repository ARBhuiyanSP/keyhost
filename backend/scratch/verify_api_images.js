const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:5000/api/properties/74');
    console.log('Property images count:', res.data.data.property.images.length);
    console.log('First image url:', res.data.data.property.images[0].image_url);
  } catch (err) {
    console.error(err.message);
  }
}
check();
