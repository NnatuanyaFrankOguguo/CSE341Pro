/**
 * Workout Controlle
 * Handles all business logic for Workout CRUD operations
 * Each function is wrapped with asyncHandler to catch errors automatically
 */

const Workout = require('../models/workout');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @desc    Create a new workout
 * @route   POST /api/v1/workouts
 * @access  Public
 */
const createWorkout = asyncHandler(async (req, res) => {
  logger.info('CREATE WORKOUT - Controller function started', {
    body: req.body,
    ip: req.ip,
  });
  
  // Extract workout data from request body
  const {
    userId,
    title,
    exerciseType,
    duration,
    caloriesBurned,
    intensity,
    notes,
    workoutDate,
    completed,
    exercises,
  } = req.body;
  
  // Verify that the user exists before creating workout
  logger.info('Verifying user exists...', { userId });
  const userExists = await User.findById(userId);
  
  if (!userExists) {
    logger.warn('User not found when creating workout', { userId });
    throw new AppError('User not found. Cannot create workout for non-existent user.', 404);
  }
  
  logger.info('User verified, creating workout in database...');
  
  // Create workout in database
  const workout = await Workout.create({
    userId,
    title,
    exerciseType,
    duration,
    caloriesBurned,
    intensity,
    notes,
    workoutDate: workoutDate || new Date(),
    completed: completed !== undefined ? completed : true,
    exercises: exercises || [],
  });
  
  logger.success('Workout created successfully', {
    workoutId: workout._id,
    userId: workout.userId,
    title: workout.title,
  });
  
  // Send success response with 201 status (Created)
  sendSuccess(res, 201, 'Workout created successfully', workout);
});

/**
 * @desc    Get all workouts with optional filters
 * @route   GET /api/v1/workouts
 * @access  Public
 */
const getAllWorkouts = asyncHandler(async (req, res) => {
  logger.info('GET ALL WORKOUTS - Controller function started', {
    query: req.query,
  });
  
  // Build query filter based on query parameters
  const filter = {};
  
  // Filter by user ID if provided
  if (req.query.userId) {
    filter.userId = req.query.userId;
    logger.info('Filtering by user ID', { userId: req.query.userId });
  }
  
  // Filter by exercise type if provided
  if (req.query.exerciseType) {
    filter.exerciseType = req.query.exerciseType;
    logger.info('Filtering by exercise type', { exerciseType: req.query.exerciseType });
  }
  
  // Filter by intensity if provided
  if (req.query.intensity) {
    filter.intensity = req.query.intensity;
    logger.info('Filtering by intensity', { intensity: req.query.intensity });
  }
  
  // Filter by completed status if provided
  if (req.query.completed !== undefined) {
    filter.completed = req.query.completed === 'true';
    logger.info('Filtering by completed status', { completed: filter.completed });
  }
  
  // Date range filtering
  if (req.query.startDate || req.query.endDate) {
    filter.workoutDate = {};
    
    if (req.query.startDate) {
      filter.workoutDate.$gte = new Date(req.query.startDate);
      logger.info('Filtering from start date', { startDate: req.query.startDate });
    }
    
    if (req.query.endDate) {
      filter.workoutDate.$lte = new Date(req.query.endDate);
      logger.info('Filtering to end date', { endDate: req.query.endDate });
    }
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  logger.info('Pagination parameters', { page, limit, skip });
  
  logger.info('Querying database for workouts...', { filter });
  
  // Fetch workouts from database with pagination
  // Populate user data and sort by workout date (newest first)
  const workouts = await Workout.find(filter)
    .populate('userId', 'name email') // Populate only name and email from User
    .sort({ workoutDate: -1 })
    .limit(limit)
    .skip(skip);
  
  // Get total count for pagination
  const totalWorkouts = await Workout.countDocuments(filter);
  
  logger.success('Workouts retrieved successfully', {
    count: workouts.length,
    total: totalWorkouts,
    page,
    filter,
  });
  
  // Send paginated response
  sendPaginated(
    res,
    workouts,
    page,
    limit,
    totalWorkouts,
    'Workouts retrieved successfully'
  );
});

/**
 * @desc    Get a single workout by ID
 * @route   GET /api/v1/workouts/:id
 * @access  Public
 */
const getWorkoutById = asyncHandler(async (req, res) => {
  const workoutId = req.params.id;
  
  logger.info('GET WORKOUT BY ID - Controller function started', { workoutId });
  
  logger.info('Searching for workout in database...', { workoutId });
  
  // Find workout by ID and populate user data
  const workout = await Workout.findById(workoutId).populate('userId', 'name email age weight height');
  
  // Check if workout exists
  if (!workout) {
    logger.warn('Workout not found', { workoutId });
    throw new AppError('Workout not found with the provided ID', 404);
  }
  
  logger.success('Workout found successfully', {
    workoutId: workout._id,
    title: workout.title,
    userId: workout.userId._id,
  });
  
  // Send success response
  sendSuccess(res, 200, 'Workout retrieved successfully', workout);
});

/**
 * @desc    Update a workout
 * @route   PUT /api/v1/workouts/:id
 * @access  Public
 */
const updateWorkout = asyncHandler(async (req, res) => {
  const workoutId = req.params.id;
  
  logger.info('UPDATE WORKOUT - Controller function started', {
    workoutId,
    updates: req.body,
  });
  
  // Check if request body is empty
  if (Object.keys(req.body).length === 0) {
    logger.warn('Update attempted with empty request body', { workoutId });
    throw new AppError('Please provide at least one field to update', 400);
  }
  
  logger.info('Searching for workout to update...', { workoutId });
  
  // Find workout by ID
  const workout = await Workout.findById(workoutId);
  
  // Check if workout exists
  if (!workout) {
    logger.warn('Workout not found for update', { workoutId });
    throw new AppError('Workout not found with the provided ID', 404);
  }
  
  // If userId is being updated, verify the new user exists
  if (req.body.userId && req.body.userId !== workout.userId.toString()) {
    logger.info('User ID is being updated, verifying new user exists...', {
      oldUserId: workout.userId,
      newUserId: req.body.userId,
    });
    
    const userExists = await User.findById(req.body.userId);
    if (!userExists) {
      logger.warn('New user not found', { userId: req.body.userId });
      throw new AppError('User not found. Cannot assign workout to non-existent user.', 404);
    }
  }
  
  logger.info('Workout found, applying updates...', { workoutId });
  
  // Update workout fields
  const allowedUpdates = [
    'userId',
    'title',
    'exerciseType',
    'duration',
    'caloriesBurned',
    'intensity',
    'notes',
    'workoutDate',
    'completed',
    'exercises',
  ];
  
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      workout[field] = req.body[field];
      logger.info(`Updated field: ${field}`, { newValue: req.body[field] });
    }
  });
  
  // Save updated workout
  logger.info('Saving updated workout to database...', { workoutId });
  await workout.save();
  
  logger.success('Workout updated successfully', {
    workoutId: workout._id,
    updatedFields: Object.keys(req.body),
  });
  
  // Send success response
  sendSuccess(res, 200, 'Workout updated successfully', workout);
});

/**
 * @desc    Delete a workout
 * @route   DELETE /api/v1/workouts/:id
 * @access  Public
 */
const deleteWorkout = asyncHandler(async (req, res) => {
  const workoutId = req.params.id;
  
  logger.info('DELETE WORKOUT - Controller function started', { workoutId });
  
  logger.info('Searching for workout to delete...', { workoutId });
  
  // Find and delete workout in one operation
  const workout = await Workout.findByIdAndDelete(workoutId);
  
  // Check if workout exists
  if (!workout) {
    logger.warn('Workout not found for deletion', { workoutId });
    throw new AppError('Workout not found with the provided ID', 404);
  }
  
  logger.success('Workout deleted successfully', {
    workoutId: workout._id,
    title: workout.title,
    userId: workout.userId,
  });
  
  // Send success response
  sendSuccess(res, 200, 'Workout deleted successfully', {
    deletedWorkout: {
      id: workout._id,
      title: workout.title,
      userId: workout.userId,
    },
  });
});

/**
 * @desc    Get workouts for a specific user
 * @route   GET /api/v1/workouts/user/:userId
 * @access  Public
 */
const getWorkoutsByUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  
  logger.info('GET WORKOUTS BY USER - Controller function started', { userId });
  
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    logger.warn('User not found', { userId });
    throw new AppError('User not found with the provided ID', 404);
  }
  
  logger.info('Fetching workouts for user...', { userId });
  
  // Use static method from model
  const workouts = await Workout.findByUser(userId);
  
  logger.success('User workouts retrieved successfully', {
    userId,
    count: workouts.length,
  });
  
  sendSuccess(res, 200, 'User workouts retrieved successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    count: workouts.length,
    workouts,
  });
});

/**
 * @desc    Get global workout statistics
 * @route   GET /api/v1/workouts/stats
 * @access  Public
 */
const getWorkoutStats = asyncHandler(async (req, res) => {
  logger.info('GET GLOBAL WORKOUT STATS - Controller function started');
  
  logger.info('Calculating global workout statistics...');
  
  try {
    // Get overall statistics
    const overallStats = await Workout.aggregate([
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          completedWorkouts: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          totalCalories: { $sum: '$caloriesBurned' },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          avgCalories: { $avg: '$caloriesBurned' },
        },
      },
    ]);
    
    // Get statistics by exercise type
    const statsByType = await Workout.aggregate([
      { $match: { completed: true } },
      {
        $group: {
          _id: '$exerciseType',
          count: { $sum: 1 },
          totalCalories: { $sum: '$caloriesBurned' },
          avgCalories: { $avg: '$caloriesBurned' },
          avgDuration: { $avg: '$duration' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    // Get statistics by intensity
    const statsByIntensity = await Workout.aggregate([
      { $match: { completed: true } },
      {
        $group: {
          _id: '$intensity',
          count: { $sum: 1 },
          avgCalories: { $avg: '$caloriesBurned' },
          avgDuration: { $avg: '$duration' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    // Get user count
    const userCount = await User.countDocuments({ isActive: true });
    
    // Get most active users
    const mostActiveUsers = await Workout.aggregate([
      { $match: { completed: true } },
      {
        $group: {
          _id: '$userId',
          workoutCount: { $sum: 1 },
          totalCalories: { $sum: '$caloriesBurned' },
          totalDuration: { $sum: '$duration' },
        },
      },
      { $sort: { workoutCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          workoutCount: 1,
          totalCalories: 1,
          totalDuration: 1,
        },
      },
    ]);
    
    // Build comprehensive stats object
    const stats = {
      overall: {
        totalWorkouts: overallStats[0]?.totalWorkouts || 0,
        completedWorkouts: overallStats[0]?.completedWorkouts || 0,
        totalUsers: userCount,
        totalCalories: overallStats[0]?.totalCalories || 0,
        totalDuration: overallStats[0]?.totalDuration || 0,
        avgDuration: Math.round(overallStats[0]?.avgDuration || 0),
        avgCalories: Math.round(overallStats[0]?.avgCalories || 0),
        completionRate: overallStats[0]?.totalWorkouts > 0
          ? Math.round((overallStats[0].completedWorkouts / overallStats[0].totalWorkouts) * 100)
          : 0,
      },
      byExerciseType: statsByType,
      byIntensity: statsByIntensity,
      mostActiveUsers,
      generatedAt: new Date().toISOString(),
    };
    
    logger.success('Global workout statistics calculated successfully', {
      totalWorkouts: stats.overall.totalWorkouts,
      totalUsers: stats.overall.totalUsers,
    });
    
    // Send success response
    sendSuccess(res, 200, 'Global workout statistics retrieved successfully', stats);
    
  } catch (error) {
    logger.error('Error calculating workout statistics', error);
    throw new AppError('Failed to calculate workout statistics', 500);
  }
});

// Export all controller functions
module.exports = {
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutsByUser,
  getWorkoutStats,
};