const mongoose = require('mongoose');

const cowSchema = new mongoose.Schema(
  {
    cowId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      default: 'Unnamed Cow',
      trim: true
    },
    breed: {
      type: String,
      default: 'Desi / Indigenous',
      trim: true
    },
    gender: {
      type: String,
      enum: ['COW', 'BULL', 'CALF'],
      default: 'COW'
    },
    ageYears: {
      type: Number,
      default: null
    },
    photographs: [{
      type: String
    }],
    arrivalDate: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['RESCUE', 'SURRENDER', 'BORN', 'DONATED'],
      default: 'RESCUE'
    },
    sourceRequestId: {
      type: String,
      default: null
    },
    healthCondition: {
      type: String,
      enum: ['HEALTHY', 'IN_TREATMENT', 'CRITICAL', 'QUARANTINE', 'DECEASED'],
      default: 'HEALTHY'
    },
    vaccinationDetails: [{
      vaccineName: String,
      dateAdministered: Date,
      nextDueDate: Date,
      doctorName: String
    }],
    tagNumber: {
      type: String,
      default: '',
      trim: true
    },
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      required: true,
      index: true
    },
    currentBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    deceasedDate: {
      type: Date,
      default: null
    },
    deceasedReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Static method to generate collision-free unique Cow ID (COW-YYYY-XXXX)
cowSchema.statics.generateUniqueId = async function () {
  const currentYear = new Date().getFullYear();
  const prefix = `COW-${currentYear}-`;

  const existingCows = await this.find(
    { cowId: { $regex: `^COW-${currentYear}-\\d+$` } },
    { cowId: 1 }
  ).lean();

  let maxNum = 0;
  for (const cow of existingCows) {
    if (cow.cowId) {
      const match = cow.cowId.match(new RegExp(`^COW-${currentYear}-(\\d+)$`));
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  let nextNum = maxNum + 1;
  let candidate = `${prefix}${String(nextNum).padStart(4, '0')}`;

  while (await this.exists({ cowId: candidate })) {
    nextNum++;
    candidate = `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  return candidate;
};

// Auto-assign unique cowId if missing or duplicate before validation
cowSchema.pre('validate', async function () {
  if (!this.cowId || (this.isNew && (await this.constructor.exists({ cowId: this.cowId })))) {
    this.cowId = await this.constructor.generateUniqueId();
  }
});

module.exports = mongoose.model('Cow', cowSchema);

