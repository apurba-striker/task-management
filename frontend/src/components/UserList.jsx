// frontend/src/components/UserList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Mail, Shield, User } from 'lucide-react';
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
  const [filters, setFilters] = useState({
    role: '',
    isActive: '', // Make sure this starts as empty string, not 'false'
    page: 1,
    limit: 10
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Build clean filter params - only send non-empty values
        const filterParams = {
          ...filters,
          search: searchTerm
        };
        
        // Remove empty filter values before sending to backend
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

  // Handle delete user function
  const handleDelete = async (userId, userEmail) => {
    if (userId === currentUser._id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  // Handle page change function
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle filter change function
  const handleFilterChange = (key, value) => {
    console.log(`UserList: Filter change - ${key}: ${value}`); // Debug log
    
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: 1 
    }));
  };

  // Add defensive programming with null checks
  const safeUsers = users || [];
  const safePagination = pagination || { current: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Link
          to="/users/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          {/* Fix the Status dropdown */}
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {safeUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-4">Get started by adding a new user.</p>
              <Link
                to="/users/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add User
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/users/${user._id}/edit`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                          {user._id !== currentUser._id && (
                            <button
                              onClick={() => handleDelete(user._id, user.email)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
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
      {safePagination.pages > 1 && (
        <Pagination
          currentPage={safePagination.current}
          totalPages={safePagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default UserList;
