// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import your custom useAuth hook (from src/hooks/use-auth.js)
import { useAuth } from './hooks/use-auth';

// Import your page components (from src/pages/ or src/components/)
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { PasswordResetPage } from './components/auth/PasswordResetPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute'; // Corrected path
import { Dashboard } from './components/Dashboard'; // Your Dashboard component
import { AuthForm } from './components/auth/AuthForm'; // Needed for SetNewPasswordPage

// Component for setting new password after reset email link is clicked
function SetNewPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Set Your New Password</h2>
      {/* The AuthForm component in 'update_password' mode will automatically read the token from the URL */}
      <AuthForm mode="update_password" />
    </div>
  );
}


// This component listens to auth state changes from Redux and handles global navigation
function AuthStatusHandler() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isInitialized } = useAuth(); // Get state from Redux via hook

  useEffect(() => {
    // Only proceed with navigation logic once the auth state has been initialized
    // and is not currently loading.
    if (isInitialized && !isLoading) {
      const currentPath = window.location.pathname;

      // Define paths that are considered "public" authentication-related pages
      const authPaths = ['/signin', '/signup', '/reset-password', '/reset-password-confirm'];

      if (isAuthenticated) {
        // If user is authenticated:
        // 1. If they are on any auth-related page, redirect them to the dashboard.
        // 2. This also handles the initial redirect from '/' if they were already logged in.
        if (authPaths.includes(currentPath) || currentPath === '/') {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // If user is NOT authenticated:
        // 1. If they are trying to access the dashboard or any other non-auth path,
        //    redirect them to the sign-in page.
        if (!authPaths.includes(currentPath)) {
          navigate('/signin', { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, navigate]);

  return null; // This component doesn't render any UI
}


export default function App() {
  // Theme preference logic - this is fine and unrelated to routing/auth.
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <Router> {/* Re-add BrowserRouter */}
      <AuthStatusHandler /> {/* Handles global redirects based on Redux auth state */}
      <Routes> {/* Re-add Routes */}
        {/* Public Routes - Accessible without login */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/reset-password-confirm" element={<SetNewPasswordPage />} />

        {/* Protected Route - Requires login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Root path: By default, if not logged in, AuthStatusHandler will redirect to /signin */}
        {/* If already logged in, AuthStatusHandler will redirect to /dashboard */}
        <Route path="/" element={<SignInPage />} /> {/* Fallback or initial view */}

      </Routes>
      <Toaster position="bottom-right" richColors />
    </Router>
  );
}