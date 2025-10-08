/**
 * Express App Configuration
 * Sets up Express application with middleware and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const logger = require('./utils/logger');
const swaggerSpec = require('./config/swagger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

logger.info('Initializing Express application...');

// Create Express app
const app = express();

// ========== SECURITY MIDDLEWARE ==========

// Helmet: Sets various HTTP headers for security
// Protects against common vulnerabilities
logger.info('Applying Helmet security middleware...');
app.use(helmet());

// CORS: Enable Cross-Origin Resource Sharing
// Allows your API to be accessed from different domains
logger.info('Applying CORS middleware...');
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Update with your frontend URL in production
    : '*', // Allow all origins in development
  credentials: true,
}));

// Rate Limiting: Prevent abuse by limiting requests per IP
// Limits each IP to 100 requests per 15 minutes
logger.info('Applying rate limiting middleware...');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});

// Apply rate limiting to all routes
app.use(limiter);

// ========== BODY PARSER MIDDLEWARE ==========

// Parse JSON request bodies
// Allows you to access req.body in your controllers
logger.info('Applying body parser middleware...');
app.use(express.json({ limit: '10mb' })); // Limit payload size

// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== REQUEST LOGGING MIDDLEWARE ==========

// Log all incoming requests
app.use((req, res, next) => {
  logger.request(req.method, req.path, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip,
  });
  next();
});

// ========== API DOCUMENTATION ==========

// Swagger UI documentation at /api-docs
logger.info('Setting up Swagger documentation at /api-docs...');
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Fitness Tracker API Documentation',
  })
);

logger.success('Swagger documentation available at /api-docs');

// ========== HEALTH CHECK ROUTE ==========

// Simple health check endpoint
// Useful for monitoring services and load balancers
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({
    success: true,
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Server uptime in seconds
    environment: process.env.NODE_ENV,
  });
});

// Welcome route
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.status(200).json({
    success: true,
    message: 'Welcome to Fitness Tracker API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      users: '/api/v1/users',
      workouts: '/api/v1/workouts',
      health: '/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========== API ROUTES ==========

logger.info('Mounting API routes...');

// Mount user routes at /api/v1/users
app.use('/api/v1/users', userRoutes);
logger.success('User routes mounted at /api/v1/users');

// Mount workout routes at /api/v1/workouts
app.use('/api/v1/workouts', workoutRoutes);
logger.success('Workout routes mounted at /api/v1/workouts');

// ========== ERROR HANDLING ==========

// 404 Not Found Handler
// Catches all requests to undefined routes
logger.info('Applying 404 handler...');
app.use(notFound);

// Global Error Handler
// Catches all errors thrown in the application
logger.info('Applying global error handler...');
app.use(errorHandler);

logger.success('Express application configured successfully');

// Export the configured app
module.exports = app;