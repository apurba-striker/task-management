// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const fileRoutes = require('./routes/files');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// ✅ Enhanced CORS configuration for Docker
const corsOptions = {
   origin: [
    'http://localhost:3000',           // Browser accessing frontend
    'http://127.0.0.1:3000',          // Alternative localhost
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
// app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => req.path === '/health'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors(corsOptions)); // ✅ Use the configured CORS options
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ✅ Request logging for debugging
app.use((req, res, next) => {
  console.log(`🔄 ${req.method} ${req.url} from ${req.get('origin') || req.ip}`);
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'A comprehensive task management system API',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// ✅ FIXED: Database connection without deprecated options
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

// ✅ MongoDB connection event handlers
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

// Socket.IO for real-time updates
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ✅ Listen on all interfaces for Docker
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = { app, server };
