/**
 * User Controller
 * Handles all business logic for User CRUD operations
 * Each function is wrapped with asyncHandler to catch errors automatically
 */

const User = require('../models/User');
const Workout = require('../models/workout');
const logger = require('../utils/logger');
const {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendPaginated,
  sendNoContent,
  sendConflict,
} = require('../utils/apiResponse');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @desc    Create a new user
 * @route   POST /api/v1/users
 * @access  Public
 */
const createUser = asyncHandler(async (req, res) => {
  logger.info('CREATE USER - Controller function started', {
    body: req.body,
    ip: req.ip,
  });
  
  const {
    name,
    email,
    age,
    weight,
    height,
    fitnessGoal,
    activityLevel,
  } = req.body;
  
  // Check if user with email already exists
  logger.info('Checking if user already exists...', { email });
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  
  if (existingUser) {
    logger.warn('User creation failed - email already exists', { email });
    return sendConflict(res, 'User with this email already exists', {
      field: 'email',
      value: email,
    });
  }
  
  logger.info('Creating new user in database...');
  
  // Create user in database
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    age,
    weight,
    height,
    fitnessGoal,
    activityLevel,
  });
  
  logger.success('User created successfully', {
    userId: user._id,
    email: user.email,
    name: user.name,
    profileCompletion: user.profileCompletion,
  });
  
  // Send success response with 201 status (Created)
  sendCreated(res, 'User', user);
});

/**
 * @desc    Get all users with optional filters and pagination
 * @route   GET /api/v1/users
 * @access  Public
 */
const getAllUsers = asyncHandler(async (req, res) => {
  logger.info('GET ALL USERS - Controller function started', {
    query: req.query,
  });
  
  // Build query filter based on query parameters
  const filter = {};
  
  // Filter by fitness goal if provided
  if (req.query.fitnessGoal) {
    filter.fitnessGoal = req.query.fitnessGoal;
    logger.info('Filtering by fitness goal', { fitnessGoal: req.query.fitnessGoal });
  }
  
  // Filter by activity level if provided
  if (req.query.activityLevel) {
    filter.activityLevel = req.query.activityLevel;
    logger.info('Filtering by activity level', { activityLevel: req.query.activityLevel });
  }
  
  // Filter by active status if provided
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
    logger.info('Filtering by active status', { isActive: filter.isActive });
  }
  
  // Search by name or email if provided
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
    ];
    logger.info('Searching users', { searchTerm: req.query.search });
  }
  
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Sorting
  let sortOptions = {};
  if (req.query.sort) {
    const sortField = req.query.sort;
    const sortOrder = req.query.order === 'desc' || req.query.order === '-1' ? -1 : 1;
    sortOptions[sortField] = sortOrder;
    logger.info('Sorting users', { sortField, sortOrder });
  } else {
    sortOptions = { createdAt: -1 }; // Default: newest first
  }
  
  logger.info('Querying users from database...', {
    filter,
    page,
    limit,
    skip,
    sortOptions,
  });
  
  // Execute query with pagination
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(), // Use lean() for better performance when not modifying data
    User.countDocuments(filter),
  ]);
  
  logger.success('Users retrieved successfully', {
    count: users.length,
    total,
    page,
    limit,
  });
  
  // Send paginated response
  sendPaginated(
    res,
    users,
    page,
    limit,
    total,
    `Retrieved ${users.length} users successfully`
  );
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info('GET USER BY ID - Controller function started', {
    userId: id,
  });
  
  // Find user by ID
  logger.info('Searching for user in database...', { userId: id });
  const user = await User.findById(id);
  
  if (!user) {
    logger.warn('User not found', { userId: id });
    return sendNotFound(res, 'User', id);
  }
  
  logger.success('User found successfully', {
    userId: user._id,
    email: user.email,
    name: user.name,
  });
  
  // Send success response
  sendSuccess(res, 200, 'User retrieved successfully', user);
});

/**
 * @desc    Update user by ID
 * @route   PUT /api/v1/users/:id
 * @access  Public
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  logger.info('UPDATE USER - Controller function started', {
    userId: id,
    updateFields: Object.keys(updateData),
  });
  
  // Check if user exists
  logger.info('Checking if user exists...', { userId: id });
  const existingUser = await User.findById(id);
  
  if (!existingUser) {
    logger.warn('User not found for update', { userId: id });
    return sendNotFound(res, 'User', id);
  }
  
  // Check for email uniqueness if email is being updated
  if (updateData.email && updateData.email !== existingUser.email) {
    logger.info('Checking email uniqueness...', { newEmail: updateData.email });
    const emailExists = await User.findOne({ email: updateData.email.toLowerCase() });
    
    if (emailExists) {
      logger.warn('Email update failed - email already exists', {
        userId: id,
        newEmail: updateData.email,
      });
      return sendConflict(res, 'Email already exists', {
        field: 'email',
        value: updateData.email,
      });
    }
  }
  
  // Prepare update data
  const cleanUpdateData = { ...updateData };
  if (cleanUpdateData.name) cleanUpdateData.name = cleanUpdateData.name.trim();
  if (cleanUpdateData.email) cleanUpdateData.email = cleanUpdateData.email.toLowerCase().trim();
  
  logger.info('Updating user in database...', { userId: id });
  
  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    id,
    cleanUpdateData,
    {
      new: true, // Return updated document
      runValidators: true, // Run schema validators
    }
  );
  
  logger.success('User updated successfully', {
    userId: updatedUser._id,
    updatedFields: Object.keys(updateData),
    profileCompletion: updatedUser.profileCompletion,
  });
  
  // Send success response
  sendSuccess(res, 200, 'User updated successfully', updatedUser);
});

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/v1/users/:id
 * @access  Public
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info('DELETE USER - Controller function started', {
    userId: id,
  });
  
  // Check if user exists
  logger.info('Checking if user exists...', { userId: id });
  const user = await User.findById(id);
  
  if (!user) {
    logger.warn('User not found for deletion', { userId: id });
    return sendNotFound(res, 'User', id);
  }
  
  // Check if user has workouts
  logger.info('Checking for user workouts...', { userId: id });
  const workoutCount = await Workout.countDocuments({ userId: id });
  
  if (workoutCount > 0) {
    logger.warn('Cannot delete user with existing workouts', {
      userId: id,
      workoutCount,
    });
    
    return res.status(409).json({
      success: false,
      message: `Cannot delete user. User has ${workoutCount} workout(s). Please delete all workouts first or set user as inactive.`,
      data: {
        workoutCount,
        suggestion: 'Consider setting isActive to false instead of deleting',
      },
      timestamp: new Date().toISOString(),
    });
  }
  
  logger.info('Deleting user from database...', { userId: id });
  
  // Delete user
  await User.findByIdAndDelete(id);
  
  logger.success('User deleted successfully', {
    userId: id,
    email: user.email,
    name: user.name,
  });
  
  // Send success response with no content
  sendNoContent(res);
});

/**
 * @desc    Get user statistics and analytics
 * @route   GET /api/v1/users/:id/stats
 * @access  Public
 */
const getUserStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info('GET USER STATS - Controller function started', {
    userId: id,
  });
  
  // Check if user exists
  logger.info('Checking if user exists...', { userId: id });
  const user = await User.findById(id);
  
  if (!user) {
    logger.warn('User not found for stats', { userId: id });
    return sendNotFound(res, 'User', id);
  }
  
  logger.info('Calculating user statistics...', { userId: id });
  
  // Get workout statistics
  const workoutStats = await Workout.getTotalCaloriesByUser(id);
  
  // Calculate additional metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  // Get recent workout data
  const [recentWorkouts, weeklyWorkouts, monthlyWorkouts] = await Promise.all([
    Workout.find({ userId: id }).sort({ workoutDate: -1 }).limit(5).lean(),
    Workout.countDocuments({
      userId: id,
      workoutDate: { $gte: sevenDaysAgo },
      completed: true,
    }),
    Workout.countDocuments({
      userId: id,
      workoutDate: { $gte: thirtyDaysAgo },
      completed: true,
    }),
  ]);
  
  // Calculate workout frequency
  const avgWorkoutsPerWeek = monthlyWorkouts / 4; // Approximate
  
  // Build comprehensive stats object
  const stats = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileCompletion: user.profileCompletion,
      bmi: user.bmi,
      bmiCategory: user.bmiCategory,
      dailyCalorieNeeds: user.dailyCalorieNeeds,
      fitnessGoal: user.fitnessGoal,
      activityLevel: user.activityLevel,
    },
    workouts: {
      total: workoutStats.totalWorkouts,
      thisWeek: weeklyWorkouts,
      thisMonth: monthlyWorkouts,
      avgPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
    },
    calories: {
      totalBurned: workoutStats.totalCalories,
      avgPerWorkout: workoutStats.totalWorkouts > 0 
        ? Math.round(workoutStats.totalCalories / workoutStats.totalWorkouts)
        : 0,
    },
    time: {
      totalMinutes: workoutStats.totalDuration,
      totalHours: Math.round((workoutStats.totalDuration / 60) * 10) / 10,
      avgPerWorkout: workoutStats.totalWorkouts > 0
        ? Math.round(workoutStats.totalDuration / workoutStats.totalWorkouts)
        : 0,
    },
    recent: {
      lastWorkouts: recentWorkouts.map(workout => ({
        id: workout._id,
        title: workout.title,
        exerciseType: workout.exerciseType,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        workoutDate: workout.workoutDate,
      })),
    },
    achievements: {
      consistency: weeklyWorkouts >= 3 ? 'High' : weeklyWorkouts >= 1 ? 'Moderate' : 'Low',
      totalCaloriesMilestone: Math.floor(workoutStats.totalCalories / 1000) * 1000,
      totalWorkoutsMilestone: Math.floor(workoutStats.totalWorkouts / 10) * 10,
    },
  };
  
  logger.success('User statistics calculated successfully', {
    userId: id,
    totalWorkouts: stats.workouts.total,
    totalCalories: stats.calories.totalBurned,
    profileCompletion: stats.user.profileCompletion,
  });
  
  // Send success response
  sendSuccess(res, 200, 'User statistics retrieved successfully', stats);
});

/**
 * Export all controller functions
 */
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
};