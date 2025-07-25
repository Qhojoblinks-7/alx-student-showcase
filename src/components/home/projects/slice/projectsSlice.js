// src/store/slices/projectsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseService from '@/services/supabaseService'; // Import the mock Supabase service
import * as aiService from '@/services/aiService'; // Import the AI service

// Async Thunks
// Thunk to fetch projects
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async ({ userId, filters = {} }, { rejectWithValue }) => {
    try {
      const projects = await supabaseService.getProjects(userId, filters);
      return projects;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to add a new project
export const addProject = createAsyncThunk(
  'projects/addProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const newProject = await supabaseService.createProject(projectData);
      return newProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to update an existing project
export const updateProject = createAsyncThink(
  'projects/updateProject',
  async ({ id, updatedProject }, { rejectWithValue }) => {
    try {
      const project = await supabaseService.updateProject(id, updatedProject);
      return project;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to delete a project
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await supabaseService.deleteProject(projectId);
      return projectId; // Return the ID of the deleted project
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to import a project from GitHub data
// This thunk can be called by githubSlice.importSelectedProjects for each project
export const importProjectFromGitHub = createAsyncThunk(
  'projects/importProjectFromGitHub',
  async (repoData, { dispatch, rejectWithValue }) => {
    try {
      // 1. Prepare project data from GitHub repository data
      // You might want to pre-fill some fields or generate default values
      const baseProject = {
        name: repoData.suggestedName || repoData.name,
        description: repoData.suggestedDescription || repoData.description,
        repositoryUrl: repoData.url,
        startDate: new Date().toISOString(), // Or try to infer from GitHub API if available
        status: 'Planning', // Default status for imported projects
        technologies: repoData.technologies || [], // Assuming githubSlice might derive this
        tags: [...(repoData.tags || []), 'imported-from-github'], // Add default tag
        isFeatured: false,
        projectSummary: repoData.projectSummary || '', // Use AI-generated if provided by githubSlice
        workLogSummary: repoData.workLogSummary || '', // Use AI-generated if provided by githubSlice
        githubData: { // Store original GitHub data for reference
            repoId: repoData.id,
            repoName: repoData.name,
            repoUrl: repoData.url,
            aiConfidence: repoData.aiConfidence,
        }
      };

      // 2. Potentially trigger AI generation for summaries if not already present or needs re-generation
      let finalProjectData = { ...baseProject };

      if (!baseProject.projectSummary || !baseProject.workLogSummary) {
        // Only generate if summaries are missing or you want to force regeneration
        const [projectSummary, workLogSummary] = await Promise.all([
          aiService.generateProjectSummary(baseProject.name, baseProject.description, baseProject.technologies.join(', ')),
          aiService.generateWorkLogSummary(baseProject.name, baseProject.description),
        ]);
        finalProjectData.projectSummary = projectSummary;
        finalProjectData.workLogSummary = workLogSummary;
      }

      // 3. Send the prepared project data to the backend (Supabase)
      const importedProject = await supabaseService.createProject(finalProjectData);

      return importedProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    isLoading: false,
    error: null,
    currentProject: null, // For editing purposes
    filters: {}, // For ProjectList filtering
  },
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    // addProject, updateProject, deleteProject synchronous reducers are not strictly needed here
    // as extraReducers directly handle state updates based on thunk fulfillment.
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    setFilters: (state, action) => { // Added for ProjectList filtering
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => { // Added for ProjectList filtering
      state.filters = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // addProject
      .addCase(addProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload); // Add the new project
      })
      .addCase(addProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateProject
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.projects.findIndex(
          (project) => project.id === action.payload.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload; // Update the project
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // deleteProject
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload // Filter out the deleted project
        );
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // importProjectFromGitHub
      .addCase(importProjectFromGitHub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importProjectFromGitHub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload); // Add the newly imported project
      })
      .addCase(importProjectFromGitHub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setProjects,
  setCurrentProject,
  clearCurrentProject,
  setFilters,
  clearFilters,
} = projectsSlice.actions;

export default projectsSlice.reducer;