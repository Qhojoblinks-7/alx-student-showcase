import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth'; // Import your useAuth hook
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react'; // Assuming you have this icon

/**
 * AuthRedirect Component
 *
 * This component is used for routes that should only be accessible to unauthenticated users
 * (e.g., /signin, /signup). If an authenticated user tries to access these routes,
 * they will be redirected to the dashboard.
 *
 * It waits for the authentication state to be initialized before making a decision.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to render if the user is unauthenticated.
 */
export function AuthRedirect({ children }) {
  const { user, isLoading, isInitialized } = useAuth();

  // Show a loading spinner until authentication state is fully initialized.
  // This prevents flickering or incorrect redirects during the initial load.
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-gray-600">Loading authentication...</span>
      </div>
    );
  }

  // If the user is authenticated, redirect them to the dashboard.
  // `replace` prop ensures that the current entry in the history stack is replaced.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If the user is not authenticated, render the children (e.g., sign-in form).
  return children;
}

AuthRedirect.propTypes = {
  children: PropTypes.node.isRequired,
};
