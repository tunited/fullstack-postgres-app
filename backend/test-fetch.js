async function test() {
  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ppcc.co.th', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  const res = await fetch('http://localhost:5001/api/customers', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
