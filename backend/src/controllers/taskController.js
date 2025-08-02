// backend/src/controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object based on user role
    const filter = {};
    
    // Role-based filtering: Regular users only see their own tasks
    if (req.user.role !== 'admin') {
      filter.$or = [
        { assignedTo: req.user.userId },
        { createdBy: req.user.userId }
      ];
    }
    
    // Add search filters
    if (search) {
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      
      if (filter.$or) {
        // Combine user filter with search filter
        filter.$and = [
          { $or: filter.$or },
          searchFilter
        ];
        delete filter.$or;
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    // Additional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('Backend: Task filter for user', req.user.userId, ':', filter);

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    const total = await Task.countDocuments(filter);

    console.log(`Backend: Found ${tasks.length} tasks for user ${req.user.userId} (role: ${req.user.role})`);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Backend: Getting task ${id} for user ${req.user.userId} (role: ${req.user.role})`);

    const task = await Task.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Authorization check
    const canView = 
      req.user.role === 'admin' || 
      task.assignedTo?._id.toString() === req.user.userId || 
      task.createdBy?._id.toString() === req.user.userId;

    if (!canView) {
      console.log(`Backend: Access denied for user ${req.user.userId} to task ${id}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this task.'
      });
    }

    console.log(`Backend: Task found with ${task.attachments?.length || 0} attachments`); // Debug log

    res.status(200).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    logger.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createTask = async (req, res) => {
  try {
    console.log('Backend: Creating task with data:', req.body);
    console.log('Backend: Files received:', req.files?.length || 0);

    // Build task data from form fields
    const taskData = {
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'pending',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo,
      createdBy: req.user.userId
    };

    // Process tags if provided
    if (req.body.tags) {
      taskData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Process attachments if provided
    if (req.files && req.files.length > 0) {
      taskData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }));
    }

    // Validate assignedTo user exists
    const assignedUser = await User.findById(req.body.assignedTo);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    console.log('Backend: Final task data:', taskData);

    const task = new Task(taskData);
    await task.save();

    // Populate the task before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    logger.info(`Task created: ${task._id} by user: ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    console.error('Backend: Create task error:', error);
    logger.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Backend: Updating task with ID:', id);
    console.log('Backend: Update data:', req.body);
    console.log('Backend: Files received:', req.files?.length || 0);

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    const canEdit = 
      req.user.role === 'admin' || 
      task.assignedTo?.toString() === req.user.userId || 
      task.createdBy?.toString() === req.user.userId;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this task.'
      });
    }

    // Update task fields
    const updateData = {};
    
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.priority) updateData.priority = req.body.priority;
    if (req.body.dueDate) updateData.dueDate = req.body.dueDate;
    if (req.body.assignedTo) updateData.assignedTo = req.body.assignedTo;

    // Process tags
    if (req.body.tags !== undefined) {
      updateData.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    }

    // Add new attachments if provided
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }));
      
      updateData.attachments = [...(task.attachments || []), ...newAttachments];
    }

    updateData.updatedAt = new Date();

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    logger.info(`Task updated: ${id} by user: ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    console.error('Backend: Update task error:', error);
    logger.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Backend: Deleting task ${id} by user ${req.user.userId}`);

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Authorization check: Only admins and task creators can delete
    const canDelete = 
      req.user.role === 'admin' || 
      task.createdBy?.toString() === req.user.userId;

    if (!canDelete) {
      console.log(`Backend: Delete access denied for user ${req.user.userId} to task ${id}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this task.'
      });
    }

    await Task.findByIdAndDelete(id);

    console.log(`Backend: Task ${id} deleted successfully by user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
