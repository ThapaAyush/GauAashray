const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  getVehicles,
  createVehicle,
  updateVehicle
} = require('../controllers/teamController');
const { protect, requireApprovedGaushala } = require('../middleware/auth');

router.use(protect, requireApprovedGaushala);

router.get('/members', getTeamMembers);
router.post('/members', createTeamMember);
router.put('/members/:id', updateTeamMember);

router.get('/vehicles', getVehicles);
router.post('/vehicles', createVehicle);
router.put('/vehicles/:id', updateVehicle);

module.exports = router;

