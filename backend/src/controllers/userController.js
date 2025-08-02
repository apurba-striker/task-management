// backend/src/controllers/userController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// backend/src/controllers/userController.js
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive
    } = req.query;

    // Build filter object - Start with empty filter, not { isActive: true }
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Admin-only filters
    if (req.user.role === 'admin') {
      if (role) {
        filter.role = role;
      }
      // Only apply isActive filter if explicitly requested
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }
      // For admin user management page, show all users regardless of isActive status
    } else {
      // For regular users (task assignment), only show active users
      filter.isActive = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Different field selection based on user role
    let selectFields;
    if (req.user.role === 'admin') {
      // Admin gets all fields except password
      selectFields = '-password';
    } else {
      // Regular users get only basic fields needed for task assignment
      selectFields = 'firstName lastName email role _id';
    }

    console.log('Backend: User filter being applied:', filter); // Debug log

    const users = await User.find(filter)
      .select(selectFields)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 });

    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / parseInt(limit));

    console.log(`Backend: Found ${users.length} users out of ${total} total`); // Debug log

    logger.info(`Users fetched by ${req.user.role}: ${req.user.userId}`);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages,
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, isActive } = req.body;

    console.log('Backend: Checking for existing user with email:', email); // Debug log

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log('Backend: Existing user found:', !!existingUser); // Debug log
    
    if (existingUser) {
      console.log('Backend: User already exists, returning 409 error'); // Debug log
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    console.log('Backend: Creating new user'); // Debug log

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info(`User created: ${email} by admin: ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Backend: Create user error:', error); // Debug log
    
    // Handle specific MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      console.log('Backend: MongoDB duplicate key error for field:', field); // Debug log
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password; // Will be hashed by pre-save middleware

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info(`User updated: ${user.email} by admin: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    logger.info(`User deleted: ${user.email} by admin: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
