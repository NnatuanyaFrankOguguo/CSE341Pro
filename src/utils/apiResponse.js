/**
 * API Response Utilities
 * Provides consistent response formatting for all API endpoints
 * Ensures standardized success and error responses across the application
 */

const logger = require('./logger');

/**
 * Send successful response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Success message
 * @param {any} data - Data to send in response
 * @param {Object} meta - Optional metadata (pagination, counts, etc.)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  // Log the successful response
  logger.response(statusCode, message, {
    dataType: data ? typeof data : 'null',
    dataLength: Array.isArray(data) ? data.length : undefined,
    hasMeta: !!meta,
  });
  
  // Build response object
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };
  
  // Add data if provided
  if (data !== null) {
    response.data = data;
  }
  
  // Add metadata if provided (useful for pagination)
  if (meta) {
    response.meta = meta;
  }
  
  // Send response
  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 404, 500, etc.)
 * @param {string} message - Error message
 * @param {Array} errors - Optional array of detailed errors
 * @param {string} stack - Error stack trace (only in development)
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null, stack = null) => {
  // Log the error response
  logger.response(statusCode, message, {
    errorCount: errors ? errors.length : 0,
    hasStack: !!stack,
  });
  
  // Build error response object
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  
  // Add detailed errors if provided
  if (errors && Array.isArray(errors) && errors.length > 0) {
    response.errors = errors;
  }
  
  // Add stack trace in development mode only
  if (stack && process.env.NODE_ENV === 'development') {
    response.stack = stack;
  }
  
  // Send error response
  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * Used for endpoints that return lists of data with pagination
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
const sendPaginated = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  // Log pagination details
  logger.response(200, message, {
    page,
    limit,
    total,
    totalPages,
    itemsReturned: data.length,
  });
  
  // Build pagination metadata
  const meta = {
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
  
  // Send paginated response
  sendSuccess(res, 200, message, data, meta);
};

/**
 * Send validation error response
 * Specifically for input validation errors
 * @param {Object} res - Express response object
 * @param {Array|Object} validationErrors - Validation errors from validator
 * @param {string} message - Main error message
 */
const sendValidationError = (res, validationErrors, message = 'Validation failed') => {
  let errors = [];
  
  // Handle different validation error formats
  if (Array.isArray(validationErrors)) {
    errors = validationErrors;
  } else if (validationErrors && typeof validationErrors === 'object') {
    // Convert validation object to array format
    if (validationErrors.errors) {
      // Mongoose validation errors
      errors = Object.values(validationErrors.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
    } else {
      // Custom validation errors
      errors = [validationErrors];
    }
  }
  
  // Log validation error
  logger.validation('Validation failed', {
    message,
    errorCount: errors.length,
    fields: errors.map(err => err.field || err.param).filter(Boolean),
  });
  
  // Send validation error response
  sendError(res, 400, message, errors);
};

/**
 * Send not found response
 * Standard 404 response for resources that don't exist
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource that wasn't found
 * @param {string} identifier - ID or identifier used in search
 */
const sendNotFound = (res, resource = 'Resource', identifier = null) => {
  const message = identifier 
    ? `${resource} with ID '${identifier}' not found`
    : `${resource} not found`;
  
  logger.response(404, message, { resource, identifier });
  sendError(res, 404, message);
};

/**
 * Send created response
 * Standard 201 response for successful resource creation
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the created resource
 * @param {any} data - Created resource data
 */
const sendCreated = (res, resource = 'Resource', data = null) => {
  const message = `${resource} created successfully`;
  sendSuccess(res, 201, message, data);
};

/**
 * Send no content response
 * Standard 204 response for successful operations with no content to return
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
  logger.response(204, 'No content');
  res.status(204).send();
};

/**
 * Send conflict response
 * Standard 409 response for resource conflicts (e.g., duplicate entries)
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 * @param {any} conflictData - Optional data about the conflict
 */
const sendConflict = (res, message = 'Resource conflict', conflictData = null) => {
  logger.response(409, message, conflictData);
  sendError(res, 409, message, conflictData ? [conflictData] : null);
};

/**
 * Export all response utilities
 */
module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendValidationError,
  sendNotFound,
  sendCreated,
  sendNoContent,
  sendConflict,
};