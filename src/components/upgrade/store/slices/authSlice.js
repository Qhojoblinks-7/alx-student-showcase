// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../../../lib/supabase'
import { toast } from 'sonner';

// Async Thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Handle specific Supabase errors if needed, otherwise general message
        let errorMessage = error.message;
        if (error.status === 400 && error.message.includes('User already registered')) {
            errorMessage = "An account with this email already exists.";
        }
        toast.error(`Sign up failed: ${errorMessage}`);
        return rejectWithValue(errorMessage);
      }

      if (data.user) {
        toast.success("Sign up successful! Please check your email to confirm.");
        return data.user;
      } else {
        // This case might happen if email confirmation is required but no user object is returned immediately
        toast.success("Sign up initiated! Please check your email to confirm.");
        return null; // No user object yet, but request was successful
      }
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return rejectWithValue(err.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Sign in failed: ${error.message}`);
        return rejectWithValue(error.message);
      }

      toast.success("Signed in successfully!");
      return data.user;
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return rejectWithValue(err.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(`Sign out failed: ${error.message}`);
        return rejectWithValue(error.message);
      }

      toast.success("Signed out successfully!");
      return true; // Indicate success
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err.message}`);
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // Stores the Supabase user object
    isLoading: false,
    error: null, // Stores a specific error message from the last auth action
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false; // Reset loading on user set
      state.error = null; // Clear any previous errors
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false; // Reset loading on error
    },
    clearAuth: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // SignUp handling
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        // Supabase sign.up returns user if email confirmation is off, or null if on
        state.user = action.payload; // payload is data.user or null
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to sign up.";
      });

    // SignIn handling
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // payload is data.user
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to sign in.";
      });

    // SignOut handling
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to sign out.";
      });
  },
});

export const { setUser, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;