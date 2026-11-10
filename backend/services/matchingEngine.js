const Branch = require('../models/Branch');
const Gaushala = require('../models/Gaushala');
const Doctor = require('../models/Doctor');
const RescueTeamMember = require('../models/RescueTeamMember');
const RequestAssignment = require('../models/RequestAssignment');
const { calculateDistanceKm } = require('../utils/geo');

/**
 * Find and rank suitable nearby Gaushala branches for incoming request
 * @param {Object} options
 * @param {Array<Number>} options.coordinates - [longitude, latitude]
 * @param {String} options.serviceType - 'RESCUE' | 'VETERINARY' | 'SURRENDER'
 * @param {Number} [options.maxDistanceKm=50] - Search radius in kilometers
 * @param {Boolean} [options.requireCapacity=false] - For shelter intake / surrender
 * @param {Array<String>} [options.excludeGaushalaIds=[]] - Avoid reassignment to declined branches
 */
const findMatchingBranches = async ({
  coordinates,
  serviceType,
  maxDistanceKm = 100,
  requireCapacity = false,
  excludeGaushalaIds = []
}) => {
  const [lng, lat] = coordinates;

  // Find branches within maxDistanceKm using MongoDB $geoNear / $nearSphere
  const maxDistanceMeters = maxDistanceKm * 1000;

  // Search active and approved branches offering the requested service
  const query = {
    isActive: true,
    isApproved: true,
    availableServices: serviceType,
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistanceMeters
      }
    }
  };

  if (excludeGaushalaIds.length > 0) {
    query.gaushala = { $nin: excludeGaushalaIds };
  }

  const candidateBranches = await Branch.find(query).populate('gaushala');

  // Filter candidates whose parent organization is approved
  const validCandidates = [];

  for (const branch of candidateBranches) {
    if (!branch.gaushala || branch.gaushala.status !== 'APPROVED') {
      continue;
    }

    // Check capacity if shelter intake is required
    const availableSlots = (branch.totalCapacity || 50) - (branch.currentCows || 0);
    if (requireCapacity && availableSlots <= 0) {
      continue;
    }

    // Compute actual distance
    const bLng = branch.location.coordinates[0];
    const bLat = branch.location.coordinates[1];
    const distanceKm = calculateDistanceKm(lat, lng, bLat, bLng);

    // Resource availability checks
    let resourceScore = 1;
    let resourceDetails = {};

    if (serviceType === 'RESCUE') {
      const activeRescueMembers = await RescueTeamMember.countDocuments({
        assignedBranch: branch._id,
        isAvailable: true
      });
      resourceDetails.activeRescueMembers = activeRescueMembers;
      if (activeRescueMembers > 0) resourceScore += 2;
    } else if (serviceType === 'VETERINARY') {
      const activeDoctors = await Doctor.countDocuments({
        assignedBranch: branch._id,
        availabilityStatus: 'AVAILABLE',
        isActive: true
      });
      resourceDetails.activeDoctors = activeDoctors;
      if (activeDoctors > 0) resourceScore += 2;
    }

    validCandidates.push({
      branch,
      gaushala: branch.gaushala,
      distanceKm,
      availableSlots,
      resourceScore,
      resourceDetails
    });
  }

  // Sort candidates by distance and resource score
  validCandidates.sort((a, b) => {
    // If distance is within 5km, favor better resource score
    if (Math.abs(a.distanceKm - b.distanceKm) < 5) {
      return b.resourceScore - a.resourceScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  return validCandidates;
};

module.exports = {
  findMatchingBranches
};

