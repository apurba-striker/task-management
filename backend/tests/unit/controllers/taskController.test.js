const Task = require('../../../src/models/Task');
const { getTasks, createTask, getTask } = require('../../../src/controllers/taskController');

const mockRequest = (body = {}, user = {}, params = {}, query = {}) => ({
  body,
  user,
  params,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Task Controller', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('getTasks', () => {
    it('should return tasks for authenticated user', async () => {
      await createTestTask({}, testUser._id);
      await createTestTask({ title: 'Another Task' }, testUser._id);

      const req = mockRequest({}, { userId: testUser._id.toString(), role: 'user' });
      const res = mockResponse();

      await getTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            tasks: expect.arrayContaining([
              expect.objectContaining({
                title: expect.any(String)
              })
            ])
          })
        })
      );
    });

    it('should filter tasks by status', async () => {
      await createTestTask({ status: 'pending' }, testUser._id);
      await createTestTask({ status: 'completed' }, testUser._id);

      const req = mockRequest({}, { userId: testUser._id.toString(), role: 'user' }, {}, { status: 'completed' });
      const res = mockResponse();

      await getTasks(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.data.tasks).toHaveLength(1);
      expect(response.data.tasks[0].status).toBe('completed');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task Description',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: testUser._id.toString(),
        priority: 'high'
      };

      const req = mockRequest(taskData, { userId: testUser._id.toString() });
      const res = mockResponse();

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Task created successfully',
          data: expect.objectContaining({
            task: expect.any(Object)
          })
        })
      );
    });
  });
});
