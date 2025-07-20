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

// signOut (This is the primary sign out thunk based on useAuth hook)
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


export const initialState = {
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
    // Removed resetUser, setAuthInitialized, setAuthLoading as they are handled by setUser/loadUser thunks
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

export const { setUser, clearAuthError } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectIsUpdatingProfile = (state) => state.auth.isUpdatingProfile;
export const selectProfileError = (state) => state.auth.profileError;

export default authSlice.reducer;
