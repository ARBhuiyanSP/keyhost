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

    const alterStatements = [];
    const missingTables = [];

    // Compare local schema to live schema
    for (const [tableName, localTableCols] of Object.entries(localSchema)) {
      if (!liveSchema[tableName]) {
        missingTables.push(tableName);
        continue;
      }

      const liveTableCols = liveSchema[tableName];

      for (const [colName, localCol] of Object.entries(localTableCols)) {
        const liveCol = liveTableCols[colName];

        if (!liveCol) {
          let stmt = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${colName}\` ${localCol.columnType}`;
          if (!localCol.isNullable) stmt += ' NOT NULL';
          if (localCol.defaultValue !== null && localCol.defaultValue !== 'NULL' && localCol.defaultValue !== 'null') {
            if (localCol.defaultValue === 'CURRENT_TIMESTAMP' || localCol.defaultValue === 'current_timestamp()') {
              stmt += ` DEFAULT CURRENT_TIMESTAMP`;
            } else {
              stmt += ` DEFAULT '${localCol.defaultValue}'`;
            }
          } else if (localCol.isNullable) {
            stmt += ' DEFAULT NULL';
          }
          stmt += ';';
          alterStatements.push(stmt);
        } else {
          // Compare types
          const cleanLocalType = localCol.columnType.replace(/\s+/g, ' ');
          const cleanLiveType = liveCol.columnType.replace(/\s+/g, ' ');

          // Standardize display width differences (e.g. int(11) vs int, tinyint(1) vs tinyint)
          const standardize = (typeStr) => {
            return typeStr
              .replace(/\(\d+\)/g, '')
              .replace(/double\(\d+,\d+\)/g, 'double')
              .replace(/decimal\(\d+,\d+\)/g, 'decimal')
              .replace(/bigint/g, 'int') // Loose check for bigint vs int if needed, but let's be strict.
              .trim();
          };

          const typeMapLocal = standardize(cleanLocalType);
          const typeMapLive = standardize(cleanLiveType);

          if (cleanLocalType !== cleanLiveType && typeMapLocal !== typeMapLive) {
            let stmt = `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${colName}\` ${localCol.columnType}`;
            if (!localCol.isNullable) stmt += ' NOT NULL';
            if (localCol.defaultValue !== null && localCol.defaultValue !== 'NULL' && localCol.defaultValue !== 'null') {
              if (localCol.defaultValue === 'CURRENT_TIMESTAMP' || localCol.defaultValue === 'current_timestamp()') {
                stmt += ` DEFAULT CURRENT_TIMESTAMP`;
              } else {
                stmt += ` DEFAULT '${localCol.defaultValue}'`;
              }
            } else if (localCol.isNullable) {
              stmt += ' DEFAULT NULL';
            }
            stmt += ';';
            alterStatements.push(stmt);
          }
        }
      }
    }

    // Generate CREATE TABLE SQL for missing tables
    const createTableStatements = [];
    if (missingTables.length > 0) {
      console.log(`\nFound ${missingTables.length} missing tables in live database dump.`);
      await connection.query(`USE \`${localDbName}\``);
      for (const tableName of missingTables) {
        const [rows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
        if (rows && rows.length > 0) {
          createTableStatements.push(rows[0]['Create Table'] + ';');
        }
      }
    }

    console.log('\n=============================================');
    console.log('   REQUIRED SCHEMAS UPDATES FOR LIVE SERVER');
    console.log('=============================================');

    if (createTableStatements.length > 0) {
      console.log('\n--- 1. MISSING TABLES TO BE CREATED ---');
      console.log(createTableStatements.join('\n\n'));
    }

    if (alterStatements.length > 0) {
      console.log('\n--- 2. ALTER TABLE STATEMENTS (MISSING COLUMNS OR MISMATCHED TYPES) ---');
      console.log(alterStatements.join('\n'));
    }

    if (createTableStatements.length === 0 && alterStatements.length === 0) {
      console.log('\n✅ No differences found! The live database dump matches the local database structure.');
    }

    console.log('\n=============================================');

  } catch (err) {
    console.error('Error during schema comparison:', err);
  } finally {
    await connection.end();
  }
}

runComparison();
