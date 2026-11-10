const MedicalRequest = require('../models/MedicalRequest');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const { findMatchingBranches } = require('../services/matchingEngine');
const {
  broadcastToNearestGaushalas,
  claimBroadcastRequest,
  declineBroadcastRequest
} = require('../services/broadcastService');
const { createNotification } = require('../services/notificationService');
const { calculateDistanceKm } = require('../utils/geo');

const generateMedicalId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MED-${new Date().getFullYear()}-${random}`;
};

// @desc Submit Veterinary Doctor Request
// @route POST /api/medical
exports.createMedicalRequest = async (req, res) => {
  try {
    const {
      ownerName,
      ownerPhone,
      cowName,
      cowAge,
      symptoms,
      problemDescription,
      urgency,
      photographs,
      latitude,
      longitude,
      addressText
    } = req.body;

    if (!ownerName || !ownerPhone || !symptoms || !addressText) {
      return res.status(400).json({
        success: false,
        message: 'Owner name, contact phone, symptoms and address are required.'
      });
    }

    const lat = parseFloat(latitude) || 28.6139;
    const lng = parseFloat(longitude) || 77.2090;

    let photos = [];
    if (Array.isArray(photographs)) photos = photographs;
    else if (photographs) photos = [photographs];

    const requestId = generateMedicalId();

    const medicalRequest = await MedicalRequest.create({
      requestId,
      owner: req.user ? req.user._id : null,
      ownerName,
      ownerPhone,
      cowName: cowName || 'My Cow',
      cowAge: cowAge || 'Not specified',
      symptoms,
      problemDescription: problemDescription || '',
      urgency: urgency || 'Normal',
      photographs: photos,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      addressText,
      status: 'New',
      statusHistory: [
        {
          status: 'New',
          note: 'Veterinary care request submitted by cow owner',
          updatedByName: ownerName,
          timestamp: new Date()
        }
      ]
    });

    // Broadcast to up to 5 distinct nearest Gaushalas with VETERINARY service
    const topMatches = await broadcastToNearestGaushalas({
      requestDoc: medicalRequest,
      serviceType: 'VETERINARY',
      coordinates: [lng, lat],
      maxDistanceKm: 80,
      isCritical: urgency === 'Emergency',
      requestType: 'VETERINARY',
      trackingField: 'requestId'
    });

    if (req.user) {
      await createNotification({
        recipientId: req.user._id,
        title: 'Doctor Request Submitted',
        message: `Your request ID is ${requestId}. Broadcasted to ${topMatches.length} nearest veterinary clinics for fastest confirmation.`,
        type: 'DOCTOR_UPDATE',
        link: '/my-requests'
      });
    }

    res.status(201).json({
      success: true,
      message: `Veterinary request submitted and broadcasted to ${topMatches.length} nearest Gaushalas.`,
      requestId,
      medicalRequest,
      broadcastCount: topMatches.length
    });
  } catch (error) {
    console.error('Doctor request creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating doctor request'
    });
  }
};

// @desc Get user's own doctor requests
// @route GET /api/medical/my-requests
exports.getMyMedicalRequests = async (req, res) => {
  try {
    const requests = await MedicalRequest.find({
      $or: [{ owner: req.user._id }, { ownerPhone: req.user.phone }]
    })
      .sort({ createdAt: -1 })
      .populate('assignedGaushala', 'name phone state city')
      .populate('assignedDoctor', 'name phone specialization qualification');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching doctor requests' });
  }
};

// @desc Get doctor requests for Gaushala (both assigned and active broadcast offers)
// @route GET /api/medical/gaushala/requests
exports.getMedicalRequestsForGaushala = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const { status } = req.query;

    let queryFilter = {};

    if (status === 'BROADCAST') {
      queryFilter = {
        assignedGaushala: null,
        status: { $in: ['New', 'Contacted'] },
        broadcastedGaushalas: {
          $elemMatch: {
            gaushala: gaushala._id,
            status: 'PENDING'
          }
        }
      };
    } else if (status && status !== 'ALL') {
      queryFilter = { assignedGaushala: gaushala._id, status };
    } else {
      queryFilter = {
        $or: [
          { assignedGaushala: gaushala._id },
          {
            assignedGaushala: null,
            status: { $in: ['New', 'Contacted'] },
            broadcastedGaushalas: {
              $elemMatch: {
                gaushala: gaushala._id,
                status: 'PENDING'
              }
            }
          }
        ]
      };
    }

    const requests = await MedicalRequest.find(queryFilter)
      .sort({ createdAt: -1 })
      .populate('assignedBranch')
      .populate('assignedDoctor')
      .populate('broadcastedGaushalas.gaushala', 'name city state');

    const mapped = requests.map((r) => {
      const isBroadcast = !r.assignedGaushala;
      const myBroadcast = (r.broadcastedGaushalas || []).find(
        (b) => b.gaushala && (b.gaushala._id || b.gaushala).toString() === gaushala._id.toString()
      );

      return {
        ...r.toObject(),
        isBroadcast,
        isFastResponseQueue: isBroadcast,
        broadcastDistanceKm: myBroadcast?.distanceKm || null,
        broadcastTotal: r.broadcastedGaushalas?.length || 0
      };
    });

    res.status(200).json({
      success: true,
      count: mapped.length,
      requests: mapped
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
};

// @desc Accept Doctor Request (First to Accept claims the request)
// @route PUT /api/medical/:id/accept
exports.acceptMedicalRequest = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const claimResult = await claimBroadcastRequest({
      Model: MedicalRequest,
      requestId: req.params.id,
      gaushala,
      branchId: req.body?.branchId || null,
      user: req.user,
      acceptedStatus: 'Accepted'
    });

    if (!claimResult.success) {
      return res.status(claimResult.statusCode || 400).json(claimResult);
    }

    res.status(200).json({
      success: true,
      message: 'Doctor request accepted! Please assign a veterinary doctor.',
      medicalRequest: claimResult.request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error accepting medical request' });
  }
};

// @desc Reject Doctor Request (Declines for this shelter, leaves others active)
// @route PUT /api/medical/:id/reject
exports.rejectMedicalRequest = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const declineResult = await declineBroadcastRequest({
      Model: MedicalRequest,
      requestId: req.params.id,
      gaushala,
      reason: reason || 'Declined by clinic'
    });

    if (!declineResult.success) {
      return res.status(declineResult.statusCode || 400).json(declineResult);
    }

    res.status(200).json({
      success: true,
      message: 'Request declined and removed from your queue.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error declining medical request' });
  }
};

// @desc Assign Doctor and Schedule Visit
// @route POST /api/medical/:id/assign-doctor
exports.assignDoctor = async (req, res) => {
  try {
    const { doctorId, scheduledDate, scheduledTimeSlot, note } = req.body;
    const gaushala = await Gaushala.findOne({ owner: req.user._id });

    // If not yet claimed, claim it now
    let request = await MedicalRequest.findOne({ _id: req.params.id });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Doctor request not found' });
    }

    if (!request.assignedGaushala) {
      const claimResult = await claimBroadcastRequest({
        Model: MedicalRequest,
        requestId: req.params.id,
        gaushala,
        branchId: null,
        user: req.user,
        acceptedStatus: 'Accepted'
      });
      if (!claimResult.success) {
        return res.status(claimResult.statusCode || 400).json(claimResult);
      }
      request = claimResult.request;
    } else if (request.assignedGaushala.toString() !== gaushala._id.toString()) {
      return res.status(403).json({ success: false, message: 'This request belongs to another Gaushala.' });
    }

    const doctor = await Doctor.findOne({ _id: doctorId, gaushala: gaushala._id });
    if (!doctor) {
      return res.status(400).json({ success: false, message: 'Selected doctor is not registered in this organization.' });
    }

    request.assignedDoctor = doctor._id;
    request.status = 'Doctor Assigned';
    if (scheduledDate) {
      request.scheduledDate = new Date(scheduledDate);
      request.scheduledTimeSlot = scheduledTimeSlot || '10:00 AM - 01:00 PM';
      request.status = 'Scheduled';
    }

    request.statusHistory.push({
      status: request.status,
      note: note || `Assigned Dr. ${doctor.name} (${doctor.qualification}) for visit on ${scheduledDate || 'upcoming slot'}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      timestamp: new Date()
    });
    await request.save();

    // Create Appointment Record
    await Appointment.create({
      medicalRequest: request._id,
      gaushala: gaushala._id,
      branch: request.assignedBranch || doctor.assignedBranch,
      doctor: doctor._id,
      customerName: request.ownerName,
      customerPhone: request.ownerPhone,
      cowName: request.cowName,
      scheduledDate: request.scheduledDate || new Date(),
      timeSlot: request.scheduledTimeSlot || '10:00 AM - 01:00 PM',
      locationAddress: request.addressText,
      status: 'SCHEDULED'
    });

    // Notify cow owner
    if (request.owner) {
      await createNotification({
        recipientId: request.owner,
        title: 'Doctor Assigned to Your Request',
        message: `Dr. ${doctor.name} from ${gaushala.name} is scheduled to attend to "${request.cowName}".`,
        type: 'DOCTOR_UPDATE',
        link: '/my-requests'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor assigned and appointment scheduled',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error assigning doctor' });
  }
};

// @desc Update Doctor Request Status
// @route PUT /api/medical/:id/status
exports.updateMedicalStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const gaushala = await Gaushala.findOne({ owner: req.user._id });

    const request = await MedicalRequest.findOne({ _id: req.params.id, assignedGaushala: gaushala._id });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    request.statusHistory.push({
      status,
      note: note || `Status changed to ${status}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      timestamp: new Date()
    });
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Status updated',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
};

// @desc Create Medical Record after visit
// @route POST /api/medical/:id/records
exports.createMedicalRecord = async (req, res) => {
  try {
    const {
      doctorId,
      diagnosis,
      treatment,
      medicines,
      vaccinationGiven,
      prescriptionNotes,
      followUpDate
    } = req.body;

    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    const request = await MedicalRequest.findOne({ _id: req.params.id, assignedGaushala: gaushala._id });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (!diagnosis || !treatment) {
      return res.status(400).json({
        success: false,
        message: 'Clinical diagnosis and treatment notes are required.'
      });
    }

    const doctor = await Doctor.findById(doctorId || request.assignedDoctor);
    if (!doctor) {
      return res.status(400).json({ success: false, message: 'Valid doctor must be assigned to sign medical record.' });
    }

    const record = await MedicalRecord.create({
      medicalRequestId: request._id,
      doctor: doctor._id,
      gaushala: gaushala._id,
      branch: request.assignedBranch || doctor.assignedBranch,
      diagnosis,
      treatment,
      medicines: Array.isArray(medicines) ? medicines : [],
      vaccinationGiven: vaccinationGiven || '',
      prescriptionNotes: prescriptionNotes || '',
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      isPrivate: true
    });

    // Mark request completed
    request.status = 'Visit Completed';
    request.statusHistory.push({
      status: 'Visit Completed',
      note: `Clinical visit completed by Dr. ${doctor.name}. Medical record logged.`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      timestamp: new Date()
    });
    await request.save();

    // Mark appointment completed
    await Appointment.updateMany(
      { medicalRequest: request._id },
      { status: 'VISIT_COMPLETED', doctorNotes: diagnosis }
    );

    // Notify owner
    if (request.owner) {
      await createNotification({
        recipientId: request.owner,
        title: 'Doctor Visit Completed',
        message: `Dr. ${doctor.name} has concluded the visit for "${request.cowName}". Follow treatment advice carefully.`,
        type: 'DOCTOR_UPDATE',
        link: '/my-requests'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Medical record created and visit completed successfully',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating medical record' });
  }
};

// @desc Get Medical Records for a request or Gaushala
// @route GET /api/medical/records
exports.getMedicalRecords = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const records = await MedicalRecord.find({ gaushala: gaushala._id })
      .sort({ createdAt: -1 })
      .populate('doctor', 'name qualification phone specialization')
      .populate('medicalRequestId')
      .populate('branch', 'name');

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching medical records' });
  }
};

