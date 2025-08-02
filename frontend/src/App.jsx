// frontend/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import ProfileSettings from './components/ProfileSettings';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { 
    isAuthenticated, 
    token, 
    isLoading, 
    initializeAuth, 
    user,
    initialized // Add this from your auth store
  } = useAuthStore();

  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('App: Initializing authentication...');
        await initializeAuth();
        console.log('App: Auth initialized successfully');
      } catch (error) {
        console.error('App: Auth initialization failed:', error);
      } finally {
        setAppInitialized(true);
      }
    };

    initApp();
  }, [initializeAuth]);

  // ✅ Enhanced loading logic for Docker environments
  const shouldShowLoading = () => {
    // Still initializing the app
    if (!appInitialized) return true;
    
    // Auth store is still loading
    if (isLoading) return true;
    
    // We have a token but haven't validated it yet
    if (token && !initialized) return true;
    
    // We have a token and are authenticated but no user data yet
    if (token && isAuthenticated && !user) return true;
    
    return false;
  };

  // ✅ Show loading spinner during initialization
  if (shouldShowLoading()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
        <div className="ml-4">
          <p className="text-gray-600">Loading application...</p>
          <p className="text-sm text-gray-400">
            {!appInitialized && "Initializing app..."}
            {appInitialized && isLoading && "Checking authentication..."}
            {token && !user && "Loading user data..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* ✅ Enhanced toast configuration for better visibility */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: 'red',
                secondary: 'black',
              },
            },
          }}
        />
        
        {/* ✅ Only show navbar when fully authenticated and user data is loaded */}
        {isAuthenticated && user && <Navbar />}
        
        {/* ✅ Conditional container styling */}
        <main className={isAuthenticated && user ? 'container mx-auto px-4 py-8' : 'min-h-screen'}>
          <Routes>
            {/* ✅ Public routes with better conditional rendering */}
            <Route 
              path="/login" 
              element={
                isAuthenticated && user ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Login />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated && user ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Register />
              } 
            />
            
            {/* ✅ Protected routes */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile-settings" element={<ProfileSettings />} />
              
              {/* Task routes */}
              <Route path="tasks" element={<TaskList />} />
              <Route path="tasks/new" element={<TaskForm />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="tasks/:id/edit" element={<TaskForm />} />
              
              {/* User routes (admin only - handle in components) */}
              <Route path="users" element={<UserList />} />
              <Route path="users/new" element={<UserForm />} />
              <Route path="users/:id/edit" element={<UserForm />} />
            </Route>
            
            {/* ✅ Improved fallback routing */}
            <Route 
              path="*" 
              element={
                isAuthenticated && user ? 
                  <Navigate to="/dashboard" replace /> : 
                  <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
