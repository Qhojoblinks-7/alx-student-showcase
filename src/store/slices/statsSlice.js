// src/store/slices/statsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect'; // For memoized selectors
import { getCollection } from '../../lib/mongodb'; // Import MongoDB client
import { selectAllProjects } from './projectsSlice'; // To get projects from projectsSlice

// --- Initial State ---
const initialState = {
  // Initialize statsData as an object with all expected properties and their default empty/zero values
  statsData: {
    totalProjects: 0,
    publicProjects: 0,
    categoriesDistribution: [], // Array of { name: 'Category', value: count }
    technologyUsage: [],       // Array of { name: 'Tech', value: count }
    projectsOverTime: [],      // Array of { date: 'YYYY-MM', count: count }
    difficultyDistribution: [],// Array of { name: 'Difficulty', value: count }
  },
  isLoading: false,
  error: null,
  filters: { // For filtering stats data. Ensure these match DashboardStats.jsx select values.
    timeframe: 'all', // 'all', '7days', '30days', '90days', 'year'
    category: 'all',  // 'all', 'web', 'mobile', etc.
    difficulty: 'all', // 'all', 'beginner', 'intermediate', etc.
  },
};

// --- Helper for client-side aggregation ---
const aggregateProjectData = (projects, filters) => {
  let filteredProjects = [...projects];

  // 1. Apply Timeframe Filter (matching DashboardStats.jsx values)
  const now = new Date();
  if (filters.timeframe !== 'all') {
    let cutoffDate = new Date(now);
    if (filters.timeframe === '7days') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (filters.timeframe === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (filters.timeframe === '90days') {
      cutoffDate.setDate(now.getDate() - 90);
    } else if (filters.timeframe === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    filteredProjects = filteredProjects.filter(project => {
      // Ensure created_at exists and is a valid date
      const projectDate = project.created_at ? new Date(project.created_at) : null;
      return projectDate && projectDate >= cutoffDate;
    });
  }

  // 2. Apply Category Filter
  if (filters.category && filters.category !== 'all') {
    filteredProjects = filteredProjects.filter(project => {
      // Handle 'Uncategorized' explicitly
      if (filters.category === 'Uncategorized') {
        return !project.category || project.category === 'Uncategorized';
      }
      return project.category === filters.category;
    });
  }

  // 3. Apply Difficulty Filter
  if (filters.difficulty && filters.difficulty !== 'all') {
    filteredProjects = filteredProjects.filter(project => {
      // Handle 'Not Set' explicitly
      if (filters.difficulty === 'Not Set') {
        return !project.difficulty || project.difficulty === 'Not Set';
      }
      return project.difficulty === filters.difficulty;
    });
  }

  // --- Aggregation ---
  const totalProjects = filteredProjects.length;
  // Assuming a 'is_public' boolean field on projects for public projects count
  const publicProjects = filteredProjects.filter(project => project.is_public).length;

  const categoriesMap = {};
  const technologiesMap = {};
  const difficultyMap = {};
  const projectsOverTimeMap = {};

  filteredProjects.forEach(project => {
    // By Category (using 'Uncategorized' for null/empty categories)
    const categoryName = project.category || 'Uncategorized';
    categoriesMap[categoryName] = (categoriesMap[categoryName] || 0) + 1;

    // By Technology (handling technologies as an array, default to empty array)
    if (project.technologies && Array.isArray(project.technologies)) {
      project.technologies.forEach(tech => {
        technologiesMap[tech] = (technologiesMap[tech] || 0) + 1;
      });
    }

    // By Difficulty (using 'Not Set' for null/empty difficulty)
    const difficultyName = project.difficulty || 'Not Set';
    difficultyMap[difficultyName] = (difficultyMap[difficultyName] || 0) + 1;

    // Projects Over Time (Monthly, using 'created_at')
    if (project.created_at) {
      const date = new Date(project.created_at);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      projectsOverTimeMap[monthYear] = (projectsOverTimeMap[monthYear] || 0) + 1;
    }
  });

  // Convert maps to arrays of { name: string, value: number } for chart compatibility
  const categoriesDistribution = Object.keys(categoriesMap).map(key => ({ name: key, value: categoriesMap[key] }));
  const technologyUsage = Object.keys(technologiesMap).map(key => ({ name: key, value: technologiesMap[key] }));
  const difficultyDistribution = Object.keys(difficultyMap).map(key => ({ name: key, value: difficultyMap[key] }));

  // Sort projectsOverTime by date for consistent charting
  const projectsOverTime = Object.keys(projectsOverTimeMap)
    .sort() // Sorts keys like "2023-01", "2023-02"
    .map(key => ({ date: key, count: projectsOverTimeMap[key] }));

  return {
    totalProjects,
    publicProjects,
    categoriesDistribution,
    technologyUsage,
    difficultyDistribution,
    projectsOverTime,
  };
};

// --- Async Thunks (createAsyncThunk) ---

/**
 * Fetches and aggregates project statistics for a user.
 * It attempts to use projects already in the Redux store; otherwise, fetches from Supabase.
 * @param {object} params - Parameters for fetching stats.
 * @param {string} params.userId - The ID of the user whose stats to fetch.
 * @param {object} params.filters - Filter criteria for aggregation.
 */
export const fetchProjectStats = createAsyncThunk(
  'stats/fetchProjectStats',
  async ({ userId, filters }, { getState, rejectWithValue }) => {
    try {
      // Attempt to get projects from projectsSlice state first
      let projects = selectAllProjects(getState());

      // If no projects or projects are not loaded for the user, fetch them
      // This condition ensures we fetch if `projects` is empty or doesn't contain the current user's projects.
      if (!projects || projects.length === 0 || !projects.some(p => p.userId === userId)) {
        // Fallback: Fetch projects directly from MongoDB if not in store or not user's projects
        const projectsCollection = await getCollection('projects');
        projects = await projectsCollection
          .find({ userId: userId })
          .sort({ createdAt: -1 })
          .toArray();
      }

      // Perform client-side aggregation
      const aggregatedData = aggregateProjectData(projects, filters);
      return aggregatedData; // This will be the action.payload for `fulfilled`
    } catch (error) {
      console.error("Fetch project stats error:", error.message);
      return rejectWithValue(error.message); // This will be the action.payload for `rejected`
    }
  }
);


// --- Slice Definition ---

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    // Synchronous reducers for filter updates
    setStatsFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // No setStatsData, setLoading, setError here, as extraReducers handle async thunk states
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        // Optionally reset statsData to initial state during loading to clear previous data
        // state.statsData = initialState.statsData;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.isLoading = false;
        // Set statsData to payload, ensuring it's never null by falling back to initial state
        state.statsData = action.payload || initialState.statsData;
        state.error = null;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch statistics';
        // Reset statsData to initial state on error to prevent partial/null data issues
        state.statsData = initialState.statsData;
      });
  },
});

// --- Actions Export ---
export const {
  setStatsFilters,
} = statsSlice.actions;

// --- Selectors ---
// Base selector for the stats state
const selectStatsState = (state) => state.stats;

export const selectStatsData = createSelector(
  [selectStatsState],
  (statsState) => statsState.statsData
);

export const selectStatsLoading = createSelector(
  [selectStatsState],
  (statsState) => statsState.isLoading
);

export const selectStatsError = createSelector(
  [selectStatsState],
  (statsState) => statsState.error
);

export const selectStatsFilters = createSelector(
  [selectStatsState],
  (statsState) => statsState.filters
);

export default statsSlice.reducer;