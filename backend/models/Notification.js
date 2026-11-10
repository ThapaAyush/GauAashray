const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'RESCUE_UPDATE',
        'DOCTOR_UPDATE',
        'SURRENDER_UPDATE',
        'GAUSHALA_APPROVAL',
        'APPLICATION_STATUS',
        'NEW_REQUEST',
        'APPOINTMENT_SCHEDULED',
        'ALERT'
      ],
      default: 'ALERT'
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

