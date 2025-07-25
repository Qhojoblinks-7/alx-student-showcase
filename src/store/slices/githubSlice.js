// src/store/slices/githubSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { githubService, ALXProjectDetector } from '../../components/service/github-service'; // Import the consolidated githubService
import { aiService } from '../../components/service/ai-service'; // Assuming this path is correct
import  selectGithubAccessToken  from './profileSlice'; // Import the selector

// Initial State
const initialState = {
  repos: [],
  status: 'idle', // 'idle' | 'loading_repos' | 'loading_alx' | 'analyzing_repo' | 'failed' | 'succeeded' | 'generating_worklog'
  error: null,
  currentStep: 1, // 1: Select Repo, 2: Review/Edit Project, 3: AI Insights, 4: Import Confirmation
  isWizardOpen: false,
  selectedRepo: null, // The currently selected repo object (from GitHub API, before AI analysis)
  projectFormFields: { // Fields that map to the 'projects' table in Supabase
    id: null, // This will be the UUID for the Supabase project entry
    user_id: null,
    github_id: null, // GitHub's internal ID
    title: '',
    description: '',
    github_url: '',
    is_public: true,
    is_alx_project: false,
    category: '', // Mapped from suggested_category
    technologies: [], // Mapped from suggested_technologies
    difficulty: '', // Mapped from suggested_difficulty
    start_date: null,
    end_date: null,
    status: 'completed', // e.g., 'completed', 'in-progress', 'planned'
    key_learnings: '',
    challenges_faced: '',
    solutions: '',
    collaborators: [],
    ai_summary: '',
    ai_work_log: '',
    ai_last_updated: null,
        ai_social_posts: null, // <--- ADD THIS LINE

    // Add any other fields your 'projects' table has
  },
  alxProjectsDetected: [],
  selectedALXProject: null, // The project selected from the ALX detected list
  workLogContent: '',
  rawCommits: [], // Store raw commits for potential re-use/display
    socialPosts: null, // <--- ADD THIS LINE (this will hold the generated social posts)

};

// Async Thunks

/**
 * Fetches the current user's GitHub repositories.
 * The githubAccessToken is passed from the profile state.
 */
export const fetchRepos = createAsyncThunk(
  'github/fetchRepos',
  async (_, { getState, rejectWithValue }) => {
    const githubAccessToken = selectGithubAccessToken(getState());
    if (!githubAccessToken) {
      return rejectWithValue('GitHub access token not available. Please connect your GitHub account.');
    }
    try {
      const repos = await githubService.fetchUserRepositories(githubAccessToken);
      return repos;
    } catch (error) {
      console.error("Error in fetchRepos:", error);
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid or expired')) {
        return rejectWithValue('Failed to fetch repositories. Please ensure your GitHub account is properly connected and re-authenticate.');
      }
      return rejectWithValue(error.message || 'Failed to fetch repositories.');
    }
  }
);

/**
 * Detects ALX projects from the fetched repositories.
 */
export const detectALXProjects = createAsyncThunk(
  'github/detectALXProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { github: { repos } } = getState();
      if (!repos || repos.length === 0) {
        // This is not necessarily an error if no repos were found, just no ALX projects.
        // But if `repos` is null/empty and we expect to operate on it, it indicates a preceding issue.
        return []; // Return empty array if no repos, not an error
      }
      const detected = ALXProjectDetector.detectALXProjects(repos);
      return detected;
    } catch (error) {
      console.error("Error detecting ALX projects:", error);
      return rejectWithValue(error.message || 'Failed to detect ALX projects.');
    }
  }
);

/**
 * Analyzes a selected GitHub repository, fetches additional info, and generates AI content.
 */
export const analyzeRepository = createAsyncThunk(
  'github/analyzeRepository',
  async ({ owner, repoName, useAI = true }, { dispatch, getState, rejectWithValue }) => {
    const githubAccessToken = selectGithubAccessToken(getState());
    if (!githubAccessToken) {
      return rejectWithValue('GitHub access token not available for repository analysis. Please connect your GitHub account.');
    }

    try {
      dispatch(githubSlice.actions.setStatus('analyzing_repo'));
      dispatch(githubSlice.actions.setError(null));

      // Fetch more detailed repo info using the user's token
      const repoInfo = await githubService.fetchRepositoryInfo(owner, repoName, githubAccessToken);

      // Extract default branch, falling back to 'main' or 'master' if needed
      const defaultBranch = repoInfo.default_branch || 'main'; // GitHub's default is usually 'main' now

      // Fetch commits for AI work log, passing the user's token
      const rawCommits = await githubService.fetchRepositoryCommits(
        owner,
        repoName,
        githubAccessToken, // Pass the user access token
        null, // No sinceDate filter for now, get all
        defaultBranch
      );

      let aiSummary = '';
      let aiWorkLog = '';

      if (useAI) {
        // Generate AI Project Summary
        aiSummary = await aiService.generateProjectSummary({
          title: repoInfo.name,
          description: repoInfo.description,
          // Technologies can be inferred from repoInfo.language or repoInfo.topics
          technologies: [...(repoInfo.topics || []), repoInfo.language].filter(Boolean),
          key_learnings: '', // Not available from GitHub API
          challenges_faced: '', // Not available from GitHub API
        });

        // Generate AI Work Log Summary from commits
        if (rawCommits && rawCommits.length > 0) {
          aiWorkLog = await aiService.generateWorkLogSummary(rawCommits);
        } else {
          aiWorkLog = "No recent commit data available to generate a detailed work log.";
        }
      } else {
        aiSummary = "AI analysis skipped for this project.";
        aiWorkLog = "AI work log generation skipped.";
      }

      // Prepare project form fields based on GitHub data and AI insights
      const projectData = {
        github_id: repoInfo.id,
        title: repoInfo.name,
        description: repoInfo.description,
        github_url: repoInfo.html_url,
        is_public: !repoInfo.is_private, // Use is_private from repoInfo
        category: ALXProjectDetector.detectALXProjects([repoInfo])[0]?.suggested_category || 'Uncategorized',
        technologies: ALXProjectDetector.detectALXProjects([repoInfo])[0]?.suggested_technologies || [repoInfo.language].filter(Boolean),
        difficulty: ALXProjectDetector.detectALXProjects([repoInfo])[0]?.suggested_difficulty || 'Intermediate',
        start_date: repoInfo.created_at ? new Date(repoInfo.created_at).toISOString().split('T')[0] : null,
        end_date: repoInfo.updated_at ? new Date(repoInfo.updated_at).toISOString().split('T')[0] : null,
        ai_summary: aiSummary,
        ai_work_log: aiWorkLog,
        ai_last_updated: new Date().toISOString(),
        // Default values for other fields
        status: 'completed',
        key_learnings: '',
        challenges_faced: '',
        solutions: '',
        collaborators: [],
      };

      dispatch(githubSlice.actions.setProjectFormFields(projectData));
      dispatch(githubSlice.actions.setRawCommits(rawCommits)); // Store raw commits for potential display
      dispatch(githubSlice.actions.setStatus('succeeded'));

      return projectData;

    } catch (error) {
      console.error('Error analyzing repository:', error.message);
      dispatch(githubSlice.actions.setError(error.message));
      dispatch(githubSlice.actions.setStatus('failed'));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetches commits and generates a work log summary for a selected project.
 */
export const fetchCommitsAndGenerateWorkLog = createAsyncThunk(
  'github/fetchCommitsAndGenerateWorkLog',
  async ({ owner, repoName, branch, timeframe = 'all' }, { getState, rejectWithValue }) => {
    const githubAccessToken = selectGithubAccessToken(getState());
    if (!githubAccessToken) {
      return rejectWithValue('GitHub access token not available for work log generation. Please connect your GitHub account.');
    }

    try {
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

      // Use the consolidated githubService.fetchRepositoryCommits
      const commits = await githubService.fetchRepositoryCommits(
        owner,
        repoName,
        githubAccessToken, // Pass the user's access token
        sinceDate,
        branch
      );

      if (!commits || commits.length === 0) {
        return { workLog: 'No commits found for the selected repository or timeframe.', rawCommits: [] };
      }

      const workLogContent = await aiService.generateWorkLogSummary(commits);

      return { workLog: workLogContent, rawCommits: commits };
    } catch (error) {
      console.error("Error generating work log:", error);
      return rejectWithValue(error.message || 'Failed to generate work log.');
    }
  }
);


// Slice Definition
const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    openWizard: (state) => {
    state.isWizardOpen = true;

      state.currentStep = 1;
      state.selectedRepo = null;
      state.projectFormFields = initialState.projectFormFields;
      state.alxProjectsDetected = [];
      state.selectedALXProject = null;
      state.workLogContent = '';
      state.rawCommits = [];
      state.error = null;
      state.status = 'idle';
    },
    closeWizard: (state) => {
      // Reset all state to initial when closing
      Object.assign(state, initialState);
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    selectRepo: (state, action) => {
      state.selectedRepo = action.payload;
      // Optionally pre-fill some form fields here if selecting from fetched repos
      state.projectFormFields.github_id = action.payload.id;
      state.projectFormFields.title = action.payload.name;
      state.projectFormFields.description = action.payload.description;
      state.projectFormFields.github_url = action.payload.html_url;
      state.projectFormFields.is_public = action.payload.is_public; // Should come from is_private in githubService
      state.projectFormFields.category = action.payload.suggested_category || 'Uncategorized'; // Will be refined by ALX detection
      state.projectFormFields.technologies = action.payload.suggested_technologies || [action.payload.language].filter(Boolean); // Will be refined
      state.projectFormFields.difficulty = action.payload.suggested_difficulty || 'Intermediate'; // Will be refined
      state.projectFormFields.start_date = action.payload.created_at ? new Date(action.payload.created_at).toISOString().split('T')[0] : null;
      state.projectFormFields.end_date = action.payload.updated_at ? new Date(action.payload.updated_at).toISOString().split('T')[0] : null;

      // Reset AI content if a new repo is selected
      state.projectFormFields.ai_summary = '';
      state.projectFormFields.ai_work_log = '';
      state.projectFormFields.ai_last_updated = null;
      state.rawCommits = [];
    },
    setProjectFormFields: (state, action) => {
      state.projectFormFields = { ...state.projectFormFields, ...action.payload };
    },
    setALXProjectsDetected: (state, action) => {
      state.alxProjectsDetected = action.payload;
    },
    selectALXProject: (state, action) => {
      state.selectedALXProject = action.payload;
      // When an ALX project is specifically selected from detection, update form fields
      state.projectFormFields.github_id = action.payload.github_id;
      state.projectFormFields.title = action.payload.title;
      state.projectFormFields.description = action.payload.description;
      state.projectFormFields.github_url = action.payload.github_url;
      state.projectFormFields.is_public = action.payload.is_public;
      state.projectFormFields.is_alx_project = action.payload.is_alx_project;
      state.projectFormFields.category = action.payload.suggested_category;
      state.projectFormFields.technologies = action.payload.suggested_technologies;
      state.projectFormFields.difficulty = action.payload.suggested_difficulty;
      state.projectFormFields.ai_summary = action.payload.ai_summary;
      state.projectFormFields.ai_last_updated = new Date().toISOString(); // Update timestamp
      // Also potentially update start/end dates if available in the ALX detection result
      state.projectFormFields.start_date = action.payload.created_at ? new Date(action.payload.created_at).toISOString().split('T')[0] : null;
      state.projectFormFields.end_date = action.payload.updated_at ? new Date(action.payload.updated_at).toISOString().split('T')[0] : null;
    },
    setWorkLogContent: (state, action) => {
      state.workLogContent = action.payload;
      state.projectFormFields.ai_work_log = action.payload; // Update work log in form fields too
    },
    setRawCommits: (state, action) => {
      state.rawCommits = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addManualRepo: (state, action) => { // New reducer for manual repo
      state.repos.unshift(action.payload); // Add to the beginning of the list
    },
    setSocialPosts: (state, action) => { // <--- ADD THIS NEW REDUCER
      state.socialPosts = action.payload;
      state.projectFormFields.ai_social_posts = action.payload; // Update projectFormFields too
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepos.pending, (state) => {
        state.status = 'loading_repos';
        state.error = null;
        state.repos = []; // Clear previous repos
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.repos = action.payload;
        // After fetching repos, immediately try to detect ALX projects
        // This is handled by a separate dispatch in the component, or could be chained here.
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.repos = [];
      })
      .addCase(detectALXProjects.pending, (state) => {
        state.status = 'loading_alx';
        state.error = null;
        state.alxProjectsDetected = [];
      })
      .addCase(detectALXProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.alxProjectsDetected = action.payload;
      })
      .addCase(detectALXProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.alxProjectsDetected = [];
      })
      .addCase(analyzeRepository.pending, (state) => {
        state.status = 'analyzing_repo';
        state.error = null;
        // Do not clear selectedRepo or projectFormFields here, as they are being populated
      })
      .addCase(analyzeRepository.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // projectFormFields is updated via setProjectFormFields reducer inside the thunk
        // rawCommits is updated via setRawCommits reducer inside the thunk
      })
      .addCase(analyzeRepository.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCommitsAndGenerateWorkLog.pending, (state) => {
        state.status = 'generating_worklog';
        state.error = null;
        state.workLogContent = '';
      })
      .addCase(fetchCommitsAndGenerateWorkLog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.workLogContent = action.payload.workLog;
        state.rawCommits = action.payload.rawCommits;
        // Update the ai_work_log in projectFormFields as well
        state.projectFormFields.ai_work_log = action.payload.workLog;
        state.projectFormFields.ai_last_updated = new Date().toISOString();
      })
      .addCase(fetchCommitsAndGenerateWorkLog.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.workLogContent = 'Failed to generate work log.';
      });
  },
});

// Actions Export
export const {
  openWizard,
  closeWizard,
  setCurrentStep,
  selectRepo,
  setProjectFormFields,
  setALXProjectsDetected,
  selectALXProject,
  setWorkLogContent,
  setRawCommits,
  setStatus,
  setError,
  addManualRepo,
  setSocialPosts,
} = githubSlice.actions;

// Selectors
export const selectGithubState = (state) => state.github;
export const selectRepos = (state) => state.github.repos;
export const selectGithubStatus = (state) => state.github.status;
export const selectGithubError = (state) => state.github.error;
export const selectCurrentStep = (state) => state.github.currentStep;
export const selectSelectedRepo = (state) => state.github.selectedRepo;
export const selectProjectFormFields = (state) => state.github.projectFormFields;
export const selectALXProjectsDetected = (state) => state.github.alxProjectsDetected;
export const selectSelectedALXProject = (state) => state.github.selectedALXProject;
export const selectWorkLogContent = (state) => state.github.workLogContent;
export const selectRawCommits = (state) => state.github.rawCommits;
export const selectSocialPosts = (state) => state.github.socialPosts; 



// Export the slice reducer
export default githubSlice.reducer;