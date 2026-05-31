const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/ticketController.js', 'utf8');

// Remove user_company and customer_company from queries
code = code.replace(/c\.company as user_company,/g, '');
code = code.replace(/c\.company as customer_company,/g, '');

// Remove the companies CRUD controllers block
// Let's find the start and end of it. It starts at `// 11. Dynamic Companies CRUD Controllers` 
// and ends right before `// 12. Dynamic Positions CRUD Controllers` or `// 13. Dynamic Roles CRUD Controllers`
const startIdx = code.indexOf('// 11. Dynamic Companies CRUD Controllers');
const endIdx = code.indexOf('// 13. Dynamic Roles CRUD Controllers');

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + code.substring(endIdx);
}

fs.writeFileSync('backend/src/controllers/ticketController.js', code);
