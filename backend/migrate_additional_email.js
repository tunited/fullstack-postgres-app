import pool from './src/config/db.js';

async function migrate() {
  try {
    await pool.query('ALTER TABLE tickets ADD COLUMN IF NOT EXISTS additional_email VARCHAR(255);');
    console.log('Successfully added additional_email column to tickets table.');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

migrate();
