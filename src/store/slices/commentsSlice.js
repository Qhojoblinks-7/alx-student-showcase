// Comments Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CommentsService } from '../../lib/comments-service.js';

// Initial state
const initialState = {
  comments: [],
  currentProjectComments: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  }
};

// Async thunks
export const fetchProjectComments = createAsyncThunk(
  'comments/fetchProjectComments',
  async ({ projectId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const result = await CommentsService.getProjectComments(projectId, page, limit);
      return { ...result, projectId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ projectId, userId, content }, { rejectWithValue, dispatch }) => {
    try {
      const comment = await CommentsService.addComment(projectId, userId, content);
      
      // Refresh comments for the project
      dispatch(fetchProjectComments({ projectId, page: 1, limit: 10 }));
      
      return comment;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, userId, content }, { rejectWithValue, dispatch, getState }) => {
    try {
      const comment = await CommentsService.updateComment(commentId, userId, content);
      
      // Update the comment in the current project comments
      const state = getState();
      const currentComments = state.comments.currentProjectComments;
      const updatedComments = currentComments.map(c => 
        c._id === commentId ? comment : c
      );
      
      dispatch(commentsSlice.actions.setCurrentProjectComments(updatedComments));
      
      return comment;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ commentId, userId }, { rejectWithValue, dispatch, getState }) => {
    try {
      await CommentsService.deleteComment(commentId, userId);
      
      // Remove the comment from the current project comments
      const state = getState();
      const currentComments = state.comments.currentProjectComments;
      const updatedComments = currentComments.filter(c => c._id !== commentId);
      
      dispatch(commentsSlice.actions.setCurrentProjectComments(updatedComments));
      
      return commentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async ({ commentId, userId }, { rejectWithValue, dispatch, getState }) => {
    try {
      const result = await CommentsService.likeComment(commentId, userId);
      
      // Update the comment in the current project comments
      const state = getState();
      const currentComments = state.comments.currentProjectComments;
      const updatedComments = currentComments.map(c => {
        if (c._id === commentId) {
          if (result.liked) {
            return { ...c, likes: [...c.likes, userId] };
          } else {
            return { ...c, likes: c.likes.filter(id => id !== userId) };
          }
        }
        return c;
      });
      
      dispatch(commentsSlice.actions.setCurrentProjectComments(updatedComments));
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserComments = createAsyncThunk(
  'comments/getUserComments',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const result = await CommentsService.getUserComments(userId, page, limit);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchComments = createAsyncThunk(
  'comments/searchComments',
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const comments = await CommentsService.searchComments(query, filters);
      return comments;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCommentStats = createAsyncThunk(
  'comments/getCommentStats',
  async (projectId, { rejectWithValue }) => {
    try {
      const stats = await CommentsService.getCommentStats(projectId);
      return { projectId, stats };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addReply = createAsyncThunk(
  'comments/addReply',
  async ({ parentCommentId, userId, content }, { rejectWithValue, dispatch, getState }) => {
    try {
      const reply = await CommentsService.addReply(parentCommentId, userId, content);
      
      // Refresh comments for the project
      const state = getState();
      const currentProject = state.comments.currentProjectComments[0]?.projectId;
      if (currentProject) {
        dispatch(fetchProjectComments({ projectId: currentProject, page: 1, limit: 10 }));
      }
      
      return reply;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reportComment = createAsyncThunk(
  'comments/reportComment',
  async ({ commentId, userId, reason }, { rejectWithValue }) => {
    try {
      const result = await CommentsService.reportComment(commentId, userId, reason);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice definition
const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setCurrentProjectComments: (state, action) => {
      state.currentProjectComments = action.payload;
    },
    clearComments: (state) => {
      state.comments = [];
      state.currentProjectComments = [];
      state.pagination = initialState.pagination;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addCommentLocally: (state, action) => {
      state.currentProjectComments.unshift(action.payload);
    },
    updateCommentLocally: (state, action) => {
      const index = state.currentProjectComments.findIndex(
        comment => comment._id === action.payload._id
      );
      if (index !== -1) {
        state.currentProjectComments[index] = action.payload;
      }
    },
    removeCommentLocally: (state, action) => {
      state.currentProjectComments = state.currentProjectComments.filter(
        comment => comment._id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project comments
      .addCase(fetchProjectComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProjectComments = action.payload.comments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjectComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add comment
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Comment will be added by the fetchProjectComments call
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Comment will be updated by the reducer
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Comment will be removed by the reducer
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Like comment
      .addCase(likeComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Comment will be updated by the reducer
      })
      .addCase(likeComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user comments
      .addCase(getUserComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload.comments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search comments
      .addCase(searchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(searchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get comment stats
      .addCase(getCommentStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCommentStats.fulfilled, (state, action) => {
        state.isLoading = false;
        // Stats can be stored in a separate field if needed
      })
      .addCase(getCommentStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add reply
      .addCase(addReply.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        state.isLoading = false;
        // Reply will be added by the fetchProjectComments call
      })
      .addCase(addReply.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Report comment
      .addCase(reportComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reportComment.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(reportComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  setCurrentProjectComments,
  clearComments,
  setError,
  clearError,
  addCommentLocally,
  updateCommentLocally,
  removeCommentLocally
} = commentsSlice.actions;

// Export reducer
export default commentsSlice.reducer;

// Selectors
export const selectComments = (state) => state.comments.comments;
export const selectCurrentProjectComments = (state) => state.comments.currentProjectComments;
export const selectCommentsLoading = (state) => state.comments.isLoading;
export const selectCommentsError = (state) => state.comments.error;
export const selectCommentsPagination = (state) => state.comments.pagination;