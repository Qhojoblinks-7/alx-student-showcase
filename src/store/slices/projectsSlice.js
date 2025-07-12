import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase.js';

// Async thunks for project operations
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
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
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
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
      
      if (error) throw error;
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importProjectsFromGitHub = createAsyncThunk(
  'projects/importFromGitHub',
  async (projectsData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(projectsData)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('technologies')
        .eq('user_id', userId);

      if (error) throw error;

      const allTechnologies = new Set();
      projects.forEach(project => {
        project.technologies?.forEach(tech => allTechnologies.add(tech));
      });

      return {
        total: projects.length,
        public: projects.length, // Assuming all are public for now
        technologies: allTechnologies.size
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  stats: {
    total: 0,
    public: 0,
    technologies: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isImporting: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.stats = { total: 0, public: 0, technologies: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreating = false;
        state.projects.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Import from GitHub
      .addCase(importProjectsFromGitHub.pending, (state) => {
        state.isImporting = true;
        state.error = null;
      })
      .addCase(importProjectsFromGitHub.fulfilled, (state, action) => {
        state.isImporting = false;
        state.projects = [...action.payload, ...state.projects];
        state.error = null;
      })
      .addCase(importProjectsFromGitHub.rejected, (state, action) => {
        state.isImporting = false;
        state.error = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setCurrentProject, 
  clearCurrentProject, 
  clearProjects 
} = projectsSlice.actions;

export default projectsSlice.reducer;