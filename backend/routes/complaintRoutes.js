const express = require('express');
const router = express.Router();
const { createComplaint, getMyComplaints } = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createComplaint);
router.get('/my', getMyComplaints);

module.exports = router;

