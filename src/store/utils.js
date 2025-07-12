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