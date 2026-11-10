const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    medicalRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRequest',
      required: true,
      index: true
    },
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      required: true,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    cowName: {
      type: String,
      default: ''
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      default: '10:00 AM - 12:00 PM'
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ON_THE_WAY', 'VISIT_COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED'
    },
    locationAddress: {
      type: String,
      required: true
    },
    doctorNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

