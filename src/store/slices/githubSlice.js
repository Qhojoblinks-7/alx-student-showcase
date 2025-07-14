// githubSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect'; // Import createSelector for memoization
import { supabase } from '../../lib/supabase.js'; // Corrected import path
import { GitHubService, ALXProjectDetector } from '../../lib/github-service.js'; // Ensure this path is correct for your project structure

// No need for initializeSupabase here; supabase is imported directly from lib/supabase.js
// and should be initialized once at the application entry point (e.g., main.jsx).

// Async thunks for GitHub operations
export const fetchUserRepositories = createAsyncThunk(
  'github/fetchUserRepositories',
  async (username, { rejectWithValue }) => {
    try {
      const repos = await GitHubService.fetchUserRepositories(username);
      return repos;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const detectALXProjects = createAsyncThunk(
  'github/detectALXProjects',
  async ({ repositories, username }, { rejectWithValue }) => {
    try {
      const alxProjects = await ALXProjectDetector.detectALXProjects(repositories, username);
      return alxProjects;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importSelectedProjects = createAsyncThunk(
  'github/importSelectedProjects',
  async ({ selectedProjects, repositories, username }, { rejectWithValue }) => {
    try {
      // Supabase client is now directly imported and assumed to be initialized.
      // User ID should be obtained from the Redux auth state or passed explicitly if needed for this operation's context.
      // For this thunk, we'll assume the user.id is available in the component calling it,
      // or that the RLS policies are set up to allow inserts based on auth.uid() without explicit user_id in payload.
      // However, for explicit user_id, it should be passed from the component.
      // For now, we'll assume the `user_id` is passed as part of `projectsToCreate` or inferred by RLS.

      const selectedRepos = repositories.filter(repo => 
        selectedProjects.includes(repo.id)
      );
      
      const projectsToCreate = [];
      
      // Generate project data for each selected repository
      for (const repo of selectedRepos) {
        const projectData = await ALXProjectDetector.generateProjectData(repo, username);
        
        // Map to full database schema
        const enhancedProjectData = {
          ...projectData,
          // user_id: userId, // Removed, as userId is not directly available here.
                           // It should be added by the component calling this thunk,
                           // or handled by RLS if the user is authenticated.
          original_repo_name: repo.name,
          alx_confidence: projectData.alx_confidence || 0.0,
          last_updated: repo.updated_at || new Date().toISOString(),
          is_public: !repo.private,
          category: projectData.category || 'other',
          technologies: projectData.technologies || [],
          github_url: repo.html_url,
          live_url: repo.homepage || null,
        };
        
        projectsToCreate.push(enhancedProjectData);
      }

      // --- Database Insertion Logic ---
      // Insert the prepared projects into the 'projects' table
      const { data, error } = await supabase
        .from('projects')
        .insert(projectsToCreate)
        .select(); // Select the inserted data to return it

      if (error) {
        console.error("Error inserting projects into Supabase:", error);
        throw new Error(`Failed to import projects: ${error.message}`);
      }

      console.log("Successfully imported projects:", data);
      return data; // Return the inserted data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRepositoryDetails = createAsyncThunk(
  'github/fetchRepositoryDetails',
  async ({ username, repoName }, { rejectWithValue }) => {
    try {
      const [readme, languages, contents] = await Promise.all([
        GitHubService.fetchRepositoryReadme(username, repoName),
        GitHubService.fetchRepositoryLanguages(username, repoName),
        GitHubService.fetchRepositoryContents(username, repoName)
      ]);

      return {
        readme,
        languages,
        contents
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initialState = { // Added 'export' keyword
  // Current GitHub user
  currentUser: '',
  
  // Repository data
  repositories: [],
  alxProjects: [],
  selectedProjects: [],
  
  // Repository details
  repositoryDetails: {},
  
  // Import data
  importCandidates: [],
  
  // Loading states
  isLoadingRepositories: false,
  isDetectingALX: false,
  isImporting: false,
  isLoadingDetails: false,
  
  // Error states
  error: null,
  repositoryError: null,
  importError: null,
  
  // Import wizard state
  wizardStep: 'username', // 'username', 'select', 'import'
  wizardData: {},
};

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    // Clear states
    clearError: (state) => {
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
    },
    clearRepositories: (state) => {
      state.repositories = [];
      state.alxProjects = [];
      state.selectedProjects = [];
      state.repositoryDetails = {};
    },
    clearImportData: (state) => {
      state.importCandidates = [];
      state.selectedProjects = [];
    },
    
    // User actions
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    
    // Selection actions
    toggleProjectSelection: (state, action) => {
      const projectId = action.payload;
      const index = state.selectedProjects.indexOf(projectId);
      
      if (index === -1) {
        state.selectedProjects.push(projectId);
      } else {
        state.selectedProjects.splice(index, 1);
      }
    },
    selectAllALXProjects: (state) => {
      state.selectedProjects = state.alxProjects.map(project => project.id);
    },
    clearSelection: (state) => { // This is the clearSelection action
      state.selectedProjects = [];
    },
    setSelectedProjects: (state, action) => {
      state.selectedProjects = action.payload;
    },
    
    // Wizard actions
    setWizardStep: (state, action) => {
      state.wizardStep = action.payload;
    },
    updateWizardData: (state, action) => {
      state.wizardData = { ...state.wizardData, ...action.payload };
    },
    resetWizard: (state) => {
      state.wizardStep = 'username';
      state.wizardData = {};
      state.selectedProjects = [];
      state.repositories = [];
      state.alxProjects = [];
    },
    
    // Manual data updates
    updateRepositoryDetails: (state, action) => {
      const { repoKey, details } = action.payload;
      state.repositoryDetails[repoKey] = details;
    },
    clearGitHubErrors: (state) => { // Added clearGitHubErrors reducer here
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user repositories
      .addCase(fetchUserRepositories.pending, (state) => {
        state.isLoadingRepositories = true;
        state.repositoryError = null;
      })
      .addCase(fetchUserRepositories.fulfilled, (state, action) => {
        state.isLoadingRepositories = false;
        state.repositories = action.payload;
        state.repositoryError = null;
      })
      .addCase(fetchUserRepositories.rejected, (state, action) => {
        state.isLoadingRepositories = false;
        state.repositoryError = action.payload;
        state.repositories = [];
      })
      
      // Detect ALX projects
      .addCase(detectALXProjects.pending, (state) => {
        state.isDetectingALX = true;
        state.error = null;
      })
      .addCase(detectALXProjects.fulfilled, (state, action) => {
        state.isDetectingALX = false;
        state.alxProjects = action.payload;
        state.error = null;
      })
      .addCase(detectALXProjects.rejected, (state, action) => {
        state.isDetectingALX = false;
        state.error = action.payload;
        state.alxProjects = [];
      })
      
      // Import selected projects
      .addCase(importSelectedProjects.pending, (state) => {
        state.isImporting = true;
        state.importError = null;
      })
      .addCase(importSelectedProjects.fulfilled, (state, action) => {
        state.isImporting = false;
        state.importCandidates = action.payload; // This will now be the data returned from Supabase
        state.importError = null;
      })
      .addCase(importSelectedProjects.rejected, (state, action) => {
        state.isImporting = false;
        state.importError = action.payload;
      })
      
      // Fetch repository details
      .addCase(fetchRepositoryDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchRepositoryDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        // Store details with a key for the specific repository
        state.error = null;
      })
      .addCase(fetchRepositoryDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload;
      });
  },
});

export const {
  // Clear actions
  clearError,
  clearRepositories,
  clearImportData,
  
  // User actions
  setCurrentUser,
  
  // Selection actions
  toggleProjectSelection,
  selectAllALXProjects,
  clearSelection,
  setSelectedProjects,
  
  // Wizard actions
  setWizardStep,
  updateWizardData,
  resetWizard,
  
  // Manual data updates
  updateRepositoryDetails,
  clearGitHubErrors, // Exported clearGitHubErrors here
} = githubSlice.actions;

// Base selectors
const getGitHubState = (state) => state.github;

// Memoized selectors
export const selectCurrentUser = createSelector(getGitHubState, (github) => github.currentUser);
export const selectRepositories = createSelector(getGitHubState, (github) => github.repositories);
export const selectALXProjects = createSelector(getGitHubState, (github) => github.alxProjects);
export const selectSelectedProjects = createSelector(getGitHubState, (github) => github.selectedProjects);
export const selectRepositoryDetails = createSelector(getGitHubState, (github) => github.repositoryDetails);
export const selectImportCandidates = createSelector(getGitHubState, (github) => github.importCandidates);
export const selectWizardStep = createSelector(getGitHubState, (github) => github.wizardStep);
export const selectWizardData = createSelector(getGitHubState, (github) => github.wizardData);

// Memoized loading and error selectors
export const selectGitHubLoading = createSelector(
  getGitHubState,
  (github) => ({
    repositories: github.isLoadingRepositories,
    detecting: github.isDetectingALX,
    importing: github.isImporting,
    details: github.isLoadingDetails,
  })
);

export const selectGitHubErrors = createSelector(
  getGitHubState,
  (github) => ({
    general: github.error,
    repository: github.repositoryError,
    import: github.importError,
  })
);

export default githubSlice.reducer;
