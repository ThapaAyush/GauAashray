const express = require('express');
const router = express.Router();
const {
  createSurrenderRequest,
  getMySurrenderRequests,
  getSurrenderRequestsForGaushala,
  acceptSurrenderRequest,
  rejectSurrenderRequest,
  updateSurrenderStatus
} = require('../controllers/surrenderController');
const { protect, requireApprovedGaushala } = require('../middleware/auth');

router.post('/', (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return protect(req, res, next);
  }
  next();
}, createSurrenderRequest);

router.get('/my-requests', protect, getMySurrenderRequests);
router.get('/gaushala/requests', protect, requireApprovedGaushala, getSurrenderRequestsForGaushala);
router.put('/:id/accept', protect, requireApprovedGaushala, acceptSurrenderRequest);
router.put('/:id/reject', protect, requireApprovedGaushala, rejectSurrenderRequest);
router.put('/:id/status', protect, requireApprovedGaushala, updateSurrenderStatus);

module.exports = router;

