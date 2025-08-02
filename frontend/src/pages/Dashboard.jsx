// frontend/src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Plus,
  TrendingUp
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { tasks, fetchTasks, loading } = useTaskStore(); // Add loading state
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    // Only fetch data if user is authenticated and user object exists
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

  // Show loading while user data is being fetched
  if (!user || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Add null check and default to empty array
  const safeTasks = tasks || [];
  const safeUsers = users || [];

  const taskStats = {
    total: safeTasks.length,
    completed: safeTasks.filter(task => task.status === 'completed').length,
    inProgress: safeTasks.filter(task => task.status === 'in-progress').length,
    pending: safeTasks.filter(task => task.status === 'pending').length,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user.firstName}!
            </h1>
            <p className="text-gray-600">
              Welcome back to your task management dashboard
            </p>
          </div>
          <Link
            to="/tasks/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Task
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
              <Link
                to="/tasks"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : safeTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks found</p>
            ) : (
              <div className="space-y-4">
                {safeTasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Overview (Admin only) */}
        {user && user.role === 'admin' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Team Overview</h3>
                <Link
                  to="/users"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Manage users
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {safeUsers.length} team members
                </span>
              </div>
              {safeUsers.slice(0, 5).map((teamUser) => (
                <div key={teamUser._id} className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {teamUser.firstName} {teamUser.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{teamUser.email}</p>
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
