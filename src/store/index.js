// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
// Import other slices here as they are created:
import projectsReducer from './slices/projectsSlice';
import profileReducer from './slices/profileSlice';
import statsReducer from './slices/statsSlice';
import githubReducer from './slices/githubSlice';
import sharingReducer from './slices/sharingSlice';
import commentsReducer from './slices/commentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    projects: projectsReducer, // NEW
    profile: profileReducer,   // NEW
    stats: statsReducer,       // NEW
    github: githubReducer,     // NEW
    sharing: sharingReducer,
    comments: commentsReducer, // NEW
  },
  // Optionally add middleware or enhancers
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // You might need to disable serializableCheck for large objects from APIs like Supabase session,
      // but it's good practice to keep it on if possible for debugging.
      // serializableCheck: {
      //   ignoredActions: ['auth/getSession/fulfilled', 'auth/signIn/fulfilled'],
      //   ignoredPaths: ['auth.user.aud', 'auth.user.created_at', 'auth.user.email_confirmed_at', 'auth.user.last_sign_in_at', 'auth.user.role', 'auth.user.updated_at'],
      // },
    }),
});

export default store;
