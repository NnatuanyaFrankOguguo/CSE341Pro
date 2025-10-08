/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 * This file is the main entry point for the application
 */

// Load environment variables from .env file FIRST
// This must be done before importing any other modules that use env vars
require('dotenv').config();

// Import required modules
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

// Get port from environment or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Start Server Function
 * Connects to database and starts the Express server
 */
const startServer = async () => {
  try {
    logger.info('🚀 Starting Fitness Tracker API Server...');
    
    // Connect to MongoDB database
    logger.info('📊 Connecting to MongoDB database...');
    await connectDB();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      logger.success(`🎉 Server running successfully on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🔍 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log all available endpoints
      logger.info('📋 Available API Endpoints:');
      logger.info(`   • GET  /api/v1/users          - Get all users`);
      logger.info(`   • POST /api/v1/users          - Create new user`);
      logger.info(`   • GET  /api/v1/users/:id      - Get user by ID`);
      logger.info(`   • PUT  /api/v1/users/:id      - Update user`);
      logger.info(`   • DELETE /api/v1/users/:id    - Delete user`);
      logger.info(`   • GET  /api/v1/workouts       - Get all workouts`);
      logger.info(`   • POST /api/v1/workouts       - Create new workout`);
      logger.info(`   • GET  /api/v1/workouts/:id   - Get workout by ID`);
      logger.info(`   • PUT  /api/v1/workouts/:id   - Update workout`);
      logger.info(`   • DELETE /api/v1/workouts/:id - Delete workout`);
    });
    
    // Graceful shutdown handlers
    // Handle SIGTERM (termination signal)
    process.on('SIGTERM', () => {
      logger.warn('⚠️  SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Process terminated successfully');
        process.exit(0);
      });
    });
    
    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      logger.warn('⚠️  SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Process terminated successfully');
        process.exit(0);
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('💥 UNCAUGHT EXCEPTION! Shutting down application...', err);
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('💥 UNHANDLED REJECTION! Shutting down application...', err);
      server.close(() => {
        process.exit(1);
      });
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();