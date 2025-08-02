// frontend/src/components/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

const UserForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    currentUser, 
    loading, 
    fetchUser, 
    createUser, 
    updateUser 
  } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      isActive: true,
      password: ''
    }
  });

  const watchPassword = watch('password');

  useEffect(() => {
    if (isEdit && id) {
      fetchUser(id);
    }
  }, [fetchUser, id, isEdit]);

  useEffect(() => {
    if (isEdit && currentUser) {
      setValue('firstName', currentUser.firstName);
      setValue('lastName', currentUser.lastName);
      setValue('email', currentUser.email);
      setValue('role', currentUser.role);
      setValue('isActive', currentUser.isActive);
    }
  }, [isEdit, currentUser, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log('UserForm: Submitting user data:', data); // Debug log
      
      const userData = { ...data };
      
      // Remove password field if it's empty during edit
      if (isEdit && !userData.password) {
        delete userData.password;
        delete userData.confirmPassword;
      }

      let response;
      if (isEdit) {
        console.log('UserForm: Updating user'); // Debug log
        response = await updateUser(id, userData);
        toast.success('User updated successfully');
      } else {
        console.log('UserForm: Creating new user'); // Debug log
        response = await createUser(userData);
        console.log('UserForm: Create user response:', response); // Debug log
        toast.success('User created successfully');
      }
      
      console.log('UserForm: Navigating to /users'); // Debug log
      navigate('/users');
    } catch (error) {
      console.error('UserForm: Form submission error:', error); // Debug log
      
      // Handle different error types with more specific messages
      if (error.message.includes('email already exists') || 
          error.message.includes('Email already exists') ||
          error.message.includes('Email already in use') ||
          error.message.includes('duplicate')) {
        toast.error('A user with this email address already exists. Please use a different email.');
      } else if (error.message.includes('validation')) {
        toast.error('Please check your input and try again.');
      } else {
        toast.error(error.message || 'An error occurred while saving the user');
      }
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('isActive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {!isEdit && '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: !isEdit ? 'Password is required' : false,
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
              />
              <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            {isEdit && (
              <p className="mt-1 text-sm text-gray-500">
                Leave blank to keep the current password
              </p>
            )}
          </div>

          {/* Confirm Password */}
          {(!isEdit || watchPassword) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password {!isEdit && '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: (!isEdit || watchPassword) ? 'Please confirm your password' : false,
                    validate: value => {
                      if (!isEdit || watchPassword) {
                        return value === watchPassword || 'Passwords do not match';
                      }
                      return true;
                    }
                  })}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm password"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
