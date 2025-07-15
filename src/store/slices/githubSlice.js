import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GitHubService, ALXProjectDetector } from '../../lib/github-service.js'; // Corrected import path
import { supabase } from '../../lib/supabase.js'; // Import Supabase client

// Async Thunks
export const fetchUserRepositories = createAsyncThunk( // Renamed from fetchRepositories
  'github/fetchUserRepositories',
  async (username, { rejectWithValue }) => {
    try {
      const response = await GitHubService.fetchUserRepositories(username);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const detectALXProjects = createAsyncThunk(
  'github/detectALXProjects',
  async ({ repositories, username }, { rejectWithValue }) => {
    try {
      // ALXProjectDetector.detectALXProjects now returns an object { alxProjects: [...], skippedProjects: [...] }
      const detectionResult = await ALXProjectDetector.detectALXProjects(repositories, username);
      return detectionResult; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importSelectedProjects = createAsyncThunk( // Renamed from importProjects to importSelectedProjects
  'github/importSelectedProjects', // Updated action type as well
  async ({ projectsToImport, userId }, { rejectWithValue }) => {
    console.log("[importSelectedProjects] Projects received for import:", projectsToImport); // Log projects received
    try {
      const imported = [];
      for (const project of projectsToImport) {
        // Prepare project data for Supabase insertion
        const projectDataForDb = {
          user_id: userId,
          // Removed 'id: project.id' to allow Supabase to auto-generate UUID
          title: project.title, // This will now correctly come from the processed alxProject object
          description: project.description,
          technologies: project.technologies || [], // Ensure it's an array
          github_url: project.github_url,
          live_url: project.live_url,
          category: project.category,
          original_repo_name: project.original_repo_name, // Keep original repo name
          alx_confidence: project.alx_confidence,
          last_updated: project.last_updated,
          is_public: project.is_public,
          completion_date: project.completion_date || null,
          time_spent_hours: project.time_spent_hours || null,
          key_learnings: project.key_learnings || '',
          challenges_faced: project.challenges_faced || '',
          image_url: project.image_url || '',
          tags: project.tags || [], // Ensure it's an array
        };

        // Insert project into Supabase database
        const { data, error } = await supabase
          .from('projects')
          .insert([projectDataForDb])
          .select(); // Use .select() to get the newly inserted row

        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(`Failed to insert project ${project.title}: ${error.message}`);
        }
        
        if (data && data.length > 0) {
          imported.push(data[0]); // Add the newly created project to the imported list
        }
      }
      return imported; // Return the list of successfully imported projects
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const initialState = { // Added export here
  repositories: [],
  alxProjects: [],
  selectedProjects: [], // Projects selected for import
  isLoadingRepositories: false,
  isDetectingALX: false,
  isImporting: false,
  error: null,
  repositoryError: null,
  importError: null,
  wizardStep: 'username', // 'username', 'select_repos', 'review_import'
  wizardData: {
    username: '',
    selectedRepoIds: [],
  },
};

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    setRepositories: (state, action) => {
      state.repositories = action.payload;
    },
    setALXProjects: (state, action) => {
      state.alxProjects = action.payload;
    },
    toggleProjectSelection: (state, action) => {
      const projectId = action.payload;
      const isSelected = state.selectedProjects.includes(projectId);
      if (isSelected) {
        state.selectedProjects = state.selectedProjects.filter(id => id !== projectId);
      } else {
        state.selectedProjects.push(projectId);
      }
    },
    setSelectedProjects: (state, action) => {
      state.selectedProjects = action.payload;
    },
    setWizardStep: (state, action) => {
      state.wizardStep = action.payload;
    },
    setWizardData: (state, action) => {
      state.wizardData = { ...state.wizardData, ...action.payload };
    },
    resetGitHubState: (state) => {
      state.repositories = [];
      state.alxProjects = [];
      state.selectedProjects = [];
      state.isLoadingRepositories = false;
      state.isDetectingALX = false;
      state.isImporting = false;
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
      state.wizardStep = 'username';
      state.wizardData = {
        username: '',
        selectedRepoIds: [],
      };
    },
    clearGitHubErrors: (state) => {
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
    },
    clearSelection: (state) => { // This action was missing from exports
      state.selectedProjects = [];
    },
    resetWizard: (state) => { // Added resetWizard action
      state.repositories = [];
      state.alxProjects = [];
      state.selectedProjects = [];
      state.isLoadingRepositories = false;
      state.isDetectingALX = false;
      state.isImporting = false;
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
      state.wizardStep = 'username';
      state.wizardData = { username: '', selectedRepoIds: [] };
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUserRepositories
      .addCase(fetchUserRepositories.pending, (state) => { // Updated case name
        state.isLoadingRepositories = true;
        state.repositoryError = null;
      })
      .addCase(fetchUserRepositories.fulfilled, (state, action) => { // Updated case name
        state.isLoadingRepositories = false;
        state.repositories = action.payload;
      })
      .addCase(fetchUserRepositories.rejected, (state, action) => { // Updated case name
        state.isLoadingRepositories = false;
        state.repositoryError = action.payload;
        state.repositories = [];
      })
      // detectALXProjects
      .addCase(detectALXProjects.pending, (state) => {
        state.isDetectingALX = true;
        state.error = null;
      })
      .addCase(detectALXProjects.fulfilled, (state, action) => {
        state.isDetectingALX = false;
        // Corrected: action.payload is now an object { alxProjects: [...], skippedProjects: [...] }
        state.alxProjects = action.payload.alxProjects; 
        // Automatically select all detected ALX projects for import
        state.selectedProjects = action.payload.alxProjects.map(project => project.id);

        console.log("[detectALXProjects.fulfilled] Payload:", action.payload);
        console.log("[detectALXProjects.fulfilled] Resulting state.alxProjects:", state.alxProjects);
        console.log("[detectALXProjects.fulfilled] Resulting state.selectedProjects:", state.selectedProjects);

        if (action.payload.skippedProjects && action.payload.skippedProjects.length > 0) {
          console.warn("Skipped projects during ALX detection:", action.payload.skippedProjects);
        }
      })
      .addCase(detectALXProjects.rejected, (state, action) => {
        state.isDetectingALX = false;
        state.error = action.payload;
        state.alxProjects = [];
      })
      // importSelectedProjects (Updated case name)
      .addCase(importSelectedProjects.pending, (state) => {
        state.isImporting = true;
        state.importError = null;
      })
      .addCase(importSelectedProjects.fulfilled, (state, action) => {
        state.isImporting = false;
        // Optionally add imported projects to the main projects state if needed,
        // or rely on a re-fetch of all projects after import.
        state.selectedProjects = []; // Clear selected projects after import
        state.wizardStep = 'username'; // Reset wizard
        state.wizardData = { username: '', selectedRepoIds: [] };
      })
      .addCase(importSelectedProjects.rejected, (state, action) => {
        state.isImporting = false;
        state.importError = action.payload;
      });
  },
});

export const {
  setRepositories,
  setALXProjects,
  toggleProjectSelection,
  setSelectedProjects,
  setWizardStep,
  setWizardData, // Exported updateWizardData action
  resetGitHubState,
  clearGitHubErrors,
  clearSelection, // Exported clearSelection action
  resetWizard, // Exported resetWizard action
  updateWizardData,
} = githubSlice.actions;

export default githubSlice.reducer;
