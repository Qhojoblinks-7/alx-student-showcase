import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../../../lib/supabase'; // Correct path to supabase client

// Async Thunks

/**
 * Fetches and aggregates project statistics for a given user based on filters.
 *
 * @param {string} userId - The ID of the user whose project stats are to be fetched.
 * @param {object} filters - An object containing filters like timeframe, categories, technologies.
 */
export const fetchProjectStats = createAsyncThunk(
  'stats/fetchProjectStats',
  async ({ userId, filters }, { rejectWithValue }) => {
    console.log('[fetchProjectStats] Thunk started with userId:', userId, 'and filters:', filters); // DEBUG LOG

    try {
      if (!userId) {
        console.error('[fetchProjectStats] User ID is required.'); // DEBUG LOG
        return rejectWithValue('User ID is required to fetch project stats.');
      }

      let query = supabase
        .from('projects')
        .select('id, created_at, category, technologies, difficulty_level, is_public, completion_date')
        .eq('user_id', userId);

      // Apply filters if provided (for server-side filtering, if implemented)
      // For now, we'll fetch all and aggregate client-side for simplicity,
      // but the filter parameter is passed for future server-side filtering.
      // Example: if (filters.category && filters.category !== 'all') { query = query.eq('category', filters.category); }

      const { data: projects, error } = await query;

      console.log('[fetchProjectStats] Supabase query result - projects:', projects); // DEBUG LOG
      console.log('[fetchProjectStats] Supabase query result - error:', error); // DEBUG LOG

      if (error) {
        console.error('Supabase fetch projects for stats error:', String(error));
        throw error;
      }

      // --- Client-side Aggregation ---
      const totalProjects = projects.length;
      const publicProjects = projects.filter(p => p.is_public).length;

      const categoriesDistribution = projects.reduce((acc, project) => {
        const category = project.category || 'Uncategorized';
        const existing = acc.find(item => item.name === category);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: category, value: 1 });
        }
        return acc;
      }, []);

      const technologyUsage = projects.reduce((acc, project) => {
        if (Array.isArray(project.technologies)) {
          project.technologies.forEach(tech => {
            const existing = acc.find(item => item.name === tech);
            if (existing) {
              existing.count += 1;
            } else {
              acc.push({ name: tech, count: 1 });
            }
          });
        }
        return acc;
      }, []);

      // Sort technologies by count (descending) and take top 5
      const topTechnologies = technologyUsage.sort((a, b) => b.count - a.count).slice(0, 5);


      const difficultyDistribution = projects.reduce((acc, project) => {
        const difficulty = project.difficulty_level || 'Not Set';
        const existing = acc.find(item => item.name === difficulty);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: difficulty, value: 1 });
        }
        return acc;
      }, []);

      const projectsOverTime = {};
      projects.forEach(project => {
        if (project.completion_date) {
          const date = new Date(project.completion_date);
          const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
          projectsOverTime[monthYear] = (projectsOverTime[monthYear] || 0) + 1;
        }
      });

      // Convert projectsOverTime object to array and sort by date
      const sortedProjectsOverTime = Object.keys(projectsOverTime)
        .map(key => ({ month: key, completed: projectsOverTime[key] }))
        .sort((a, b) => {
          const [monthA, yearA] = a.month.split('-');
          const [monthB, yearB] = b.month.split('-');
          const dateA = new Date(`${monthA} 1, ${yearA}`);
          const dateB = new Date(`${monthB} 1, ${yearB}`);
          return dateA - dateB;
        });


      const aggregatedStats = { // DEBUG LOG: Capture final aggregated object
        totalProjects,
        publicProjects,
        categoriesDistribution,
        technologyUsage: topTechnologies,
        difficultyDistribution,
        projectsOverTime: sortedProjectsOverTime,
      };
      console.log('[fetchProjectStats] Aggregated Stats:', aggregatedStats); // DEBUG LOG

      return aggregatedStats;
    } catch (error) {
      console.error('Error fetching project stats:', String(error));
      return rejectWithValue(error.message ? String(error.message) : String(error));
    }
  }
);

// Initial state for the stats slice
export const initialState = {
  statsData: null, // Detailed statistics object
  isLoading: false,
  error: null,
  filters: {
    timeframe: 'all', // 'all', '7days', '30days', '90days', 'year'
    category: 'all', // 'all' or specific category
    technologies: [], // Array of selected technologies
    difficulty_level: 'all', // 'all' or specific difficulty
  },
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setStatsData: (state, action) => {
      state.statsData = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => { // Renamed from setFilter for clarity
      state.filters = { ...state.filters, ...action.payload };
    },
    clearStats: (state) => {
      state.statsData = null;
      state.isLoading = false;
      state.error = null;
      state.filters = {
        timeframe: 'all',
        category: 'all',
        technologies: [],
        difficulty_level: 'all',
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProjectStats lifecycle
      .addCase(fetchProjectStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statsData = action.payload;
        state.error = null;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.isLoading = false;
        state.statsData = null; // Clear data on error
        state.error = action.payload;
      });
  },
});

export const {
  setStatsData,
  setLoading,
  setError,
  setFilters,
  clearStats,
} = statsSlice.actions;

export default statsSlice.reducer;
