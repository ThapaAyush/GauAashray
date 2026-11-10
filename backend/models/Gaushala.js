const mongoose = require('mongoose');

const gaushalaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide Gaushala name'],
      trim: true
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    registrationId: {
      type: String,
      trim: true,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUIRED', 'SUSPENDED'],
      default: 'PENDING'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    changesRequestedNotes: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      required: [true, 'Please provide full address']
    },
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [77.2090, 28.6139]
      }
    },
    photographs: [{
      type: String
    }],
    documents: [{
      title: String,
      url: String
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
      enum: ['RESCUE', 'VETERINARY', 'SURRENDER', 'AMBULANCE']
    }],
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

gaushalaSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Gaushala', gaushalaSchema);

