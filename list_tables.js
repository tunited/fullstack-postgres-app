import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'apex_support_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';", (err, res) => {
  if (err) throw err;
  console.log(res.rows);
  pool.end();
});
