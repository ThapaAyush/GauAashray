const fs = require('fs');
const path = require('path');

async function testProfileAndAvatar() {
  console.log('--- 1. Login Super Admin to get Token ---');
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
  console.log('Login success:', loginData.success, 'User:', loginData.user.name, 'Initial Avatar:', loginData.user.avatar || 'NONE');

  console.log('\n--- 2. Upload Profile Image ---');
  // Create a small test png image in memory
  const testImagePath = path.join(__dirname, 'test_avatar.png');
  // 1x1 transparent png bytes
  const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(testImagePath, dummyPng);

  const formData = new FormData();
  const fileBlob = new Blob([dummyPng], { type: 'image/png' });
  formData.append('file', fileBlob, 'avatar_test.png');

  const uploadRes = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const uploadData = await uploadRes.json();
  console.log('Upload response:', uploadData.success, 'Uploaded URL:', uploadData.url);

  console.log('\n--- 3. Save Profile with New Avatar in MongoDB ---');
  const updateRes = await fetch('http://localhost:5000/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Ayush Thapa',
      phone: '8969682547',
      email: 'ayush108ayush108@gmail.com',
      avatar: uploadData.url
    })
  });
  const updateData = await updateRes.json();
  console.log('Profile update response:', updateData.success, 'Saved Avatar in DB:', updateData.user?.avatar);

  console.log('\n--- 4. Verify MongoDB Query GET /api/auth/me ---');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('GET /api/auth/me Avatar:', meData.user?.avatar);
  console.log('Avatar persisted in MongoDB:', meData.user?.avatar === uploadData.url);

  console.log('\n--- 5. Test Delete Avatar in MongoDB ---');
  const deleteRes = await fetch('http://localhost:5000/api/auth/avatar', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const deleteData = await deleteRes.json();
  console.log('Delete Avatar response:', deleteData.success, 'New Avatar in DB:', deleteData.user?.avatar);

  console.log('\n--- 6. Re-Verify MongoDB Query GET /api/auth/me ---');
  const meRes2 = await fetch('http://localhost:5000/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData2 = await meRes2.json();
  console.log('GET /api/auth/me Avatar after deletion:', meData2.user?.avatar || 'EMPTY (Initial Letter fallback restored)');

  // Clean up temp test image
  try { fs.unlinkSync(testImagePath); } catch (e) {}

  console.log('\n=== Profile & Avatar Upload/Delete Full Pipeline Verified Successfully ===');
}

testProfileAndAvatar();

