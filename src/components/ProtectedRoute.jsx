// src/components/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { selectAuthStatus } from '@/store/selectors';

const ProtectedRoute = ({ children }) => {
  // Use the memoized selector
  const { isAuthenticated, isLoading, user } = useSelector(selectAuthStatus);

  // Log to observe renders of ProtectedRoute
  // Keep this log for now to confirm the re-render reduction
  console.log('ProtectedRoute Rendered:');
  console.log('  isAuthenticated:', isAuthenticated);
  console.log('  isLoading:', isLoading);
  console.log('  user:', user);
  console.log('ProtectedRoute: Authenticated, rendering children.'); // This one should appear less often

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin mr-2" />
        <span className="text-xl">Loading authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to signin.');
    return <Navigate to="/signin" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;