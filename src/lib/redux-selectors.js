import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect'; // Import createSelector

// Core Redux hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth selectors
const getAuthState = (state) => state.auth;

export const useAuth = createSelector(
  getAuthState,
  (auth) => ({
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: auth.isAuthenticated,
    isInitialized: auth.isInitialized,
  })
);

export const useAuthLoading = createSelector(
  getAuthState,
  (auth) => ({
    isLoading: auth.isLoading,
    isUpdatingProfile: auth.isUpdatingProfile,
    isUploadingAvatar: auth.isUploadingAvatar,
  })
);

export const useAuthError = createSelector(
  getAuthState,
  (auth) => ({
    error: auth.error,
    profileError: auth.profileError,
  })
);

export const useUserProfile = (state) => state.auth.profile;

// Project selectors
const getProjectsState = (state) => state.projects;

export const useProjects = createSelector(getProjectsState, (projectsState) => projectsState.projects);
export const useCurrentProject = createSelector(getProjectsState, (projectsState) => projectsState.currentProject);
export const useProjectsLoading = createSelector(
  getProjectsState,
  (projectsState) => ({
    isLoading: projectsState.isLoading,
    isCreating: projectsState.isCreating,
    isUpdating: projectsState.isUpdating,
    isDeleting: projectsState.isDeleting,
    isImporting: projectsState.isImporting,
  })
);
export const useProjectsError = createSelector(getProjectsState, (projectsState) => projectsState.error);
export const useProjectStats = createSelector(getProjectsState, (projectsState) => projectsState.stats);
export const useProjectFilters = createSelector(getProjectsState, (projectsState) => projectsState.filters);

// Enhanced project selectors
export const useFilteredProjects = createSelector(
  getProjectsState,
  (projectsState) => {
    const { projects, filters } = projectsState;
    
    return projects.filter(project => {
      // Filter by category
      if (filters.category !== 'all' && project.category !== filters.category) {
        return false;
      }
      
      // Filter by visibility
      if (filters.isPublic !== 'all') {
        const isPublic = filters.isPublic === 'public';
        if (project.is_public !== isPublic) {
          return false;
        }
      }
      
      // Filter by search term
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const title = project.title?.toLowerCase() || '';
        const description = project.description?.toLowerCase() || '';
        const technologies = project.technologies?.join(' ').toLowerCase() || '';
        
        if (!title.includes(searchTerm) && 
            !description.includes(searchTerm) && 
            !technologies.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  }
);

export const useProjectsByCategory = createSelector(
  getProjectsState,
  (projectsState) => {
    const projects = projectsState.projects;
    const grouped = {};
    
    projects.forEach(project => {
      const category = project.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(project);
    });
    
    return grouped;
  }
);

export const useALXProjects = createSelector(
  getProjectsState,
  (projectsState) => 
    projectsState.projects.filter(project => 
      project.alx_confidence && project.alx_confidence > 0.5
    )
);

export const usePublicProjects = createSelector(
  getProjectsState,
  (projectsState) => 
    projectsState.projects.filter(project => project.is_public)
);

export const usePrivateProjects = createSelector(
  getProjectsState,
  (projectsState) => 
    projectsState.projects.filter(project => !project.is_public)
);

// UI selectors
const getUIState = (state) => state.ui;

export const useModals = createSelector(getUIState, (ui) => ui.modals);
export const useActiveTab = createSelector(getUIState, (ui) => ui.activeTab);
export const useNotifications = createSelector(getUIState, (ui) => ui.notifications);
export const useTheme = createSelector(getUIState, (ui) => ui.theme);
export const useUILoading = createSelector(getUIState, (ui) => ui.loading);
export const useSidebarOpen = createSelector(getUIState, (ui) => ui.sidebarOpen);

// GitHub selectors
const getGitHubState = (state) => state.github;

export const useGitHubRepositories = createSelector(getGitHubState, (github) => github.repositories);
export const useALXProjectCandidates = createSelector(getGitHubState, (github) => github.alxProjects);
export const useSelectedProjects = createSelector(getGitHubState, (github) => github.selectedProjects);

// Memoized GitHub loading and error selectors (already defined in githubSlice, but duplicated here for consistency)
export const useGitHubLoading = createSelector(
  getGitHubState,
  (github) => ({
    repositories: github.isLoadingRepositories,
    detecting: github.isDetectingALX,
    importing: github.isImporting,
    details: github.isLoadingDetails,
  })
);
export const useGitHubErrors = createSelector(
  getGitHubState,
  (github) => ({
    general: github.error,
    repository: github.repositoryError,
    import: github.importError,
  })
);
export const useGitHubWizard = createSelector(
  getGitHubState,
  (github) => ({
    step: github.wizardStep,
    data: github.wizardData,
  })
);

// Sharing selectors
const getSharingState = (state) => state.sharing;

export const useWorkLog = createSelector(getSharingState, (sharing) => sharing.currentWorkLog);
export const useRepositoryInfo = createSelector(getSharingState, (sharing) => sharing.repositoryInfo);
export const useSocialContent = createSelector(getSharingState, (sharing) => sharing.socialContent);
export const useSharingSettings = createSelector(getSharingState, (sharing) => sharing.settings);
export const useCustomMessage = createSelector(getSharingState, (sharing) => sharing.customMessage);
export const useTemplates = createSelector(getSharingState, (sharing) => sharing.templates);
export const useSharingLoading = createSelector(
  getSharingState,
  (sharing) => ({
    workLog: sharing.isGeneratingWorkLog,
    content: sharing.isGeneratingContent,
    repoInfo: sharing.isFetchingRepoInfo,
  })
);
export const useSharingErrors = createSelector(
  getSharingState,
  (sharing) => ({
    general: sharing.error,
    workLog: sharing.workLogError,
    content: sharing.contentError,
  })
);

// Combined selectors for complex operations
export const useProjectsWithStats = createSelector(
  getProjectsState,
  (projectsState) => ({
    projects: projectsState.projects,
    stats: projectsState.stats,
    filters: projectsState.filters,
  })
);

export const useAuthWithProfile = createSelector(
  getAuthState,
  (auth) => ({
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || auth.isUpdatingProfile,
    error: auth.error || auth.profileError,
  })
);

export const useFullAppState = createSelector(
  (state) => state.auth,
  (state) => state.projects,
  (state) => state.ui,
  (auth, projects, ui) => ({
    auth: {
      user: auth.user,
      profile: auth.profile,
      isAuthenticated: auth.isAuthenticated,
    },
    projects: {
      projects: projects.projects,
      stats: projects.stats,
      currentProject: projects.currentProject,
    },
    ui: {
      activeTab: ui.activeTab,
      theme: ui.theme,
      modals: ui.modals,
    },
  })
);

// Redux utility functions and common selectors

// Memoized selectors for better performance
export const createProjectSelector = (projectId) => createSelector(
  getProjectsState,
  (projectsState) => projectsState.projects.find(project => project.id === projectId)
);

export const createFilteredProjectsSelector = (filter) => createSelector(
  getProjectsState,
  (projectsState) => {
    const projects = projectsState.projects;
    
    switch (filter.type) {
      case 'category':
        return projects.filter(project => project.category === filter.value);
      case 'technology':
        return projects.filter(project => 
          project.technologies?.includes(filter.value)
        );
      case 'search':
        const searchTerm = filter.value.toLowerCase();
        return projects.filter(project =>
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm)
        );
      default:
        return projects;
    }
  }
);

// Helper functions for state manipulation
export const createModalActions = (modalName) => ({
  open: (data) => ({ type: 'ui/openModal', payload: { modalName, data } }),
  close: () => ({ type: 'ui/closeModal', payload: modalName }),
});

// Common loading state selector
export const createLoadingSelector = (...keys) => createSelector(
  (state) => state, // Pass the whole state
  (state) => {
    return keys.some(key => {
      const parts = key.split('.');
      let value = state;
      for (const part of parts) {
        value = value[part];
        if (value === undefined) return false;
      }
      return value;
    });
  }
);

// Error selector that combines errors from multiple slices
export const selectAllErrors = createSelector(
  (state) => state.auth.error,
  (state) => state.projects.error,
  (state) => state.github.error,
  (state) => state.sharing.error,
  (authError, projectsError, githubError, sharingError) => ({
    auth: authError,
    projects: projectsError,
    github: githubError,
    sharing: sharingError,
  })
);

// Combined loading state selector
export const selectAllLoading = createSelector(
  (state) => state.auth.isLoading,
  (state) => state.projects.isLoading,
  (state) => state.github.isLoadingRepositories || state.github.isDetectingALX || state.github.isImporting,
  (state) => state.sharing.isGeneratingWorkLog || state.sharing.isGeneratingContent,
  (authLoading, projectsLoading, githubLoading, sharingLoading) => ({
    auth: authLoading,
    projects: projectsLoading,
    github: githubLoading,
    sharing: sharingLoading,
  })
);

// User profile selector with computed fields
export const selectUserProfile = createSelector(
  getAuthState,
  (auth) => {
    const user = auth.user;
    if (!user) return null;
    
    return {
      ...user,
      initials: user.email ? user.email.substring(0, 2).toUpperCase() : '??',
      displayName: user.user_metadata?.full_name || user.email,
    };
  }
);

// Project statistics with computed metrics
export const selectProjectMetrics = createSelector(
  getProjectsState,
  (projectsState) => {
    const projects = projectsState.projects;
    const stats = projectsState.stats;
    
    // Calculate additional metrics
    const categoryCounts = projects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {});
    
    const techCounts = projects.reduce((acc, project) => {
      project.technologies?.forEach(tech => {
        acc[tech] = (acc[tech] || 0) + 1;
      });
      return acc;
    }, {});
    
    const topTechnologies = Object.entries(techCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tech, count]) => ({ name: tech, count }));
    
    return {
      ...stats,
      categoryCounts,
      topTechnologies,
      avgProjectsPerCategory: Object.keys(categoryCounts).length > 0 
        ? projects.length / Object.keys(categoryCounts).length 
        : 0,
    };
  }
);

// GitHub integration status
export const selectGitHubStatus = createSelector(
  getGitHubState,
  (github) => ({
    isConnected: !!github.currentUser,
    hasRepositories: github.repositories.length > 0,
    hasALXProjects: github.alxProjects.length > 0,
    selectedCount: github.selectedProjects.length,
    wizardStep: github.wizardStep,
  })
);

// Sharing workflow status
export const selectSharingStatus = createSelector(
  getSharingState,
  (sharing) => ({
    hasWorkLog: !!sharing.currentWorkLog,
    hasContent: Object.values(sharing.socialContent).some(content => !!content),
    selectedPlatforms: sharing.settings.selectedPlatforms,
    isReady: !!sharing.currentWorkLog && 
             Object.values(sharing.socialContent).some(content => !!content),
  })
);

// UI state helpers
export const selectModalState = (modalName) => createSelector(
  getUIState,
  (ui) => ui.modals[modalName]
);

export const selectActiveFeatures = createSelector(
  getUIState,
  (ui) => ({
    isProjectFormOpen: ui.modals.projectForm,
    isGitHubImportOpen: ui.modals.gitHubImport,
    isShareModalOpen: ui.modals.shareProject || ui.modals.autoWorkLogShare,
    activeTab: ui.activeTab,
  })
);

// Action creators with validation
export const createValidatedAction = (actionCreator, validator) => (payload) => {
  if (validator && !validator(payload)) {
    throw new Error('Invalid action payload');
  }
  return actionCreator(payload);
};

// Batch action creator for multiple operations
export const createBatchAction = (actions) => ({
  type: 'BATCH_ACTIONS',
  payload: actions,
});

// Middleware for handling batch actions
export const batchActionsMiddleware = (store) => (next) => (action) => {
  if (action.type === 'BATCH_ACTIONS') {
    action.payload.forEach(batchedAction => next(batchedAction));
    return;
  }
  return next(action);
};

// Common validators
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  githubUrl: (url) => /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url),
  notEmpty: (value) => value && value.trim().length > 0,
  projectTitle: (title) => title && title.trim().length >= 3,
};

// Performance optimization helpers
export const shouldUpdateComponent = (prevProps, nextProps, keys) => {
  return keys.some(key => prevProps[key] !== nextProps[key]);
};

export const memoizeSelector = (selector) => {
  let lastState;
  let lastResult;
  
  return (state) => {
    if (state !== lastState) {
      lastState = state;
      lastResult = selector(state);
    }
    return lastResult;
  };
};
export const createMemoizedSelector = (selector) => {
  const memoized = memoizeSelector(selector);
  return (state) => memoized(state);
};