// frontend/src/services/userService.js
import api from './api';

const userService = {
  getUsers: (params = {}) => {
    return api.get('/users', { params });
  },

  getUser: (id) => {
    return api.get(`/users/${id}`);
  },

  createUser: (userData) => {
    return api.post('/users', userData);
  },

  updateUser: (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },
};

export default userService;
