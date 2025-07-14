// src/hooks/use-auth.js
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseInstance } from '../service/auth-service'
import { useDispatch, useSelector } from 'react-redux';
import { setUser, selectUser, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This useEffect is now primarily for the initial session check
    // and ensuring the Redux user state is in sync upon component mount.
    // The global onAuthStateChange listener is handled in auth-service.js
    // and dispatches to Redux, so we don't need another listener here.

    const checkAndSetInitialUser = async () => {
      const supabase = getSupabaseInstance();
      if (!supabase) {
        console.error("Supabase client not initialized in useAuth. Ensure initializeSupabase() is called at app startup.");
        setIsInitialized(true); // Mark as initialized to prevent blocking, but indicate error
        return;
      }

      // Only perform initial user fetch if not already loading or user is null
      // and the auth state hasn't been initialized yet by the global listener.
      if (!user && !isLoading && !isInitialized) {
        try {
          const { data: { user: currentUser }, error } = await supabase.auth.getUser();
          if (error) {
            console.error("Error getting initial user in useAuth:", error.message ? String(error.message) : String(error));
            dispatch(setUser(null)); // Clear user on error
          } else {
            dispatch(setUser(currentUser));
          }
        } catch (err) {
          console.error("Unexpected error during initial user fetch in useAuth:", err.message ? String(err.message) : String(err));
          dispatch(setUser(null));
        } finally {
          setIsInitialized(true);
        }
      } else if (!isInitialized) {
        // If user or isLoading is already set (e.g., by global listener),
        // just mark as initialized.
        setIsInitialized(true);
      }
    };

    checkAndSetInitialUser();

    // No unsubscribe needed here because this hook is not creating a new listener.
    // The global listener's cleanup (if any) is handled in auth-service.js.
  }, [dispatch, user, isLoading, isInitialized]); // Dependencies to re-run initial check if state changes

  // Memoize signOut function to prevent unnecessary re-renders
  const signOut = useCallback(async () => {
    const supabase = getSupabaseInstance();
    if (!supabase) {
      console.error("Supabase client not initialized for signOut.");
      throw new Error("Auth service not ready.");
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message ? String(error.message) : String(error));
      throw error;
    }
    // Dispatch action to clear user in Redux store after successful sign out
    dispatch(setUser(null));
  }, [dispatch]);

  return {
    user,
    isLoading,
    isInitialized,
    error: authError,
    signOut,
  };
}
