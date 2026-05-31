const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/AgentDashboard.jsx', 'utf8');

// Remove states
code = code.replace(/const \[configPositions, setConfigPositions\] = useState\(\[\]\);\n/, '');

// Remove fetches
code = code.replace(/      const posRes = await fetch\([\s\S]*?if \(posRes\.ok\) setConfigPositions\(posData\);\n/, '');

// Remove API handlers
code = code.replace(/  const handleAddPosition = async \(e\) => {[\s\S]*?  };\n\n/g, '');
code = code.replace(/  const handleUpdatePosition = async \(id, newName\) => {[\s\S]*?  };\n\n/g, '');
code = code.replace(/  const handleDeletePosition = async \(id, name\) => {[\s\S]*?  };\n\n/g, '');

// Remove button
code = code.replace(/                    <button\n                      onClick={\(\) => setConfigSubTab\('positions'\)}\n                      className={`btn \$\{configSubTab === 'positions' \? 'btn-primary' : 'btn-secondary'\}`}\n                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}\n                    >\n                      💼 ตำแหน่ง \(Positions\)\n                    <\/button>\n/, '');

// Remove tab content
code = code.replace(/                  \{configSubTab === 'positions' && \([\s\S]*?                  \)\}\n/g, '');

// Fix company/position format strings
code = code.replace(/\$\{ticket.customer_position \? \`, \$\{ticket.customer_position\}\` : ''\}/g, '');
code = code.replace(/\|\| '-'\}/g, "|| '-'}"); 
// Let's manually replace the table th
code = code.replace(/<th style=\{\{ padding: '1rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' \}\}>ตำแหน่ง \(Position\)<\/th>\n/, '');

fs.writeFileSync('frontend/src/pages/AgentDashboard.jsx', code);
