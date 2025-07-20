import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Corrected import path for GitHubCommitsService and SocialContentOptimizer
import { GitHubCommitsService } from '../../lib/github-commits-service.js'; // For fetching raw commits
import { OpenAIService } from '../../lib/openai-service.js'; // For AI-generated summaries
import { SocialContentOptimizer } from '../../lib/social-content-optimizer.js'; // For platform-specific content optimization

// Async thunks for sharing operations

/**
 * Generates a humanized work log summary using AI based on GitHub commit activity.
 * It fetches raw commits and then sends them to the OpenAI service for summarization.
 *
 * @param {object} payload - Contains githubUrl (string) and timeframe (number of days).
 */
export const generateWorkLog = createAsyncThunk(
  'sharing/generateWorkLog',
  async ({ githubUrl, timeframe }, { rejectWithValue }) => {
    try {
      // The OpenAIService.generateWorkLogSummary now handles fetching commits internally.
      // It expects the githubUrl and optionally a commit limit.
      // We'll pass a higher limit (e.g., 50) to ensure enough data for AI.
      const aiWorkLogSummary = await OpenAIService.generateWorkLogSummary(
        githubUrl,
        50 // Fetch up to 50 recent commits for AI analysis
      );

      if (!aiWorkLogSummary || aiWorkLogSummary.includes('No recent commit activity')) {
        // Return a specific message if AI couldn't generate a log
        return rejectWithValue(`No recent commit activity found for ${githubUrl} in the last ${timeframe} days, or AI could not generate a summary.`);
      }

      // Optionally, if you still want some structured info from raw commits
      // for other parts of the UI or for SocialContentOptimizer's internal logic,
      // you could fetch them here and return them alongside the AI summary.
      // For now, we'll assume SocialContentOptimizer can re-analyze if needed,
      // or that the AI summary is sufficient.

      return aiWorkLogSummary; // This will be the AI-generated text
    } catch (error) {
      console.error('Error generating AI work log:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Generates optimized social media content for various platforms.
 * It now expects the AI-generated work log summary and raw commits (if needed for internal analysis).
 *
 * @param {object} payload - Contains project object, aiWorkLogSummaryText (string), rawCommits (array of objects), and customMessage (string).
 */
export const generateSocialContent = createAsyncThunk(
  'sharing/generateSocialContent',
  async ({ project, aiWorkLogSummaryText, rawCommits, customMessage }, { rejectWithValue }) => {
    try {
      // SocialContentOptimizer now receives the AI-generated summary directly.
      // It can also receive rawCommits if its internal logic needs to analyze them
      // for things like 'mostActiveArea' for smart content generation.
      const content = SocialContentOptimizer.generatePlatformContent(
        project,
        aiWorkLogSummaryText,
        rawCommits, // Pass raw commits if SocialContentOptimizer needs to analyze them
        customMessage
      );
      return content;
    } catch (error) {
      console.error('Error generating social content:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetches basic repository information from GitHub API.
 * @param {string} githubUrl - The GitHub repository URL.
 */
export const fetchRepositoryInfo = createAsyncThunk(
  'sharing/fetchRepositoryInfo',
  async (githubUrl, { rejectWithValue }) => {
    try {
      const githubInfo = GitHubCommitsService.parseGitHubUrl(githubUrl); // Reuse parseGitHubUrl
      if (!githubInfo) {
        throw new Error('Invalid GitHub URL format');
      }

      // Note: This fetch doesn't use authentication by default, which might lead to rate limits.
      // Consider adding authentication headers if this becomes an issue.
      const response = await fetch(
        `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repo}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository not found: ${githubInfo.owner}/${githubInfo.repo}`);
        }
        throw new Error(`Failed to fetch repository information: ${response.statusText || response.status}`);
      }

      const repoData = await response.json();
      return {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        homepage: repoData.homepage,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        // Add other relevant fields if needed
        github_url: repoData.html_url,
      };
    } catch (error) {
      console.error('Error fetching repository info:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const initialState = {
  // Work log data (will now store AI-generated text)
  currentWorkLog: null, // This will be the AI-generated string
  repositoryInfo: null, // Basic info about the repo

  // Generated content for different platforms
  socialContent: {
    twitter: null,
    linkedin: null,
    facebook: null,
    discord: null,
  },

  // Sharing settings
  settings: {
    timeframe: '7', // Default timeframe for commit fetching
    selectedPlatforms: ['twitter', 'linkedin'],
    autoGenerate: true,
  },

  // Custom messages and templates
  customMessage: '',
  templates: [],

  // Loading states
  isGeneratingWorkLog: false,
  isGeneratingContent: false,
  isFetchingRepoInfo: false,

  // Error states
  error: null, // General error
  workLogError: null, // Error specific to work log generation
  contentError: null, // Error specific to social content generation
};

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    // Clear states
    clearError: (state) => {
      state.error = null;
      state.workLogError = null;
      state.contentError = null;
    },
    clearWorkLog: (state) => {
      state.currentWorkLog = null;
      state.repositoryInfo = null;
    },
    clearSocialContent: (state) => {
      state.socialContent = {
        twitter: null,
        linkedin: null,
        facebook: null,
        discord: null,
      };
    },

    // Settings actions
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setTimeframe: (state, action) => {
      state.settings.timeframe = action.payload;
    },
    setSelectedPlatforms: (state, action) => {
      state.settings.selectedPlatforms = action.payload;
    },
    togglePlatform: (state, action) => {
      const platform = action.payload;
      const platforms = state.settings.selectedPlatforms;
      if (platforms.includes(platform)) {
        state.settings.selectedPlatforms = platforms.filter(p => p !== platform);
      } else {
        state.settings.selectedPlatforms = [...platforms, platform];
      }
    },

    // Message actions
    setCustomMessage: (state, action) => {
      state.customMessage = action.payload;
    },
    addTemplate: (state, action) => {
      state.templates.push({
        id: Date.now(),
        text: action.payload,
        createdAt: new Date().toISOString(),
      });
    },
    removeTemplate: (state, action) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },

    // Manual content updates
    updateSocialContent: (state, action) => {
      const { platform, content } = action.payload;
      state.socialContent[platform] = content;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate work log
      .addCase(generateWorkLog.pending, (state) => {
        state.isGeneratingWorkLog = true;
        state.workLogError = null;
      })
      .addCase(generateWorkLog.fulfilled, (state, action) => {
        state.isGeneratingWorkLog = false;
        state.currentWorkLog = action.payload; // Payload is now the AI-generated string
        state.workLogError = null;
      })
      .addCase(generateWorkLog.rejected, (state, action) => {
        state.isGeneratingWorkLog = false;
        state.workLogError = action.payload;
        state.currentWorkLog = null;
      })

      // Generate social content
      .addCase(generateSocialContent.pending, (state) => {
        state.isGeneratingContent = true;
        state.contentError = null;
      })
      .addCase(generateSocialContent.fulfilled, (state, action) => {
        state.isGeneratingContent = false;
        state.socialContent = action.payload; // Payload is the object of platform-specific content
        state.contentError = null;
      })
      .addCase(generateSocialContent.rejected, (state, action) => {
        state.isGeneratingContent = false;
        state.contentError = action.payload;
      })

      // Fetch repository info
      .addCase(fetchRepositoryInfo.pending, (state) => {
        state.isFetchingRepoInfo = true;
        state.error = null;
      })
      .addCase(fetchRepositoryInfo.fulfilled, (state, action) => {
        state.isFetchingRepoInfo = false;
        state.repositoryInfo = action.payload;
        state.error = null;
      })
      .addCase(fetchRepositoryInfo.rejected, (state, action) => {
        state.isFetchingRepoInfo = false;
        state.error = action.payload;
        state.repositoryInfo = null;
      });
  },
});

export const {
  // Clear actions
  clearError,
  clearWorkLog,
  clearSocialContent,

  // Settings actions
  updateSettings,
  setTimeframe,
  setSelectedPlatforms,
  togglePlatform,

  // Message actions
  setCustomMessage,
  addTemplate,
  removeTemplate,

  // Manual content updates
  updateSocialContent,
} = sharingSlice.actions;

// Selectors
export const selectCurrentWorkLog = (state) => state.sharing.currentWorkLog;
export const selectRepositoryInfo = (state) => state.sharing.repositoryInfo;
export const selectSocialContent = (state) => state.sharing.socialContent;
export const selectSharingSettings = (state) => state.sharing.settings;
export const selectCustomMessage = (state) => state.sharing.customMessage;
export const selectTemplates = (state) => state.sharing.templates;
export const selectSharingLoading = (state) => ({
  workLog: state.sharing.isGeneratingWorkLog,
  content: state.sharing.isGeneratingContent,
  repoInfo: state.sharing.isFetchingRepoInfo,
});
export const selectSharingErrors = (state) => ({
  general: state.sharing.error,
  workLog: state.sharing.workLogError,
  content: state.sharing.contentError,
});

export default sharingSlice.reducer;
