// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { supabase } from './lib/supabase';
import { setUser, getSession } from './store/slices/authSlice';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

// Import authentication forms and main application components
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';
import Dashboard from './components/Dashboard';
import ProjectListPage from './components/projects/ProjectListPage';
import DashboardStats from './components/stats/DashboardStats';
import ProjectForm from './components/projects/ProjectForm'; // The project form modal
import LandingPage from './components/LandingPage';

// --- ProtectedRoute Component (Ensure this matches your src/components/ProtectedRoute.jsx) ---
// If you're importing ProtectedRoute from a separate file:
import ProtectedRoute from './components/ProtectedRoute'; // Ensure this import is present if it's a separate file
import UserProfilePage from './components/profile/UserProfilePage';
import { PublicShowcasePage } from './pages/PublicShowcasePage';


// --- Main App Component ---
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("App.jsx -> Main App useEffect: Setting up auth state listener and initial getSession."); // ADD THIS LOG

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`App.jsx -> Auth State Changed: Event: ${event}, Session:`, session); // ADD THIS LOG
        if (session) {
          dispatch(setUser(session.user));
          console.log("App.jsx -> Auth State Changed: User SET to:", session.user); // ADD THIS LOG
        } else {
          dispatch(setUser(null));
          console.log("App.jsx -> Auth State Changed: User SET to null (logged out)."); // ADD THIS LOG
        }
      }
    );

    dispatch(getSession());
    console.log("App.jsx -> Main App useEffect: getSession dispatched."); // ADD THIS LOG

    return () => {
      console.log("App.jsx -> Main App useEffect Cleanup: Unsubscribing from auth state changes."); // ADD THIS LOG
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/showcase/:userId" element={<PublicShowcasePage />} />
        <Route path="/forgot-password" element={
          <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
            <h2 className="text-2xl">Forgot Password Page - Coming Soon!</h2>
          </div>
        } />

        {/* --- Protected Routes --- */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes for Dashboard */}
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="stats" element={<DashboardStats />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* --- Fallback Route --- */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
            <h2 className="text-2xl">404 - Page Not Found</h2>
          </div>
        } />
      </Routes>

      <Toaster richColors position="bottom-right" />
    </>
  );
}

// --- AppWrapper Component ---
export default function AppWrapper() {
  return (
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  );
}