const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  console.log('Test database connected:', mongoUri);
});

afterAll(async () => {
  // Clean up
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ✅ Fixed: Better password hashing in test utility
global.createTestUser = async (userData = {}) => {
  const User = require('../../src/models/User');
  const bcrypt = require('bcryptjs');
  
  // Generate proper hashed password
  let hashedPassword;
  if (userData.password) {
    // If password is provided and not already hashed
    if (userData.password.startsWith('$2a$') || userData.password.startsWith('$2b$')) {
      hashedPassword = userData.password; // Already hashed
    } else {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }
  } else {
    hashedPassword = await bcrypt.hash('password123', 10);
  }
  
  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user',
    ...userData,
    password: hashedPassword // Ensure we use the hashed password
  };
  
  const user = await User.create(defaultUser);
  console.log('Test user created:', { id: user._id, email: user.email });
  return user;
};

global.createTestTask = async (taskData = {}, userId) => {
  const Task = require('../../src/models/Task');
  
  const defaultTask = {
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedTo: userId,
    createdBy: userId,
    ...taskData
  };
  
  const task = await Task.create(defaultTask);
  console.log('Test task created:', { id: task._id, title: task.title });
  return task;
};
