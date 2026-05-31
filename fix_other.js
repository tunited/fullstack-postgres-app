const fs = require('fs');

// AuthContext.jsx
let auth = fs.readFileSync('frontend/src/context/AuthContext.jsx', 'utf8');
auth = auth.replace(/register = async \(name, email, password, role, company, position\)/, 'register = async (name, email, password, role, company)');
auth = auth.replace(/JSON.stringify\(\{ name, email, password, role, company, position \}\)/, 'JSON.stringify({ name, email, password, role, company })');
auth = auth.replace(/updateProfile = async \(name, company, position\)/, 'updateProfile = async (name, company)');
auth = auth.replace(/JSON.stringify\(\{ name, company, position \}\)/, 'JSON.stringify({ name, company })');
fs.writeFileSync('frontend/src/context/AuthContext.jsx', auth);

// TicketDetail.jsx
let detail = fs.readFileSync('frontend/src/pages/TicketDetail.jsx', 'utf8');
// {ticket.customer_position && (<div ...>...{ticket.customer_position}</div>)}
detail = detail.replace(/              \{ticket\.customer_position && \([\s\S]*?              \)\}\n/, '');
fs.writeFileSync('frontend/src/pages/TicketDetail.jsx', detail);

