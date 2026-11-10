const { findMatchingBranches } = require('./matchingEngine');
const RequestAssignment = require('../models/RequestAssignment');
const { createNotification } = require('./notificationService');
const { emitToGaushala, emitToUser, emitToAdmin } = require('../config/socket');

/**
 * Distribute an incoming request to up to 5 distinct nearest approved Gaushalas
 */
const broadcastToNearestGaushalas = async ({
  requestDoc,
  serviceType,
  coordinates,
  maxDistanceKm = 100,
  requireCapacity = false,
  isCritical = false,
  requestType = 'RESCUE',
  trackingField = 'trackingId'
}) => {
  const matches = await findMatchingBranches({
    coordinates,
    serviceType,
    maxDistanceKm,
    requireCapacity
  });

  // Pick up to 5 distinct nearest Gaushalas
  const seenGaushalas = new Set();
  const topMatches = [];

  for (const m of matches) {
    if (!m.gaushala || !m.gaushala._id) continue;
    const gId = m.gaushala._id.toString();
    if (!seenGaushalas.has(gId)) {
      seenGaushalas.add(gId);
      topMatches.push(m);
      if (topMatches.length >= 5) break;
    }
  }

  const trackingId = requestDoc[trackingField] || requestDoc.trackingId || requestDoc.requestId;

  if (topMatches.length === 0) {
    // Alert Super Admin that no nearby Gaushala was within radius
    await createNotification({
      recipientId: null,
      notifyAdmin: true,
      title: `No Nearby Shelter within ${maxDistanceKm}km`,
      message: `${requestType} request #${trackingId} has no registered Gaushala in range. Manual assignment required.`,
      type: 'ALERT',
      link: '/admin/requests'
    });
    return [];
  }

  // Populate broadcastedGaushalas array on document
  requestDoc.broadcastedGaushalas = topMatches.map((m) => ({
    gaushala: m.gaushala._id,
    branch: m.branch._id,
    distanceKm: m.distanceKm,
    status: 'PENDING',
    offeredAt: new Date()
  }));

  // Leave assignedGaushala null until first Gaushala accepts
  requestDoc.assignedGaushala = null;
  requestDoc.assignedBranch = null;

  if (requestDoc.statusHistory) {
    requestDoc.statusHistory.push({
      status: requestDoc.status,
      note: `Broadcasted simultaneously to ${topMatches.length} nearest registered Gaushalas. First to accept will be assigned.`,
      updatedByName: '5-Gaushala Broadcast Engine',
      timestamp: new Date()
    });
  }

  await requestDoc.save();

  // Create Assignment offer & notify each of the 5 Gaushalas
  for (const m of topMatches) {
    const gaushalaId = m.gaushala._id;
    const branchId = m.branch._id;

    await RequestAssignment.create({
      requestType,
      requestId: requestDoc._id,
      requestModel:
        requestType === 'RESCUE'
          ? 'RescueRequest'
          : (requestType === 'VETERINARY' || requestType === 'MEDICAL')
          ? 'MedicalRequest'
          : 'SurrenderRequest',
      gaushala: gaushalaId,
      branch: branchId,
      distanceKm: m.distanceKm,
      status: 'OFFERED'
    });

    const notifTitle = isCritical
      ? '⚡ CRITICAL EMERGENCY: Street Cow Rescue'
      : `⚡ Fast Response Alert: New ${requestType === 'RESCUE' ? 'Rescue' : requestType === 'VETERINARY' ? 'Doctor' : 'Surrender'} Broadcast`;

    const notifMsg = `Incident reported ~${m.distanceKm} km away. Broadcasted to 5 nearest shelters. First to accept gets assigned. Tracking: ${trackingId}`;

    await createNotification({
      recipientId: m.gaushala.owner,
      gaushalaId,
      title: notifTitle,
      message: notifMsg,
      type: 'NEW_REQUEST',
      link: '/gaushala/requests',
      metadata: { trackingId, requestId: requestDoc._id, requestType }
    });

    // Real-time socket event to the Gaushala room
    emitToGaushala(gaushalaId, 'new_broadcast_request', {
      requestType,
      requestId: requestDoc._id,
      trackingId,
      distanceKm: m.distanceKm,
      urgency: requestDoc.urgency || 'Normal',
      condition: requestDoc.cowCondition || requestDoc.symptoms || requestDoc.reason,
      addressText: requestDoc.addressText,
      photographs: requestDoc.photographs || [],
      createdAt: requestDoc.createdAt,
      broadcastCount: topMatches.length
    });
  }

  return topMatches;
};

/**
 * First to accept claim logic
 * Atomically assigns to the accepting Gaushala and marks the remaining 4 as EXPIRED
 */
const claimBroadcastRequest = async ({
  Model,
  requestId,
  gaushala,
  branchId,
  user,
  acceptedStatus = 'Assigned'
}) => {
  const gaushalaId = gaushala._id;

  // 1. Check if already claimed
  const existingDoc = await Model.findById(requestId).populate('assignedGaushala', 'name');
  if (!existingDoc) {
    return { success: false, statusCode: 404, message: 'Request not found' };
  }

  if (
    existingDoc.assignedGaushala &&
    existingDoc.assignedGaushala._id.toString() !== gaushalaId.toString()
  ) {
    return {
      success: false,
      statusCode: 409,
      alreadyClaimed: true,
      claimedBy: existingDoc.assignedGaushala.name,
      message: `This request was already accepted by ${existingDoc.assignedGaushala.name}.`
    };
  }

  // 2. Resolve branch to assign
  const targetBranchId =
    branchId ||
    existingDoc.broadcastedGaushalas?.find(
      (b) => b.gaushala?.toString() === gaushalaId.toString()
    )?.branch ||
    null;

  // 3. Atomic update
  const updatedDoc = await Model.findOneAndUpdate(
    {
      _id: requestId,
      $or: [
        { assignedGaushala: null },
        { assignedGaushala: gaushalaId }
      ]
    },
    {
      $set: {
        assignedGaushala: gaushalaId,
        ...(targetBranchId ? { assignedBranch: targetBranchId } : {}),
        status: acceptedStatus,
        'broadcastedGaushalas.$[acceptedItem].status': 'ACCEPTED',
        'broadcastedGaushalas.$[otherItems].status': 'EXPIRED'
      },
      $push: {
        statusHistory: {
          status: acceptedStatus,
          note: `Accepted by ${gaushala.name}. Request assigned exclusively to this Gaushala.`,
          updatedBy: user._id,
          updatedByName: user.name,
          timestamp: new Date()
        }
      }
    },
    {
      arrayFilters: [
        { 'acceptedItem.gaushala': gaushalaId },
        { 'otherItems.gaushala': { $ne: gaushalaId } }
      ],
      new: true
    }
  );

  if (!updatedDoc) {
    const recheck = await Model.findById(requestId).populate('assignedGaushala', 'name');
    return {
      success: false,
      statusCode: 409,
      alreadyClaimed: true,
      claimedBy: recheck?.assignedGaushala?.name || 'Another Gaushala',
      message: `Request was already accepted by ${recheck?.assignedGaushala?.name || 'another shelter'}.`
    };
  }

  const trackingId = updatedDoc.trackingId || updatedDoc.requestId;

  // 4. Update assignments in database
  await RequestAssignment.updateMany(
    { requestId: updatedDoc._id, gaushala: gaushalaId },
    { status: 'ACCEPTED', acceptedAt: new Date() }
  );

  await RequestAssignment.updateMany(
    { requestId: updatedDoc._id, gaushala: { $ne: gaushalaId } },
    { status: 'EXPIRED' }
  );

  // 5. Notify the other 4 Gaushalas via real-time WebSocket to REMOVE the request from their UI
  const otherGaushalas = (updatedDoc.broadcastedGaushalas || []).filter(
    (b) => b.gaushala && b.gaushala.toString() !== gaushalaId.toString()
  );

  for (const other of otherGaushalas) {
    emitToGaushala(other.gaushala, 'broadcast_request_claimed', {
      requestId: updatedDoc._id,
      trackingId,
      claimedBy: gaushala.name,
      message: `Request ${trackingId} was accepted by ${gaushala.name}.`
    });
  }

  // 6. Notify user / reporter
  const reporterId = updatedDoc.reporter || updatedDoc.owner;
  if (reporterId) {
    emitToUser(reporterId, 'request_accepted', {
      requestId: updatedDoc._id,
      trackingId,
      gaushalaName: gaushala.name,
      status: acceptedStatus
    });

    await createNotification({
      recipientId: reporterId,
      title: 'Request Accepted by Gaushala!',
      message: `${gaushala.name} has accepted your cow request (${trackingId}) and is preparing action.`,
      type: 'RESCUE_UPDATE',
      link: `/track-request?id=${trackingId}`
    });
  }

  return {
    success: true,
    request: updatedDoc,
    claimedBy: gaushala.name
  };
};

/**
 * Decline a broadcast request from a single Gaushala
 */
const declineBroadcastRequest = async ({ Model, requestId, gaushala, reason = 'Declined by shelter' }) => {
  const gaushalaId = gaushala._id;

  const doc = await Model.findOneAndUpdate(
    {
      _id: requestId,
      'broadcastedGaushalas.gaushala': gaushalaId
    },
    {
      $set: {
        'broadcastedGaushalas.$.status': 'DECLINED'
      },
      $push: {
        rejectionLogs: {
          gaushala: gaushalaId,
          reason,
          rejectedAt: new Date()
        }
      }
    },
    { new: true }
  );

  if (!doc) {
    return { success: false, statusCode: 404, message: 'Request not found or not broadcasted to your Gaushala' };
  }

  await RequestAssignment.updateMany(
    { requestId: doc._id, gaushala: gaushalaId },
    { status: 'DECLINED', declineReason: reason }
  );

  // Notify this Gaushala client to remove the card immediately
  emitToGaushala(gaushalaId, 'broadcast_request_declined', {
    requestId: doc._id,
    trackingId: doc.trackingId || doc.requestId
  });

  // Check if ALL broadcasted Gaushalas declined
  const allDeclinedOrExpired = doc.broadcastedGaushalas.every(
    (b) => b.status === 'DECLINED' || b.status === 'EXPIRED'
  );

  if (allDeclinedOrExpired && !doc.assignedGaushala) {
    await createNotification({
      recipientId: null,
      notifyAdmin: true,
      title: 'All 5 Broadcasted Shelters Declined Request',
      message: `All nearby Gaushalas declined or missed request #${doc.trackingId || doc.requestId}. Please assign manually.`,
      type: 'ALERT',
      link: '/admin/requests'
    });
  }

  return { success: true, message: 'Request declined and removed from your queue.' };
};

module.exports = {
  broadcastToNearestGaushalas,
  claimBroadcastRequest,
  declineBroadcastRequest
};

