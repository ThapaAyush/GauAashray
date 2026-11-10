const mongoose = require('mongoose');

const rescueTeamMemberSchema = new mongoose.Schema(
  {
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      required: true,
      index: true
    },
    assignedBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide team member name'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true
    },
    photo: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['RESCUE_MANAGER', 'RESCUE_WORKER', 'DRIVER', 'TRANSPORT_STAFF'],
      default: 'RESCUE_WORKER'
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RescueTeamMember', rescueTeamMemberSchema);

