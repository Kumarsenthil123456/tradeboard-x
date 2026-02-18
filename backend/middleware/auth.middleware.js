const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User.model');
const { errorResponse } = require('../utils/response.utils');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required', 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return errorResponse(res, 'Access token required', 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Access token expired', 401);
      }
      return errorResponse(res, 'Invalid access token', 401);
    }

    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or deactivated', 401);
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Access denied. Required roles: ${roles.join(', ')}`, 403);
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }
  } catch {
    // Continue without auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
