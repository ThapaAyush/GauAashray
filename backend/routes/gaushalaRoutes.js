const express = require('express');
const router = express.Router();
const {
  getMyGaushalaProfile,
  updateMyGaushalaProfile,
  getMyBranches,
  createBranch,
  updateBranch,
  getNearbyGaushalas,
  getPublicDirectory,
  getGaushalaStats,
  registerExistingUserGaushala
} = require('../controllers/gaushalaController');
const { protect, authorize, requireApprovedGaushala } = require('../middleware/auth');

// Public directory & nearby routes
router.get('/directory', getPublicDirectory);
router.get('/nearby', getNearbyGaushalas);

// Gaushala Owner Protected Routes
router.post('/register-existing', protect, registerExistingUserGaushala);
router.get('/my-profile', protect, getMyGaushalaProfile);
router.put('/my-profile', protect, authorize('GAUSHALA_OWNER'), updateMyGaushalaProfile);
router.get('/my-branches', protect, authorize('GAUSHALA_OWNER'), getMyBranches);
router.post('/branches', protect, authorize('GAUSHALA_OWNER'), createBranch);
router.put('/branches/:id', protect, authorize('GAUSHALA_OWNER'), updateBranch);
router.get('/stats', protect, requireApprovedGaushala, getGaushalaStats);

module.exports = router;

