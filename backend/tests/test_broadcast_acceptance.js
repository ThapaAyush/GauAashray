const API_BASE = 'http://127.0.0.1:5000/api';

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runBroadcastTest() {
  console.log('====================================================');
  console.log('🧪 TESTING 5-NEAREST GAUSHALA BROADCAST & ACCEPTANCE');
  console.log('====================================================');

  try {
    // 1. Log in as Gaushala 1 (Shri Krishna Gaushala)
    console.log('\n1. Logging in as Gaushala 1 (Shri Krishna)...');
    const g1Res = await request('/auth/login', {
      method: 'POST',
      body: { loginId: '9811122233', password: 'Owner@GauAashray2026' }
    });
    if (!g1Res.ok) throw new Error('Gaushala 1 login failed: ' + JSON.stringify(g1Res.data));
    const g1Token = g1Res.data.token;
    console.log('   ✅ Gaushala 1 logged in successfully.');

    // 2. Log in as Gaushala 2 (Kamadhenu Gau Seva Dham)
    console.log('\n2. Logging in as Gaushala 2 (Kamadhenu)...');
    const g2Res = await request('/auth/login', {
      method: 'POST',
      body: { loginId: '9822233344', password: 'Owner@GauAashray2026' }
    });
    if (!g2Res.ok) throw new Error('Gaushala 2 login failed: ' + JSON.stringify(g2Res.data));
    const g2Token = g2Res.data.token;
    console.log('   ✅ Gaushala 2 logged in successfully.');

    // 3. Submit a new Rescue Request from Citizen Reporter
    console.log('\n3. Citizen reporting an injured cow on the street...');
    const reportRes = await request('/rescue', {
      method: 'POST',
      body: {
        reporterName: 'Amit Verma',
        reporterPhone: '9876500099',
        cowCondition: 'Injured',
        urgency: 'Normal',
        description: 'Found an injured cow near Sector 62 intersection',
        photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
        latitude: 28.6280,
        longitude: 77.3649,
        addressText: 'Sector 62, Noida, Uttar Pradesh'
      }
    });
    if (!reportRes.ok) throw new Error('Rescue report creation failed: ' + JSON.stringify(reportRes.data));

    const trackingId = reportRes.data.trackingId;
    const rescueId = reportRes.data.rescueRequest._id;
    console.log(`   ✅ Rescue Request created: ${trackingId} (ID: ${rescueId})`);
    console.log(`   Broadcast count: ${reportRes.data.broadcastCount} nearest shelters notified.`);

    // 4. Verify Gaushala 1 sees the request in their queue
    console.log('\n4. Checking Gaushala 1 queue...');
    const g1Queue = await request('/rescue/gaushala/requests', {
      method: 'GET',
      headers: { Authorization: `Bearer ${g1Token}` }
    });
    const inG1 = g1Queue.data.requests.find((r) => r._id === rescueId);
    if (!inG1) {
      throw new Error('❌ Request not found in Gaushala 1 queue!');
    }
    console.log(`   ✅ Found in Gaushala 1 queue: ${inG1.trackingId} (isBroadcast: ${inG1.isBroadcast})`);

    // 5. Verify Gaushala 2 ALSO sees the request in their queue
    console.log('\n5. Checking Gaushala 2 queue...');
    const g2Queue = await request('/rescue/gaushala/requests', {
      method: 'GET',
      headers: { Authorization: `Bearer ${g2Token}` }
    });
    const inG2 = g2Queue.data.requests.find((r) => r._id === rescueId);
    if (!inG2) {
      throw new Error('❌ Request not found in Gaushala 2 queue!');
    }
    console.log(`   ✅ Found in Gaushala 2 queue: ${inG2.trackingId} (isBroadcast: ${inG2.isBroadcast})`);

    // 6. Gaushala 1 ACCEPTS the request (First to accept)
    console.log('\n6. Gaushala 1 clicks "Accept & Claim Request"...');
    const acceptRes = await request(`/rescue/${rescueId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${g1Token}` }
    });
    if (!acceptRes.ok) throw new Error('Accept request failed: ' + JSON.stringify(acceptRes.data));
    console.log(`   ✅ Accept Response: ${acceptRes.data.message}`);

    // 7. Verify Gaushala 2 queue - request MUST BE REMOVED!
    console.log('\n7. Verifying Gaushala 2 queue (Request MUST BE REMOVED)...');
    const g2QueueAfter = await request('/rescue/gaushala/requests', {
      method: 'GET',
      headers: { Authorization: `Bearer ${g2Token}` }
    });
    const stillInG2 = g2QueueAfter.data.requests.find((r) => r._id === rescueId);
    if (stillInG2) {
      throw new Error('❌ Request still appears in Gaushala 2 queue after Gaushala 1 accepted it!');
    }
    console.log('   ✅ VERIFIED: Request is completely REMOVED from Gaushala 2 queue!');

    // 8. Verify race condition: If Gaushala 2 tries to accept anyway, it gets 409 Conflict
    console.log('\n8. Testing race condition: Gaushala 2 attempts to accept already claimed request...');
    const raceRes = await request(`/rescue/${rescueId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${g2Token}` }
    });
    if (raceRes.status === 409) {
      console.log(`   ✅ VERIFIED: Gaushala 2 received 409 Conflict: "${raceRes.data.message}"`);
    } else {
      throw new Error(`Expected 409 Conflict, got ${raceRes.status}: ` + JSON.stringify(raceRes.data));
    }

    console.log('\n====================================================');
    console.log('🎉 ALL 5-GAUSHALA BROADCAST & REMOVAL TESTS PASSED!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runBroadcastTest();
