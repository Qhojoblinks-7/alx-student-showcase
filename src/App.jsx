// src/App.jsx
import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/use-auth'
import { DatabaseErrorHandler } from './components/DatabaseErrorHandler'

// Lazy-loaded route components
const SignInPage = lazy(() => import('./components/auth/SignInPage'))
const SignUpPage = lazy(() => import('./components/auth/SignUpPage'))
const PasswordResetPage = lazy(() => import('./components/auth/PasswordResetPage'))
const AuthForm = lazy(() => import('./components/auth/AuthForm'))


// FIX: Adjust lazy import for named exports
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute').then(module => ({ default: module.ProtectedRoute })));
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard }))); // Assuming Dashboard is also a named export

const SetNewPasswordPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
    <h2 className="text-2xl font-bold mb-4 text-center">Set Your New Password</h2>
    <Suspense fallback={<div>Loading form...</div>}>
      <AuthForm mode="update_password" />
    </Suspense>
  </div>
)

// safeLog function (keep as is)
function safeLog(label, value) {
  try {
    const serialized = JSON.stringify(value, null, 2)
    console.log(`${label}:`, serialized)
  } catch (err) {
    console.log(`${label}: [Unserializable Object]`)
  }
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
      <Suspense fallback={<div className="p-8 text-center">Loading page...</div>}>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/reset-password-confirm" element={<SetNewPasswordPage />} />
          <Route path="/" element={<SignInPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" richColors={true} />
    </Router>
  )

  return (
    <DatabaseErrorHandler>
      <Router>
        <AuthStatusHandler />
        <Suspense fallback={<div className="p-8 text-center">Loading page...</div>}>
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
        </Suspense>
        <Toaster position="bottom-right" richColors />
      </Router>
    </DatabaseErrorHandler>
  )

}