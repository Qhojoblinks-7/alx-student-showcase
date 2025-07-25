// src/store/slices/githubSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { githubService, alxProjectDetector } from '@/lib/github-service'; // Import the new service
import { importProjectFromGitHub } from '@/store/slices/projectsSlice'; // Import the thunk from projectsSlice

// Async Thunks
export const fetchUserRepositories = createAsyncThunk(
  'github/fetchUserRepositories',
  async (username, { rejectWithValue }) => {
    try {
      const repositories = await githubService.fetchUserRepositories(username);
      return repositories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const detectALXProjects = createAsyncThunk(
  'github/detectALXProjects',
  async (repositories, { rejectWithValue }) => {
    try {
      const detected = alxProjectDetector.detectALXProjects(repositories);
      return detected;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importSelectedProjects = createAsyncThunk(
  'github/importSelectedProjects',
  async ({ projectsToImport, userId }, { dispatch, rejectWithValue }) => {
    try {
      const importedResults = [];
      for (const projectData of projectsToImport) {
        // Dispatch the importProjectFromGitHub thunk from projectsSlice for each project
        // This leverages the projectsSlice's logic for adding to DB and triggering AI
        const result = await dispatch(importProjectFromGitHub(projectData));

        if (importProjectFromGitHub.fulfilled.match(result)) {
          importedResults.push(result.payload);
        } else if (importProjectFromGitHub.rejected.match(result)) {
          console.error(`Failed to import project ${projectData.name}:`, result.payload);
          // Decide whether to stop or continue on error
          // For now, we'll continue but collect errors.
          importedResults.push({ ...projectData, status: 'failed', error: result.payload });
        }
      }
      return importedResults;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const githubSlice = createSlice({
  name: 'github',
  initialState: {
    repositories: [],
    alxProjects: [], // After AI detection
    selectedProjects: [], // IDs of selected repositories for detection/import
    isLoadingRepos: false,
    isDetecting: false,
    isImporting: false,
    error: null,
    wizardStep: 1, // Current step in the import wizard
    wizardData: {}, // Stores temporary data across steps (e.g., username input)
  },
  reducers: {
    setWizardStep: (state, action) => {
      state.wizardStep = action.payload;
    },
    setWizardData: (state, action) => {
      state.wizardData = { ...state.wizardData, ...action.payload };
    },
    toggleProjectSelection: (state, action) => {
      const repoId = action.payload;
      if (state.selectedProjects.includes(repoId)) {
        state.selectedProjects = state.selectedProjects.filter(id => id !== repoId);
      } else {
        state.selectedProjects.push(repoId);
      }
    },
    resetGitHubState: (state) => {
      state.repositories = [];
      state.alxProjects = [];
      state.selectedProjects = [];
      state.isLoadingRepos = false;
      state.isDetecting = false;
      state.isImporting = false;
      state.error = null;
      state.wizardStep = 1;
      state.wizardData = {};
    },
    clearGitHubError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUserRepositories
      .addCase(fetchUserRepositories.pending, (state) => {
        state.isLoadingRepos = true;
        state.error = null;
        state.repositories = []; // Clear previous repos
        state.alxProjects = []; // Clear previous detected projects
        state.selectedProjects = []; // Clear selections
      })
      .addCase(fetchUserRepositories.fulfilled, (state, action) => {
        state.isLoadingRepos = false;
        state.repositories = action.payload;
        state.error = null;
      })
      .addCase(fetchUserRepositories.rejected, (state, action) => {
        state.isLoadingRepos = false;
        state.error = action.payload;
      })
      // detectALXProjects
      .addCase(detectALXProjects.pending, (state) => {
        state.isDetecting = true;
        state.error = null;
        state.alxProjects = []; // Clear previous detection
      })
      .addCase(detectALXProjects.fulfilled, (state, action) => {
        state.isDetecting = false;
        state.alxProjects = action.payload;
        state.error = null;
      })
      .addCase(detectALXProjects.rejected, (state, action) => {
        state.isDetecting = false;
        state.error = action.payload;
      })
      // importSelectedProjects
      .addCase(importSelectedProjects.pending, (state) => {
        state.isImporting = true;
        state.error = null;
      })
      .addCase(importSelectedProjects.fulfilled, (state, action) => {
        state.isImporting = false;
        state.error = null;
        // Optionally, reset selected projects or wizard state after successful import
        state.selectedProjects = [];
        // The projects themselves are added to projectsSlice via dispatch(importProjectFromGitHub)
      })
      .addCase(importSelectedProjects.rejected, (state, action) => {
        state.isImporting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setWizardStep,
  setWizardData,
  toggleProjectSelection,
  resetGitHubState,
  clearGitHubError,
} = githubSlice.actions;

export default githubSlice.reducer;