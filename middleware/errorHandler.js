/**
 * Centralized error handling middleware
 * Handles all errors in a consistent way and prevents exposing sensitive information
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  const errorStack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  console.error('Error:', {
    message: err.message,
    stack: errorStack,
    name: err.name,
  });

  // Sequelize errors - never expose details in production
  if (err.name && err.name.startsWith('Sequelize')) {
    // Validation errors
    if (err.name === 'SequelizeValidationError') {
      const details = process.env.NODE_ENV === 'development' ?
        err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })) :
        'Invalid data provided';
      return res.status(400).json({
        error: 'Validation Error',
        details,
      });
    }

    // Database errors
    if (err.name === 'SequelizeDatabaseError') {
      const message = process.env.NODE_ENV === 'development' ?
        err.message :
        'An internal database error occurred';
      return res.status(500).json({
        error: 'Database Error',
        message,
      });
    }

    // Unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = process.env.NODE_ENV === 'development' && err.errors && err.errors[0] ?
        err.errors[0].path :
        undefined;
      return res.status(409).json({
        error: 'Duplicate Entry',
        message: 'A record with this information already exists',
        field,
      });
    }

    // Generic Sequelize errors
    const message = process.env.NODE_ENV === 'development' ?
      err.message :
      'An internal error occurred';
    return res.status(500).json({
      error: 'Database Error',
      message,
    });
  }

  // Custom application errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || 'An error occurred',
    });
  }

  // Default error handler
  const message = process.env.NODE_ENV === 'development' ?
    err.message :
    'An unexpected error occurred';
  return res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
};

module.exports = errorHandler;
