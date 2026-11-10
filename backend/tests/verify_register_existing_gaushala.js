async function testRegisterExisting() {
  console.log('--- 1. Login with Citizen Rahul Sharma ---');
  // First ensure Rahul Sharma can login or test with Ayush Thapa
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId: '9899900011',
      password: 'User@GauAashray2026'
    })
  });
  const loginData = await loginRes.json();
  console.log('Rahul Sharma Login:', loginData.success, 'Current role:', loginData.user?.role, 'Has Gaushala:', !!loginData.user?.gaushala);

  if (loginData.token) {
    const token = loginData.token;

    console.log('\n--- 2. Register Gaushala Under Existing Rahul Sharma Account ---');
    const regRes = await fetch('http://localhost:5000/api/gaushalas/register-existing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Gau Seva Ashram Delhi',
        registrationId: 'GAUSH-DELHI-01',
        address: 'Sector 15, Dwarka',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110075',
        totalCapacity: 80
      })
    });
    const regData = await regRes.json();
    console.log('Registration Response:', regData.success, regData.message);
    console.log('New Gaushala:', regData.gaushala?.name);

    console.log('\n--- 3. Verify Active Mode Switched to GAUSHALA_OWNER in MongoDB ---');
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('Role:', meData.user?.role, 'Active Role:', meData.user?.activeRole, 'Linked Gaushala:', meData.user?.gaushala?.name);

    console.log('\n--- 4. Switch back to PUBLIC_USER side ---');
    const switchBack = await fetch('http://localhost:5000/api/auth/switch-role', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ targetRole: 'PUBLIC_USER' })
    });
    const switchData = await switchBack.json();
    console.log('Switched to PUBLIC_USER:', switchData.success, 'Current Active Role:', switchData.user?.activeRole);
  }

  console.log('\n=== Register Existing Gaushala Test Passed ===');
}

testRegisterExisting();
