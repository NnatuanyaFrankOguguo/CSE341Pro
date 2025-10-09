/**
 * Authentication Routes
 * GitHub OAuth login and callback routes
 */

const express = require('express');
const passport = require('../config/passport');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /auth/github
 * @desc    Initiate GitHub OAuth login
 * @access  Public
 */
router.get('/github', (req, res, next) => {
  logger.info('GitHub OAuth login initiated', { ip: req.ip });
  passport.authenticate('github', { 
    scope: ['user:email'] 
  })(req, res, next);
});

/**
 * @route   GET /auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/auth/login-failed' 
  }),
  (req, res) => {
    logger.success('GitHub OAuth login successful', {
      userId: req.user._id,
      username: req.user.username
    });

    // Redirect to success page or dashboard
    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username
      }
    });
  }
);

/**
 * @route   GET /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.get('/logout', (req, res) => {
  const userId = req.user?._id;
  
  req.logout((err) => {
    if (err) {
      logger.error('Logout error', err);
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }

    logger.info('User logged out', { userId });
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

/**
 * @route   GET /auth/login-failed
 * @desc    Login failure page
 * @access  Public
 */
router.get('/login-failed', (req, res) => {
  logger.warn('GitHub OAuth login failed', { ip: req.ip });
  res.status(401).json({
    success: false,
    message: 'Authentication failed. Please try again.'
  });
});

/**
 * @route   GET /auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      profileCompletion: req.user.profileCompletion
    }
  });
});

module.exports = router;