const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function runComparison() {
  const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error(`Error: SQL file not found at ${sqlFile}`);
    process.exit(1);
  }
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Parse cPanel/live schema from SQL file
  const liveSchema = {};
  
  // Find all CREATE TABLE blocks
  const createTableRegex = /CREATE TABLE\s+`([^`]+)`\s*\(([\s\S]*?)\)\s*(?:ENGINE|;)/gi;
  let match;
  
  while ((match = createTableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];
    
    const columns = {};
    const lines = columnsBlock.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      // Match lines defining columns: starts with backtick, then column name, then column type definition
      const colMatch = line.match(/^`([^`]+)`\s+([a-zA-Z0-9_]+(?:\([^)]+\))?(?:\s+unsigned)?)/i);
      if (colMatch) {
        const columnName = colMatch[1];
        let columnType = colMatch[2].trim().toLowerCase();
        
        const isNullable = !line.toUpperCase().includes('NOT NULL');
        let defaultValue = null;
        
        const defaultMatch = line.match(/DEFAULT\s+('([^']*)'|([a-zA-Z0-9_().]+))/i);
        if (defaultMatch) {
          defaultValue = defaultMatch[2] !== undefined ? defaultMatch[2] : defaultMatch[3];
        }
        
        columns[columnName] = {
          columnName,
          columnType,
          isNullable,
          defaultValue,
          rawLine: line
        };
      }
    }
    
    liveSchema[tableName] = columns;
  }

  console.log(`Parsed ${Object.keys(liveSchema).length} tables from keyhhhpg_keyhost_db.sql dump.`);

  // Connect to local database to retrieve its schema
  const localDbName = 'keyhost_booking_system';
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    console.log(`Fetching schema for local database '${localDbName}'...`);
    
    const [localCols] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `, [localDbName]);

    const localSchema = {};
    for (const row of localCols) {
      if (!localSchema[row.TABLE_NAME]) {
        localSchema[row.TABLE_NAME] = {};
      }
      localSchema[row.TABLE_NAME][row.COLUMN_NAME] = {
        tableName: row.TABLE_NAME,
        columnName: row.COLUMN_NAME,
        columnType: row.COLUMN_TYPE.toLowerCase(),
        isNullable: row.IS_NULLABLE === 'YES',
        defaultValue: row.COLUMN_DEFAULT
      };
    }

    console.log(`Found ${Object.keys(localSchema).length} tables in local database.`);

    const missingTablesInLocal = [];
    const missingColumnsInLocal = [];
    const typeMismatches = [];

    const missingTablesInLive = [];
    const missingColumnsInLive = [];

    const standardizeType = (t) => t.replace(/\s+/g, ' ').replace(/\(\d+\)/g, '').toLowerCase().trim();

    // 1. Check Live -> Local (what is missing/different in local)
    for (const [tableName, liveTableCols] of Object.entries(liveSchema)) {
      if (!localSchema[tableName]) {
        missingTablesInLocal.push(tableName);
        continue;
      }

      const localTableCols = localSchema[tableName];
      for (const [colName, liveCol] of Object.entries(liveTableCols)) {
        const localCol = localTableCols[colName];
        if (!localCol) {
          missingColumnsInLocal.push({
            tableName,
            colName,
            colType: liveCol.columnType,
            isNullable: liveCol.isNullable,
            defaultValue: liveCol.defaultValue
          });
        } else {
          const stdLive = standardizeType(liveCol.columnType);
          const stdLocal = standardizeType(localCol.columnType);
          if (stdLive !== stdLocal) {
            typeMismatches.push({
              tableName,
              colName,
              liveType: liveCol.columnType,
              localType: localCol.columnType
            });
          }
        }
      }
    }

    // 2. Check Local -> Live (what is missing/different in live)
    for (const [tableName, localTableCols] of Object.entries(localSchema)) {
      if (!liveSchema[tableName]) {
        missingTablesInLive.push(tableName);
        continue;
      }

      const liveTableCols = liveSchema[tableName];
      for (const [colName, localCol] of Object.entries(localTableCols)) {
        const liveCol = liveTableCols[colName];
        if (!liveCol) {
          missingColumnsInLive.push({
            tableName,
            colName,
            colType: localCol.columnType
          });
        }
      }
    }

    console.log('\n==================================================');
    console.log('         BI-DIRECTIONAL SCHEMA COMPARISON');
    console.log('==================================================');

    // Section A: Updates required in LOCAL to match LIVE
    console.log('\n--- 1. CHANGES NEEDED IN LOCAL DATABASE (Live has these, Local is missing them) ---');
    let localClean = true;

    if (missingTablesInLocal.length > 0) {
      localClean = false;
      console.log('\n[!] Missing tables in LOCAL:');
      missingTablesInLocal.forEach(t => console.log(`    - Table: \`${t}\``));
    }

    if (missingColumnsInLocal.length > 0) {
      localClean = false;
      console.log('\n[!] Missing columns in LOCAL:');
      missingColumnsInLocal.forEach(c => {
        let stmt = `ALTER TABLE \`${c.tableName}\` ADD COLUMN \`${c.colName}\` ${c.colType}`;
        if (!c.isNullable) stmt += ' NOT NULL';
        if (c.defaultValue !== null) stmt += ` DEFAULT '${c.defaultValue}'`;
        stmt += ';';
        console.log(`    - ${stmt}`);
      });
    }

    if (typeMismatches.length > 0) {
      localClean = false;
      console.log('\n[!] Column Datatype Mismatches (Live vs Local):');
      typeMismatches.forEach(m => {
        console.log(`    - \`${m.tableName}\`.\`${m.colName}\`: Live type is \`${m.liveType}\` | Local type is \`${m.localType}\``);
      });
    }

    if (localClean) {
      console.log('✅ Local database is fully up-to-date with Live schema (No missing tables/columns or mismatches).');
    }

    // Section B: Updates required in LIVE to match LOCAL
    console.log('\n--- 2. CHANGES NEEDED IN LIVE DATABASE (Local has these, Live is missing them) ---');
    let liveClean = true;

    if (missingTablesInLive.length > 0) {
      liveClean = false;
      console.log('\n[!] Missing tables in LIVE:');
      missingTablesInLive.forEach(t => console.log(`    - Table: \`${t}\``));
    }

    if (missingColumnsInLive.length > 0) {
      liveClean = false;
      console.log('\n[!] Missing columns in LIVE:');
      missingColumnsInLive.forEach(c => {
        console.log(`    - Table: \`${c.tableName}\` | Column: \`${c.colName}\` (Type: ${c.colType})`);
      });
    }

    if (liveClean) {
      console.log('✅ Live database is fully up-to-date with Local schema.');
    }

    console.log('\n==================================================');

  } catch (err) {
    console.error('Error during schema comparison:', err);
  } finally {
    await connection.end();
  }
}

runComparison();
