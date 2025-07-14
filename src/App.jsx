// src/App.jsx
import React, { useEffect } from 'react' // Removed Suspense, lazy
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/use-auth'
// import { DatabaseErrorHandler } from './components/DatabaseErrorHandler' // Removed DatabaseErrorHandler import

// Directly import route components
import {SignInPage} from './components/auth/SignInPage'
import {SignUpPage} from './components/auth/SignUpPage'
import {PasswordResetPage} from './components/auth/PasswordResetPage'
import AuthForm from './components/auth/AuthForm'
import { ProtectedRoute } from './components/auth/ProtectedRoute' // Direct import for named export
import { Dashboard } from './components/Dashboard' // Direct import for named export

const SetNewPasswordPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
    <h2 className="text-2xl font-bold mb-4 text-center">Set Your New Password</h2>
    {/* Removed Suspense wrapper */}
    <AuthForm mode="update_password" />
  </div>
)

// safeLog function (keep as is)
function safeLog(label, value) {
  let logValue;
  try {
    logValue = JSON.stringify(value, null, 2);
  } catch (err) {
    // Ensure err is converted to string for safety
    logValue = `[Unserializable Object - ${String(err)}]`; 
  }
  console.log(`${label}:`, logValue);
}

// AuthStatusHandler (keep as is)
function AuthStatusHandler() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, isInitialized } = useAuth()

  useEffect(() => {
    safeLog("Auth state", { isAuthenticated, isLoading, isInitialized })

    if (isInitialized && !isLoading) {
      const currentPath = window.location.pathname
      const authPaths = ['/signin', '/signup', '/reset-password', '/reset-password-confirm']
      safeLog("Current path", currentPath)

      if (isAuthenticated) {
        if (authPaths.includes(currentPath) || currentPath === '/') {
          navigate('/dashboard', { replace: true })
        }
      } else {
        if (!authPaths.includes(currentPath)) {
          navigate('/signin', { replace: true })
        }
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, navigate])

  return null
}

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.classList.toggle('dark', theme === 'dark')
    safeLog("Theme preference", theme)
  }, [])

  return (
    <Router>
      <AuthStatusHandler />
      {/* Removed Suspense wrapper */}
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/reset-password-confirm" element={<SetNewPasswordPage />} />
        <Route path="/" element={<SignInPage />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </Router>
  )
}
