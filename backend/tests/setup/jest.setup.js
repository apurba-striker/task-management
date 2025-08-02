// Set environment variables before importing anything
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb+srv://apurbapatra12:apurbaP@Cluster0.dovgxio.mongodb.net/taskmanagement_test?retryWrites=true&w=majority';

// Suppress console logs during testing (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}
