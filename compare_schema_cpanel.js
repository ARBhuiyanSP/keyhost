const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });
const { pool } = require('./backend/config/database');

// Parse CREATE TABLE statements from SQL dump
function parseSqlDump(content) {
  const tables = {};
  
  // Extract each CREATE TABLE block
  const createTableRegex = /CREATE TABLE `(\w+)` \(([\s\S]*?)\) ENGINE/g;
  let match;
  
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];
    
    const columns = {};
    const columnLines = columnsBlock.split('\n');
    
    for (const line of columnLines) {
      const trimmed = line.trim();
      // Match column definitions (not KEY, PRIMARY KEY, INDEX, UNIQUE, CONSTRAINT)
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
  
  // Get all table names
  const [tableRows] = await pool.execute('SHOW TABLES');
  const tableKey = Object.keys(tableRows[0])[0];
  
  for (const row of tableRows) {
    const tableName = row[tableKey];
    tables[tableName] = {};
    
    // Get columns for each table
    const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${tableName}\``);
    for (const col of columns) {
      tables[tableName][col.Field] = `${col.Type}${col.Null === 'NO' ? ' NOT NULL' : ''}${col.Default !== null ? ` DEFAULT '${col.Default}'` : ''}`;
    }
  }
  
  return tables;
}

async function compare() {
  console.log('🔍 Comparing local DB vs CPanel SQL dump...\n');
  
  // Read SQL dump
  const sqlPath = path.join(__dirname, 'keyhhhpg_keyhost_db.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  const cpanelTables = parseSqlDump(sqlContent);
  
  // Get local schema
  const localTables = await getLocalSchema();
  
  const cpanelTableNames = Object.keys(cpanelTables).sort();
  const localTableNames = Object.keys(localTables).sort();
  
  console.log(`📊 CPanel tables: ${cpanelTableNames.length}`);
  console.log(`📊 Local tables: ${localTableNames.length}\n`);
  
  // Tables only in local (new tables not in CPanel)
  const onlyInLocal = localTableNames.filter(t => !cpanelTableNames.includes(t));
  // Tables only in CPanel (tables local is missing)
  const onlyInCPanel = cpanelTableNames.filter(t => !localTableNames.includes(t));
  
  if (onlyInLocal.length > 0) {
    console.log('🆕 NEW TABLES in Local (not in CPanel) — need to add to CPanel:');
    onlyInLocal.forEach(t => console.log(`   + ${t}`));
    console.log('');
  }
  
  if (onlyInCPanel.length > 0) {
    console.log('❌ Tables in CPanel but MISSING from Local:');
    onlyInCPanel.forEach(t => console.log(`   - ${t}`));
    console.log('');
  }
  
  // Column-level comparison for common tables
  const commonTables = localTableNames.filter(t => cpanelTableNames.includes(t));
  
  const diffs = [];
  
  for (const tableName of commonTables) {
    const localCols = localTables[tableName];
    const cpanelCols = cpanelTables[tableName];
    
    const localColNames = Object.keys(localCols);
    const cpanelColNames = Object.keys(cpanelCols);
    
    // New columns in local (not in CPanel)
    const newCols = localColNames.filter(c => !cpanelColNames.includes(c));
    // Removed columns (in CPanel but not local)
    const removedCols = cpanelColNames.filter(c => !localColNames.includes(c));
    
    if (newCols.length > 0 || removedCols.length > 0) {
      diffs.push({ table: tableName, newCols, removedCols });
    }
  }
  
  if (diffs.length > 0) {
    console.log('📋 COLUMN DIFFERENCES in existing tables:\n');
    for (const diff of diffs) {
      console.log(`  Table: \`${diff.table}\``);
      if (diff.newCols.length > 0) {
        console.log(`    🆕 New columns in Local (add to CPanel):`);
        for (const col of diff.newCols) {
          // Get full column definition from local DB
          const [colInfo] = await pool.execute(`SHOW COLUMNS FROM \`${diff.table}\` WHERE Field = ?`, [col]);
          if (colInfo.length > 0) {
            const c = colInfo[0];
            let alterStmt = `ALTER TABLE \`${diff.table}\` ADD COLUMN \`${c.Field}\` ${c.Type}`;
            if (c.Null === 'NO') alterStmt += ' NOT NULL';
            else alterStmt += ' NULL';
            if (c.Default !== null) alterStmt += ` DEFAULT '${c.Default}'`;
            else if (c.Null === 'YES') alterStmt += ' DEFAULT NULL';
            alterStmt += ';';
            console.log(`       + ${col}`);
            console.log(`         SQL: ${alterStmt}`);
          }
        }
      }
      if (diff.removedCols.length > 0) {
        console.log(`    ⚠️  Columns in CPanel but NOT in Local (possibly dropped or renamed):`);
        diff.removedCols.forEach(c => console.log(`       - ${c}`));
      }
      console.log('');
    }
  } else {
    console.log('✅ No column differences found in common tables!');
  }
  
  console.log('\n✅ Comparison complete!');
  await pool.end();
}

compare().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
