const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ userId: decoded.userId });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token. User not found.' });
    }

    req.user = user;
    req.userId = user.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

// Optional auth — attaches user if token present, but doesn't block
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ userId: decoded.userId });
      if (user) {
        req.user = user;
        req.userId = user.userId;
      }
    }
  } catch (_) {
    // Not authenticated, but that's OK for optional
  }
  next();
};

// Require specific user type
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// Team member authentication — verifies token was issued for a team member
const teamMemberAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'engineers_secret_key');

    if (!decoded.memberId || !decoded.memberRole) {
      return res.status(403).json({ success: false, error: 'This endpoint requires team member authentication.' });
    }

    req.userId = decoded.userId;     // brand owner's userId
    req.memberId = decoded.memberId; // team member's memberId
    req.memberRole = decoded.memberRole; // 'standard_member' or 'premium_member'
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

module.exports = { auth, optionalAuth, requireRole, teamMemberAuth };
