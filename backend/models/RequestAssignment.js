const mongoose = require('mongoose');

const requestAssignmentSchema = new mongoose.Schema(
  {
    requestType: {
      type: String,
      enum: ['RESCUE', 'MEDICAL', 'VETERINARY', 'SURRENDER'],
      required: true
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'requestModel'
    },
    requestModel: {
      type: String,
      required: true,
      enum: ['RescueRequest', 'MedicalRequest', 'SurrenderRequest']
    },
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    distanceKm: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['OFFERED', 'ACCEPTED', 'DECLINED', 'TIMED_OUT', 'REASSIGNED'],
      default: 'OFFERED'
    },
    offeredAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date,
    declineReason: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('RequestAssignment', requestAssignmentSchema);

