async function test() {
  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ppcc.co.th', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  const createRes = await fetch('http://localhost:5001/api/tickets/config/roles', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TestRole', base_role: 'agent' })
  });
  const createData = await createRes.json();
  console.log('Create Role:', createData);
  const roleId = createData.id;

  const editRes = await fetch(`http://localhost:5001/api/tickets/config/roles/${roleId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TestRoleEdited', base_role: 'admin' })
  });
  console.log('Edit Role:', editRes.status, await editRes.text());

  const deleteRes = await fetch(`http://localhost:5001/api/tickets/config/roles/${roleId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Delete Role:', deleteRes.status);
}
test();
