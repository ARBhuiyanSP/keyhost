const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('user_type')
    .optional()
    .isIn(['admin', 'property_owner', 'guest'])
    .withMessage('Invalid user type'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Property validation
const validateProperty = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),
  body('property_type')
    .isIn(['room', 'villa', 'apartment', 'house'])
    .withMessage('Invalid property type'),
  body('address')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters long'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('base_price')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('max_guests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Max guests must be between 1 and 20'),
  handleValidationErrors
];

// Booking validation
const validateBooking = [
  body('property_id')
    .isInt({ min: 1 })
    .withMessage('Valid property ID is required'),
  body('check_in_date')
    .isISO8601()
    .withMessage('Valid check-in date is required'),
  body('check_out_date')
    .isISO8601()
    .withMessage('Valid check-out date is required'),
  body('number_of_guests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be between 1 and 20'),
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('booking_id')
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Property ID parameter validation
const validatePropertyId = [
  param('propertyId')
    .isInt({ min: 1 })
    .withMessage('Valid property ID is required'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProperty,
  validateBooking,
  validateReview,
  validateId,
  validatePropertyId,
  validatePagination
};
