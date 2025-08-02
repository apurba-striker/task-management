import { create } from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  initialized: false, // Add this to track initialization

  // ✅ Initialize auth state from localStorage
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        set({
          token,
          user: parsedUser,
          isAuthenticated: true,
          initialized: true
        });
        console.log('Auth restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ initialized: true });
      }
    } else {
      set({ initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await authService.login(email, password);
      
      // Store both token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        loading: false
      });
      
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await authService.register(userData);
      
      // Store both token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        loading: false
      });
      
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
  },

  // ✅ Method to check if token is still valid
  validateToken: async () => {
    const token = get().token;
    if (!token) return false;

    try {
      // Call a protected endpoint to validate token
      const response = await authService.validateToken();
      return true;
    } catch (error) {
      // Token is invalid, clear auth state
      get().logout();
      return false;
    }
  }
}));

export default useAuthStore;
