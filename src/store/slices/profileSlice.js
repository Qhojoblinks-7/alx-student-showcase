// src/store/slices/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCollection } from '../../lib/mongodb';
import { createSelector } from 'reselect';

import { aiService } from '../../components/service/ai-service';

import {
  selectAllProjects, // This import is now safe as projectsSlice no longer imports from profileSlice
  updateProjectLocally,
  updateProject as updateProjectInDB,
} from './projectsSlice';


// --- Initial State ---
const initialState = {
  userProfile: null,
  isLoading: false,
  error: null,
  isUpdating: false, // For general profile updates, including avatar uploads
  isGeneratingAI: false, // For AI insights regeneration (portfolio-level)
};

// --- Async Thunks (createAsyncThunk) ---

/**
 * Fetches a user's profile from Supabase.
 * @param {string} userId - The ID of the user whose profile to fetch.
 */
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(profileSlice.actions.setLoading(true));
      dispatch(profileSlice.actions.setError(null));

      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ _id: userId });

      if (!user) {
        dispatch(profileSlice.actions.setUserProfile(null));
        return null;
      }

      // Remove password from user data
      const { password, ...userProfile } = user;
      dispatch(profileSlice.actions.setUserProfile(userProfile));
      return userProfile;
    } catch (error) {
      console.error("Fetch profile error:", error.message);
      dispatch(profileSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(profileSlice.actions.setLoading(false));
    }
  }
);

export const freshUserProfile = createAsyncThunk(
  'profile/freshUserProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(profileSlice.actions.setLoading(true));
      dispatch(profileSlice.actions.setError(null));
        dispatch(profileSlice.actions.setUserProfile(null));
        return null;
    } catch (error) {
        console.error("Fresh profile error:", error.message);
        dispatch(profileSlice.actions.setError(error.message));
        return rejectWithValue(error.message);
    } finally {
        dispatch(profileSlice.actions.setLoading(false));
    }
  }
);

/**
 * Updates a user's profile in Supabase. If profile doesn't exist, it inserts.
 * @param {object} profileData - The profile data to update/insert. Must include 'id' (which is the user's Supabase ID).
 */
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(profileSlice.actions.setIsUpdating(true));
      dispatch(profileSlice.actions.setError(null));

      const usersCollection = await getCollection('users');
      
      // Remove sensitive fields that shouldn't be updated
      const { password, _id, ...updateData } = profileData;
      
      const result = await usersCollection.updateOne(
        { _id: profileData.id },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        throw new Error('User not found.');
      }

      const updatedUser = await usersCollection.findOne({ _id: profileData.id });
      const { password: _, ...userProfile } = updatedUser;
      
      dispatch(profileSlice.actions.setUserProfile(userProfile));
      return userProfile;
    } catch (error) {
      console.error("Update profile error:", error.message);
      dispatch(profileSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(profileSlice.actions.setIsUpdating(false));
    }
  }
);

/**
 * Uploads an avatar file to Supabase storage and updates the user's profile with the new avatar_url.
 * @param {{userId: string, file: File, bucket: string}} params - Object containing userId, file, and bucket name.
 */
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async ({ userId, file, bucket = 'avatars' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(profileSlice.actions.setIsUpdating(true));
      dispatch(profileSlice.actions.setError(null));

      if (!userId || !file) {
        throw new Error('User ID and avatar file are required for upload.');
      }

      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Failed to upload avatar to storage.');
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error('Failed to get public URL for the uploaded avatar.');
      }

      const avatarUrl = publicUrlData.publicUrl;

      const updatedProfile = await dispatch(updateUserProfile({
        id: userId,
        avatar_url: avatarUrl
      })).unwrap();

      return updatedProfile.avatar_url;
    } catch (error) {
      console.error("Upload avatar error:", error.message);
      dispatch(profileSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(profileSlice.actions.setIsUpdating(false));
    }
  }
);


/**
 * Triggers AI to regenerate portfolio summary, recommendations, and skill gaps.
 * @param {string} userId - The ID of the user for whom to regenerate insights.
 */
export const regeneratePortfolioInsights = createAsyncThunk(
  'profile/regeneratePortfolioInsights',
  async (userId, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(profileSlice.actions.setIsGeneratingAI(true));
      dispatch(profileSlice.actions.setError(null));

      let currentProfile = getState().profile.userProfile;
      if (!currentProfile || currentProfile.id !== userId) {
        const fetchedProfileResult = await dispatch(fetchUserProfile(userId)).unwrap();
        if (!fetchedProfileResult) {
          throw new Error("User profile not found. Cannot generate insights. Please ensure user profile exists.");
        }
        currentProfile = fetchedProfileResult;
      }

      const projects = selectAllProjects(getState());

      if (!projects || projects.length === 0) {
        console.warn("No projects found for AI insights. Recommendations/gaps might be limited.");
      }

      const aiPortfolioSummary = await aiService.generateUserPortfolioSummary(currentProfile, projects);
      const aiProjectRecommendations = await aiService.getProjectRecommendations(currentProfile.skills || [], currentProfile.bio || '', projects);
      const aiSkillGaps = await aiService.getSkillGaps(currentProfile.skills || [], currentProfile.bio || '', projects);

      const updatedProfileData = {
        ...currentProfile,
        ai_portfolio_summary: aiPortfolioSummary,
        ai_project_recommendations: aiProjectRecommendations,
        ai_skill_gaps: aiSkillGaps,
        ai_last_updated: new Date().toISOString(),
      };

      await dispatch(updateUserProfile(updatedProfileData)).unwrap();

      return { aiPortfolioSummary, aiProjectRecommendations, aiSkillGaps };
    } catch (error) {
      console.error("Regenerate portfolio insights error:", error.message);
      dispatch(profileSlice.actions.setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(profileSlice.actions.setIsGeneratingAI(false));
    }
  }
);

/**
 * Triggers AI to regenerate ai_summary and ai_work_log for a specific project.
 * @param {object} params - Object containing project ID and optional raw commits.
 * @param {string} params.projectId - The ID of the project to update.
 * @param {Array<object>} [params.rawCommits=[]] - Optional: raw commit data if available for work log generation.
 */
export const triggerAIProjectContent = createAsyncThunk(
  'profile/triggerAIProjectContent',
  async ({ projectId, rawCommits = [] }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projects = selectAllProjects(state);
      const targetProject = projects.find(p => p.id === projectId);

      if (!targetProject) {
        throw new Error(`Project with ID ${projectId} not found.`);
      }

      const aiSummary = await aiService.generateProjectSummary({
        title: targetProject.title,
        description: targetProject.description,
        technologies: targetProject.technologies,
        key_learnings: targetProject.key_learnings,
        challenges_faced: targetProject.challenges_faced,
      });

      let aiWorkLog = '';
      if (rawCommits && rawCommits.length > 0) {
        aiWorkLog = await aiService.generateWorkLogSummary(rawCommits);
      } else {
        aiWorkLog = "No recent commit data available to generate a detailed work log.";
      }

      const updatedProjectData = {
        id: projectId,
        ai_summary: aiSummary,
        ai_work_log: aiWorkLog,
        ai_last_updated: new Date().toISOString(),
      };

      dispatch(updateProjectLocally(updatedProjectData));

      await dispatch(
        updateProjectInDB({ id: projectId, projectData: {
          ai_summary: updatedProjectData.ai_summary,
          ai_work_log: updatedProjectData.ai_work_log,
          ai_last_updated: updatedProjectData.ai_last_updated,
        }})
      ).unwrap();

      return updatedProjectData;
    } catch (error) {
      console.error("Trigger AI project content error:", error.message);
      dispatch(profileSlice.actions.setError(`Failed to generate AI content for project: ${error.message}`));
      return rejectWithValue(error.message);
    } finally {
      // Any final loading state updates would go here
    }
  }
);


// --- ADD THIS NEW THUNK TO profileSlice.js ---
/**
 * Clears error and status flags related to profile operations (updating, AI generation).
 */
export const clearProfileStatus = createAsyncThunk(
    'profile/clearProfileStatus',
    async (_, { dispatch }) => {
        dispatch(profileSlice.actions.setError(null));
        dispatch(profileSlice.actions.setIsUpdating(false));
        dispatch(profileSlice.actions.setIsGeneratingAI(false));
    }
);


// --- Slice Definition ---

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsUpdating: (state, action) => {
      state.isUpdating = action.payload;
    },
    setIsGeneratingAI: (state, action) => {
      state.isGeneratingAI = action.payload;
    },
  },
});

// --- Actions Export ---
export const {
  setUserProfile,
  setLoading,
  setError,
  setIsUpdating,
  setIsGeneratingAI,
} = profileSlice.actions;

// --- Selectors ---
const selectProfileState = (state) => state.profile;

export const selectUserProfile = createSelector(
  [selectProfileState],
  (profileState) => profileState.userProfile
);

export const selectProfileLoading = createSelector(
  [selectProfileState],
  (profileState) => profileState.isLoading
);

export const selectProfileError = createSelector(
  [selectProfileState],
  (profileState) => profileState.error
);

export const selectProfileIsUpdating = createSelector(
  [selectProfileState],
  (profileState) => profileState.isUpdating
);

export const selectProfileIsGeneratingAI = createSelector(
  [selectProfileState],
  (profileState) => profileState.isGeneratingAI
);

export const selectUserBadges = createSelector(
  [selectUserProfile],
  (userProfile) => userProfile?.badges || null
);

export const selectGeneratingInsights = createSelector(
  (state) => state.profile.isGeneratingAI,
  (isGeneratingAI) => isGeneratingAI
);

export const selectUploadingAvatar = createSelector(
  (state) => state.profile.isUpdating,
  (isUpdating) => isUpdating
);

export const selectUserProfileError = createSelector(
  (state) => state.profile.error,
  (error) => error
);

export const selectUserProfileLoading = createSelector(
  (state) => state.profile.isLoading,
  (isLoading) => isLoading
);

export const selectUserProjects = createSelector(
  [selectUserProfile, selectAllProjects],
  (userProfile, allProjects) => {
    if (!userProfile || !allProjects) {
      return [];
    }
    return allProjects.filter(project => project.user_id === userProfile.id);
  }
);


// --- Export the slice reducer ---
export default profileSlice.reducer;