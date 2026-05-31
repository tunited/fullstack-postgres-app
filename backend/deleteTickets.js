import pool from './src/config/db.js';

async function deleteAllTickets() {
  try {
    console.log('Connecting to database...');
    const result = await pool.query('DELETE FROM tickets');
    console.log(`Successfully deleted ${result.rowCount} tickets.`);
  } catch (error) {
    console.error('Error deleting tickets:', error);
  } finally {
    await pool.end();
  }
}

deleteAllTickets();
