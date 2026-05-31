import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'frontend/src/pages/AgentDashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variables for configErrorTypes
content = content.replace(
  'const [configCompanies, setConfigCompanies] = useState([]);',
  `const [configCompanies, setConfigCompanies] = useState([]);
  const [configErrorTypes, setConfigErrorTypes] = useState([]);
  const [newErrId, setNewErrId] = useState('');
  const [newErrDesc, setNewErrDesc] = useState('');
  const [newErrRemark, setNewErrRemark] = useState('');
  const [editingErrId, setEditingErrId] = useState(null);
  const [editingErrDesc, setEditingErrDesc] = useState('');
  const [editingErrRemark, setEditingErrRemark] = useState('');`
);

// 2. Fetch config/error-types in fetchConfigData
content = content.replace(
  `const compData = await compRes.json();
      if (compRes.ok) setConfigCompanies(compData);`,
  `const compData = await compRes.json();
      if (compRes.ok) setConfigCompanies(compData);

      const errRes = await fetch(\`\${API_URL}/tickets/config/error-types\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      const errData = await errRes.json();
      if (errRes.ok) setConfigErrorTypes(errData);`
);

// 3. Add handlers for Error Types before handleAddCategory
const handlers = `
  const handleAddErrorType = async (e) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);
    try {
      const response = await fetch(\`\${API_URL}/tickets/config/error-types\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ error_id: newErrId, description: newErrDesc, remark: newErrRemark })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add error type');
      
      setConfigSuccess(\`เพิ่มประเภทข้อผิดพลาด "\${newErrId}" สำเร็จ\`);
      setNewErrId('');
      setNewErrDesc('');
      setNewErrRemark('');
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleUpdateErrorType = async (id) => {
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);
    try {
      const response = await fetch(\`\${API_URL}/tickets/config/error-types/\${id}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ description: editingErrDesc, remark: editingErrRemark })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update error type');
      
      setConfigSuccess(\`อัปเดตประเภทข้อผิดพลาด สำเร็จ\`);
      setEditingErrId(null);
      setEditingErrDesc('');
      setEditingErrRemark('');
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDeleteErrorType = async (id) => {
    if (!window.confirm(\`คุณแน่ใจหรือไม่ที่จะลบประเภทข้อผิดพลาด "\${id}"?\`)) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);
    try {
      const response = await fetch(\`\${API_URL}/tickets/config/error-types/\${id}\`, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${token}\`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete error type');
      
      setConfigSuccess(\`ลบประเภทข้อผิดพลาด "\${id}" สำเร็จ\`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

`;

content = content.replace(
  '  const handleAddCategory = async (e) => {',
  handlers + '  const handleAddCategory = async (e) => {'
);

// 4. Add Navigation Tab Button
const tabButton = `
                    <button
                      className={\`btn \${configSubTab === 'roles' ? 'btn-primary' : 'btn-secondary'}\`}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.95rem' }}
                      onClick={() => setConfigSubTab('roles')}
                    >
                      🛡️ สิทธิ์การใช้งาน
                    </button>
                    <button
                      className={\`btn \${configSubTab === 'errortypes' ? 'btn-primary' : 'btn-secondary'}\`}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.95rem' }}
                      onClick={() => setConfigSubTab('errortypes')}
                    >
                      ⚠️ ประเภทข้อผิดพลาด
                    </button>`;
content = content.replace(
  /<button\s+className={`btn \${configSubTab === 'roles' \? 'btn-primary' : 'btn-secondary'}`}\s+style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.95rem' }}\s+onClick={\(\) => setConfigSubTab\('roles'\)}\s+>\s+🛡️ สิทธิ์การใช้งาน\s+<\/button>/g,
  tabButton
);

// 5. Add UI Section for Error Types
const errorTypesUI = `
                  {configSubTab === 'errortypes' && (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        ⚠️ จัดการประเภทข้อผิดพลาด (Error Types)
                      </h3>

                      <form onSubmit={handleAddErrorType} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="Error ID (เช่น C, H, PC)"
                          value={newErrId}
                          onChange={(e) => setNewErrId(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 1, minWidth: '150px' }}
                        />
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="รายละเอียด (Description)"
                          value={newErrDesc}
                          onChange={(e) => setNewErrDesc(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 2, minWidth: '250px' }}
                        />
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="หมายเหตุ (Remark)"
                          value={newErrRemark}
                          onChange={(e) => setNewErrRemark(e.target.value)}
                          disabled={configLoading}
                          style={{ margin: 0, flex: 2, minWidth: '200px' }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={configLoading || !newErrId.trim() || !newErrDesc.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
                          ➕ เพิ่มข้อมูล
                        </button>
                      </form>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '15%' }}>Error ID</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '35%' }}>รายละเอียด</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '35%' }}>หมายเหตุ</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '15%' }}>การจัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {configErrorTypes.length === 0 ? (
                              <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูล</td>
                              </tr>
                            ) : (
                              configErrorTypes.map(err => (
                                <tr key={err.error_id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{err.error_id}</td>
                                  
                                  <td style={{ padding: '1rem 0.75rem' }}>
                                    {editingErrId === err.error_id ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingErrDesc}
                                        onChange={(e) => setEditingErrDesc(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      err.description
                                    )}
                                  </td>
                                  
                                  <td style={{ padding: '1rem 0.75rem' }}>
                                    {editingErrId === err.error_id ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingErrRemark}
                                        onChange={(e) => setEditingErrRemark(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      err.remark || '-'
                                    )}
                                  </td>

                                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                    {editingErrId === err.error_id ? (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button type="button" className="btn btn-primary" onClick={() => handleUpdateErrorType(err.error_id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>💾</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                          setEditingErrId(null);
                                          setEditingErrDesc('');
                                          setEditingErrRemark('');
                                        }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>❌</button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                          onClick={() => {
                                            setEditingErrId(err.error_id);
                                            setEditingErrDesc(err.description);
                                            setEditingErrRemark(err.remark || '');
                                          }}
                                          disabled={configLoading}
                                        >
                                          ✏️ แก้ไข
                                        </button>
                                        <button
                                          className="btn btn-danger"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                          onClick={() => handleDeleteErrorType(err.error_id)}
                                          disabled={configLoading}
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
                    </div>
                  )}
                  {configSubTab === 'categories'`;
content = content.replace(
  "{configSubTab === 'categories'",
  errorTypesUI
);

fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard patched!');
