// backend/src/server.js
const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger');
require('dotenv').config();

// Only connect to MongoDB and start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Database connection
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement')
  .then(() => {
    logger.info('Connected to MongoDB');
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

  // MongoDB connection event handlers
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
    console.error('❌ MongoDB error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    console.warn('⚠️ MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
    console.log('✅ MongoDB reconnected');
  });

  // Server setup
  const server = http.createServer(app);

  // Socket.IO
  const io = socketIo(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info('User connected:', socket.id);
    
    socket.on('join', (userId) => {
      socket.join(userId);
    });
    
    socket.on('disconnect', () => {
      logger.info('User disconnected:', socket.id);
    });
  });

  // Make io accessible to routes
  app.set('io', io);

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });

  module.exports = { app, server, io };
} else {
  // In test environment, just export the app
  module.exports = { app };
}
