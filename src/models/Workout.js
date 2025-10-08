/**
 * Workout Model
 * Defines the schema and model for workout sessions
 * Includes exercise details, duration, and calories burned
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Define the Workout schema with validation
const workoutSchema = new mongoose.Schema(
  {
    // Reference to the User who created this workout
    // This creates a relationship between Workout and User collections
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: [true, 'User ID is required'],
    },

    // Name/title of the workout session
    title: {
      type: String,
      required: [true, 'Workout title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    // Type of exercise performed
    exerciseType: {
      type: String,
      required: [true, 'Exercise type is required'],
      enum: {
        values: [
          'cardio',
          'strength',
          'flexibility',
          'sports',
          'yoga',
          'pilates',
          'hiit',
          'crossfit',
          'swimming',
          'cycling',
          'running',
          'walking',
          'other',
        ],
        message: '{VALUE} is not a valid exercise type',
      },
    },

    // Duration of workout in minutes
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes (10 hours)'],
    },

    // Estimated calories burned during workout
    caloriesBurned: {
      type: Number,
      required: [true, 'Calories burned is required'],
      min: [1, 'Calories burned must be at least 1'],
      max: [5000, 'Calories burned cannot exceed 5000'],
    },

    // Intensity level of the workout
    intensity: {
      type: String,
      required: [true, 'Intensity level is required'],
      enum: {
        values: ['low', 'moderate', 'high', 'extreme'],
        message: '{VALUE} is not a valid intensity level',
      },
      default: 'moderate',
    },

    // Optional notes about the workout
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    // Date when the workout was performed
    workoutDate: {
      type: Date,
      required: [true, 'Workout date is required'],
      // Validate that date is not in the future
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: 'Workout date cannot be in the future',
      },
    },

    // Track if workout was completed or just planned
    completed: {
      type: Boolean,
      default: true,
    },

    // Array of exercises performed (optional detailed breakdown)
    exercises: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        sets: {
          type: Number,
          min: 1,
        },
        reps: {
          type: Number,
          min: 1,
        },
        weight: {
          type: Number, // Weight in kg
          min: 0,
        },
      },
    ],
  },
  {
    // Enable timestamps
    timestamps: true,
    
    // Customize JSON output
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual property: Calculate average calories burned per minute
workoutSchema.virtual('caloriesPerMinute').get(function () {
  if (this.duration && this.caloriesBurned) {
    return Math.round((this.caloriesBurned / this.duration) * 10) / 10;
  }
  return 0;
});

// Compound index for efficient queries by user and date
// This speeds up queries like "get all workouts for user X in date range Y"
workoutSchema.index({ userId: 1, workoutDate: -1 });

// Index on workout date for date-based queries
workoutSchema.index({ workoutDate: -1 });

// Pre-save middleware
workoutSchema.pre('save', function (next) {
  logger.database('Workout pre-save middleware triggered', {
    operation: this.isNew ? 'CREATE' : 'UPDATE',
    userId: this.userId,
    title: this.title,
  });
  
  // If workout date is not set, default to current date/time
  if (!this.workoutDate) {
    this.workoutDate = new Date();
    logger.info('Workout date not provided, defaulting to current date', {
      workoutDate: this.workoutDate,
    });
  }
  
  next();
});

// Post-save middleware
workoutSchema.post('save', function (doc, next) {
  logger.success('Workout saved successfully', {
    id: doc._id,
    userId: doc.userId,
    title: doc.title,
    duration: doc.duration,
  });
  next();
});

// Pre-remove middleware (if you delete a workout)
workoutSchema.pre('remove', function (next) {
  logger.warn('Workout being removed', {
    id: this._id,
    userId: this.userId,
    title: this.title,
  });
  next();
});

// Static method: Find workouts by user
// Static methods are called on the model, not instances
workoutSchema.statics.findByUser = async function (userId) {
  logger.database('Finding workouts by user', { userId });
  
  try {
    const workouts = await this.find({ userId }).sort({ workoutDate: -1 });
    logger.success('Workouts found', { count: workouts.length, userId });
    return workouts;
  } catch (error) {
    logger.error('Error finding workouts by user', error);
    throw error;
  }
};

// Static method: Calculate total calories burned by user
workoutSchema.statics.getTotalCaloriesByUser = async function (userId) {
  logger.database('Calculating total calories by user', { userId });
  
  try {
    const result = await this.aggregate([
      // Match workouts for this user
      { $match: { userId: mongoose.Types.ObjectId(userId), completed: true } },
      // Group and sum calories
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$caloriesBurned' },
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
        },
      },
    ]);
    
    logger.success('Total calories calculated', { userId, result });
    return result[0] || { totalCalories: 0, totalWorkouts: 0, totalDuration: 0 };
  } catch (error) {
    logger.error('Error calculating total calories', error);
    throw error;
  }
};

// Create and export the Workout model
const Workout = mongoose.model('Workout', workoutSchema);

// Log model creation
logger.database('Workout model created and registered');

module.exports = Workout;