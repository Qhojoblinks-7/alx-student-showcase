// src/store/slices/sharingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

// --- Service Imports ---
import { githubService } from '../../components/service/github-service';             // For fetching general repo info
import { aiService } from '../../components/service/ai-service';                 // For AI work log summary
import { socialOptimizer } from '../../lib/social-optimizer';     // For optimizing social media content
import { githubCommitsService } from '../../components/service/github-commits-service';

// --- Initial State ---
const initialState = {
  currentWorkLog: '', // AI-generated humanized work log text
  socialContent: { // Optimized content for different platforms
    twitter: '',
    linkedin: '',
    facebook: '',
    discord: '',
  },
  repositoryInfo: null, // Basic GitHub repo details for the UI (e.g., repo name, default branch)
  isLoadingWorkLog: false,
  isLoadingSocialContent: false,
  error: null,
};

// --- Async Thunks (createAsyncThunk) ---

/**
 * Fetches commit data from GitHub and uses AI to generate a humanized work log.
 * @param {object} params
 * @param {string} params.githubUrl - The full GitHub repository URL (e.g., https://github.com/user/repo).
 * @param {string} params.timeframe - Timeframe for commits ('all', 'last_week', 'last_month', 'last_3_months').
 * @param {string} params.branch - Optional: The branch to fetch commits from (e.g., 'main', 'master').
 */
export const generateWorkLog = createAsyncThunk(
  'sharing/generateWorkLog',
  async ({ githubUrl, timeframe, branch = 'main' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(sharingSlice.actions.setLoadingWorkLog(true));
      dispatch(sharingSlice.actions.setError(null));

      // 1. Parse GitHub URL to get owner and repoName
      const parsedUrl = githubCommitsService.parseGitHubUrl(githubUrl);
      if (!parsedUrl) {
        throw new Error("Invalid GitHub URL provided. Please ensure it's a valid repository URL.");
      }
      const { owner, repoName } = parsedUrl;
      // 2. Determine the 'sinceDate' based on the timeframe
      let sinceDate = null;
      const now = new Date();
      if (timeframe === 'last_week') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        sinceDate = oneWeekAgo.toISOString();
      } else if (timeframe === 'last_month') {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        sinceDate = oneMonthAgo.toISOString();
      } else if (timeframe === 'last_3_months') {
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        sinceDate = threeMonthsAgo.toISOString();
      }
      // 'all' timeframe means no 'sinceDate' filter is applied

      // 3. Fetch raw commit data from GitHub using githubCommitsService
      const rawCommits = await githubCommitsService.fetchRepositoryCommits(owner, repoName, sinceDate, branch);

      if (!rawCommits || rawCommits.length === 0) {
        throw new Error("No commits found for the given repository, branch, and timeframe.");
      }

      // 4. Use AI service to generate a humanized work log summary
      const workLogText = await aiService.generateWorkLogSummary(rawCommits);

      dispatch(sharingSlice.actions.setCurrentWorkLog(workLogText));
      return { workLogText, rawCommits }; // Return rawCommits as they might be needed for social content generation
    } catch (error) {
      console.error("Generate work log error:", error.message);
      dispatch(sharingSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(sharingSlice.actions.setLoadingWorkLog(false));
    }
  }
);

/**
 * Optimizes content for various social media platforms using AI.
 * @param {object} params
 * @param {object} params.project - The project object related to the work log.
 * @param {string} params.aiWorkLogSummaryText - The AI-generated humanized work log.
 * @param {Array} params.rawCommits - The raw commit data (optional, for deeper analysis by AI).
 * @param {string} params.customMessage - Any additional custom message from the user.
 */
export const generateSocialContent = createAsyncThunk(
  'sharing/generateSocialContent',
  async ({ project, aiWorkLogSummaryText, rawCommits = [], customMessage = '' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(sharingSlice.actions.setLoadingSocialContent(true));
      dispatch(sharingSlice.actions.setError(null));

      // Prepare data for social content optimization service
      const contentData = {
        projectName: project?.title,
        projectDescription: project?.description,
        projectTechnologies: project?.technologies,
        projectUrl: project?.github_url, // Pass project URL for call to action
        workLog: aiWorkLogSummaryText,
        rawCommits: rawCommits.map(c => c.message), // Send only messages for brevity
        customMessage: customMessage,
      };

      // Call the socialOptimizer service
      const optimizedContent = await socialOptimizer.generatePlatformContent(contentData);

      dispatch(sharingSlice.actions.setSocialContent(optimizedContent));
      return optimizedContent;
    } catch (error) {
      console.error("Generate social content error:", error.message);
      dispatch(sharingSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(sharingSlice.actions.setLoadingSocialContent(false));
    }
  }
);

/**
 * Fetches basic repository details for the Work Log Generator UI.
 * @param {string} githubUrl - The full GitHub repository URL.
 */
export const fetchRepositoryInfo = createAsyncThunk(
  'sharing/fetchRepositoryInfo',
  async (githubUrl, { dispatch, rejectWithValue }) => {
    try {
      dispatch(sharingSlice.actions.setError(null)); // Clear previous errors

      // Parse GitHub URL to get owner and repoName
      const parsedUrl = githubCommitsService.parseGitHubUrl(githubUrl);
      if (!parsedUrl) {
        throw new Error("Invalid GitHub URL provided. Please use a full repository URL.");
      }
      const { owner, repoName } = parsedUrl;

      // Use githubService to fetch repository info
      const repoInfo = await githubService.fetchRepositoryInfo(owner, repoName);

      dispatch(sharingSlice.actions.setRepositoryInfo(repoInfo));
      return repoInfo;
    } catch (error) {
      console.error("Fetch repository info error:", error.message);
      dispatch(sharingSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    }
  }
);

// --- Slice Definition ---

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    // Synchronous reducers
    setCurrentWorkLog: (state, action) => {
      state.currentWorkLog = action.payload;
    },
    setSocialContent: (state, action) => {
      state.socialContent = action.payload;
    },
    setRepositoryInfo: (state, action) => {
      state.repositoryInfo = action.payload;
    },
    setLoadingWorkLog: (state, action) => {
      state.isLoadingWorkLog = action.payload;
    },
    setLoadingSocialContent: (state, action) => {
      state.isLoadingSocialContent = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearSharingState: (state) => {
      // Reset all state to initial values
      Object.assign(state, initialState);
    },
  },
});

// --- Actions Export ---
export const {
  setCurrentWorkLog,
  setSocialContent,
  setRepositoryInfo,
  setLoadingWorkLog,
  setLoadingSocialContent,
  setError,
  clearSharingState,
} = sharingSlice.actions;

// --- Selectors ---
// Base selector for the sharing state
const selectSharingState = (state) => state.sharing;

export const selectCurrentWorkLog = createSelector(
  [selectSharingState],
  (sharingState) => sharingState.currentWorkLog
);

export const selectSocialContent = createSelector(
  [selectSharingState],
  (sharingState) => sharingState.socialContent
);

export const selectRepositoryInfo = createSelector(
  [selectSharingState],
  (sharingState) => sharingState.repositoryInfo
);

export const selectIsLoadingWorkLog = createSelector(
  [selectSharingState],
  (sharingState) => sharingState.isLoadingWorkLog
);

export const selectIsLoadingSocialContent = createSelector(
  [selectSharingState],
  (sharingState) => sharingState.isLoadingSocialContent
);

export const selectSharingError = createSelector(
  [selectSharingState],
  (sharingState) => sharingState.error
);

export default sharingSlice.reducer;