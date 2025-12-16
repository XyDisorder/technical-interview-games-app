const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for game creation and update
 */
const validateGame = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must be less than 255 characters'),
  body('platform')
    .isIn(['ios', 'android'])
    .withMessage('Platform must be either ios or android'),
  body('storeId')
    .trim()
    .notEmpty()
    .withMessage('StoreId is required'),
  body('publisherId')
    .optional()
    .trim(),
  body('bundleId')
    .optional()
    .trim(),
  body('appVersion')
    .optional()
    .trim(),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array().map((err) => ({
          field: err.path || err.param,
          message: err.msg,
        })),
      });
    }
    return next();
  },
];

/**
 * Validation middleware for game search
 */
const validateSearch = [
  body('name')
    .optional()
    .trim(),
  body('platform')
    .optional()
    .custom((value) => {
      if (!value || value === '' || value === 'all' || value === 'ios' || value === 'android') {
        return true;
      }
      throw new Error('Platform must be either ios, android, all');
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array().map((err) => ({
          field: err.path || err.param,
          message: err.msg,
        })),
      });
    }
    return next();
  },
];

module.exports = {
  validateGame,
  validateSearch,
};
