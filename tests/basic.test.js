/**
 * Simple Basic Tests
 * Basic tests to verify the setup works correctly
 */

const request = require('supertest');
const app = require('../src/app');

describe('Basic API Tests', () => {
  describe('Health Routes', () => {
    it('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running smoothly');
    });

    it('should return 200 for welcome route', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Welcome to Fitness Tracker API');
    });
  });

  describe('Protected Route', () => {
    it('should return 401 for POST /api/v1/workouts without auth', async () => {
      const workoutData = {
        userId: '507f1f77bcf86cd799439011',
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
    });
  });

  describe('Auth Routes', () => {
    it('should redirect to GitHub for auth', async () => {
      const response = await request(app)
        .get('/auth/github')
        .expect(302);

      expect(response.headers.location).toContain('github.com');
    });

    it('should return 401 for /auth/me without auth', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});