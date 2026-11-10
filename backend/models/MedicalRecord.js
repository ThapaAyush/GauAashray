const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    medicalRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRequest',
      default: null,
      index: true
    },
    cow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      default: null,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
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
    diagnosis: {
      type: String,
      required: [true, 'Please provide clinical diagnosis']
    },
    treatment: {
      type: String,
      required: [true, 'Please provide administered treatment details']
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true }, // e.g. Twice daily
        duration: { type: String, required: true } // e.g. 5 days
      }
    ],
    vaccinationGiven: {
      type: String,
      default: ''
    },
    prescriptionNotes: {
      type: String,
      default: ''
    },
    followUpDate: {
      type: Date,
      default: null
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

