// src/store/slices/projectsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase.js'; // Correct path to supabase client
// Import the fulfilled action type from the githubSlice to listen for its completion
import { importSelectedProjects } from './githubSlice.js'; // Ensure this path is correct

// Async Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required to fetch projects.');
      }
      // Select all necessary fields, using 'category' instead of 'project_type'
      const { data, error } = await supabase
        .from('projects')
        .select('id, user_id, title, description, technologies, github_url, live_url, category, original_repo_name, alx_confidence, last_updated, is_public, created_at, updated_at, image_url, difficulty_level, completion_date, time_spent_hours, key_learnings, challenges_faced, tags, ai_summary, ai_work_log, is_ai_processed, ai_error') // ADDED AI fields
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchProjectStats',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required to fetch project stats.');
      }

      // Fetch total projects
      const { count: totalCount, error: totalError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (totalError) throw totalError;

      // Fetch public projects
      const { count: publicCount, error: publicError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_public', true);

      if (publicError) throw publicError;

      // Fetch distinct technologies (this might be a large query, consider a separate RPC if performance is an issue)
      const { data: technologiesData, error: technologiesError } = await supabase
        .from('projects')
        .select('technologies')
        .eq('user_id', userId);

      if (technologiesError) throw technologiesError;

      const allTechnologies = new Set();
      technologiesData.forEach(project => {
        if (Array.isArray(project.technologies)) {
          project.technologies.forEach(tech => allTechnologies.add(tech));
        }
      });

      return {
        total: totalCount,
        public: publicCount,
        technologies: allTechnologies.size,
      };
    } catch (error) {
      console.error('Error fetching project stats:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const addProject = createAsyncThunk(
  'projects/addProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select(); // Select the inserted data to return it

      if (error) {
        throw error;
      }
      return data[0]; // Return the first (and only) inserted record
    } catch (error) {
      console.error('Error adding project:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .select(); // Select the updated data to return it

      if (error) {
        throw error;
      }
      return data[0]; // Return the first (and only) updated record
    } catch (error) {
      console.error('Error updating project:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw error;
      }
      return projectId; // Return the ID of the deleted project
    } catch (error) {
      console.error('Error deleting project:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const initialState = {
  projects: [],
  stats: { total: 0, public: 0, technologies: 0 },
  isLoading: false,
  error: null,
  filters: { // Added filters to initial state
    category: 'all',
    isPublic: 'all',
    searchTerm: '',
  },
  currentProject: null, // Added currentProject to initial state
  isCreating: false, // Added specific loading states
  isUpdating: false,
  isDeleting: false,
  isImporting: false, // This refers to projectsSlice's own import status if any, not GitHub import
  isFetchingSingleProject: false, // Added for fetching a single project
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Synchronous reducers if needed
    setProjectFilters: (state, action) => { // Added reducer for filters
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentProject: (state, action) => { // Added reducer for current project
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => { // Added reducer to clear current project
      state.currentProject = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
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
      // Fetch Project Stats
      .addCase(fetchProjectStats.pending, (state) => {
        // No specific loading state for stats, can use general isLoading or add a separate one
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        console.error('Failed to fetch project stats:', action.payload);
        // Handle error for stats if necessary
      })
      // Add Project
      .addCase(addProject.pending, (state) => {
        state.isCreating = true; // Use specific loading state
        state.error = null;
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.isCreating = false;
        state.projects.unshift(action.payload); // Add new project to the beginning of the list
      })
      .addCase(addProject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isUpdating = true; // Use specific loading state
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedProject = action.payload;
        state.projects = state.projects.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        );
        // If the updated project is the current one, update it too
        if (state.currentProject && state.currentProject.id === updatedProject.id) {
          state.currentProject = updatedProject;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isDeleting = true; // Use specific loading state
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedProjectId = action.payload;
        state.projects = state.projects.filter((project) => project.id !== deletedProjectId);
        // Clear current project if it was the one deleted
        if (state.currentProject && state.currentProject.id === deletedProjectId) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      // NEW: Handle projects imported from GitHub (which are already AI-processed)
      .addCase(importSelectedProjects.fulfilled, (state, action) => {
        // action.payload here is an array of projects, already inserted into Supabase
        // and processed with AI by the githubSlice's importSelectedProjects thunk.
        // We need to add these to the projects state.
        const newProjects = action.payload;
        newProjects.forEach(newProject => {
          // Check if the project already exists (e.g., if re-fetching all projects)
          // If it doesn't, add it. This prevents duplicates if fetchProjects runs later.
          const exists = state.projects.some(p => p.id === newProject.id);
          if (!exists) {
            state.projects.unshift(newProject); // Add to the beginning
          } else {
            // If it exists, update it (e.g., if AI processing updated an already fetched project)
            state.projects = state.projects.map(p =>
              p.id === newProject.id ? newProject : p
            );
          }
        });
        // Optionally, you might want to re-fetch stats here if they are not automatically updated
        // dispatch(fetchProjectStats(userId)); // This would require dispatch from a thunk
        // For now, rely on a separate dispatch of fetchProjectStats or a selector re-calculation
      });
  },
});

export const {
  setProjectFilters,
  setCurrentProject,
  clearCurrentProject,
} = projectsSlice.actions;

export default projectsSlice.reducer;
