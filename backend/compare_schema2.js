const fs = require('fs');
const path = require('path');
const { pool } = require('./config/database');

async function compareSchemas() {
  try {
    const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db (5).sql');
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
        // More robust regex to capture full column type including ENUMs
        const colMatch = line.trim().match(/^`([^`]+)`\s+(.*?)(?:\s+NOT NULL|\s+DEFAULT|\s+NULL|,|$)/i);
        if (colMatch) {
          columns[colMatch[1]] = colMatch[2].trim().toLowerCase();
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

    for (const [tableName, localCols] of Object.entries(localSchema)) {
      if (!cpanelSchema[tableName]) {
        alterStatements.push(`-- Table ${tableName} is missing in cPanel.`);
        // Assuming we wouldn't want to just spit out a full CREATE TABLE right now, but we note it.
        continue;
      }

      const cpanelCols = cpanelSchema[tableName];
      for (const [colName, colType] of Object.entries(localCols)) {
        if (!cpanelCols[colName]) {
          alterStatements.push(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${colName}\` ${colType};`);
        } else if (cpanelCols[colName] !== colType) {
          // Check if ENUM has changed (e.g., added a new status)
          if (colType.includes('enum(') && cpanelCols[colName].includes('enum(')) {
             // Basic comparison
             if (cpanelCols[colName] !== colType) {
                alterStatements.push(`ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${colName}\` ${colType};`);
             }
          }
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
