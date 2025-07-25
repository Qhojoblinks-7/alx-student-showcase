import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';
import { createSelector } from 'reselect';

// --- Initial State ---
const initialState = {
  projects: [],
  // isLoading: false, // You can remove this if 'status' is your primary loading indicator
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  currentProject: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  filters: {
    category: null,
    technology: null,
    difficulty: null,
    isPublic: null,
    searchQuery: '',
  },
};

// --- Async Thunks (createAsyncThunk) ---

/**
 * Fetches projects for a specific user from Supabase, applying filters.
 * @param {object} params - Parameters for fetching projects.
 * @param {string} [params.userId] - The ID of the user whose projects to fetch. Optional.
 * @param {object} [params.filters] - Filter criteria (category, technology, difficulty, isPublic, searchQuery). Optional.
 */
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async ({ userId, filters = {} }, { dispatch, rejectWithValue }) => {
    try {
      // Manual setLoading dispatch is removed; status will be handled in extraReducers
      // dispatch(projectsSlice.actions.setLoading(true)); // REMOVED

      let query = supabase.from('projects').select('*');

      // Always filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      // Apply filters for isPublic only if explicitly set (true or false)
      if (typeof filters.isPublic === 'boolean') {
        query = query.eq('is_public', filters.isPublic);
      }
      // If no userId is provided AND filters.isPublic is NOT explicitly set (meaning it's for public view),
      // default to fetching only public projects.
      else if (!userId) {
          query = query.eq('is_public', true);
      }

      // Apply other filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.technology) {
        query = query.contains('technologies', [filters.technology]);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message || 'Failed to fetch projects.');
      }

      // Manual setProjects dispatch is removed; payload will be set in extraReducers
      // dispatch(projectsSlice.actions.setProjects(data)); // REMOVED
      return data;
    } catch (error) {
      console.error("Fetch projects error:", error.message);
      // Manual setError dispatch is removed; error will be handled in extraReducers
      // dispatch(projectsSlice.actions.setError(error.message)); // REMOVED
      return rejectWithValue(error.message);
    } finally {
      // Manual setLoading(false) dispatch is removed; status will be handled in extraReducers
      // dispatch(projectsSlice.actions.setLoading(false)); // REMOVED
    }
  }
);

/**
 * Adds a new project to Supabase.
 * @param {object} projectData - The project data to insert. Must include user_id.
 */
export const addProject = createAsyncThunk(
  'projects/addProject',
  async (projectData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(projectsSlice.actions.setIsCreating(true));
      dispatch(projectsSlice.actions.setError(null));

      const { data, error } = await supabase.from('projects').insert(projectData).select();

      if (error) {
        throw new Error(error.message || 'Failed to add project.');
      }

      const newProject = data[0];
      dispatch(projectsSlice.actions.addProjectLocally(newProject));
      return newProject;
    } catch (error) {
      console.error("Add project error:", error.message);
      dispatch(projectsSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(projectsSlice.actions.setIsCreating(false));
    }
  }
);

/**
 * Updates an existing project in Supabase.
 * @param {object} params - Parameters for updating a project.
 * @param {string} params.id - The ID of the project to update.
 * @param {object} params.projectData - The updated project data.
 */
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(projectsSlice.actions.setIsUpdating(true));
      dispatch(projectsSlice.actions.setError(null));

      const { data, error } = await supabase.from('projects').update(projectData).eq('id', id).select();

      if (error) {
        throw new Error(error.message || 'Failed to update project.');
      }

      const updatedProject = data[0];
      dispatch(projectsSlice.actions.updateProjectLocally(updatedProject));
      return updatedProject;
    } catch (error) {
      console.error("Update project error:", error.message);
      dispatch(projectsSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(projectsSlice.actions.setIsUpdating(false));
    }
  }
);

/**
 * Deletes a project from Supabase.
 * @param {string} projectId - The ID of the project to delete.
 */
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(projectsSlice.actions.setIsDeleting(true));
      dispatch(projectsSlice.actions.setError(null));

      const { error } = await supabase.from('projects').delete().eq('id', projectId);

      if (error) {
        throw new Error(error.message || 'Failed to delete project.');
      }

      dispatch(projectsSlice.actions.deleteProjectLocally(projectId));
      return projectId;
    } catch (error) {
      console.error("Delete project error:", error.message);
      dispatch(projectsSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(projectsSlice.actions.setIsDeleting(false));
    }
  }
);


// --- Slice Definition ---

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Note: setProjects is no longer explicitly dispatched by fetchProjects thunk,
    // but can still be used for other purposes if needed.
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    // setLoading: (state, action) => { // REMOVE or COMMENT OUT if using 'status'
    //   state.isLoading = action.payload;
    // },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsCreating: (state, action) => {
      state.isCreating = action.payload;
    },
    setIsUpdating: (state, action) => {
      state.isUpdating = action.payload;
    },
    setIsDeleting: (state, action) => {
      state.isDeleting = action.payload;
    },
    setProjectFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addProjectLocally: (state, action) => {
      state.projects.unshift(action.payload);
    },
    updateProjectLocally: (state, action) => {
      const index = state.projects.findIndex(
        (project) => project.id === action.payload.id
      );
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProjectLocally: (state, action) => {
      state.projects = state.projects.filter(
        (project) => project.id !== action.payload
      );
      if (state.currentProject && state.currentProject.id === action.payload) {
        state.currentProject = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchProjects lifecycle ---
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload; // Set projects data here directly from thunk return
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Error message from rejectWithValue
        state.projects = []; // Clear projects on failure or keep previous state if preferred
      })
      // You can add extraReducers for addProject, updateProject, deleteProject here too
      // if you want to manage status for those operations in a unified way.
      // For now, isCreating, isUpdating, isDeleting reducers handle it.
  },
});

// --- Synchronous Actions Export ---
export const {
  setProjects,
  setCurrentProject,
  clearCurrentProject,
  // setLoading, // REMOVE or COMMENT OUT if using 'status'
  setError,
  setIsCreating,
  setIsUpdating,
  setIsDeleting,
  setProjectFilters,
  addProjectLocally,
  updateProjectLocally,
  deleteProjectLocally,
} = projectsSlice.actions;


// --- Selectors ---
const selectProjectsState = (state) => state.projects;

export const selectAllProjects = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.projects
);

// New selector for the 'status'
export const selectProjectsStatus = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.status
);

// You can still use selectProjectsLoading if you keep isLoading in state,
// but it's often redundant if 'status' provides enough detail.
// export const selectProjectsLoading = createSelector(
//   [selectProjectsState],
//   (projectsState) => projectsState.isLoading
// );

export const selectProjectsError = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.error
);

export const selectCurrentProject = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.currentProject
);

export const selectIsCreatingProject = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.isCreating
);

export const selectIsUpdatingProject = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.isUpdating
);

export const selectIsDeletingProject = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.isDeleting
);

export const selectProjectFilters = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.filters
);

export const selectFilteredProjects = createSelector(
  [selectAllProjects, selectProjectFilters],
  (projects, filters) => {
    return projects.filter(project => {
      let match = true;
      if (filters.category && project.category !== filters.category) {
        match = false;
      }
      if (filters.technology) {
        if (!Array.isArray(project.technologies) || !project.technologies.includes(filters.technology)) {
            match = false;
        }
      }
      if (filters.difficulty && project.difficulty !== filters.difficulty) {
        match = false;
      }
      if (filters.isPublic !== null && project.is_public !== filters.isPublic) {
        match = false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!((project.title && project.title.toLowerCase().includes(query)) ||
              (project.description && project.description.toLowerCase().includes(query)))) {
          match = false;
        }
      }
      return match;
    });
  }
);

export const selectPublicProjects = createSelector(
  [selectAllProjects],
  (allProjects) => allProjects.filter(project => project.is_public === true)
);

export default projectsSlice.reducer;