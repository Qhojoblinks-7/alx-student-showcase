// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice'; // Assuming you have a uiSlice for UI state management
import githubReducer from '../../home/wizard/slices/githubSlice'; // Import the GitHub slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    github: githubReducer // Assuming you have a uiSlice for UI state management
    // Add other reducers here if you have them
  },
});