// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect'; // For memoized selectors
import authService from '../../components/service/auth-service'; // Import the authService

// --- Initial State ---
const initialState = {
  user: null, // Stores Supabase user object if authenticated
  isLoading: true, // Renamed from 'authLoading' for clarity across different auth actions
  error: null,
};

// --- Async Thunks (createAsyncThunk) ---

/**
 * Registers a new user with Supabase using the authService.
 * @param {object} credentials - Object containing email and password.
 * @param {string} credentials.email
 * @param {string} credentials.password
 */
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Use authService for the actual API call
      const { user, error } = await authService.signUp(email, password);

      if (error) {
        throw new Error(error.message || 'Sign up failed.');
      }

      // If sign-up is successful but user needs email confirmation, user might be null initially
      return user || { message: 'Please check your email to confirm your account.' };
    } catch (error) {
      console.error("Sign up error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetches the current user session from Supabase using the authService.
 * This thunk is crucial for populating the Redux state with the complete
 * user object, including `user_metadata` (e.g., github_access_token) after
 * an OAuth login or on app load/refresh.
 */
export const getSession = createAsyncThunk(
  'auth/getSession',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch the current session first, as it contains provider_token for OAuth
      const { session, error: sessionError } = await authService.getCurrentSession();
      if (sessionError) {
        throw new Error(sessionError.message || 'Failed to get session from authService.');
      }

      let user = null;
      if (session) {
        // Then fetch the user object, which includes user_metadata from the database
        const { user: supabaseUser, error: userError } = await authService.getCurrentUser();
        if (userError) {
          throw new Error(userError.message || 'Failed to get user from authService.');
        }

        user = { ...supabaseUser }; // Start with the user object from Supabase

        // CRITICAL LOGIC: Ensure github_access_token is in user_metadata
        // Supabase often puts the OAuth token (provider_token) directly on the session
        // after a login, but it might not be immediately in user_metadata from getUser()
        // unless explicitly handled or a database trigger is used.
        if (session.provider_token && !user.user_metadata?.github_access_token) {
          user.user_metadata = {
            ...(user.user_metadata || {}), // Preserve existing metadata
            github_access_token: session.provider_token,
          };
          console.log("authSlice: Copied session.provider_token to user.user_metadata.github_access_token");
        }
        // Fallback: If provider_token isn't directly on session (e.g., after a deep refresh),
        // check user.identities, which should contain details for linked OAuth providers.
        else if (user.app_metadata.provider === 'github' && !user.user_metadata?.github_access_token) {
            const githubIdentity = user.identities?.find(id => id.provider === 'github');
            if (githubIdentity?.access_token) {
                user.user_metadata = {
                    ...(user.user_metadata || {}),
                    github_access_token: githubIdentity.access_token,
                };
                console.log("authSlice: Copied githubIdentity.access_token from identities to user.user_metadata.github_access_token");
            }
        }
      }

      // Return the potentially modified user object
      return user;
    } catch (error) {
      console.error("Get session error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Authenticates an existing user with Supabase using email and password via authService.
 * @param {object} credentials - Object containing email and password.
 * @param {string} credentials.email
 * @param {string} credentials.password
 */
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user, error } = await authService.signIn(email, password);

      if (error) {
        throw new Error(error.message || 'Sign in failed.');
      }
      return user; // Return the user object directly from authService
    } catch (error) {
      console.error("Sign in thunk caught error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Initiates GitHub OAuth authentication via authService.
 * This thunk usually just triggers the redirect to GitHub.
 */
export const signInWithGitHub = createAsyncThunk(
  'auth/signInWithGitHub',
  async (_, { rejectWithValue }) => {
    try {
      // Call the new signInWithGitHub method from your authService
      // This will initiate the redirect to GitHub for OAuth.
      const { data, error } = await authService.signInWithGitHub();

      if (error) {
        console.error("Auth service signInWithGitHub error:", error);
        throw new Error(error.message || 'GitHub sign-in failed to initiate.');
      }

      // For OAuth redirect flows, data might be null here as the user is immediately redirected.
      // The actual session and user data will be available on callback, handled by getSession().
      return data;
    } catch (error) {
      console.error("Sign in with GitHub thunk caught error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Logs out the current user from Supabase using the authService.
 */
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      // Use authService for the actual API call
      const { error } = await authService.signOut();

      if (error) {
        throw new Error(error.message || 'Sign out failed.');
      }

      return true; // Indicate success
    } catch (error) {
      console.error("Sign out error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Clears any authentication errors. (Synchronous action, can be dispatched directly)
 */
export const clearAuthError = createAsyncThunk(
  'auth/clearAuthError',
  async (_, { dispatch }) => {
    dispatch(authSlice.actions.setError(null)); // Clear the error state
  }
);

// --- Slice Definition ---

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous reducers for direct state manipulation
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false; // Set loading false after user is set
      state.error = null; // Clear error if user is successfully set
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAuth: (state) => {
      // Reset entire auth state on logout
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- signUp ---
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.id) {
          state.user = action.payload;
        } else {
          // This path for email confirmation message (user might be null initially)
          state.user = null;
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null; // Ensure user is null on sign up failure
      })
      // --- signIn (Email/Password) ---
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // action.payload will be the user object from Supabase
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null; // Ensure user is null on sign in failure
      })
      // --- signInWithGitHub ---
      // For OAuth redirects, 'pending' state is usually brief before redirect.
      // 'fulfilled' might not carry user data directly if the auth happens after redirect.
      // The user state is typically updated by getSession() on callback.
      .addCase(signInWithGitHub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGitHub.fulfilled, (state) => {
        state.isLoading = false;
        // No direct user payload here as it's an initiation of redirect.
        // The getSession() thunk handles the user data after the callback.
      })
      .addCase(signInWithGitHub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error("signInWithGitHub.rejected: Error initiating GitHub OAuth:", action.payload);
      })
      // --- signOut ---
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null; // Clear user on successful sign out
        state.error = null; // Clear any errors
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Optionally keep user if sign out failed, depending on desired UX
        // state.user = null; // Could still clear user if it's a critical failure
      })
      // --- getSession (Crucial for populating user on load/callback) ---
      .addCase(getSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // action.payload will be the user object or null
        state.error = null; // Clear any errors if session is successfully retrieved
      })
      .addCase(getSession.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null; // Ensure user is null if session retrieval fails
        state.error = action.payload; // Set error if session retrieval fails
      });
  },
});

// --- Synchronous Actions Export ---
export const { setUser, setLoading, setError, clearAuth } = authSlice.actions;

// --- Selectors (Memoized for performance) ---
const selectAuthState = (state) => state.auth;

export const selectAuthUser = createSelector(
  [selectAuthState],
  (authState) => authState.user
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (authState) => authState.isLoading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (authState) => authState.error
);

export const selectIsAuthenticated = createSelector(
  [selectAuthUser],
  (user) => !!user // Returns true if user object exists, false otherwise
);

export default authSlice.reducer;