// Comments Service - OPTIMIZED FOR 1,800 USERS
import { getCollection } from './mongodb.js';
import { OptimizationService } from './optimization-service.js';

export class CommentsService {
  static async createComment(commentData) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`comment_${commentData.userId}`, 10, 60000)) { // 10 per minute
        throw new Error('Too many comments. Please wait before posting another.');
      }

      // Optimize comment data
      const optimizedComment = OptimizationService.optimizeCommentData({
        content: commentData.content,
        userId: commentData.userId,
        projectId: commentData.projectId,
        userInfo: commentData.userInfo,
        parentId: commentData.parentId || null,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const commentsCollection = await getCollection('comments');
      const result = await commentsCollection.insertOne(optimizedComment);

      // Clear cache for this project
      OptimizationService.cache.delete(`comments_${commentData.projectId}`);
      OptimizationService.cache.delete(`comment_count_${commentData.projectId}`);

      OptimizationService.trackOperation('create_comment', Date.now() - startTime);
      return { ...optimizedComment, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  static async getComments(projectId, page = 1, limit = 20) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `comments_${projectId}_${page}_${limit}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }

      const commentsCollection = await getCollection('comments');
      const skip = (page - 1) * limit;

      const comments = await commentsCollection
        .find({ projectId: projectId, parentId: null }) // Only top-level comments
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get replies for each comment (limited to 5 per comment)
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await commentsCollection
            .find({ parentId: comment._id.toString() })
            .sort({ createdAt: 1 })
            .limit(5)
            .toArray();
          
          return {
            ...comment,
            replies: replies.map(reply => OptimizationService.optimizeCommentData(reply))
          };
        })
      );

      // Cache for 2 minutes
      OptimizationService.setCache(cacheKey, commentsWithReplies, 2);
      OptimizationService.performanceMetrics.cacheMisses++;

      OptimizationService.trackOperation('get_comments', Date.now() - startTime);
      return commentsWithReplies;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  static async getCommentReplies(commentId, limit = 10) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `replies_${commentId}_${limit}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }

      const commentsCollection = await getCollection('comments');
      const replies = await commentsCollection
        .find({ parentId: commentId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .toArray();

      const optimizedReplies = replies.map(reply => 
        OptimizationService.optimizeCommentData(reply)
      );

      // Cache for 3 minutes
      OptimizationService.setCache(cacheKey, optimizedReplies, 3);
      OptimizationService.performanceMetrics.cacheMisses++;

      OptimizationService.trackOperation('get_replies', Date.now() - startTime);
      return optimizedReplies;
    } catch (error) {
      console.error('Error getting comment replies:', error);
      throw error;
    }
  }

  static async updateComment(commentId, userId, updates) {
    const startTime = Date.now();
    
    try {
      const commentsCollection = await getCollection('comments');
      
      // Check if user owns the comment
      const comment = await commentsCollection.findOne({ _id: commentId, userId: userId });
      if (!comment) {
        throw new Error('Comment not found or you do not have permission to edit it');
      }

      // Optimize update data
      const optimizedUpdates = {
        content: updates.content?.substring(0, 500),
        updatedAt: new Date()
      };

      const result = await commentsCollection.updateOne(
        { _id: commentId },
        { $set: optimizedUpdates }
      );

      // Clear cache
      OptimizationService.cache.delete(`comments_${comment.projectId}`);
      OptimizationService.cache.delete(`comment_${commentId}`);

      OptimizationService.trackOperation('update_comment', Date.now() - startTime);
      return { success: true, message: 'Comment updated successfully' };
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  static async deleteComment(commentId, userId) {
    const startTime = Date.now();
    
    try {
      const commentsCollection = await getCollection('comments');
      
      // Check if user owns the comment
      const comment = await commentsCollection.findOne({ _id: commentId, userId: userId });
      if (!comment) {
        throw new Error('Comment not found or you do not have permission to delete it');
      }

      // Delete comment and all its replies
      await commentsCollection.deleteMany({
        $or: [
          { _id: commentId },
          { parentId: commentId }
        ]
      });

      // Clear cache
      OptimizationService.cache.delete(`comments_${comment.projectId}`);
      OptimizationService.cache.delete(`comment_count_${comment.projectId}`);

      OptimizationService.trackOperation('delete_comment', Date.now() - startTime);
      return { success: true, message: 'Comment deleted successfully' };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  static async likeComment(commentId, userId) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`like_${userId}`, 20, 60000)) { // 20 likes per minute
        throw new Error('Too many likes. Please wait before liking more comments.');
      }

      const commentsCollection = await getCollection('comments');
      
      // Check if already liked
      const comment = await commentsCollection.findOne({ _id: commentId });
      if (!comment) {
        throw new Error('Comment not found');
      }

      const isLiked = comment.likes?.includes(userId);
      
      if (isLiked) {
        // Unlike
        await commentsCollection.updateOne(
          { _id: commentId },
          { $pull: { likes: userId } }
        );
      } else {
        // Like
        await commentsCollection.updateOne(
          { _id: commentId },
          { $addToSet: { likes: userId } }
        );
      }

      // Clear cache
      OptimizationService.cache.delete(`comments_${comment.projectId}`);

      OptimizationService.trackOperation('like_comment', Date.now() - startTime);
      return { success: true, liked: !isLiked };
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  static async getCommentStats(projectId) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `comment_stats_${projectId}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }

      const commentsCollection = await getCollection('comments');
      
      const stats = await commentsCollection.aggregate([
        { $match: { projectId: projectId } },
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            totalLikes: { $sum: { $size: '$likes' } },
            topLevelComments: { $sum: { $cond: [{ $eq: ['$parentId', null] }, 1, 0] } },
            replies: { $sum: { $cond: [{ $ne: ['$parentId', null] }, 1, 0] } }
          }
        }
      ]).toArray();

      const result = stats[0] || {
        totalComments: 0,
        totalLikes: 0,
        topLevelComments: 0,
        replies: 0
      };

      // Cache for 5 minutes
      OptimizationService.setCache(cacheKey, result, 5);
      OptimizationService.performanceMetrics.cacheMisses++;

      OptimizationService.trackOperation('comment_stats', Date.now() - startTime);
      return result;
    } catch (error) {
      console.error('Error getting comment stats:', error);
      throw error;
    }
  }

  static async searchComments(query, projectId = null, limit = 20) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `comment_search_${query}_${projectId}_${limit}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }

      const commentsCollection = await getCollection('comments');
      
      let searchQuery = {
        content: { $regex: query, $options: 'i' }
      };

      if (projectId) {
        searchQuery.projectId = projectId;
      }

      const comments = await commentsCollection
        .find(searchQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      const optimizedComments = comments.map(comment => 
        OptimizationService.optimizeCommentData(comment)
      );

      // Cache for 1 minute
      OptimizationService.setCache(cacheKey, optimizedComments, 1);
      OptimizationService.performanceMetrics.cacheMisses++;

      OptimizationService.trackOperation('search_comments', Date.now() - startTime);
      return optimizedComments;
    } catch (error) {
      console.error('Error searching comments:', error);
      throw error;
    }
  }

  static async getUserComments(userId, page = 1, limit = 20) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `user_comments_${userId}_${page}_${limit}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }

      const commentsCollection = await getCollection('comments');
      const skip = (page - 1) * limit;

      const comments = await commentsCollection
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const optimizedComments = comments.map(comment => 
        OptimizationService.optimizeCommentData(comment)
      );

      // Cache for 3 minutes
      OptimizationService.setCache(cacheKey, optimizedComments, 3);
      OptimizationService.performanceMetrics.cacheMisses++;

      OptimizationService.trackOperation('user_comments', Date.now() - startTime);
      return optimizedComments;
    } catch (error) {
      console.error('Error getting user comments:', error);
      throw error;
    }
  }

  static async getPopularComments(projectId, limit = 10) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `popular_comments_${projectId}_${limit}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }

      const commentsCollection = await getCollection('comments');
      
      const popularComments = await commentsCollection
        .find({ projectId: projectId })
        .sort({ 'likes': -1, 'createdAt': -1 })
        .limit(limit)
        .toArray();

      const optimizedComments = popularComments.map(comment => 
        OptimizationService.optimizeCommentData(comment)
      );

      // Cache for 5 minutes
      OptimizationService.setCache(cacheKey, optimizedComments, 5);
      OptimizationService.performanceMetrics.cacheMisses++;

      OptimizationService.trackOperation('popular_comments', Date.now() - startTime);
      return optimizedComments;
    } catch (error) {
      console.error('Error getting popular comments:', error);
      throw error;
    }
  }

  static async reportComment(commentId, userId, reason) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`report_${userId}`, 5, 300000)) { // 5 reports per 5 minutes
        throw new Error('Too many reports. Please wait before reporting more comments.');
      }

      const reportsCollection = await getCollection('comment_reports');
      
      // Check if already reported
      const existingReport = await reportsCollection.findOne({
        commentId: commentId,
        reporterId: userId
      });

      if (existingReport) {
        throw new Error('You have already reported this comment');
      }

      const report = {
        commentId: commentId,
        reporterId: userId,
        reason: reason.substring(0, 200), // Limit reason length
        status: 'pending',
        createdAt: new Date()
      };

      const result = await reportsCollection.insertOne(report);

      OptimizationService.trackOperation('report_comment', Date.now() - startTime);
      return { success: true, message: 'Comment reported successfully' };
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  }

  static async moderateComment(commentId, action, moderatorId) {
    const startTime = Date.now();
    
    try {
      const commentsCollection = await getCollection('comments');
      const reportsCollection = await getCollection('comment_reports');
      
      const comment = await commentsCollection.findOne({ _id: commentId });
      if (!comment) {
        throw new Error('Comment not found');
      }

      switch (action) {
        case 'hide':
          await commentsCollection.updateOne(
            { _id: commentId },
            { $set: { hidden: true, moderatedBy: moderatorId, moderatedAt: new Date() } }
          );
          break;
        case 'delete':
          await commentsCollection.deleteOne({ _id: commentId });
          break;
        case 'approve':
          await commentsCollection.updateOne(
            { _id: commentId },
            { $set: { hidden: false, moderatedBy: moderatorId, moderatedAt: new Date() } }
          );
          break;
        default:
          throw new Error('Invalid moderation action');
      }

      // Update report status
      await reportsCollection.updateMany(
        { commentId: commentId },
        { $set: { status: 'resolved', resolvedBy: moderatorId, resolvedAt: new Date() } }
      );

      // Clear cache
      OptimizationService.cache.delete(`comments_${comment.projectId}`);

      OptimizationService.trackOperation('moderate_comment', Date.now() - startTime);
      return { success: true, message: `Comment ${action}ed successfully` };
    } catch (error) {
      console.error('Error moderating comment:', error);
      throw error;
    }
  }

  static async getCommentReports(status = 'pending', limit = 20) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `reports_${status}_${limit}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }

      const reportsCollection = await getCollection('comment_reports');
      
      const reports = await reportsCollection
        .find({ status: status })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      // Cache for 2 minutes
      OptimizationService.setCache(cacheKey, reports, 2);
      OptimizationService.performanceMetrics.cacheMisses++;

      OptimizationService.trackOperation('get_reports', Date.now() - startTime);
      return reports;
    } catch (error) {
      console.error('Error getting comment reports:', error);
      throw error;
    }
  }

  // Performance monitoring
  static getCommentStats() {
    const performance = OptimizationService.getPerformanceReport();
    return {
      performance,
      cacheStats: {
        size: OptimizationService.cache.size,
        hitRate: performance.cacheHitRate
      },
      rateLimits: OptimizationService.rateLimits.size
    };
  }
}