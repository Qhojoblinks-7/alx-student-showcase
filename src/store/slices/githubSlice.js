import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GitHubService, ALXProjectDetector } from '../../lib/github-service.js';
import { GitHubCommitsService } from '../../lib/github-commits-service.js'; // New import for commit fetching
import { OpenAIService } from '../../lib/openai-service.js'; // New import for AI services
import { supabase } from '../../lib/supabase.js'; // Import Supabase client

// Async Thunks

/**
 * Fetches all repositories for a given GitHub username.
 * @param {string} username - The GitHub username.
 */
export const fetchUserRepositories = createAsyncThunk(
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

/**
 * Detects ALX projects from a list of repositories using ALXProjectDetector.
 * @param {object} payload - Contains repositories array and username string.
 */
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

/**
 * Processes a list of projects with AI to generate summaries and work logs.
 * This thunk is designed to be chained after projects are imported or fetched.
 * @param {Array<Object>} projects - An array of project objects to process.
 */
export const processProjectsWithAI = createAsyncThunk(
  'github/processProjectsWithAI',
  async (projects, { rejectWithValue }) => {
    const processedProjects = [];
    for (const project of projects) {
      try {
        let ai_summary = null;
        // Generate project summary if description or technologies exist
        if (project.description || project.technologies) {
          ai_summary = await OpenAIService.generateProjectSummary({
            title: project.title,
            description: project.description,
            technologies: project.technologies,
            github_url: project.github_url // Include GitHub URL for context if AI needs it
          });
        }

        let ai_work_log = null;
        // Generate work log if GitHub URL exists
        if (project.github_url) {
          // fetchRepositoryCommits now expects the full URL
          const rawCommits = await GitHubCommitsService.fetchRepositoryCommits(project.github_url);
          if (rawCommits && rawCommits.length > 0) {
            // Pass raw commit messages to OpenAI for humanized summary
            ai_work_log = await OpenAIService.generateWorkLogSummary(project.github_url, rawCommits.length); // Pass URL and limit
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

/**
 * Imports selected projects into the Supabase database and then triggers AI processing.
 * @param {object} payload - Contains projectsToImport array and userId string.
 */
export const importSelectedProjects = createAsyncThunk(
  'github/importSelectedProjects',
  async ({ projectsToImport, userId }, { rejectWithValue, dispatch }) => { // Added 'dispatch' here
    console.log("[importSelectedProjects] Projects received for import:", projectsToImport);
    try {
      const importedFromDb = [];
      for (const project of projectsToImport) {
        // Prepare project data for Supabase insertion
        const projectDataForDb = {
          user_id: userId,
          title: project.title,
          description: project.description,
          technologies: project.technologies || [],
          github_url: project.github_url,
          live_url: project.live_url,
          category: project.category,
          original_repo_name: project.original_repo_name,
          alx_confidence: project.alx_confidence,
          last_updated: project.last_updated,
          is_public: project.is_public,
          completion_date: project.completion_date || null,
          time_spent_hours: project.time_spent_hours || null,
          key_learnings: project.key_learnings || '',
          challenges_faced: project.challenges_faced || '',
          image_url: project.image_url || '',
          tags: project.tags || [],
          // Initialize AI-generated fields as null or empty
          ai_summary: null,
          ai_work_log: null,
          is_ai_processed: false,
          ai_error: null,
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
          importedFromDb.push(data[0]); // Add the newly created project to the imported list
        }
      }

      // After successful Supabase import, trigger AI processing for the newly imported projects
      // The `unwrap()` method will either return the fulfilled value or throw the rejected value.
      const processedWithAI = await dispatch(processProjectsWithAI(importedFromDb)).unwrap();

      return processedWithAI; // Return the projects, now enriched with AI data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const initialState = {
  repositories: [],
  alxProjects: [],
  selectedProjects: [], // Projects selected for import (by ID)
  importedProjects: [], // Projects successfully imported into the app (with DB IDs and AI data)
  isLoadingRepositories: false,
  isDetectingALX: false,
  isImporting: false,
  isProcessingAI: false, // New state for AI processing loading
  error: null, // General error
  repositoryError: null, // Error specific to fetching repositories
  importError: null, // Error specific to importing projects to DB
  aiProcessingError: null, // Error specific to AI processing
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
    setWizardData: (state, action) => { // Corrected name from updateWizardData
      state.wizardData = { ...state.wizardData, ...action.payload };
    },
    resetGitHubState: (state) => {
      state.repositories = [];
      state.alxProjects = [];
      state.selectedProjects = [];
      state.importedProjects = []; // Reset imported projects
      state.isLoadingRepositories = false;
      state.isDetectingALX = false;
      state.isImporting = false;
      state.isProcessingAI = false; // Reset AI loading state
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
      state.aiProcessingError = null; // Reset AI error state
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
    },
    clearSelection: (state) => {
      state.selectedProjects = [];
    },
    resetWizard: (state) => {
      state.repositories = [];
      state.alxProjects = [];
      state.selectedProjects = [];
      state.isLoadingRepositories = false;
      state.isDetectingALX = false;
      state.isImporting = false;
      state.isProcessingAI = false;
      state.error = null;
      state.repositoryError = null;
      state.importError = null;
      state.aiProcessingError = null;
      state.wizardStep = 'username';
      state.wizardData = { username: '', selectedRepoIds: [] };
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUserRepositories
      .addCase(fetchUserRepositories.pending, (state) => {
        state.isLoadingRepositories = true;
        state.repositoryError = null;
      })
      .addCase(fetchUserRepositories.fulfilled, (state, action) => {
        state.isLoadingRepositories = false;
        state.repositories = action.payload;
      })
      .addCase(fetchUserRepositories.rejected, (state, action) => {
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
      // importSelectedProjects
      .addCase(importSelectedProjects.pending, (state) => {
        state.isImporting = true;
        state.importError = null;
      })
      .addCase(importSelectedProjects.fulfilled, (state, action) => {
        state.isImporting = false;
        state.importedProjects = action.payload; // Store the AI-enriched projects
        state.selectedProjects = []; // Clear selected projects after import
        state.wizardStep = 'username'; // Reset wizard or move to a "review import" step
        state.wizardData = { username: '', selectedRepoIds: [] };
      })
      .addCase(importSelectedProjects.rejected, (state, action) => {
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
        // Since `importSelectedProjects` now returns the AI-processed projects, this case might
        // not be strictly necessary for `importedProjects` if `importSelectedProjects.fulfilled`
        // is updated to handle the `action.payload` from `processProjectsWithAI`.
        // However, it's good to have if you process AI data separately later.
        action.payload.forEach(processedProject => {
          const index = state.importedProjects.findIndex(p => p.id === processedProject.id);
          if (index !== -1) {
            state.importedProjects[index] = processedProject; // Replace with updated project
          }
        });
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
  setWizardData, // Corrected export name (was updateWizardData)
  resetGitHubState,
  clearGitHubErrors,
  clearSelection,
  resetWizard,
  // processProjectsWithAI is a thunk, not a reducer action, so it's not exported here
} = githubSlice.actions;

export default githubSlice.reducer;
