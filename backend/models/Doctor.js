const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
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
      required: [true, 'Please provide doctor name'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide doctor phone number'],
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    photo: {
      type: String,
      default: ''
    },
    qualification: {
      type: String,
      required: [true, 'Please provide qualification (e.g. B.V.Sc & A.H)'],
      trim: true
    },
    registrationNumber: {
      type: String,
      default: '',
      trim: true
    },
    specialization: {
      type: String,
      default: 'General Veterinary Medicine'
    },
    workingHours: {
      type: String,
      default: '09:00 AM - 06:00 PM'
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'ON_LEAVE', 'BUSY'],
      default: 'AVAILABLE'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);

