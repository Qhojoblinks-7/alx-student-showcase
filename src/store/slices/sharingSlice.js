import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GitHubCommitsService, SocialContentOptimizer } from '@/lib/social-optimizer.js';

// Async thunks for sharing operations
export const generateWorkLog = createAsyncThunk(
  'sharing/generateWorkLog',
  async ({ githubUrl, timeframe }, { rejectWithValue }) => {
    try {
      const githubInfo = GitHubCommitsService.parseGitHubUrl(githubUrl);
      if (!githubInfo) {
        throw new Error('Invalid GitHub URL format');
      }

      const workLog = await GitHubCommitsService.generateWorkLog(
        githubInfo.username,
        githubInfo.repoName,
        parseInt(timeframe)
      );

      if (!workLog) {
        throw new Error(`No commits found in the last ${timeframe} days`);
      }

      return workLog;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateSocialContent = createAsyncThunk(
  'sharing/generateSocialContent',
  async ({ project, workLog, customMessage }, { rejectWithValue }) => {
    try {
      const content = SocialContentOptimizer.generatePlatformContent(
        project,
        workLog,
        customMessage
      );
      return content;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRepositoryInfo = createAsyncThunk(
  'sharing/fetchRepositoryInfo',
  async (githubUrl, { rejectWithValue }) => {
    try {
      const githubInfo = GitHubCommitsService.parseGitHubUrl(githubUrl);
      if (!githubInfo) {
        throw new Error('Invalid GitHub URL format');
      }

      const response = await fetch(
        `https://api.github.com/repos/${githubInfo.username}/${githubInfo.repoName}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch repository information');
      }

      const repoData = await response.json();
      return {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        homepage: repoData.homepage,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Work log data
  currentWorkLog: null,
  repositoryInfo: null,
  
  // Generated content for different platforms
  socialContent: {
    twitter: null,
    linkedin: null,
    facebook: null,
    discord: null,
  },
  
  // Sharing settings
  settings: {
    timeframe: '7',
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
  error: null,
  workLogError: null,
  contentError: null,
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
        state.currentWorkLog = action.payload;
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
        state.socialContent = action.payload;
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