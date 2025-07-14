import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GitHubService, ALXProjectDetector } from '@/lib/github-api-service.js'; // Corrected import path

// Async Thunks
export const fetchRepositories = createAsyncThunk(
  'github/fetchRepositories',
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

export const importProjects = createAsyncThunk(
  'github/importProjects',
  async ({ projectsToImport, userId }, { rejectWithValue }) => {
    // This is a placeholder for actual database integration (e.g., Supabase)
    // You would typically use a service here to save these projects to your backend/DB
    try {
      const imported = [];
      for (const project of projectsToImport) {
        // Simulate saving to DB and getting an ID
        const projectData = {
          ...project,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Ensure tech_stack and tags are arrays, not just a single string or undefined
          tech_stack: project.technologies || [],
          tags: project.tags || [],
          // Map ALX category if needed, or use a default
          category: project.category || 'other',
          is_public: true, // Default to public on import
        };
        // In a real app, you'd call your DB service here:
        // const { data, error } = await supabase.from('projects').insert([projectData]);
        // if (error) throw error;
        // imported.push(data[0]); // Assuming insert returns the new record
        imported.push({ ...projectData, id: `mock-id-${Math.random().toString(36).substring(7)}` }); // Mock ID
      }
      return imported;
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
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchRepositories
      .addCase(fetchRepositories.pending, (state) => {
        state.isLoadingRepositories = true;
        state.repositoryError = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.isLoadingRepositories = false;
        state.repositories = action.payload;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
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
        state.alxProjects = action.payload;
      })
      .addCase(detectALXProjects.rejected, (state, action) => {
        state.isDetectingALX = false;
        state.error = action.payload;
        state.alxProjects = [];
      })
      // importProjects
      .addCase(importProjects.pending, (state) => {
        state.isImporting = true;
        state.importError = null;
      })
      .addCase(importProjects.fulfilled, (state, action) => {
        state.isImporting = false;
        // Optionally add imported projects to the main projects state if needed,
        // or rely on a re-fetch of all projects after import.
        state.selectedProjects = []; // Clear selected projects after import
        state.wizardStep = 'username'; // Reset wizard
        state.wizardData = { username: '', selectedRepoIds: [] };
      })
      .addCase(importProjects.rejected, (state, action) => {
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
  setWizardData,
  resetGitHubState,
  clearGitHubErrors
} = githubSlice.actions;

export default githubSlice.reducer;
