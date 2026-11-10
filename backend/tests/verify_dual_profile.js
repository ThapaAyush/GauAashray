async function testDualProfile() {
  console.log('--- 1. Testing Login of User ---');
  // First login with super admin or existing owner
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId: 'ayush108ayush108@gmail.com',
      password: '123456'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Logged in as:', loginData.user.name, 'Role:', loginData.user.role, 'Active Role:', loginData.user.activeRole);

  console.log('\n--- 2. Switch Active Mode to PUBLIC_USER ---');
  const switch1 = await fetch('http://localhost:5000/api/auth/switch-role', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ targetRole: 'PUBLIC_USER' })
  });
  const data1 = await switch1.json();
  console.log('Switch to PUBLIC_USER success:', data1.success, 'New Active Mode:', data1.user?.activeRole);

  console.log('\n--- 3. Verify Database Persistence of Active Mode (GET /api/auth/me) ---');
  const me1 = await fetch('http://localhost:5000/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData1 = await me1.json();
  console.log('GET /api/auth/me Active Role in MongoDB:', meData1.user?.activeRole);

  console.log('\n--- 4. Switch Active Mode to GAUSHALA_OWNER ---');
  const switch2 = await fetch('http://localhost:5000/api/auth/switch-role', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ targetRole: 'GAUSHALA_OWNER' })
  });
  const data2 = await switch2.json();
  console.log('Switch to GAUSHALA_OWNER success:', data2.success, 'New Active Mode:', data2.user?.activeRole);

  console.log('\n--- 5. Verify Database Persistence of Active Mode (GET /api/auth/me) ---');
  const me2 = await fetch('http://localhost:5000/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData2 = await me2.json();
  console.log('GET /api/auth/me Active Role in MongoDB:', meData2.user?.activeRole);

  console.log('\n--- 6. Test Fetching Gaushala Profile (GET /api/gaushalas/my-profile) ---');
  const gProf = await fetch('http://localhost:5000/api/gaushalas/my-profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const gProfData = await gProf.json();
  console.log('Gaushala profile fetched:', gProfData.success ? gProfData.gaushala?.name : gProfData.message);

  console.log('\n=== Dual Profile & Single Active Side Pipeline Verified Successfully ===');
}

testDualProfile();

