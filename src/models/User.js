/**
 * User Model
 * Defines the schema and model for user profiles
 * Includes fitness goals, body metrics, and calculated fields like BMI
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Define the User schema with comprehensive validation
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    // Email address - must be unique
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    // GitHub OAuth fields
    githubId: {
      type: String,
      unique: true,
      sparse: true // Allows null values to be non-unique
    },

    username: {
      type: String,
      trim: true,
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },

    avatarUrl: {
      type: String,
      trim: true,
    },

    // Age in years
    age: {
      type: Number,
      min: [13, 'Age must be at least 13 years'],
      max: [120, 'Age cannot exceed 120 years'],
    },

    // Weight in kilograms
    weight: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },

    // Height in centimeters
    height: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height cannot exceed 300 cm'],
    },

    // Primary fitness goal
    fitnessGoal: {
      type: String,
      enum: {
        values: [
          'weight_loss',
          'muscle_gain',
          'endurance',
          'flexibility',
          'general_fitness',
        ],
        message: '{VALUE} is not a valid fitness goal',
      },
    },

    // Activity level for calorie calculations
    activityLevel: {
      type: String,
      enum: {
        values: [
          'sedentary',
          'lightly_active',
          'moderately_active',
          'very_active',
          'extra_active',
        ],
        message: '{VALUE} is not a valid activity level',
      },
      default: 'moderately_active',
    },

    // Whether the user account is active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Profile completion percentage (calculated field)
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    // Enable timestamps (createdAt, updatedAt)
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

// Virtual property: Calculate BMI (Body Mass Index)
// BMI = weight(kg) / (height(m))²
userSchema.virtual('bmi').get(function () {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    const bmi = this.weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10; // Round to 1 decimal place
  }
  return null;
});

// Virtual property: BMI Category
userSchema.virtual('bmiCategory').get(function () {
  const bmi = this.bmi;
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
});

// Virtual property: Estimated Daily Calorie Needs (BMR + Activity)
// Uses Mifflin-St Jeor Equation
userSchema.virtual('dailyCalorieNeeds').get(function () {
  if (!this.weight || !this.height || !this.age) return null;
  
  // Calculate BMR (Basal Metabolic Rate)
  // Formula differs for men and women, assuming average for now
  const bmr = (10 * this.weight) + (6.25 * this.height) - (5 * this.age) + 5;
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  
  const multiplier = activityMultipliers[this.activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
});

// Index for efficient email lookups
userSchema.index({ email: 1 }, { unique: true });

// Index for filtering by fitness goals and activity level
userSchema.index({ fitnessGoal: 1, activityLevel: 1 });

// Index for active users
userSchema.index({ isActive: 1 });

// Pre-save middleware to calculate profile completion
userSchema.pre('save', function (next) {
  logger.database('User pre-save middleware triggered', {
    operation: this.isNew ? 'CREATE' : 'UPDATE',
    email: this.email,
    name: this.name,
  });
  
  // Calculate profile completion percentage
  let completedFields = 0;
  const totalFields = 7; // name, email, age, weight, height, fitnessGoal, activityLevel
  
  if (this.name) completedFields++;
  if (this.email) completedFields++;
  if (this.age) completedFields++;
  if (this.weight) completedFields++;
  if (this.height) completedFields++;
  if (this.fitnessGoal) completedFields++;
  if (this.activityLevel) completedFields++;
  
  this.profileCompletion = Math.round((completedFields / totalFields) * 100);
  
  logger.info('Profile completion calculated', {
    email: this.email,
    completion: this.profileCompletion,
    completedFields,
    totalFields,
  });
  
  next();
});

// Post-save middleware
userSchema.post('save', function (doc, next) {
  logger.success('User saved successfully', {
    id: doc._id,
    email: doc.email,
    name: doc.name,
    profileCompletion: doc.profileCompletion,
  });
  next();
});

// Pre-remove middleware
userSchema.pre('remove', function (next) {
  logger.warn('User being removed', {
    id: this._id,
    email: this.email,
    name: this.name,
  });
  next();
});

// Static method: Find users by fitness goal
userSchema.statics.findByFitnessGoal = async function (goal) {
  logger.database('Finding users by fitness goal', { goal });
  
  try {
    const users = await this.find({ fitnessGoal: goal, isActive: true });
    logger.success('Users found by fitness goal', { count: users.length, goal });
    return users;
  } catch (error) {
    logger.error('Error finding users by fitness goal', error);
    throw error;
  }
};

// Static method: Get user statistics
userSchema.statics.getStatistics = async function () {
  logger.database('Calculating user statistics');
  
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          avgAge: { $avg: '$age' },
          avgWeight: { $avg: '$weight' },
          avgHeight: { $avg: '$height' },
        },
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          activeUsers: 1,
          avgAge: { $round: ['$avgAge', 1] },
          avgWeight: { $round: ['$avgWeight', 1] },
          avgHeight: { $round: ['$avgHeight', 1] },
        },
      },
    ]);
    
    // Get fitness goal distribution
    const goalDistribution = await this.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$fitnessGoal', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    const result = {
      ...stats[0],
      goalDistribution,
    };
    
    logger.success('User statistics calculated', result);
    return result;
  } catch (error) {
    logger.error('Error calculating user statistics', error);
    throw error;
  }
};

// Instance method: Calculate recommended calories for weight goal
userSchema.methods.getRecommendedCalories = function (targetWeightLoss = 0) {
  const dailyNeeds = this.dailyCalorieNeeds;
  if (!dailyNeeds) return null;
  
  // 1 kg fat ≈ 7700 calories
  // Safe weight loss: 0.5-1 kg per week
  const calorieDeficit = targetWeightLoss * 7700 / 7; // Per day
  
  return {
    maintenance: dailyNeeds,
    weightLoss: Math.max(dailyNeeds - calorieDeficit, 1200), // Minimum 1200 calories
    targetDeficit: calorieDeficit,
  };
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

// Log model creation
logger.database('User model created and registered');

module.exports = User;