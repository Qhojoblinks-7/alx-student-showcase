import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect'; // Import createSelector

// Import initial states for robust checks (though usually not needed if store is always initialized)
import { initialState as uiInitialState } from '../store/slices/uiSlice.js';
import { initialState as authInitialState } from '../store/slices/authSlice.js';
import { initialState as projectsInitialState } from '../store/slices/projectsSlice.js';
import { initialState as githubInitialState } from '../store/slices/githubSlice.js';
import { initialState as sharingInitialState } from '../store/slices/sharingSlice.js';


// Core Redux hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Helper functions to safely get slice state (for createSelector input selectors)
const getAuthState = (state) => (state && state.auth) ? state.auth : authInitialState;
const getProjectsState = (state) => (state && state.projects) ? state.projects : projectsInitialState;
const getUIState = (state) => (state && state.ui) ? state.ui : uiInitialState;
const getGitHubState = (state) => (state && state.github) ? state.github : githubInitialState;
const getSharingState = (state) => (state && state.sharing) ? state.sharing : sharingInitialState;


// Auth selectors
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

export const useUserProfile = createSelector(
  getAuthState,
  (auth) => {
    const user = auth.user;
    if (!user) return null;

    return {
      ...auth.profile, // Use the profile from the auth state
      initials: user.email ? user.email.substring(0, 2).toUpperCase() : '??',
      displayName: user.user_metadata?.full_name || user.email,
    };
  }
);

// Project selectors
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
    isFetchingSingleProject: projectsState.isFetchingSingleProject,
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

    return (projects || []).filter(project => {
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
    const projects = projectsState.projects || [];
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
    (projectsState.projects || []).filter(project =>
      project.alx_confidence && project.alx_confidence > 0.5
    )
);

export const usePublicProjects = createSelector(
  getProjectsState,
  (projectsState) =>
    (projectsState.projects || []).filter(project => project.is_public)
);

export const usePrivateProjects = createSelector(
  getProjectsState,
  (projectsState) =>
    (projectsState.projects || []).filter(project => !project.is_public)
);

// UI selectors
export const useModals = createSelector(getUIState, (ui) => ui?.modals || {});
export const useModalData = createSelector(getUIState, (ui) => ui.modalData);
export const useActiveTab = createSelector(getUIState, (ui) => ui.activeTab);
export const useNotifications = createSelector(getUIState, (ui) => ui.notifications);
export const useTheme = createSelector(getUIState, (ui) => ui.theme);
export const useUILoading = createSelector(getUIState, (ui) => ui.loading);
export const useSidebarOpen = createSelector(getUIState, (ui) => ui.sidebarOpen);

// GitHub selectors
export const useGitHubRepositories = createSelector(getGitHubState, (github) => github.repositories);
export const useALXProjectCandidates = createSelector(getGitHubState, (github) => github.alxProjects);
export const useSelectedProjects = createSelector(getGitHubState, (github) => github.selectedProjects);

export const useGitHubLoading = createSelector(
  getGitHubState,
  (github) => ({
    isLoadingRepositories: github.isLoadingRepositories,
    isDetectingALX: github.isDetectingALX,
    isImporting: github.isImporting,
    isProcessingAI: github.isProcessingAI, // Added AI processing loading state
  })
);
export const useGitHubErrors = createSelector(
  getGitHubState,
  (github) => ({
    general: github.error,
    repository: github.repositoryError,
    import: github.importError,
    aiProcessing: github.aiProcessingError, // Added AI processing error state
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
  getAuthState,
  getProjectsState,
  getUIState,
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
  (projectsState) => (projectsState.projects || []).find(project => project.id === projectId)
);

export const createFilteredProjectsSelector = (filter) => createSelector(
  getProjectsState,
  (projectsState) => {
    const projects = projectsState.projects || [];

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
        // Safely access nested properties, returning false if any part is undefined
        if (value === undefined || value === null) return false;
        value = value[part];
      }
      return !!value; // Return true if the final value is truthy (e.g., true for loading flags)
    });
  }
);

// Error selector that combines errors from multiple slices
export const selectAllErrors = createSelector(
  getAuthState,
  getProjectsState,
  getGitHubState,
  getSharingState,
  (auth, projects, github, sharing) => ({
    auth: auth.error || auth.profileError,
    projects: projects.error,
    github: github.error || github.repositoryError || github.importError || github.aiProcessingError,
    sharing: sharing.error || sharing.workLogError || sharing.contentError,
  })
);


// Combined loading state selector
export const selectAllLoading = createSelector(
  getAuthState,
  getProjectsState,
  getGitHubState,
  getSharingState,
  (auth, projects, github, sharing) => ({
    auth: auth.isLoading || auth.isUpdatingProfile || auth.isUploadingAvatar || auth.isInitialized,
    projects: projects.isLoading || projects.isCreating || projects.isUpdating || projects.isDeleting || projects.isImporting || projects.isFetchingSingleProject,
    github: github.isLoadingRepositories || github.isDetectingALX || github.isImporting || github.isProcessingAI,
    sharing: sharing.isGeneratingWorkLog || sharing.isGeneratingContent || sharing.isFetchingRepoInfo,
  })
);

// Project specific selectors
export const selectProjects = createSelector(
  getProjectsState,
  (projectsState) => projectsState.projects
);
export const selectProjectById = (projectId) => createSelector(
    getProjectsState,
    (projectsState) => (projectsState.projects || []).find(project => project.id === projectId)
);

export const selectProjectMetrics = createSelector(
    getProjectsState,
    (projectsState) => {
        const projects = projectsState.projects || [];
        const stats = projectsState.stats || {};

        // Calculate additional metrics
        const categoryCounts = projects.reduce((acc, project) => {
            const category = project.category || 'other';
            acc[category] = (acc[category] || 0) + 1;
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
            total: projects.length,
            public: projects.filter(p => p.is_public).length,
            private: projects.filter(p => !p.is_public).length,
            technologies: Object.keys(techCounts).length,
            alxProjects: projects.filter(p => p.alx_confidence && p.alx_confidence > 0.5).length,
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
    isConnected: !!github.wizardData.username, // A more direct indicator if user entered username
    hasRepositories: (github.repositories || []).length > 0,
    hasALXProjects: (github.alxProjects || []).length > 0,
    selectedCount: (github.selectedProjects || []).length,
    wizardStep: github.wizardStep,
    isProcessingAI: github.isProcessingAI, // Added for quick check on AI status
  })
);

// Sharing workflow status
export const selectSharingStatus = createSelector(
  getSharingState,
  (sharing) => ({
    hasWorkLog: !!sharing.currentWorkLog,
    hasContent: Object.values(sharing.socialContent || {}).some(content => !!content),
    selectedPlatforms: sharing.settings?.selectedPlatforms || [],
    isReady: !!sharing.currentWorkLog &&
             Object.values(sharing.socialContent || {}).some(content => !!content),
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

// Removed memoizeSelector and createMemoizedSelector as createSelector handles memoization directly.
