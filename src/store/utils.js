import { useSelector, useDispatch } from 'react-redux';

// Core Redux hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth selectors
export const useAuth = () => useSelector(state => ({
  user: state.auth.user,
  profile: state.auth.profile,
  isAuthenticated: state.auth.isAuthenticated,
  isInitialized: state.auth.isInitialized,
}));

export const useAuthLoading = () => useSelector(state => ({
  isLoading: state.auth.isLoading,
  isUpdatingProfile: state.auth.isUpdatingProfile,
  isUploadingAvatar: state.auth.isUploadingAvatar,
}));

export const useAuthError = () => useSelector(state => ({
  error: state.auth.error,
  profileError: state.auth.profileError,
}));

export const useUserProfile = () => useSelector(state => state.auth.profile);

// Project selectors
export const useProjects = () => useSelector(state => state.projects.projects);
export const useCurrentProject = () => useSelector(state => state.projects.currentProject);
export const useProjectsLoading = () => useSelector(state => ({
  isLoading: state.projects.isLoading,
  isCreating: state.projects.isCreating,
  isUpdating: state.projects.isUpdating,
  isDeleting: state.projects.isDeleting,
  isImporting: state.projects.isImporting,
}));
export const useProjectsError = () => useSelector(state => state.projects.error);
export const useProjectStats = () => useSelector(state => state.projects.stats);
export const useProjectFilters = () => useSelector(state => state.projects.filters);

// Enhanced project selectors
export const useFilteredProjects = () => useSelector(state => {
  const { projects, filters } = state.projects;
  
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
});

export const useProjectsByCategory = () => useSelector(state => {
  const projects = state.projects.projects;
  const grouped = {};
  
  projects.forEach(project => {
    const category = project.category || 'other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(project);
  });
  
  return grouped;
});

export const useALXProjects = () => useSelector(state => 
  state.projects.projects.filter(project => 
    project.alx_confidence && project.alx_confidence > 0.5
  )
);

export const usePublicProjects = () => useSelector(state => 
  state.projects.projects.filter(project => project.is_public)
);

export const usePrivateProjects = () => useSelector(state => 
  state.projects.projects.filter(project => !project.is_public)
);

// UI selectors
export const useModals = () => useSelector(state => state.ui.modals);
export const useActiveTab = () => useSelector(state => state.ui.activeTab);
export const useNotifications = () => useSelector(state => state.ui.notifications);
export const useTheme = () => useSelector(state => state.ui.theme);
export const useUILoading = () => useSelector(state => state.ui.loading);
export const useSidebarOpen = () => useSelector(state => state.ui.sidebarOpen);

// GitHub selectors
export const useGitHubRepositories = () => useSelector(state => state.github.repositories);
export const useALXProjectCandidates = () => useSelector(state => state.github.alxProjects);
export const useSelectedProjects = () => useSelector(state => state.github.selectedProjects);
export const useGitHubLoading = () => useSelector(state => ({
  repositories: state.github.isLoadingRepositories,
  detecting: state.github.isDetectingALX,
  importing: state.github.isImporting,
  details: state.github.isLoadingDetails,
}));
export const useGitHubErrors = () => useSelector(state => ({
  general: state.github.error,
  repository: state.github.repositoryError,
  import: state.github.importError,
}));
export const useGitHubWizard = () => useSelector(state => ({
  step: state.github.wizardStep,
  data: state.github.wizardData,
}));

// Sharing selectors
export const useWorkLog = () => useSelector(state => state.sharing.currentWorkLog);
export const useRepositoryInfo = () => useSelector(state => state.sharing.repositoryInfo);
export const useSocialContent = () => useSelector(state => state.sharing.socialContent);
export const useSharingSettings = () => useSelector(state => state.sharing.settings);
export const useCustomMessage = () => useSelector(state => state.sharing.customMessage);
export const useTemplates = () => useSelector(state => state.sharing.templates);
export const useSharingLoading = () => useSelector(state => ({
  workLog: state.sharing.isGeneratingWorkLog,
  content: state.sharing.isGeneratingContent,
  repoInfo: state.sharing.isFetchingRepoInfo,
}));
export const useSharingErrors = () => useSelector(state => ({
  general: state.sharing.error,
  workLog: state.sharing.workLogError,
  content: state.sharing.contentError,
}));

// Combined selectors for complex operations
export const useProjectsWithStats = () => useSelector(state => ({
  projects: state.projects.projects,
  stats: state.projects.stats,
  filters: state.projects.filters,
}));

export const useAuthWithProfile = () => useSelector(state => ({
  user: state.auth.user,
  profile: state.auth.profile,
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading || state.auth.isUpdatingProfile,
  error: state.auth.error || state.auth.profileError,
}));

export const useFullAppState = () => useSelector(state => ({
  auth: {
    user: state.auth.user,
    profile: state.auth.profile,
    isAuthenticated: state.auth.isAuthenticated,
  },
  projects: {
    projects: state.projects.projects,
    stats: state.projects.stats,
    currentProject: state.projects.currentProject,
  },
  ui: {
    activeTab: state.ui.activeTab,
    theme: state.ui.theme,
    modals: state.ui.modals,
  },
}));

// Redux utility functions and common selectors

// Memoized selectors for better performance
export const createProjectSelector = (projectId) => (state) => 
  state.projects.projects.find(project => project.id === projectId);

export const createFilteredProjectsSelector = (filter) => (state) => {
  const projects = state.projects.projects;
  
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
};

// Helper functions for state manipulation
export const createModalActions = (modalName) => ({
  open: (data) => ({ type: 'ui/openModal', payload: { modalName, data } }),
  close: () => ({ type: 'ui/closeModal', payload: modalName }),
});

// Common loading state selector
export const createLoadingSelector = (...keys) => (state) => {
  return keys.some(key => {
    const parts = key.split('.');
    let value = state;
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return false;
    }
    return value;
  });
};

// Error selector that combines errors from multiple slices
export const selectAllErrors = (state) => ({
  auth: state.auth.error,
  projects: state.projects.error,
  github: state.github.error,
  sharing: state.sharing.error,
});

// Combined loading state selector
export const selectAllLoading = (state) => ({
  auth: state.auth.isLoading,
  projects: state.projects.isLoading,
  github: state.github.isLoadingRepositories || state.github.isDetectingALX || state.github.isImporting,
  sharing: state.sharing.isGeneratingWorkLog || state.sharing.isGeneratingContent,
});

// User profile selector with computed fields
export const selectUserProfile = (state) => {
  const user = state.auth.user;
  if (!user) return null;
  
  return {
    ...user,
    initials: user.email ? user.email.substring(0, 2).toUpperCase() : '??',
    displayName: user.user_metadata?.full_name || user.email,
  };
};

// Project statistics with computed metrics
export const selectProjectMetrics = (state) => {
  const projects = state.projects.projects;
  const stats = state.projects.stats;
  
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
};

// GitHub integration status
export const selectGitHubStatus = (state) => ({
  isConnected: !!state.github.currentUser,
  hasRepositories: state.github.repositories.length > 0,
  hasALXProjects: state.github.alxProjects.length > 0,
  selectedCount: state.github.selectedProjects.length,
  wizardStep: state.github.wizardStep,
});

// Sharing workflow status
export const selectSharingStatus = (state) => ({
  hasWorkLog: !!state.sharing.currentWorkLog,
  hasContent: Object.values(state.sharing.socialContent).some(content => !!content),
  selectedPlatforms: state.sharing.settings.selectedPlatforms,
  isReady: !!state.sharing.currentWorkLog && 
           Object.values(state.sharing.socialContent).some(content => !!content),
});

// UI state helpers
export const selectModalState = (modalName) => (state) => state.ui.modals[modalName];

export const selectActiveFeatures = (state) => ({
  isProjectFormOpen: state.ui.modals.projectForm,
  isGitHubImportOpen: state.ui.modals.gitHubImport,
  isShareModalOpen: state.ui.modals.shareProject || state.ui.modals.autoWorkLogShare,
  activeTab: state.ui.activeTab,
});

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
