const SurrenderRequest = require('../models/SurrenderRequest');
const Cow = require('../models/Cow');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const { findMatchingBranches } = require('../services/matchingEngine');
const {
  broadcastToNearestGaushalas,
  claimBroadcastRequest,
  declineBroadcastRequest
} = require('../services/broadcastService');
const { createNotification } = require('../services/notificationService');

const generateSurrenderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SUR-${new Date().getFullYear()}-${random}`;
};

// @desc Submit Cow Surrender Request
// @route POST /api/surrender
exports.createSurrenderRequest = async (req, res) => {
  try {
    const {
      ownerName,
      ownerPhone,
      cowName,
      breed,
      approximateAge,
      healthCondition,
      reason,
      numberOfCows,
      photographs,
      latitude,
      longitude,
      addressText,
      ownershipConfirmed
    } = req.body;

    if (!ownerName || !ownerPhone || !reason || !addressText || !ownershipConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Owner name, phone, reason, address and ownership confirmation are required.'
      });
    }

    const lat = parseFloat(latitude) || 28.6139;
    const lng = parseFloat(longitude) || 77.2090;

    let photos = [];
    if (Array.isArray(photographs)) photos = photographs;
    else if (photographs) photos = [photographs];

    const requestId = generateSurrenderId();

    const surrenderRequest = await SurrenderRequest.create({
      requestId,
      owner: req.user ? req.user._id : null,
      ownerName,
      ownerPhone,
      cowName: cowName || 'Unnamed Cow',
      breed: breed || 'Desi',
      approximateAge: approximateAge || '',
      healthCondition: healthCondition || 'Healthy',
      reason,
      numberOfCows: parseInt(numberOfCows) || 1,
      photographs: photos,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      addressText,
      ownershipConfirmed: true,
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          note: 'Surrender application submitted by owner',
          updatedByName: ownerName,
          timestamp: new Date()
        }
      ]
    });

    // Broadcast to up to 5 distinct nearest Gaushalas with SURRENDER service and capacity
    const topMatches = await broadcastToNearestGaushalas({
      requestDoc: surrenderRequest,
      serviceType: 'SURRENDER',
      coordinates: [lng, lat],
      requireCapacity: true,
      maxDistanceKm: 100,
      isCritical: false,
      requestType: 'SURRENDER',
      trackingField: 'requestId'
    });

    if (req.user) {
      await createNotification({
        recipientId: req.user._id,
        title: 'Surrender Application Submitted',
        message: `Request ID: ${requestId}. Broadcasted to ${topMatches.length} nearest Gaushalas with shelter capacity.`,
        type: 'SURRENDER_UPDATE',
        link: '/my-requests'
      });
    }

    res.status(201).json({
      success: true,
      message: `Surrender application submitted and broadcasted to ${topMatches.length} nearest Gaushalas.`,
      requestId,
      surrenderRequest,
      broadcastCount: topMatches.length
    });
  } catch (error) {
    console.error('Surrender error:', error);
    res.status(500).json({ success: false, message: 'Server error creating surrender request' });
  }
};

// @desc Get user's own surrender requests
// @route GET /api/surrender/my-requests
exports.getMySurrenderRequests = async (req, res) => {
  try {
    const requests = await SurrenderRequest.find({
      $or: [{ owner: req.user._id }, { ownerPhone: req.user.phone }]
    })
      .sort({ createdAt: -1 })
      .populate('assignedGaushala', 'name phone state city')
      .populate('assignedBranch', 'name phone');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching surrender requests' });
  }
};

// @desc Get surrender requests for Gaushala (both assigned and active broadcast offers)
// @route GET /api/surrender/gaushala/requests
exports.getSurrenderRequestsForGaushala = async (req, res) => {
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
        status: { $in: ['Submitted', 'Under Review'] },
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
            status: { $in: ['Submitted', 'Under Review'] },
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

    const requests = await SurrenderRequest.find(queryFilter)
      .sort({ createdAt: -1 })
      .populate('assignedBranch')
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

// @desc Accept Surrender Request (First to Accept claims the request)
// @route PUT /api/surrender/:id/accept
exports.acceptSurrenderRequest = async (req, res) => {
  try {
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const claimResult = await claimBroadcastRequest({
      Model: SurrenderRequest,
      requestId: req.params.id,
      gaushala,
      branchId: req.body?.branchId || null,
      user: req.user,
      acceptedStatus: 'Under Review'
    });

    if (!claimResult.success) {
      return res.status(claimResult.statusCode || 400).json(claimResult);
    }

    res.status(200).json({
      success: true,
      message: 'Surrender application accepted! You may now review and schedule intake.',
      surrenderRequest: claimResult.request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error accepting surrender request' });
  }
};

// @desc Decline Surrender Request
// @route PUT /api/surrender/:id/reject-broadcast
exports.rejectSurrenderRequest = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const gaushala = await Gaushala.findOne({ owner: req.user._id });
    if (!gaushala) {
      return res.status(404).json({ success: false, message: 'Gaushala not found' });
    }

    const declineResult = await declineBroadcastRequest({
      Model: SurrenderRequest,
      requestId: req.params.id,
      gaushala,
      reason: reason || 'Declined due to shelter capacity'
    });

    if (!declineResult.success) {
      return res.status(declineResult.statusCode || 400).json(declineResult);
    }

    res.status(200).json({
      success: true,
      message: 'Surrender application declined and removed from your queue.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error declining surrender request' });
  }
};

// @desc Review & Update Surrender Status (Approve, Reject, Schedule Pickup, Receive)
// @route PUT /api/surrender/:id/status
exports.updateSurrenderStatus = async (req, res) => {
  try {
    const { status, note, rejectionReason, pickupDate, inspectionNotes, branchId } = req.body;
    const gaushala = await Gaushala.findOne({ owner: req.user._id });

    const surrender = await SurrenderRequest.findOne({ _id: req.params.id, assignedGaushala: gaushala._id });
    if (!surrender) {
      return res.status(404).json({ success: false, message: 'Surrender request not found' });
    }

    if (status) surrender.status = status;
    if (rejectionReason) surrender.rejectionReason = rejectionReason;
    if (pickupDate) surrender.pickupDate = new Date(pickupDate);
    if (inspectionNotes) surrender.inspectionNotes = inspectionNotes;
    if (branchId) surrender.assignedBranch = branchId;

    surrender.statusHistory.push({
      status: status || surrender.status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      timestamp: new Date()
    });

    // If status reached 'Received' or 'Completed' and cow not yet registered
    if ((status === 'Received' || status === 'Completed') && !surrender.registeredCow) {
      const cowId = await Cow.generateUniqueId();

      let assignedBranch = surrender.assignedBranch;
      if (!assignedBranch) {
        const defaultBranch = await Branch.findOne({ gaushala: gaushala._id });
        if (defaultBranch) {
          assignedBranch = defaultBranch._id;
          surrender.assignedBranch = defaultBranch._id;
        }
      }

      const newCow = await Cow.create({
        cowId,
        name: surrender.cowName || `Surrendered Cow (${surrender.requestId})`,
        breed: surrender.breed || 'Desi',
        gender: 'COW',
        photographs: surrender.photographs,
        arrivalDate: new Date(),
        source: 'SURRENDER',
        sourceRequestId: surrender.requestId,
        healthCondition: surrender.healthCondition === 'Sick' ? 'IN_TREATMENT' : 'HEALTHY',
        gaushala: gaushala._id,
        currentBranch: assignedBranch,
        notes: `Surrendered by ${surrender.ownerName} (${surrender.ownerPhone}). Reason: ${surrender.reason}. Prior notes: ${surrender.inspectionNotes}`
      });

      surrender.registeredCow = newCow._id;

      // Increment cow counts
      if (assignedBranch) {
        await Branch.findByIdAndUpdate(assignedBranch, { $inc: { currentCows: 1 } });
      }
      await Gaushala.findByIdAndUpdate(gaushala._id, { $inc: { currentCows: 1 } });
    }

    await surrender.save();

    // Notify owner
    if (surrender.owner) {
      await createNotification({
        recipientId: surrender.owner,
        title: `Surrender Update: ${surrender.requestId}`,
        message: `Status is now: ${surrender.status}. ${note || ''}`,
        type: 'SURRENDER_UPDATE',
        link: '/my-requests'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Surrender request updated successfully',
      surrender
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating surrender' });
  }
};

