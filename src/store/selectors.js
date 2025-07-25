// src/hooks/selectors.js
import { useDispatch, useSelector, useStore } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

// --- Custom Typed Redux Hooks ---
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// --- Combined Hooks for Slices (Keep these as they simplify access) ---
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state) => state.auth);
    return { ...authState, dispatch };
};

// ... (other useX hooks remain the same) ...

export const useProjects = () => {
    const dispatch = useAppDispatch();
    const projectsState = useAppSelector((state) => state.projects);
    return { ...projectsState, dispatch };
};

export const useProfile = () => {
    const dispatch = useAppDispatch();
    const profileState = useAppSelector((state) => state.profile);
    return { ...profileState, dispatch };
};

export const useStats = () => {
    const dispatch = useAppDispatch();
    const statsState = useAppSelector((state) => state.stats);
    return { ...statsState, dispatch };
};

export const useGitHub = () => {
    const dispatch = useAppDispatch();
    const githubState = useAppSelector((state) => state.github);
    return { ...githubState, dispatch };
};

export const useSharing = () => {
    const dispatch = useAppDispatch();
    const sharingState = useAppSelector((state) => state.sharing);
    return { ...sharingState, dispatch };
};

// --- Memoized Selectors (using reselect for efficiency) ---

// Base selector for the projects state
const selectProjectsState = (state) => state.projects;
const selectStatsData = (state) => state.stats.statsData; // Direct access to statsData

/**
 * Selector for authentication status to be used by ProtectedRoute.
 * This ensures that ProtectedRoute only re-renders if these specific derived values change.
 */
export const selectAuthStatus = createSelector(
  [(state) => state.auth.user, (state) => state.auth.isLoading],
  (user, isLoading) => ({
    isAuthenticated: !!user, // Booleans are stable primitives
    isLoading: isLoading,      // Booleans are stable primitives
    user: user               // The user object itself. This assumes authSlice updates user immutably.
  })
);


/**
 * Selector to return all projects from the projects slice.
 */
export const selectAllProjects = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.projects
);

// ... (other memoized selectors remain the same) ...

/**
 * Returns the total count of projects from the stats slice.
 * This is primarily for consistency if you store total projects directly in statsData.
 * Otherwise, it could be computed from allProjects.
 */
export const selectTotalProjects = createSelector(
  [selectStatsData],
  (statsData) => statsData?.totalProjects || 0
);

/**
 * Returns the count of public projects.
 * Assumes projects have a 'visibility' property.
 */
export const selectPublicProjects = createSelector(
  [selectAllProjects],
  (projects) => projects.filter(project => project.is_public).length // Assuming 'is_public' now from ProjectList.jsx
);

/**
 * Returns data formatted for a category chart.
 * Example format: [{ name: 'Category A', value: 10 }, { name: 'Category B', value: 5 }]
 * Relies on `statsData.projectsByCategory` which is pre-aggregated.
 */
export const selectProjectsByCategoryChartData = createSelector(
  [selectStatsData],
  (statsData) => {
    if (!statsData || !statsData.projectsByCategory) return [];
    return Object.entries(statsData.projectsByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }
);

/**
 * Returns data formatted for a technology chart.
 * Example format: [{ name: 'React', value: 15 }, { name: 'Node.js', value: 8 }]
 * Relies on `statsData.projectsByTechnology` which is pre-aggregated.
 */
export const selectTopTechnologiesChartData = createSelector(
  [selectStatsData],
  (statsData) => {
    if (!statsData || !statsData.projectsByTechnology) return [];
    // Optionally sort by value and take top N
    return Object.entries(statsData.projectsByTechnology)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }
);

/**
 * Returns data formatted for a project completion trend chart.
 * Example format: [{ date: '2023-01', count: 5 }, { date: '2023-02', count: 8 }]
 * Relies on `statsData.projectsOverTime` which is pre-aggregated and sorted.
 */
export const selectProjectsCompletionTrendChartData = createSelector(
  [selectStatsData],
  (statsData) => {
    if (!statsData || !statsData.projectsOverTime) return [];
    return statsData.projectsOverTime;
  }
);

// --- Additional common selectors (examples) ---

export const selectIsAnyLoading = createSelector(
  [
    (state) => state.auth.isLoading,
    (state) => state.projects.status === 'loading', // Use status for projects loading
    (state) => state.profile.isLoading,
    (state) => state.stats.isLoading,
    (state) => state.github.status.startsWith('loading'), // Use status for github loading
    (state) => state.sharing.isLoadingWorkLog,
    (state) => state.sharing.isLoadingSocialContent,
  ],
  (authLoading, projectsLoading, profileLoading, statsLoading, githubLoading, worklogLoading, socialLoading) =>
    authLoading || projectsLoading || profileLoading || statsLoading || githubLoading || worklogLoading || socialLoading
);

export const selectGlobalError = createSelector(
  [
    (state) => state.auth.error,
    (state) => state.projects.error,
    (state) => state.profile.error,
    (state) => state.stats.error,
    (state) => state.github.error,
    (state) => state.sharing.error,
  ],
  (authError, projectsError, profileError, statsError, githubError, sharingError) =>
    authError || projectsError || profileError || statsError || githubError || sharingError || null
);

// Selector for the current authenticated user's ID
export const selectCurrentUserId = createSelector(
  [(state) => state.auth.user],
  (user) => user?.id || null
);

// Selector for a specific project by ID (useful if you don't use entity adapter)
export const selectProjectById = createSelector(
  [selectAllProjects, (state, projectId) => projectId],
  (projects, projectId) => projects.find(project => project.id === projectId)
);