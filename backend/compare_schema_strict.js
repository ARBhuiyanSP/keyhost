const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function importAndCompare() {
  const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db (5).sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  try {
    console.log('Creating cpanel_compare database...');
    await connection.query('DROP DATABASE IF EXISTS cpanel_compare');
    await connection.query('CREATE DATABASE cpanel_compare');
    await connection.query('USE cpanel_compare');

    console.log('Importing cPanel SQL dump...');
    await connection.query(sqlContent);
    console.log('Import successful.');

    console.log('Comparing schemas...');
    
    // Get all tables from local
    const [localCols] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'keyhost_booking_system'
    `);

    // Get all tables from cpanel
    const [cpanelCols] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = 'cpanel_compare'
    `);

    const cpanelMap = {};
    for (const row of cpanelCols) {
      if (!cpanelMap[row.TABLE_NAME]) cpanelMap[row.TABLE_NAME] = {};
      cpanelMap[row.TABLE_NAME][row.COLUMN_NAME] = row;
    }

    const alterStatements = [];

    let currentTable = '';
    for (const row of localCols) {
      const tableName = row.TABLE_NAME;
      const colName = row.COLUMN_NAME;
      
      if (!cpanelMap[tableName]) {
        if (currentTable !== tableName) {
          alterStatements.push(`-- Table ${tableName} is missing in cPanel.`);
          currentTable = tableName;
        }
        continue;
      }

      const cpanelCol = cpanelMap[tableName][colName];
      if (!cpanelCol) {
        let stmt = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${colName}\` ${row.COLUMN_TYPE}`;
        if (row.IS_NULLABLE === 'NO') stmt += ' NOT NULL';
        if (row.COLUMN_DEFAULT !== null) stmt += ` DEFAULT '${row.COLUMN_DEFAULT}'`;
        stmt += ';';
        alterStatements.push(stmt);
      } else {
        // Compare types strictly
        if (cpanelCol.COLUMN_TYPE !== row.COLUMN_TYPE) {
          alterStatements.push(`ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${colName}\` ${row.COLUMN_TYPE};`);
        }
      }
    }

    console.log('\n--- REQUIRED ALTER STATEMENTS FOR CPANEL ---');
    if (alterStatements.length === 0) {
      console.log('No schema differences found! The cPanel database matches the local database structure.');
    } else {
      console.log(alterStatements.join('\n'));
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.query('DROP DATABASE IF EXISTS cpanel_compare');
    await connection.end();
  }
}

importAndCompare();
