// frontend/src/store/userStore.js
import { create } from 'zustand';
import userService from '../services/userService';

const useUserStore = create((set, get) => ({
  // State - Initialize users as empty array
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  },

  // Actions
  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      console.log('UserStore: Fetching users with params:', params); // Debug log
      
      const response = await userService.getUsers(params);
      console.log('UserStore: Fetch users API response:', response.data); // Debug log
      
      // Handle different response structures
      const responseData = response.data.data || response.data;
      const { users, pagination } = responseData;
      
      set({
        users: Array.isArray(users) ? users : [],
        pagination: pagination || {
          current: 1,
          pages: 1,
          total: 0,
          limit: 10
        },
        loading: false,
        error: null
      });
      
      return { users: Array.isArray(users) ? users : [], pagination };
    } catch (error) {
      console.error('UserStore: Fetch users error:', error); // Debug log
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      set({
        loading: false,
        error: errorMessage,
        users: [] // Set to empty array on error
      });
      throw new Error(errorMessage);
    }
  },

  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      console.log('UserStore: Fetching user with id:', id); // Debug log
      
      const response = await userService.getUser(id);
      console.log('UserStore: Fetch user API response:', response.data); // Debug log
      
      // Handle different response structures
      const responseData = response.data.data || response.data;
      const { user } = responseData;
      
      set({
        currentUser: user,
        loading: false,
        error: null
      });
      
      return user;
    } catch (error) {
      console.error('UserStore: Fetch user error:', error); // Debug log
      const errorMessage = error.response?.data?.message || 'Failed to fetch user';
      set({
        loading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      console.log('UserStore: Creating user with data:', userData); // Debug log
      
      const response = await userService.createUser(userData);
      console.log('UserStore: Create user API response:', response); // Debug log
      
      // Handle different response structures
      const responseData = response.data.data || response.data;
      const { user } = responseData;
      
      set((state) => ({
        users: [user, ...state.users],
        loading: false,
        error: null
      }));
      
      console.log('UserStore: User added to state successfully'); // Debug log
      return user;
    } catch (error) {
      console.error('UserStore: Create user error:', error); // Debug log
      console.error('UserStore: Error response:', error.response); // Debug log
      
      // Extract error message from different response formats
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to create user';
      
      set({
        loading: false,
        error: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  },

  updateUser: async (id, userData) => {
    set({ loading: true, error: null });
    try {
      console.log('UserStore: Updating user with id:', id, 'and data:', userData); // Debug log
      
      const response = await userService.updateUser(id, userData);
      console.log('UserStore: Update user API response:', response.data); // Debug log
      
      // Handle different response structures
      const responseData = response.data.data || response.data;
      const { user } = responseData;
      
      set((state) => ({
        users: state.users.map(u => u._id === id ? user : u),
        currentUser: state.currentUser?._id === id ? user : state.currentUser,
        loading: false,
        error: null
      }));
      
      return user;
    } catch (error) {
      console.error('UserStore: Update user error:', error); // Debug log
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      set({
        loading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      console.log('UserStore: Deleting user with id:', id); // Debug log
      
      await userService.deleteUser(id);
      console.log('UserStore: User deleted successfully'); // Debug log
      
      set((state) => ({
        users: state.users.filter(user => user._id !== id),
        loading: false,
        error: null
      }));
      
      return id;
    } catch (error) {
      console.error('UserStore: Delete user error:', error); // Debug log
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      set({
        loading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  clearCurrentUser: () => set({ currentUser: null }),

  clearError: () => set({ error: null })
}));

export default useUserStore;
