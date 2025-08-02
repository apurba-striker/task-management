const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../src/models/User');
const { login, register } = require('../../../src/controllers/authController');
const { validationResult } = require('express-validator');

jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe'
            }),
            token: expect.any(String)
          })
        })
      );
    });

    it('should not register user with existing email', async () => {
      // Create existing user first
      await createTestUser({ email: 'existing@example.com' });

      const req = mockRequest({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User already exists'
        })
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Create test user with known password
      await createTestUser({
        email: 'test@example.com',
        password: 'password123' // createTestUser will hash this properly
      });

      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com'
            }),
            token: expect.any(String)
          })
        })
      );
    });

    it('should not login user with invalid credentials', async () => {
      // Create test user
      await createTestUser({ 
        email: 'test@example.com',
        password: 'correctpassword'
      });

      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials'
        })
      );
    });
  });
});

beforeEach(() => {
  validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
});
