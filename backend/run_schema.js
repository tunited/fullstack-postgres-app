import fs from 'fs';
import path from 'path';
import pool from './src/config/db.js';

const schemaPath = path.join(process.cwd(), 'src/config/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

pool.query(schema)
  .then(() => {
    console.log('Schema executed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error executing schema:', err);
    process.exit(1);
  });
