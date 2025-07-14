import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase.js'; // Assuming supabase is initialized elsewhere

// Async Thunks
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
        .select();

      if (error) throw error;
      return data[0];
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
        .select();

      if (error) throw error;
      return data[0];
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
      return projectId; // Return the ID of the deleted project
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchProjectStats',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('is_public, technologies, project_type') // Select only necessary fields for stats
        .eq('user_id', userId);

      if (error) throw error;

      const total = data.length;
      const publicCount = data.filter(p => p.is_public).length;
      const privateCount = total - publicCount;
      
      const uniqueTechnologies = new Set();
      data.forEach(project => {
        project.technologies?.forEach(tech => uniqueTechnologies.add(tech));
      });

      const technologiesCount = uniqueTechnologies.size;

      const categoryCounts = data.reduce((acc, project) => {
        const category = project.project_type || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        public: publicCount,
        private: privateCount,
        technologies: technologiesCount,
        categoryCounts,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//toggleProjectVisibility
export const toggleProjectVisibility = createAsyncThunk(
  'projects/toggleProjectVisibility',
  async ({ projectId, isPublic }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ is_public: isPublic })
        .eq('id', projectId)
        .select();

      if (error) throw error;
      return data[0]; // Return the updated project
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initialState = { // Export initialState
  projects: [],
  currentProject: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  stats: {
    total: 0,
    public: 0,
    private: 0,
    technologies: 0,
    categoryCounts: {},
  },
  filters: {
    category: 'all',
    isPublic: 'all',
    searchTerm: '',
  },
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    setProjectFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
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
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreating = false;
        state.projects.unshift(action.payload); // Add new project to the beginning
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedProject = action.payload;
        const index = state.projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
          state.projects[index] = updatedProject;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.projects = state.projects.filter(project => project.id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      // Fetch Project Stats
      .addCase(fetchProjectStats.pending, (state) => {
        state.isLoading = true; // Use a general loading for stats fetch
        state.error = null;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setProjects, setCurrentProject, setProjectFilters, clearProjectsError } = projectsSlice.actions;

export default projectsSlice.reducer;
