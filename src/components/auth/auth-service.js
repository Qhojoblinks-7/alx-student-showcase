// auth-service.js
import { supabase } from '../../lib/supabase'

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
        console.error("Supabase custom token sign-in error:", error.message ? String(error.message) : String(error));
        // Fallback to anonymous sign-in if custom token fails
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) console.error("Supabase anonymous sign-in error:", anonError.message ? String(anonError.message) : String(anonError));
        else currentUserId = anonData.user?.id;
      } else {
        currentUserId = data.user?.id;
      }
    } else {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) console.error("Supabase anonymous sign-in error:", error.message ? String(error.message) : String(error));
      else currentUserId = data.user?.id;
    }
  } catch (error) {
    console.error("Error during initial Supabase authentication:", error.message ? String(error.message) : String(error));
    currentUserId = crypto.randomUUID(); // Generate a random ID for unauthenticated users
  }

  // Set up auth state change listener
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    currentUserId = session?.user?.id || null;
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
  static async signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .upsert({ id: userId, ...updates })
      .select();
    if (error) throw error;
    return data;
  }
}
