// backend/src/routes/tasks.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// GET routes (unchanged)
router.get('/', getTasks);
router.get('/:id', getTask);

// POST route for creating tasks
router.post('/', 
  upload.array('attachments', 3), // Handle file upload first
  [
    // Validation rules for multipart form data
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    
    body('dueDate')
      .notEmpty()
      .withMessage('Due date is required')
      .isISO8601()
      .withMessage('Invalid due date format'),
    
    body('assignedTo')
      .notEmpty()
      .withMessage('Assigned user is required')
      .isMongoId()
      .withMessage('Invalid user ID'),
    
    body('tags')
      .optional()
      .trim()
  ],
  handleValidationErrors,
  createTask
);

// PUT route for updating tasks
router.put('/:id', 
  upload.array('attachments', 3), // Handle file upload first
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid due date format'),
    
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('Invalid user ID'),
    
    body('tags')
      .optional()
      .trim()
  ],
  handleValidationErrors,
  updateTask
);

// DELETE route (unchanged)
router.delete('/:id', deleteTask);

module.exports = router;
