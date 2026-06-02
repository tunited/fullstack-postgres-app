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
  { cust_num: 'ADI', cust_name: 'ADVANCE DIE CASTING CO., LTD.', version: 'SL90110', license: '', account_owner: '', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: '', ppcc_tech_ma: '' },
  { cust_num: 'ART', cust_name: 'ART-SERINA PISTON CO., LTD.', version: 'SL70420', license: '', account_owner: 'PPCC', infor_ma: 'x', ppcc_app_ma: 'YES', ppcc_cust_ma: 'x', ppcc_tech_ma: 'YES' },
  { cust_num: 'BISW', cust_name: 'THE BANGKOK IRON AND STEEL WORKS CO., LTD.', version: 'SL10.0.0.421', license: '25CCL', account_owner: '', infor_ma: 'x', ppcc_app_ma: '', ppcc_cust_ma: '', ppcc_tech_ma: '' },
  { cust_num: 'CCH', cust_name: 'CHUE CHIN HUA CO., LTD.', version: 'SL80311', license: '80 CCL', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'NST', cust_name: 'NEW SOMTHAI MOTOR WORK CO., LTD.', version: 'SL70420', license: '50 CCL', account_owner: 'PPCC', infor_ma: 'x', ppcc_app_ma: 'x', ppcc_cust_ma: 'x', ppcc_tech_ma: 'x' },
  { cust_num: 'NTH', cust_name: 'NICHICON (THAILAND) CO.,LTD.', version: 'SL10 2024.09.01.5', license: '12 NU', account_owner: 'HISYS', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'x' },
  { cust_num: 'OTC', cust_name: 'OGIHARA (THAILAND) CO.,LTD.', version: 'SL80010', license: '40 CCL', account_owner: 'Infor Direct', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: 'x', ppcc_tech_ma: 'YES' },
  { cust_num: 'PK', cust_name: 'PATKOL PUBLIC CO., LTD.', version: 'SL90020', license: '680 NU', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'x', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'PK-TG', cust_name: 'TYGIENIC CO.,LTD.', version: 'SL90020', license: '680 NU', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'x', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'PK-HA', cust_name: 'HEATAWAY CO.,LTD.', version: 'SL90020', license: '680 NU', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'x', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'PK-PKM', cust_name: 'PATKOL MANUFACTURING CO.,LTD', version: 'SL90020', license: '680 NU', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'x', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'RXM', cust_name: 'R.X. MANUFACTURING CO., LTD.', version: 'SL70308', license: '52 CCL', account_owner: 'PPCC', infor_ma: 'NO', ppcc_app_ma: 'YES', ppcc_cust_ma: 'x', ppcc_tech_ma: 'x' },
  { cust_num: 'SNPR', cust_name: 'SIAM NPR CO., LTD.', version: 'SL80311', license: '21 CCL', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'SRN', cust_name: 'SRN SOUND PROOF CO.,LTD', version: 'SL90110', license: '15 CCL', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'x', ppcc_cust_ma: 'x', ppcc_tech_ma: 'x' },
  { cust_num: 'SST', cust_name: 'SIAM SENATER CO., LTD.', version: 'SL90030', license: '10 CCL', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'x', ppcc_cust_ma: 'x', ppcc_tech_ma: 'x' },
  { cust_num: 'TAIYO', cust_name: 'TAIYO CABLETEC (THAILAND) CO.,LTD.', version: 'SL80311', license: '', account_owner: 'HISYS', infor_ma: 'YES', ppcc_app_ma: 'x', ppcc_cust_ma: 'x', ppcc_tech_ma: 'x' },
  { cust_num: 'TAK', cust_name: 'T.A.K.PACKAGING CO., LTD.', version: 'SL80311', license: '69 NU', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'TTSC', cust_name: 'THAI TAKAGI SEIKO CO.,LTD.', version: 'SL80311', license: '', account_owner: 'HISYS', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'x' },
  { cust_num: 'TBFST', cust_name: 'TBFST', version: 'SL10 2023.03.1.7', license: '', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: '', ppcc_cust_ma: '', ppcc_tech_ma: '' },
  { cust_num: 'CNI', cust_name: 'C.N.I ENGINEERING SUPPLY Co., Ltd.', version: 'SL10 2022.03.1.8', license: '', account_owner: 'PPCC', infor_ma: 'YES', ppcc_app_ma: 'YES', ppcc_cust_ma: 'YES', ppcc_tech_ma: 'YES' },
  { cust_num: 'SSMC', cust_name: 'SSMC', version: '', license: '', account_owner: '', infor_ma: '', ppcc_app_ma: '', ppcc_cust_ma: 'x', ppcc_tech_ma: 'x' },
  { cust_num: 'IIT', cust_name: 'IIT', version: '', license: '', account_owner: '', infor_ma: '', ppcc_app_ma: '', ppcc_cust_ma: '', ppcc_tech_ma: '' },
  { cust_num: 'CIS', cust_name: 'CIS', version: '', license: '', account_owner: '', infor_ma: '', ppcc_app_ma: '', ppcc_cust_ma: '', ppcc_tech_ma: '' }
];

async function seedCustomers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const cust of customers) {
      await client.query(
        `INSERT INTO customers (cust_num, cust_name, version, license, account_owner, infor_ma, ppcc_app_ma, ppcc_cust_ma, ppcc_tech_ma) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (cust_num) 
         DO UPDATE SET 
            cust_name = EXCLUDED.cust_name,
            version = EXCLUDED.version,
            license = EXCLUDED.license,
            account_owner = EXCLUDED.account_owner,
            infor_ma = EXCLUDED.infor_ma,
            ppcc_app_ma = EXCLUDED.ppcc_app_ma,
            ppcc_cust_ma = EXCLUDED.ppcc_cust_ma,
            ppcc_tech_ma = EXCLUDED.ppcc_tech_ma;`,
        [
          cust.cust_num,
          cust.cust_name,
          cust.version || '',
          cust.license || '',
          cust.account_owner || '',
          cust.infor_ma || '',
          cust.ppcc_app_ma || '',
          cust.ppcc_cust_ma || '',
          cust.ppcc_tech_ma || ''
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Successfully seeded ${customers.length} customers with full details!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding customers:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedCustomers();
