import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  modals: {
    projectForm: false,
    gitHubImport: false,
    shareProject: false,
    autoWorkLogShare: false,
    workLogGenerator: false,
    userProfile: false,
  },
  modalData: {}, // Added to store data passed to modals
  
  // Active tab states
  activeTab: 'projects',
  
  // Notifications
  notifications: [],
  
  // Loading states for various operations
  loading: {
    global: false,
    projects: false,
    auth: false,
    github: false,
    sharing: false,
  },
  
  // Theme and preferences
  theme: 'light',
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      state.modals[modalName] = true;
      if (data) {
        state.modalData = { ...state.modalData, [modalName]: data };
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = false;
      if (state.modalData) {
        delete state.modalData[modalName];
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
      state.modalData = {};
    },
    
    // Tab actions
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading actions
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loading[key] = isLoading;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Sidebar actions
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const {
  // Modal actions
  openModal,
  closeModal,
  closeAllModals,
  
  // Tab actions
  setActiveTab,
  
  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Loading actions
  setLoading,
  setGlobalLoading,
  
  // Theme actions
  setTheme,
  toggleTheme,
  
  // Sidebar actions
  setSidebarOpen,
  toggleSidebar,
} = uiSlice.actions;

// Selectors
export const selectModals = (state) => state.ui.modals;
export const selectModalData = (state) => state.ui.modalData; // New selector for modal data
export const selectActiveTab = (state) => state.ui.activeTab;
export const selectNotifications = (state) => state.ui.notifications;
export const selectLoading = (state) => state.ui.loading;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;

export default uiSlice.reducer;
