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
      return rejectWithValue(error.message);
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
      return rejectWithValue(error.message);
    }
  }
);



//clearUser
export const clearUser = createAsyncThunk(
  'auth/clearUser',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
      return null; // Return null to indicate user is cleared
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//signOutUser
export const signOutUser = createAsyncThunk(
  'auth/signOutUser',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
      return null; // On successful sign out, user becomes null
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// signout
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
      return null; // Return null to indicate user is signed out
    } catch (error) {
      return rejectWithValue(error.message);
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
      return rejectWithValue(error.message);
    }
  }
);


export const initialState = { // Added export here
  user: null, // Stores user object if authenticated
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to manually set user (e.g., from onAuthStateChange listener in service)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadUser
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload;
      })
      // signInAnonymously
      .addCase(signInAnonymously.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInAnonymously.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signInAnonymously.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload;
      })
      // signOutUser
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null; // User is null after sign out
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally update the user object in state if the payload contains the full user data
        // state.user = { ...state.user, ...action.payload }; 
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearAuthError } = authSlice.actions;

// Selectors
// Ensure these selectors are explicitly exported
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
