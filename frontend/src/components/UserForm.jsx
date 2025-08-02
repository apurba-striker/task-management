// frontend/src/components/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Save,
  ArrowLeft,
  UserPlus,
  UserCheck,
  Shield,
  Settings,
  Check,
  AlertCircle,
  Crown,
  Users
} from 'lucide-react';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

const UserForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
  const watchConfirmPassword = watch('confirmPassword');
  const watchRole = watch('role');
  const watchIsActive = watch('isActive');

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
      console.log('UserForm: Submitting user data:', data);
      
      const userData = { ...data };
      
      if (isEdit && !userData.password) {
        delete userData.password;
        delete userData.confirmPassword;
      }

      let response;
      if (isEdit) {
        console.log('UserForm: Updating user');
        response = await updateUser(id, userData);
        toast.success('🎉 User updated successfully');
      } else {
        console.log('UserForm: Creating new user');
        response = await createUser(userData);
        toast.success('🚀 User created successfully');
      }
      
      navigate('/users');
    } catch (error) {
      console.error('UserForm: Form submission error:', error);
      
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

  // Role color helper
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Crown,
          bgGradient: 'from-purple-50 to-purple-100'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Users,
          bgGradient: 'from-blue-50 to-blue-100'
        };
    }
  };

  // Status color helper
  const getStatusInfo = (isActive) => {
    return isActive
      ? {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Active',
          icon: UserCheck
        }
      : {
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Inactive',
          icon: User
        };
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Weak', color: 'text-red-500' },
      { strength: 2, text: 'Fair', color: 'text-orange-500' },
      { strength: 3, text: 'Good', color: 'text-yellow-500' },
      { strength: 4, text: 'Strong', color: 'text-green-500' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(watchPassword);
  const roleInfo = getRoleInfo(watchRole);
  const statusInfo = getStatusInfo(watchIsActive);

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 font-medium">Loading user details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-2xl p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 transform translate-x-12 -translate-y-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/users')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Back to Users"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  {isEdit ? (
                    <>
                      <UserCheck className="h-8 w-8 mr-3 text-blue-600" />
                      Edit User
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-8 w-8 mr-3 text-green-600" />
                      Add New User
                    </>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit ? 'Update user information and permissions' : 'Create a new team member account'}
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
              <span className="text-sm text-gray-500 ml-2">User Management</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter first name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter last name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role & Permissions Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Role & Permissions</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    User Role
                  </label>
                  <div className="relative">
                    <select
                      {...register('role')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                    >
                      <option value="user">👤 User</option>
                      <option value="admin">👑 Administrator</option>
                    </select>
                    {watchRole && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleInfo.color}`}>
                          {watchRole === 'admin' ? '👑 Administrator' : '👤 User'}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {watchRole === 'admin' ? 'Full access to all features and user management' : 'Standard user with task management access'}
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Account Status
                  </label>
                  <div className="relative">
                    <select
                      {...register('isActive')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                    >
                      <option value={true}>✅ Active</option>
                      <option value={false}>❌ Inactive</option>
                    </select>
                    {typeof watchIsActive !== 'undefined' && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {watchIsActive ? 'User can log in and access the system' : 'User account is disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password {!isEdit && '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: !isEdit ? 'Password is required' : false,
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter secure password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {watchPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Password strength:</span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                          passwordStrength.strength === 2 ? 'bg-orange-500 w-2/4' :
                          passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/4' :
                          passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
                {isEdit && (
                  <p className="text-xs text-gray-500">
                    Leave blank to keep the current password
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              {(!isEdit || watchPassword) && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirm Password {!isEdit && '*'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: (!isEdit || watchPassword) ? 'Please confirm your password' : false,
                        validate: value => {
                          if (!isEdit || watchPassword) {
                            return value === watchPassword || 'Passwords do not match';
                          }
                          return true;
                        }
                      })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                    {/* Match Indicator */}
                    {watchConfirmPassword && watchPassword && (
                      <div className="absolute inset-y-0 right-12 flex items-center">
                        {watchConfirmPassword === watchPassword ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-red-500 text-xs">✗</span>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <Settings className="h-4 w-4 mr-1" />
                All fields marked with * are required
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/users')}
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
                      {isEdit ? 'Update User' : 'Create User'}
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
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">🛡️ Security Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Admin users have full access to all features including user management</li>
                <li>• Regular users can manage tasks and view their assigned work</li>
                <li>• Use strong passwords with at least 6 characters</li>
                <li>• Inactive accounts cannot log in but preserve user data</li>
                <li>• Email addresses must be unique across the system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
