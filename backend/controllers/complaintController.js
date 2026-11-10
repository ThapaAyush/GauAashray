const Complaint = require('../models/Complaint');
const { createNotification } = require('../services/notificationService');

// @desc Submit Complaint
// @route POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { category, subject, description, gaushalaId, branchId } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, message: 'Category, subject and description are required' });
    }

    const complaint = await Complaint.create({
      complainant: req.user._id,
      complainantName: req.user.name,
      complainantPhone: req.user.phone,
      category,
      subject,
      description,
      gaushala: gaushalaId || null,
      branch: branchId || null,
      status: 'OPEN'
    });

    // Notify Super Admin
    await createNotification({
      recipientId: null,
      notifyAdmin: true,
      title: 'New Citizen Complaint Lodged',
      message: `${req.user.name} lodged a complaint: "${subject}" (${category})`,
      type: 'ALERT',
      link: '/admin/complaints'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted to administration for review.',
      complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting complaint' });
  }
};

// @desc Get My Complaints
// @route GET /api/complaints/my
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ complainant: req.user._id })
      .sort({ createdAt: -1 })
      .populate('gaushala', 'name');

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching complaints' });
  }
};

