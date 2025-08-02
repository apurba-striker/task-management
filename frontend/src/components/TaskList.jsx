// frontend/src/components/TaskList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit
} from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import TaskFilters from './TaskFilter';
import Pagination from './Pagination';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TaskList = () => {
  const { 
    tasks, 
    loading, 
    pagination, 
    filters, 
    fetchTasks, 
    deleteTask 
  } = useTaskStore();
  const { user } = useAuthStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks({ ...filters, search: searchTerm }).catch(error => {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    });
  }, [fetchTasks, filters, searchTerm]);

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Helper function to check permissions
  const canUserEdit = (task) => {
    return user.role === 'admin' || 
           task.createdBy?._id === user._id || 
           task.assignedTo?._id === user._id;
  };

  const canUserDelete = (task) => {
    return user.role === 'admin' || task.createdBy?._id === user._id;
  };

  // Add null checks for arrays
  const safeTasks = tasks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <Link
          to="/tasks/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Task
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && <TaskFilters />}

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {safeTasks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">Get started by creating a new task.</p>
              <Link
                to="/tasks/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Task
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeTasks
                    .filter(task => task && task._id) // Filter out undefined tasks
                    .map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            {/* Make the entire task title clickable */}
                            <Link
                              to={`/tasks/${task._id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              {task.title || 'Untitled Task'}
                            </Link>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(task.status)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {task.status?.replace('-', ' ') || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {/* Add comprehensive null checks for assignedTo */}
                              {task.assignedTo && task.assignedTo.firstName
                                ? `${task.assignedTo.firstName} ${task.assignedTo.lastName || ''}`.trim()
                                : task.assignedTo?.email || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* View button - always visible for task participants */}
                            <Link
                              to={`/tasks/${task._id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="View task details"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                            
                            {/* Edit button - only for users who can edit */}
                            {canUserEdit(task) && (
                              <Link
                                to={`/tasks/${task._id}/edit`}
                                className="text-green-600 hover:text-green-900 flex items-center"
                                title="Edit task"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            )}
                            
                            {/* Delete button - only for users who can delete */}
                            {canUserDelete(task) && (
                              <button
                                onClick={() => handleDelete(task._id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                                title="Delete task"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.current}
          totalPages={pagination.pages}
          onPageChange={(page) => fetchTasks({ ...filters, page })}
        />
      )}
    </div>
  );
};

export default TaskList;
