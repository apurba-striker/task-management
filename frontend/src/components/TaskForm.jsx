// frontend/src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import { 
  Calendar, 
  Upload, 
  X, 
  FileText, 
  Save,
  ArrowLeft,
  User,
  Clock,
  Flag,
  Tag,
  FileIcon,
  CheckCircle,
  AlertCircle,
  Zap,
  Plus
} from 'lucide-react';
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
    fetchTask,
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
    toast.success(`${pdfFiles.length} file(s) added successfully`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 3
  });

  const removeAttachment = (index) => {
    const removedFile = attachments[index];
    setAttachments(prev => prev.filter((_, i) => i !== index));
    toast.success(`${removedFile.name} removed`);
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
        toast.success('🎉 Task updated successfully');
      } else {
        console.log('TaskForm: Creating new task');
        await createTask(taskData);
        toast.success('🚀 Task created successfully');
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('TaskForm: Form submission error:', error);
      toast.error(error.message || 'An error occurred');
    }
  };

  // Priority color helper
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 font-medium">Loading task details...</span>
        </div>
      </div>
    );
  }

  const safeUsers = users || [];
  const currentPriority = watch('priority');
  const currentStatus = watch('status');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-2xl p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 transform translate-x-12 -translate-y-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/tasks')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Back to Tasks"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  {isEdit ? (
                    <>
                      <CheckCircle className="h-8 w-8 mr-3 text-blue-600" />
                      Edit Task
                    </>
                  ) : (
                    <>
                      <Plus className="h-8 w-8 mr-3 text-green-600" />
                      Create New Task
                    </>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit ? 'Update your task details below' : 'Fill in the details to create a new task'}
                </p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-500 ml-2">Step 1 of 3</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8 space-y-8">
            {/* Title Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Task Information</h2>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Task Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Task title is required' })}
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter a descriptive task title..."
                />
                {errors.title && (
                  <p className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe the task in detail..."
                />
                <p className="text-xs text-gray-500">Provide any additional context or requirements</p>
              </div>
            </div>

            {/* Status & Priority Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Flag className="h-4 w-4 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Status & Priority</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      {...register('status')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                    >
                      <option value="pending">📋 Pending</option>
                      <option value="in-progress">🔄 In Progress</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                    {currentStatus && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentStatus)}`}>
                          {currentStatus.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      {...register('priority')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                    {currentPriority && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(currentPriority)}`}>
                          {currentPriority}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment & Timeline Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Assignment & Timeline</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned To */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Assign To *
                  </label>
                  <select
                    {...register('assignedTo', { required: 'Please assign this task to someone' })}
                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.assignedTo ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  >
                    <option value="">
                      {loading ? '⏳ Loading users...' : '👤 Select team member'}
                    </option>
                    {safeUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors.assignedTo && (
                    <p className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.assignedTo.message}
                    </p>
                  )}
                  {usersError && (
                    <p className="flex items-center text-yellow-600 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {usersError}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Due Date *
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={dueDate}
                      onChange={setDueDate}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholderText="📅 Select due date"
                      minDate={new Date()}
                      dateFormat="MMM dd, yyyy"
                      showPopperArrow={false}
                    />
                    <Calendar className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500">Choose a realistic deadline for this task</p>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Tag className="h-4 w-4 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Tags & Labels</h2>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter tags separated by commas (e.g., urgent, frontend, bug-fix)"
                />
                <p className="text-xs text-gray-500 flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  Use tags to categorize and filter tasks easily
                </p>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileIcon className="h-4 w-4 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
              </div>

              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 scale-105'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                      isDragActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Upload className={`h-8 w-8 ${
                        isDragActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    {isDragActive ? (
                      <div className="space-y-2">
                        <p className="text-blue-600 font-medium text-lg">Drop the files here! 🎯</p>
                        <p className="text-blue-500 text-sm">Release to upload your PDF files</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-700 font-medium text-lg">
                          📎 Drag & drop PDF files here
                        </p>
                        <p className="text-gray-500">
                          or <span className="text-blue-600 font-medium">click to browse</span>
                        </p>
                        <div className="bg-gray-100 rounded-lg p-3 mt-4">
                          <p className="text-sm text-gray-600">
                            📋 <strong>Requirements:</strong> PDF files only • Maximum 3 files • Up to 10MB each
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attached Files */}
                {attachments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Attached Files ({attachments.length}/3)
                    </h4>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100"
                        >
                          <div className="flex items-center flex-1">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                All fields marked with * are required
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/tasks')}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group px-8 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    loading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 transform hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                      {isEdit ? 'Update Task' : 'Create Task'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use descriptive titles to make tasks easily identifiable</li>
                <li>• Set realistic due dates to maintain team productivity</li>
                <li>• Add relevant tags for better organization and filtering</li>
                <li>• Attach PDFs for specifications, mockups, or reference materials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
