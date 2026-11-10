const RescueRequest = require('../models/RescueRequest');
const RequestAssignment = require('../models/RequestAssignment');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const Cow = require('../models/Cow');
const RescueTeamMember = require('../models/RescueTeamMember');
const Vehicle = require('../models/Vehicle');
const MedicalRequest = require('../models/MedicalRequest');
const SurrenderRequest = require('../models/SurrenderRequest');
const Doctor = require('../models/Doctor');
const { findMatchingBranches } = require('../services/matchingEngine');
const {
  broadcastToNearestGaushalas,
  claimBroadcastRequest,
  declineBroadcastRequest
} = require('../services/broadcastService');
const { createNotification } = require('../services/notificationService');
const { calculateDistanceKm } = require('../utils/geo');

// Generate Unique Tracking ID
const generateTrackingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RSC-${new Date().getFullYear()}-${random}`;
};

// @desc Submit Street Cow Rescue Report
// @route POST /api/rescue
exports.createRescueReport = async (req, res) => {
  try {
    const {
      reporterName,
      reporterPhone,
      cowCondition,
      urgency,
      description,
      photographs,
      latitude,
      longitude,
      addressText,
      landmark
    } = req.body;

    if (!reporterName || !reporterPhone || !cowCondition || !addressText) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact number, cow condition and address are required.'
      });
    }

    const lat = parseFloat(latitude) || 28.6139;
    const lng = parseFloat(longitude) || 77.2090;

    let photos = [];
    if (Array.isArray(photographs)) {
      photos = photographs;
    } else if (photographs) {
      photos = [photographs];
    }

    if (photos.length === 0) {
      // Default clean placeholder if none uploaded
      photos = ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'];
    }

    const trackingId = generateTrackingId();

    const isCritical = urgency === 'Critical Emergency' || cowCondition === 'Accident case' || cowCondition === 'Injured';

    // 1. Save Request
    const rescueRequest = await RescueRequest.create({
      trackingId,
      reporter: req.user ? req.user._id : null,
      reporterName,
      reporterPhone,
      cowCondition,
      urgency: isCritical ? 'Critical Emergency' : 'Normal',
      description: description || '',
      photographs: photos,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      addressText,
      landmark: landmark || '',
      status: 'Reported',
      statusHistory: [
        {
          status: 'Reported',
          note: 'Rescue incident submitted by citizen reporter',
          updatedByName: reporterName,
          timestamp: new Date()
        }
      ]
    });

    // 2. Broadcast Engine: Distribute to up to 5 distinct nearest approved Gaushalas
    const topMatches = await broadcastToNearestGaushalas({
      requestDoc: rescueRequest,
      serviceType: 'RESCUE',
      coordinates: [lng, lat],
      maxDistanceKm: 100,
      isCritical,
      requestType: 'RESCUE',
      trackingField: 'trackingId'
    });

    // Alert Super Admin if Critical Emergency
    if (isCritical) {
      await createNotification({
        recipientId: null,
        notifyAdmin: true,
        title: 'EMERGENCY: Cow Accident / Critical Injury Reported',
        message: `High urgency case reported at ${addressText}. Tracking: ${trackingId}`,
        type: 'ALERT',
        link: '/admin/requests'
      });
    }

    // Also notify reporter if logged in
    if (req.user) {
      await createNotification({
        recipientId: req.user._id,
        title: 'Cow Rescue Report Submitted',
        message: `Tracking ID: ${trackingId}. Broadcasted to ${topMatches.length} nearest shelters for fastest response.`,
        type: 'RESCUE_UPDATE',
        link: `/track-request?id=${trackingId}`
      });
    }

    res.status(201).json({
      success: true,
      message: `Rescue report submitted and broadcasted to ${topMatches.length} nearest Gaushalas.`,
      trackingId,
      rescueRequest,
      broadcastCount: topMatches.length,
      nearestShelters: topMatches.map((m) => ({
        gaushalaName: m.gaushala.name,
        branchName: m.branch.name,
        distanceKm: m.distanceKm
      }))
    });
  } catch (error) {
    console.error('Rescue creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating rescue report.'
    });
  }
};

// @desc Public Request Tracking (Masks reporter private details) - supports RESCUE, MEDICAL, and SURRENDER
// @route GET /api/rescue/track/:trackingId
exports.getRescueRequestByTrackingId = async (req, res) => {
  try {
    const rawId = req.params.trackingId || '';
    const cleanId = rawId.toUpperCase().trim();

    // 1. Try finding in RescueRequest
    const rescue = await RescueRequest.findOne({ trackingId: cleanId })
      .populate('assignedGaushala', 'name phone state city')
      .populate('assignedBranch', 'name phone address operatingHours')
      .populate('assignedTeam', 'name role isAvailable')
      .populate('assignedVehicle', 'vehicleNumber type')
      .populate('broadcastedGaushalas.gaushala', 'name city state phone')
      .populate('broadcastedGaushalas.branch', 'name phone');

    if (rescue) {
      const maskedPhone = rescue.reporterPhone ? rescue.reporterPhone.slice(0, 3) + '****' + rescue.reporterPhone.slice(-3) : '';
      const publicResponse = {
        type: 'RESCUE',
        trackingId: rescue.trackingId,
        cowCondition: rescue.cowCondition,
        urgency: rescue.urgency,
        description: rescue.description,
        photographs: rescue.photographs,
        cityArea: rescue.addressText ? rescue.addressText.split(',')[0] : '',
        landmark: rescue.landmark,
        addressText: rescue.addressText,
        status: rescue.status,
        assignedGaushala: rescue.assignedGaushala ? { name: rescue.assignedGaushala.name, city: rescue.assignedGaushala.city, phone: rescue.assignedGaushala.phone } : null,
        assignedBranch: rescue.assignedBranch ? { name: rescue.assignedBranch.name } : null,
        broadcastedGaushalas: (rescue.broadcastedGaushalas || []).map(b => ({
          gaushalaId: b.gaushala ? (b.gaushala._id || b.gaushala).toString() : null,
          gaushalaName: b.gaushala && b.gaushala.name ? b.gaushala.name : 'Registered Gaushala',
          city: b.gaushala ? b.gaushala.city : '',
          phone: b.gaushala ? b.gaushala.phone : '',
          branchName: b.branch && b.branch.name ? b.branch.name : null,
          distanceKm: b.distanceKm !== undefined && b.distanceKm !== null ? Number(b.distanceKm).toFixed(1) : null,
          status: b.status || 'PENDING'
        })),
        statusHistory: (rescue.statusHistory || []).map(h => ({
          status: h.status,
          note: h.note,
          timestamp: h.timestamp,
          updatedByName: h.updatedByName
        })),
        createdAt: rescue.createdAt,
        reporterName: rescue.reporterName,
        reporterPhoneMasked: maskedPhone
      };

      return res.status(200).json({
        success: true,
        rescue: publicResponse
      });
    }

    // 2. Try finding in MedicalRequest (Doctor Request)
    const medical = await MedicalRequest.findOne({ requestId: cleanId })
      .populate('assignedGaushala', 'name phone state city')
      .populate('assignedBranch', 'name phone address operatingHours')
      .populate('assignedDoctor', 'name qualification specialization experienceYears phone')
      .populate('broadcastedGaushalas.gaushala', 'name city state phone')
      .populate('broadcastedGaushalas.branch', 'name phone');

    if (medical) {
      const maskedPhone = medical.ownerPhone ? medical.ownerPhone.slice(0, 3) + '****' + medical.ownerPhone.slice(-3) : '';
      const publicResponse = {
        type: 'MEDICAL',
        trackingId: medical.requestId,
        cowName: medical.cowName,
        cowCondition: `Veterinary Care: ${medical.cowName} (${medical.cowAge || 'Age unspecified'})`,
        urgency: medical.urgency,
        description: medical.symptoms + (medical.problemDescription ? ` • ${medical.problemDescription}` : ''),
        photographs: medical.photographs,
        cityArea: medical.addressText ? medical.addressText.split(',')[0] : '',
        landmark: '',
        addressText: medical.addressText,
        status: medical.status,
        assignedGaushala: medical.assignedGaushala ? { name: medical.assignedGaushala.name, city: medical.assignedGaushala.city, phone: medical.assignedGaushala.phone } : null,
        assignedBranch: medical.assignedBranch ? { name: medical.assignedBranch.name } : null,
        assignedDoctor: medical.assignedDoctor ? {
          name: medical.assignedDoctor.name,
          specialization: medical.assignedDoctor.specialization || medical.assignedDoctor.qualification
        } : null,
        scheduledDate: medical.scheduledDate,
        scheduledTimeSlot: medical.scheduledTimeSlot,
        broadcastedGaushalas: (medical.broadcastedGaushalas || []).map(b => ({
          gaushalaId: b.gaushala ? (b.gaushala._id || b.gaushala).toString() : null,
          gaushalaName: b.gaushala && b.gaushala.name ? b.gaushala.name : 'Registered Gaushala',
          city: b.gaushala ? b.gaushala.city : '',
          phone: b.gaushala ? b.gaushala.phone : '',
          branchName: b.branch && b.branch.name ? b.branch.name : null,
          distanceKm: b.distanceKm !== undefined && b.distanceKm !== null ? Number(b.distanceKm).toFixed(1) : null,
          status: b.status || 'PENDING'
        })),
        statusHistory: (medical.statusHistory || []).map(h => ({
          status: h.status,
          note: h.note,
          timestamp: h.timestamp,
          updatedByName: h.updatedByName
        })),
        createdAt: medical.createdAt,
        reporterName: medical.ownerName,
        reporterPhoneMasked: maskedPhone
      };

      return res.status(200).json({
        success: true,
        rescue: publicResponse
      });
    }

    // 3. Try finding in SurrenderRequest
    const surrender = await SurrenderRequest.findOne({ requestId: cleanId })
      .populate('assignedGaushala', 'name phone state city')
      .populate('assignedBranch', 'name phone address operatingHours')
      .populate('broadcastedGaushalas.gaushala', 'name city state phone')
      .populate('broadcastedGaushalas.branch', 'name phone');

    if (surrender) {
      const maskedPhone = surrender.ownerPhone ? surrender.ownerPhone.slice(0, 3) + '****' + surrender.ownerPhone.slice(-3) : '';
      const publicResponse = {
        type: 'SURRENDER',
        trackingId: surrender.requestId,
        cowName: surrender.cowName,
        cowCondition: `Cow Surrender: ${surrender.cowName} (${surrender.breed}, ${surrender.healthCondition || 'Healthy'})`,
        urgency: 'Normal',
        description: `Reason: ${surrender.reason}${surrender.approximateAge ? ` • Age: ${surrender.approximateAge}` : ''}${surrender.numberOfCows > 1 ? ` • Quantity: ${surrender.numberOfCows} cows` : ''}`,
        photographs: surrender.photographs,
        cityArea: surrender.addressText ? surrender.addressText.split(',')[0] : '',
        landmark: '',
        addressText: surrender.addressText,
        status: surrender.status,
        assignedGaushala: surrender.assignedGaushala ? { name: surrender.assignedGaushala.name, city: surrender.assignedGaushala.city, phone: surrender.assignedGaushala.phone } : null,
        assignedBranch: surrender.assignedBranch ? { name: surrender.assignedBranch.name } : null,
        pickupDate: surrender.pickupDate,
        broadcastedGaushalas: (surrender.broadcastedGaushalas || []).map(b => ({
          gaushalaId: b.gaushala ? (b.gaushala._id || b.gaushala).toString() : null,
          gaushalaName: b.gaushala && b.gaushala.name ? b.gaushala.name : 'Registered Gaushala',
          city: b.gaushala ? b.gaushala.city : '',
          phone: b.gaushala ? b.gaushala.phone : '',
          branchName: b.branch && b.branch.name ? b.branch.name : null,
          distanceKm: b.distanceKm !== undefined && b.distanceKm !== null ? Number(b.distanceKm).toFixed(1) : null,
          status: b.status || 'PENDING'
        })),
        statusHistory: (surrender.statusHistory || []).map(h => ({
          status: h.status,
          note: h.note,
          timestamp: h.timestamp,
          updatedByName: h.updatedByName
        })),
        createdAt: surrender.createdAt,
        reporterName: surrender.ownerName,
        reporterPhoneMasked: maskedPhone
      };

      return res.status(200).json({
        success: true,
        rescue: publicResponse
      });
    }

    return res.status(404).json({
      success: false,
      message: 'No rescue, medical, or surrender request found for this tracking ID.'
    });
  } catch (error) {
    console.error('Error tracking request:', error);
    res.status(500).json({ success: false, message: 'Server error tracking request' });
  }
};

// @desc Get user's own rescue requests
// @route GET /api/rescue/my-requests
exports.getMyRescueRequests = async (req, res) => {
  try {
    const requests = await RescueRequest.find({
      $or: [
        { reporter: req.user._id },
        { reporterPhone: req.user.phone }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('assignedGaushala', 'name city state')
      .populate('assignedBranch', 'name phone');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
};

// @desc Get Rescue Requests for Gaushala Dashboard (both assigned and broadcast offers)
// @route GET /api/rescue/gaushala/requests
exports.getRescueRequestsForGaushala = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const { status, branchId } = req.query;

    let queryFilter = {};

    if (status === 'BROADCAST') {
      queryFilter = {
        assignedGaushala: null,
        status: { $in: ['Reported', 'Under Verification'] },
        broadcastedGaushalas: {
          $elemMatch: {
            gaushala: gaushala._id,
            status: 'PENDING'
          }
        }
      };
    } else if (status && status !== 'ALL') {
      queryFilter = {
        assignedGaushala: gaushala._id,
        status
      };
      if (branchId) {
        queryFilter.assignedBranch = branchId;
      }
    } else {
      // ALL requests: both assigned to this gaushala + active broadcast offers
      queryFilter = {
        $or: [
          { assignedGaushala: gaushala._id },
          {
            assignedGaushala: null,
            status: { $in: ['Reported', 'Under Verification'] },
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

    const requests = await RescueRequest.find(queryFilter)
      .sort({ createdAt: -1 })
      .populate('assignedBranch')
      .populate('assignedTeam')
      .populate('assignedVehicle')
      .populate('broadcastedGaushalas.gaushala', 'name city state');

    // Attach computed distance and broadcast flags
    const mapped = requests.map((r) => {
      const isBroadcast = !r.assignedGaushala;
      const myBroadcast = (r.broadcastedGaushalas || []).find(
        (b) => b.gaushala && (b.gaushala._id || b.gaushala).toString() === gaushala._id.toString()
      );

      let distanceKm = myBroadcast?.distanceKm || null;

      if (!distanceKm && r.assignedBranch && r.assignedBranch.location && r.location) {
        distanceKm = calculateDistanceKm(
          r.location.coordinates[1],
          r.location.coordinates[0],
          r.assignedBranch.location.coordinates[1],
          r.assignedBranch.location.coordinates[0]
        );
      }

      return {
        ...r.toObject(),
        isBroadcast,
        isFastResponseQueue: isBroadcast,
        myBroadcastStatus: myBroadcast?.status || (r.assignedGaushala ? 'ASSIGNED' : 'NONE'),
        broadcastDistanceKm: distanceKm,
        broadcastTotal: r.broadcastedGaushalas?.length || 0,
        calculatedDistanceKm: distanceKm
      };
    });

    res.status(200).json({
      success: true,
      count: mapped.length,
      requests: mapped
    });
  } catch (error) {
    console.error('Error fetching Gaushala rescue requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching Gaushala rescue requests' });
  }
};

// @desc Accept Rescue Request (First to Accept claims the request, removes from others)
// @route PUT /api/rescue/:id/accept
exports.acceptRescueRequest = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const { branchId } = req.body || {};

    const claimResult = await claimBroadcastRequest({
      Model: RescueRequest,
      requestId: req.params.id,
      gaushala,
      branchId,
      user: req.user,
      acceptedStatus: 'Assigned'
    });

    if (!claimResult.success) {
      return res.status(claimResult.statusCode || 400).json(claimResult);
    }

    res.status(200).json({
      success: true,
      message: 'Rescue request claimed successfully! Your team has been assigned.',
      rescue: claimResult.request
    });
  } catch (error) {
    console.error('Error accepting rescue request:', error);
    res.status(500).json({ success: false, message: error.message || 'Error accepting rescue request' });
  }
};

// @desc Decline Rescue Request (Removes from this Gaushala's side; other 4 remain eligible)
// @route PUT /api/rescue/:id/reject
exports.rejectRescueRequest = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const declineResult = await declineBroadcastRequest({
      Model: RescueRequest,
      requestId: req.params.id,
      gaushala,
      reason: reason || 'Declined by shelter'
    });

    if (!declineResult.success) {
      return res.status(declineResult.statusCode || 400).json(declineResult);
    }

    res.status(200).json({
      success: true,
      message: 'Request declined and removed from your queue.'
    });
  } catch (error) {
    console.error('Error declining rescue request:', error);
    res.status(500).json({ success: false, message: error.message || 'Error declining rescue request' });
  }
};

// @desc Update Rescue Status & Assignments
// @route PUT /api/rescue/:id/status
exports.updateRescueStatus = async (req, res) => {
  try {
    const { status, note, teamMemberIds, vehicleId, cowName, breed } = req.body;
    const gaushala = await Gaushala.findOne({ owner: req.user._id });

    let rescue;
    if (req.user.role === 'SUPER_ADMIN') {
      rescue = await RescueRequest.findById(req.params.id);
    } else {
      if (!gaushala) {
        return res.status(403).json({ success: false, message: 'No registered Gaushala found for this account.' });
      }
      rescue = await RescueRequest.findOne({ _id: req.params.id, assignedGaushala: gaushala._id });
    }

    if (!rescue) {
      return res.status(404).json({ success: false, message: 'Rescue request not found' });
    }

    if (status) rescue.status = status;
    if (Array.isArray(teamMemberIds)) rescue.assignedTeam = teamMemberIds;
    if (vehicleId) rescue.assignedVehicle = vehicleId;

    rescue.statusHistory.push({
      status: status || rescue.status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      timestamp: new Date()
    });

    // If status reached 'Received at Gaushala' or 'Completed' and cow not yet created in cow db
    if ((status === 'Received at Gaushala' || status === 'Completed') && !rescue.createdCowId) {
      const cowId = await Cow.generateUniqueId();

      let assignedBranch = rescue.assignedBranch;
      if (!assignedBranch && rescue.assignedGaushala) {
        const defaultBranch = await Branch.findOne({ gaushala: rescue.assignedGaushala });
        if (defaultBranch) {
          assignedBranch = defaultBranch._id;
          rescue.assignedBranch = defaultBranch._id;
        }
      }
      
      const newCow = await Cow.create({
        cowId,
        name: cowName || `Rescued Cow (${rescue.trackingId})`,
        breed: breed || 'Desi / Indigenous',
        gender: 'COW',
        photographs: rescue.photographs,
        arrivalDate: new Date(),
        source: 'RESCUE',
        sourceRequestId: rescue.trackingId,
        healthCondition: rescue.cowCondition === 'Injured' ? 'IN_TREATMENT' : 'HEALTHY',
        gaushala: rescue.assignedGaushala,
        currentBranch: assignedBranch,
        notes: `Rescued from ${rescue.addressText}. Condition on arrival: ${rescue.cowCondition}. Description: ${rescue.description}`
      });

      rescue.createdCowId = newCow._id;

      // Update branch cow count
      if (assignedBranch) {
        await Branch.findByIdAndUpdate(assignedBranch, { $inc: { currentCows: 1 } });
      }
      if (rescue.assignedGaushala) {
        await Gaushala.findByIdAndUpdate(rescue.assignedGaushala, { $inc: { currentCows: 1 } });
      }
    }

    await rescue.save();

    // Notify Reporter of status update
    if (rescue.reporter) {
      await createNotification({
        recipientId: rescue.reporter,
        title: `Rescue Update: ${rescue.trackingId}`,
        message: `Status is now '${rescue.status}'. ${note || ''}`,
        type: 'RESCUE_UPDATE',
        link: `/track-request?id=${rescue.trackingId}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rescue status updated successfully',
      rescue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating rescue status' });
  }
};

