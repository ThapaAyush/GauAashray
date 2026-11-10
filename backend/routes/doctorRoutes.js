const express = require('express');
const router = express.Router();
const {
  getDoctors,
  createDoctor,
  updateDoctor,
  getAppointments
} = require('../controllers/doctorController');
const { protect, requireApprovedGaushala } = require('../middleware/auth');

router.use(protect, requireApprovedGaushala);

router.get('/', getDoctors);
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.get('/appointments', getAppointments);

module.exports = router;

