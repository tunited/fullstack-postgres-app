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

const customers = [
  { cust_num: 'ADI', cust_name: 'ADVANCE DIE CASTING CO., LTD.' },
  { cust_num: 'ART', cust_name: 'ART-SERINA PISTON CO., LTD.' },
  { cust_num: 'BISW', cust_name: 'THE BANGKOK IRON AND STEEL WORKS CO., LTD.' },
  { cust_num: 'CCH', cust_name: 'CHUE CHIN HUA CO., LTD.' },
  { cust_num: 'NST', cust_name: 'NEW SOMTHAI MOTOR WORK CO., LTD.' },
  { cust_num: 'NTH', cust_name: 'NICHICON (THAILAND) CO.,LTD.' },
  { cust_num: 'OTC', cust_name: 'OGIHARA (THAILAND) CO.,LTD.' },
  { cust_num: 'PK', cust_name: 'PATKOL PUBLIC CO., LTD.' },
  { cust_num: 'PK-TG', cust_name: 'TYGIENIC CO.,LTD.' },
  { cust_num: 'PK-HA', cust_name: 'HEATAWAY CO.,LTD.' },
  { cust_num: 'PK-PKM', cust_name: 'PATKOL MANUFACTURING CO.,LTD' },
  { cust_num: 'RXM', cust_name: 'R.X. MANUFACTURING CO., LTD.' },
  { cust_num: 'SNPR', cust_name: 'SIAM NPR CO., LTD.' },
  { cust_num: 'SRN', cust_name: 'SRN SOUND PROOF CO.,LTD' },
  { cust_num: 'SST', cust_name: 'SIAM SENATER CO., LTD.' },
  { cust_num: 'TAIYO', cust_name: 'TAIYO CABLETEC (THAILAND) CO.,LTD.' },
  { cust_num: 'TAK', cust_name: 'T.A.K.PACKAGING CO., LTD.' },
  { cust_num: 'TTSC', cust_name: 'THAI TAKAGI SEIKO CO.,LTD.' },
  { cust_num: 'TBFST', cust_name: 'TBFST' },
  { cust_num: 'CNI', cust_name: 'C.N.I ENGINEERING SUPPLY Co., Ltd.' },
  { cust_num: 'SSMC', cust_name: 'SSMC' },
  { cust_num: 'IIT', cust_name: 'IIT' },
  { cust_num: 'CIS', cust_name: 'CIS' }
];

async function seedCustomers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const cust of customers) {
      await client.query(
        `INSERT INTO customers (cust_num, cust_name) 
         VALUES ($1, $2) 
         ON CONFLICT (cust_num) 
         DO UPDATE SET cust_name = EXCLUDED.cust_name;`,
        [cust.cust_num, cust.cust_name]
      );
    }

    await client.query('COMMIT');
    console.log(`Successfully seeded ${customers.length} customers!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding customers:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedCustomers();
