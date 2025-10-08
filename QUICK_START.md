# 🚀 Quick Start Guide - Fitness Tracker API

## Step-by-Step Setup (5 Minutes)

### Step 1: Create Project Structure

```bash
# Create project directory
mkdir fitness-tracker-api
cd fitness-tracker-api

# Initialize npm project
npm init -y
```

### Step 2: Install Dependencies

```bash
# Install production dependencies
npm install express mongoose dotenv swagger-ui-express swagger-jsdoc cors helmet express-rate-limit

# Install development dependencies
npm install --save-dev nodemon
```

### Step 3: Create All Files

Copy all the code from the provided artifacts into the following files:

```
fitness-tracker-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── swagger.js
│   ├── models/
│   │   ├── User.js
│   │   └── Workout.js
│   ├── controllers/
│   │   ├── userController.js
│   │   └── workoutController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── workoutRoutes.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── apiResponse.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

### Step 4: Configure Environment Variables

Create `.env` file:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fitness-tracker?retryWrites=true&w=majority
API_VERSION=v1
```

**Get your MongoDB URI:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace `<username>`, `<password>`, and database name

### Step 5: Update package.json Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 6: Start the Server

```bash
npm run dev
```

You should see colorful logs showing:
- ✅ Database connection
- ✅ Server startup
- ✅ Available endpoints

### Step 7: Test the API

Open your browser:
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

---

## 🧪 Testing Examples

### Using Swagger UI (Easiest Method)

1. Go to http://localhost:3000/api-docs
2. Try the endpoints directly from the browser!

### Using cURL

#### 1. Create a User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "age": 25,
    "weight": 60,
    "height": 165,
    "fitnessGoal": "weight_loss",
    "activityLevel": "moderately_active"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "6523abc...",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "age": 25,
    "weight": 60,
    "height": 165,
    "bmi": 22.0,
    "fitnessGoal": "weight_loss",
    "activityLevel": "moderately_active",
    "isActive": true,
    "createdAt": "2024-10-06T12:00:00Z",
    "updatedAt": "2024-10-06T12:00:00Z"
  },
  "timestamp": "2024-10-06T12:00:00Z"
}
```

#### 2. Get All Users

```bash
curl http://localhost:3000/api/v1/users
```

#### 3. Get User by ID

```bash
curl http://localhost:3000/api/v1/users/YOUR_USER_ID
```

#### 4. Create a Workout

```bash
curl -X POST http://localhost:3000/api/v1/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "Evening Yoga Session",
    "exerciseType": "yoga",
    "duration": 45,
    "caloriesBurned": 150,
    "intensity": "low",
    "notes": "Focused on flexibility and breathing",
    "exercises": [
      {
        "name": "Sun Salutations",
        "sets": 5,
        "reps": 1
      },
      {
        "name": "Warrior Pose",
        "sets": 3,
        "reps": 2
      }
    ]
  }'
```

#### 5. Get Workout Statistics

```bash
curl http://localhost:3000/api/v1/workouts/user/YOUR_USER_ID/stats
```

#### 6. Update a User

```bash
curl -X PUT http://localhost:3000/api/v1/users/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 58,
    "fitnessGoal": "endurance"
  }'
```

#### 7. Delete a Workout

```bash
curl -X DELETE http://localhost:3000/api/v1/workouts/YOUR_WORKOUT_ID
```

### Using Postman

1. **Import Collection**:
   - Create new collection "Fitness Tracker API"
   - Add requests for each endpoint

2. **Set Variables**:
   - Base URL: `http://localhost:3000`
   - User ID: (save from create user response)

3. **Test All Endpoints** using the examples above

### Using JavaScript (fetch)

```javascript
// Create a user
async function createUser() {
  const response = await fetch('http://localhost:3000/api/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      age: 30,
      weight: 80,
      height: 180,
      fitnessGoal: 'muscle_gain',
      activityLevel: 'very_active'
    })
  });
  
  const data = await response.json();
  console.log(data);
  return data.data._id; // Return user ID
}

// Create a workout
async function createWorkout(userId) {
  const response = await fetch('http://localhost:3000/api/v1/workouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      title: 'Strength Training',
      exerciseType: 'strength',
      duration: 60,
      caloriesBurned: 400,
      intensity: 'high',
      exercises: [
        {
          name: 'Bench Press',
          sets: 4,
          reps: 10,
          weight: 80
        },
        {
          name: 'Squats',
          sets: 4,
          reps: 12,
          weight: 100
        }
      ]
    })
  });
  
  const data = await response.json();
  console.log(data);
}

// Usage
createUser().then(userId => createWorkout(userId));
```

---

## 🔍 Understanding Console Logs

When you run the server, you'll see colorful logs:

### Startup Logs
```
[INFO] 2024-10-06T12:00:00Z - Starting Fitness Tracker API server...
[DATABASE] 2024-10-06T12:00:00Z - Attempting to connect to MongoDB...
[SUCCESS] 2024-10-06T12:00:00Z - MongoDB connected successfully
[SUCCESS] 2024-10-06T12:00:00Z - Server is running on port 3000
```

### Request Logs
```
[REQUEST] 2024-10-06T12:00:01Z - POST /api/v1/users
[INFO] 2024-10-06T12:00:01Z - CREATE USER - Controller function started
[DATABASE] 2024-10-06T12:00:01Z - User pre-save middleware triggered
[SUCCESS] 2024-10-06T12:00:01Z - User saved successfully
[SUCCESS] 2024-10-06T12:00:01Z - User created successfully
```

### Error Logs
```
[ERROR] 2024-10-06T12:00:02Z - Validation failed
[WARNING] 2024-10-06T12:00:02Z - User validation failed
```

**Color Guide:**
- 🔵 Blue = INFO (general information)
- 🟢 Green = SUCCESS (operations completed)
- 🟡 Yellow = WARNING (non-critical issues)
- 🔴 Red = ERROR (failures and exceptions)
- 🟣 Magenta = DATABASE (database operations)
- 🔷 Cyan = REQUEST (incoming HTTP requests)

---

## 🎯 Common Issues & Solutions

### Issue 1: "Port 3000 already in use"
**Solution:** Change port in `.env`:
```env
PORT=3001
```

### Issue 2: "MONGODB_URI is not defined"
**Solution:** Check your `.env` file exists and has correct MongoDB URI

### Issue 3: "Cannot connect to MongoDB"
**Solutions:**
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Verify username/password in connection string
- Ensure database user has read/write permissions

### Issue 4: "Module not found"
**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: Validation errors
**Solution:** Check the error response for specific field errors and fix request body

---

## 📊 Sample Data for Testing

### Sample Users

```json
{
  "name": "Alex Runner",
  "email": "alex.runner@example.com",
  "age": 27,
  "weight": 70,
  "height": 172,
  "fitnessGoal": "endurance",
  "activityLevel": "very_active"
}
```

```json
{
  "name": "Sarah Lifter",
  "email": "sarah.lifter@example.com",
  "age": 24,
  "weight": 58,
  "height": 163,
  "fitnessGoal": "muscle_gain",
  "activityLevel": "extra_active"
}
```

### Sample Workouts

```json
{
  "userId": "YOUR_USER_ID",
  "title": "HIIT Cardio Blast",
  "exerciseType": "hiit",
  "duration": 30,
  "caloriesBurned": 350,
  "intensity": "extreme",
  "notes": "Intense burpees and mountain climbers"
}
```

```json
{
  "userId": "YOUR_USER_ID",
  "title": "Swimming Laps",
  "exerciseType": "swimming",
  "duration": 40,
  "caloriesBurned": 320,
  "intensity": "moderate",
  "notes": "Freestyle and backstroke"
}
```

---

## 📝 Checklist for Assignment Submission

### ✅ Before You Record Your Video

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] All routes are working
- [ ] Swagger documentation is accessible at `/api-docs`
- [ ] Can create, read, update, and delete users
- [ ] Can create, read, update, and delete workouts
- [ ] Error handling works (try invalid data)
- [ ] Validation works (try missing required fields)
- [ ] Code has comprehensive comments
- [ ] Console logs show each action clearly
- [ ] `.env.example` file exists with template
- [ ] `.gitignore` file excludes `node_modules` and `.env`
- [ ] README.md is complete

### 📹 Video Recording Checklist

Show the following in your video:

1. **Project Structure** (30 seconds)
   - Show folder structure in VS Code
   - Highlight key files

2. **Code Quality** (2 minutes)
   - Open a controller file - show comments and logging
   - Open a model file - show validation
   - Open middleware file - show error handling

3. **Server Startup** (30 seconds)
   - Run `npm run dev`
   - Show colored console logs
   - Highlight database connection message

4. **Swagger Documentation** (1 minute)
   - Open http://localhost:3000/api-docs
   - Show all endpoints organized by tags
   - Show schemas

5. **Testing CRUD Operations** (4 minutes)

   **Users Collection:**
   - POST: Create a user (show success response)
   - GET: Retrieve all users
   - GET: Retrieve user by ID (show populated data)
   - PUT: Update user (change weight/fitness goal)
   - GET: Show user stats endpoint
   - DELETE: Delete a user

   **Workouts Collection:**
   - POST: Create a workout (show exercises array)
   - GET: Retrieve all workouts (show pagination)
   - GET: Retrieve workout by ID (show populated user data)
   - GET: Get workouts by user ID
   - GET: Show workout statistics for a user
   - PUT: Update a workout
   - DELETE: Delete a workout

6. **Error Handling Demonstration** (2 minutes)
   - Try to create user without email (show validation error)
   - Try to get user with invalid ID (show 400 error)
   - Try to get non-existent user (show 404 error)
   - Try to create workout with invalid userId (show error)
   - Show console logs for each error

7. **Filtering & Pagination** (1 minute)
   - GET workouts with query parameters
   - Show pagination metadata in response

8. **Deployment** (if applicable)
   - Show Render deployment
   - Test production API
   - Show published documentation URL

---

## 🎬 Video Script Example

**Intro (15 seconds):**
> "Hi, I'm [Your Name]. Today I'll demonstrate my Fitness Tracker API with two collections: Users and Workouts. This API features comprehensive CRUD operations, advanced error handling, and full Swagger documentation."

**Code Overview (2 minutes):**
> "Let me show you the code structure. As you can see, we have clear separation of concerns with models, controllers, routes, and middleware. Each file has detailed comments explaining every line of code. Notice the console logging - every action is logged with timestamps and color coding for easy debugging."

**Server Demo (30 seconds):**
> "Let me start the server. Watch the console - you'll see the database connection process, route registration, and server startup messages. Everything is logged clearly so we can track exactly what's happening."

**Swagger Demo (1 minute):**
> "Here's our API documentation at /api-docs. We have two main collections: Users for managing fitness profiles, and Workouts for tracking exercise sessions. Each endpoint is fully documented with request/response examples."

**CRUD Testing (5 minutes):**
> "Let me demonstrate the CRUD operations. First, I'll create a user... notice the success response and console logs. Now let's create a workout for this user... you can see the detailed exercise information. Let me update this workout... and now delete it. Each operation shows clear success messages and logs."

**Error Handling (2 minutes):**
> "Now let's test error handling. Watch what happens when I try to create a user without an email... you see a detailed validation error. If I use an invalid ID format... we get a 400 error. For a non-existent resource... we get a 404. Notice how the console logs every error with full details for debugging."

**Conclusion (15 seconds):**
> "This API demonstrates modern best practices including validation, error handling, logging, and comprehensive documentation. All requirements have been met and the code is production-ready."

---

## 🎨 Features That Make Your Project Stand Out

### 1. **Colored Console Logging**
- Different colors for different log types
- Easy to spot errors and track flow
- Timestamps on every log

### 2. **Comprehensive Error Handling**
- Catches ALL error types
- Detailed error messages
- Stack traces for debugging
- Proper HTTP status codes

### 3. **Advanced Validation**
- Schema-level validation (Mongoose)
- Middleware validation
- Detailed field-level errors
- Custom error messages

### 4. **Rich API Features**
- Pagination support
- Filtering by multiple criteria
- Date range queries
- Statistical endpoints
- Virtual properties (BMI, calories per minute)

### 5. **Security Best Practices**
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input size limits
- Graceful shutdown

### 6. **Excellent Documentation**
- Every file heavily commented
- Swagger/OpenAPI docs
- README with examples
- Quick start guide
- Explains WHY code is written

### 7. **Professional Code Organization**
- Clear folder structure
- Separation of concerns
- Reusable utilities
- Modular design
- DRY principles

---

## 🚀 Deployment Instructions (Render)

### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Fitness Tracker API"

# Create GitHub repo and push
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### Step 2: Deploy to Render

1. Go to https://render.com
2. Sign up/in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: fitness-tracker-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables

In Render dashboard, add:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NODE_ENV`: production

### Step 4: Deploy

Click "Create Web Service" - Render will:
1. Clone your repo
2. Install dependencies
3. Start your server

### Step 5: Test Deployed API

Your API will be at: `https://your-app-name.onrender.com`

Test endpoints:
- https://your-app-name.onrender.com/health
- https://your-app-name.onrender.com/api-docs
- https://your-app-name.onrender.com/api/v1/users

---

## 💡 Tips for Success

### Code Quality
- ✅ Every line has a comment explaining what it does
- ✅ Console logs track every action
- ✅ Error messages are clear and helpful
- ✅ Variable names are descriptive

### Testing
- ✅ Test ALL endpoints (CRUD for both collections)
- ✅ Test error scenarios
- ✅ Test validation
- ✅ Test with invalid data

### Documentation
- ✅ Swagger docs are complete
- ✅ README has clear instructions
- ✅ Examples are provided
- ✅ Deployment guide included

### Video Presentation
- ✅ Clear audio
- ✅ Show code quality
- ✅ Demonstrate all features
- ✅ Show error handling
- ✅ Professional presentation

---

## 🎓 What You'll Learn

By completing this project, you'll understand:

1. **Express.js Fundamentals**
   - Middleware
   - Routing
   - Request/Response handling

2. **MongoDB & Mongoose**
   - Schema design
   - Validation
   - Relationships
   - Queries and aggregations

3. **Error Handling**
   - Try-catch blocks
   - Error middleware
   - Custom errors
   - Status codes

4. **API Design**
   - RESTful principles
   - CRUD operations
   - Response formatting
   - Status codes

5. **Security**
   - CORS
   - Rate limiting
   - Input validation
   - Helmet

6. **Documentation**
   - Swagger/OpenAPI
   - Code comments
   - README files

7. **Deployment**
   - Environment variables
   - Production configuration
   - Platform deployment

---

## 📞 Need Help?

### Common Questions

**Q: My server won't start**
A: Check that:
- All dependencies are installed
- .env file exists with correct values
- MongoDB connection string is valid
- Port is not already in use

**Q: Swagger docs aren't showing**
A: Make sure:
- Server is running
- Navigate to http://localhost:3000/api-docs
- Check browser console for errors

**Q: Database connection fails**
A: Verify:
- MongoDB URI is correct in .env
- IP whitelist includes your IP (or 0.0.0.0/0)
- Database user has proper permissions
- Password doesn't contain special characters (or is URL encoded)

**Q: How do I add more features?**
A: Follow the existing patterns:
1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Add validation in `src/middleware/validator.js`
5. Update Swagger docs in `src/config/swagger.js`
6. Mount routes in `src/app.js`

---

## 🎉 Congratulations!

You now have a professional-grade REST API with:
- ✅ Two complete collections
- ✅ Full CRUD operations
- ✅ Comprehensive error handling
- ✅ Beautiful Swagger documentation
- ✅ Production-ready code
- ✅ Clear, understandable structure

**This project demonstrates real-world API development skills that employers look for!**

Good luck with your assignment! 🚀