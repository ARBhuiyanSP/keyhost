const bcrypt = require('bcryptjs');

async function generatePassword() {
  try {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('UPDATE users SET password = \'' + hashedPassword + '\' WHERE email = \'admin@keyhost.com\';');
    console.log('UPDATE users SET password = \'' + hashedPassword + '\' WHERE email = \'owner1@keyhost.com\';');
    console.log('UPDATE users SET password = \'' + hashedPassword + '\' WHERE email = \'guest1@keyhost.com\';');
  } catch (error) {
    console.error('Error:', error);
  }
}

generatePassword();
