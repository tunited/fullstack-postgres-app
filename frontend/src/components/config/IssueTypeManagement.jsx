import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const IssueTypeManagement = () => {
  const { API_URL, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Add form state
  const [newName, setNewName] = useState('');

  // Edit inline state
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const indexOfLastItem = page * limit;
  const indexOfFirstItem = indexOfLastItem - limit;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets/config/issue-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch issue types');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_URL}/tickets/config/issue-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add issue type');
      }

      await fetchItems();
      setNewName('');
      setSuccess('เพิ่มประเภทปัญหาสำเร็จ');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_URL}/tickets/config/issue-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update issue type');
      }

      await fetchItems();
      setEditingId(null);
      setEditingName('');
      setSuccess('อัปเดตประเภทปัญหาสำเร็จ');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`คุณต้องการลบประเภทปัญหา "${name}" ใช่หรือไม่?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_URL}/tickets/config/issue-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete issue type');
      }
      await fetchItems();
      setSuccess('ลบประเภทปัญหาสำเร็จ');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="config-section">
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🐛 จัดการประเภทปัญหา (Issue Types)
      </h3>

      {error && <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}><span>{error}</span></div>}
      {success && <div className="alert-box alert-success" style={{ marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}><span>{success}</span></div>}

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="glass-input"
          placeholder="พิมพ์ชื่อประเภทปัญหาใหม่ เช่น Technical, BugCustomization"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>+ เพิ่ม</button>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.length === 0 ? (
          <p style={{ color: '#64748b' }}>ยังไม่มีข้อมูลประเภทปัญหาในระบบ</p>
        ) : (
          currentItems.map(item => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1rem', background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)', borderRadius: '8px'
            }}>
              {editingId === item.id ? (
                <input
                  type="text"
                  className="glass-input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  style={{ margin: 0, padding: '0.3rem 0.75rem', flexGrow: 1, marginRight: '1rem' }}
                  autoFocus
                />
              ) : (
                <span style={{ fontWeight: 500, color: '#334155' }}>{item.name}</span>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editingId === item.id ? (
                  <>
                    <button className="btn btn-primary" onClick={() => handleUpdate(item.id)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                      บันทึก
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={() => { setEditingId(item.id); setEditingName(item.name); }} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                      แก้ไข
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item.id, item.name)}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
                    >
                      ลบ
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls Bottom */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
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

export default IssueTypeManagement;
