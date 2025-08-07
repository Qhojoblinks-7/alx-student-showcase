// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect'; // For memoized selectors
import { AuthService } from '../../lib/auth-service'; // Import the MongoDB auth service

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
  async ({ email, password, username, fullName }, { rejectWithValue }) => {
    try {
      // Use AuthService for the actual API call
      const { user, token } = await AuthService.signUp({ email, password, username, fullName });

      // Store token in localStorage
      localStorage.setItem('authToken', token);

      return user;
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
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return null;
      }

      // Get current user using the token
      const user = await AuthService.getCurrentUser(token);
      
      if (!user) {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        return null;
      }

      return user;
    } catch (error) {
      console.error("Get session error:", error.message);
      localStorage.removeItem('authToken');
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
      const { user, token } = await AuthService.signIn(email, password);

      // Store token in localStorage
      localStorage.setItem('authToken', token);

      return user; // Return the user object directly from AuthService
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
      // For now, we'll implement a simple GitHub OAuth flow
      // This would need to be implemented with a backend service
      throw new Error('GitHub OAuth not implemented yet. Please use email/password authentication.');
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
      // Remove token from localStorage
      localStorage.removeItem('authToken');
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