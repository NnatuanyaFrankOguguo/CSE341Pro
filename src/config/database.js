/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 * Includes connection options for optimal performance and error handling
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Database
 * Uses connection string from environment variables
 * Includes retry logic and comprehensive error handling
 */
const connectDB = async () => {
  try {
    logger.info('🔄 Attempting to connect to MongoDB...');
    
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Connection options for optimal performance
    const options = {
      // Maximum number of connections in the connection pool
      maxPoolSize: 10,
      
      // Minimum number of connections in the connection pool
      minPoolSize: 1,
      
      // Close connections after 30 seconds of inactivity
      maxIdleTimeMS: 30000,
      
      // Server selection timeout (30 seconds)
      serverSelectionTimeoutMS: 30000,
      
      // Socket timeout (45 seconds)
      socketTimeoutMS: 45000,
      
      // Connection timeout (30 seconds)
      connectTimeoutMS: 30000,
    };
    
    // Establish connection
    const conn = await mongoose.connect(mongoURI, options);
    
    logger.success(`✅ MongoDB Connected Successfully!`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    logger.info(`🌐 Host: ${conn.connection.host}`);
    logger.info(`🔌 Port: ${conn.connection.port}`);
    logger.info(`📈 Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    
    // Different error types require different handling
    if (error.name === 'MongooseServerSelectionError') {
      logger.error('🔗 Server selection failed. Check your connection string and network.');
    } else if (error.name === 'MongoParseError') {
      logger.error('📝 Invalid MongoDB connection string format.');
    } else if (error.name === 'MongoNetworkError') {
      logger.error('🌐 Network error occurred while connecting to MongoDB.');
    }
    
    // Exit process with failure code
    process.exit(1);
  }
};

// MongoDB connection event handlers
// These help us monitor the connection status

// When connected
mongoose.connection.on('connected', () => {
  logger.success('🔗 Mongoose connected to MongoDB');
});

// When connection is disconnected
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  Mongoose disconnected from MongoDB');
});

// When connection encounters an error
mongoose.connection.on('error', (error) => {
  logger.error('💥 Mongoose connection error:', error);
});

// When application is terminating, close the connection
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('✅ Mongoose connection closed due to application termination');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error closing Mongoose connection:', error);
    process.exit(1);
  }
});

// Export the connection function
module.exports = connectDB;