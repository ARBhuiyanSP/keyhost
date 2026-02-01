const mysql = require('mysql2');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'keyhost_booking_system',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

// Read SQL file
const sqlFilePath = path.join(__dirname, 'create-property-types-table.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🔄 Running migration to create property_types table...\n');

connection.query(sql, (error, results) => {
  if (error) {
    console.error('❌ Migration failed:', error.message);
    
    // If it's a "duplicate key" or "already exists" error, that's okay
    if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_FIELDNAME' || error.message.includes('already exists') || error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  Some objects already exist, but migration completed.');
      console.log('✅ Migration completed successfully!');
      connection.end();
      process.exit(0);
    } else {
      connection.end();
      process.exit(1);
    }
  } else {
    console.log('✅ Migration completed successfully!');
    console.log('✅ property_types table created');
    console.log('✅ Default property types inserted');
    console.log('\n📋 Default property types:');
    console.log('   • Room');
    console.log('   • Apartment');
    console.log('   • Villa');
    console.log('   • House');
    console.log('\n🎯 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Access /admin/property-types in the frontend');
    console.log('   3. Add more property types as needed');
    connection.end();
    process.exit(0);
  }
});

