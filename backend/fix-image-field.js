const { pool } = require('./config/database');

async function fixImageField() {
  try {
    console.log('\n🔧 Fixing property_images.image_url field...\n');
    
    // Alter table to support large base64 images
    console.log('Changing image_url from TEXT to LONGTEXT...');
    await pool.execute(`
      ALTER TABLE property_images 
      MODIFY COLUMN image_url LONGTEXT
    `);
    
    console.log('✅ Field type updated to LONGTEXT\n');
    
    // Verify
    const [fields] = await pool.execute(`
      DESCRIBE property_images
    `);
    
    console.log('=== property_images Table Structure ===\n');
    fields.forEach(field => {
      console.log(`${field.Field}: ${field.Type}`);
    });
    
    console.log('\n✅ Fix completed successfully!\n');
    console.log('Now you can upload large images (base64) without truncation.\n');
    console.log('Next steps:');
    console.log('  1. Re-upload your property images');
    console.log('  2. Images will now save completely');
    console.log('  3. Edit will show full images');
    console.log('  4. Property list will show images\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixImageField();



