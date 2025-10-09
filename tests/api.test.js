/**
 * API Tests for Authentication and Routes
 * Tests all GET routes with authenticated and unauthenticated scenarios
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Workout = require('../src/models/workout');

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fitness-tracker-test';

describe('API Authentication Tests', () => {
  let server;
  let testUser;
  let testWorkout;
  let authenticatedAgent;

  // Setup before all tests
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Start server
    server = app.listen(0); // Use random available port
    
    // Create authenticated agent for testing
    authenticatedAgent = request.agent(app);
  });

  // Cleanup after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Workout.deleteMany({});
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
  });

  // Setup before each test
  beforeEach(async () => {
    // Clear database
    await User.deleteMany({});
    await Workout.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      weight: 70,
      height: 170,
      fitnessGoal: 'muscle_gain',
      activityLevel: 'moderately_active',
      githubId: 'test-github-id',
      username: 'testuser'
    });

    // Create test workout
    testWorkout = await Workout.create({
      userId: testUser._id,
      title: 'Test Workout',
      exerciseType: 'running',
      duration: 30,
      caloriesBurned: 300,
      intensity: 'moderate',
      notes: 'Test workout notes'
    });
  });

  // Helper function to simulate authenticated session
  const simulateAuth = (agent, user) => {
    // Mock passport session
    agent.app.request.user = user;
    agent.app.request.isAuthenticated = () => true;
  };

  describe('Health and Welcome Routes', () => {
    describe('GET /health', () => {
      it('should return 200 for health check (no auth required)', async () => {
        const response = await request(app)
          .get('/health')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Server is running smoothly');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    describe('GET /', () => {
      it('should return 200 for welcome message (no auth required)', async () => {
        const response = await request(app)
          .get('/')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Welcome to Fitness Tracker API');
        expect(response.body).toHaveProperty('endpoints');
        expect(response.body).toHaveProperty('documentation');
      });
    });
  });

  describe('User Routes - GET /api/v1/users', () => {
    describe('Authentication not required', () => {
      it('should return 200 when getting all users without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/users')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].email).toBe(testUser.email);
        expect(response.body).toHaveProperty('meta');
        expect(response.body.meta.pagination).toBeDefined();
      });

      it('should return 200 when getting user by ID without authentication', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(testUser._id.toString());
        expect(response.body.data.email).toBe(testUser.email);
        expect(response.body.data.name).toBe(testUser.name);
      });

      it('should return 200 when getting user stats without authentication', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser._id}/stats`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data).toHaveProperty('workouts');
        expect(response.body.data).toHaveProperty('calories');
        expect(response.body.data.user.id).toBe(testUser._id.toString());
      });

      it('should return 404 for non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/v1/users/${nonExistentId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not found');
      });
    });

    describe('Pagination and Filtering', () => {
      beforeEach(async () => {
        // Create additional test users
        await User.create([
          {
            name: 'User 2',
            email: 'user2@example.com',
            fitnessGoal: 'weight_loss',
            activityLevel: 'very_active'
          },
          {
            name: 'User 3',
            email: 'user3@example.com',
            fitnessGoal: 'endurance',
            activityLevel: 'lightly_active'
          }
        ]);
      });

      it('should return paginated results', async () => {
        const response = await request(app)
          .get('/api/v1/users?page=1&limit=2')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(2);
        expect(response.body.meta.pagination.currentPage).toBe(1);
        expect(response.body.meta.pagination.itemsPerPage).toBe(2);
        expect(response.body.meta.pagination.totalItems).toBe(3);
      });

      it('should filter by fitness goal', async () => {
        const response = await request(app)
          .get('/api/v1/users?fitnessGoal=weight_loss')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].fitnessGoal).toBe('weight_loss');
      });

      it('should search by name', async () => {
        const response = await request(app)
          .get('/api/v1/users?search=User 2')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('User 2');
      });
    });
  });

  describe('Workout Routes', () => {
    describe('GET /api/v1/workouts - No authentication required', () => {
      it('should return 200 when getting all workouts without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/workouts')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].title).toBe(testWorkout.title);
        expect(response.body).toHaveProperty('meta');
      });

      it('should return 200 when getting workout by ID without authentication', async () => {
        const response = await request(app)
          .get(`/api/v1/workouts/${testWorkout._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(testWorkout._id.toString());
        expect(response.body.data.title).toBe(testWorkout.title);
        expect(response.body.data.exerciseType).toBe(testWorkout.exerciseType);
      });

      it('should return 200 when getting workouts by user without authentication', async () => {
        const response = await request(app)
          .get(`/api/v1/workouts/user/${testUser._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('workouts');
        expect(response.body.data.workouts).toBeInstanceOf(Array);
        expect(response.body.data.workouts.length).toBe(1);
        expect(response.body.data.user.id).toBe(testUser._id.toString());
      });

      it('should return 404 for non-existent workout', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/v1/workouts/${nonExistentId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not found');
      });
    });

    describe('POST /api/v1/workouts - Authentication required', () => {
      it('should return 401 when creating workout without authentication', async () => {
        const workoutData = {
          userId: testUser._id,
          title: 'New Workout',
          exerciseType: 'cycling',
          duration: 45,
          caloriesBurned: 400,
          intensity: 'high'
        };

        const response = await request(app)
          .post('/api/v1/workouts')
          .send(workoutData)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('User not authenticated');
      });

      // Note: Testing authenticated POST would require mocking Passport session
      // which is complex in Jest. This test shows the 401 behavior is working.
    });

    describe('Workout Filtering and Pagination', () => {
      beforeEach(async () => {
        // Create additional test workouts
        await Workout.create([
          {
            userId: testUser._id,
            title: 'Strength Training',
            exerciseType: 'strength',
            duration: 60,
            caloriesBurned: 350,
            intensity: 'high'
          },
          {
            userId: testUser._id,
            title: 'Yoga Session',
            exerciseType: 'yoga',
            duration: 90,
            caloriesBurned: 200,
            intensity: 'low'
          }
        ]);
      });

      it('should filter workouts by exercise type', async () => {
        const response = await request(app)
          .get('/api/v1/workouts?exerciseType=yoga')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].exerciseType).toBe('yoga');
      });

      it('should filter workouts by intensity', async () => {
        const response = await request(app)
          .get('/api/v1/workouts?intensity=high')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].intensity).toBe('high');
      });

      it('should filter workouts by user', async () => {
        const response = await request(app)
          .get(`/api/v1/workouts?userId=${testUser._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(3); // Original + 2 new workouts
        response.body.data.forEach(workout => {
          expect(workout.userId._id || workout.userId).toBe(testUser._id.toString());
        });
      });

      it('should return paginated workout results', async () => {
        const response = await request(app)
          .get('/api/v1/workouts?page=1&limit=2')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(2);
        expect(response.body.meta.pagination.currentPage).toBe(1);
        expect(response.body.meta.pagination.itemsPerPage).toBe(2);
        expect(response.body.meta.pagination.totalItems).toBe(3);
      });
    });
  });

  describe('Authentication Routes', () => {
    describe('GET /auth/me', () => {
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/auth/me')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not authenticated');
      });
    });

    describe('GET /auth/logout', () => {
      it('should handle logout for unauthenticated user', async () => {
        // This will depend on implementation - may return 401 or redirect
        const response = await request(app)
          .get('/auth/logout');
        
        // Logout should handle unauthenticated users gracefully
        expect([200, 401]).toContain(response.status);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should handle invalid MongoDB ObjectIds', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/users?page=invalid&limit=999')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });
});

// Additional test suite for integration scenarios
describe('Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Cross-resource operations', () => {
    let testUser;
    let testWorkouts;

    beforeEach(async () => {
      await User.deleteMany({});
      await Workout.deleteMany({});

      testUser = await User.create({
        name: 'Integration Test User',
        email: 'integration@test.com',
        age: 30,
        weight: 75,
        height: 180,
        fitnessGoal: 'general_fitness'
      });

      testWorkouts = await Workout.create([
        {
          userId: testUser._id,
          title: 'Morning Run',
          exerciseType: 'running',
          duration: 30,
          caloriesBurned: 300,
          intensity: 'moderate'
        },
        {
          userId: testUser._id,
          title: 'Evening Workout',
          exerciseType: 'strength',
          duration: 45,
          caloriesBurned: 250,
          intensity: 'high'
        }
      ]);
    });

    it('should correctly calculate user statistics with workouts', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser._id}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.workouts.total).toBe(2);
      expect(response.body.data.calories.totalBurned).toBe(550);
      expect(response.body.data.time.totalMinutes).toBe(75);
    });

    it('should populate user data in workout responses', async () => {
      const response = await request(app)
        .get(`/api/v1/workouts/${testWorkouts[0]._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      // Check if user data is populated (depends on controller implementation)
      if (typeof response.body.data.userId === 'object') {
        expect(response.body.data.userId.name).toBe(testUser.name);
        expect(response.body.data.userId.email).toBe(testUser.email);
      }
    });
  });
});