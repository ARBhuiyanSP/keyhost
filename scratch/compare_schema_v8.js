const fs = require('fs');
const path = require('path');
const { pool } = require('../backend/config/database');

async function compareSchemas() {
  try {
    const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db (8).sql');
    if (!fs.existsSync(sqlFile)) {
      console.error(`SQL file not found at ${sqlFile}`);
      process.exit(1);
    }
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Parse cPanel SQL dump
    const cpanelSchema = {};
    const createTableRegex = /CREATE TABLE `([^`]+)` \(([\s\S]*?)\) ENGINE=/g;
    let match;

    while ((match = createTableRegex.exec(sqlContent)) !== null) {
      const tableName = match[1];
      const columnsBlock = match[2];
      
      const columns = {};
      const columnLines = columnsBlock.split('\n');
      
      for (const line of columnLines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('`')) {
          const secondBacktick = trimmed.indexOf('`', 1);
          if (secondBacktick > -1) {
            const colName = trimmed.substring(1, secondBacktick);
            const remainder = trimmed.substring(secondBacktick + 1).trim();
            
            // Find type: everything up to the first space outside of parentheses
            let colType = '';
            let parenDepth = 0;
            let ended = false;
            for (let i = 0; i < remainder.length; i++) {
              const char = remainder[i];
              if (char === '(') parenDepth++;
              if (char === ')') parenDepth--;
              if (char === ' ' && parenDepth === 0) {
                colType = remainder.substring(0, i);
                ended = true;
                break;
              }
            }
            if (!ended) {
              const commaIndex = remainder.indexOf(',');
              if (commaIndex > -1) {
                colType = remainder.substring(0, commaIndex).trim();
              } else {
                colType = remainder.trim();
              }
            }
            if (colType.endsWith(',')) colType = colType.slice(0, -1);
            columns[colName] = colType.trim().toLowerCase();
          }
        }
      }
      
      cpanelSchema[tableName] = columns;
    }

    // Fetch local schema
    const [localColumns] = await pool.execute(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'keyhost_booking_system'
    `);

    const localSchema = {};
    for (const row of localColumns) {
      if (!localSchema[row.TABLE_NAME]) {
        localSchema[row.TABLE_NAME] = {};
      }
      localSchema[row.TABLE_NAME][row.COLUMN_NAME] = row.COLUMN_TYPE.toLowerCase();
    }

    // Compare schemas
    const alterStatements = [];
    const missingTables = [];

    for (const [tableName, localCols] of Object.entries(localSchema)) {
      if (!cpanelSchema[tableName]) {
        missingTables.push(tableName);
        continue;
      }

      const cpanelCols = cpanelSchema[tableName];
      for (const [colName, colType] of Object.entries(localCols)) {
        if (!cpanelCols[colName]) {
          alterStatements.push(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${colName}\` ${colType.toUpperCase()};`);
        } else {
          // Normalize spaces and lowercase for comparison
          const localNormalized = colType.replace(/\s+/g, '').toLowerCase();
          const cpanelNormalized = cpanelCols[colName].replace(/\s+/g, '').toLowerCase();
          if (localNormalized !== cpanelNormalized) {
             console.log(`Diff in \`${tableName}\`.\`${colName}\`: Local='${colType}', cPanel='${cpanelCols[colName]}'`);
             alterStatements.push(`ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${colName}\` ${colType.toUpperCase()};`);
          }
        }
      }
    }

    let output = '';
    output += '\n=== TABLES FOUND IN CPANEL DUMP ===\n';
    output += Object.keys(cpanelSchema).sort().join(', ') + '\n';

    output += '\n=== MISSING TABLES IN CPANEL DUMP ===\n';
    if (missingTables.length === 0) {
      output += 'No missing tables.\n';
    } else {
      output += missingTables.join('\n') + '\n';
    }

    output += '\n=== REQUIRED ALTER STATEMENTS ===\n';
    if (alterStatements.length === 0) {
      output += 'No schema differences found for existing tables!\n';
    } else {
      output += alterStatements.join('\n') + '\n';
    }

    fs.writeFileSync(path.join(__dirname, 'schema_comparison_results.txt'), output, 'utf8');
    console.log('Results written to scratch/schema_comparison_results.txt');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

compareSchemas();
