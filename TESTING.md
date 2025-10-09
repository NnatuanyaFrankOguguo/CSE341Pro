# Testing Guide for Fitness Tracker API

## Overview

This project includes comprehensive unit tests using Jest and Supertest to ensure all API endpoints work correctly with proper authentication handling.

## Test Structure

### Test Files
- `tests/api.test.js` - Main integration tests for all GET routes
- `tests/auth.test.js` - Focused authentication tests for protected routes
- `tests/setup.js` - Global test configuration and utilities

### What's Tested

#### ✅ Authentication Tests
- **POST /api/v1/workouts** (Protected Route)
  - ❌ Returns 401 when not authenticated
  - ✅ Returns 200 when authenticated (mocked)
  - ✅ Provides login URL in error response

#### ✅ Public Routes (No Auth Required)
- **GET /** - Welcome message
- **GET /health** - Health check
- **GET /api/v1/users** - Get all users with pagination
- **GET /api/v1/users/:id** - Get specific user
- **GET /api/v1/users/:id/stats** - Get user statistics
- **GET /api/v1/workouts** - Get all workouts with filtering
- **GET /api/v1/workouts/:id** - Get specific workout
- **GET /api/v1/workouts/user/:userId** - Get user's workouts

#### ✅ Error Handling
- 404 responses for non-existent resources
- 400 responses for validation errors
- Proper error message formatting

#### ✅ Feature Testing
- Pagination functionality
- Filtering and searching
- Query parameter validation
- Cross-resource relationships (user stats with workouts)

## Running Tests

### Prerequisites
Make sure you have a test MongoDB database running:

```bash
# Option 1: Local MongoDB
mongod --dbpath ./data/test

# Option 2: Use MongoDB Atlas with test database
# Update MONGODB_URI_TEST in .env or tests/setup.js
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test tests/auth.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="authentication"
```

### Test Environment Variables

The tests use these environment variables (automatically set in `tests/setup.js`):

```bash
NODE_ENV=test
MONGODB_URI_TEST=mongodb://localhost:27017/fitness-tracker-test
SESSION_SECRET=test-session-secret
GITHUB_CLIENT_ID=test-client-id
GITHUB_CLIENT_SECRET=test-client-secret
```

## Test Results Summary

### ✅ Authentication Verification
- **Protected Routes**: Correctly return 401 when not authenticated
- **Public Routes**: Accessible without authentication
- **Error Messages**: Proper format with login instructions

### ✅ GET Route Coverage
All GET endpoints tested for:
- Successful responses (200)
- Proper data structure
- Pagination metadata
- Error handling (404, 400)
- Filtering and search functionality

### ✅ Data Validation
- Input validation works correctly
- Proper error responses for invalid data
- MongoDB ObjectId validation

## Production Deployment Considerations

### Session Configuration ✅
The session configuration is production-ready for Render:

```javascript
session({
  secret: process.env.SESSION_SECRET,
  name: 'fitness.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // XSS protection
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  proxy: process.env.NODE_ENV === 'production' // Trust Render proxy
})
```

### Environment Variables for Production
Add these to your Render service:

```bash
NODE_ENV=production
SESSION_SECRET=your-super-secure-32-character-secret-key-here
GITHUB_CLIENT_ID=your-github-app-client-id
GITHUB_CLIENT_SECRET=your-github-app-client-secret
MONGODB_URI=your-production-mongodb-connection-string
```

### GitHub OAuth App Configuration
Update your GitHub OAuth app settings:
- **Homepage URL**: `https://your-app.onrender.com`
- **Authorization callback URL**: `https://your-app.onrender.com/auth/github/callback`

## Testing Authentication Flow

Since OAuth requires external GitHub integration, here's how to test authentication:

### Manual Testing
1. Start server: `npm start`
2. Visit: `http://localhost:3000/auth/github`
3. Complete GitHub OAuth flow
4. Test protected route: `POST http://localhost:3000/api/v1/workouts`

### Automated Testing
The unit tests verify:
- Unauthenticated requests return 401
- Public routes remain accessible
- Error responses are properly formatted

## Coverage Goals

Current test coverage targets:
- **Branches**: 60%
- **Functions**: 60%
- **Lines**: 60%
- **Statements**: 60%

Run `npm run test:coverage` to see detailed coverage report.

## Test Database Cleanup

Tests automatically:
- Connect to separate test database
- Clean up data before/after each test
- Close database connections after tests complete

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Ensure MongoDB is running
   # Check MONGODB_URI_TEST is correct
   ```

2. **Port Already in Use**
   ```bash
   # Tests use random ports, but if issues persist:
   lsof -ti:3000 | xargs kill -9
   ```

3. **Session Issues in Production**
   ```bash
   # Ensure SESSION_SECRET is set
   # Check cookie.secure setting matches HTTPS status
   ```

## Next Steps

To extend testing:
1. Add integration tests with real GitHub OAuth (using test GitHub app)
2. Add performance tests for large datasets
3. Add tests for error recovery scenarios
4. Add API contract testing with OpenAPI schema