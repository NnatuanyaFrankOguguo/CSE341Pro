/**
 * Authentication Tests
 * Focused tests for protected routes and authentication flows
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication and Protected Routes', () => {
  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/fitness-tracker-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/workouts - Protected Route', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        githubId: 'test-github-123',
        username: 'testuser',
        activityLevel: 'moderately_active'
      });
    });

    it('should return 401 when not authenticated', async () => {
      const workoutData = {
        userId: testUser._id,
        title: 'Test Workout',
        exerciseType: 'running',
        duration: 30,
        caloriesBurned: 300,
        intensity: 'moderate'
      };

      const response = await request(app)
        .post('/api/v1/workouts')
        .send(workoutData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not authenticated');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].type).toBe('authentication_required');
    });

    it('should provide login URL in 401 response', async () => {
      const response = await request(app)
        .post('/api/v1/workouts')
        .send({})
        .expect(401);

      expect(response.body.errors[0].loginUrl).toBe('/auth/github');
    });
  });

  describe('Authentication Routes', () => {
    describe('GET /auth/github', () => {
      it('should redirect to GitHub OAuth', async () => {
        const response = await request(app)
          .get('/auth/github')
          .expect(302); // Redirect to GitHub

        expect(response.headers.location).toContain('github.com');
      });
    });

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
      it('should handle logout gracefully even when not authenticated', async () => {
        const response = await request(app)
          .get('/auth/logout');

        // Should not crash, may return different status codes
        expect([200, 401, 302]).toContain(response.status);
      });
    });
  });

  describe('Public Routes (No Authentication Required)', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Public Test User',
        email: 'public@test.com',
        age: 28,
        weight: 75,
        height: 175
      });
    });

    it('GET /api/v1/users should return 200 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/users/:id should return 200 without authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testUser._id.toString());
    });

    it('GET /api/v1/workouts should return 200 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/workouts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format for validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          name: 'A', // Too short
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent resources', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});