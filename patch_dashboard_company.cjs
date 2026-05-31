const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'frontend/src/pages/AgentDashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

// Add new state variables for customer code
content = content.replace(
  "const [newCompName, setNewCompName] = useState('');",
  "const [newCompName, setNewCompName] = useState('');\n  const [newCompCustomerCode, setNewCompCustomerCode] = useState('');"
);
content = content.replace(
  "const [editingCompName, setEditingCompName] = useState('');",
  "const [editingCompName, setEditingCompName] = useState('');\n  const [editingCompCustomerCode, setEditingCompCustomerCode] = useState('');"
);

// Update handleAddCompany
const handleAddCompanyOld = `  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(\`\${API_URL}/tickets/config/companies\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ name: newCompName.trim() })
      });`;

const handleAddCompanyNew = `  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompName.trim() || !newCompCustomerCode.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(\`\${API_URL}/tickets/config/companies\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ customer_code: newCompCustomerCode.trim(), name: newCompName.trim() })
      });`;

content = content.replace(handleAddCompanyOld, handleAddCompanyNew);

content = content.replace(
  "setNewCompName('');",
  "setNewCompName('');\n      setNewCompCustomerCode('');"
);

// Update handleUpdateCompany
const handleUpdateCompanyOld = `  const handleUpdateCompany = async (id, newName) => {
    if (!newName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(\`\${API_URL}/tickets/config/companies/\${id}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ name: newName.trim() })
      });`;

const handleUpdateCompanyNew = `  const handleUpdateCompany = async (id, newCustomerCode, newName) => {
    if (!newName.trim() || !newCustomerCode.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(\`\${API_URL}/tickets/config/companies/\${id}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ customer_code: newCustomerCode.trim(), name: newName.trim() })
      });`;

content = content.replace(handleUpdateCompanyOld, handleUpdateCompanyNew);

// UI Update
const uiOld = `                      <form onSubmit={handleAddCompany} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="ชื่อบริษัท"
                          value={newCompName}
                          onChange={(e) => setNewCompName(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={configLoading || !newCompName.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
                          ➕ เพิ่มบริษัท
                        </button>
                      </form>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>ชื่อบริษัท (Company Name)</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '200px' }}>การจัดการ (Action)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {configCompanies.length === 0 ? (
                              <tr>
                                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูลบริษัท</td>
                              </tr>
                            ) : (
                              configCompanies.map(comp => (
                                <tr key={comp.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                                    {editingCompId === comp.id ? (
                                      <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleUpdateCompany(comp.id, editingCompName);
                                      }} style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                          type="text"
                                          className="glass-input"
                                          value={editingCompName}
                                          onChange={(e) => setEditingCompName(e.target.value)}
                                          autoFocus
                                          style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem' }}
                                        />
                                        <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>💾</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                          setEditingCompId(null);
                                          setEditingCompName('');
                                        }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>❌</button>
                                      </form>
                                    ) : (
                                      comp.name
                                    )}
                                  </td>`;

const uiNew = `                      <form onSubmit={handleAddCompany} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="รหัสลูกค้า (Customer Code)"
                          value={newCompCustomerCode}
                          onChange={(e) => setNewCompCustomerCode(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 1, minWidth: '200px' }}
                        />
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="ชื่อบริษัท (Company Name)"
                          value={newCompName}
                          onChange={(e) => setNewCompName(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 2, minWidth: '250px' }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={configLoading || !newCompName.trim() || !newCompCustomerCode.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
                          ➕ เพิ่มข้อมูล
                        </button>
                      </form>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '30%' }}>รหัสลูกค้า (Customer Code)</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '50%' }}>ชื่อบริษัท (Company Name)</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '20%' }}>การจัดการ (Action)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {configCompanies.length === 0 ? (
                              <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูลบริษัท</td>
                              </tr>
                            ) : (
                              configCompanies.map(comp => (
                                <tr key={comp.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                                    {editingCompId === comp.id ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingCompCustomerCode}
                                        onChange={(e) => setEditingCompCustomerCode(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      comp.customer_code
                                    )}
                                  </td>

                                  <td style={{ padding: '1rem 0.75rem' }}>
                                    {editingCompId === comp.id ? (
                                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                          type="text"
                                          className="glass-input"
                                          value={editingCompName}
                                          onChange={(e) => setEditingCompName(e.target.value)}
                                          autoFocus
                                          style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', flex: 1 }}
                                        />
                                        <button type="button" className="btn btn-primary" onClick={(e) => {
                                          e.preventDefault();
                                          handleUpdateCompany(comp.id, editingCompCustomerCode, editingCompName);
                                        }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>💾</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                          setEditingCompId(null);
                                          setEditingCompName('');
                                          setEditingCompCustomerCode('');
                                        }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>❌</button>
                                      </div>
                                    ) : (
                                      comp.name
                                    )}
                                  </td>`;

content = content.replace(uiOld, uiNew);

// Fix onClick editing properties to include Customer Code
const editBtnOld = `                                        onClick={() => {
                                          setEditingCompId(comp.id);
                                          setEditingCompName(comp.name);
                                        }}`;
const editBtnNew = `                                        onClick={() => {
                                          setEditingCompId(comp.id);
                                          setEditingCompName(comp.name);
                                          setEditingCompCustomerCode(comp.customer_code);
                                        }}`;
content = content.replace(editBtnOld, editBtnNew);


fs.writeFileSync(file, content, 'utf8');
console.log('Patch complete.');
