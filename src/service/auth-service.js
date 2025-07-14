// auth-service.js
import { createClient } from '@supabase/supabase-js';

// Global Supabase client instance and user ID
let supabase = null;
let currentUserId = null;
let authInitializedPromise = null;

// Function to initialize Supabase and handle authentication
export const initializeSupabase = async () => {
  if (authInitializedPromise) {
    return authInitializedPromise; // Return existing promise if already initializing
  }

  authInitializedPromise = (async () => {
    // These variables are provided by the Canvas environment.
    // __firebase_config is a generic platform configuration object.
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    let platformConfig = {};
    try {
      if (typeof __firebase_config !== 'undefined') {
        platformConfig = JSON.parse(__firebase_config);
      }
    } catch (e) {
      console.error("Error parsing __firebase_config:", e.message ? String(e.message) : String(e));
      // Fallback to empty config if parsing fails
    }
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    // Supabase URL and Anon Key are extracted from the platformConfig.
    // IMPORTANT: If the above `platformConfig` does NOT provide these,
    // you MUST replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY'
    // with your actual Supabase Project URL and Public Anon Key.
    // You can find these in your Supabase project settings under "API".
    const supabaseUrl =  import.meta.env.VITE_SUPABASE_URL; // <-- REPLACE THIS WITH YOUR ACTUAL SUPABASE URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // <-- REPLACE THIS WITH YOUR ACTUAL SUPABASE ANON KEY

    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
      console.error("Supabase URL is not configured. Please update auth-service.js with your Supabase URL.");
      throw new Error("Supabase URL not configured.");
    }
    if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
      console.error("Supabase Anon Key is not configured. Please update auth-service.js with your Supabase Anon Key.");
      throw new Error("Supabase Anon Key not configured.");
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Initial authentication attempt
    try {
      if (initialAuthToken) {
        const { data, error } = await supabase.auth.signInWithCustomToken(initialAuthToken);
        if (error) {
          // Ensure error.message is a string, or fallback to String(error)
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
      console.error("Error during Supabase initialization or authentication:", error.message ? String(error.message) : String(error));
      currentUserId = crypto.randomUUID(); // Generate a random ID for unauthenticated users
    }

    // Listen for auth state changes
    // Correctly destructure the subscription object
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      currentUserId = session?.user?.id || null;
      // Explicitly convert event and currentUserId to strings for robust logging
      console.log('Auth state changed:', String(event), 'User ID:', String(currentUserId));
      // You might want to dispatch a Redux action here to update the store
      // e.g., store.dispatch(authSlice.actions.setUser(session?.user || null));
    });

    // Store the subscription object so it can be unsubscribed later
    // This is crucial for cleanup in React's useEffect
    return { supabase, userId: currentUserId, authSubscription: subscription };
  })();

  return authInitializedPromise;
};

// Export a function to get the Supabase client instance after initialization
export const getSupabaseInstance = () => {
  if (!supabase) {
    console.warn("Supabase client not yet initialized. Call initializeSupabase() first.");
  }
  return supabase;
};


export class AuthService {
  static async getSupabaseClient() {
    // initializeSupabase now returns { supabase, userId, authSubscription }
    const { supabase: client, userId } = await initializeSupabase();
    if (!client) {
      throw new Error("Supabase client could not be initialized.");
    }
    return { client, userId };
  }

  static async signInAnonymously() {
    const { client } = await AuthService.getSupabaseClient();
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  }

  static async signOut() {
    const { client } = await AuthService.getSupabaseClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { client } = await AuthService.getSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async updateUserProfile(userId, updates) {
    const { client } = await AuthService.getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .upsert({ id: userId, ...updates })
      .select();
    if (error) throw error;
    return data;
  }
}
