import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { Toaster } from 'sonner'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    // Set theme preference
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

  return (
    <>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
      <Toaster position="bottom-right" richColors />
    </>
  )
}