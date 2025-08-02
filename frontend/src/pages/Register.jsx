// frontend/src/components/Register.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, UserPlus, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      console.log('Form submitted:', data);
      await registerUser(data);
      toast.success('🎉 Welcome aboard! Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    }
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

  const passwordStrength = getPasswordStrength(watch('password'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join Task Manager and get organized</p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className={`
                      block w-full pl-10 pr-4 py-3 border rounded-lg
                      bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      transition-all duration-200 ease-in-out
                      ${errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
                    `}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="flex items-center text-red-500 text-xs mt-1">
                    <span className="inline-block w-3 h-3 mr-1">⚠️</span>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    className={`
                      block w-full pl-10 pr-4 py-3 border rounded-lg
                      bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      transition-all duration-200 ease-in-out
                      ${errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
                    `}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="flex items-center text-red-500 text-xs mt-1">
                    <span className="inline-block w-3 h-3 mr-1">⚠️</span>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
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
                  className={`
                    block w-full pl-10 pr-4 py-3 border rounded-lg
                    bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200 ease-in-out
                    ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
                  `}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="flex items-center text-red-500 text-sm mt-1">
                  <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className={`
                    block w-full pl-10 pr-12 py-3 border rounded-lg
                    bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200 ease-in-out
                    ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
                  `}
                  placeholder="Create a strong password"
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
              {password && (
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
                  <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className={`
                    block w-full pl-10 pr-12 py-3 border rounded-lg
                    bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200 ease-in-out
                    ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
                  `}
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
                {watch('confirmPassword') && password && (
                  <div className="absolute inset-y-0 right-10 flex items-center">
                    {watch('confirmPassword') === password ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="text-red-500 text-xs">✗</span>
                    )}
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="flex items-center text-red-500 text-sm mt-1">
                  <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  {...register('terms', { required: 'You must accept the terms' })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="font-medium text-purple-600 hover:text-purple-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="font-medium text-purple-600 hover:text-purple-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
            {errors.terms && (
              <p className="flex items-center text-red-500 text-sm">
                <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                {errors.terms.message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center items-center py-3 px-4 
                border border-transparent text-sm font-semibold rounded-lg
                text-white transition-all duration-200 ease-in-out
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6">
            <Link
              to="/login"
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              Sign in to your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you're joining thousands of users who trust Task Manager
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
