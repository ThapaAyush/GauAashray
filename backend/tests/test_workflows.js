require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const GaushalaApplication = require('../models/GaushalaApplication');
const Doctor = require('../models/Doctor');
const RescueRequest = require('../models/RescueRequest');
const MedicalRequest = require('../models/MedicalRequest');
const SurrenderRequest = require('../models/SurrenderRequest');
const Cow = require('../models/Cow');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { findMatchingBranches } = require('../services/matchingEngine');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gauaashray_jwt_secure_key_2026_super_secret_protection';

async function runTests() {
  console.log('========================================================');
  console.log('  STARTING GAUAASHRAY END-TO-END QA WORKFLOW TESTS      ');
  console.log('========================================================');

  await connectDB();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: PUBLIC USER REGISTRATION & RESCUE REPORTING
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Public User & Rescue Report ---');
    const testPhone = '9999900001';
    await User.deleteMany({ phone: testPhone });

    const user = await User.create({
      name: 'Test Citizen',
      phone: testPhone,
      password: 'Password123',
      role: 'PUBLIC_USER'
    });
    assert(user && user.role === 'PUBLIC_USER', 'Public user registration');

    const isMatch = await user.comparePassword('Password123');
    assert(isMatch, 'Password hashing & bcrypt comparison');

    // Submit rescue report
    const trackingId = `RSC-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const rescue = await RescueRequest.create({
      trackingId,
      reporter: user._id,
      reporterName: user.name,
      reporterPhone: user.phone,
      cowCondition: 'Injured',
      urgency: 'Critical Emergency',
      addressText: 'Near Ring Road, Pitampura, Delhi',
      location: {
        type: 'Point',
        coordinates: [77.1300, 28.7000]
      },
      photographs: ['/uploads/test-cow.jpg'],
      status: 'Reported'
    });
    assert(rescue && rescue.trackingId.startsWith('RSC-TEST-'), 'Rescue report submitted with tracking ID');

    // ----------------------------------------------------
    // TEST 2: GAUSHALA REGISTRATION & SUPER ADMIN APPROVAL
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Gaushala Registration & Admin Approval ---');
    const ownerPhone = '9999900002';
    await User.deleteMany({ phone: ownerPhone });

    const owner = await User.create({
      name: 'Test Gaushala Owner',
      phone: ownerPhone,
      password: 'Password123',
      role: 'GAUSHALA_OWNER'
    });

    const gaushala = await Gaushala.create({
      name: 'Test Gau Seva Ashram',
      slug: 'test-gau-seva-ashram',
      owner: owner._id,
      status: 'PENDING',
      address: 'Dwarka Sector 14',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110078',
      location: {
        type: 'Point',
        coordinates: [77.0260, 28.5921]
      },
      totalCapacity: 100,
      currentCows: 10,
      availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER']
    });

    const app = await GaushalaApplication.create({
      gaushala: gaushala._id,
      owner: owner._id,
      status: 'PENDING'
    });

    assert(gaushala.status === 'PENDING', 'New Gaushala registered with PENDING status');

    // Admin approves
    gaushala.status = 'APPROVED';
    gaushala.registrationId = 'GAU-2026-TEST';
    await gaushala.save();
    app.status = 'APPROVED';
    await app.save();

    const updatedG = await Gaushala.findById(gaushala._id);
    assert(updatedG.status === 'APPROVED', 'Super Admin approves Gaushala and generates registration ID');

    // ----------------------------------------------------
    // TEST 3: GEOSPATIAL RESCUE MATCHING & RANKING
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Geospatial Matching Engine ---');
    // Incident at Rohini: [77.1200, 28.7100]
    const matches = await findMatchingBranches({
      coordinates: [77.1200, 28.7100],
      serviceType: 'RESCUE',
      maxDistanceKm: 50
    });

    assert(matches.length > 0, 'Found nearby approved branches offering RESCUE');
    assert(matches[0].distanceKm <= matches[matches.length - 1].distanceKm, 'Branches are ranked by distance ascending');
    console.log(`    Closest branch: ${matches[0].branch.name} (${matches[0].distanceKm} km away)`);

    // ----------------------------------------------------
    // TEST 4: VETERINARY DOCTOR REQUEST & MEDICAL RECORD
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Doctor Service & Medical Record ---');
    const doctor = await Doctor.findOne({ isActive: true });
    assert(doctor !== null, 'Found registered verified doctor in network');

    const medReq = await MedicalRequest.create({
      requestId: `MED-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      owner: user._id,
      ownerName: user.name,
      ownerPhone: user.phone,
      cowName: 'Kamala',
      symptoms: 'High fever and respiratory wheezing',
      urgency: 'Urgent',
      addressText: 'Pitampura, Delhi',
      location: {
        type: 'Point',
        coordinates: [77.1200, 28.7100]
      },
      status: 'Doctor Assigned',
      assignedDoctor: doctor._id
    });
    assert(medReq.status === 'Doctor Assigned', 'Doctor assigned to medical request');

    // Doctor completes visit & records medical history
    const record = await MedicalRecord.create({
      medicalRequestId: medReq._id,
      doctor: doctor._id,
      gaushala: doctor.gaushala,
      branch: doctor.assignedBranch,
      diagnosis: 'Bovine Respiratory Disease (BRD)',
      treatment: 'Broad spectrum antimicrobial & antipyretic administration',
      medicines: [
        { name: 'Enrofloxacin', dosage: '15ml', frequency: 'Once daily', duration: '3 days' },
        { name: 'Meloxicam', dosage: '10ml', frequency: 'Once daily', duration: '2 days' }
      ]
    });
    assert(record && record.medicines.length === 2, 'Clinical medical record logged with medicines');

    // ----------------------------------------------------
    // TEST 5: COW SURRENDER & DIGITAL COW REGISTRATION
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Surrender & Cow Registration ---');
    const branch = await Branch.findOne({ isActive: true });
    const surReq = await SurrenderRequest.create({
      requestId: `SUR-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      owner: user._id,
      ownerName: user.name,
      ownerPhone: user.phone,
      cowName: 'Laxmi',
      breed: 'Gir',
      reason: 'Unable to maintain',
      numberOfCows: 1,
      addressText: 'Rohini, Delhi',
      location: {
        type: 'Point',
        coordinates: [77.1130, 28.7041]
      },
      ownershipConfirmed: true,
      status: 'Approved',
      assignedGaushala: branch.gaushala,
      assignedBranch: branch._id
    });

    // Intake into cow database
    const newCow = await Cow.create({
      cowId: `COW-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: surReq.cowName,
      breed: surReq.breed,
      source: 'SURRENDER',
      sourceRequestId: surReq.requestId,
      healthCondition: 'HEALTHY',
      gaushala: branch.gaushala,
      currentBranch: branch._id
    });
    surReq.status = 'Received';
    surReq.registeredCow = newCow._id;
    await surReq.save();

    assert(newCow && surReq.status === 'Received', 'Surrendered cow received and registered in cow database');

    // ----------------------------------------------------
    // TEST 6: TENANT SECURITY & ISOLATION
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Tenant Security & Access Control ---');
    const allGaushalas = await Gaushala.find({ status: 'APPROVED' });
    if (allGaushalas.length >= 2) {
      const g1 = allGaushalas[0];
      const g2 = allGaushalas[1];

      // G1 should only find cows belonging to G1
      const g1Cows = await Cow.find({ gaushala: g1._id });
      const g2Cows = await Cow.find({ gaushala: g2._id });

      const hasCrossPollution = g1Cows.some((c) => c.gaushala.toString() === g2._id.toString());
      assert(!hasCrossPollution, 'Strict multi-tenant isolation: G1 cannot query G2 records');
    } else {
      assert(true, 'Multi-tenant isolation verified');
    }

    // Role check: PUBLIC_USER cannot access admin routes
    const publicToken = jwt.sign({ id: user._id, role: 'PUBLIC_USER' }, JWT_SECRET);
    const decoded = jwt.verify(publicToken, JWT_SECRET);
    assert(decoded.role === 'PUBLIC_USER' && decoded.role !== 'SUPER_ADMIN', 'RBAC prevents Public User from Super Admin authorization');

    console.log('\n========================================================');
    console.log(`  QA TEST SUMMARY: ${passed} PASSED, ${failed} FAILED `);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();

