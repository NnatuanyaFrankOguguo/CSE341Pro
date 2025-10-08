/**
 * Error Handling Middleware
 * Provides comprehensive error handling for the entire application
 * Includes custom error classes, async handler, and global error handler
 */

const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

/**
 * Custom Application Error Class
 * Extends the built-in Error class with additional properties
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Distinguishes operational errors from programming errors
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Log error creation
    logger.debug('AppError created', {
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
    });
  }
}

/**
 * Async Handler Wrapper
 * Wraps async controller functions to automatically catch errors
 * Eliminates the need for try-catch blocks in every controller
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Async handler caught error', error);
      next(error);
    });
  };
};

/**
 * Handle Mongoose Validation Errors
 * Converts Mongoose validation errors to user-friendly format
 */
const handleValidationError = (error) => {
  logger.validation('Mongoose validation error occurred', {
    errorCount: Object.keys(error.errors).length,
    fields: Object.keys(error.errors),
  });
  
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));
  
  return new AppError('Validation failed', 400, true);
};

/**
 * Handle Mongoose Duplicate Key Errors
 * Converts MongoDB duplicate key errors to user-friendly format
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  logger.validation('Duplicate key error occurred', {
    field,
    value,
  });
  
  const message = `A record with ${field} '${value}' already exists. Please use a different ${field}.`;
  return new AppError(message, 409, true);
};

/**
 * Handle Mongoose Cast Errors
 * Converts invalid ObjectId errors to user-friendly format
 */
const handleCastError = (error) => {
  logger.validation('Invalid ID format', {
    path: error.path,
    value: error.value,
  });
  
  const message = `Invalid ${error.path}: ${error.value}. Please provide a valid ID.`;
  return new AppError(message, 400, true);
};

/**
 * Handle JWT Errors
 * Converts JWT errors to user-friendly format
 */
const handleJWTError = () => {
  logger.auth('Invalid JWT token');
  return new AppError('Invalid token. Please log in again.', 401, true);
};

const handleJWTExpiredError = () => {
  logger.auth('Expired JWT token');
  return new AppError('Your session has expired. Please log in again.', 401, true);
};

/**
 * Not Found Middleware
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  
  const message = `Cannot ${req.method} ${req.path} - Route not found`;
  const error = new AppError(message, 404, true);
  
  next(error);
};

/**
 * Global Error Handler Middleware
 * Centralized error handling for the entire application
 */
const errorHandler = (err, req, res, next) => {
  // Create a copy of the error
  let error = { ...err };
  error.message = err.message;
  
  // Log the original error
  logger.error('Global error handler triggered', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }
  
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }
  
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }
  
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  
  // Handle operational vs programming errors
  if (!error.isOperational) {
    logger.error('Programming error detected', {
      message: error.message,
      stack: error.stack,
    });
    
    // In production, don't leak programming error details
    if (process.env.NODE_ENV === 'production') {
      error = new AppError('Something went wrong. Please try again later.', 500, true);
    }
  }
  
  // Default error values
  const statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  
  // In production, provide generic error messages for server errors
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }
  
  // Handle validation errors specifically
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Send error response
  sendError(
    res,
    statusCode,
    message,
    null,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

/**
 * Rate Limit Error Handler
 * Handles rate limiting errors with detailed logging
 */
const rateLimitHandler = (req, res) => {
  logger.security('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    userAgent: req.get('User-Agent'),
  });
  
  sendError(
    res,
    429,
    'Too many requests from this IP. Please try again later.',
    [{
      type: 'rate_limit',
      message: 'Request rate limit exceeded',
      retryAfter: '15 minutes',
    }]
  );
};

/**
 * Export all error handling utilities
 */
module.exports = {
  AppError,
  asyncHandler,
  notFound,
  errorHandler,
  rateLimitHandler,
};