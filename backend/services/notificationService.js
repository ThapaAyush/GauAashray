const Notification = require('../models/Notification');
const { emitToUser, emitToGaushala, emitToAdmin } = require('../config/socket');

const createNotification = async ({
  recipientId,
  title,
  message,
  type = 'ALERT',
  link = '',
  metadata = {},
  gaushalaId = null,
  notifyAdmin = false
}) => {
  try {
    let notification = null;
    if (recipientId) {
      notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        link,
        metadata
      });

      // Realtime push to recipient
      emitToUser(recipientId.toString(), 'new_notification', notification);
    }

    if (gaushalaId) {
      emitToGaushala(gaushalaId.toString(), 'gaushala_alert', {
        title,
        message,
        type,
        link,
        metadata,
        createdAt: new Date()
      });
    }

    if (notifyAdmin) {
      emitToAdmin('admin_alert', {
        title,
        message,
        type,
        link,
        metadata,
        createdAt: new Date()
      });
    }

    // Check external SMS / WhatsApp configuration
    if (process.env.WHATSAPP_API_KEY) {
      // Configured WhatsApp provider
      console.log(`[WHATSAPP DISPATCH] To recipient: ${title} - ${message}`);
    } else {
      // Not configured fallback
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  createNotification
};

