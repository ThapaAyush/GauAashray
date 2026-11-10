const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complainant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    complainantName: {
      type: String,
      required: true
    },
    complainantPhone: {
      type: String,
      required: true
    },
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      default: null
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null
    },
    category: {
      type: String,
      enum: [
        'Delayed Rescue',
        'Incorrect Information',
        'Misconduct',
        'Rejected Service',
        'Other'
      ],
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);

