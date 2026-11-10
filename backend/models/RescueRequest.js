const mongoose = require('mongoose');

const rescueRequestSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reporterName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true
    },
    reporterPhone: {
      type: String,
      required: [true, 'Please provide contact number'],
      trim: true
    },
    cowCondition: {
      type: String,
      enum: [
        'Injured',
        'Sick',
        'Abandoned',
        'Wandering',
        'Healthy but unattended',
        'Accident case',
        'Other'
      ],
      required: true
    },
    urgency: {
      type: String,
      enum: ['Normal', 'Critical Emergency'],
      default: 'Normal'
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    photographs: [{
      type: String,
      required: true
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
      required: [true, 'Please provide location address or landmark']
    },
    landmark: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'Reported',
        'Under Verification',
        'Assigned',
        'Team Dispatched',
        'On The Way',
        'Rescued',
        'Transporting',
        'Received at Gaushala',
        'Completed',
        'Cancelled'
      ],
      default: 'Reported',
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
    assignedTeam: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeamMember'
    }],
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null
    },
    rejectionLogs: [{
      gaushala: { type: mongoose.Schema.Types.ObjectId, ref: 'Gaushala' },
      reason: String,
      rejectedAt: { type: Date, default: Date.now }
    }],
    statusHistory: [{
      status: String,
      note: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedByName: String,
      timestamp: { type: Date, default: Date.now }
    }],
    resolutionNotes: {
      type: String,
      default: ''
    },
    createdCowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      default: null
    }
  },
  { timestamps: true }
);

rescueRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RescueRequest', rescueRequestSchema);

