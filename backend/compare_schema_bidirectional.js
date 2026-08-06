const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function compareBidirectional() {
  const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error(`Error: SQL file not found at ${sqlFile}`);
    process.exit(1);
  }
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Connect to local MySQL instance
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  const localDbName = 'keyhost_booking_system';
  const compareDbName = 'cpanel_compare_temp';

  try {
    console.log(`Creating temporary database '${compareDbName}'...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${compareDbName}\``);
    await connection.query(`CREATE DATABASE \`${compareDbName}\``);
    await connection.query(`USE \`${compareDbName}\``);

    console.log('Importing live cPanel SQL dump (this may take a few seconds)...');
    await connection.query(sqlContent);
    console.log('Import successful.');

    console.log('\nAnalyzing schemas...');
    
    // Fetch schema info from Local database
    const [localCols] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
    `, [localDbName]);

    // Fetch schema info from Live database (imported in temp db)
    const [liveCols] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
    `, [compareDbName]);

    // Build Maps
    const localMap = {};
    for (const row of localCols) {
      if (!localMap[row.TABLE_NAME]) localMap[row.TABLE_NAME] = {};
      localMap[row.TABLE_NAME][row.COLUMN_NAME] = row;
    }

    const liveMap = {};
    for (const row of liveCols) {
      if (!liveMap[row.TABLE_NAME]) liveMap[row.TABLE_NAME] = {};
      liveMap[row.TABLE_NAME][row.COLUMN_NAME] = row;
    }

    const missingTablesInLocal = [];
    const missingColumnsInLocal = [];
    const typeMismatches = [];

    const missingTablesInLive = [];
    const missingColumnsInLive = [];

    const standardizeType = (t) => t.replace(/\s+/g, ' ').replace(/\(\d+\)/g, '').toLowerCase().trim();

    // 1. Check Live -> Local (what is missing/different locally)
    for (const [tableName, liveTableCols] of Object.entries(liveMap)) {
      if (!localMap[tableName]) {
        missingTablesInLocal.push(tableName);
        continue;
      }

      const localTableCols = localMap[tableName];
      for (const [colName, liveCol] of Object.entries(liveTableCols)) {
        const localCol = localTableCols[colName];
        if (!localCol) {
          missingColumnsInLocal.push({ tableName, colName, colType: liveCol.COLUMN_TYPE, isNullable: liveCol.IS_NULLABLE, defaultValue: liveCol.COLUMN_DEFAULT });
        } else {
          // Compare type
          const stdLive = standardizeType(liveCol.COLUMN_TYPE);
          const stdLocal = standardizeType(localCol.COLUMN_TYPE);
          if (stdLive !== stdLocal) {
            typeMismatches.push({
              tableName,
              colName,
              liveType: liveCol.COLUMN_TYPE,
              localType: localCol.COLUMN_TYPE
            });
          }
        }
      }
    }

    // 2. Check Local -> Live (what is missing on live server)
    for (const [tableName, localTableCols] of Object.entries(localMap)) {
      if (!liveMap[tableName]) {
        missingTablesInLive.push(tableName);
        continue;
      }

      const liveTableCols = liveMap[tableName];
      for (const [colName, localCol] of Object.entries(localTableCols)) {
        const liveCol = liveTableCols[colName];
        if (!liveCol) {
          missingColumnsInLive.push({ tableName, colName, colType: localCol.COLUMN_TYPE });
        }
      }
    }

    console.log('\n==================================================');
    console.log('            SCHEMA COMPARISON REPORT');
    console.log('==================================================');

    console.log(`\nLocal Database: ${localDbName}`);
    console.log(`Live SQL Dump:  keyhhhpg_keyhost_db.sql`);

    let clean = true;

    // --- LOCAL DB UPDATES NEEDED (WHAT IS MISSING LOCALLY) ---
    console.log('\n--------------------------------------------------');
    console.log(' 👉 LOCAL DATABASE UPDATES NEEDED (Live has these, Local does not)');
    console.log('--------------------------------------------------');

    if (missingTablesInLocal.length > 0) {
      clean = false;
      console.log('\n[!] Missing Tables in Local:');
      missingTablesInLocal.forEach(t => console.log(`  - Table: \`${t}\``));
    }

    if (missingColumnsInLocal.length > 0) {
      clean = false;
      console.log('\n[!] Missing Columns in Local:');
      missingColumnsInLocal.forEach(c => {
        let sql = `ALTER TABLE \`${c.tableName}\` ADD COLUMN \`${c.colName}\` ${c.colType}`;
        if (c.isNullable === 'NO') sql += ' NOT NULL';
        if (c.defaultValue !== null) sql += ` DEFAULT '${c.defaultValue}'`;
        sql += ';';
        console.log(`  - ${sql}`);
      });
    }

    if (typeMismatches.length > 0) {
      clean = false;
      console.log('\n[!] Column Datatype Mismatches:');
      typeMismatches.forEach(m => {
        console.log(`  - \`${m.tableName}\`.\`${m.colName}\`: Live type is \`${m.liveType}\` | Local type is \`${m.localType}\``);
      });
    }

    if (missingTablesInLocal.length === 0 && missingColumnsInLocal.length === 0 && typeMismatches.length === 0) {
      console.log('\n✅ Local database is fully up-to-date with cPanel live schema.');
    }

    // --- LIVE DB UPDATES NEEDED (WHAT IS MISSING ON LIVE SERVER) ---
    console.log('\n--------------------------------------------------');
    console.log(' 👉 LIVE DATABASE UPDATES NEEDED (Local has these, Live does not)');
    console.log('--------------------------------------------------');

    let liveClean = true;
    if (missingTablesInLive.length > 0) {
      liveClean = false;
      console.log('\n[!] Missing Tables in Live SQL Dump:');
      missingTablesInLive.forEach(t => console.log(`  - Table: \`${t}\``));
    }

    if (missingColumnsInLive.length > 0) {
      liveClean = false;
      console.log('\n[!] Missing Columns in Live SQL Dump:');
      missingColumnsInLive.forEach(c => {
        console.log(`  - Table: \`${c.tableName}\` | Column: \`${c.colName}\` (Type: ${c.colType})`);
      });
    }

    if (liveClean) {
      console.log('\n✅ Live database has no missing tables or columns compared to Local.');
    }

    console.log('\n==================================================');

  } catch (err) {
    console.error('Error during schema comparison:', err);
  } finally {
    console.log('\nCleaning up temporary comparison database...');
    await connection.query(`DROP DATABASE IF EXISTS \`${compareDbName}\``);
    await connection.end();
    console.log('Cleanup completed.');
  }
}

compareBidirectional();
