const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const tradeValidation = [
  body('assetName').trim().notEmpty().withMessage('Asset name is required').toUpperCase(),
  body('positionType').isIn(['long', 'short']).withMessage('Position type must be long or short'),
  body('entryPrice').isFloat({ min: 0 }).withMessage('Entry price must be a positive number'),
  body('exitPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Exit price must be a positive number'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('leverage').optional().isInt({ min: 1, max: 125 }).withMessage('Leverage must be between 1 and 125'),
  body('status').optional().isIn(['open', 'closed', 'cancelled']).withMessage('Invalid status'),
  body('tradeDate').optional().isISO8601().withMessage('Invalid date format'),
  handleValidationErrors,
];

const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3-30 characters'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
  body('tradingStyle')
    .optional()
    .isIn(['scalper', 'day_trader', 'swing_trader', 'position_trader', 'hodler'])
    .withMessage('Invalid trading style'),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  tradeValidation,
  updateProfileValidation,
  handleValidationErrors,
};
