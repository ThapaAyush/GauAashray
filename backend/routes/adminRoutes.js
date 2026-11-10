const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getApplications,
  approveApplication,
  rejectApplication,
  requestChangesApplication,
  updateGaushalaStatus,
  updateGaushalaDetails,
  getAllGaushalas,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllRequests,
  getNetworkMapData,
  getComplaints,
  updateComplaintStatus,
  getPlatformAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('SUPER_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/applications', getApplications);
router.put('/applications/:id/approve', approveApplication);
router.put('/applications/:id/reject', rejectApplication);
router.put('/applications/:id/request-changes', requestChangesApplication);

// Gaushala management
router.get('/gaushalas', getAllGaushalas);
router.put('/gaushalas/:id', updateGaushalaDetails);
router.put('/gaushalas/:id/status', updateGaushalaStatus);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Requests, Complaints, Analytics
router.get('/requests', getAllRequests);
router.get('/map', getNetworkMapData);
router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaintStatus);
router.get('/analytics', getPlatformAnalytics);

module.exports = router;

