/**
 * Logger Utility
 * Provides comprehensive logging functionality with different log levels
 * Includes timestamps, colors, and structured logging for better debugging
 */

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

/**
 * Get formatted timestamp
 * Returns current date and time in a readable format
 */
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Format log message with color and timestamp
 * @param {string} level - Log level (INFO, ERROR, etc.)
 * @param {string} message - Main log message
 * @param {string} color - ANSI color code
 * @param {any} data - Additional data to log
 */
const formatLog = (level, message, color, data = null) => {
  const timestamp = getTimestamp();
  const formattedMessage = `${color}[${timestamp}] ${level}:${colors.reset} ${message}`;
  
  // Log to console
  if (data) {
    console.log(formattedMessage);
    
    // Pretty print objects and arrays
    if (typeof data === 'object') {
      console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    } else {
      console.log(`${colors.dim}${data}${colors.reset}`);
    }
  } else {
    console.log(formattedMessage);
  }
};

/**
 * Logger object with different log levels
 * Each method provides colored output for easy identification
 */
const logger = {
  /**
   * Info level logging - General information
   * Use for: Application flow, configuration, general messages
   */
  info: (message, data = null) => {
    formatLog('INFO', message, colors.blue, data);
  },
  
  /**
   * Success level logging - Successful operations
   * Use for: Successful API calls, database operations, startup messages
   */
  success: (message, data = null) => {
    formatLog('SUCCESS', message, colors.green, data);
  },
  
  /**
   * Warning level logging - Potential issues
   * Use for: Deprecated features, missing optional data, performance issues
   */
  warn: (message, data = null) => {
    formatLog('WARN', message, colors.yellow, data);
  },
  
  /**
   * Error level logging - Errors and exceptions
   * Use for: Caught errors, validation failures, system errors
   */
  error: (message, error = null) => {
    formatLog('ERROR', message, colors.red);
    
    if (error) {
      // Handle different error types
      if (error instanceof Error) {
        console.log(`${colors.red}${colors.dim}Stack Trace:${colors.reset}`);
        console.log(`${colors.red}${colors.dim}${error.stack}${colors.reset}`);
      } else if (typeof error === 'object') {
        console.log(`${colors.red}${colors.dim}Error Details:${colors.reset}`);
        console.log(`${colors.red}${colors.dim}${JSON.stringify(error, null, 2)}${colors.reset}`);
      } else {
        console.log(`${colors.red}${colors.dim}${error}${colors.reset}`);
      }
    }
  },
  
  /**
   * Debug level logging - Development information
   * Use for: Variable values, function entry/exit, detailed flow
   */
  debug: (message, data = null) => {
    // Only show debug logs in development
    if (process.env.NODE_ENV === 'development') {
      formatLog('DEBUG', message, colors.magenta, data);
    }
  },
  
  /**
   * Database level logging - Database operations
   * Use for: Queries, connections, database events
   */
  database: (message, data = null) => {
    formatLog('DB', message, colors.cyan, data);
  },
  
  /**
   * HTTP Request logging - API requests
   * Use for: Incoming requests, responses, middleware
   */
  request: (method, path, data = null) => {
    const message = `${method.toUpperCase()} ${path}`;
    formatLog('REQUEST', message, colors.white, data);
  },
  
  /**
   * HTTP Response logging - API responses
   * Use for: Outgoing responses, status codes
   */
  response: (status, message, data = null) => {
    const color = status >= 400 ? colors.red : status >= 300 ? colors.yellow : colors.green;
    formatLog(`RESPONSE ${status}`, message, color, data);
  },
  
  /**
   * Validation logging - Input validation
   * Use for: Validation errors, schema validation
   */
  validation: (message, data = null) => {
    formatLog('VALIDATION', message, colors.yellow, data);
  },
  
  /**
   * Authentication logging - Auth operations
   * Use for: Login attempts, token validation, permissions
   */
  auth: (message, data = null) => {
    formatLog('AUTH', message, colors.magenta, data);
  },
  
  /**
   * Performance logging - Performance metrics
   * Use for: Execution times, memory usage, bottlenecks
   */
  performance: (message, data = null) => {
    formatLog('PERF', message, colors.cyan, data);
  },
  
  /**
   * Security logging - Security events
   * Use for: Security violations, suspicious activity
   */
  security: (message, data = null) => {
    formatLog('SECURITY', message, `${colors.bgRed}${colors.white}`, data);
  },
};

// Export the logger
module.exports = logger;