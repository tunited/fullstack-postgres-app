const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Register.jsx', 'utf8');

// Remove position state
code = code.replace(/  const \[position, setPosition\] = useState\(''\);\n/, '');

// Remove setPosition('') calls
code = code.replace(/      setPosition\(''\);\n/g, '');

// Update register call
code = code.replace(/register\(name, email, password, role, company, position\)/, 'register(name, email, password, role, company)');

// Remove Position input field entirely
code = code.replace(/                        <div className=\"input-group\">\s*<label htmlFor=\"register-position\">ตำแหน่ง \(Position\)<\/label>\s*<select\s*id=\"register-position\"\s*className=\"glass-input\"\s*value=\{position\}\s*onChange=\{\(e\) => setPosition\(e\.target\.value\)\}\s*>\s*<option value=\"\">-- เลือกตำแหน่ง --<\/option>\s*\{configPositions\.map\(pos => \(\s*<option key=\{pos\.id\} value=\{pos\.name\}>\{pos\.name\}<\/option>\s*\)\)\}\s*<\/select>\s*<\/div>/g, '');

// Wait, the position input might be an <input> or <select>. Let's check `Register.jsx` using regex.
code = code.replace(/<div className=\"input-group\">\s*<label htmlFor=\"register-position\">ตำแหน่ง[\s\S]*?<\/select>\s*<\/div>/g, '');

// Let's also remove `configPositions` fetch if it's there
code = code.replace(/const \[configPositions, setConfigPositions\] = useState\(\[\]\);\n/g, '');
code = code.replace(/      const posRes = await fetch\(`\$\{API_URL\}\/tickets\/config\/positions`\);\n      if \(posRes\.ok\) \{\n        const posData = await posRes\.json\(\);\n        setConfigPositions\(posData\);\n      \}\n/g, '');

fs.writeFileSync('frontend/src/pages/Register.jsx', code);
