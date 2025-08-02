const request = require('supertest');
const app = require('../../src/app'); // Import app directly
const jwt = require('jsonwebtoken');

describe('Task Endpoints', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for authenticated user', async () => {
      await createTestTask({}, testUser._id);
      await createTestTask({ title: 'Task 2' }, testUser._id);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task Description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: testUser._id,
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe('New Task');
    });
  });
});
