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