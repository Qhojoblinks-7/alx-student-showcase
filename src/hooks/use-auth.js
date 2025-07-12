import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './../lib/supabase.js'
import { 
  checkAuthStatus, 
  signOut as signOutAction, 
  setUser, 
  clearUser 
} from '../store/slices/authSlice.js'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error, isInitialized } = useSelector(state => state.auth)

  useEffect(() => {
    // Check initial auth status
    dispatch(checkAuthStatus())

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setUser(session.user))
      } else {
        dispatch(clearUser())
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  const signOut = async () => {
    try {
      await dispatch(signOutAction()).unwrap()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user,
    isAuthenticated,
    loading: isLoading,
    error,
    isInitialized,
    signOut,
  }
}