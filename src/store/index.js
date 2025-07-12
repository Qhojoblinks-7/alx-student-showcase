import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import projectsSlice from './slices/projectsSlice.js';
import uiSlice from './slices/uiSlice.js';
import sharingSlice from './slices/sharingSlice.js';
import githubSlice from './slices/githubSlice.js';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    ui: uiSlice,
    sharing: sharingSlice,
    github: githubSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;