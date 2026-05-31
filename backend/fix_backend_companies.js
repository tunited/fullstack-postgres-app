const fs = require('fs');

// 1. authRoutes.js
let authRoutes = fs.readFileSync('src/routes/authRoutes.js', 'utf8');
authRoutes = authRoutes.replace(/import \{ getCompanies \} from '\.\.\/controllers\/ticketController\.js';\n/, '');
authRoutes = authRoutes.replace(/router\.get\('\/companies', getCompanies\);\n/, '');
fs.writeFileSync('src/routes/authRoutes.js', authRoutes);

// 2. ticketRoutes.js
let ticketRoutes = fs.readFileSync('src/routes/ticketRoutes.js', 'utf8');
ticketRoutes = ticketRoutes.replace(/  getCompanies,\n  createCompany,\n  updateCompany,\n  deleteCompany,\n/, '');
ticketRoutes = ticketRoutes.replace(/\/\/ 5\. Config Routes \(Companies\)\nrouter\.get\('\/config\/companies', getCompanies\);\nrouter\.post\('\/config\/companies', requireAgent, createCompany\);\nrouter\.put\('\/config\/companies\/:id', requireAgent, updateCompany\);\nrouter\.delete\('\/config\/companies\/:id', requireAgent, deleteCompany\);\n/, '');
fs.writeFileSync('src/routes/ticketRoutes.js', ticketRoutes);

// 3. authController.js
let authCtrl = fs.readFileSync('src/controllers/authController.js', 'utf8');
authCtrl = authCtrl.replace(/const \{ name, email, password, role, company \} = req\.body;/, 'const { name, email, password, role } = req.body;');
authCtrl = authCtrl.replace(/company \|\| null \|\| null/g, 'null'); // wait, let's just adjust the sql completely
// It's easier to replace specific chunks in authController
// Let's use multi_replace for authController.js and others to be safe.
