require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function cleanTestRecords() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for test cleanup...');

  const User = require('../models/User');
  const Gaushala = require('../models/Gaushala');
  const Branch = require('../models/Branch');
  const RescueRequest = require('../models/RescueRequest');
  const Cow = require('../models/Cow');

  const uRes = await User.deleteMany({
    $or: [{ phone: { $in: ['9999900001', '9999900002'] } }, { name: /^Test /i }]
  });

  const gRes = await Gaushala.deleteMany({
    $or: [{ registrationId: /TEST/i }, { name: /^Test /i }]
  });

  const bRes = await Branch.deleteMany({
    $or: [{ name: /^Test /i }, { branchId: /TEST/i }]
  });

  const rRes = await RescueRequest.deleteMany({
    $or: [{ trackingId: /TEST/i }, { reporterName: /^Test /i }]
  });

  const cRes = await Cow.deleteMany({
    $or: [{ cowId: /TEST/i }, { name: /^Test/i }]
  });

  console.log('CLEANUP RESULTS:', {
    usersRemoved: uRes.deletedCount,
    gaushalasRemoved: gRes.deletedCount,
    branchesRemoved: bRes.deletedCount,
    rescuesRemoved: rRes.deletedCount,
    cowsRemoved: cRes.deletedCount
  });

  const remainingGaushalas = await Gaushala.find({}, 'name city state registrationId status');
  console.log('\nREMAINING REAL GAUSHALAS IN DATABASE:');
  remainingGaushalas.forEach((g) => {
    console.log(` - [${g.status}] ${g.name} (${g.city}, ${g.state}) - ${g.registrationId}`);
  });

  const remainingUsers = await User.find({}, 'name phone role');
  console.log('\nREMAINING REAL USERS IN DATABASE:');
  remainingUsers.forEach((u) => {
    console.log(` - [${u.role}] ${u.name} (${u.phone})`);
  });

  process.exit(0);
}

cleanTestRecords().catch((err) => {
  console.error(err);
  process.exit(1);
});

