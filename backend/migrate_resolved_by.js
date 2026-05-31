import pool from './src/config/db.js';

async function migrate() {
  try {
    console.log('Adding resolved_by column to tickets table...');
    await pool.query(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('Migration successful.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
