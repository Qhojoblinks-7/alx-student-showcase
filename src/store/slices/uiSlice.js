// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect'; // For memoized selectors

// --- Initial State ---
const initialState = {
  activeDashboardTab: 'projects', // 'projects', 'stats', 'profile'
  isAddProjectModalOpen: false,
  isGitHubImportModalOpen: false,
  isShareProjectModalOpen: false,
  isWorkLogGeneratorModalOpen: false,
  isSidebarOpen: false, // <-- ADDED: Initialize isSidebarOpen to false
  globalLoading: false, // For general app-wide loading states
  notifications: [], // For sonner toasts, if managed centrally (optional, Sonner usually handles this directly)
  theme: 'light', // 'light' or 'dark'
};

// --- Slice Definition ---
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Dashboard Tab Management
    setActiveDashboardTab: (state, action) => {
      state.activeDashboardTab = action.payload;
    },

    // Add Project Modal
    openAddProjectModal: (state) => {
      state.isAddProjectModalOpen = true;
    },
    closeAddProjectModal: (state) => {
      state.isAddProjectModalOpen = false;
    },

    // GitHub Import Modal
    openGitHubImportModal: (state) => {
      state.isGitHubImportModalOpen = true;
    },
    closeGitHubImportModal: (state) => {
      state.isGitHubImportModalOpen = false;
    },

    // Share Project Modal
    openShareProjectModal: (state) => {
      state.isShareProjectModalOpen = true;
    },
    closeShareProjectModal: (state) => {
      state.isShareProjectModalOpen = false;
    },

    // Work Log Generator Modal
    openWorkLogGeneratorModal: (state) => {
      state.isWorkLogGeneratorModalOpen = true;
    },
    closeWorkLogGeneratorModal: (state) => {
      state.isWorkLogGeneratorModalOpen = false;
    },

    // Global Loading Indicator
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },

    // Notifications (Optional: Sonner often handles directly, but useful for central state)
    addNotification: (state, action) => {
      // action.payload should be an object like { id: 'unique-id', message: '...', type: 'success' }
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      // action.payload should be the ID of the notification to remove
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    // Theme Toggler
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      // Optional: Update data-theme attribute or toggle dark class on <html> for Tailwind CSS
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },

    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    }
  },
});

// --- Actions Export ---
export const {
  setActiveDashboardTab,
  openAddProjectModal,
  closeAddProjectModal,
  openGitHubImportModal,
  closeGitHubImportModal,
  openShareProjectModal,
  closeShareProjectModal,
  openWorkLogGeneratorModal,
  closeWorkLogGeneratorModal,
  setGlobalLoading,
  addNotification,
  removeNotification,
  toggleTheme,
  setSidebarOpen,
} = uiSlice.actions;

// --- Selectors ---
// Base selector for the UI state
const selectUIState = (state) => state.ui;

export const selectActiveDashboardTab = createSelector(
  [selectUIState],
  (uiState) => uiState.activeDashboardTab
);

export const selectIsAddProjectModalOpen = createSelector(
  [selectUIState],
  (uiState) => uiState.isAddProjectModalOpen
);

export const selectIsGitHubImportModalOpen = createSelector(
  [selectUIState],
  (uiState) => uiState.isGitHubImportModalOpen
);

export const selectIsShareProjectModalOpen = createSelector(
  [selectUIState],
  (uiState) => uiState.isShareProjectModalOpen
);

export const selectIsWorkLogGeneratorModalOpen = createSelector(
  [selectUIState],
  (uiState) => uiState.isWorkLogGeneratorModalOpen
);

// ADDED: Selector for isSidebarOpen
export const selectIsSidebarOpen = createSelector(
  [selectUIState],
  (uiState) => uiState.isSidebarOpen
);

export const selectGlobalLoading = createSelector(
  [selectUIState],
  (uiState) => uiState.globalLoading
);

export const selectNotifications = createSelector(
  [selectUIState],
  (uiState) => uiState.notifications
);

export const selectTheme = createSelector(
  [selectUIState],
  (uiState) => uiState.theme
);

export default uiSlice.reducer;