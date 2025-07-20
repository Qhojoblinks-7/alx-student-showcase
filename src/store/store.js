import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import uiReducer from './slices/uiSlice';
import githubReducer from './slices/githubSlice';
import sharingReducer from './slices/sharingSlice'; // Assuming you have a sharingSlice

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    ui: uiReducer,
    github: githubReducer,
    sharing: sharingReducer, // Add your sharing slice here
  },
  // Optionally, you can add middleware or other configurations here
  // For example, if you want to disable Redux DevTools in production:
  // devTools: process.env.NODE_ENV !== 'production',
});

export default store;
