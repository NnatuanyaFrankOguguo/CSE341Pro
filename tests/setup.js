/**
 * Jest Setup File
 * Global test environment configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fitness-tracker-test';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.GITHUB_CLIENT_ID = 'test-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test utilities
global.testUtils = {
  createTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    weight: 70,
    height: 170,
    fitnessGoal: 'muscle_gain',
    activityLevel: 'moderately_active',
    ...overrides
  }),
  
  createTestWorkout: (userId, overrides = {}) => ({
    userId,
    title: 'Test Workout',
    exerciseType: 'running',
    duration: 30,
    caloriesBurned: 300,
    intensity: 'moderate',
    ...overrides
  })
};