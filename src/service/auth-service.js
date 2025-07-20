// auth-service.js
import { supabase } from '../lib/supabase.js'; // Import the already initialized supabase client

// Global user ID state, managed by auth listener
let currentUserId = null;
let authListenerUnsubscribe = null; // To store the unsubscribe function

// Function to initialize authentication state and listeners
export const initializeAuth = async () => {
  // Check if already initialized to prevent duplicate listeners
  if (authListenerUnsubscribe) {
    console.warn("Auth service already initialized. Skipping re-initialization.");
    return;
  }

  // Initial authentication attempt (e.g., with custom token from Canvas environment)
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  try {
    if (initialAuthToken) {
      const { data, error } = await supabase.auth.signInWithCustomToken(initialAuthToken);
      if (error) {
        // Log custom token error. No fallback to anonymous sign-in.
        const errorMessage = error.message || (error.response?.data ? JSON.stringify(error.response.data) : String(error));
        console.error("Supabase custom token sign-in error:", errorMessage);
        currentUserId = null; // User remains unauthenticated
      } else {
        currentUserId = data.user?.id;
      }
    } else {
      // If no initial token, user remains unauthenticated. No anonymous sign-in attempt.
      console.log("No initial auth token provided. User will remain unauthenticated.");
      currentUserId = null;
    }
  } catch (error) {
    // Catch-all for any unexpected errors during initial authentication
    const catchErrorMessage = error.message || (error.response?.data ? JSON.stringify(error.response.data) : String(error));
    console.error("Error during initial Supabase authentication:", catchErrorMessage);
    currentUserId = null; // User remains unauthenticated
  }

  // Set up auth state change listener
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    currentUserId = session?.user?.id || null;
    // Ensure event and currentUserId are stringified for console.log
    console.log('Auth state changed:', String(event), 'User ID:', String(currentUserId));
    // Here you might dispatch a Redux action to update your store's auth state
    // e.g., store.dispatch(authSlice.actions.setUser(session?.user || null));
  });

  authListenerUnsubscribe = listener.unsubscribe; // Store unsubscribe function
  console.log("Auth service initialized and listener set.");
};

// Function to get the current user ID
export const getCurrentUserId = () => currentUserId;

// AuthService class for common authentication operations
export class AuthService {
  // Removed signInAnonymously method as it's no longer desired
  // static async signInAnonymously() {
  //   const { data, error } = await supabase.auth.signInAnonymously();
  //   if (error) {
  //     throw new Error(error.message || 'Anonymous sign-in failed.');
  //   }
  //   return data.user;
  // }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Throw a standard Error object with a message
      throw new Error(error.message || 'Sign out failed.');
    }
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Throw a standard Error object with a message
      throw new Error(error.message || 'Failed to get current user.');
    }
    return user;
  }

  static async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .upsert({ id: userId, ...updates })
      .select();
    if (error) {
      // Throw a standard Error object with a message
      throw new Error(error.message || 'Failed to update user profile.');
    }
    return data;
  }
}
