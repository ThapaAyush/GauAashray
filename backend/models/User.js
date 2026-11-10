const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['PUBLIC_USER', 'GAUSHALA_OWNER', 'SUPER_ADMIN'],
      default: 'PUBLIC_USER'
    },
    activeRole: {
      type: String,
      enum: ['PUBLIC_USER', 'GAUSHALA_OWNER', 'SUPER_ADMIN'],
      default: 'PUBLIC_USER'
    },
    avatar: {
      type: String,
      default: ''
    },
    isPhoneVerified: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    gaushala: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gaushala',
      default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

