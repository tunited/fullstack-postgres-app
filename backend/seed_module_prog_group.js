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

const data = [
  { module: 'AP', program_group: 'Petty Cash Payment', note: 'Petty Cash Payment' },
  { module: 'AP', program_group: 'Generate Bank File', note: 'Generate Bank File' },
  { module: 'AP', program_group: 'AP Voucher and Adjustments', note: 'AP Voucher and Adjustments' },
  { module: 'AP', program_group: 'AP Payment', note: 'AP Payment' },
  { module: 'SC', program_group: 'Service Contract', note: null },
  { module: 'AP', program_group: 'AP Posted Transactions Detail', note: 'AP Posted Transactions Detail' },
  { module: 'AR', program_group: 'Customer Order Invoice', note: 'Customer Order Invoice' },
  { module: 'AR', program_group: 'Delivery Order Invoice', note: 'Delivery Order Invoice' },
  { module: 'AR', program_group: 'Project Invoice', note: 'Project Invoice' },
  { module: 'AR', program_group: 'Service Order Invoice', note: 'Service Order Invoice' },
  { module: 'AR', program_group: 'Service Tax Invoice', note: 'Service Tax Invoice' },
  { module: 'AR', program_group: 'Service Contract Invoice', note: 'Service Contract Invoice' },
  { module: 'AR', program_group: 'RMA Invoice', note: 'RMA Invoice' },
  { module: 'AR', program_group: 'Price Adjustment Invoice', note: 'Price Adjustment Invoice' },
  { module: 'AR', program_group: 'Customer Rating', note: 'Customer Rating' },
  { module: 'AR', program_group: 'AR Billing', note: 'AR Billing' },
  { module: 'AR', program_group: 'AR Invoice Voucher Report', note: 'AR Invoice Voucher Report' },
  { module: 'AR', program_group: 'AR Payment', note: 'AR Payment' },
  { module: 'AR', program_group: 'AR Posted Transactions', note: 'AR Posted Transactions' },
  { module: 'GL', program_group: 'Journal Entrie', note: 'Journal Entrie' },
  { module: 'GL', program_group: 'Journal Recurring', note: 'Journal Recurring' },
  { module: 'GL', program_group: 'Journal Posting', note: 'Journal Posting' },
  { module: 'GL', program_group: 'GL Posted Transactions', note: 'GL Posted Transactions' },
  { module: 'GL', program_group: 'General Ledger By Account Report', note: 'General Ledger By Account Report' },
  { module: 'CST', program_group: 'Project Inquiry', note: 'Project Inquiry' },
  { module: 'CST', program_group: 'Project Costing', note: 'Project Costing' },
  { module: 'CST', program_group: 'FS Costing', note: 'FS Costing' },
  { module: 'CST', program_group: 'Project Revenue', note: 'Project Revenue' },
  { module: 'CST', program_group: 'Production Costing', note: 'Production Costing' },
  { module: 'CST', program_group: 'CO Costing', note: 'CO Costing' },
  { module: 'Update UC1', program_group: 'Update UC1', note: null },
  { module: 'System', program_group: 'System Error', note: null },
  { module: 'FNS', program_group: 'Cash Flow', note: 'Cash Flow' },
  { module: 'PJC', program_group: 'Project Labor', note: 'Project Labor' },
  { module: 'PO', program_group: 'Purchase Orders', note: 'Purchase Orders' },
  { module: 'PJC', program_group: 'Project Revenue Milestones Genration', note: 'Project Revenue Milestones Genration' },
  { module: 'PO', program_group: 'Goods Receiving Notes', note: 'Goods Receiving Notes' },
  { module: 'APM', program_group: 'ICash', note: 'ICash ICash Distribution' },
  { module: 'APM', program_group: 'ICash Transfer', note: 'ICash Transfer' },
  { module: 'APM', program_group: 'Generate Bank File', note: 'Generate Bank File' },
  { module: 'ISH', program_group: 'Easy Voucher', note: 'Easy Voucher' },
  { module: 'AP', program_group: 'Input Vat', note: 'Input Vat Report' },
  { module: 'AR', program_group: 'Output Vat', note: 'Output Vat Report' },
  { module: 'Automation', program_group: 'Job Material Transaction', note: 'Job Material Transaction' },
  { module: 'Automation', program_group: 'Transfer Order Ship', note: 'Transfer Order Ship' },
  { module: 'Automation', program_group: 'Quantity Move', note: 'Quantity Move' },
  { module: 'AR', program_group: 'Pre Invoice', note: 'Pre Invoice' },
  { module: 'Automation', program_group: '??????', note: '??????' },
  { module: 'Milk Run', program_group: 'Milk Run', note: 'Milk Run' },
  { module: 'SFC', program_group: 'Job Order', note: null },
  { module: 'EDI', program_group: 'EDI Load Forecast', note: 'EDI Load Forecast' },
  { module: 'Cycle', program_group: 'Cycle Count Posting', note: 'Cycle Count Posting' },
  { module: 'FA', program_group: 'Fixed Asset Generate Card', note: 'Fixed Asset Generate Card' },
  { module: 'FA', program_group: 'Fixed Asset Depreciation', note: 'Fixed Asset Depreciation' },
  { module: 'FA', program_group: 'Fixed Asset Disposal', note: 'Fixed Asset Disposal' },
  { module: 'FA', program_group: 'Fixed Assest Transfer', note: 'Fixed Assest Transfer' },
  { module: 'SRO', program_group: 'Service Orders', note: null },
  { module: 'APM', program_group: 'Cutoff', note: 'Cutoff Cutoff Report' },
  { module: 'Automation', program_group: 'Print Tag', note: 'Print Tag' },
  { module: 'Automation', program_group: 'Unposted Job Transaction', note: 'Unposted Job Transaction' },
  { module: 'AR', program_group: 'AR Receipt', note: 'AR Receipt' },
  { module: 'SFC', program_group: 'Print Tag', note: 'Print Tag' },
  { module: 'SFC', program_group: 'Process Slip', note: 'Process Slip' },
  { module: 'RMA', program_group: 'RMA Credit Memos', note: 'RMA Credit Memos' },
  { module: 'SH', program_group: 'Order Shipping', note: null },
  { module: 'SFC', program_group: 'Job Material Transactions', note: null },
  { module: 'Cycle', program_group: 'Cycle Count Variance Report', note: 'Cycle Count Variance Report' },
  { module: 'DO', program_group: 'Order Pick List', note: 'Order Pick List' },
  { module: 'PR', program_group: 'Purchase Order Requisitions', note: 'Purchase Order Requisitions' },
  { module: 'Technical', program_group: 'Report', note: null },
  { module: 'AP', program_group: 'Budget Code', note: 'Budget Code' },
  { module: 'BG', program_group: 'Budget Control', note: 'Budget Control' },
  { module: 'RMA', program_group: 'RMA', note: 'RMA' },
  { module: 'RMA', program_group: 'RMA Return Transactions', note: 'RMA Return Transactions' },
  { module: 'PO', program_group: 'Purchase Order Report', note: 'Purchase Order Report' },
  { module: 'PO', program_group: 'Purchase Po Dist Report', note: 'Purchase Po Dist Report' },
  { module: 'IC', program_group: 'Spare Part Return Slip', note: 'Spare Part Return Slip' },
  { module: 'AR', program_group: 'Account Receivable Aging Report', note: 'Account Receivable Aging Report' },
  { module: 'IC', program_group: 'Miscellaneous Receipt', note: 'Miscellaneous Receipt' },
  { module: 'GL', program_group: 'Excel Add-In', note: 'Excel Add-In' },
  { module: 'BC', program_group: 'Barcode-PO', note: '?????? SRN' },
  { module: 'BC', program_group: 'Barcode-CO', note: '?????? SRN' },
  { module: 'BC', program_group: 'Barcode-JOB', note: '?????? SRN' },
  { module: 'BC', program_group: 'Barcode-Master', note: '?????? SRN' },
  { module: 'BC', program_group: 'Barcode-IC', note: '?????? SRN' },
  { module: 'GL', program_group: 'Budget Control', note: 'Budget Control' },
  { module: 'MIA', program_group: 'MIA', note: 'MIA' },
  { module: 'SFC', program_group: 'Job Transactions', note: null },
  { module: 'Oth', program_group: 'PDS', note: 'PDS' },
  { module: 'IC', program_group: 'Weight Interface Incoming', note: 'BISW' },
  { module: 'SFC', program_group: 'Weight Interface Production', note: 'BISW' },
  { module: 'DO', program_group: 'Delivery Order Lines', note: 'Delivery Order Lines' },
  { module: 'SH', program_group: 'Picking List', note: null },
  { module: 'MB', program_group: 'Mobile', note: 'Mobile' },
  { module: 'CU', program_group: 'Customers', note: 'Customers' },
  { module: 'SFC', program_group: 'Unposted Job Transactions', note: 'Unposted Job Transactions' },
  { module: 'TO', program_group: 'Transfer Order Line', note: null },
  { module: 'PJC', program_group: 'Project Generate Order Pick List', note: 'Project Generate Order Pick List' },
  { module: 'CO', program_group: 'Invoicing Report', note: 'Invoicing Report' },
  { module: 'CUR', program_group: 'Customer Rating', note: 'Customer Rating' },
  { module: 'FA', program_group: 'Fixed Assets', note: 'Fixed Assets' },
  { module: 'PJC', program_group: 'Project Invoice Milestone', note: 'Project Invoice Milestone' },
  { module: 'CO', program_group: 'Progressive Billings', note: 'Progressive Billings' },
  { module: 'GL', program_group: 'Journal Voucher Report', note: 'Journal Voucher Report' },
  { module: 'CO', program_group: 'Price Adjustments Invoice Report', note: 'Price Adjustments Invoice Report' },
  { module: 'FA', program_group: 'Fixed Asset Depreciation Posted Report', note: 'Fixed Asset Depreciation Posted Report' },
  { module: 'AP', program_group: 'AP Payment Distributions', note: 'AP Payment Distributions' },
  { module: 'CO', program_group: 'Customer Orders', note: 'Customer Orders' },
  { module: 'CO', program_group: 'Order Shipping', note: 'Order Shipping' },
  { module: 'Automation', program_group: 'Scan Order PickList', note: null },
  { module: 'RMA', program_group: 'RMA Lines Item', note: 'RMA Lines Item' },
  { module: 'TO', program_group: 'Transfer Order', note: null },
  { module: 'AM', program_group: 'Web Service', note: 'Web Service' },
  { module: 'MAS', program_group: 'Chart of Accounts', note: 'Chart of Accounts' },
  { module: 'Oth', program_group: 'Material Planner Workbench', note: 'Material Planner Workbench' },
  { module: 'AP', program_group: 'Voucher Adjustment Distribution', note: 'Voucher Adjustment Distribution' },
  { module: 'DO', program_group: 'Delivery Order Line Sequences', note: 'Delivery Order Line Sequences' },
  { module: 'PO', program_group: 'API Vendor Contract Price All', note: 'API Vendor Contract Price All' },
  { module: 'IC', program_group: 'Part Delivery Sheet Report', note: 'Part Delivery Sheet Report' },
  { module: 'PO', program_group: 'API Vendor', note: 'API Vendor' },
  { module: 'PO', program_group: 'API Create PO/PO Line', note: 'API Create PO/PO Line' },
  { module: 'IC', program_group: 'API PDS', note: 'API PDS' },
  { module: 'IC', program_group: 'API WC Matl Issue', note: 'API WC Matl Issue' },
  { module: 'IC', program_group: 'Web Service (JSON)', note: 'Web Service (JSON)' },
  { module: 'DO', program_group: 'Consolidated Invoicing', note: 'Consolidated Invoicing' },
  { module: 'AP', program_group: 'Petty Cash Payment Distribution', note: 'Petty Cash Payment Distribution' },
  { module: 'AP', program_group: 'AP Voucher Posting', note: 'AP Voucher Posting' },
  { module: 'AR', program_group: 'AR Payment Posting', note: 'AR Payment Posting' },
  { module: 'FA', program_group: 'Fixed Asset Costs', note: 'Fixed Asset Costs' },
  { module: 'FA', program_group: 'Fixed Asset Acquisition Report', note: 'Fixed Asset Acquisition Report' },
  { module: 'FA', program_group: 'Fixed Asset Monitoring GL Report', note: 'Fixed Asset Monitoring GL Report' },
  { module: 'PO', program_group: 'Generate AP Transactions', note: 'Generate AP Transactions' },
  { module: 'PO', program_group: 'Purchase Order Receiving', note: 'Purchase Order Receiving' },
  { module: 'PJC', program_group: 'Project Report', note: 'Project Report' },
  { module: 'SC', program_group: 'Service Contract To Be Invoiced Report', note: null },
  { module: 'DO', program_group: 'Consolidate Invoice Generations', note: null },
  { module: 'SFC', program_group: 'Job Material', note: null },
  { module: 'PJC', program_group: 'Print Post Project Reveune Milestone', note: null },
  { module: 'IC', program_group: 'Lots', note: 'Lots' },
  { module: 'PJC', program_group: 'Confirm Qty Pick History', note: null },
  { module: 'PJC', program_group: 'Project Inquiry', note: 'Project Inquiry' },
  { module: 'AP', program_group: 'Voucher Payable Report', note: 'Voucher Payable Report' },
  { module: 'PJC', program_group: 'Projects', note: null },
  { module: 'AR', program_group: 'Invoice Transaction Report', note: 'Invoice Transaction Report' },
  { module: 'PJC', program_group: 'Revenue Milestones', note: 'Revenue Milestones' },
  { module: 'AR', program_group: 'Progressive Invoice', note: null },
  { module: 'GL', program_group: 'Mass Journal Posting', note: 'Mass Journal Posting' },
  { module: 'GL', program_group: 'Ledger Posting for Journal', note: 'Ledger Posting for Journal' },
  { module: 'Oth', program_group: 'Yusen', note: 'Yusen' },
  { module: 'CU', program_group: 'Vendor Customer Contract Prices', note: 'Vendor Customer Contract Prices' }
];

async function seedData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS module_program_group (
        id SERIAL PRIMARY KEY,
        module VARCHAR(100),
        program_group VARCHAR(255),
        note VARCHAR(255)
      );
    `);

    // Truncate existing data to prevent duplicates on rerun
    await client.query('TRUNCATE TABLE module_program_group RESTART IDENTITY;');

    for (const item of data) {
      await client.query(
        `INSERT INTO module_program_group (module, program_group, note) VALUES ($1, $2, $3)`,
        [item.module, item.program_group, item.note]
      );
    }

    await client.query('COMMIT');
    console.log(`Successfully seeded ${data.length} records into module_program_group table!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedData();
