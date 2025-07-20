import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/use-auth'; // Your useAuth hook

// Directly import route components
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import  PasswordResetPage  from './components/auth/PasswordResetPage';
import AuthForm from './components/auth/AuthForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute'; // Direct import for named export
import { AuthRedirect } from './components/AuthRedirect'
import { Dashboard } from './components/Dashboard'; // Direct import for named export
import { LandingPage } from './components/LandingPage'; // Import the LandingPage
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state in ProtectedRoute/AuthRedirect

const SetNewPasswordPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
    <h2 className="text-2xl font-bold mb-4 text-center">Set Your New Password</h2>
    <AuthForm mode="update_password" />
  </div>
);

export default function App() {
  // Use useAuth to get the initialization status for the whole app
  const { isInitialized } = useAuth();

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    console.log('Document classes after applying theme:', document.documentElement.classList);
  }, []);

  // Show a global loading indicator until authentication state is initialized
  // This prevents content flickering and ensures routing decisions are made
  // only when the auth state is fully known.
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-600">Loading application...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - Wrapped with AuthRedirect to redirect authenticated users */}
        {/* These routes should only be accessible if the user is NOT authenticated */}
        <Route path="/" element={<AuthRedirect><LandingPage /></AuthRedirect>} /> {/* Set LandingPage as the root */}
        <Route path="/signin" element={<AuthRedirect><SignInPage /></AuthRedirect>} />
        <Route path="/signup" element={<AuthRedirect><SignUpPage /></AuthRedirect>} />
        <Route path="/reset-password" element={<AuthRedirect><PasswordResetPage /></AuthRedirect>} />
        <Route path="/reset-password-confirm" element={<AuthRedirect><SetNewPasswordPage /></AuthRedirect>} />

        {/* Protected Route - Wrapped with ProtectedRoute to guard access */}
        {/* These routes should only be accessible if the user IS authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback route for any unmatched paths.
            It will attempt to render the Dashboard, and ProtectedRoute will handle
            redirection to signin if the user is not authenticated. */}
        <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </Router>
  );
}
