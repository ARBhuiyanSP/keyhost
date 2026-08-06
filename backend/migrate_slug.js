// Migration: Add slug column to properties table and backfill existing rows
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function generateSlug(title, id) {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')     // keep alphanumeric, spaces, hyphens
    .trim()
    .replace(/\s+/g, '-')             // spaces to hyphens
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .substring(0, 80);                // max 80 chars for title part
  return `${slug}-${id}`;
}

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // 1. Add slug column if not exists
    console.log('Adding slug column...');
    await pool.execute(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL
    `);
    console.log('slug column added (or already exists).');

    // 2. Backfill all existing properties
    const [rows] = await pool.execute('SELECT id, title FROM properties WHERE slug IS NULL OR slug = ""');
    console.log(`Found ${rows.length} properties needing slug backfill...`);

    for (const row of rows) {
      const slug = generateSlug(row.title, row.id);
      await pool.execute('UPDATE properties SET slug = ? WHERE id = ?', [slug, row.id]);
      console.log(`  ID ${row.id}: "${row.title}" → "${slug}"`);
    }

    // 3. Add unique index
    try {
      await pool.execute('CREATE UNIQUE INDEX idx_properties_slug ON properties (slug)');
      console.log('Unique index on slug created.');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('Unique index already exists, skipping.');
      } else {
        console.log('Index note:', e.message);
      }
    }

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
})();
