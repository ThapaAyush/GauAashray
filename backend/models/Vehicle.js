const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
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
    vehicleNumber: {
      type: String,
      required: [true, 'Please provide vehicle registration number'],
      uppercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['AMBULANCE', 'TRUCK', 'RESCUE_VAN', 'PICKUP'],
      default: 'RESCUE_VAN'
    },
    capacity: {
      type: Number,
      default: 2,
      comment: 'Number of cows it can transport'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeamMember',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);

