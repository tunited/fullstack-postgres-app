import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const CustomerManagement = () => {
  const { API_URL, token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Add form state
  const [newCustNum, setNewCustNum] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  // Edit inline state
  const [editingId, setEditingId] = useState(null);
  const [editingCustNum, setEditingCustNum] = useState('');
  const [editingCustName, setEditingCustName] = useState('');
  const [editingContactEmail, setEditingContactEmail] = useState('');

  const totalItems = customers.length;
  const totalPages = Math.ceil(totalItems / limit);
  const indexOfLastItem = page * limit;
  const indexOfFirstItem = indexOfLastItem - limit;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cust_num: newCustNum, cust_name: newCustName, contact_email: newContactEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add customer');
      }

      await fetchCustomers();
      setNewCustNum('');
      setNewCustName('');
      setNewContactEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateCustomer = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cust_num: editingCustNum, cust_name: editingCustName, contact_email: editingContactEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      await fetchCustomers();
      setEditingId(null);
      setEditingCustNum('');
      setEditingCustName('');
      setEditingContactEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete customer');
      await fetchCustomers();
    } catch (err) {
      setError(err.message);
    }
  };



  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--accent-purple, #8b5cf6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '1rem', color: '#64748b' }}>กำลังโหลดข้อมูลลูกค้า...</p>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
        🤝 จัดการลูกค้า (Customers)
      </h3>
      
      {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={handleAddCustomer} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="glass-input"
          placeholder="รหัสลูกค้า(Customer Number)"
          value={newCustNum}
          onChange={(e) => setNewCustNum(e.target.value)}
          required
          style={{ margin: 0, flex: 1, minWidth: '150px' }}
        />
        <input
          type="text"
          className="glass-input"
          placeholder="ชื่อลูกค้า(Customer Name)"
          value={newCustName}
          onChange={(e) => setNewCustName(e.target.value)}
          required
          style={{ margin: 0, flex: 2, minWidth: '200px' }}
        />
        <input
          type="email"
          className="glass-input"
          placeholder="Contact Email"
          value={newContactEmail}
          onChange={(e) => setNewContactEmail(e.target.value)}
          style={{ margin: 0, flex: 2, minWidth: '200px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={!newCustNum.trim() || !newCustName.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
          ➕ เพิ่มลูกค้า
        </button>
      </form>

      {/* Pagination Controls Top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>แสดง</span>
          <select 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="glass-input"
            style={{ margin: 0, padding: '0.2rem 0.5rem', minWidth: '60px' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </select>
          <span>รายการ/หน้า</span>
        </div>
        <div style={{ color: '#64748b' }}>
          รวม {totalItems} รายการ (หน้า {page}/{totalPages || 1})
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
          <thead>
            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '20%' }}>Customer Number</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '40%' }}>Customer Name</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '20%' }}>Contact Email</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '20%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูลลูกค้า</td>
              </tr>
            ) : (
              currentCustomers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                    {editingId === c.id ? (
                      <input
                        type="text"
                        className="glass-input"
                        value={editingCustNum}
                        onChange={(e) => setEditingCustNum(e.target.value)}
                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                      />
                    ) : (
                      c.cust_num
                    )}
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    {editingId === c.id ? (
                      <input
                        type="text"
                        className="glass-input"
                        value={editingCustName}
                        onChange={(e) => setEditingCustName(e.target.value)}
                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                      />
                    ) : (
                      c.cust_name
                    )}
                  </td>
                  <td style={{ padding: '1rem 0.75rem', color: '#64748b' }}>
                    {editingId === c.id ? (
                      <input
                        type="email"
                        className="glass-input"
                        value={editingContactEmail}
                        onChange={(e) => setEditingContactEmail(e.target.value)}
                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                      />
                    ) : (
                      c.contact_email || '-'
                    )}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                    {editingId === c.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => handleUpdateCustomer(c.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                          💾 บันทึก
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                          setEditingId(null);
                          setEditingCustNum('');
                          setEditingCustName('');
                          setEditingContactEmail('');
                        }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                          ❌ ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingId(c.id);
                            setEditingCustNum(c.cust_num);
                            setEditingCustName(c.cust_name);
                            setEditingContactEmail(c.contact_email || '');
                          }}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(c.id)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Bottom */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{ padding: '0.5rem 1rem' }}
          >
            &laquo; ก่อนหน้า
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600 }}>
            {page} / {totalPages}
          </div>

          <button 
            className="btn btn-secondary" 
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            style={{ padding: '0.5rem 1rem' }}
          >
            ถัดไป &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
