// backend/src/routes/users.js
const express = require('express');
const { body, param } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * Get all users - Admin gets full access, regular users get basic info for task assignment
 */
router.get('/', getUsers); // Allow all authenticated users

/**
 * Get specific user - Admin only
 */
router.get('/:id', authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid user ID')
], getUser);

/**
 * Create new user - Admin only
 */
router.post('/', authorize('admin'), [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], createUser);

/**
 * Update user - Admin only
 */
router.put('/:id', authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('Last name cannot be empty'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], updateUser);

/**
 * Delete user - Admin only
 */
router.delete('/:id', authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid user ID')
], deleteUser);

module.exports = router;
