const bcrypt = require('bcrypt');

async function createAdminPassword() {
  try {
    const password = 'password123';
    const saltRounds = 10;
    
    console.log('Creating password hash for admin user...');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    
    // Create SQL update statement
    const updateSQL = `UPDATE users SET password = '${hashedPassword}' WHERE email = 'admin@keyhost.com';`;
    console.log('\nSQL Update Statement:');
    console.log(updateSQL);
    
    return hashedPassword;
  } catch (error) {
    console.error('Error creating password hash:', error);
  }
}

createAdminPassword();
