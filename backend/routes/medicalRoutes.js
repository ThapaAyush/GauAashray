const express = require('express');
const router = express.Router();
const {
  createMedicalRequest,
  getMyMedicalRequests,
  getMedicalRequestsForGaushala,
  acceptMedicalRequest,
  rejectMedicalRequest,
  assignDoctor,
  updateMedicalStatus,
  createMedicalRecord,
  getMedicalRecords
} = require('../controllers/medicalController');
const { protect, requireApprovedGaushala } = require('../middleware/auth');

router.post('/', (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return protect(req, res, next);
  }
  next();
}, createMedicalRequest);

router.get('/my-requests', protect, getMyMedicalRequests);

router.get('/gaushala/requests', protect, requireApprovedGaushala, getMedicalRequestsForGaushala);
router.put('/:id/accept', protect, requireApprovedGaushala, acceptMedicalRequest);
router.put('/:id/reject', protect, requireApprovedGaushala, rejectMedicalRequest);
router.post('/:id/assign-doctor', protect, requireApprovedGaushala, assignDoctor);
router.put('/:id/status', protect, requireApprovedGaushala, updateMedicalStatus);
router.post('/:id/records', protect, requireApprovedGaushala, createMedicalRecord);
router.get('/records', protect, requireApprovedGaushala, getMedicalRecords);

module.exports = router;

