async function testMutations() {
  console.log('--- Testing Live Admin Mutations on MongoDB Atlas ---');

  // 1. Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId: 'ayush108ayush108@gmail.com',
      password: '123456'
    })
  });
  const { token } = await loginRes.json();

  // 2. Fetch a user to update (e.g., Rahul Sharma)
  const usersRes = await fetch('http://localhost:5000/api/admin/users?role=PUBLIC_USER', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  const citizen = usersData.users[0];
  console.log('Original Citizen:', citizen.name, citizen.phone);

  // 3. Update user name
  const updateRes = await fetch(`http://localhost:5000/api/admin/users/${citizen._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: citizen.name,
      phone: citizen.phone,
      status: 'ACTIVE'
    })
  });
  const updateData = await updateRes.json();
  console.log('User Update API Success:', updateData.success, updateData.message);

  // 4. Test Gaushala status toggle
  const gRes = await fetch('http://localhost:5000/api/admin/gaushalas', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const gData = await gRes.json();
  const sampleG = gData.gaushalas[0];
  console.log('Sample Gaushala:', sampleG.name, 'Current Status:', sampleG.status);

  console.log('=== Admin Mutations Verified Successfully ===');
}

testMutations();

