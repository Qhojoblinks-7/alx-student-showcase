import { supabase } from '../../lib/supabase'; // Corrected import path for supabase

/**
 * @typedef {Object} AuthResponse
 * @property {Object | null} user - The user object if successful, otherwise null.
 * @property {Object | null} session - The session object if successful, otherwise null.
 * @property {Error | null} error - An error object if the operation failed.
 */

const authService = {
  /**
   * Signs up a new user with email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<AuthResponse>}
   */
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        throw error;
      }
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth Service: Sign Up Error:', error.message);
      return { user: null, session: null, error };
    }
  },

  /**
   * Signs in an existing user with email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<AuthResponse>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth Service: Sign In Error:', error.message);
      return { user: null, session: null, error };
    }
  },

  /**
   * Signs out the current user.
   * @returns {Promise<{ error: Error | null }>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { error: null };
    } catch (error) {
      console.error('Auth Service: Sign Out Error:', error.message);
      return { error };
    }
  },

  /**
   * Gets the current user session.
   * @returns {Promise<{ session: Object | null, error: Error | null }>}
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return { session, error: null };
    } catch (error) {
      console.error('Auth Service: Get Session Error:', error.message);
      return { session: null, error };
    }
  },

  /**
   * Gets the current authenticated user.
   * This is generally preferred over `getSession` if you just need the user object,
   * as it directly returns the `user` and handles refresh if needed.
   * @returns {Promise<{ user: Object | null, error: Error | null }>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return { user, error: null };
    } catch (error) {
      console.error('Auth Service: Get User Error:', error.message);
      return { user: null, error };
    }
  },

  /**
   * Listens for changes in the authentication state.
   * @param {(event: string, session: Object | null) => void} callback - The callback function.
   * @returns {Object} A subscription object with an unsubscribe method.
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },

  /**
   * Sends a password reset email.
   * @param {string} email - The user's email.
   * @returns {Promise<{ error: Error | null }>}
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // Define your password update page
      });
      if (error) {
        throw error;
      }
      return { error: null };
    } catch (error) {
      console.error('Auth Service: Reset Password Error:', error.message);
      return { error };
    }
  },

  /**
   * Updates the user's password.
   * This is typically called from a page redirected to after a password reset email.
   * @param {string} newPassword - The new password.
   * @returns {Promise<AuthResponse>}
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth Service: Update Password Error:', error.message);
      return { user: null, session: null, error };
    }
  },

  /**
   * Initiates the OAuth sign-in flow with GitHub.
   * Supabase will handle the redirection to GitHub and back to your app.
   * @returns {Promise<{ data: Object | null, error: Error | null }>}
   */
  async signInWithGitHub() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          // IMPORTANT: This URL must be added to your Supabase project's
          // "Authentication -> URL Configuration -> Redirect URLs"
          // and also to your GitHub OAuth App's "Authorization callback URL".
          // Using `/dashboard` is a common default for a post-login landing page.
          redirectTo: `${window.location.origin}/dashboard`,
          // Request the 'repo' scope to get access to both public and private repositories.
          // If you only need public, use 'public_repo'.
          scopes: 'repo',
        },
      });

      if (error) {
        throw error;
      }
      // For OAuth, `data` here often contains a URL to redirect to, as the browser will handle the redirect.
      // The user object itself won't be in `data` until after the callback and session is established.
      return { data, error: null };
    } catch (error) {
      console.error('Auth Service: Sign In with GitHub Error:', error.message);
      return { data: null, error };
    }
  },
};

export default authService;