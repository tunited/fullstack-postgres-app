import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ModuleProgramManagement = ({ initialModuleFilter = '' }) => {
  const { API_URL, token } = useAuth();
  
  // Data state
  const [programs, setPrograms] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter state
  const [moduleFilter, setModuleFilter] = useState(initialModuleFilter);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [newModule, setNewModule] = useState(initialModuleFilter);
  const [newProgramGroup, setNewProgramGroup] = useState('');
  const [newNote, setNewNote] = useState('');

  // Edit inline state
  const [editingId, setEditingId] = useState(null);
  const [editingModule, setEditingModule] = useState('');
  const [editingProgramGroup, setEditingProgramGroup] = useState('');
  const [editingNote, setEditingNote] = useState('');

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit
      });
      if (moduleFilter) {
        queryParams.append('module', moduleFilter);
      }

      const response = await fetch(`${API_URL}/tickets/config/module-program-groups?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch module programs');
      
      const data = await response.json();
      setPrograms(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [page, limit, moduleFilter]);

  // When initial filter changes from outside (e.g., clicking on a module in another tab)
  useEffect(() => {
    setModuleFilter(initialModuleFilter);
    setNewModule(initialModuleFilter);
    setPage(1);
  }, [initialModuleFilter]);

  const handleAddProgram = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tickets/config/module-program-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ module: newModule, program_group: newProgramGroup, note: newNote })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add program');
      }

      await fetchPrograms();
      setNewProgramGroup('');
      setNewNote('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProgram = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/tickets/config/module-program-groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ module: editingModule, program_group: editingProgramGroup, note: editingNote })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update program');
      }

      await fetchPrograms();
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      const response = await fetch(`${API_URL}/tickets/config/module-program-groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete program');
      
      // If deleting the last item on a page, go to previous page
      if (programs.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchPrograms();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
          ⚙️ จัดการโปรแกรมย่อย (Module Programs)
        </h3>
        
        {/* Filter Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>กรองตาม Module:</span>
          <input
            type="text"
            className="glass-input"
            placeholder="ค้นหา Module..."
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
            style={{ margin: 0, padding: '0.3rem 0.6rem', width: '150px' }}
          />
        </div>
      </div>
      
      {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={handleAddProgram} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="glass-input"
          placeholder="Module Name"
          value={newModule}
          onChange={(e) => setNewModule(e.target.value)}
          required
          style={{ margin: 0, flex: 1, minWidth: '120px' }}
        />
        <input
          type="text"
          className="glass-input"
          placeholder="Program Group"
          value={newProgramGroup}
          onChange={(e) => setNewProgramGroup(e.target.value)}
          required
          style={{ margin: 0, flex: 2, minWidth: '200px' }}
        />
        <input
          type="text"
          className="glass-input"
          placeholder="Note (Optional)"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{ margin: 0, flex: 2, minWidth: '200px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={!newModule.trim() || !newProgramGroup.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
          ➕ เพิ่มโปรแกรม
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
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>รายการ/หน้า</span>
        </div>
        <div style={{ color: '#64748b' }}>
          รวม {total} รายการ (หน้า {page}/{totalPages})
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
          <thead>
            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '20%' }}>Module</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '35%' }}>Program Group</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '25%' }}>Note</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '20%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ไม่พบข้อมูลโปรแกรมย่อย</td>
              </tr>
            ) : (
              programs.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                    {editingId === p.id ? (
                      <input
                        type="text"
                        className="glass-input"
                        value={editingModule}
                        onChange={(e) => setEditingModule(e.target.value)}
                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                      />
                    ) : (
                      p.module
                    )}
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    {editingId === p.id ? (
                      <input
                        type="text"
                        className="glass-input"
                        value={editingProgramGroup}
                        onChange={(e) => setEditingProgramGroup(e.target.value)}
                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                      />
                    ) : (
                      p.program_group
                    )}
                  </td>
                  <td style={{ padding: '1rem 0.75rem', color: '#64748b' }}>
                    {editingId === p.id ? (
                      <input
                        type="text"
                        className="glass-input"
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                      />
                    ) : (
                      p.note || '-'
                    )}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                    {editingId === p.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => handleUpdateProgram(p.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                          💾 บันทึก
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                          ❌ ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingId(p.id);
                            setEditingModule(p.module);
                            setEditingProgramGroup(p.program_group);
                            setEditingNote(p.note || '');
                          }}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(p.id)}
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

export default ModuleProgramManagement;
