const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function checkTables() {
  const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Parse cPanel/live schema from SQL file
  const liveTables = [];
  const createTableRegex = /CREATE TABLE\s+`([^`]+)`/gi;
  let match;
  while ((match = createTableRegex.exec(sqlContent)) !== null) {
    liveTables.push(match[1]);
  }

  // Connect to local database to retrieve its schema
  const localDbName = 'keyhost_booking_system';
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    const [rows] = await connection.query(`SHOW TABLES FROM \`${localDbName}\``);
    const localTables = rows.map(r => Object.values(r)[0]);

    console.log(`Live tables (${liveTables.length}):`, liveTables.sort());
    console.log(`Local tables (${localTables.length}):`, localTables.sort());

    const missingInLive = localTables.filter(t => !liveTables.includes(t));
    const missingInLocal = liveTables.filter(t => !localTables.includes(t));

    console.log('\nMissing in Live SQL dump:', missingInLive);
    console.log('Missing in Local database:', missingInLocal);

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

checkTables();
