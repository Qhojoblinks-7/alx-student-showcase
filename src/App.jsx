import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/use-auth'; // Your useAuth hook
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state

// Dynamically import route components using React.lazy
// This will create separate JavaScript chunks for each of these components
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const SignInPage = React.lazy(() => import('./components/auth/SignInPage'));
const SignUpPage = React.lazy(() => import('./components/auth/SignUpPage'));
const PasswordResetPage = React.lazy(() => import('./components/auth/PasswordResetPage'));
const AuthForm = React.lazy(() => import('./components/auth/AuthForm')); // If AuthForm is a standalone route component
const ProtectedRoute = React.lazy(() => import('./components/auth/ProtectedRoute'));
const AuthRedirect = React.lazy(() => import('./components/AuthRedirect'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));

// Define SetNewPasswordPage as a lazy-loaded component as well
const SetNewPasswordPage = React.lazy(() => (
  // Wrap the content in a function that returns the JSX, so it can be lazy-loaded
  // This structure is fine for simple components like this one
  import('react').then(module => ({
    default: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Set Your New Password</h2>
        <AuthForm mode="update_password" />
      </div>
    )
  }))
));
// // Directly import route components
// import { SignInPage } from './components/auth/SignInPage';
// import { SignUpPage } from './components/auth/SignUpPage';
// import { PasswordResetPage } from './components/auth/PasswordResetPage';
// import AuthForm from './components/auth/AuthForm';
// import { ProtectedRoute } from './components/auth/ProtectedRoute'; // Direct import for named export
// import { AuthRedirect } from './components/AuthRedirect'
// import { Dashboard } from './components/Dashboard'; // Direct import for named export
// import { LandingPage } from './components/LandingPage'; // Import the LandingPage
// import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state in ProtectedRoute/AuthRedirect

// const SetNewPasswordPage = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
//     <h2 className="text-2xl font-bold mb-4 text-center">Set Your New Password</h2>
//     <AuthForm mode="update_password" />
//   </div>
// );

// Removed safeLog function as it's no longer needed for debugging.

export default function App() {
  const { isInitialized } = useAuth();

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    console.log('Document classes after applying theme:', document.documentElement.classList);
  }, []);

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
