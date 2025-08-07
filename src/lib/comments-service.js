// Comments Service for project comments and interactions
import { getCollection } from './mongodb.js';
import { createNotification } from './mongodb.js';
import { EmailService } from './email-service.js';

export class CommentsService {
  static async addComment(projectId, userId, content) {
    try {
      const commentsCollection = await getCollection('comments');
      const usersCollection = await getCollection('users');
      const projectsCollection = await getCollection('projects');

      // Get user and project details
      const [user, project] = await Promise.all([
        usersCollection.findOne({ _id: userId }),
        projectsCollection.findOne({ _id: projectId })
      ]);

      if (!user || !project) {
        throw new Error('User or project not found');
      }

      // Create comment
      const comment = {
        content: content.trim(),
        userId: userId,
        projectId: projectId,
        userInfo: {
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        },
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await commentsCollection.insertOne(comment);
      const newComment = { ...comment, _id: result.insertedId };

      // Create notification for project owner (if not the same user)
      if (project.userId !== userId) {
        try {
          await createNotification({
            userId: project.userId,
            type: 'comment',
            title: 'New comment on your project',
            message: `${user.fullName} commented on "${project.title}"`,
            data: {
              commentId: result.insertedId,
              projectId: projectId,
              commenterId: userId
            }
          });

          // Send email notification if enabled
          const projectOwner = await usersCollection.findOne({ _id: project.userId });
          if (projectOwner) {
            const preferences = await EmailService.getEmailPreferences(project.userId);
            if (preferences.comments) {
              await EmailService.sendCommentNotification(projectOwner, newComment, project);
            }
          }
        } catch (error) {
          console.error('Error creating comment notification:', error);
        }
      }

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static async getProjectComments(projectId, page = 1, limit = 10) {
    try {
      const commentsCollection = await getCollection('comments');
      
      const skip = (page - 1) * limit;
      
      const comments = await commentsCollection
        .find({ projectId: projectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalComments = await commentsCollection.countDocuments({ projectId: projectId });

      return {
        comments,
        pagination: {
          page,
          limit,
          total: totalComments,
          pages: Math.ceil(totalComments / limit),
          hasNext: page * limit < totalComments,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting project comments:', error);
      throw error;
    }
  }

  static async updateComment(commentId, userId, content) {
    try {
      const commentsCollection = await getCollection('comments');
      
      // Check if comment exists and belongs to user
      const comment = await commentsCollection.findOne({ _id: commentId, userId: userId });
      if (!comment) {
        throw new Error('Comment not found or you do not have permission to edit it');
      }

      // Update comment
      const result = await commentsCollection.updateOne(
        { _id: commentId },
        {
          $set: {
            content: content.trim(),
            updatedAt: new Date(),
            edited: true
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('Comment not found');
      }

      // Return updated comment
      const updatedComment = await commentsCollection.findOne({ _id: commentId });
      return updatedComment;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  static async deleteComment(commentId, userId) {
    try {
      const commentsCollection = await getCollection('comments');
      
      // Check if comment exists and belongs to user
      const comment = await commentsCollection.findOne({ _id: commentId, userId: userId });
      if (!comment) {
        throw new Error('Comment not found or you do not have permission to delete it');
      }

      const result = await commentsCollection.deleteOne({ _id: commentId });
      
      if (result.deletedCount === 0) {
        throw new Error('Comment not found');
      }

      return { success: true, message: 'Comment deleted successfully' };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  static async likeComment(commentId, userId) {
    try {
      const commentsCollection = await getCollection('comments');
      
      // Check if comment exists
      const comment = await commentsCollection.findOne({ _id: commentId });
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if user already liked the comment
      const alreadyLiked = comment.likes.includes(userId);
      
      if (alreadyLiked) {
        // Unlike comment
        await commentsCollection.updateOne(
          { _id: commentId },
          { $pull: { likes: userId } }
        );
        return { liked: false, message: 'Comment unliked' };
      } else {
        // Like comment
        await commentsCollection.updateOne(
          { _id: commentId },
          { $push: { likes: userId } }
        );

        // Create notification for comment author (if not the same user)
        if (comment.userId !== userId) {
          try {
            await createNotification({
              userId: comment.userId,
              type: 'comment_like',
              title: 'Someone liked your comment',
              message: 'Your comment received a like',
              data: {
                commentId: commentId,
                likerId: userId
              }
            });
          } catch (error) {
            console.error('Error creating like notification:', error);
          }
        }

        return { liked: true, message: 'Comment liked' };
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  static async getUserComments(userId, page = 1, limit = 10) {
    try {
      const commentsCollection = await getCollection('comments');
      
      const skip = (page - 1) * limit;
      
      const comments = await commentsCollection
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalComments = await commentsCollection.countDocuments({ userId: userId });

      return {
        comments,
        pagination: {
          page,
          limit,
          total: totalComments,
          pages: Math.ceil(totalComments / limit),
          hasNext: page * limit < totalComments,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting user comments:', error);
      throw error;
    }
  }

  static async getCommentStats(projectId) {
    try {
      const commentsCollection = await getCollection('comments');
      
      const stats = await commentsCollection.aggregate([
        { $match: { projectId: projectId } },
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            totalLikes: { $sum: { $size: '$likes' } },
            uniqueCommenters: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            _id: 0,
            totalComments: 1,
            totalLikes: 1,
            uniqueCommenters: { $size: '$uniqueCommenters' }
          }
        }
      ]).toArray();

      return stats[0] || {
        totalComments: 0,
        totalLikes: 0,
        uniqueCommenters: 0
      };
    } catch (error) {
      console.error('Error getting comment stats:', error);
      throw error;
    }
  }

  static async searchComments(query, filters = {}) {
    try {
      const commentsCollection = await getCollection('comments');
      
      let searchQuery = {};
      
      // Text search
      if (query) {
        searchQuery.content = { $regex: query, $options: 'i' };
      }
      
      // Apply filters
      if (filters.projectId) {
        searchQuery.projectId = filters.projectId;
      }
      if (filters.userId) {
        searchQuery.userId = filters.userId;
      }
      if (filters.dateFrom) {
        searchQuery.createdAt = { $gte: new Date(filters.dateFrom) };
      }
      if (filters.dateTo) {
        if (searchQuery.createdAt) {
          searchQuery.createdAt.$lte = new Date(filters.dateTo);
        } else {
          searchQuery.createdAt = { $lte: new Date(filters.dateTo) };
        }
      }

      const comments = await commentsCollection
        .find(searchQuery)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50)
        .toArray();

      return comments;
    } catch (error) {
      console.error('Error searching comments:', error);
      throw error;
    }
  }

  static async getRecentComments(limit = 10) {
    try {
      const commentsCollection = await getCollection('comments');
      
      const comments = await commentsCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return comments;
    } catch (error) {
      console.error('Error getting recent comments:', error);
      throw error;
    }
  }

  static async getCommentReplies(commentId) {
    try {
      const commentsCollection = await getCollection('comments');
      
      const replies = await commentsCollection
        .find({ parentCommentId: commentId })
        .sort({ createdAt: 1 })
        .toArray();

      return replies;
    } catch (error) {
      console.error('Error getting comment replies:', error);
      throw error;
    }
  }

  static async addReply(parentCommentId, userId, content) {
    try {
      const commentsCollection = await getCollection('comments');
      const usersCollection = await getCollection('users');

      // Check if parent comment exists
      const parentComment = await commentsCollection.findOne({ _id: parentCommentId });
      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      // Get user details
      const user = await usersCollection.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Create reply
      const reply = {
        content: content.trim(),
        userId: userId,
        projectId: parentComment.projectId,
        parentCommentId: parentCommentId,
        userInfo: {
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        },
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await commentsCollection.insertOne(reply);
      const newReply = { ...reply, _id: result.insertedId };

      // Create notification for parent comment author
      if (parentComment.userId !== userId) {
        try {
          await createNotification({
            userId: parentComment.userId,
            type: 'comment_reply',
            title: 'Reply to your comment',
            message: `${user.fullName} replied to your comment`,
            data: {
              commentId: result.insertedId,
              parentCommentId: parentCommentId,
              replierId: userId
            }
          });
        } catch (error) {
          console.error('Error creating reply notification:', error);
        }
      }

      return newReply;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }

  static async reportComment(commentId, userId, reason) {
    try {
      const reportsCollection = await getCollection('comment_reports');
      
      // Check if user already reported this comment
      const existingReport = await reportsCollection.findOne({
        commentId: commentId,
        reporterId: userId
      });

      if (existingReport) {
        throw new Error('You have already reported this comment');
      }

      // Create report
      const report = {
        commentId: commentId,
        reporterId: userId,
        reason: reason,
        status: 'pending',
        createdAt: new Date()
      };

      const result = await reportsCollection.insertOne(report);
      
      return { success: true, message: 'Comment reported successfully' };
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  }

  static async moderateComment(commentId, action, moderatorId) {
    try {
      const commentsCollection = await getCollection('comments');
      const reportsCollection = await getCollection('comment_reports');
      
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

      // Update reports status
      await reportsCollection.updateMany(
        { commentId: commentId },
        { $set: { status: 'resolved', resolvedBy: moderatorId, resolvedAt: new Date() } }
      );

      return { success: true, message: `Comment ${action}ed successfully` };
    } catch (error) {
      console.error('Error moderating comment:', error);
      throw error;
    }
  }
}