// frontend/src/services/authService.js
import api from './api';

const authService = {
  register: async (userData) => {
    console.log('Auth service: Registration request', userData);
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    console.log('Auth service: Login request', { email });
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
   validateToken: async () => {
    const response = await api.get('/auth/me'); // This should be a protected route
    return response.data;
  }
};

export default authService;
