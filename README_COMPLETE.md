# 🏋️‍♂️ Fitness Tracker API

A comprehensive RESTful API for tracking workouts and managing user fitness profiles. Built with Node.js, Express.js, and MongoDB.

## 🌟 Features

- **User Management**: Complete user profiles with fitness goals and body metrics
- **Workout Tracking**: Detailed workout sessions with exercise types, duration, and calories
- **Statistics & Analytics**: Comprehensive statistics for users and workouts
- **Data Validation**: Robust input validation and error handling
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Performance**: Optimized queries with proper indexing
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Logging**: Comprehensive logging system for debugging and monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CSE341Pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your MongoDB connection string and other settings.

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000`
   - Documentation: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/health`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a new user |
| GET | `/users` | Get all users (with pagination & filters) |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/users/:id/stats` | Get user statistics |

### Workout Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workouts` | Create a new workout |
| GET | `/workouts` | Get all workouts (with pagination & filters) |
| GET | `/workouts/:id` | Get workout by ID |
| PUT | `/workouts/:id` | Update workout |
| DELETE | `/workouts/:id` | Delete workout |
| GET | `/workouts/user/:userId` | Get workouts for a specific user |
| GET | `/workouts/stats` | Get global workout statistics |

### Example Requests

#### Create a User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "age": 28,
    "weight": 75.5,
    "height": 175,
    "fitnessGoal": "muscle_gain",
    "activityLevel": "moderately_active"
  }'
```

#### Create a Workout
```bash
curl -X POST http://localhost:3000/api/v1/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "title": "Morning Run",
    "exerciseType": "running",
    "duration": 30,
    "caloriesBurned": 300,
    "intensity": "moderate",
    "notes": "Great morning run in the park"
  }'
```

## 🏗️ Project Structure

```
CSE341Pro/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── swagger.js         # API documentation config
│   ├── controllers/
│   │   ├── userController.js  # User business logic
│   │   └── workoutController.js # Workout business logic
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling middleware
│   │   └── validator.js       # Input validation middleware
│   ├── models/
│   │   ├── User.js           # User data model
│   │   └── Workout.js        # Workout data model
│   ├── routes/
│   │   ├── userRoutes.js     # User API routes
│   │   └── workoutRoutes.js  # Workout API routes
│   └── utils/
│       ├── apiResponse.js    # Response formatting utilities
│       └── logger.js         # Logging utilities
├── server.js                 # Server entry point
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
├── .env.example            # Environment template
└── README.md               # Project documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/fitness-tracker |
| `CORS_ORIGINS` | Allowed CORS origins | * (development) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 15 minutes |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### MongoDB Setup

#### Local MongoDB
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod --dbpath /path/to/your/db
```

#### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## 📊 Data Models

### User Schema
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  age: Number (13-120),
  weight: Number (20-500 kg),
  height: Number (50-300 cm),
  fitnessGoal: String (enum),
  activityLevel: String (enum),
  isActive: Boolean (default: true),
  profileCompletion: Number (auto-calculated),
  bmi: Number (virtual field),
  dailyCalorieNeeds: Number (virtual field),
  timestamps: true
}
```

### Workout Schema
```javascript
{
  userId: ObjectId (required, ref: User),
  title: String (required, 3-100 chars),
  exerciseType: String (required, enum),
  duration: Number (required, 1-600 minutes),
  caloriesBurned: Number (required, 1-5000),
  intensity: String (enum, default: 'moderate'),
  notes: String (max 500 chars),
  workoutDate: Date (default: now),
  completed: Boolean (default: true),
  exercises: Array of exercise objects,
  timestamps: true
}
```

## 🛡️ Security Features

- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **MongoDB Injection Protection**: Sanitized queries
- **Error Handling**: Secure error responses

## 📈 Performance Features

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data retrieval
- **Lean Queries**: Improved performance for read operations
- **Aggregation Pipelines**: Complex statistics calculations
- **Connection Pooling**: Optimized MongoDB connections

## 🐛 Debugging & Troubleshooting

### Enable Debug Logging
```bash
NODE_ENV=development LOG_LEVEL=debug npm run dev
```

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure network connectivity

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing process: `lsof -ti:3000 | xargs kill -9`

3. **Validation Errors**
   - Check API documentation for required fields
   - Verify data types and constraints

### Log Levels
- `error`: Error messages only
- `warn`: Warnings and errors
- `info`: General information (default)
- `debug`: Detailed debugging information

## 🧪 Testing the API

### Using curl
```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/api/v1/users

# Get user statistics
curl http://localhost:3000/api/v1/users/{USER_ID}/stats
```

### Using Postman
Import the API documentation from `http://localhost:3000/api-docs` into Postman for interactive testing.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/api-docs`
- Review the troubleshooting section

---

**Made with ❤️ for fitness enthusiasts and developers**