// frontend/src/components/TaskList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Edit,
  Trash2,
  MoreVertical,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Target,
  Zap,
  FileText,
  Tag
} from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import TaskFilters from './TaskFilter';
import Pagination from './Pagination';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TaskList = () => {
  const navigate = useNavigate();
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
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTasks, setSelectedTasks] = useState([]);

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
        toast.success('🗑️ Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          dot: 'bg-green-500'
        };
      case 'in-progress':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          dot: 'bg-red-500'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dot: 'bg-yellow-500'
        };
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          emoji: '🔴',
          bgGradient: 'from-red-50 to-red-100'
        };
      case 'high':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          emoji: '🟠',
          bgGradient: 'from-orange-50 to-orange-100'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          emoji: '🟡',
          bgGradient: 'from-yellow-50 to-yellow-100'
        };
      default:
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          emoji: '🟢',
          bgGradient: 'from-green-50 to-green-100'
        };
    }
  };

  const canUserEdit = (task) => {
    return user.role === 'admin' || 
           task.createdBy?._id === user._id || 
           task.assignedTo?._id === user._id;
  };

  const canUserDelete = (task) => {
    return user.role === 'admin' || task.createdBy?._id === user._id;
  };

  const safeTasks = tasks || [];

  const isOverdue = (dueDate, status) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white shadow-lg rounded-2xl p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
          
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center">
                <Target className="h-8 w-8 mr-3 text-blue-600" />
                Task Management
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                {safeTasks.length} total tasks • {safeTasks.filter(t => t.status === 'completed').length} completed
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/tasks/new"
                className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                New Task
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Controls */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search tasks by title, description, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
              
              {/* Sort Button */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                title="Toggle Sort Order"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
              
              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-xl transition-colors duration-200 ${
                  showFilters 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
            <TaskFilters />
          </div>
        )}

        {/* Task Content */}
        {loading ? (
          <div className="bg-white shadow-lg rounded-2xl p-12 border border-gray-100">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your tasks...</p>
            </div>
          </div>
        ) : safeTasks.length === 0 ? (
          <div className="bg-white shadow-lg rounded-2xl p-12 border border-gray-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? "No tasks match your search criteria. Try adjusting your filters or search terms."
                  : "Get started by creating your first task and stay organized!"
                }
              </p>
              <Link
                to="/tasks/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Task
              </Link>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          // Enhanced Table View
          <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Task Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {safeTasks
                    .filter(task => task && task._id)
                    .map((task, index) => {
                      const statusInfo = getStatusInfo(task.status);
                      const priorityInfo = getPriorityInfo(task.priority);
                      const overdue = isOverdue(task.dueDate, task.status);
                      
                      return (
                        <tr 
                          key={task._id} 
                          className="group hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                          onClick={() => handleTaskClick(task._id)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className={`w-3 h-3 rounded-full mt-2 ${statusInfo.dot}`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {task.title || 'Untitled Task'}
                                </p>
                                {task.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.slice(0, 2).map((tag, i) => (
                                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                                        <Tag className="h-2 w-2 mr-1" />
                                        {tag}
                                      </span>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <span className="text-xs text-gray-500">+{task.tags.length - 2} more</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {statusInfo.icon}
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                {task.status?.replace('-', ' ') || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${priorityInfo.color}`}>
                              <span className="mr-1">{priorityInfo.emoji}</span>
                              {task.priority || 'Normal'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {task.assignedTo?.firstName?.[0] || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {task.assignedTo && task.assignedTo.firstName
                                    ? `${task.assignedTo.firstName} ${task.assignedTo.lastName || ''}`.trim()
                                    : 'Unassigned'}
                                </p>
                                {task.assignedTo?.email && (
                                  <p className="text-xs text-gray-500">{task.assignedTo.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className={`h-4 w-4 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                              <div>
                                <p className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                  {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                                </p>
                                {overdue && (
                                  <p className="text-xs text-red-500 font-medium">Overdue</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tasks/${task._id}`);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              {canUserEdit(task) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tasks/${task._id}/edit`);
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              
                              {canUserDelete(task) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(task._id);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Enhanced Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeTasks
              .filter(task => task && task._id)
              .map((task, index) => {
                const statusInfo = getStatusInfo(task.status);
                const priorityInfo = getPriorityInfo(task.priority);
                const overdue = isOverdue(task.dueDate, task.status);
                
                return (
                  <div 
                    key={task._id}
                    onClick={() => handleTaskClick(task._id)}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${priorityInfo.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                    
                    {/* Priority Indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {statusInfo.icon}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                            {task.status?.replace('-', ' ')}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityInfo.color}`}>
                          {priorityInfo.emoji} {task.priority}
                        </span>
                      </div>
                      
                      {/* Title & Description */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {task.title || 'Untitled Task'}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {task.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Assignee & Due Date */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {task.assignedTo?.firstName?.[0] || '?'}
                          </div>
                          <span className="text-sm text-gray-700">
                            {task.assignedTo && task.assignedTo.firstName
                              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName || ''}`.trim()
                              : 'Unassigned'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className={`h-4 w-4 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                            {overdue && <span className="ml-1 text-red-500">(Overdue)</span>}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tasks/${task._id}`);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {canUserEdit(task) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tasks/${task._id}/edit`);
                              }}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Edit Task"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          
                          {canUserDelete(task) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task._id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <Pagination
              currentPage={pagination.current}
              totalPages={pagination.pages}
              onPageChange={(page) => fetchTasks({ ...filters, page })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
