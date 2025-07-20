import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './../lib/supabase.js'; // Added supabase import
import {
  // Removed checkAuthStatus as it's no longer exported or needed here
  signOut as signOutAction,
  setUser,
  clearUser
} from '../store/slices/authSlice.js'; // Added authSlice imports

/**
 * Custom hook to get the Redux dispatch function.
 * This is a typed version of useDispatch for better type inference in Redux Toolkit.
 * Use throughout your app instead of plain `useDispatch`.
 * @returns {Function} The Redux dispatch function.
 */
export const useAppDispatch = () => useDispatch();

/**
 * Custom hook to get the Redux selector function.
 * This is a typed version of useSelector for better type inference in Redux Toolkit.
 * Use throughout your app instead of plain `useSelector`.
 * @type {import('react-redux').TypedUseSelectorHook<RootState>} // Assuming RootState is defined in your store setup
 */
export const useAppSelector = useSelector;

/**
 * Custom hook to access authentication-related state and dispatch.
 * Combines the state from the 'auth' slice with the dispatch function.
 * @returns {object} An object containing the 'auth' state and the dispatch function.
 */
export const useAuth = () => {
  const dispatch = useAppDispatch(); // Use useAppDispatch here
  const { user, isAuthenticated, isLoading, error, isInitialized } = useAppSelector(state => state.auth); // Use useAppSelector

  // Removed the useEffect for supabase.auth.onAuthStateChange listener.
  // This listener should be set up once at the application's root (e.g., in an AuthProvider component)
  // or a dedicated initialization file (like auth-service.js), not in a hook that
  // might be called multiple times by different components.
  // The comment in the original code already noted this.

  const signOut = async () => {
    try {
      await dispatch(signOutAction()).unwrap();
    } catch (signOutError) {
      console.error('Sign out error:', signOutError.message ? String(signOutError.message) : String(signOutError)); // Explicitly convert error to string
    }
  };

  return {
    user,
    isAuthenticated,
    loading: isLoading,
    error,
    isInitialized,
    signOut,
  };
};

/**
 * Custom hook to access project-related state and dispatch.
 * Combines the state from the 'projects' slice with the dispatch function.
 * @returns {object} An object containing the 'projects' state and the dispatch function.
 */
export const useProjects = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.projects); // Assumes a 'projects' slice in your Redux store

  return {
    ...projects,
    dispatch,
  };
};

/**
 * Custom hook to access UI-related state and dispatch.
 * Combines the state from the 'ui' slice with the dispatch function.
 * @returns {object} An object containing the 'ui' state and the dispatch function.
 */
export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector(state => state.ui); // Assumes a 'ui' slice in your Redux store

  return {
    ...ui,
    dispatch,
  };
};

/**
 * Custom hook to access sharing-related state and dispatch.
 * Combines the state from the 'sharing' slice with the dispatch function.
 * @returns {object} An object containing the 'sharing' state and the dispatch function.
 */
export const useSharing = () => {
  const dispatch = useAppDispatch();
  const sharing = useAppSelector(state => state.sharing); // Assumes a 'sharing' slice in your Redux store

  return {
    ...sharing,
    dispatch,
  };
};

/**
 * Custom hook to access GitHub-related state and dispatch.
 * Combines the state from the 'github' slice with the dispatch function.
 * @returns {object} An object containing the 'github' state and the dispatch function.
 */
export const useGitHub = () => {
  const dispatch = useAppDispatch();
  const github = useAppSelector(state => state.github); // Assumes a 'github' slice in your Redux store

  return {
    ...github,
    dispatch,
  };
};
