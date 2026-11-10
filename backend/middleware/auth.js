const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gaushala = require('../models/Gaushala');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please sign in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gauaashray_jwt_secure_key_2026_super_secret_protection');
    const user = await User.findById(decoded.id).populate('gaushala');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administration.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired. Please sign in again.'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super Admin has all access
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const effectiveRole = req.user.activeRole || req.user.role;

    if (!roles.includes(effectiveRole)) {
      return res.status(403).json({
        success: false,
        currentActiveRole: effectiveRole,
        message: `Currently active in '${effectiveRole === 'PUBLIC_USER' ? 'Public User' : 'Gaushala Owner'}' mode. Switch mode to access this feature.`
      });
    }
    next();
  };
};

// Ensure Gaushala owner is approved
const requireApprovedGaushala = async (req, res, next) => {
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (req.user.role !== 'GAUSHALA_OWNER') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to Gaushala organizations.'
    });
  }

  // Look up Gaushala
  const gaushala = await Gaushala.findOne({ owner: req.user._id });
  if (!gaushala) {
    return res.status(404).json({
      success: false,
      message: 'Gaushala registration profile not found.'
    });
  }

  if (gaushala.status !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      isPendingGaushala: true,
      gaushalaStatus: gaushala.status,
      message: `Your Gaushala application status is currently: ${gaushala.status}. Operational access is restricted until approval.`
    });
  }

  req.gaushala = gaushala;
  next();
};

module.exports = {
  protect,
  authorize,
  requireApprovedGaushala
};

