const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const Cow = require('../models/Cow');
const Doctor = require('../models/Doctor');
const RescueTeamMember = require('../models/RescueTeamMember');
const RescueRequest = require('../models/RescueRequest');
const MedicalRequest = require('../models/MedicalRequest');
const SurrenderRequest = require('../models/SurrenderRequest');
const Appointment = require('../models/Appointment');
const { calculateDistanceKm } = require('../utils/geo');

// @desc Get current Gaushala Profile
// @route GET /api/gaushalas/my-profile
exports.getMyGaushalaProfile = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({
        success: false,
        message: 'No Gaushala profile linked to this account.'
      });
    }

    const branches = await Branch.find({ gaushala: gaushala._id });
    res.status(200).json({
      success: true,
      gaushala,
      branches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Update Gaushala profile
// @route PUT /api/gaushalas/my-profile
exports.updateMyGaushalaProfile = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      totalCapacity,
      availableServices,
      photographs
    } = req.body;

    if (name) gaushala.name = name;
    if (address) gaushala.address = address;
    if (city) gaushala.city = city;
    if (state) gaushala.state = state;
    if (pincode) gaushala.pincode = pincode;
    if (totalCapacity) gaushala.totalCapacity = totalCapacity;
    if (availableServices) gaushala.availableServices = availableServices;
    if (photographs) gaushala.photographs = photographs;

    await gaushala.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      gaushala
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// @desc Get branches of current Gaushala
// @route GET /api/gaushalas/my-branches
exports.getMyBranches = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const branches = await Branch.find({ gaushala: gaushala._id }).sort({ createdAt: -1 });

    // Populate counts for each branch
    const branchData = await Promise.all(
      branches.map(async (b) => {
        const cowCount = await Cow.countDocuments({ currentBranch: b._id, healthCondition: { $ne: 'DECEASED' } });
        const doctorCount = await Doctor.countDocuments({ assignedBranch: b._id, isActive: true });
        const teamCount = await RescueTeamMember.countDocuments({ assignedBranch: b._id });
        return {
          ...b.toObject(),
          cowCount,
          doctorCount,
          teamCount
        };
      })
    );

    res.status(200).json({
      success: true,
      branches: branchData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching branches' });
  }
};

// @desc Create new branch
// @route POST /api/gaushalas/branches
exports.createBranch = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      latitude,
      longitude,
      totalCapacity,
      availableServices,
      operatingHours,
      photographs
    } = req.body;

    if (!name || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, city, state and pincode are required.'
      });
    }

    const lat = parseFloat(latitude) || gaushala.location.coordinates[1];
    const lng = parseFloat(longitude) || gaushala.location.coordinates[0];

    const branchCode = 'BR-' + Math.floor(1000 + Math.random() * 9000);

    const branch = await Branch.create({
      gaushala: gaushala._id,
      branchId: branchCode,
      name,
      address,
      city,
      state,
      pincode,
      phone: phone || req.user.phone,
      email: email || '',
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      photographs: photographs || [],
      totalCapacity: parseInt(totalCapacity) || 40,
      currentCows: 0,
      availableServices: availableServices || ['RESCUE', 'VETERINARY'],
      operatingHours: operatingHours || '24/7 Emergency Service',
      isActive: true,
      isApproved: true
    });

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      branch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating branch' });
  }
};

// @desc Update branch
// @route PUT /api/gaushalas/branches/:id
exports.updateBranch = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const branch = await Branch.findOne({ _id: req.params.id, gaushala: gaushala._id });
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found or unauthorized' });
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      totalCapacity,
      availableServices,
      operatingHours,
      isActive
    } = req.body;

    if (name) branch.name = name;
    if (address) branch.address = address;
    if (city) branch.city = city;
    if (state) branch.state = state;
    if (pincode) branch.pincode = pincode;
    if (phone) branch.phone = phone;
    if (totalCapacity) branch.totalCapacity = totalCapacity;
    if (availableServices) branch.availableServices = availableServices;
    if (operatingHours) branch.operatingHours = operatingHours;
    if (typeof isActive === 'boolean') branch.isActive = isActive;

    await branch.save();

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      branch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating branch' });
  }
};

// @desc Get public directory of all listed approved Gaushalas & network stats
// @route GET /api/gaushalas/directory
exports.getPublicDirectory = async (req, res) => {
  try {
    const { search, service, state, city } = req.query;

    const filter = { status: 'APPROVED' };

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { city: regex },
        { state: regex },
        { pincode: regex },
        { registrationId: regex }
      ];
    }

    if (service && service !== 'ALL') {
      filter.availableServices = service;
    }

    if (state && state !== 'ALL') {
      filter.state = new RegExp(state.trim(), 'i');
    }

    if (city && city !== 'ALL') {
      filter.city = new RegExp(city.trim(), 'i');
    }

    // 1. Fetch Approved Gaushalas
    const gaushalas = await Gaushala.find(filter)
      .sort({ createdAt: -1 })
      .populate('owner', 'name phone email');

    // 2. Fetch branches for each Gaushala
    const gaushalasWithBranches = await Promise.all(
      gaushalas.map(async (g) => {
        const branches = await Branch.find({
          gaushala: g._id,
          isActive: true,
          isApproved: true
        });

        const activeCows = await Cow.countDocuments({
          gaushala: g._id,
          healthCondition: { $ne: 'DECEASED' }
        });

        const doctorsCount = await Doctor.countDocuments({
          gaushala: g._id,
          isActive: true
        });

        return {
          id: g._id,
          name: g.name,
          slug: g.slug,
          registrationId: g.registrationId || 'GAU-VERIFIED',
          address: g.address,
          city: g.city,
          state: g.state,
          pincode: g.pincode,
          location: g.location,
          totalCapacity: g.totalCapacity,
          currentCows: activeCows || g.currentCows,
          availableSlots: Math.max(0, g.totalCapacity - (activeCows || g.currentCows)),
          availableServices: g.availableServices,
          photographs: g.photographs,
          phone: g.owner?.phone || '',
          email: g.owner?.email || '',
          branchCount: branches.length,
          doctorCount: doctorsCount,
          branches: branches.map((b) => ({
            id: b._id,
            name: b.name,
            address: b.address,
            city: b.city,
            state: b.state,
            pincode: b.pincode,
            phone: b.phone,
            operatingHours: b.operatingHours,
            availableServices: b.availableServices
          }))
        };
      })
    );

    // 3. Compute Network Summary Statistics
    const totalListedGaushalas = await Gaushala.countDocuments({ status: 'APPROVED' });
    const totalActiveBranches = await Branch.countDocuments({ isActive: true, isApproved: true });
    const totalCowsSheltered = await Cow.countDocuments({ healthCondition: { $ne: 'DECEASED' } });
    const totalActiveDoctors = await Doctor.countDocuments({ isActive: true });
    const totalRescues = await RescueRequest.countDocuments();
    const totalCapacityResult = await Gaushala.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, total: { $sum: '$totalCapacity' } } }
    ]);
    const totalCapacity = totalCapacityResult[0]?.total || 0;

    // Unique states and cities
    const states = await Gaushala.distinct('state', { status: 'APPROVED' });
    const cities = await Gaushala.distinct('city', { status: 'APPROVED' });

    res.status(200).json({
      success: true,
      stats: {
        totalListedGaushalas,
        totalActiveBranches,
        totalCapacity,
        totalCowsSheltered,
        totalActiveDoctors,
        totalRescues,
        totalStatesCount: states.length,
        totalCitiesCount: cities.length
      },
      filters: {
        states,
        cities
      },
      count: gaushalasWithBranches.length,
      gaushalas: gaushalasWithBranches
    });
  } catch (error) {
    console.error('Error fetching public directory:', error);
    res.status(500).json({ success: false, message: 'Error fetching Gaushala directory' });
  }
};

// @desc Get public nearby approved Gaushalas
// @route GET /api/gaushalas/nearby
exports.getNearbyGaushalas = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    const userLat = parseFloat(lat) || 28.6139;
    const userLng = parseFloat(lng) || 77.2090;

    const branches = await Branch.find({
      isActive: true,
      isApproved: true
    }).populate('gaushala');

    const approvedBranches = branches.filter((b) => b.gaushala && b.gaushala.status === 'APPROVED');

    const result = approvedBranches.map((b) => {
      const bLng = b.location.coordinates[0];
      const bLat = b.location.coordinates[1];
      const distance = calculateDistanceKm(userLat, userLng, bLat, bLng);
      return {
        id: b._id,
        name: b.name,
        gaushalaName: b.gaushala.name,
        address: b.address,
        city: b.city,
        state: b.state,
        phone: b.phone,
        services: b.availableServices,
        operatingHours: b.operatingHours,
        totalCapacity: b.totalCapacity,
        currentCows: b.currentCows,
        photographs: b.photographs,
        coordinates: b.location.coordinates,
        distanceKm: distance
      };
    });

    result.sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      count: result.length,
      gaushalas: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching nearby Gaushalas' });
  }
};

// @desc Get Gaushala Owner Dashboard Overview Statistics
// @route GET /api/gaushalas/stats
exports.getGaushalaStats = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const gId = gaushala._id;

    const [
      totalBranches,
      totalCows,
      activeRescues,
      totalDoctors,
      pendingAppointments,
      pendingSurrenders
    ] = await Promise.all([
      Branch.countDocuments({ gaushala: gId }),
      Cow.countDocuments({ gaushala: gId, healthCondition: { $ne: 'DECEASED' } }),
      RescueRequest.countDocuments({
        assignedGaushala: gId,
        status: { $nin: ['Completed', 'Cancelled'] }
      }),
      Doctor.countDocuments({ gaushala: gId, isActive: true }),
      Appointment.countDocuments({
        gaushala: gId,
        status: 'SCHEDULED'
      }),
      SurrenderRequest.countDocuments({
        assignedGaushala: gId,
        status: { $in: ['Submitted', 'Under Review', 'Inspection Required', 'Approved'] }
      })
    ]);

    const availableCapacity = Math.max(0, gaushala.totalCapacity - totalCows);

    res.status(200).json({
      success: true,
      stats: {
        totalBranches,
        totalCows,
        activeRescues,
        totalDoctors,
        availableCapacity,
        pendingAppointments,
        pendingSurrenders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

// @desc Register Gaushala for existing user
// @route POST /api/gaushalas/register-existing
exports.registerExistingUserGaushala = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let gaushala = await Gaushala.findOne({ owner: user._id });
    if (gaushala) {
      user.gaushala = gaushala._id;
      user.activeRole = 'GAUSHALA_OWNER';
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Gaushala profile already exists and is now activated.',
        gaushala
      });
    }

    const {
      name,
      registrationId,
      address,
      city,
      state,
      pincode,
      totalCapacity = 50,
      availableServices = ['RESCUE', 'VETERINARY']
    } = req.body;

    if (!name || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, city, state, and pincode are required.'
      });
    }

    gaushala = await Gaushala.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      registrationId: registrationId || '',
      owner: user._id,
      status: 'APPROVED',
      address,
      state,
      city,
      pincode,
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      totalCapacity: parseInt(totalCapacity) || 50,
      availableServices
    });

    // Create Main Branch
    await Branch.create({
      gaushala: gaushala._id,
      branchId: 'BR-' + Math.floor(1000 + Math.random() * 9000),
      name: `${name} - Main Branch`,
      address,
      city,
      state,
      pincode,
      phone: user.phone,
      email: user.email || '',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      totalCapacity: parseInt(totalCapacity) || 50,
      availableServices,
      isActive: true,
      isApproved: true
    });

    user.gaushala = gaushala._id;
    if (user.role !== 'SUPER_ADMIN') {
      user.role = 'GAUSHALA_OWNER';
    }
    user.activeRole = 'GAUSHALA_OWNER';
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Gaushala registered and linked to your account successfully!',
      gaushala,
      user
    });
  } catch (error) {
    console.error('registerExistingUserGaushala error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error registering Gaushala' });
  }
};


