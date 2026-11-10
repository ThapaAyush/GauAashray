const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth unread count endpoint (never 401s on guest or background poll)
router.get('/unread-count', async (req, res) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(200).json({ success: true, unreadCount: 0 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const count = await Notification.countDocuments({ recipient: decoded.id, isRead: false });
    return res.status(200).json({ success: true, unreadCount: count });
  } catch (err) {
    return res.status(200).json({ success: true, unreadCount: 0 });
  }
});

router.use(protect);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;

