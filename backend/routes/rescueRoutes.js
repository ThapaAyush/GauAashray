const express = require('express');
const router = express.Router();
const {
  createRescueReport,
  getRescueRequestByTrackingId,
  getMyRescueRequests,
  getRescueRequestsForGaushala,
  acceptRescueRequest,
  rejectRescueRequest,
  updateRescueStatus
} = require('../controllers/rescueController');
const { protect, authorize, requireApprovedGaushala } = require('../middleware/auth');

// Public endpoints (anyone can report or track)
router.post('/', (req, res, next) => {
  // Optional auth
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return protect(req, res, next);
  }
  next();
}, createRescueReport);

router.get('/track/:trackingId', getRescueRequestByTrackingId);

// User requests
router.get('/my-requests', protect, getMyRescueRequests);

// Gaushala management
router.get('/gaushala/requests', protect, requireApprovedGaushala, getRescueRequestsForGaushala);
router.put('/:id/accept', protect, requireApprovedGaushala, acceptRescueRequest);
router.put('/:id/reject', protect, requireApprovedGaushala, rejectRescueRequest);
router.put('/:id/status', protect, requireApprovedGaushala, updateRescueStatus);

module.exports = router;

