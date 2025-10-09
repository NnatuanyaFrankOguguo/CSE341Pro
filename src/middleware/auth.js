/**
 * Authentication Middleware
 * Simple middleware to check if user is authenticated
 */

const logger = require('../utils/logger');

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
  logger.debug('Checking authentication', {
    isAuthenticated: req.isAuthenticated(),
    userId: req.user?._id,
    path: req.path
  });

  if (req.isAuthenticated()) {
    logger.debug('User is authenticated', { userId: req.user._id });
    return next();
  }

  logger.warn('Unauthenticated access attempt', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  return res.status(401).json({
    success: false,
    message: 'User not authenticated',
    timestamp: new Date().toISOString()
  });
};

/**
 * Optional auth middleware - doesn't block if not authenticated
 * Just adds user info to request if available
 */
const optionalAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    logger.debug('Optional auth - user authenticated', { userId: req.user._id });
  } else {
    logger.debug('Optional auth - user not authenticated');
  }
  next();
};

module.exports = {
  requireAuth,
  optionalAuth
};