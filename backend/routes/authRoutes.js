const express = require('express');
const router = express.Router();
const {
  registerPublicUser,
  registerGaushalaOwner,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  deleteAvatar,
  switchRole
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/public', registerPublicUser);
router.post('/register/gaushala', registerGaushalaOwner);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.delete('/avatar', protect, deleteAvatar);
router.put('/switch-role', protect, switchRole);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

