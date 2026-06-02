import pool from '../config/db.js';

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY cust_name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a customer
export const createCustomer = async (req, res) => {
  const { cust_num, cust_name, contact_email, version, license, account_owner, infor_ma, ppcc_app_ma, ppcc_cust_ma, ppcc_tech_ma } = req.body;
  if (!cust_num || !cust_name) {
    return res.status(400).json({ error: 'CustNum and CustName are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO customers (cust_num, cust_name, contact_email, version, license, account_owner, infor_ma, ppcc_app_ma, ppcc_cust_ma, ppcc_tech_ma) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [cust_num, cust_name, contact_email, version || '', license || '', account_owner || '', infor_ma || '', ppcc_app_ma || '', ppcc_cust_ma || '', ppcc_tech_ma || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'CustNum already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { cust_num, cust_name, contact_email, version, license, account_owner, infor_ma, ppcc_app_ma, ppcc_cust_ma, ppcc_tech_ma } = req.body;

  if (!cust_num || !cust_name) {
    return res.status(400).json({ error: 'CustNum and CustName are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE customers SET cust_num = $1, cust_name = $2, contact_email = $3, version = $4, license = $5, account_owner = $6, infor_ma = $7, ppcc_app_ma = $8, ppcc_cust_ma = $9, ppcc_tech_ma = $10 WHERE id = $11 RETURNING *',
      [cust_num, cust_name, contact_email, version || '', license || '', account_owner || '', infor_ma || '', ppcc_app_ma || '', ppcc_cust_ma || '', ppcc_tech_ma || '', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'CustNum already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
