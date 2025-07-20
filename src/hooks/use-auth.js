// src/hooks/use-auth.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../components/auth/auth-service';

/**
 * Custom hook for managing Supabase authentication state.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoading(false);
      setIsInitialized(true);

      // Explicitly stringify event and currentUser?.id for console.log
      console.log('Auth state changed:', String(event), 'User:', String(currentUser?.id || 'None'));
    });

    const getInitialUser = async () => {
      if (!mounted) return;

      setIsLoading(true);
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          // Robustly handle and throw the error
          let errorMessage = 'Auth session missing!';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            // Attempt to stringify a complex object error
            try {
              errorMessage = JSON.stringify(error);
            } catch (e) {
              errorMessage = String(error); // Fallback to String() if JSON.stringify fails
            }
          } else {
            errorMessage = String(error);
          }
          throw new Error(errorMessage);
        }
        setUser(currentUser);
      } catch (error) {
        // Ensure error is explicitly stringified for console.error
        let logMessage = 'Unknown error during initial user fetch.';
        if (error instanceof Error) {
          logMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          try {
            logMessage = JSON.stringify(error);
          } catch (e) {
            logMessage = String(error);
          }
        } else {
          logMessage = String(error);
        }
        console.error('Error getting initial user:', logMessage);
        setUser(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    if (!isInitialized) {
      getInitialUser();
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      authListener?.unsubscribe?.(); // Safe cleanup with optional chaining
    };
  }, [isInitialized]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return true;
    } catch (error) {
      // Explicitly stringify error for console.error
      let logMessage = 'Unknown error during sign out.';
      if (error instanceof Error) {
        logMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        try {
          logMessage = JSON.stringify(error);
        } catch (e) {
          logMessage = String(error);
        }
      } else {
        logMessage = String(error);
      }
      console.error('Error signing out:', logMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(user);
  const userId = user?.id || getCurrentUserId();

  return {
    user,
    userId,
    isAuthenticated,
    isLoading,
    isInitialized,
    signOut,
    supabase,
  };
}
