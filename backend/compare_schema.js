const fs = require('fs');
const path = require('path');
const { pool } = require('./config/database');

async function compareSchemas() {
  try {
    const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db (5).sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Parse cPanel SQL dump
    const cpanelSchema = {};
    
    // Simple regex to find CREATE TABLE statements
    const createTableRegex = /CREATE TABLE `([^`]+)` \(([\s\S]*?)\) ENGINE=/g;
    let match;

    while ((match = createTableRegex.exec(sqlContent)) !== null) {
      const tableName = match[1];
      const columnsBlock = match[2];
      
      const columns = {};
      const columnLines = columnsBlock.split('\n');
      
      for (const line of columnLines) {
        const colMatch = line.trim().match(/^`([^`]+)`\s+([a-zA-Z0-9_]+(\([^)]+\))?)/);
        if (colMatch) {
          columns[colMatch[1]] = colMatch[2];
        }
      }
      
      cpanelSchema[tableName] = columns;
    }

    console.log(`Found ${Object.keys(cpanelSchema).length} tables in cPanel dump.`);

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
      localSchema[row.TABLE_NAME][row.COLUMN_NAME] = row.COLUMN_TYPE;
    }

    console.log(`Found ${Object.keys(localSchema).length} tables in local DB.`);

    // Compare schemas
    const alterStatements = [];

    // Check for missing tables in cPanel
    for (const [tableName, localCols] of Object.entries(localSchema)) {
      if (!cpanelSchema[tableName]) {
        alterStatements.push(`-- Table ${tableName} is missing in cPanel. You need to CREATE it.`);
        continue;
      }

      // Check for missing columns in cPanel
      const cpanelCols = cpanelSchema[tableName];
      for (const [colName, colType] of Object.entries(localCols)) {
        if (!cpanelCols[colName]) {
          alterStatements.push(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${colName}\` ${colType};`);
        }
      }
    }

    console.log('\n--- REQUIRED ALTER STATEMENTS ---');
    if (alterStatements.length === 0) {
      console.log('No schema differences found! The cPanel database matches the local database structure.');
    } else {
      console.log(alterStatements.join('\n'));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

compareSchemas();
