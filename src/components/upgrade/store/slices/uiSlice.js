// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isAddProjectModalOpen: false,
    isSidebarOpen: false, // For mobile responsiveness (Sheet component)
  },
  reducers: {
    toggleAddProjectModal: (state) => {
      state.isAddProjectModalOpen = !state.isAddProjectModalOpen;
    },
    setAddProjectModalOpen: (state, action) => {
      state.isAddProjectModalOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { toggleAddProjectModal, setAddProjectModalOpen, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;