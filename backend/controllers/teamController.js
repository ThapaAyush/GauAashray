const RescueTeamMember = require('../models/RescueTeamMember');
const Vehicle = require('../models/Vehicle');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');

// @desc Get rescue team members
// @route GET /api/team
exports.getTeamMembers = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const members = await RescueTeamMember.find({ gaushala: gaushala._id })
      .populate('assignedBranch', 'name branchId');

    res.status(200).json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching team members' });
  }
};

// @desc Add rescue team member
// @route POST /api/team
exports.createTeamMember = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const { name, phone, role, assignedBranchId, photo } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    let branch = null;
    if (assignedBranchId) {
      branch = await Branch.findOne({ _id: assignedBranchId, gaushala: gaushala._id });
    } else {
      branch = await Branch.findOne({ gaushala: gaushala._id });
    }

    const member = await RescueTeamMember.create({
      gaushala: gaushala._id,
      assignedBranch: branch._id,
      name,
      phone,
      role: role || 'RESCUE_WORKER',
      photo: photo || '',
      isAvailable: true
    });

    res.status(201).json({
      success: true,
      message: 'Rescue team member registered',
      member
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error registering member' });
  }
};

// @desc Update team member
// @route PUT /api/team/:id
exports.updateTeamMember = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    const member = await RescueTeamMember.findOne({ _id: req.params.id, gaushala: gaushala._id });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    const { name, phone, role, isAvailable, assignedBranchId } = req.body;
    if (name) member.name = name;
    if (phone) member.phone = phone;
    if (role) member.role = role;
    if (typeof isAvailable === 'boolean') member.isAvailable = isAvailable;
    if (assignedBranchId) member.assignedBranch = assignedBranchId;

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Team member updated',
      member
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating member' });
  }
};

// @desc Get vehicles
// @route GET /api/team/vehicles
exports.getVehicles = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const vehicles = await Vehicle.find({ gaushala: gaushala._id })
      .populate('assignedBranch', 'name')
      .populate('driver', 'name phone');

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vehicles' });
  }
};

// @desc Add vehicle
// @route POST /api/team/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const { vehicleNumber, type, capacity, assignedBranchId, driverId } = req.body;

    if (!vehicleNumber) {
      return res.status(400).json({ success: false, message: 'Vehicle registration number is required' });
    }

    let branch = null;
    if (assignedBranchId) {
      branch = await Branch.findOne({ _id: assignedBranchId, gaushala: gaushala._id });
    } else {
      branch = await Branch.findOne({ gaushala: gaushala._id });
    }

    const vehicle = await Vehicle.create({
      gaushala: gaushala._id,
      assignedBranch: branch._id,
      vehicleNumber,
      type: type || 'RESCUE_VAN',
      capacity: parseInt(capacity) || 2,
      driver: driverId || null,
      isAvailable: true
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error adding vehicle' });
  }
};

// @desc Update vehicle
// @route PUT /api/team/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    const vehicle = await Vehicle.findOne({ _id: req.params.id, gaushala: gaushala._id });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const { vehicleNumber, type, capacity, isAvailable, driverId, assignedBranchId } = req.body;
    if (vehicleNumber) vehicle.vehicleNumber = vehicleNumber;
    if (type) vehicle.type = type;
    if (capacity) vehicle.capacity = capacity;
    if (typeof isAvailable === 'boolean') vehicle.isAvailable = isAvailable;
    if (driverId !== undefined) vehicle.driver = driverId || null;
    if (assignedBranchId) vehicle.assignedBranch = assignedBranchId;

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle updated',
      vehicle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating vehicle' });
  }
};

