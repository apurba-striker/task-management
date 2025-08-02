// frontend/src/components/UserList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Shield, 
  User, 
  Users,
  Crown,
  UserCheck,
  UserX,
  Filter,
  Grid,
  List,
  MoreVertical,
  Calendar,
  Eye,
  Settings,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import useUserStore from '../store/userStore';
import useAuthStore from '../store/authStore';
import Pagination from './Pagination';
import toast from 'react-hot-toast';

const UserList = () => {
  const { 
    users, 
    loading, 
    pagination, 
    fetchUsers, 
    deleteUser 
  } = useUserStore();
  const { user: currentUser } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const filterParams = {
          ...filters,
          search: searchTerm
        };
        
        Object.keys(filterParams).forEach(key => {
          if (filterParams[key] === '' || filterParams[key] === null || filterParams[key] === undefined) {
            delete filterParams[key];
          }
        });
        
        console.log('UserList: Loading users with clean filters:', filterParams);
        await fetchUsers(filterParams);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      }
    };

    loadUsers();
  }, [fetchUsers, filters, searchTerm]);

  const handleDelete = async (userId, userEmail) => {
    if (userId === currentUser._id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      try {
        await deleteUser(userId);
        toast.success('🗑️ User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key, value) => {
    console.log(`UserList: Filter change - ${key}: ${value}`);
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: 1 
    }));
  };

  // Helper functions for styling
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Crown,
          emoji: '👑',
          bgGradient: 'from-purple-50 to-purple-100'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: User,
          emoji: '👤',
          bgGradient: 'from-blue-50 to-blue-100'
        };
    }
  };

  const getStatusInfo = (isActive) => {
    return isActive
      ? {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Active',
          icon: UserCheck,
          emoji: '✅'
        }
      : {
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Inactive',
          icon: UserX,
          emoji: '❌'
        };
  };

  const safeUsers = users || [];
  const safePagination = pagination || { current: 1, pages: 1, total: 0 };

  const adminCount = safeUsers.filter(user => user.role === 'admin').length;
  const activeCount = safeUsers.filter(user => user.isActive).length;

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
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                {safeUsers.length} total users • {adminCount} admins • {activeCount} active
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/users/new"
                className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Add User
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
                placeholder="🔍 Search users by name or email..."
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

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">👑 Admin</option>
                    <option value="user">👤 User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.isActive}
                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Status</option>
                    <option value="true">✅ Active</option>
                    <option value="false">❌ Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Content */}
        {loading ? (
          <div className="bg-white shadow-lg rounded-2xl p-12 border border-gray-100">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading users...</p>
            </div>
          </div>
        ) : safeUsers.length === 0 ? (
          <div className="bg-white shadow-lg rounded-2xl p-12 border border-gray-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? "No users match your search criteria. Try adjusting your filters or search terms."
                  : "Get started by adding your first team member!"
                }
              </p>
              <Link
                to="/users/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First User
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
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Member Since
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {safeUsers.map((user, index) => {
                    const roleInfo = getRoleInfo(user.role);
                    const statusInfo = getStatusInfo(user.isActive);
                    const RoleIcon = roleInfo.icon;
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr 
                        key={user._id} 
                        className="group hover:bg-blue-50 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${
                                user.role === 'admin' 
                                  ? 'from-purple-500 to-purple-600' 
                                  : 'from-blue-500 to-blue-600'
                              } flex items-center justify-center text-white text-lg font-semibold`}>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </div>
                              {user.role === 'admin' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Crown className="h-2 w-2 text-yellow-800" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                                {user._id === currentUser._id && (
                                  <span className="ml-2 text-xs text-blue-600 font-medium">(You)</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <RoleIcon className="h-4 w-4 text-gray-400" />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleInfo.color}`}>
                              <span className="mr-1">{roleInfo.emoji}</span>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                              <span className="mr-1">{statusInfo.emoji}</span>
                              {statusInfo.text}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Link
                              to={`/users/${user._id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            {user._id !== currentUser._id && (
                              <button
                                onClick={() => handleDelete(user._id, user.email)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete User"
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
            {safeUsers.map((user, index) => {
              const roleInfo = getRoleInfo(user.role);
              const statusInfo = getStatusInfo(user.isActive);
              
              return (
                <div 
                  key={user._id}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${roleInfo.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  
                  {/* Role Indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}></div>
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <div className={`h-16 w-16 rounded-full bg-gradient-to-r ${
                          user.role === 'admin' 
                            ? 'from-purple-500 to-purple-600' 
                            : 'from-blue-500 to-blue-600'
                        } flex items-center justify-center text-white text-xl font-semibold`}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        {user.role === 'admin' && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Crown className="h-3 w-3 text-yellow-800" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleInfo.color}`}>
                          {roleInfo.emoji} {user.role}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.emoji}
                        </span>
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {user.firstName} {user.lastName}
                        {user._id === currentUser._id && (
                          <span className="ml-2 text-sm text-blue-600 font-medium">(You)</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </p>
                    </div>
                    
                    {/* Member Since */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex space-x-2">
                        <Link
                          to={`/users/${user._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {user._id !== currentUser._id && (
                          <button
                            onClick={() => handleDelete(user._id, user.email)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${statusInfo.text === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {safePagination.pages > 1 && (
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <Pagination
              currentPage={safePagination.current}
              totalPages={safePagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
