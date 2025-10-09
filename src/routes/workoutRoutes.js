/**
 * Workout Routes
 * Defines all API endpoints for Workout operations
 * Applies validation middleware before controller functions
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import controllers
const {
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutsByUser,
  getWorkoutStats,
} = require('../controllers/workoutController');

// Import validators
const {
  validateObjectId,
  validateWorkout,
  validateQueryParams,
} = require('../middleware/validator');

// Import authentication middleware
const { requireAuth } = require('../middleware/auth');

// Log when routes are being registered
logger.info('Registering Workout routes...');

/**
 * @route   POST /api/v1/workouts
 * @desc    Create a new workout
 * @access  Protected (requires authentication)
 * @body    { userId, title, exerciseType, duration, caloriesBurned, intensity?, notes?, workoutDate?, exercises? }
 */
router.post(
  '/',
  requireAuth, // Protect this route - user must be authenticated
  validateWorkout(false), // false = not an update, all required fields must be present
  createWorkout
);

/**
 * @route   GET /api/v1/workouts
 * @desc    Get all workouts with optional filters
 * @access  Public
 * @query   userId, exerciseType, intensity, dateFrom, dateTo, page, limit, sort, order
 */
router.get(
  '/',
  validateQueryParams,
  getAllWorkouts
);

/**
 * @route   GET /api/v1/workouts/user/:userId
 * @desc    Get all workouts for a specific user
 * @access  Public
 * @param   userId - User ID (MongoDB ObjectId)
 * @query   page, limit, sort, order, dateFrom, dateTo
 */
router.get(
  '/user/:userId',
  validateObjectId('userId'),
  validateQueryParams,
  getWorkoutsByUser
);

/**
 * @route   GET /api/v1/workouts/stats
 * @desc    Get workout statistics (global)
 * @access  Public
 */
router.get(
  '/stats',
  getWorkoutStats
);

/**
 * @route   GET /api/v1/workouts/:id
 * @desc    Get a single workout by ID
 * @access  Public
 * @param   id - Workout ID (MongoDB ObjectId)
 */
router.get(
  '/:id',
  validateObjectId('id'),
  getWorkoutById
);

/**
 * @route   PUT /api/v1/workouts/:id
 * @desc    Update a workout
 * @access  Protected (requires authentication)
 * @param   id - Workout ID (MongoDB ObjectId)
 * @body    Any workout fields to update (all optional)
 */
router.put(
  '/:id',
  requireAuth, // Protect this route - user must be authenticated
  validateObjectId('id'),
  validateWorkout(true), // true = update mode, all fields are optional
  updateWorkout
);

/**
 * @route   DELETE /api/v1/workouts/:id
 * @desc    Delete a workout
 * @access  Protected (requires authentication)
 * @param   id - Workout ID (MongoDB ObjectId)
 */
router.delete(
  '/:id',
  requireAuth, // Protect this route - user must be authenticated
  validateObjectId('id'),
  deleteWorkout
);

// Log successful route registration
logger.success('Workout routes registered successfully');

module.exports = router;