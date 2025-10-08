/**
 * User Routes
 * Defines all API endpoints for User operations
 * Applies validation middleware before controller functions
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import controllers
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} = require('../controllers/userController');

// Import validators
const {
  validateObjectId,
  validateUser,
} = require('../middleware/validator');

// Log when routes are being registered
logger.info('Registering User routes...');

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Public
 * @body    { name, email, age, weight, height, fitnessGoal, activityLevel }
 */
router.post(
  '/',
  validateUser(false), // false = not an update, all required fields must be present
  createUser
);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with optional filters
 * @access  Public
 * @query   fitnessGoal, activityLevel, isActive
 */
router.get(
  '/',
  getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get a single user by ID
 * @access  Public
 * @param   id - User ID (MongoDB ObjectId)
 */
router.get(
  '/:id',
  validateObjectId('id'), // Validate that ID is a valid ObjectId
  getUserById
);

/**
 * @route   GET /api/v1/users/:id/stats
 * @desc    Get user statistics (BMI, goals, etc.)
 * @access  Public
 * @param   id - User ID (MongoDB ObjectId)
 */
router.get(
  '/:id/stats',
  validateObjectId('id'),
  getUserStats
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update a user
 * @access  Public
 * @param   id - User ID (MongoDB ObjectId)
 * @body    Any user fields to update (all optional)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  validateUser(true), // true = update mode, all fields are optional
  updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user
 * @access  Public
 * @param   id - User ID (MongoDB ObjectId)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  deleteUser
);

// Log successful route registration
logger.success('User routes registered successfully');

module.exports = router;