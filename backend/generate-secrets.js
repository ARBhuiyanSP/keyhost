const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('--- JWT Secrets Generator ---');
console.log('Copy these to your .env file on the server:');
console.log('');
console.log(`JWT_SECRET=${secret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log('');
