// src/store/githubSlice.js (or wherever your slice is)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GitHubService, ALXProjectDetector } from '@/lib/github-api-service.js';
import { OpenAIService } from '@/lib/openai-service.js'; // Assuming you have this service

// Async Thunks (existing ones)
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
      const { alxProjects, skippedProjects } = await ALXProjectDetector.detectALXProjects(repositories, username);
      // Return both for potential future use or debugging
      return { alxProjects, skippedProjects };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importProjects = createAsyncThunk(
  'github/importProjects',
  async ({ projectsToImport, userId }, { rejectWithValue, dispatch }) => { // Added 'dispatch' here
    try {
      const imported = [];
      for (const project of projectsToImport) {
        const projectData = {
          ...project,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tech_stack: project.technologies || [],
          tags: project.tags || [],
          category: project.category || 'other',
          is_public: true,
          // Initialize AI-generated fields as null or empty
          ai_summary: null,
          ai_work_log: null,
        };
        imported.push({ ...projectData, id: `mock-id-${Math.random().toString(36).substring(7)}` }); // Mock ID
      }
      return imported; // Return the successfully imported projects
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW Async Thunk for AI Processing
export const processProjectsWithAI = createAsyncThunk(
  'github/processProjectsWithAI',
  async (projects, { rejectWithValue, getState }) => {
    const processedProjects = [];
    for (const project of projects) {
      try {
        let ai_summary = null;
        if (project.description || project.technologies) { // Only summarize if there's content
          ai_summary = await OpenAIService.generateProjectSummary({
            title: project.title,
            description: project.description,
            technologies: project.technologies,
            github_url: project.github_url // Include GitHub URL for context if AI needs it
          });
        }

        let ai_work_log = null;
        if (project.github_url) { // Only generate work log if GitHub URL exists
          const commitMessages = await GitHubService.fetchRecentCommitMessages(project.github_url);
          if (commitMessages && commitMessages.length > 0) {
            ai_work_log = await OpenAIService.generateWorkLogSummary(commitMessages);
          }
        }

        processedProjects.push({
          ...project,
          ai_summary,
          ai_work_log,
          // Mark as AI processed if at least one AI field was generated
          is_ai_processed: !!ai_summary || !!ai_work_log
        });
      } catch (aiError) {
        console.error(`Error processing project ${project.title} with AI:`, aiError);
        // Push the project even if AI failed for it, but note the failure
        processedProjects.push({
          ...project,
          ai_summary: null,
          ai_work_log: null,
          is_ai_processed: false,
          ai_error: aiError.message // Store AI error message for this specific project
        });
      }
    }
    return processedProjects;
  }
);


export const initialState = {
  repositories: [],
  alxProjects: [],
  selectedProjects: [],
  importedProjects: [], // New state to store imported projects (with IDs from mock DB)
  isLoadingRepositories: false,
  isDetectingALX: false,
  isImporting: false,
  isProcessingAI: false, // New loading state for AI processing
  error: null,
  repositoryError: null,
  importError: null,
  aiProcessingError: null, // New error state for AI processing
  wizardStep: 'username',
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
    // This reducer is useful if you want to update individual projects with AI data
    updateImportedProjectAI: (state, action) => {
        const { id, ai_summary, ai_work_log, is_ai_processed, ai_error } = action.payload;
        const index = state.importedProjects.findIndex(p => p.id === id);
        if (index !== -1) {
            state.importedProjects[index].ai_summary = ai_summary;
            state.importedProjects[index].ai_work_log = ai_work_log;
            state.importedProjects[index].is_ai_processed = is_ai_processed;
            state.importedProjects[index].ai_error = ai_error;
        }
    },
    resetGitHubState: (state) => {
      state.repositories = [];
      state.alxProjects = [];
      state.selectedProjects = [];
      state.importedProjects = []; // Reset imported projects too
      state.isLoadingRepositories = false;
      state.isDetectingALX = false;
      state.isImporting = false;
      state.isProcessingAI = false;
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
      state.aiProcessingError = null;
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
      state.aiProcessingError = null; // Clear AI errors
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
        state.alxProjects = action.payload.alxProjects; // Corrected to access .alxProjects
        // Optionally store skippedProjects: state.skippedProjects = action.payload.skippedProjects;
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
        state.importedProjects = action.payload; // Store imported projects
        state.selectedProjects = []; // Clear selected projects after import
        state.wizardStep = 'review_import'; // Maybe move to a review step or directly to AI processing step
        state.wizardData = { username: state.wizardData.username, selectedRepoIds: [] }; // Keep username
      })
      .addCase(importProjects.rejected, (state, action) => {
        state.isImporting = false;
        state.importError = action.payload;
      })
      // NEW: processProjectsWithAI
      .addCase(processProjectsWithAI.pending, (state) => {
        state.isProcessingAI = true;
        state.aiProcessingError = null;
      })
      .addCase(processProjectsWithAI.fulfilled, (state, action) => {
        state.isProcessingAI = false;
        // Update the imported projects with AI-generated data
        // This assumes importedProjects is the source of truth for projects being processed by AI
        action.payload.forEach(processedProject => {
          const index = state.importedProjects.findIndex(p => p.id === processedProject.id);
          if (index !== -1) {
            state.importedProjects[index] = processedProject; // Replace with updated project
          }
        });
        // You might want to move to a new wizard step or clear wizard data if AI processing is the final step
        // state.wizardStep = 'finished_ai_processing';
      })
      .addCase(processProjectsWithAI.rejected, (state, action) => {
        state.isProcessingAI = false;
        state.aiProcessingError = action.payload;
        // You might want to handle partial failures or specific project errors here
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
  updateImportedProjectAI, // Export the new reducer
  resetGitHubState,
  clearGitHubErrors
} = githubSlice.actions;

export default githubSlice.reducer;