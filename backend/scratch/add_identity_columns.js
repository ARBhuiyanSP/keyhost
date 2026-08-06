const { pool } = require('../config/database');

async function addColumns() {
  const connection = await pool.getConnection();
  try {
    const columns = [
      { name: 'nationality', type: 'VARCHAR(100) NULL DEFAULT NULL' },
      { name: 'nid_number', type: 'VARCHAR(50) NULL DEFAULT NULL' },
      { name: 'passport_number', type: 'VARCHAR(50) NULL DEFAULT NULL' },
      { name: 'nid_document_url', type: 'TEXT NULL DEFAULT NULL' },
      { name: 'passport_document_url', type: 'TEXT NULL DEFAULT NULL' }
    ];

    const [existingCols] = await connection.query('DESCRIBE users');
    const existingNames = existingCols.map(c => c.Field);

    for (const col of columns) {
      if (!existingNames.includes(col.name)) {
        await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column ${col.name} to users table`);
      } else {
        console.log(`ℹ️ Column ${col.name} already exists`);
      }
    }
    console.log('✅ All identity columns verified successfully!');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

addColumns();
