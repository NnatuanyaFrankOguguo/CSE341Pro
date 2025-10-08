/**
 * Validation Middleware
 * Provides input validation for API requests
 * Uses custom validators to ensure data integrity and security
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { sendValidationError } = require('../utils/apiResponse');

/**
 * Validate MongoDB ObjectId
 * Ensures provided ID is a valid MongoDB ObjectId format
 * @param {string} paramName - Name of the parameter to validate (e.g., 'id', 'userId')
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    logger.validation('Validating ObjectId', {
      paramName,
      value: id,
      path: req.path,
    });
    
    // Check if ID is provided
    if (!id) {
      logger.validation('ObjectId validation failed - missing ID', { paramName });
      return sendValidationError(res, [{
        field: paramName,
        message: `${paramName} is required`,
        value: id,
      }], 'Invalid request parameters');
    }
    
    // Check if ID is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.validation('ObjectId validation failed - invalid format', {
        paramName,
        value: id,
      });
      
      return sendValidationError(res, [{
        field: paramName,
        message: `Invalid ${paramName} format. Must be a valid MongoDB ObjectId.`,
        value: id,
      }], 'Invalid ID format');
    }
    
    logger.validation('ObjectId validation passed', { paramName, value: id });
    next();
  };
};

/**
 * Validate User Data
 * Validates user input for create and update operations
 * @param {boolean} isUpdate - Whether this is an update operation (makes fields optional)
 */
const validateUser = (isUpdate = false) => {
  return (req, res, next) => {
    const { name, email, age, weight, height, fitnessGoal, activityLevel } = req.body;
    const errors = [];
    
    logger.validation('Validating user data', {
      isUpdate,
      hasName: !!name,
      hasEmail: !!email,
      hasAge: !!age,
    });
    
    // Validate name
    if (!isUpdate && !name) {
      errors.push({
        field: 'name',
        message: 'Name is required',
        value: name,
      });
    } else if (name) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        errors.push({
          field: 'name',
          message: 'Name must be at least 2 characters long',
          value: name,
        });
      } else if (name.trim().length > 50) {
        errors.push({
          field: 'name',
          message: 'Name cannot exceed 50 characters',
          value: name,
        });
      }
    }
    
    // Validate email
    if (!isUpdate && !email) {
      errors.push({
        field: 'email',
        message: 'Email is required',
        value: email,
      });
    } else if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
        errors.push({
          field: 'email',
          message: 'Please provide a valid email address',
          value: email,
        });
      }
    }
    
    // Validate age
    if (age !== undefined && age !== null) {
      if (!Number.isInteger(age) || age < 13 || age > 120) {
        errors.push({
          field: 'age',
          message: 'Age must be a whole number between 13 and 120',
          value: age,
        });
      }
    }
    
    // Validate weight
    if (weight !== undefined && weight !== null) {
      if (typeof weight !== 'number' || weight < 20 || weight > 500) {
        errors.push({
          field: 'weight',
          message: 'Weight must be a number between 20 and 500 kg',
          value: weight,
        });
      }
    }
    
    // Validate height
    if (height !== undefined && height !== null) {
      if (typeof height !== 'number' || height < 50 || height > 300) {
        errors.push({
          field: 'height',
          message: 'Height must be a number between 50 and 300 cm',
          value: height,
        });
      }
    }
    
    // Validate fitness goal
    if (fitnessGoal !== undefined && fitnessGoal !== null) {
      const validGoals = [
        'weight_loss',
        'muscle_gain',
        'endurance',
        'flexibility',
        'general_fitness',
      ];
      
      if (!validGoals.includes(fitnessGoal)) {
        errors.push({
          field: 'fitnessGoal',
          message: `Fitness goal must be one of: ${validGoals.join(', ')}`,
          value: fitnessGoal,
        });
      }
    }
    
    // Validate activity level
    if (activityLevel !== undefined && activityLevel !== null) {
      const validLevels = [
        'sedentary',
        'lightly_active',
        'moderately_active',
        'very_active',
        'extra_active',
      ];
      
      if (!validLevels.includes(activityLevel)) {
        errors.push({
          field: 'activityLevel',
          message: `Activity level must be one of: ${validLevels.join(', ')}`,
          value: activityLevel,
        });
      }
    }
    
    // Check if there are validation errors
    if (errors.length > 0) {
      logger.validation('User validation failed', {
        errorCount: errors.length,
        fields: errors.map(err => err.field),
      });
      
      return sendValidationError(res, errors, 'User validation failed');
    }
    
    logger.validation('User validation passed successfully');
    next();
  };
};

/**
 * Validate Workout Data
 * Validates workout input for create and update operations
 * @param {boolean} isUpdate - Whether this is an update operation
 */
const validateWorkout = (isUpdate = false) => {
  return (req, res, next) => {
    const {
      userId,
      title,
      exerciseType,
      duration,
      caloriesBurned,
      intensity,
      notes,
      workoutDate,
      exercises,
    } = req.body;
    
    const errors = [];
    
    logger.validation('Validating workout data', {
      isUpdate,
      hasUserId: !!userId,
      hasTitle: !!title,
      hasDuration: !!duration,
    });
    
    // Validate userId
    if (!isUpdate && !userId) {
      errors.push({
        field: 'userId',
        message: 'User ID is required',
        value: userId,
      });
    } else if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      errors.push({
        field: 'userId',
        message: 'Invalid User ID format',
        value: userId,
      });
    }
    
    // Validate title
    if (!isUpdate && !title) {
      errors.push({
        field: 'title',
        message: 'Workout title is required',
        value: title,
      });
    } else if (title) {
      if (typeof title !== 'string' || title.trim().length < 3) {
        errors.push({
          field: 'title',
          message: 'Title must be at least 3 characters long',
          value: title,
        });
      } else if (title.trim().length > 100) {
        errors.push({
          field: 'title',
          message: 'Title cannot exceed 100 characters',
          value: title,
        });
      }
    }
    
    // Validate exercise type
    if (!isUpdate && !exerciseType) {
      errors.push({
        field: 'exerciseType',
        message: 'Exercise type is required',
        value: exerciseType,
      });
    } else if (exerciseType) {
      const validTypes = [
        'cardio', 'strength', 'flexibility', 'sports', 'yoga',
        'pilates', 'hiit', 'crossfit', 'swimming', 'cycling',
        'running', 'walking', 'other',
      ];
      
      if (!validTypes.includes(exerciseType)) {
        errors.push({
          field: 'exerciseType',
          message: `Exercise type must be one of: ${validTypes.join(', ')}`,
          value: exerciseType,
        });
      }
    }
    
    // Validate duration
    if (!isUpdate && (duration === undefined || duration === null)) {
      errors.push({
        field: 'duration',
        message: 'Duration is required',
        value: duration,
      });
    } else if (duration !== undefined && duration !== null) {
      if (typeof duration !== 'number' || duration < 1 || duration > 600) {
        errors.push({
          field: 'duration',
          message: 'Duration must be a number between 1 and 600 minutes',
          value: duration,
        });
      }
    }
    
    // Validate calories burned
    if (!isUpdate && (caloriesBurned === undefined || caloriesBurned === null)) {
      errors.push({
        field: 'caloriesBurned',
        message: 'Calories burned is required',
        value: caloriesBurned,
      });
    } else if (caloriesBurned !== undefined && caloriesBurned !== null) {
      if (typeof caloriesBurned !== 'number' || caloriesBurned < 1 || caloriesBurned > 5000) {
        errors.push({
          field: 'caloriesBurned',
          message: 'Calories burned must be a number between 1 and 5000',
          value: caloriesBurned,
        });
      }
    }
    
    // Validate intensity
    if (intensity !== undefined && intensity !== null) {
      const validIntensities = ['low', 'moderate', 'high', 'extreme'];
      if (!validIntensities.includes(intensity)) {
        errors.push({
          field: 'intensity',
          message: `Intensity must be one of: ${validIntensities.join(', ')}`,
          value: intensity,
        });
      }
    }
    
    // Validate notes
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== 'string' || notes.length > 500) {
        errors.push({
          field: 'notes',
          message: 'Notes cannot exceed 500 characters',
          value: notes,
        });
      }
    }
    
    // Validate workout date
    if (workoutDate !== undefined && workoutDate !== null) {
      const date = new Date(workoutDate);
      if (isNaN(date.getTime()) || date > new Date()) {
        errors.push({
          field: 'workoutDate',
          message: 'Workout date must be a valid date and cannot be in the future',
          value: workoutDate,
        });
      }
    }
    
    // Validate exercises array
    if (exercises !== undefined && exercises !== null) {
      if (!Array.isArray(exercises)) {
        errors.push({
          field: 'exercises',
          message: 'Exercises must be an array',
          value: exercises,
        });
      } else {
        exercises.forEach((exercise, index) => {
          if (!exercise.name || typeof exercise.name !== 'string' || exercise.name.trim().length === 0) {
            errors.push({
              field: `exercises[${index}].name`,
              message: 'Exercise name is required and must be a non-empty string',
              value: exercise.name,
            });
          }
          
          if (exercise.sets !== undefined && (!Number.isInteger(exercise.sets) || exercise.sets < 1)) {
            errors.push({
              field: `exercises[${index}].sets`,
              message: 'Sets must be a positive integer',
              value: exercise.sets,
            });
          }
          
          if (exercise.reps !== undefined && (!Number.isInteger(exercise.reps) || exercise.reps < 1)) {
            errors.push({
              field: `exercises[${index}].reps`,
              message: 'Reps must be a positive integer',
              value: exercise.reps,
            });
          }
          
          if (exercise.weight !== undefined && (typeof exercise.weight !== 'number' || exercise.weight < 0)) {
            errors.push({
              field: `exercises[${index}].weight`,
              message: 'Weight must be a non-negative number',
              value: exercise.weight,
            });
          }
        });
      }
    }
    
    // Check if there are validation errors
    if (errors.length > 0) {
      logger.validation('Workout validation failed', {
        errorCount: errors.length,
        fields: errors.map(err => err.field),
      });
      
      return sendValidationError(res, errors, 'Workout validation failed');
    }
    
    logger.validation('Workout validation passed successfully');
    next();
  };
};

/**
 * Validate Query Parameters
 * Validates common query parameters used in GET requests
 */
const validateQueryParams = (req, res, next) => {
  const { page, limit, sort, order } = req.query;
  const errors = [];
  
  logger.validation('Validating query parameters', req.query);
  
  // Validate page number
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push({
        field: 'page',
        message: 'Page must be a positive integer',
        value: page,
      });
    } else {
      req.query.page = pageNum;
    }
  }
  
  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push({
        field: 'limit',
        message: 'Limit must be a positive integer between 1 and 100',
        value: limit,
      });
    } else {
      req.query.limit = limitNum;
    }
  }
  
  // Validate sort order
  if (order !== undefined && !['asc', 'desc', '1', '-1'].includes(order)) {
    errors.push({
      field: 'order',
      message: 'Order must be "asc", "desc", "1", or "-1"',
      value: order,
    });
  }
  
  // Check if there are validation errors
  if (errors.length > 0) {
    logger.validation('Query parameter validation failed', {
      errorCount: errors.length,
      fields: errors.map(err => err.field),
    });
    
    return sendValidationError(res, errors, 'Invalid query parameters');
  }
  
  logger.validation('Query parameter validation passed');
  next();
};

/**
 * Export all validation middleware
 */
module.exports = {
  validateObjectId,
  validateUser,
  validateWorkout,
  validateQueryParams,
};