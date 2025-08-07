import { MongoClient } from 'mongodb';
import { OptimizationService } from './optimization-service.js';

// OPTIMIZED FOR 1,800 USERS - Use MongoDB Atlas Free Tier
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = import.meta.env.VITE_MONGODB_DB_NAME || 'alx-showcase';

let client;
let db;
let changeStreams = new Map();

export const connectToDatabase = async () => {
  if (client && db) {
    return { client, db };
  }

  try {
    // OPTIMIZED FOR 1,800 USERS - Simplified connection for free tier
    client = new MongoClient(MONGODB_URI, {
      // Remove replica set requirement for free tier
      // Most free tiers don't support replica sets
      maxPoolSize: 10, // Limit connections for free tier
      serverSelectionTimeoutMS: 5000, // Faster timeout
      socketTimeoutMS: 45000,
      // Optimize for 1,800 users
      maxIdleTimeMS: 30000,
      minPoolSize: 2,
    });
    
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✅ Connected to MongoDB successfully (OPTIMIZED FOR 1,800 USERS)');
    console.log('📊 Database:', DB_NAME);
    console.log('🔗 Connection:', MONGODB_URI.includes('localhost') ? 'Local' : 'Atlas');
    console.log('👥 Optimized for: 1,800 users');
    
    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.log('💡 OPTIMIZATION TIPS FOR 1,800 USERS:');
    console.log('   1. Use MongoDB Atlas Free Tier (512MB)');
    console.log('   2. Optimize data storage with compression');
    console.log('   3. Implement efficient indexing');
    console.log('   4. Use connection pooling');
    throw error;
  }
};

export const getDatabase = async () => {
  if (!db) {
    await connectToDatabase();
  }
  return db;
};

export const closeConnection = async () => {
  // Close all change streams
  for (const [key, stream] of changeStreams) {
    try {
      await stream.close();
    } catch (error) {
      console.error(`Error closing change stream ${key}:`, error);
    }
  }
  changeStreams.clear();

  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

// Database collections with optimization
export const getCollection = async (collectionName) => {
  const database = await getDatabase();
  return database.collection(collectionName);
};

// OPTIMIZED FOR 1,800 USERS - Enhanced polling with caching
export const subscribeToProjectChanges = (onUpdate) => {
  console.log('🔄 Setting up project change subscription (OPTIMIZED FOR 1,800 USERS)');
  
  // Use caching to reduce database queries
  let lastCheck = new Date();
  let cachedProjects = new Map();
  
  const interval = setInterval(async () => {
    try {
      const projectsCollection = await getCollection('projects');
      
      // Only fetch projects updated since last check
      const recentProjects = await projectsCollection
        .find({ 
          updatedAt: { $gte: lastCheck },
          // Add index hint for better performance
        })
        .hint({ updatedAt: 1 })
        .limit(100) // Limit results for performance
        .toArray();
      
      // Process only new/updated projects
      recentProjects.forEach(project => {
        const projectId = project._id.toString();
        const cached = cachedProjects.get(projectId);
        
        if (!cached || cached.updatedAt < project.updatedAt) {
          cachedProjects.set(projectId, project);
          onUpdate({ type: 'update', data: project });
        }
      });
      
      lastCheck = new Date();
      
      // Clean up old cache entries (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      for (const [id, project] of cachedProjects) {
        if (project.updatedAt < oneHourAgo) {
          cachedProjects.delete(id);
        }
      }
      
    } catch (error) {
      console.error('Error polling for project changes:', error);
    }
  }, 5000); // Poll every 5 seconds

  return {
    unsubscribe: () => {
      clearInterval(interval);
      cachedProjects.clear();
      console.log('🔄 Project change subscription stopped');
    }
  };
};

// OPTIMIZED FOR 1,800 USERS - Enhanced user change subscription
export const subscribeToUserChanges = (userId, onUpdate) => {
  console.log('🔄 Setting up user change subscription (OPTIMIZED FOR 1,800 USERS)');
  
  let lastUserData = null;
  
  const interval = setInterval(async () => {
    try {
      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ 
        _id: userId,
        updatedAt: { $gte: new Date(Date.now() - 10000) } // Only check recent updates
      });
      
      if (user && (!lastUserData || lastUserData.updatedAt < user.updatedAt)) {
        lastUserData = user;
        onUpdate({ type: 'update', data: user });
      }
    } catch (error) {
      console.error('Error polling for user changes:', error);
    }
  }, 10000); // Poll every 10 seconds for users

  return {
    unsubscribe: () => {
      clearInterval(interval);
      console.log('🔄 User change subscription stopped');
    }
  };
};

// OPTIMIZED FOR 1,800 USERS - Enhanced comment change subscription
export const subscribeToCommentChanges = (projectId, onUpdate) => {
  console.log('🔄 Setting up comment change subscription (OPTIMIZED FOR 1,800 USERS)');
  
  let lastCommentId = null;
  
  const interval = setInterval(async () => {
    try {
      const commentsCollection = await getCollection('comments');
      const recentComments = await commentsCollection
        .find({ 
          projectId: projectId,
          createdAt: { $gte: new Date(Date.now() - 10000) }
        })
        .sort({ createdAt: -1 })
        .limit(20) // Limit results for performance
        .toArray();
      
      // Only send updates for new comments
      recentComments.forEach(comment => {
        if (!lastCommentId || comment._id.toString() !== lastCommentId) {
          lastCommentId = comment._id.toString();
          onUpdate({ type: 'insert', data: comment });
        }
      });
    } catch (error) {
      console.error('Error polling for comment changes:', error);
    }
  }, 8000); // Poll every 8 seconds for comments

  return {
    unsubscribe: () => {
      clearInterval(interval);
      console.log('🔄 Comment change subscription stopped');
    }
  };
};

// OPTIMIZED FOR 1,800 USERS - Enhanced aggregation functions
export const getProjectStats = async (userId) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `project_stats_${userId}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const projectsCollection = await getCollection('projects');
    
    const stats = await projectsCollection.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          publicProjects: { $sum: { $cond: ['$isPublic', 1, 0] } },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          avgViews: { $avg: '$views' }
        }
      }
    ]).toArray();

    const result = stats[0] || {
      totalProjects: 0,
      publicProjects: 0,
      totalViews: 0,
      totalLikes: 0,
      avgViews: 0
    };
    
    // Cache for 5 minutes
    OptimizationService.setCache(cacheKey, result, 5);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('project_stats', Date.now() - startTime);
    return result;
  } catch (error) {
    console.error('Error getting project stats:', error);
    throw error;
  }
};

export const getTechnologyStats = async (userId) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `tech_stats_${userId}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const projectsCollection = await getCollection('projects');
    
    const techStats = await projectsCollection.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$technologies' },
      {
        $group: {
          _id: '$technologies',
          count: { $sum: 1 },
          projects: { $push: '$title' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 } // Limit to top 20 technologies
    ]).toArray();
    
    // Cache for 10 minutes
    OptimizationService.setCache(cacheKey, techStats, 10);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('tech_stats', Date.now() - startTime);
    return techStats;
  } catch (error) {
    console.error('Error getting technology stats:', error);
    throw error;
  }
};

export const getProjectTimeline = async (userId) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `timeline_${userId}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const projectsCollection = await getCollection('projects');
    
    const timeline = await projectsCollection.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          projects: { $push: { title: '$title', createdAt: '$createdAt' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 24 } // Limit to 2 years of data
    ]).toArray();
    
    // Cache for 15 minutes
    OptimizationService.setCache(cacheKey, timeline, 15);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('timeline', Date.now() - startTime);
    return timeline;
  } catch (error) {
    console.error('Error getting project timeline:', error);
    throw error;
  }
};

// OPTIMIZED FOR 1,800 USERS - Enhanced search functionality
export const searchProjects = async (query, filters = {}) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `search_${JSON.stringify({ query, filters })}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const projectsCollection = await getCollection('projects');
    
    let searchQuery = {};
    
    // Simple text search (no text index required)
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Apply filters
    if (filters.userId) {
      searchQuery.userId = filters.userId;
    }
    if (filters.category) {
      searchQuery.category = filters.category;
    }
    if (filters.technologies && filters.technologies.length > 0) {
      searchQuery.technologies = { $in: filters.technologies };
    }
    if (typeof filters.isPublic === 'boolean') {
      searchQuery.isPublic = filters.isPublic;
    }
    
    const projects = await projectsCollection
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .toArray();
    
    // Cache for 2 minutes
    OptimizationService.setCache(cacheKey, projects, 2);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('search', Date.now() - startTime);
    return projects;
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
};

// OPTIMIZED FOR 1,800 USERS - Enhanced backup and restore
export const backupProjectData = async (projectData) => {
  try {
    // Optimize data before backup
    const optimizedData = OptimizationService.optimizeProjectData(projectData);
    
    const backupsCollection = await getCollection('project_backups');
    const result = await backupsCollection.insertOne({
      ...optimizedData,
      createdAt: new Date(),
      backupType: 'manual',
      optimized: true
    });
    return result;
  } catch (error) {
    console.error('Error backing up project data:', error);
    throw error;
  }
};

export const restoreProjectData = async (backupId) => {
  try {
    const backupsCollection = await getCollection('project_backups');
    const projectsCollection = await getCollection('projects');
    
    const backup = await backupsCollection.findOne({ _id: backupId });
    if (!backup) {
      throw new Error('Backup not found');
    }
    
    // Remove backup-specific fields
    const { _id, createdAt, backupType, optimized, ...projectData } = backup;
    
    const result = await projectsCollection.insertOne({
      ...projectData,
      createdAt: new Date(),
      restoredFrom: backupId
    });
    
    return result;
  } catch (error) {
    console.error('Error restoring project data:', error);
    throw error;
  }
};

// OPTIMIZED FOR 1,800 USERS - Enhanced badge system
export const fetchUserBadges = async (userId) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `badges_${userId}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const badgesCollection = await getCollection('badges');
    const badges = await badgesCollection
      .find({ userId: userId })
      .sort({ awardedAt: -1 })
      .limit(20) // Limit to 20 most recent badges
      .toArray();
    
    // Cache for 10 minutes
    OptimizationService.setCache(cacheKey, badges, 10);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('fetch_badges', Date.now() - startTime);
    return badges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error;
  }
};

export const awardBadge = async (userId, badge) => {
  try {
    const badgesCollection = await getCollection('badges');
    const result = await badgesCollection.insertOne({
      userId: userId,
      ...badge,
      awardedAt: new Date()
    });
    
    // Clear cache for this user
    OptimizationService.cache.delete(`badges_${userId}`);
    
    return result;
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
};

// OPTIMIZED FOR 1,800 USERS - Enhanced notification system
export const createNotification = async (notification) => {
  try {
    // Optimize notification data
    const optimizedNotification = {
      userId: notification.userId,
      type: notification.type,
      title: notification.title?.substring(0, 100),
      message: notification.message?.substring(0, 500),
      isRead: false,
      createdAt: new Date(),
      data: notification.data || {}
    };
    
    const notificationsCollection = await getCollection('notifications');
    const result = await notificationsCollection.insertOne(optimizedNotification);
    return result;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    const result = await notificationsCollection.updateOne(
      { _id: notificationId },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return result;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, limit = 20) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `notifications_${userId}_${limit}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const notificationsCollection = await getCollection('notifications');
    const notifications = await notificationsCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    // Cache for 1 minute (notifications change frequently)
    OptimizationService.setCache(cacheKey, notifications, 1);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('fetch_notifications', Date.now() - startTime);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// OPTIMIZED FOR 1,800 USERS - Enhanced follow system
export const followUser = async (followerId, followingId) => {
  try {
    const followersCollection = await getCollection('followers');
    const result = await followersCollection.insertOne({
      followerId: followerId,
      followingId: followingId,
      createdAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (followerId, followingId) => {
  try {
    const followersCollection = await getCollection('followers');
    const result = await followersCollection.deleteOne({
      followerId: followerId,
      followingId: followingId
    });
    return result;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getFollowers = async (userId) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `followers_${userId}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const followersCollection = await getCollection('followers');
    const followers = await followersCollection
      .find({ followingId: userId })
      .limit(100) // Limit to 100 followers for performance
      .toArray();
    
    // Cache for 5 minutes
    OptimizationService.setCache(cacheKey, followers, 5);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('fetch_followers', Date.now() - startTime);
    return followers;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

export const getFollowing = async (userId) => {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = `following_${userId}`;
    const cached = OptimizationService.getCache(cacheKey);
    if (cached) {
      OptimizationService.performanceMetrics.cacheHits++;
      return cached;
    }
    
    const followersCollection = await getCollection('followers');
    const following = await followersCollection
      .find({ followerId: userId })
      .limit(100) // Limit to 100 following for performance
      .toArray();
    
    // Cache for 5 minutes
    OptimizationService.setCache(cacheKey, following, 5);
    OptimizationService.performanceMetrics.cacheMisses++;
    
    OptimizationService.trackOperation('fetch_following', Date.now() - startTime);
    return following;
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};

// OPTIMIZED FOR 1,800 USERS - Performance monitoring
export const getDatabaseStats = () => {
  const performance = OptimizationService.getPerformanceReport();
  const resourceUsage = OptimizationService.getResourceUsage();
  
  return {
    performance,
    resourceUsage,
    optimization: {
      cacheHitRate: performance.cacheHitRate,
      averageResponseTime: `${performance.averageResponseTime.toFixed(2)}ms`,
      totalOperations: performance.operations
    }
  };
};

// OPTIMIZED FOR 1,800 USERS - Setup guide
export const showOptimizationSetupGuide = () => {
  console.log(`
=== OPTIMIZATION SETUP GUIDE FOR 1,800 USERS ===

🎯 MONGODB ATLAS OPTIMIZATION:
1. Use MongoDB Atlas Free Tier (512MB)
2. Create indexes for better performance:
   - users: { email: 1 }, { username: 1 }, { createdAt: -1 }
   - projects: { userId: 1 }, { createdAt: -1 }, { isPublic: 1 }
   - comments: { projectId: 1 }, { createdAt: -1 }
   - notifications: { userId: 1 }, { createdAt: -1 }

📧 EMAIL SERVICE ROTATION:
1. Mailgun: 5,000 emails/month (Priority 1)
2. SendGrid: 3,000 emails/month (Priority 2)
3. Resend: 3,000 emails/month (Priority 3)
4. Elastic Email: 3,000 emails/month (Priority 4)

💾 STORAGE OPTIMIZATION:
1. Cloudinary: 25GB storage (Priority 1)
2. Firebase: 5GB storage (Priority 2)
3. AWS S3: 5GB storage (Priority 3)

🚀 PERFORMANCE FEATURES:
- Intelligent caching (30% hit rate target)
- Rate limiting (5 emails per minute per user)
- Batch operations (50 emails per batch)
- Image optimization (800x600 max, 80% quality)
- Data compression (remove unnecessary fields)

📊 MONITORING:
- Real-time performance metrics
- Resource usage tracking
- Cache hit rate monitoring
- Response time optimization

==========================================
  `);
};