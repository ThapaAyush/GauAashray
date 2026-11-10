require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const GaushalaApplication = require('../models/GaushalaApplication');
const Doctor = require('../models/Doctor');
const RescueTeamMember = require('../models/RescueTeamMember');
const Vehicle = require('../models/Vehicle');
const Cow = require('../models/Cow');
const RescueRequest = require('../models/RescueRequest');
const MedicalRequest = require('../models/MedicalRequest');
const SurrenderRequest = require('../models/SurrenderRequest');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB for Seeding...');
    await connectDB();

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Gaushala.deleteMany(),
      Branch.deleteMany(),
      GaushalaApplication.deleteMany(),
      Doctor.deleteMany(),
      RescueTeamMember.deleteMany(),
      Vehicle.deleteMany(),
      Cow.deleteMany(),
      RescueRequest.deleteMany(),
      MedicalRequest.deleteMany(),
      SurrenderRequest.deleteMany(),
      Appointment.deleteMany(),
      Notification.deleteMany()
    ]);

    console.log('Seeding Super Admin...');
    const superAdmin = await User.create({
      name: process.env.ADMIN_NAME || 'Ayush Thapa',
      phone: process.env.ADMIN_PHONE || '8969682547',
      email: process.env.ADMIN_EMAIL || 'ayush108ayush108@gmail.com',
      password: process.env.ADMIN_PASSWORD || '123456',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });

    console.log('Seeding Public Test User...');
    const publicUser = await User.create({
      name: 'Rahul Sharma',
      phone: '9899900011',
      email: 'rahul.sharma@example.com',
      password: 'User@GauAashray2026',
      role: 'PUBLIC_USER',
      status: 'ACTIVE'
    });

    // 1. Gaushala: Shri Krishna Gaushala (Delhi NCR - Approved)
    console.log('Seeding Shri Krishna Gaushala...');
    const owner1 = await User.create({
      name: 'Ramesh Sharma',
      phone: '9811122233',
      email: 'ramesh.sharma@gaushala.org',
      password: 'Owner@GauAashray2026',
      role: 'GAUSHALA_OWNER',
      status: 'ACTIVE'
    });

    const gaushala1 = await Gaushala.create({
      name: 'Shri Krishna Gaushala & Gau Seva Trust',
      slug: 'shri-krishna-gaushala',
      registrationId: 'GAU-2024-8841',
      owner: owner1._id,
      status: 'APPROVED',
      address: 'Main Bawana Road, Rohini Sector 28',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110085',
      location: {
        type: 'Point',
        coordinates: [77.1130, 28.7041] // [lng, lat]
      },
      photographs: [
        'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'
      ],
      totalCapacity: 150,
      currentCows: 42,
      availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'],
      approvedAt: new Date(),
      approvedBy: superAdmin._id
    });

    owner1.gaushala = gaushala1._id;
    await owner1.save();

    // Branch 1: Rohini
    const branch1 = await Branch.create({
      gaushala: gaushala1._id,
      branchId: 'BR-DEL-01',
      name: 'Shri Krishna Gaushala - Rohini Main Branch',
      address: 'Plot 4, Sector 28, Rohini',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110085',
      phone: '9811122233',
      location: {
        type: 'Point',
        coordinates: [77.1130, 28.7041]
      },
      photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      totalCapacity: 100,
      currentCows: 30,
      availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'],
      operatingHours: '24/7 Emergency Care',
      isActive: true,
      isApproved: true
    });

    // Branch 2: Narela
    const branch2 = await Branch.create({
      gaushala: gaushala1._id,
      branchId: 'BR-DEL-02',
      name: 'Shri Krishna Gaushala - Narela Shelter Wing',
      address: 'Near Old Anaj Mandi, Narela',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110040',
      phone: '9811122234',
      location: {
        type: 'Point',
        coordinates: [77.0911, 28.8522]
      },
      photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      totalCapacity: 50,
      currentCows: 12,
      availableServices: ['RESCUE', 'SURRENDER'],
      operatingHours: '08:00 AM - 08:00 PM',
      isActive: true,
      isApproved: true
    });

    // Doctors for Gaushala 1
    const doctor1 = await Doctor.create({
      gaushala: gaushala1._id,
      assignedBranch: branch1._id,
      name: 'Dr. Alok Verma',
      phone: '9871112233',
      email: 'dr.alok@gaushala.org',
      qualification: 'B.V.Sc & A.H, M.V.Sc (Surgery)',
      registrationNumber: 'VCI-2015-9921',
      specialization: 'Bovine Surgery & Trauma',
      workingHours: '09:00 AM - 06:00 PM',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
      isVerified: true
    });

    const doctor2 = await Doctor.create({
      gaushala: gaushala1._id,
      assignedBranch: branch1._id,
      name: 'Dr. Sunita Yadav',
      phone: '9871112234',
      email: 'dr.sunita@gaushala.org',
      qualification: 'B.V.Sc & A.H',
      registrationNumber: 'VCI-2018-4421',
      specialization: 'Internal Medicine & Calving',
      workingHours: '10:00 AM - 07:00 PM',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
      isVerified: true
    });

    // Rescue Team Members
    const rescueManager = await RescueTeamMember.create({
      gaushala: gaushala1._id,
      assignedBranch: branch1._id,
      name: 'Vikram Singh',
      phone: '9810011221',
      role: 'RESCUE_MANAGER',
      isAvailable: true
    });

    const driver1 = await RescueTeamMember.create({
      gaushala: gaushala1._id,
      assignedBranch: branch1._id,
      name: 'Manoj Kumar',
      phone: '9810011222',
      role: 'DRIVER',
      isAvailable: true
    });

    // Vehicles
    const vehicle1 = await Vehicle.create({
      gaushala: gaushala1._id,
      assignedBranch: branch1._id,
      vehicleNumber: 'DL1L-4421',
      type: 'AMBULANCE',
      capacity: 2,
      driver: driver1._id,
      isAvailable: true
    });

    // Seed Cows in Gaushala 1
    await Cow.create([
      {
        cowId: 'COW-2026-0001',
        name: 'Gauri',
        breed: 'Gir',
        gender: 'COW',
        ageYears: 5,
        arrivalDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        source: 'RESCUE',
        healthCondition: 'HEALTHY',
        photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
        gaushala: gaushala1._id,
        currentBranch: branch1._id,
        tagNumber: 'TAG-DEL-101',
        notes: 'Rescued near bypass. Completely healed and peaceful.'
      },
      {
        cowId: 'COW-2026-0002',
        name: 'Nandini',
        breed: 'Sahiwal',
        gender: 'COW',
        ageYears: 4,
        arrivalDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        source: 'SURRENDER',
        healthCondition: 'HEALTHY',
        photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
        gaushala: gaushala1._id,
        currentBranch: branch1._id,
        tagNumber: 'TAG-DEL-102',
        notes: 'Surrendered due to family relocation. Very gentle.'
      },
      {
        cowId: 'COW-2026-0003',
        name: 'Shankar',
        breed: 'Tharparkar Bull',
        gender: 'BULL',
        ageYears: 6,
        arrivalDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        source: 'RESCUE',
        healthCondition: 'IN_TREATMENT',
        photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
        gaushala: gaushala1._id,
        currentBranch: branch1._id,
        tagNumber: 'TAG-DEL-103',
        notes: 'Accident leg injury healing under Dr. Alok care.'
      }
    ]);

    // 2. Gaushala: Kamadhenu Gau Seva Dham (Noida/Ghaziabad - Approved)
    console.log('Seeding Kamadhenu Gau Seva Dham...');
    const owner2 = await User.create({
      name: 'Suresh Patel',
      phone: '9822233344',
      email: 'suresh.patel@kamadhenu.org',
      password: 'Owner@GauAashray2026',
      role: 'GAUSHALA_OWNER',
      status: 'ACTIVE'
    });

    const gaushala2 = await Gaushala.create({
      name: 'Kamadhenu Gau Seva Dham',
      slug: 'kamadhenu-gau-seva-dham',
      registrationId: 'GAU-2024-5512',
      owner: owner2._id,
      status: 'APPROVED',
      address: 'Institutional Area, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      location: {
        type: 'Point',
        coordinates: [77.3639, 28.6280]
      },
      photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      totalCapacity: 80,
      currentCows: 28,
      availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'],
      approvedAt: new Date(),
      approvedBy: superAdmin._id
    });

    owner2.gaushala = gaushala2._id;
    await owner2.save();

    const branch3 = await Branch.create({
      gaushala: gaushala2._id,
      branchId: 'BR-NOI-01',
      name: 'Kamadhenu Gau Seva Dham - Sector 62',
      address: 'Institutional Area, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      phone: '9822233344',
      location: {
        type: 'Point',
        coordinates: [77.3639, 28.6280]
      },
      photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      totalCapacity: 80,
      currentCows: 28,
      availableServices: ['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'],
      operatingHours: '24/7 Service',
      isActive: true,
      isApproved: true
    });

    await Doctor.create({
      gaushala: gaushala2._id,
      assignedBranch: branch3._id,
      name: 'Dr. Arvind Mishra',
      phone: '9820011223',
      email: 'dr.arvind@kamadhenu.org',
      qualification: 'B.V.Sc & A.H',
      registrationNumber: 'UP-VET-3301',
      specialization: 'Emergency Bovine Treatment',
      workingHours: '09:00 AM - 05:00 PM',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
      isVerified: true
    });

    // 3. Gaushala: Nandi Gau Sansthan (Pending Review for Admin Testing)
    console.log('Seeding Pending Gaushala Application...');
    const owner3 = await User.create({
      name: 'Mahesh Gupta',
      phone: '9833344455',
      email: 'mahesh.gupta@nandi.org',
      password: 'Owner@GauAashray2026',
      role: 'GAUSHALA_OWNER',
      status: 'ACTIVE'
    });

    const gaushala3 = await Gaushala.create({
      name: 'Nandi Gau Sansthan',
      slug: 'nandi-gau-sansthan',
      registrationId: 'GAU-APP-9021',
      owner: owner3._id,
      status: 'PENDING',
      address: 'Near Old Bus Stand, Gurgaon Road',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      location: {
        type: 'Point',
        coordinates: [77.0266, 28.4595]
      },
      photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      totalCapacity: 60,
      currentCows: 10,
      availableServices: ['RESCUE', 'SURRENDER']
    });

    owner3.gaushala = gaushala3._id;
    await owner3.save();

    await GaushalaApplication.create({
      gaushala: gaushala3._id,
      owner: owner3._id,
      status: 'PENDING',
      documents: [
        { title: 'Trust Registration Deed', url: '/uploads/sample-deed.pdf' },
        { title: 'Local Panchayat NOC', url: '/uploads/sample-noc.pdf' }
      ]
    });

    // Seed Initial Active Rescue Incident near Rohini
    console.log('Seeding Sample Rescue Request...');
    await RescueRequest.create({
      trackingId: 'RSC-2026-7842',
      reporter: publicUser._id,
      reporterName: 'Rahul Sharma',
      reporterPhone: '9899900011',
      cowCondition: 'Injured',
      urgency: 'Critical Emergency',
      description: 'Cow has a deep injury on left hind leg near traffic intersection. Sitting calmly on the footpath.',
      photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      location: {
        type: 'Point',
        coordinates: [77.1200, 28.7100] // ~1.2 km from Rohini branch
      },
      addressText: 'Near Deepali Chowk, Outer Ring Road, Pitampura / Rohini',
      landmark: 'Opposite Metro Pillar 382',
      status: 'Assigned',
      assignedGaushala: gaushala1._id,
      assignedBranch: branch1._id,
      assignedTeam: [rescueManager._id],
      assignedVehicle: vehicle1._id,
      statusHistory: [
        {
          status: 'Reported',
          note: 'Rescue incident submitted by Rahul Sharma',
          updatedByName: 'Rahul Sharma',
          timestamp: new Date(Date.now() - 40 * 60 * 1000)
        },
        {
          status: 'Under Verification',
          note: 'Matched to Shri Krishna Gaushala (1.2 km away)',
          updatedByName: 'System Matching Engine',
          timestamp: new Date(Date.now() - 35 * 60 * 1000)
        },
        {
          status: 'Assigned',
          note: 'Accepted by Ramesh Sharma. Team and Ambulance assigned.',
          updatedByName: 'Ramesh Sharma',
          timestamp: new Date(Date.now() - 20 * 60 * 1000)
        }
      ]
    });

    // Seed Sample Medical Doctor Request
    console.log('Seeding Sample Doctor Request...');
    const medReq = await MedicalRequest.create({
      requestId: 'MED-2026-4412',
      owner: publicUser._id,
      ownerName: 'Rahul Sharma',
      ownerPhone: '9899900011',
      cowName: 'Surabhi',
      cowAge: '3 Years',
      symptoms: 'Loss of appetite, mild fever since yesterday morning.',
      urgency: 'Normal',
      photographs: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      location: {
        type: 'Point',
        coordinates: [77.1150, 28.7050]
      },
      addressText: 'House 42, Pocket B-3, Rohini Sector 28, Delhi',
      status: 'Doctor Assigned',
      assignedGaushala: gaushala1._id,
      assignedBranch: branch1._id,
      assignedDoctor: doctor1._id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      scheduledTimeSlot: '11:00 AM - 01:00 PM',
      statusHistory: [
        {
          status: 'New',
          note: 'Requested home visit for cow Surabhi',
          updatedByName: 'Rahul Sharma',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          status: 'Doctor Assigned',
          note: 'Assigned Dr. Alok Verma for home visit tomorrow.',
          updatedByName: 'Ramesh Sharma',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    });

    await Appointment.create({
      medicalRequest: medReq._id,
      gaushala: gaushala1._id,
      branch: branch1._id,
      doctor: doctor1._id,
      customerName: 'Rahul Sharma',
      customerPhone: '9899900011',
      cowName: 'Surabhi',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      timeSlot: '11:00 AM - 01:00 PM',
      locationAddress: 'House 42, Pocket B-3, Rohini Sector 28, Delhi',
      status: 'SCHEDULED'
    });

    console.log('========================================================');
    console.log('  SEEDING COMPLETED SUCCESSFULLY!                       ');
    console.log('========================================================');
    console.log('Super Admin Login:');
    console.log('  Phone/Email: admin@gauaashray.org or 9876543210');
    console.log('  Password:    Admin@GauAashray2026');
    console.log('Approved Gaushala Owner Login:');
    console.log('  Phone/Email: 9811122233 or ramesh.sharma@gaushala.org');
    console.log('  Password:    Owner@GauAashray2026');
    console.log('Pending Gaushala Owner Login (for testing application status):');
    console.log('  Phone/Email: 9833344455 or mahesh.gupta@nandi.org');
    console.log('  Password:    Owner@GauAashray2026');
    console.log('Public User Login:');
    console.log('  Phone/Email: 9899900011 or rahul.sharma@example.com');
    console.log('  Password:    User@GauAashray2026');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

