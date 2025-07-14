import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import projectsSlice from './slices/projectsSlice.js';
import uiSlice from './slices/uiSlice.js';
import sharingSlice from './slices/sharingSlice.js';
import githubSlice from './slices/githubSlice.js';

/**
 * Configures and creates the Redux store for the application.
 * It combines various slices (auth, projects, ui, sharing, github) into a single reducer.
 * Custom middleware is applied to handle non-serializable actions from Redux Persist.
 */
export const store = configureStore({
  reducer: {
    // Each key here corresponds to a slice of your application state
    auth: authSlice,      // Handles authentication state (user, loading, error)
    projects: projectsSlice,  // Manages project data (list, current project, stats)
    ui: uiSlice,          // Controls UI-related states (modals, tabs, notifications, theme)
    sharing: sharingSlice,    // Manages data and state related to social sharing features
    github: githubSlice,    // Handles GitHub import and related states
    
  },
  // Custom middleware setup
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for specific Redux Persist actions
      // This is necessary because Redux Persist actions like 'persist/PERSIST' and 'persist/REHYDRATE'
      // contain non-serializable values (e.g., Promises), which would otherwise trigger warnings.
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
