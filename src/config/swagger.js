/**
 * Swagger Configuration
 * Configures API documentation using OpenAPI 3.0 specification
 * Documentation will be available at /api-docs
 */

const swaggerJsdoc = require('swagger-jsdoc');
const logger = require('../utils/logger');

logger.info('Configuring Swagger documentation...');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fitness Tracker API',
    version: '1.0.0',
    description: `
      A comprehensive RESTful API for tracking workouts and managing user fitness profiles.
      
      ## Features
      - User management with fitness goals and metrics
      - Workout tracking with detailed exercise information
      - Statistics and analytics for users and workouts
      - Comprehensive error handling and validation
      
      ## Collections
      - **Users**: Manage user profiles, fitness goals, and body metrics
      - **Workouts**: Track exercise sessions, duration, and calories burned
    `,
    contact: {
      name: 'API Support',
      email: 'support@fitnessapi.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://your-app.onrender.com',
      description: 'Production server (Update with your Render URL)',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Workouts',
      description: 'Workout tracking endpoints',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'User full name',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address (must be unique)',
            example: 'john.doe@example.com',
          },
          age: {
            type: 'number',
            minimum: 13,
            maximum: 120,
            description: 'User age in years',
            example: 28,
          },
          weight: {
            type: 'number',
            minimum: 20,
            maximum: 500,
            description: 'User weight in kilograms',
            example: 75.5,
          },
          height: {
            type: 'number',
            minimum: 50,
            maximum: 300,
            description: 'User height in centimeters',
            example: 175,
          },
          fitnessGoal: {
            type: 'string',
            enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
            description: 'User fitness goal',
            example: 'muscle_gain',
          },
          activityLevel: {
            type: 'string',
            enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
            description: 'User activity level',
            example: 'moderately_active',
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the user account is active',
            example: true,
          },
          bmi: {
            type: 'number',
            description: 'Calculated BMI (Body Mass Index) - virtual field',
            example: 24.7,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Workout: {
        type: 'object',
        required: ['userId', 'title', 'exerciseType', 'duration', 'caloriesBurned'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId',
            example: '507f191e810c19729de860ea',
          },
          userId: {
            type: 'string',
            description: 'Reference to User who performed the workout',
            example: '507f1f77bcf86cd799439011',
          },
          title: {
            type: 'string',
            minLength: 3,
            maxLength: 100,
            description: 'Workout session title',
            example: 'Morning Run',
          },
          exerciseType: {
            type: 'string',
            enum: ['cardio', 'strength', 'flexibility', 'sports', 'yoga', 'pilates', 'hiit', 'crossfit', 'swimming', 'cycling', 'running', 'walking', 'other'],
            description: 'Type of exercise performed',
            example: 'running',
          },
          duration: {
            type: 'number',
            minimum: 1,
            maximum: 600,
            description: 'Workout duration in minutes',
            example: 30,
          },
          caloriesBurned: {
            type: 'number',
            minimum: 1,
            maximum: 5000,
            description: 'Estimated calories burned',
            example: 300,
          },
          intensity: {
            type: 'string',
            enum: ['low', 'moderate', 'high', 'extreme'],
            description: 'Workout intensity level',
            example: 'moderate',
          },
          notes: {
            type: 'string',
            maxLength: 500,
            description: 'Optional workout notes',
            example: 'Felt great today, pushed myself harder',
          },
          workoutDate: {
            type: 'string',
            format: 'date-time',
            description: 'Date when workout was performed',
            example: '2024-10-06T08:00:00Z',
          },
          completed: {
            type: 'boolean',
            description: 'Whether the workout was completed',
            example: true,
          },
          exercises: {
            type: 'array',
            description: 'Detailed list of exercises performed',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Exercise name',
                  example: 'Push-ups',
                },
                sets: {
                  type: 'number',
                  description: 'Number of sets',
                  example: 3,
                },
                reps: {
                  type: 'number',
                  description: 'Repetitions per set',
                  example: 15,
                },
                weight: {
                  type: 'number',
                  description: 'Weight used in kg',
                  example: 20,
                },
              },
            },
          },
          caloriesPerMinute: {
            type: 'number',
            description: 'Calculated calories per minute - virtual field',
            example: 10,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Record creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-10-06T12:00:00Z',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'An error occurred',
          },
          errors: {
            type: 'array',
            description: 'Detailed error information (optional)',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'Invalid email format',
                },
              },
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-10-06T12:00:00Z',
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Data retrieved successfully',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              currentPage: {
                type: 'number',
                example: 1,
              },
              totalPages: {
                type: 'number',
                example: 5,
              },
              itemsPerPage: {
                type: 'number',
                example: 10,
              },
              totalItems: {
                type: 'number',
                example: 47,
              },
              hasNextPage: {
                type: 'boolean',
                example: true,
              },
              hasPrevPage: {
                type: 'boolean',
                example: false,
              },
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
  paths: {
    '/api/v1/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Creates a new user profile with fitness information',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: {
                    type: 'string',
                    example: 'John Doe',
                  },
                  email: {
                    type: 'string',
                    example: 'john.doe@example.com',
                  },
                  age: {
                    type: 'number',
                    example: 28,
                  },
                  weight: {
                    type: 'number',
                    example: 75.5,
                  },
                  height: {
                    type: 'number',
                    example: 175,
                  },
                  fitnessGoal: {
                    type: 'string',
                    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
                    example: 'muscle_gain',
                  },
                  activityLevel: {
                    type: 'string',
                    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
                    example: 'moderately_active',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/User' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Validation error or duplicate email',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieves all users with optional filtering',
        parameters: [
          {
            in: 'query',
            name: 'fitnessGoal',
            schema: {
              type: 'string',
              enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
            },
            description: 'Filter by fitness goal',
          },
          {
            in: 'query',
            name: 'activityLevel',
            schema: {
              type: 'string',
              enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
            },
            description: 'Filter by activity level',
          },
          {
            in: 'query',
            name: 'isActive',
            schema: {
              type: 'boolean',
            },
            description: 'Filter by active status',
          },
        ],
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            count: {
                              type: 'number',
                              example: 10,
                            },
                            users: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/User' },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieves a single user by their ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User MongoDB ObjectId',
            example: '507f1f77bcf86cd799439011',
          },
        ],
        responses: {
          200: {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/User' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Updates a user by their ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User MongoDB ObjectId',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'John Updated',
                  },
                  email: {
                    type: 'string',
                    example: 'john.updated@example.com',
                  },
                  age: {
                    type: 'number',
                    example: 29,
                  },
                  weight: {
                    type: 'number',
                    example: 73,
                  },
                  height: {
                    type: 'number',
                    example: 176,
                  },
                  fitnessGoal: {
                    type: 'string',
                    example: 'endurance',
                  },
                  activityLevel: {
                    type: 'string',
                    example: 'very_active',
                  },
                  isActive: {
                    type: 'boolean',
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/User' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Validation error or invalid ID',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Deletes a user by their ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User MongoDB ObjectId',
          },
        ],
        responses: {
          200: {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          400: {
            description: 'Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/users/{id}/stats': {
      get: {
        tags: ['Users'],
        summary: 'Get user statistics',
        description: 'Retrieves comprehensive statistics for a user including BMI, goals, and account info',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'User MongoDB ObjectId',
          },
        ],
        responses: {
          200: {
            description: 'User statistics retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          400: {
            description: 'Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/workouts': {
      post: {
        tags: ['Workouts'],
        summary: 'Create a new workout',
        description: 'Creates a new workout session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'title', 'exerciseType', 'duration', 'caloriesBurned'],
                properties: {
                  userId: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011',
                  },
                  title: {
                    type: 'string',
                    example: 'Morning Run',
                  },
                  exerciseType: {
                    type: 'string',
                    enum: ['cardio', 'strength', 'flexibility', 'sports', 'yoga', 'pilates', 'hiit', 'crossfit', 'swimming', 'cycling', 'running', 'walking', 'other'],
                    example: 'running',
                  },
                  duration: {
                    type: 'number',
                    example: 30,
                  },
                  caloriesBurned: {
                    type: 'number',
                    example: 300,
                  },
                  intensity: {
                    type: 'string',
                    enum: ['low', 'moderate', 'high', 'extreme'],
                    example: 'moderate',
                  },
                  notes: {
                    type: 'string',
                    example: 'Great workout session!',
                  },
                  workoutDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-10-06T08:00:00Z',
                  },
                  completed: {
                    type: 'boolean',
                    example: true,
                  },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          example: 'Push-ups',
                        },
                        sets: {
                          type: 'number',
                          example: 3,
                        },
                        reps: {
                          type: 'number',
                          example: 15,
                        },
                        weight: {
                          type: 'number',
                          example: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Workout created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/Workout' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Workouts'],
        summary: 'Get all workouts',
        description: 'Retrieves all workouts with filtering and pagination',
        parameters: [
          {
            in: 'query',
            name: 'userId',
            schema: { type: 'string' },
            description: 'Filter by user ID',
          },
          {
            in: 'query',
            name: 'exerciseType',
            schema: { type: 'string' },
            description: 'Filter by exercise type',
          },
          {
            in: 'query',
            name: 'intensity',
            schema: { type: 'string' },
            description: 'Filter by intensity',
          },
          {
            in: 'query',
            name: 'completed',
            schema: { type: 'boolean' },
            description: 'Filter by completion status',
          },
          {
            in: 'query',
            name: 'startDate',
            schema: { type: 'string', format: 'date-time' },
            description: 'Filter workouts from this date',
          },
          {
            in: 'query',
            name: 'endDate',
            schema: { type: 'string', format: 'date-time' },
            description: 'Filter workouts until this date',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', default: 1 },
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', default: 10 },
            description: 'Items per page',
          },
        ],
        responses: {
          200: {
            description: 'Workouts retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/workouts/{id}': {
      get: {
        tags: ['Workouts'],
        summary: 'Get workout by ID',
        description: 'Retrieves a single workout by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Workout MongoDB ObjectId',
          },
        ],
        responses: {
          200: {
            description: 'Workout retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/Workout' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workout not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Workouts'],
        summary: 'Update workout',
        description: 'Updates a workout by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Workout MongoDB ObjectId',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  exerciseType: { type: 'string' },
                  duration: { type: 'number' },
                  caloriesBurned: { type: 'number' },
                  intensity: { type: 'string' },
                  notes: { type: 'string' },
                  completed: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Workout updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/Workout' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workout not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Workouts'],
        summary: 'Delete workout',
        description: 'Deletes a workout by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Workout MongoDB ObjectId',
          },
        ],
        responses: {
          200: {
            description: 'Workout deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          400: {
            description: 'Invalid ID format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workout not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/workouts/user/{userId}': {
      get: {
        tags: ['Workouts'],
        summary: 'Get workouts by user',
        description: 'Retrieves all workouts for a specific user',
        parameters: [
          {
            in: 'path',
            name: 'userId',
            required: true,
            schema: { type: 'string' },
            description: 'User MongoDB ObjectId',
          },
        ],
        responses: {
          200: {
            description: 'User workouts retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/workouts/user/{userId}/stats': {
      get: {
        tags: ['Workouts'],
        summary: 'Get user workout statistics',
        description: 'Retrieves comprehensive workout statistics for a user',
        parameters: [
          {
            in: 'path',
            name: 'userId',
            required: true,
            schema: { type: 'string' },
            description: 'User MongoDB ObjectId',
          },
        ],
        responses: {
          200: {
            description: 'Statistics retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

// Options for swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  // Path to the API routes (not used since we have inline definitions above)
  apis: [],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

logger.success('Swagger documentation configured successfully');

module.exports = swaggerSpec;