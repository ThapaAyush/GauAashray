const mongoose = require('mongoose');

const surrenderRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true
    },
    ownerPhone: {
      type: String,
      required: [true, 'Please provide contact number'],
      trim: true
    },
    cowName: {
      type: String,
      default: 'Unnamed Cow'
    },
    breed: {
      type: String,
      default: 'Desi'
    },
    approximateAge: {
      type: String,
      default: ''
    },
    healthCondition: {
      type: String,
      default: 'Healthy'
    },
    reason: {
      type: String,
      enum: [
        'Unable to maintain',
        'Financial difficulty',
        'Health or age-related difficulty',
        'Relocation',
        'Other'
      ],
      required: true
    },
    numberOfCows: {
      type: Number,
      default: 1
    },
    photographs: [{
      type: String
    }],
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
    addressText: {
      type: String,
      required: true
    },
    ownershipConfirmed: {
      type: Boolean,
      required: true,
      default: false
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Contacted',
        'Inspection Required',
        'Approved',
        'Pickup Scheduled',
        'In Transit',
        'Received',
        'Completed',
        'Rejected'
      ],
      default: 'Submitted',
      index: true
    },
    assignedGaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      default: null,
      index: true
    },
    assignedBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true
    },
    broadcastedGaushalas: [{
      gaushala: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gaushala'
      },
      branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
      },
      distanceKm: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'DECLINED'],
        default: 'PENDING'
      },
      offeredAt: {
        type: Date,
        default: Date.now
      }
    }],
    rejectionReason: {
      type: String,
      default: ''
    },
    pickupDate: Date,
    inspectionNotes: {
      type: String,
      default: ''
    },
    registeredCow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      default: null
    },
    statusHistory: [{
      status: String,
      note: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedByName: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

surrenderRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SurrenderRequest', surrenderRequestSchema);

