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

      console.log('Auth state changed:', event, 'User:', currentUser?.id || 'None');
    });

    const getInitialUser = async () => {
      if (!mounted) return;

      setIsLoading(true);
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting initial user:', error.message || String(error));
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
      console.error('Error signing out:', error.message || String(error));
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