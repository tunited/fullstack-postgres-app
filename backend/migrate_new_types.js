import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'apex_support_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Starting migration for program_types and issue_types...');

    // Create program_types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS program_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);
    console.log('program_types table created.');

    // Seed program_types
    await client.query(`
      INSERT INTO program_types (name) VALUES 
      ('Standard'), 
      ('Customized') 
      ON CONFLICT DO NOTHING;
    `);
    console.log('program_types seeded.');

    // Create issue_types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issue_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);
    console.log('issue_types table created.');

    // Seed issue_types
    await client.query(`
      INSERT INTO issue_types (name) VALUES 
      ('Technical'), 
      ('BugCustomization'),
      ('BugStandard'),
      ('Knowledge')
      ON CONFLICT DO NOTHING;
    `);
    console.log('issue_types seeded.');

    // Add columns to tickets table
    await client.query(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS program_type VARCHAR(100) DEFAULT 'Standard',
      ADD COLUMN IF NOT EXISTS issue_type VARCHAR(100) DEFAULT 'Technical';
    `);
    console.log('Added program_type and issue_type columns to tickets table.');

    await client.query('COMMIT');
    console.log('Migration successful!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
