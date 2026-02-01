const { pool } = require('./config/database');

async function testPropertyImages() {
  try {
    console.log('\n🔍 Testing Property Images...\n');
    
    // Get latest property with images
    const [properties] = await pool.execute(`
      SELECT 
        p.id, 
        p.title,
        (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count
      FROM properties p
      ORDER BY p.id DESC
      LIMIT 5
    `);
    
    console.log('=== Recent Properties ===\n');
    properties.forEach(prop => {
      console.log(`Property ID: ${prop.id}`);
      console.log(`Title: ${prop.title}`);
      console.log(`Image Count: ${prop.image_count}`);
      console.log('---');
    });
    
    if (properties.length > 0 && properties[0].image_count > 0) {
      const propertyId = properties[0].id;
      
      console.log(`\n=== Images for Property ${propertyId} ===\n`);
      
      const [images] = await pool.execute(`
        SELECT 
          id, 
          image_type, 
          LEFT(image_url, 50) as preview,
          LENGTH(image_url) as length,
          sort_order,
          is_active
        FROM property_images
        WHERE property_id = ?
        ORDER BY sort_order
      `, [propertyId]);
      
      images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`);
        console.log(`  ID: ${img.id}`);
        console.log(`  Type: ${img.image_type}`);
        console.log(`  Preview: ${img.preview}...`);
        console.log(`  Length: ${img.length} chars`);
        console.log(`  Order: ${img.sort_order}`);
        console.log(`  Active: ${img.is_active ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️ No properties with images found\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPropertyImages();



