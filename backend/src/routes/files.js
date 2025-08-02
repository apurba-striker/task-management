// backend/src/routes/files.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const Task = require('../models/Task');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/files/download/{taskId}/{filename}:
 *   get:
 *     summary: Download a task attachment
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       403:
 *         description: Access denied
 */
router.get('/download/:taskId/:filename', async (req, res) => {
  try {
    const { taskId, filename } = req.params;

    console.log(`Backend: File download request - TaskId: ${taskId}, Filename: ${filename}, User: ${req.user.userId}`);

    // Find the task and check permissions
    const task = await Task.findById(taskId);
    if (!task) {
      console.log(`Backend: Task not found - ${taskId}`);
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    console.log(`Backend: Task found - AssignedTo: ${task.assignedTo}, CreatedBy: ${task.createdBy}`);

    // Fixed: Check if user has access to this task with null checks
    const canAccess = 
      req.user.role === 'admin' ||
      (task.assignedTo && task.assignedTo.toString() === req.user.userId) ||
      (task.createdBy && task.createdBy.toString() === req.user.userId);

    if (!canAccess) {
      console.log(`Backend: Access denied for user ${req.user.userId} to task ${taskId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the attachment
    const attachment = task.attachments.find(att => att.filename === filename);
    if (!attachment) {
      console.log(`Backend: Attachment not found in task - ${filename}`);
      return res.status(404).json({
        success: false,
        message: 'Attachment not found in task'
      });
    }

    // Fixed: Correct file path - should match your upload structure
    const filePath = path.join(__dirname, '../../uploads/tasks', filename);
    console.log(`Backend: Looking for file at path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`Backend: File not found on disk - ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Set appropriate headers based on attachment mimetype
    const mimetype = attachment.mimetype || 'application/pdf';
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    
    // Add cache control headers
    res.setHeader('Cache-Control', 'private, max-age=0');
    res.setHeader('Expires', '0');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Backend: File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      }
    });

    fileStream.pipe(res);

    logger.info(`File downloaded: ${filename} by user: ${req.user.userId}`);
  } catch (error) {
    console.error('Backend: File download error:', error);
    logger.error('File download error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

/**
 * @swagger
 * /api/files/view/{taskId}/{filename}:
 *   get:
 *     summary: View a task attachment in browser
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File viewed successfully
 *       404:
 *         description: File not found
 *       403:
 *         description: Access denied
 */
router.get('/view/:taskId/:filename', async (req, res) => {
  try {
    const { taskId, filename } = req.params;

    console.log(`Backend: File view request - TaskId: ${taskId}, Filename: ${filename}, User: ${req.user.userId}`);

    // Find the task and check permissions
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Fixed: Check if user has access to this task with null checks
    const canAccess = 
      req.user.role === 'admin' ||
      (task.assignedTo && task.assignedTo.toString() === req.user.userId) ||
      (task.createdBy && task.createdBy.toString() === req.user.userId);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the attachment
    const attachment = task.attachments.find(att => att.filename === filename);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found in task'
      });
    }

    // Fixed: Correct file path - should match your upload structure
    const filePath = path.join(__dirname, '../../uploads/tasks', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`Backend: File not found on disk for viewing - ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Set appropriate headers for inline viewing
    const mimetype = attachment.mimetype || 'application/pdf';
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
    
    // Add CORS headers for viewing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Backend: File view stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      }
    });

    fileStream.pipe(res);

    logger.info(`File viewed: ${filename} by user: ${req.user.userId}`);
  } catch (error) {
    console.error('Backend: File view error:', error);
    logger.error('File view error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

/**
 * @swagger
 * /api/files/list/{taskId}:
 *   get:
 *     summary: List all attachments for a task
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachments listed successfully
 *       404:
 *         description: Task not found
 *       403:
 *         description: Access denied
 */
router.get('/list/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    console.log(`Backend: File list request - TaskId: ${taskId}, User: ${req.user.userId}`);

    // Find the task and check permissions
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task
    const canAccess = 
      req.user.role === 'admin' ||
      (task.assignedTo && task.assignedTo.toString() === req.user.userId) ||
      (task.createdBy && task.createdBy.toString() === req.user.userId);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Return attachments with additional metadata
    const attachments = task.attachments.map(att => ({
      filename: att.filename,
      originalName: att.originalName,
      size: att.size,
      mimetype: att.mimetype,
      uploadedAt: att.uploadedAt,
      downloadUrl: `/api/files/download/${taskId}/${att.filename}`,
      viewUrl: `/api/files/view/${taskId}/${att.filename}`
    }));

    res.status(200).json({
      success: true,
      data: {
        taskId: taskId,
        attachments: attachments
      }
    });

    logger.info(`File list retrieved for task: ${taskId} by user: ${req.user.userId}`);
  } catch (error) {
    console.error('Backend: File list error:', error);
    logger.error('File list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/files/delete/{taskId}/{filename}:
 *   delete:
 *     summary: Delete a task attachment
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       403:
 *         description: Access denied
 */
router.delete('/delete/:taskId/:filename', async (req, res) => {
  try {
    const { taskId, filename } = req.params;

    console.log(`Backend: File delete request - TaskId: ${taskId}, Filename: ${filename}, User: ${req.user.userId}`);

    // Find the task and check permissions
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only allow admin or task creator to delete attachments
    const canDelete = 
      req.user.role === 'admin' ||
      (task.createdBy && task.createdBy.toString() === req.user.userId);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only task creator or admin can delete attachments.'
      });
    }

    // Find the attachment
    const attachmentIndex = task.attachments.findIndex(att => att.filename === filename);
    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found in task'
      });
    }

    // Remove attachment from task
    const attachment = task.attachments[attachmentIndex];
    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    // Delete file from disk
    const filePath = path.join(__dirname, '../../uploads/tasks', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Backend: File deleted from disk - ${filePath}`);
    }

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });

    logger.info(`File deleted: ${filename} from task: ${taskId} by user: ${req.user.userId}`);
  } catch (error) {
    console.error('Backend: File delete error:', error);
    logger.error('File delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
