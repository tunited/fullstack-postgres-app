import pool from './src/config/db.js';

async function migrate() {
  try {
    await pool.query('ALTER TABLE tickets ADD COLUMN IF NOT EXISTS form_name VARCHAR(255);');
    console.log('Successfully added form_name column to tickets table.');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}
migrate();
