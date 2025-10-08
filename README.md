# 🏋️ Fitness Tracker API

A comprehensive RESTful API for tracking workouts and managing user fitness profiles. Built with Express.js, MongoDB, and modern best practices.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Testing with Swagger](#testing-with-swagger)
- [Deployment to Render](#deployment-to-render)
- [Error Handling](#error-handling)
- [Best Practices Used](#best-practices-used)

## ✨ Features

- **User Management**: Create, read, update, and delete user profiles
- **Fitness Tracking**: Track workouts with detailed exercise information
- **Statistics & Analytics**: Get comprehensive workout statistics
- **BMI Calculation**: Automatic BMI calculation for users
- **Advanced Filtering**: Filter workouts by date, type, intensity, and more
- **Pagination**: Efficient data retrieval with pagination support
- **Comprehensive Error Handling**: Detailed error messages with proper HTTP status codes
- **Input Validation**: Robust validation for all API inputs
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, and rate limiting implemented
- **Logging**: Detailed colored console logging for debugging

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Documentation**: Swagger UI / OpenAPI 3.0
- **Security**: Helmet, CORS, Express Rate Limit
- **Environment**: dotenv

## 📁 Project Structure

```
fitness-tracker-api/
│
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── swagger.js            # Swagger configuration
│   │
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Workout.js            # Workout schema
│   │
│   ├── controllers/
│   │   ├── userController.js    # User business logic
│   │   └── workoutController.js # Workout business logic
│   │
│   ├── routes/
│   │   ├── userRoutes.js        # User endpoints
│   │   └── workoutRoutes.js     # Workout endpoints
│   │
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validator.js         # Request validation
│   │
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   └── apiResponse.js       # Response formatting
│   │
│   └── app.js                    # Express app setup
│
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── server.js                     # Server entry point
└── README.md                     # This file
```

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn

### Steps

1. **Clone or create the project directory**

```bash
mkdir fitness-tracker-api
cd fitness-tracker-api
```

2. **Initialize the project**

```bash
npm init -y
```

3. **Install dependencies**

```bash
npm install express mongoose dotenv swagger-ui-express swagger-jsdoc cors helmet express-rate-limit
```

4. **Install dev dependencies**

```bash
npm install --save-dev nodemon
```

5. **Create all project files** (copy the code from the artifacts provided)

## ⚙️ Configuration

### 1. Create `.env` file

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
API_VERSION=v1
```

### 2. Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with `fitness-tracker`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fitness-tracker?retryWrites=true&w=majority
```

## 🏃 Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

### Verify Server is Running

Open your browser and go to:
- **API Root**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api-docs

## 📚 API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

### Access Documentation

1. Start the server
2. Open browser to http://localhost:3000/api-docs
3. Explore and test all endpoints directly from the UI

## 🔌 API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users` | Create a new user |
| GET | `/api/v1/users` | Get all users (with filters) |
| GET | `/api/v1/users/:id` | Get user by ID |
| GET | `/api/v1/users/:id/stats` | Get user statistics |
| PUT | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### Workouts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/workouts` | Create a new workout |
| GET | `/api/v1/workouts` | Get all workouts (with filters & pagination) |
| GET | `/api/v1/workouts/:id` | Get workout by ID |
| GET | `/api/v1/workouts/user/:userId` | Get all workouts for a user |
| GET | `/api/v1/workouts/user/:userId/stats` | Get workout statistics for a user |
| PUT | `/api/v1/workouts/:id` | Update workout |
| DELETE | `/api/v1/workouts/:id` | Delete workout |

## 🧪 Testing with Swagger

### Create a User

1. Go to http://localhost:3000/api-docs
2. Find `POST /api/v1/users`
3. Click "Try it out"
4. Use this example body:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 28,
  "weight": 75,
  "height": 175,
  "fitnessGoal": "muscle_gain",
  "activityLevel": "moderately_active"
}
```

5. Click "Execute"
6. Copy the `_id` from the response

### Create a Workout

1. Find `POST /api/v1/workouts`
2. Click "Try it out"
3. Use this example body (replace `userId` with the ID from previous step):

```json
{
  "userId": "YOUR_USER_ID_HERE",
  "title": "Morning Run",
  "exerciseType": "running",
  "duration": 30,
  "caloriesBurned": 300,
  "intensity": "moderate",
  "notes": "Great workout session!",
  "workoutDate": "2024-10-06T08:00:00Z",
  "exercises": [
    {
      "name": "Warm-up",
      "sets": 1,
      "reps": 1
    }
  ]
}
```

4. Click "Execute"

### Get Workout Statistics

1. Find `GET /api/v1/workouts/user/{userId}/stats`
2. Click "Try it out"
3. Enter the user ID
4. Click "Execute"

## 🌐 Deployment to Render

### 1. Prepare for Deployment

Ensure your `package.json` has the correct start script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 2. Create GitHub Repository

1. Initialize git:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Push to GitHub:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 3. Deploy to Render

1. Go to [Render](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: fitness-tracker-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production
7. Click "Create Web Service"

### 4. Update Swagger Configuration

After deployment, update `src/config/swagger.js`:

```javascript
servers: [
  {
    url: 'https://your-app-name.onrender.com',
    description: 'Production server',
  },
  {
    url: 'http://localhost:3000',
    description: 'Development server',
  },
]
```

Your API will be available at:
- **API**: https://your-app-name.onrender.com
- **Documentation**: https://your-app-name.onrender.com/api-docs

## ⚠️ Error Handling

This API implements comprehensive error handling:

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-10-06T12:00:00Z"
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **429**: Too Many Requests (rate limit)
- **500**: Internal Server Error

### Handled Error Types

1. **Validation Errors**: Invalid input data
2. **Cast Errors**: Invalid MongoDB ObjectId format
3. **Duplicate Key Errors**: Unique constraint violations
4. **Not Found Errors**: Resource doesn't exist
5. **Rate Limit Errors**: Too many requests

## 🎯 Best Practices Used

### Code Organization
- ✅ Separation of concerns (MVC pattern)
- ✅ Modular architecture
- ✅ Clear folder structure

### Error Handling
- ✅ Global error handler
- ✅ Async error wrapper
- ✅ Custom error classes
- ✅ Detailed error logging

### Validation
- ✅ Schema-level validation (Mongoose)
- ✅ Middleware validation
- ✅ Input sanitization

### Security
- ✅ Helmet for HTTP headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input size limits

### Documentation
- ✅ Comprehensive code comments
- ✅ Swagger/OpenAPI documentation
- ✅ README with examples
- ✅ Inline JSDoc comments

### Logging
- ✅ Colored console logs
- ✅ Different log levels (info, success, warn, error)
- ✅ Timestamps on all logs
- ✅ Request/response logging

### Database
- ✅ Connection pooling
- ✅ Graceful shutdown
- ✅ Index optimization
- ✅ Virtual properties
- ✅ Pre/post hooks

## 📝 License

MIT License - feel free to use this project for learning or your own applications!

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your needs!

## 📧 Support

For questions or issues, please create an issue in the GitHub repository.

---

**Happy Coding! 🚀**