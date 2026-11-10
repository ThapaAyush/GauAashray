const Notification = require('../models/Notification');

// @desc Get Notifications for logged in user
// @route GET /api/notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

// @desc Mark Notification as Read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

// @desc Mark All Notifications as Read
// @route PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
};

