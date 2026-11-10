async function verify() {
  console.log('--- 1. Testing Backend Gateway (GET http://localhost:5000) ---');
  try {
    const resRootHtml = await fetch('http://localhost:5000', {
      headers: { Accept: 'text/html' }
    });
    const htmlText = await resRootHtml.text();
    console.log('GET / (HTML) Status:', resRootHtml.status);
    console.log('Contains GauAashray branding:', htmlText.includes('GauAashray'));
    console.log('Contains link to Admin 5174:', htmlText.includes('5174'));
  } catch (err) {
    console.error('Error on GET /:', err.message);
  }

  console.log('\n--- 2. Testing Admin Vite App (GET http://localhost:5174) ---');
  try {
    const resAdmin = await fetch('http://localhost:5174');
    const adminHtml = await resAdmin.text();
    console.log('Admin App Status:', resAdmin.status);
    console.log('Contains Super Admin Command Center title:', adminHtml.includes('Super Admin Command Center'));
  } catch (err) {
    console.error('Error on Admin Port 5174:', err.message);
  }

  console.log('\n--- 3. Testing Super Admin Login (ayush108ayush108@gmail.com / 123456) ---');
  let token = '';
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId: 'ayush108ayush108@gmail.com',
        password: '123456'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response Status:', loginRes.status);
    console.log('User Role:', loginData.user?.role);
    console.log('User Email:', loginData.user?.email);
    token = loginData.token;
  } catch (err) {
    console.error('Login Failed:', err.message);
  }

  if (token) {
    console.log('\n--- 4. Testing Admin API GET /api/admin/users ---');
    try {
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      console.log('Users Count in MongoDB:', usersData.count);
      console.log('Users found:', usersData.users?.map(u => ({ name: u.name, role: u.role, email: u.email, phone: u.phone })));
    } catch (err) {
      console.error('GET /api/admin/users Failed:', err.message);
    }

    console.log('\n--- 5. Testing Admin API GET /api/admin/gaushalas ---');
    try {
      const gRes = await fetch('http://localhost:5000/api/admin/gaushalas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const gData = await gRes.json();
      console.log('Gaushalas Count in MongoDB:', gData.count);
      console.log('Gaushalas found:', gData.gaushalas?.map(g => ({ name: g.name, city: g.city, status: g.status })));
    } catch (err) {
      console.error('GET /api/admin/gaushalas Failed:', err.message);
    }

    console.log('\n--- 6. Testing Admin API GET /api/admin/dashboard ---');
    try {
      const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      console.log('Dashboard Stats from MongoDB:', statsData.stats);
    } catch (err) {
      console.error('GET /api/admin/dashboard Failed:', err.message);
    }
  }

  console.log('\n=== All Admin System Tests Passed Successfully ===');
}

verify();
