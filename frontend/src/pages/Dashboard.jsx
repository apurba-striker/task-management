// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Activity,
  ChevronRight,
  BarChart3,
  Zap,
  Eye,
  Edit3
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks({ limit: 10 }).catch(error => {
        console.error('Failed to fetch tasks:', error);
      });
      
      if (user.role === 'admin') {
        fetchUsers({ limit: 10 }).catch(error => {
          console.error('Failed to fetch users:', error);
        });
      }
    }
  }, [fetchTasks, fetchUsers, user, isAuthenticated]);

  // Function to handle task click
  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  // Function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Function to get status info with icons
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-500',
          bgColor: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          textColor: 'text-green-600'
        };
      case 'in-progress':
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          textColor: 'text-yellow-600'
        };
      case 'pending':
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-100 text-red-800',
          icon: AlertCircle,
          textColor: 'text-red-600'
        };
      default:
        return {
          color: 'bg-gray-500',
          bgColor: 'bg-gray-100 text-gray-800',
          icon: Clock,
          textColor: 'text-gray-600'
        };
    }
  };

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const safeTasks = tasks || [];
  const safeUsers = users || [];

  const taskStats = {
    total: safeTasks.length,
    completed: safeTasks.filter(task => task.status === 'completed').length,
    inProgress: safeTasks.filter(task => task.status === 'in-progress').length,
    pending: safeTasks.filter(task => task.status === 'pending').length,
  };

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    if (completionRate >= 80) return "Excellent work! You're crushing your goals! 🚀";
    if (completionRate >= 60) return "Great progress! Keep up the momentum! 💪";
    if (completionRate >= 40) return "You're on track! Stay focused! 🎯";
    return "Every great journey begins with a single step! 🌟";
  };

  const upcomingTasks = safeTasks
    .filter(task => task.status !== 'completed' && new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const overdueTasks = safeTasks.filter(task => 
    task.status !== 'completed' && new Date(task.dueDate) < new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Welcome Header */}
        <div className="bg-white shadow-lg rounded-2xl p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {user.firstName}! 👋
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Welcome back to your task management dashboard
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="mt-3 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg inline-block">
                <p className="text-sm font-medium text-gray-700">{getMotivationalMessage()}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/tasks/new"
                className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                New Task
              </Link>
              
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View All Tasks
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Tasks Card */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {completionRate}% completion rate
                </p>
              </div>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.completed}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.inProgress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <Zap className="inline h-3 w-3 mr-1" />
                  Active work
                </p>
              </div>
            </div>
          </div>

          {/* Pending/Overdue Card */}
          <div className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.pending}</p>
                {overdueTasks.length > 0 && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {overdueTasks.length} overdue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enhanced Recent Tasks - Now Clickable */}
          <div className="xl:col-span-2 bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="h-6 w-6 mr-2 text-blue-600" />
                    Recent Tasks
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Click on any task to view details</p>
                </div>
                <Link
                  to="/tasks"
                  className="group inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  View all
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Loading your tasks...</p>
                </div>
              ) : safeTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No tasks found</p>
                  <p className="text-gray-400 text-sm mt-2">Create your first task to get started!</p>
                  <Link
                    to="/tasks/new"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeTasks.slice(0, 5).map((task, index) => {
                    const statusInfo = getStatusInfo(task.status);
                    const StatusIcon = statusInfo.icon;
                    const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
                    
                    return (
                      <div 
                        key={task._id} 
                        onClick={() => handleTaskClick(task._id)}
                        className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-gray-50/50 hover:bg-white cursor-pointer transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center flex-1">
                          {/* Status Indicator */}
                          <div className="flex items-center mr-4">
                            <div className={`w-3 h-3 rounded-full mr-3 ${statusInfo.color}`}></div>
                            <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {task.title}
                              </p>
                              {task.priority && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-500 gap-4">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                {isOverdue && (
                                  <span className="ml-2 text-red-500 font-medium text-xs">
                                    (Overdue)
                                  </span>
                                )}
                              </span>
                              
                              {task.assignedTo && (
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {task.assignedTo.firstName} {task.assignedTo.lastName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Status Badge */}
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor}`}>
                            {task.status.replace('-', ' ')}
                          </span>
                          
                          {/* Action Icons */}
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tasks/${task._id}/edit`);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Task"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/tasks/new"
                  className="flex items-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-200 group"
                >
                  <Plus className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">Create New Task</span>
                </Link>
                <Link
                  to="/tasks?status=pending"
                  className="flex items-center p-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200 group"
                >
                  <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-gray-900 group-hover:text-yellow-600">View Pending Tasks</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/users"
                    className="flex items-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors duration-200 group"
                  >
                    <Users className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-900 group-hover:text-purple-600">Manage Users</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Enhanced Upcoming Deadlines - Now Clickable */}
            {upcomingTasks.length > 0 && (
              <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                    Upcoming Deadlines
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Click to view task details</p>
                </div>
                <div className="p-6 space-y-3">
                  {upcomingTasks.map((task) => {
                    const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysUntilDue <= 3;
                    
                    return (
                      <div 
                        key={task._id} 
                        onClick={() => handleTaskClick(task._id)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-orange-50 hover:bg-orange-100 cursor-pointer transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm group-hover:text-orange-700 transition-colors">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isUrgent 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {daysUntilDue === 0 ? 'Today' : 
                             daysUntilDue === 1 ? 'Tomorrow' : 
                             `${daysUntilDue} days`}
                          </span>
                          <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Team Overview (Admin only) */}
            {user && user.role === 'admin' && (
              <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-600" />
                      Team Overview
                    </h3>
                    <Link
                      to="/users"
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4 p-3 bg-green-50 rounded-xl">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {safeUsers.length} team members
                    </span>
                  </div>
                  <div className="space-y-3">
                    {safeUsers.slice(0, 4).map((teamUser) => (
                      <div key={teamUser._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {teamUser.firstName} {teamUser.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{teamUser.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          teamUser.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {teamUser.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
