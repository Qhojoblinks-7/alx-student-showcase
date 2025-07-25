// src/hooks/selectors.js
import { useSelector } from 'react-redux';

// Auth Selectors
export const useAuth = () => useSelector((state) => state.auth);

// UI Selectors
export const useUI = () => useSelector((state) => state.ui);
export const useActiveDashboardTab = () => useSelector((state) => state.ui.activeDashboardTab);

// Projects Selectors
export const useProjects = () => useSelector((state) => state.projects);
export const useProjectList = () => useSelector((state) => state.projects.projects);
export const useProjectLoading = () => useSelector((state) => state.projects.isLoading);
export const useProjectError = () => useSelector((state) => state.projects.error);

// Profile Selectors
export const useProfile = () => useSelector((state) => state.profile);
export const useUserProfile = () => useSelector((state) => state.profile.userProfile);
export const useProfileLoading = () => useSelector((state) => state.profile.isLoading);
export const useProfileError = () => useSelector((state) => state.profile.error);

// Stats Selectors
export const useProjectStats = () => useSelector((state) => state.stats.statsData);
export const useStatsLoading = () => useSelector((state) => state.stats.isLoading);
export const useStatsError = () => useSelector((state) => state.stats.error);
export const useStatsFilters = () => useSelector((state) => state.stats.filters);

// GitHub Selectors
export const useGitHub = () => useSelector((state) => state.github);
export const useGitHubWizardStep = () => useSelector((state) => state.github.wizardStep);
export const useGitHubRepositories = () => useSelector((state) => state.github.repositories);
export const useGitHubALXProjects = () => useSelector((state) => state.github.alxProjects);
export const useGitHubSelectedProjects = () => useSelector((state) => state.github.selectedProjects);
export const useGitHubLoading = () => useSelector((state) => state.github.isLoadingRepositories || state.github.isDetectingALX || state.github.isImporting);
export const useGitHubError = () => useSelector((state) => state.github.error || state.github.repositoryError || state.github.importError);

// General App State Selector (if needed, but prefer specific ones)
export const useFullAppState = () => useSelector((state) => state);
// This can be used for debugging or accessing the entire state tree
// but it's better to use specific selectors for performance and clarity.
