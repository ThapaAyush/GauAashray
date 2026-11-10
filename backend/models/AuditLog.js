const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    actorRole: {
      type: String,
      default: 'SYSTEM'
    },
    targetModel: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

