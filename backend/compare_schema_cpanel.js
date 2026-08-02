const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { pool } = require('./config/database');

// Parse CREATE TABLE statements from SQL dump
function parseSqlDump(content) {
  const tables = {};
  
  const createTableRegex = /CREATE TABLE `(\w+)` \(([\s\S]*?)\) ENGINE/g;
  let match;
  
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];
    
    const columns = {};
    const columnLines = columnsBlock.split('\n');
    
    for (const line of columnLines) {
      const trimmed = line.trim();
      const colMatch = trimmed.match(/^`(\w+)`\s+(.+?)(?:,\s*$|$)/);
      if (colMatch && !trimmed.startsWith('KEY') && !trimmed.startsWith('PRIMARY') && 
          !trimmed.startsWith('UNIQUE') && !trimmed.startsWith('INDEX') &&
          !trimmed.startsWith('CONSTRAINT') && !trimmed.startsWith('FULLTEXT')) {
        const colName = colMatch[1];
        let colDef = colMatch[2].trim().replace(/,$/, '').trim();
        columns[colName] = colDef;
      }
    }
    
    tables[tableName] = columns;
  }
  
  return tables;
}

async function getLocalSchema() {
  const tables = {};
  
  const [tableRows] = await pool.execute('SHOW TABLES');
  const tableKey = Object.keys(tableRows[0])[0];
  
  for (const row of tableRows) {
    const tableName = row[tableKey];
    tables[tableName] = {};
    
    const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${tableName}\``);
    for (const col of columns) {
      tables[tableName][col.Field] = `${col.Type}`;
    }
  }
  
  return tables;
}

async function compare() {
  console.log('🔍 Comparing Local DB vs CPanel SQL dump...\n');
  
  const sqlPath = path.join(__dirname, '..', 'keyhhhpg_keyhost_db.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  const cpanelTables = parseSqlDump(sqlContent);
  
  const localTables = await getLocalSchema();
  
  const cpanelTableNames = Object.keys(cpanelTables).sort();
  const localTableNames = Object.keys(localTables).sort();
  
  console.log(`📊 CPanel tables: ${cpanelTableNames.length}`);
  console.log(`📊 Local tables:  ${localTableNames.length}\n`);
  
  // Tables only in local (new — need to be created on CPanel)
  const onlyInLocal = localTableNames.filter(t => !cpanelTableNames.includes(t));
  // Tables only in CPanel (missing from local)
  const onlyInCPanel = cpanelTableNames.filter(t => !localTableNames.includes(t));
  
  if (onlyInLocal.length > 0) {
    console.log('🆕 NEW TABLES in Local (not in CPanel) — need to CREATE on CPanel:');
    onlyInLocal.forEach(t => console.log(`   + ${t}`));
    console.log('');
  } else {
    console.log('✅ No new tables to create on CPanel.\n');
  }
  
  if (onlyInCPanel.length > 0) {
    console.log('⚠️  Tables in CPanel but MISSING from Local:');
    onlyInCPanel.forEach(t => console.log(`   - ${t}`));
    console.log('');
  }
  
  // Column-level diffs for common tables
  const commonTables = localTableNames.filter(t => cpanelTableNames.includes(t));
  const diffs = [];
  
  for (const tableName of commonTables) {
    const localCols = Object.keys(localTables[tableName]);
    const cpanelCols = Object.keys(cpanelTables[tableName]);
    
    const newCols = localCols.filter(c => !cpanelCols.includes(c));
    const removedCols = cpanelCols.filter(c => !localCols.includes(c));
    
    if (newCols.length > 0 || removedCols.length > 0) {
      diffs.push({ table: tableName, newCols, removedCols });
    }
  }
  
  if (diffs.length > 0) {
    console.log('📋 COLUMN DIFFERENCES (existing tables):\n');
    const alterStatements = [];
    
    for (const diff of diffs) {
      console.log(`  📁 Table: \`${diff.table}\``);
      
      if (diff.newCols.length > 0) {
        console.log(`     🆕 New columns (need to ADD on CPanel):`);
        for (const col of diff.newCols) {
          const [colInfo] = await pool.execute(
            `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA 
             FROM information_schema.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [diff.table, col]
          );
          if (colInfo.length > 0) {
            const c = colInfo[0];
            let alterStmt = `ALTER TABLE \`${diff.table}\` ADD COLUMN \`${c.COLUMN_NAME}\` ${c.COLUMN_TYPE}`;
            if (c.IS_NULLABLE === 'NO') alterStmt += ' NOT NULL';
            else alterStmt += ' NULL';
            if (c.COLUMN_DEFAULT !== null) alterStmt += ` DEFAULT '${c.COLUMN_DEFAULT}'`;
            else if (c.IS_NULLABLE === 'YES') alterStmt += ' DEFAULT NULL';
            if (c.EXTRA) alterStmt += ` ${c.EXTRA.toUpperCase()}`;
            alterStmt += ';';
            console.log(`        + ${col}  →  ${c.COLUMN_TYPE}`);
            alterStatements.push(alterStmt);
          }
        }
      }
      
      if (diff.removedCols.length > 0) {
        console.log(`     ⚠️  Columns in CPanel but NOT in Local (maybe dropped/renamed):`);
        diff.removedCols.forEach(c => console.log(`        - ${c}`));
      }
      console.log('');
    }
    
    if (alterStatements.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📄 ALTER SQL to run on CPanel database:');
      console.log('═══════════════════════════════════════════════════════\n');
      alterStatements.forEach(s => console.log(s));
      
      // Also write to a file
      const outPath = path.join(__dirname, '..', 'cpanel_schema_updates.sql');
      const header = `-- Schema updates to apply on CPanel database\n-- Generated: ${new Date().toISOString()}\n\n`;
      fs.writeFileSync(outPath, header + alterStatements.join('\n') + '\n');
      console.log(`\n✅ SQL saved to: cpanel_schema_updates.sql`);
    }
  } else {
    console.log('✅ No column differences found! Local and CPanel schemas match.');
  }
  
  console.log('\n✅ Comparison complete!');
  await pool.end();
}

compare().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
