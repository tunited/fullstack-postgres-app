const fs = require('fs');

// 1. App.jsx
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');
app = app.replace(/  const \[company, setCompany\] = useState\(user\?\.company \|\| ''\);\n/, '');
app = app.replace(/      setCompany\(user\.company \|\| ''\);\n/, '');
app = app.replace(/<div className="input-group" style={{ flex: 1 }}>\s*<label htmlFor="profile-company">ชื่อบริษัท \(Company Name\)<\/label>\s*<input\s*id="profile-company"\s*type="text"\s*className="glass-input"\s*value=\{user\.company \|\| ''\}\s*disabled\s*style=\{\{ opacity: 0\.7, cursor: 'not-allowed', backgroundColor: 'rgba\(255, 255, 255, 0\.1\)' \}\}\s*\/>\s*<\/div>/g, '');
fs.writeFileSync('frontend/src/App.jsx', app);

// 2. Register.jsx
let reg = fs.readFileSync('frontend/src/pages/Register.jsx', 'utf8');
reg = reg.replace(/  const \[company, setCompany\] = useState\(''\);\n/, '');
reg = reg.replace(/      setCompany\(''\);\n/g, '');
reg = reg.replace(/company/g, ''); // Wait! This is dangerous! "Company" is in placeholders. Let's do carefully.
