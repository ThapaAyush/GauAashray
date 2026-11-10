const mongoose = require('mongoose');

const medicalRequestSchema = new mongoose.Schema(
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
    cowAge: {
      type: String,
      default: 'Unknown'
    },
    symptoms: {
      type: String,
      required: [true, 'Please describe symptoms']
    },
    problemDescription: {
      type: String,
      default: ''
    },
    urgency: {
      type: String,
      enum: ['Emergency', 'Urgent', 'Normal'],
      default: 'Normal'
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
    status: {
      type: String,
      enum: [
        'New',
        'Contacted',
        'Accepted',
        'Doctor Assigned',
        'Scheduled',
        'On The Way',
        'Visit Completed',
        'Cancelled'
      ],
      default: 'New',
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
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    },
    scheduledDate: Date,
    scheduledTimeSlot: String,
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

medicalRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('MedicalRequest', medicalRequestSchema);

