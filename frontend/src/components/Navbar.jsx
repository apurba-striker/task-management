// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Target,
  Users,
  LayoutDashboard,
  CheckSquare,
  Crown,
  ChevronDown,
  Zap,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const profileRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add null check for user
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('👋 Logged out successfully');
    setIsProfileOpen(false);
  };

  const handleProfileSettings = () => {
    setIsProfileOpen(false);
    navigate('/profile-settings');
  };

  const getNavigationIcon = (name) => {
    switch (name) {
      case 'Dashboard':
        return LayoutDashboard;
      case 'Tasks':
        return CheckSquare;
      case 'Users':
        return Users;
      default:
        return Target;
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
    { name: 'Tasks', href: '/tasks', current: location.pathname.startsWith('/tasks') },
  ];

  if (user?.role === 'admin') {
    navigation.push({
      name: 'Users',
      href: '/users',
      current: location.pathname.startsWith('/users')
    });
  }

  const getUserInitials = () => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'text-purple-600 bg-purple-100' 
      : 'text-blue-600 bg-blue-100';
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/dashboard" 
                className="group flex items-center space-x-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TaskManager
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const IconComponent = getNavigationIcon(item.name);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      item.current
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                      item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    } group-hover:scale-110`} />
                    <span>{item.name}</span>
                    {item.current && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="group p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200 hover:bg-gray-50">
                <Bell className="h-5 w-5 group-hover:animate-pulse" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">{notifications}</span>
                  </div>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group flex items-center space-x-3 p-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:bg-gray-50"
              >
                <div className="relative">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  } group-hover:scale-110 transition-transform duration-200`}>
                    {getUserInitials()}
                  </div>
                  {user.role === 'admin' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Crown className="h-2 w-2 text-yellow-800" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-gray-700">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  isProfileOpen ? 'transform rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-5 duration-200">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}>
                          {getUserInitials()}
                        </div>
                        {user.role === 'admin' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Crown className="h-3 w-3 text-yellow-800" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                          {user.role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                          {user.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleProfileSettings}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors duration-200">
                        <Settings className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Profile Settings</div>
                        <div className="text-xs text-gray-500">Manage your account</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors duration-200">
                        <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">Sign Out</div>
                        <div className="text-xs text-gray-500">End your session</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100">
          {/* Navigation Links */}
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const IconComponent = getNavigationIcon(item.name);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <IconComponent className={`h-5 w-5 mr-3 ${
                    item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Profile Section */}
          <div className="pt-4 pb-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            {/* User Info */}
            <div className="flex items-center px-4 mb-3">
              <div className="relative">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  user.role === 'admin' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}>
                  {getUserInitials()}
                </div>
                {user.role === 'admin' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Crown className="h-3 w-3 text-yellow-800" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="text-base font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                  {user.role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                  {user.role}
                </div>
              </div>
              
              {/* Notifications Badge */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-semibold">{notifications}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 space-y-2">
              <button
                onClick={handleProfileSettings}
                className="flex items-center w-full px-3 py-3 text-base font-medium text-gray-700 hover:bg-white hover:text-blue-700 rounded-xl transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors duration-200">
                  <Settings className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                </div>
                Profile Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-3 text-base font-medium text-gray-700 hover:bg-white hover:text-red-700 rounded-xl transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors duration-200">
                  <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                </div>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
