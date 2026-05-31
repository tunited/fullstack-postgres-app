import pool from './src/config/db.js';

async function migrate() {
  try {
    console.log('Dropping companies table...');
    await pool.query('DROP TABLE IF EXISTS companies CASCADE;');

    console.log('Creating companies table...');
    await pool.query(`
      CREATE TABLE companies (
        id SERIAL PRIMARY KEY,
        customer_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL
      );
    `);

    console.log('Seeding companies...');
    await pool.query(`
      INSERT INTO companies (customer_code, name) VALUES 
      ('PPCC', 'PPCC Co., Ltd.'), 
      ('SRN', 'SRN')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Migration successful.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
