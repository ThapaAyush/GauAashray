const User = require('../models/User');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const GaushalaApplication = require('../models/GaushalaApplication');
const RescueRequest = require('../models/RescueRequest');
const MedicalRequest = require('../models/MedicalRequest');
const SurrenderRequest = require('../models/SurrenderRequest');
const Cow = require('../models/Cow');
const Doctor = require('../models/Doctor');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const { createNotification } = require('../services/notificationService');

// @desc Super Admin Dashboard Summary
// @route GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalGaushalas,
      pendingApplications,
      approvedGaushalas,
      rejectedApplications,
      totalUsers,
      totalRescues,
      activeRescues,
      completedRescues,
      totalDoctorRequests,
      totalSurrenders,
      totalCows,
      totalComplaints
    ] = await Promise.all([
      Gaushala.countDocuments(),
      Gaushala.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
      Gaushala.countDocuments({ status: 'APPROVED' }),
      Gaushala.countDocuments({ status: 'REJECTED' }),
      User.countDocuments({ role: 'PUBLIC_USER' }),
      RescueRequest.countDocuments(),
      RescueRequest.countDocuments({ status: { $nin: ['Completed', 'Cancelled'] } }),
      RescueRequest.countDocuments({ status: 'Completed' }),
      MedicalRequest.countDocuments(),
      SurrenderRequest.countDocuments(),
      Cow.countDocuments(),
      Complaint.countDocuments({ status: 'OPEN' })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalGaushalas,
        pendingApplications,
        approvedGaushalas,
        rejectedApplications,
        totalUsers,
        totalRescues,
        activeRescues,
        completedRescues,
        totalDoctorRequests,
        totalSurrenders,
        totalCows,
        totalComplaints
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin dashboard statistics' });
  }
};

// @desc Get Gaushala Applications
// @route GET /api/admin/applications
exports.getApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const applications = await GaushalaApplication.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'gaushala',
        populate: { path: 'owner', select: 'name phone email' }
      })
      .populate('owner', 'name phone email');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications' });
  }
};

// @desc Approve Gaushala Application
// @route PUT /api/admin/applications/:id/approve
exports.approveApplication = async (req, res) => {
  try {
    const app = await GaushalaApplication.findById(req.params.id).populate('gaushala');
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const gaushala = await Gaushala.findById(app.gaushala._id);
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    // Generate unique official Gaushala ID if missing
    if (!gaushala.registrationId || gaushala.registrationId === '') {
      gaushala.registrationId = `GAU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    gaushala.status = 'APPROVED';
    gaushala.approvedAt = new Date();
    gaushala.approvedBy = req.user._id;
    await gaushala.save();

    // Activate and approve associated branches
    await Branch.updateMany(
      { gaushala: gaushala._id },
      { isActive: true, isApproved: true }
    );

    app.status = 'APPROVED';
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();
    app.reviewNotes = req.body.notes || 'Approved following document and credentials verification.';
    await app.save();

    // Audit log
    await AuditLog.create({
      action: 'GAUSHALA_APPROVED',
      actor: req.user._id,
      actorRole: 'SUPER_ADMIN',
      targetModel: 'Gaushala',
      targetId: gaushala._id,
      details: { gaushalaName: gaushala.name, registrationId: gaushala.registrationId }
    });

    // Notify Gaushala Owner
    await createNotification({
      recipientId: gaushala.owner,
      gaushalaId: gaushala._id,
      title: 'Gaushala Application Approved!',
      message: `Congratulations! ${gaushala.name} is now approved on GauAashray. You have full access to manage rescue, doctor requests and cows.`,
      type: 'GAUSHALA_APPROVAL',
      link: '/gaushala/dashboard'
    });

    res.status(200).json({
      success: true,
      message: `${gaushala.name} has been approved successfully.`,
      gaushala
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error approving application' });
  }
};

// @desc Reject Gaushala Application
// @route PUT /api/admin/applications/:id/reject
exports.rejectApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const app = await GaushalaApplication.findById(req.params.id).populate('gaushala');
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const gaushala = await Gaushala.findById(app.gaushala._id);
    gaushala.status = 'REJECTED';
    gaushala.rejectionReason = rejectionReason;
    await gaushala.save();

    app.status = 'REJECTED';
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();
    app.reviewNotes = rejectionReason;
    await app.save();

    await AuditLog.create({
      action: 'GAUSHALA_REJECTED',
      actor: req.user._id,
      actorRole: 'SUPER_ADMIN',
      targetModel: 'Gaushala',
      targetId: gaushala._id,
      details: { reason: rejectionReason }
    });

    // Notify owner
    await createNotification({
      recipientId: gaushala.owner,
      gaushalaId: gaushala._id,
      title: 'Gaushala Application Update',
      message: `Your application has not been approved. Reason: ${rejectionReason}`,
      type: 'APPLICATION_STATUS',
      link: '/application-status'
    });

    res.status(200).json({
      success: true,
      message: 'Application rejected with reason.',
      gaushala
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting application' });
  }
};

// @desc Request changes in Gaushala Application
// @route PUT /api/admin/applications/:id/request-changes
exports.requestChangesApplication = async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes) {
      return res.status(400).json({ success: false, message: 'Please specify the changes required.' });
    }

    const app = await GaushalaApplication.findById(req.params.id).populate('gaushala');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const gaushala = await Gaushala.findById(app.gaushala._id);
    gaushala.status = 'CHANGES_REQUIRED';
    gaushala.changesRequestedNotes = notes;
    await gaushala.save();

    app.status = 'CHANGES_REQUIRED';
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();
    app.reviewNotes = notes;
    await app.save();

    await createNotification({
      recipientId: gaushala.owner,
      title: 'Changes Requested on Application',
      message: `Please review requested updates: ${notes}`,
      type: 'APPLICATION_STATUS',
      link: '/application-status'
    });

    res.status(200).json({
      success: true,
      message: 'Changes requested from Gaushala owner.',
      gaushala
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error requesting changes' });
  }
};

// @desc Suspend or Reactivate Gaushala Organization
// @route PUT /api/admin/gaushalas/:id/status
exports.updateGaushalaStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'SUSPENDED' | 'APPROVED'
    const gaushala = await Gaushala.findById(req.params.id);
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    gaushala.status = status;
    await gaushala.save();

    // Update branches
    const isActive = status === 'APPROVED';
    await Branch.updateMany({ gaushala: gaushala._id }, { isActive });

    await AuditLog.create({
      action: status === 'SUSPENDED' ? 'GAUSHALA_SUSPENDED' : 'GAUSHALA_REACTIVATED',
      actor: req.user._id,
      actorRole: 'SUPER_ADMIN',
      targetModel: 'Gaushala',
      targetId: gaushala._id
    });

    res.status(200).json({
      success: true,
      message: `Gaushala status changed to ${status}`,
      gaushala
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
};

// @desc Get All Users for Admin
// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const filter = {};
    if (role && role !== 'ALL') filter.role = role;
    if (status && status !== 'ALL') filter.status = status;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .populate('gaushala', 'name city state registrationId status');

    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// @desc Update User (Edit name, phone, email, role, status, password)
// @route PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, email, role, status, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email !== undefined) user.email = email || null;
    if (role) user.role = role;
    if (status) user.status = status;
    if (newPassword && newPassword.length >= 6) {
      user.password = newPassword;
    }

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error updating user' });
  }
};

// @desc Delete User
// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'SUPER_ADMIN' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active super admin account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

// @desc Update Gaushala Details
// @route PUT /api/admin/gaushalas/:id
exports.updateGaushalaDetails = async (req, res) => {
  try {
    const { name, registrationId, address, city, state, pincode, totalCapacity, availableServices, status } = req.body;
    const gaushala = await Gaushala.findById(req.params.id);
    if (!gaushala) return res.status(404).json({ success: false, message: 'Gaushala not found' });

    if (name) gaushala.name = name;
    if (registrationId) gaushala.registrationId = registrationId;
    if (address) gaushala.address = address;
    if (city) gaushala.city = city;
    if (state) gaushala.state = state;
    if (pincode) gaushala.pincode = pincode;
    if (totalCapacity !== undefined) gaushala.totalCapacity = parseInt(totalCapacity);
    if (availableServices) gaushala.availableServices = availableServices;
    if (status) {
      gaushala.status = status;
      await Branch.updateMany({ gaushala: gaushala._id }, { isActive: status === 'APPROVED', isApproved: status === 'APPROVED' });
    }

    await gaushala.save();
    res.status(200).json({ success: true, message: 'Gaushala details updated successfully', gaushala });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Error updating Gaushala' });
  }
};

// @desc Get All Registered Gaushalas
// @route GET /api/admin/gaushalas
exports.getAllGaushalas = async (req, res) => {
  try {
    const gaushalas = await Gaushala.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'name phone email');

    const detailed = await Promise.all(
      gaushalas.map(async (g) => {
        const branchCount = await Branch.countDocuments({ gaushala: g._id });
        const cowCount = await Cow.countDocuments({ gaushala: g._id, healthCondition: { $ne: 'DECEASED' } });
        const doctorCount = await Doctor.countDocuments({ gaushala: g._id, isActive: true });
        return {
          ...g.toObject(),
          branchCount,
          cowCount,
          doctorCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: detailed.length,
      gaushalas: detailed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching Gaushalas' });
  }
};

// @desc Get All Platform Requests (Rescue, Medical, Surrender)
// @route GET /api/admin/requests
exports.getAllRequests = async (req, res) => {
  try {
    const { type = 'RESCUE' } = req.query;

    if (type === 'RESCUE') {
      const requests = await RescueRequest.find()
        .sort({ createdAt: -1 })
        .populate('assignedGaushala', 'name city')
        .populate('assignedBranch', 'name');
      return res.status(200).json({ success: true, count: requests.length, requests });
    } else if (type === 'MEDICAL') {
      const requests = await MedicalRequest.find()
        .sort({ createdAt: -1 })
        .populate('assignedGaushala', 'name city')
        .populate('assignedDoctor', 'name phone');
      return res.status(200).json({ success: true, count: requests.length, requests });
    } else if (type === 'SURRENDER') {
      const requests = await SurrenderRequest.find()
        .sort({ createdAt: -1 })
        .populate('assignedGaushala', 'name city')
        .populate('assignedBranch', 'name');
      return res.status(200).json({ success: true, count: requests.length, requests });
    }

    res.status(400).json({ success: false, message: 'Invalid request type' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
};

// @desc Get Network Map Data (All branches & active incidents)
// @route GET /api/admin/map
exports.getNetworkMapData = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true, isApproved: true })
      .populate('gaushala', 'name status currentCows totalCapacity');

    const activeRescues = await RescueRequest.find({
      status: { $nin: ['Completed', 'Cancelled'] }
    }).select('trackingId cowCondition urgency addressText location status createdAt');

    res.status(200).json({
      success: true,
      branches: branches.map(b => ({
        id: b._id,
        name: b.name,
        gaushalaName: b.gaushala ? b.gaushala.name : '',
        coordinates: b.location.coordinates,
        services: b.availableServices,
        operatingHours: b.operatingHours,
        totalCapacity: b.totalCapacity,
        currentCows: b.currentCows
      })),
      incidents: activeRescues.map(r => ({
        id: r._id,
        trackingId: r.trackingId,
        condition: r.cowCondition,
        urgency: r.urgency,
        address: r.addressText,
        coordinates: r.location.coordinates,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching network map data' });
  }
};

// @desc Get Platform Complaints
// @route GET /api/admin/complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate('gaushala', 'name')
      .populate('branch', 'name');

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching complaints' });
  }
};

// @desc Update Complaint Status
// @route PUT /api/admin/complaints/:id
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (status) complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (status === 'RESOLVED') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = req.user._id;
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated',
      complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating complaint' });
  }
};

// @desc Platform Analytics
// @route GET /api/admin/analytics
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const cityAgg = await Gaushala.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const conditionAgg = await RescueRequest.aggregate([
      { $group: { _id: '$cowCondition', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const [totalRescued, totalSheltered, totalVisits, totalSurrendered] = await Promise.all([
      RescueRequest.countDocuments({ status: { $in: ['Rescued', 'Received at Gaushala', 'Completed'] } }),
      Cow.countDocuments(),
      MedicalRequest.countDocuments({ status: 'Visit Completed' }),
      SurrenderRequest.countDocuments({ status: { $in: ['Received', 'Completed'] } })
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalRescued,
        totalSheltered,
        totalVisits,
        totalSurrendered,
        cityDistribution: cityAgg,
        conditionDistribution: conditionAgg
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error compiling analytics' });
  }
};

