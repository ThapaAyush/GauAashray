const mongoose = require('mongoose');

const gaushalaApplicationSchema = new mongoose.Schema(
  {
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      required: true,
      index: true
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
    documents: [{
      title: String,
      url: String,
      verified: { type: Boolean, default: false }
    }],
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('GaushalaApplication', gaushalaApplicationSchema);

