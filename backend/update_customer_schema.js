import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'tunited',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'apex_support_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5433,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding new columns to customers table...');
    await client.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS version VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS license VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS account_owner VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS infor_ma VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS ppcc_app_ma VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS ppcc_cust_ma VARCHAR(100);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS ppcc_tech_ma VARCHAR(100);
    `);
    console.log('Successfully altered customers table schema!');
  } catch (error) {
    console.error('Error migrating database schema:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
