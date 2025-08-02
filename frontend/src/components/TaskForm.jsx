// frontend/src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import { Calendar, Upload, X, FileText } from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';

const TaskForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  
  const { 
    currentTask, 
    loading, 
    fetchTask,    // ← Make sure this is included
    createTask, 
    updateTask 
  } = useTaskStore();
  
  const { users, fetchUsers } = useUserStore();
  const { user: currentUser } = useAuthStore();
  
  const [attachments, setAttachments] = useState([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [usersError, setUsersError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      tags: ''
    }
  });

  useEffect(() => {
    // Fetch users with error handling
    const loadUsers = async () => {
      setUsersError(null);
      try {
        await fetchUsers();
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsersError('Failed to load users. You may not have permission to view all users.');
        toast.error('Failed to load users for assignment');
      }
    };

    loadUsers();

    // Fetch task data if editing
    if (isEdit && id) {
      console.log('TaskForm: Fetching task for editing, ID:', id);
      fetchTask(id).catch(error => {
        console.error('Failed to fetch task:', error);
        toast.error('Failed to load task data');
        navigate('/tasks');
      });
    }
  }, [fetchUsers, fetchTask, id, isEdit, navigate]);

  useEffect(() => {
    if (isEdit && currentTask) {
      console.log('TaskForm: Populating form with task data:', currentTask);
      setValue('title', currentTask.title);
      setValue('description', currentTask.description || '');
      setValue('status', currentTask.status);
      setValue('priority', currentTask.priority);
      setValue('assignedTo', currentTask.assignedTo?._id || '');
      setValue('tags', currentTask.tags?.join(', ') || '');
      setDueDate(new Date(currentTask.dueDate));
    }
  }, [isEdit, currentTask, setValue]);

  const onDrop = (acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (attachments.length + pdfFiles.length > 3) {
      toast.error('Maximum 3 files allowed');
      return;
    }

    setAttachments(prev => [...prev, ...pdfFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 3
  });

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      console.log('TaskForm: Submitting task data:', data);
      
      const taskData = {
        ...data,
        dueDate: dueDate.toISOString(),
        attachments
      };

      if (isEdit) {
        console.log('TaskForm: Updating task');
        await updateTask(id, taskData);
        toast.success('Task updated successfully');
      } else {
        console.log('TaskForm: Creating new task');
        await createTask(taskData);
        toast.success('Task created successfully');
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('TaskForm: Form submission error:', error);
      toast.error(error.message || 'An error occurred');
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading task...</span>
      </div>
    );
  }

  // Add null checks and default to empty array
  const safeUsers = users || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To *
              </label>
              <select
                {...register('assignedTo', { required: 'Please assign this task to someone' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Loading users...' : 'Select user'}
                </option>
                {safeUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message}</p>
              )}
              {usersError && (
                <p className="mt-1 text-sm text-yellow-600">{usersError}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <div className="relative">
                <DatePicker
                  selected={dueDate}
                  onChange={setDueDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Select due date"
                  minDate={new Date()}
                  dateFormat="MMM dd, yyyy"
                />
                <Calendar className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              {...register('tags')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (PDF only, max 3 files)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-1">
                    Drag & drop PDF files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum 3 files, PDF format only
                  </p>
                </div>
              )}
            </div>

            {/* Attached Files */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Attached Files:</h4>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
