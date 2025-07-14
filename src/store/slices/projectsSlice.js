import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase.js';

// Project category validation
const VALID_CATEGORIES = ['web', 'mobile', 'data', 'ai', 'backend', 'devops', 'other'];

// Validation helper
const validateCategory = (category) => {
  return VALID_CATEGORIES.includes(category) ? category : 'other';
};

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

// New async thunk to fetch a single project by ID
export const fetchSingleProject = createAsyncThunk(
  'projects/fetchSingleProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

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
      // Validate and sanitize project data
      const sanitizedData = {
        ...projectData,
        category: validateCategory(projectData.category || 'other'),
        is_public: projectData.is_public !== undefined ? projectData.is_public : true,
        technologies: projectData.technologies || [],
        alx_confidence: projectData.alx_confidence || null,
        original_repo_name: projectData.original_repo_name || null,
        last_updated: projectData.last_updated || new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([sanitizedData])
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
      // Validate and sanitize project data
      const sanitizedData = { ...projectData };
      
      // Validate category if provided
      if (projectData.category) {
        sanitizedData.category = validateCategory(projectData.category);
      }
      
      // Set last_updated timestamp
      sanitizedData.last_updated = new Date().toISOString();

      const { data, error } = await supabase
        .from('projects')
        .update(sanitizedData)
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
        .select('technologies, is_public, category, alx_confidence')
        .eq('user_id', userId);

      if (error) throw error;

      const allTechnologies = new Set();
      const categories = {};
      let publicCount = 0;
      let alxProjectsCount = 0;
      
      projects.forEach(project => {
        // Count technologies
        project.technologies?.forEach(tech => allTechnologies.add(tech));
        
        // Count public projects
        if (project.is_public) publicCount++;
        
        // Count by category
        const category = project.category || 'other';
        categories[category] = (categories[category] || 0) + 1;
        
        // Count ALX projects (confidence > 0.5)
        if (project.alx_confidence && project.alx_confidence > 0.5) {
          alxProjectsCount++;
        }
      });

      return {
        total: projects.length,
        public: publicCount,
        private: projects.length - publicCount,
        technologies: allTechnologies.size,
        categories,
        alxProjects: alxProjectsCount,
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
    private: 0,
    technologies: 0,
    categories: {},
    alxProjects: 0,
  },
  filters: {
    category: 'all',
    isPublic: 'all',
    searchTerm: '',
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isImporting: false,
  isFetchingSingleProject: false, // New loading state for single project fetch
  error: null,
  singleProjectError: null, // New error state for single project fetch
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.singleProjectError = null; // Clear new error state
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.stats = { total: 0, public: 0, private: 0, technologies: 0, categories: {}, alxProjects: 0 };
    },
    
    // Filter actions
    setFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.filters[filterType] = value;
    },
    clearFilters: (state) => {
      state.filters = {
        category: 'all',
        isPublic: 'all',
        searchTerm: '',
      };
    },
    
    // Project visibility actions
    toggleProjectVisibility: (state, action) => {
      const project = state.projects.find(p => p.id === action.payload);
      if (project) {
        project.is_public = !project.is_public;
      }
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
      
      // Fetch single project
      .addCase(fetchSingleProject.pending, (state) => {
        state.isFetchingSingleProject = true;
        state.singleProjectError = null;
        state.currentProject = null; // Clear current project while fetching new one
      })
      .addCase(fetchSingleProject.fulfilled, (state, action) => {
        state.isFetchingSingleProject = false;
        state.currentProject = action.payload;
        state.singleProjectError = null;
      })
      .addCase(fetchSingleProject.rejected, (state, action) => {
        state.isFetchingSingleProject = false;
        state.singleProjectError = action.payload;
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
  clearProjects,
  setFilter,
  clearFilters,
  toggleProjectVisibility,
} = projectsSlice.actions;

// Export validation constants and helper
export { VALID_CATEGORIES, validateCategory };

export default projectsSlice.reducer;
