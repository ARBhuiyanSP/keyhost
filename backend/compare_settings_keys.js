const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function compareSettings() {
  const sqlFile = path.join(__dirname, '../keyhhhpg_keyhost_db.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Regex to find all settings inserted in system_settings in the dump file
  const liveKeys = new Set();
  
  // Find all inserts in system_settings
  // e.g. (1, 'platform_name', 'Keyhost Homes', 'string', ...)
  // We can search for the values block of INSERT INTO `system_settings`
  const insertRegex = /INSERT INTO `system_settings` [^)]+\) VALUES([\s\S]*?);/g;
  let match;
  while ((match = insertRegex.exec(sqlContent)) !== null) {
    const valuesBlock = match[1];
    // Split values block by individual rows
    // e.g. (1, 'platform_name', 'Keyhost Homes', ...)
    const rowRegex = /\(\s*\d+\s*,\s*'([^']+)'/g;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      liveKeys.add(rowMatch[1]);
    }
  }

  console.log(`Found ${liveKeys.size} setting keys in live SQL dump.`);

  // Connect to local database
  const localDbName = 'keyhost_booking_system';
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    const [rows] = await connection.query(`
      SELECT setting_key, setting_value, setting_type, description, is_public 
      FROM \`${localDbName}\`.system_settings
    `);

    console.log(`Found ${rows.length} setting keys in local database.`);

    const missingInLive = [];

    for (const row of rows) {
      if (!liveKeys.has(row.setting_key)) {
        missingInLive.push(row);
      }
    }

    console.log(`Found ${missingInLive.length} missing settings.`);

    if (missingInLive.length > 0) {
      let sqlFileContent = `-- SQL script to insert missing system settings on live database\n`;
      sqlFileContent += `-- Generated on ${new Date().toISOString()}\n\n`;

      for (const item of missingInLive) {
        const escapedVal = item.setting_value.replace(/'/g, "''");
        const escapedDesc = item.description ? item.description.replace(/'/g, "''") : '';
        const insertSql = `INSERT INTO \`system_settings\` (\`setting_key\`, \`setting_value\`, \`setting_type\`, \`description\`, \`is_public\`) \nVALUES ('${item.setting_key}', '${escapedVal}', '${item.setting_type}', '${escapedDesc}', ${item.is_public ? 1 : 0}) \nON DUPLICATE KEY UPDATE \`setting_value\` = VALUES(\`setting_value\`);\n\n`;
        sqlFileContent += insertSql;
      }

      const outPath = path.join(__dirname, '../missing_settings.sql');
      fs.writeFileSync(outPath, sqlFileContent, 'utf8');
      console.log(`Successfully wrote missing settings SQL to ${outPath}`);
    } else {
      console.log('No missing settings found.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

compareSettings();
