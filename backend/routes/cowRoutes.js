const express = require('express');
const router = express.Router();
const {
  getCows,
  getCowById,
  createCow,
  updateCow,
  transferCowBranch,
  markCowDeceased
} = require('../controllers/cowController');
const { protect, requireApprovedGaushala } = require('../middleware/auth');

router.use(protect, requireApprovedGaushala);

router.get('/', getCows);
router.get('/:id', getCowById);
router.post('/', createCow);
router.put('/:id', updateCow);
router.put('/:id/transfer', transferCowBranch);
router.put('/:id/deceased', markCowDeceased);

module.exports = router;

