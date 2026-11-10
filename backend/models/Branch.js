const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      required: true,
      index: true
    },
    branchId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please provide branch name'],
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    photographs: [{
      type: String
    }],
    totalCapacity: {
      type: Number,
      default: 50
    },
    currentCows: {
      type: Number,
      default: 0
    },
    availableServices: [{
      type: String,
      enum: ['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE'],
      default: ['RESCUE', 'VETERINARY']
    }],
    operatingHours: {
      type: String,
      default: '24/7 Emergency Service'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

branchSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Branch', branchSchema);

