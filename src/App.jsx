import React, { useEffect, Suspense } from 'react'; // Import Suspense
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      {/* Wrap your Routes with Suspense to show a fallback while lazy components load */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg text-gray-600">Loading page...</span>
        </div>
      }>
        <Routes>
          {/* Public Routes - Wrapped with AuthRedirect to redirect authenticated users */}
          <Route path="/" element={<AuthRedirect><LandingPage /></AuthRedirect>} />
          <Route path="/signin" element={<AuthRedirect><SignInPage /></AuthRedirect>} />
          <Route path="/signup" element={<AuthRedirect><SignUpPage /></AuthRedirect>} />
          <Route path="/reset-password" element={<AuthRedirect><PasswordResetPage /></AuthRedirect>} />
          <Route path="/reset-password-confirm" element={<AuthRedirect><SetNewPasswordPage /></AuthRedirect>} />

          {/* Protected Route - Wrapped with ProtectedRoute to guard access */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback route for any unmatched paths. */}
          <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" richColors />
    </Router>
  );
}
