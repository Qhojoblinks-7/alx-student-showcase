import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GitHubService, ALXProjectDetector } from '@/lib/github-service.js';

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
  async ({ selectedProjects, repositories, username, userId }, { rejectWithValue }) => {
    try {
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
          user_id: userId,
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

      return projectsToCreate;
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

const initialState = {
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
    clearSelection: (state) => {
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
        state.importCandidates = action.payload;
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
} = githubSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.github.currentUser;
export const selectRepositories = (state) => state.github.repositories;
export const selectALXProjects = (state) => state.github.alxProjects;
export const selectSelectedProjects = (state) => state.github.selectedProjects;
export const selectRepositoryDetails = (state) => state.github.repositoryDetails;
export const selectImportCandidates = (state) => state.github.importCandidates;
export const selectWizardStep = (state) => state.github.wizardStep;
export const selectWizardData = (state) => state.github.wizardData;
export const selectGitHubLoading = (state) => ({
  repositories: state.github.isLoadingRepositories,
  detecting: state.github.isDetectingALX,
  importing: state.github.isImporting,
  details: state.github.isLoadingDetails,
});
export const selectGitHubErrors = (state) => ({
  general: state.github.error,
  repository: state.github.repositoryError,
  import: state.github.importError,
});

export default githubSlice.reducer;