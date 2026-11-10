const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Gaushala = require('../models/Gaushala');
const Branch = require('../models/Branch');
const GaushalaApplication = require('../models/GaushalaApplication');
const { createNotification } = require('../services/notificationService');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'gauaashray_jwt_secure_key_2026_super_secret_protection',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Set token cookie & send response
const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  const token = generateToken(user);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  const userObj = {
    id: user._id,
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    activeRole: user.activeRole || user.role,
    avatar: user.avatar,
    status: user.status,
    gaushala: user.gaushala
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: userObj,
    ...extraData
  });
};

// @desc Register Public User
// @route POST /api/auth/register/public
exports.registerPublicUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile number and password are required.'
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists.'
      });
    }

    const user = await User.create({
      name,
      phone,
      email: email || null,
      password,
      role: 'PUBLIC_USER',
      isPhoneVerified: true
    });

    await createNotification({
      recipientId: user._id,
      title: 'Welcome to GauAashray',
      message: 'Thank you for joining GauAashray. Together we protect and care for our sacred cows.',
      type: 'ALERT'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

// @desc Register Gaushala Owner & Organization
// @route POST /api/auth/register/gaushala
exports.registerGaushalaOwner = async (req, res) => {
  try {
    const {
      ownerName,
      phone,
      email,
      password,
      gaushalaName,
      registrationId,
      address,
      state,
      city,
      pincode,
      latitude,
      longitude,
      totalCapacity,
      currentCows,
      availableServices,
      photographs,
      documents
    } = req.body;

    if (!ownerName || !phone || !password || !gaushalaName || !address || !state || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all mandatory organization and owner details.'
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists.'
      });
    }

    // Coordinates default to center of Delhi or provided
    const lat = parseFloat(latitude) || 28.6139;
    const lng = parseFloat(longitude) || 77.2090;

    // Create Owner User
    const user = await User.create({
      name: ownerName,
      phone,
      email: email || null,
      password,
      role: 'GAUSHALA_OWNER'
    });

    // Create Gaushala Organization with PENDING status
    const parsedServices = Array.isArray(availableServices) && availableServices.length > 0
      ? availableServices
      : ['RESCUE', 'VETERINARY', 'SURRENDER'];

    const gaushala = await Gaushala.create({
      name: gaushalaName,
      slug: gaushalaName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      registrationId: registrationId || '',
      owner: user._id,
      status: 'PENDING',
      address,
      state,
      city,
      pincode,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      photographs: photographs || [],
      documents: documents || [],
      totalCapacity: parseInt(totalCapacity) || 50,
      currentCows: parseInt(currentCows) || 0,
      availableServices: parsedServices
    });

    // Create Default Main Branch
    const branchCode = 'BR-' + Math.floor(1000 + Math.random() * 9000);
    const branch = await Branch.create({
      gaushala: gaushala._id,
      branchId: branchCode,
      name: `${gaushalaName} - Main Branch`,
      address,
      city,
      state,
      pincode,
      phone,
      email: email || '',
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      photographs: photographs || [],
      totalCapacity: parseInt(totalCapacity) || 50,
      currentCows: parseInt(currentCows) || 0,
      availableServices: parsedServices,
      isActive: true,
      isApproved: false // Requires super admin approval
    });

    // Create Application Entry for Super Admin
    await GaushalaApplication.create({
      gaushala: gaushala._id,
      owner: user._id,
      status: 'PENDING',
      documents: documents || []
    });

    // Attach Gaushala to User
    user.gaushala = gaushala._id;
    await user.save();

    // Alert Super Admin
    await createNotification({
      recipientId: null,
      title: 'New Gaushala Registration Application',
      message: `${gaushalaName} (${city}, ${state}) submitted an application for review.`,
      type: 'ALERT',
      notifyAdmin: true,
      link: '/admin/applications'
    });

    sendTokenResponse(user, 201, res, {
      gaushala: {
        id: gaushala._id,
        name: gaushala.name,
        status: gaushala.status
      },
      message: 'Gaushala registered successfully. Your application is under review.'
    });
  } catch (error) {
    console.error('Gaushala registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during Gaushala registration.'
    });
  }
};

// @desc Login
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const rawLoginId = req.body.loginId || req.body.phoneOrEmail || req.body.email || req.body.phone || req.body.identifier;
    const { password } = req.body;

    if (!rawLoginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number/email and password.'
      });
    }

    const cleanLoginId = rawLoginId.trim();
    const user = await User.findOne({
      $or: [{ phone: cleanLoginId }, { email: cleanLoginId.toLowerCase() }]
    }).select('+password').populate('gaushala');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your phone/email and password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your phone/email and password.'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration.'
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during sign in.'
    });
  }
};

// @desc Logout
// @route POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Signed out successfully'
  });
};

// @desc Get Current User
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('gaushala');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch user profile.'
    });
  }
};

// @desc Forgot Password
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { phoneOrEmail } = req.body;
    if (!phoneOrEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registered phone or email.'
      });
    }

    const user = await User.findOne({
      $or: [{ phone: phoneOrEmail.trim() }, { email: phoneOrEmail.trim().toLowerCase() }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this credential.'
      });
    }

    // Generate 6-digit OTP reset token
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = crypto.createHash('sha256').update(resetOtp).digest('hex');

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });

    // In local dev, we provide the OTP directly in response for instant testing
    res.status(200).json({
      success: true,
      message: 'Password reset OTP generated. Valid for 15 minutes.',
      devOtp: process.env.NODE_ENV !== 'production' ? resetOtp : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request.'
    });
  }
};

// @desc Reset Password with OTP
// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { phoneOrEmail, otp, newPassword } = req.body;

    if (!phoneOrEmail || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone/email, OTP and new password.'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    const user = await User.findOne({
      $or: [{ phone: phoneOrEmail.trim() }, { email: phoneOrEmail.trim().toLowerCase() }],
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, {
      message: 'Password reset successful. You are now logged in.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password.'
    });
  }
};

// @desc Update Profile Details (name, email, phone, avatar)
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const user = await User.findById(req.user._id).populate('gaushala');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();

    if (phone && phone.trim() !== user.phone) {
      const existingPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'This phone number is already registered to another account.' });
      }
      user.phone = phone.trim();
    }

    if (email !== undefined) {
      const cleanEmail = email ? email.trim().toLowerCase() : null;
      if (cleanEmail && cleanEmail !== user.email) {
        const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: 'This email is already registered to another account.' });
        }
      }
      user.email = cleanEmail;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    sendTokenResponse(user, 200, res, {
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating profile' });
  }
};

// @desc Delete Avatar Image
// @route DELETE /api/auth/avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('gaushala');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = '';
    await user.save();

    sendTokenResponse(user, 200, res, {
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting avatar' });
  }
};

// @desc Switch Active Mode / Role (PUBLIC_USER <-> GAUSHALA_OWNER)
// @route PUT /api/auth/switch-role
exports.switchRole = async (req, res) => {
  try {
    const { targetRole } = req.body;
    if (!['PUBLIC_USER', 'GAUSHALA_OWNER', 'SUPER_ADMIN'].includes(targetRole)) {
      return res.status(400).json({ success: false, message: 'Invalid target role' });
    }

    const user = await User.findById(req.user._id).populate('gaushala');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If switching to GAUSHALA_OWNER, verify user has Gaushala or is owner/admin
    if (targetRole === 'GAUSHALA_OWNER') {
      const Gaushala = require('../models/Gaushala');
      const ownsGaushala = user.gaushala || (await Gaushala.exists({ owner: user._id }));
      if (!ownsGaushala && user.role !== 'SUPER_ADMIN' && user.role !== 'GAUSHALA_OWNER') {
        return res.status(403).json({
          success: false,
          needsGaushalaRegistration: true,
          message: 'Please register your Gaushala shelter first to access Gaushala Owner mode.'
        });
      }
    }

    user.activeRole = targetRole;
    await user.save();

    sendTokenResponse(user, 200, res, {
      message: `Active mode switched to ${targetRole === 'PUBLIC_USER' ? 'Public Citizen' : targetRole === 'GAUSHALA_OWNER' ? 'Gaushala Owner' : 'Super Admin'}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error switching role' });
  }
};



