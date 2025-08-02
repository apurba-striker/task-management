// frontend/src/store/taskStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import taskService from '../services/taskService';

const useTaskStore = create(
  subscribeWithSelector((set, get) => ({
    // State - Initialize all as empty/default values
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      priority: '',
      assignedTo: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    pagination: {
      current: 1,
      pages: 1,
      total: 0,
      limit: 10
    },

    // Actions
    fetchTasks: async (params = {}) => {
      set({ loading: true, error: null });
      try {
        const currentFilters = get().filters;
        const searchParams = { ...currentFilters, ...params };
        
        console.log('TaskStore: Fetching tasks with params:', searchParams);
        
        const response = await taskService.getTasks(searchParams);
        console.log('TaskStore: Fetch tasks API response:', response.data);
        
        const responseData = response.data.data || response.data;
        const { tasks, pagination } = responseData;
        
        const safeTasks = Array.isArray(tasks) ? tasks.filter(task => task && task._id) : [];
        
        set({
          tasks: safeTasks,
          pagination: pagination || {
            current: 1,
            pages: 1,
            total: 0,
            limit: 10
          },
          loading: false,
          error: null
        });
        
        return { tasks: safeTasks, pagination };
      } catch (error) {
        console.error('TaskStore: Fetch tasks error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
        set({
          loading: false,
          error: errorMessage,
          tasks: []
        });
        throw new Error(errorMessage);
      }
    },

    // THIS IS THE MISSING FUNCTION - fetchTask (singular)
    fetchTask: async (id) => {
      set({ loading: true, error: null });
      try {
        console.log('TaskStore: Fetching task with id:', id);
        
        const response = await taskService.getTask(id);
        console.log('TaskStore: Fetch task API response:', response.data);
        
        const responseData = response.data.data || response.data;
        const { task } = responseData;
        
        set({
          currentTask: task,
          loading: false,
          error: null
        });
        
        return task;
      } catch (error) {
        console.error('TaskStore: Fetch task error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to fetch task';
        set({
          loading: false,
          error: errorMessage
        });
        throw new Error(errorMessage);
      }
    },

    createTask: async (taskData) => {
      set({ loading: true, error: null });
      try {
        console.log('TaskStore: Creating task with data:', taskData);
        
        const response = await taskService.createTask(taskData);
        console.log('TaskStore: Create task API response:', response.data);
        
        const responseData = response.data.data || response.data;
        const { task } = responseData;
        
        set((state) => ({
          tasks: [task, ...state.tasks],
          loading: false,
          error: null
        }));
        
        return task;
      } catch (error) {
        console.error('TaskStore: Create task error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to create task';
        set({
          loading: false,
          error: errorMessage
        });
        throw new Error(errorMessage);
      }
    },

    updateTask: async (id, taskData) => {
      set({ loading: true, error: null });
      try {
        console.log('TaskStore: Updating task with id:', id, 'and data:', taskData);
        
        const response = await taskService.updateTask(id, taskData);
        console.log('TaskStore: Update task API response:', response.data);
        
        const responseData = response.data.data || response.data;
        const { task } = responseData;
        
        set((state) => ({
          tasks: state.tasks.map(t => t._id === id ? task : t),
          currentTask: state.currentTask?._id === id ? task : state.currentTask,
          loading: false,
          error: null
        }));
        
        return task;
      } catch (error) {
        console.error('TaskStore: Update task error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to update task';
        set({
          loading: false,
          error: errorMessage
        });
        throw new Error(errorMessage);
      }
    },

    deleteTask: async (id) => {
      set({ loading: true, error: null });
      try {
        console.log('TaskStore: Deleting task with id:', id);
        
        await taskService.deleteTask(id);
        console.log('TaskStore: Task deleted successfully');
        
        set((state) => ({
          tasks: state.tasks.filter(task => task._id !== id),
          loading: false,
          error: null
        }));
        
        return id;
      } catch (error) {
        console.error('TaskStore: Delete task error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete task';
        set({
          loading: false,
          error: errorMessage
        });
        throw new Error(errorMessage);
      }
    },

    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters }
      }));
    },

    clearCurrentTask: () => set({ currentTask: null }),

    clearError: () => set({ error: null }),

    updateTaskInList: (updatedTask) => {
      set((state) => ({
        tasks: state.tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        )
      }));
    }
  }))
);

export default useTaskStore;
