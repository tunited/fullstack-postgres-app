const fs = require('fs');

// AgentDashboard.jsx
let agentCode = fs.readFileSync('frontend/src/pages/AgentDashboard.jsx', 'utf8');

// 1. Remove states
agentCode = agentCode.replace(/const \[configCompanies, setConfigCompanies\] = useState\(\[\]\);\n/g, '');
agentCode = agentCode.replace(/const \[editingCompId, setEditingCompId\] = useState\(null\);\n/g, '');
agentCode = agentCode.replace(/const \[editingCompCustomerCode, setEditingCompCustomerCode\] = useState\(''\);\n/g, '');
agentCode = agentCode.replace(/const \[editingCompName, setEditingCompName\] = useState\(''\);\n/g, '');
agentCode = agentCode.replace(/const \[newCompCustomerCode, setNewCompCustomerCode\] = useState\(''\);\n/g, '');
agentCode = agentCode.replace(/const \[newCompName, setNewCompName\] = useState\(''\);\n/g, '');

// 2. Remove fetches
agentCode = agentCode.replace(/      const compRes = await fetch\(`\$\{API_URL\}\/tickets\/config\/companies`\);\n      if \(compRes\.ok\) \{\n        const compData = await compRes\.json\(\);\n        setConfigCompanies\(compData\);\n      \}\n/g, '');

// 3. Remove handlers
agentCode = agentCode.replace(/  const handleAddCompany = async \(e\) => \{[\s\S]*?  \};\n\n/g, '');
agentCode = agentCode.replace(/  const handleUpdateCompany = async \(id, newCustomerCode, newName\) => \{[\s\S]*?  \};\n\n/g, '');
agentCode = agentCode.replace(/  const handleDeleteCompany = async \(id, name\) => \{[\s\S]*?  \};\n\n/g, '');

// 4. Remove button
agentCode = agentCode.replace(/                    <button\n                      onClick=\{\(\) => setConfigSubTab\('companies'\)\}\n                      className=\{`btn \$\{configSubTab === 'companies' \? 'btn-primary' : 'btn-secondary'\}`\}\n                      style=\{\{ padding: '0\.5rem 1rem', borderRadius: '10px', fontSize: '0\.9rem', justifyContent: 'flex-start' \}\}\n                    >\n                      🏢 บริษัทลูกค้า \(Companies\)\n                    <\/button>\n/g, '');

// 5. Remove UI Tab content
// It starts at {configSubTab === 'companies' && ( and ends at )} that matches the tab. 
// I'll manually slice it.
const startComp = agentCode.indexOf(`{configSubTab === 'companies' && (`);
if (startComp !== -1) {
  const endComp = agentCode.indexOf(`{configSubTab === 'roles' && (`);
  if (endComp !== -1) {
    agentCode = agentCode.substring(0, startComp) + agentCode.substring(endComp);
  }
}

// 6. Fix user_company / customer_company / company references
agentCode = agentCode.replace(/ \|\| ticket\.user_company \|\| ticket\.customer_company /g, '');
agentCode = agentCode.replace(/ \|\| ticket\.customer_company /g, '');
agentCode = agentCode.replace(/\{ticket\.customer_company \? ` \(\$\{ticket\.customer_company\}\)` : ''\}/g, '');

// Members table - Company Column TH
agentCode = agentCode.replace(/<th style=\{\{ padding: '1rem 0\.75rem', textAlign: 'left', whiteSpace: 'nowrap' \}\}>บริษัท \(Company\)<\/th>\n/g, '');
// Members table - Company Select in edit mode
agentCode = agentCode.replace(/<td style=\{\{ padding: '1rem 0\.75rem', color: '#475569', fontWeight: member\.company \? 600 : 400, whiteSpace: 'nowrap' \}\}>\s*\{editingMemberId === member\.id \? \(\s*<div style=\{\{ flex: 1, minWidth: '150px' \}\}>\s*<label style=\{\{ display: 'block', fontSize: '0\.75rem', color: '#64748b', marginBottom: '0\.2rem' \}\}>บริษัท<\/label>\s*<select\s*className="glass-input"\s*value=\{editingMemberData\.company\}\s*onChange=\{\(e\) => setEditingMemberData\(\{\.\.\.editingMemberData, company: e\.target\.value\}\)\}\s*style=\{\{ margin: 0, appearance: 'auto' \}\}\s*>\s*<option value="">ไม่มี<\/option>\s*\{configCompanies\.map\(c => \(\s*<option key=\{c\.id\} value=\{c\.name\}>\{c\.name\} \(\{c\.company\}\)<\/option>\s*\)\)\}\s*<\/select>\s*<\/div>\s*\) : \(\s*member\.company \|\| '-'\s*\)\}\s*<\/td>\n/g, '');
// Members table - Company static cell if regex misses something
agentCode = agentCode.replace(/<td style=\{\{ padding: '1rem 0\.75rem', color: '#475569', fontWeight: member\.company \? 600 : 400, whiteSpace: 'nowrap' \}\}>[\s\S]*?<\/td>\n/g, '');
// company state in setEditingMemberData
agentCode = agentCode.replace(/company: member\.company \|\| '', /g, '');

// AdminDashboard.jsx
let adminCode = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');
adminCode = adminCode.replace(/ \|\| ticket\.user_company \|\| ticket\.customer_company /g, '');
adminCode = adminCode.replace(/ \|\| ticket\.customer_company /g, '');
adminCode = adminCode.replace(/ \(\{c\.company \|\| 'ไม่มีบริษัท'\}\)/g, '');
fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', adminCode);

// CustomerDashboard.jsx
let custCode = fs.readFileSync('frontend/src/pages/CustomerDashboard.jsx', 'utf8');
custCode = custCode.replace(/const matchedCustomer = custData\.find\(c => c\.cust_name === user\?\.company\);\n/, 'const matchedCustomer = custData.find(c => c.cust_name === user?.name);\n'); // just fallback to name or remove logic
fs.writeFileSync('frontend/src/pages/CustomerDashboard.jsx', custCode);

fs.writeFileSync('frontend/src/pages/AgentDashboard.jsx', agentCode);
console.log("Done scrubbing");
