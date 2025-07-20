// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '../../components/auth/auth-service.js'; // Adjust the import path as needed

// Async Thunks
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AuthService.getCurrentUser();
      return user;
    } catch (error) {
      // Ensure the rejected value is always a string
      return rejectWithValue(error.message ? String(error.message) : String(error));
    }
  }
);

export const signInAnonymously = createAsyncThunk(
  'auth/signInAnonymously',
  async (_, { rejectWithValue }) => {
    try {
      const user = await AuthService.signInAnonymously();
      return user;
    } catch (error) {
      // Ensure the rejected value is always a string
      return rejectWithValue(error.message ? String(error.message) : String(error));
    }
  }
);

//clearUser (Note: This thunk name might conflict with a reducer action if both are named 'clearUser')
export const clearUser = createAsyncThunk(
  'auth/clearUserThunk', // Renamed to avoid potential conflict with reducer action 'clearUser'
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
      return null; // Return null to indicate user is cleared
    } catch (error) {
      // Ensure the rejected value is always a string
      return rejectWithValue(error.message ? String(error.message) : String(error));
    }
  }
);

//signOutUser (Note: This thunk name might conflict with 'signOut' thunk)
export const signOutUser = createAsyncThunk(
  'auth/signOutUserThunk', // Renamed to differentiate from 'signOut' thunk
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
      return null; // On successful sign out, user becomes null
    } catch (error) {
      // Ensure the rejected value is always a string
      return rejectWithValue(error.message ? String(error.message) : String(error));
    }
  }
);

// signOut (This seems to be the primary sign out thunk based on useAuth hook)
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
      return null; // Return null to indicate user is signed out
    } catch (error) {
      // Ensure the rejected value is always a string
      return rejectWithValue(error.message ? String(error.message) : String(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      const updatedProfile = await AuthService.updateUserProfile(userId, updates);
      return updatedProfile;
    } catch (error) {
      // Ensure the rejected value is always a string
      return rejectWithValue(error.message ? String(error.message) : String(error));
    }
  }
);


export const initialState = { // Added export here
  user: null, // Stores user object if authenticated
  isAuthenticated: false, // Added isAuthenticated state
  isInitialized: false, // Added isInitialized state
  isLoading: false,
  isUpdatingProfile: false, // Added for profile update loading
  isUploadingAvatar: false, // Added for avatar upload loading
  error: null,
  profileError: null, // Specific error for profile updates
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to manually set user (e.g., from onAuthStateChange listener in service)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload; // Set isAuthenticated based on user presence
      state.isLoading = false;
      state.error = null;
      state.isInitialized = true; // Mark as initialized once user is set
    },
    clearAuthError: (state) => {
      state.error = null;
      state.profileError = null; // Clear profile error too
    },
    // Renamed clearUser reducer action to avoid conflict with thunk
    resetUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.profileError = null;
      state.isInitialized = true; // Still initialized, just no user
    },
    setAuthInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    setAuthLoading: (state, action) => { // Generic loading setter
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadUser
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isInitialized = false; // Set to false while loading initial user
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isInitialized = true; // Mark as initialized on success
        state.error = null; // Clear any previous error
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = String(action.payload); // Ensure error is a string
        state.isInitialized = true; // Mark as initialized even on rejection
      })
      // signInAnonymously
      .addCase(signInAnonymously.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInAnonymously.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null; // Clear any previous error
      })
      .addCase(signInAnonymously.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = String(action.payload); // Ensure error is a string
      })
      // clearUserThunk (formerly clearUser)
      .addCase(clearUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(clearUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload); // Ensure error is a string
      })
      // signOutUserThunk (formerly signOutUser)
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null; // User is null after sign out
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload); // Ensure error is a string
      })
      // signOut (primary sign out thunk)
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload); // Ensure error is a string
      })
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdatingProfile = true; // Use specific loading state
        state.profileError = null; // Use specific error state
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        // Update the user's profile data in the state if the payload contains it
        if (action.payload) {
          state.user = { ...state.user, user_metadata: { ...state.user?.user_metadata, ...action.payload } };
          // Or if you store profile separately: state.profile = action.payload;
        }
        state.profileError = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.profileError = String(action.payload); // Ensure error is a string
      });
  },
});

export const { setUser, clearAuthError, resetUser, setAuthInitialized, setAuthLoading } = authSlice.actions;

// Selectors
// Ensure these selectors are explicitly exported
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectIsUpdatingProfile = (state) => state.auth.isUpdatingProfile;
export const selectProfileError = (state) => state.auth.profileError;

export default authSlice.reducer;
/**
 * Generates a concise project summary based on the provided project details.
 * Uses the Chat Completions API for better performance and cost.
 *
 * @param {object} projectDetails - An object containing details of a project (e.g., { title: 'My Awesome App', description: 'A mobile app that does X.', technologies: ['React Native', 'Firebase'] }).
 * @returns {Promise<string>} A promise that resolves to a concise project summary string.
 */

import axios from 'axios';
export const generateProjectSummary = async (projectDetails) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API Key is not set. Please check your .env.local file.');
    throw new Error('OpenAI API Key is missing.');
  }

  try {
    const promptMessage = `Generate a concise, 2-3 sentence summary for the following ALX Software Engineering project. Focus on its purpose, key features, and main technologies used.
    Project Details: ${JSON.stringify(projectDetails, null, 2)}`;

    const response = await axios.post(
      OPENAI_CHAT_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specialized in summarizing software engineering projects for portfolios.',
          },
          {
            role: 'user',
            content: promptMessage,
          },
        ],
        max_tokens: 80,
        temperature: 0.5,
        n: 1,
      }, 
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    const rawText = response.data.choices[0].message.content.trim();
    return rawText.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(line => line.length > 0);
  } catch (error) {
    console.error('Error fetching project summary:', error.response ? JSON.stringify(error.response.data) : error.message);
    throw error;
  }
};