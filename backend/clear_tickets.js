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

async function clearTickets() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Clearing all tickets, messages, and attachments...');
    
    // Truncate tickets and cascade to messages and attachments, and RESTART IDENTITY to reset the ID sequence
    await client.query('TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;');
    
    await client.query('COMMIT');
    console.log('All tickets have been successfully deleted.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error clearing tickets:', error);
  } finally {
    client.release();
    pool.end();
  }
}

clearTickets();
