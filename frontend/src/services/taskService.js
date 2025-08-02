// frontend/src/services/taskService.js
import api from './api';

const taskService = {
  // Get all tasks with filters and pagination
  getTasks: (params = {}) => {
    console.log('TaskService: Getting tasks with params:', params);
    return api.get('/tasks', { params })
      .then(response => {
        console.log('TaskService: Get tasks response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('TaskService: Get tasks error:', error);
        throw error;
      });
  },

  // Get single task
  getTask: (id) => {
    console.log('TaskService: Getting task with ID:', id);
    if (!id) {
      throw new Error('Task ID is required');
    }
    return api.get(`/tasks/${id}`)
      .then(response => {
        console.log('TaskService: Get task response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('TaskService: Get task error:', error);
        throw error;
      });
  },

  // Create new task
  createTask: (taskData) => {
    console.log('TaskService: Creating task with data:', taskData);
    
    try {
      const formData = new FormData();
      
      // Append task data (excluding attachments)
      Object.keys(taskData).forEach(key => {
        if (key !== 'attachments' && taskData[key] !== undefined && taskData[key] !== null) {
          // Handle arrays (like tags) by converting to JSON string or comma-separated values
          if (Array.isArray(taskData[key])) {
            formData.append(key, JSON.stringify(taskData[key]));
          } else {
            formData.append(key, taskData[key]);
          }
          console.log(`TaskService: Appended ${key}:`, taskData[key]);
        }
      });

      // Append files if they exist
      if (taskData.attachments && Array.isArray(taskData.attachments)) {
        console.log('TaskService: Appending', taskData.attachments.length, 'files');
        taskData.attachments.forEach((file, index) => {
          if (file instanceof File) {
            formData.append('attachments', file);
            console.log(`TaskService: Appended file ${index + 1}:`, file.name, file.size);
          } else {
            console.warn('TaskService: Invalid file object at index', index, file);
          }
        });
      }

      // Log FormData contents for debugging
      console.log('TaskService: FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      return api.post('/tasks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(response => {
        console.log('TaskService: Create task response:', response.data);
        return response;
      });
    } catch (error) {
      console.error('TaskService: Create task error:', error);
      throw error;
    }
  },

  // Update task
  updateTask: (id, taskData) => {
    console.log('TaskService: Updating task with ID:', id, 'and data:', taskData);
    
    if (!id) {
      throw new Error('Task ID is required for update');
    }
    
    try {
      const formData = new FormData();
      
      // Append task data (excluding attachments)
      Object.keys(taskData).forEach(key => {
        if (key !== 'attachments' && taskData[key] !== undefined && taskData[key] !== null) {
          // Handle arrays (like tags) by converting to JSON string or comma-separated values
          if (Array.isArray(taskData[key])) {
            formData.append(key, JSON.stringify(taskData[key]));
          } else {
            formData.append(key, taskData[key]);
          }
          console.log(`TaskService: Appended ${key}:`, taskData[key]);
        }
      });

      // Append new files if they exist
      if (taskData.attachments && Array.isArray(taskData.attachments)) {
        console.log('TaskService: Appending', taskData.attachments.length, 'files for update');
        taskData.attachments.forEach((file, index) => {
          if (file instanceof File) {
            formData.append('attachments', file);
            console.log(`TaskService: Appended file ${index + 1}:`, file.name, file.size);
          } else {
            console.warn('TaskService: Invalid file object at index', index, file);
          }
        });
      }

      // Log FormData contents for debugging
      console.log('TaskService: Update FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      return api.put(`/tasks/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(response => {
        console.log('TaskService: Update task response:', response.data);
        return response;
      });
    } catch (error) {
      console.error('TaskService: Update task error:', error);
      throw error;
    }
  },

  // Delete task
  deleteTask: (id) => {
    console.log('TaskService: Deleting task with ID:', id);
    
    if (!id) {
      throw new Error('Task ID is required for deletion');
    }
    
    return api.delete(`/tasks/${id}`)
      .then(response => {
        console.log('TaskService: Delete task response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('TaskService: Delete task error:', error);
        throw error;
      });
  },

  // Download attachment
  downloadAttachment: (taskId, filename) => {
    console.log('TaskService: Downloading attachment:', { taskId, filename });
    
    if (!taskId || !filename) {
      throw new Error('Task ID and filename are required for download');
    }
    
    return api.get(`/files/download/${taskId}/${filename}`, {
      responseType: 'blob',
    }).then(response => {
      console.log('TaskService: Download response received, blob size:', response.data.size);
      return response;
    }).catch(error => {
      console.error('TaskService: Download error:', error);
      throw error;
    });
  },

  // Get assignable users (for task assignment)
  getAssignableUsers: () => {
    console.log('TaskService: Getting assignable users');
    return api.get('/tasks/assignable-users')
      .then(response => {
        console.log('TaskService: Get assignable users response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('TaskService: Get assignable users error:', error);
        throw error;
      });
  },

  // Update task status (quick status update)
  updateTaskStatus: (id, status) => {
    console.log('TaskService: Updating task status:', { id, status });
    
    if (!id || !status) {
      throw new Error('Task ID and status are required');
    }
    
    return api.patch(`/tasks/${id}/status`, { status })
      .then(response => {
        console.log('TaskService: Update status response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('TaskService: Update status error:', error);
        throw error;
      });
  },

  // Get tasks by user (for dashboard)
  getTasksByUser: (userId, params = {}) => {
    console.log('TaskService: Getting tasks by user:', { userId, params });
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    return api.get(`/tasks/user/${userId}`, { params })
      .then(response => {
        console.log('TaskService: Get tasks by user response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('TaskService: Get tasks by user error:', error);
        throw error;
      });
  },

  // Get task statistics
  getTaskStatistics: () => {
    console.log('TaskService: Getting task statistics');
    return api.get('/tasks/statistics')
      .then(response => {
        console.log('TaskService: Get statistics response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('TaskService: Get statistics error:', error);
        throw error;
      });
  }
};

export default taskService;
