import { MongoClient } from 'mongodb';

// FREE VERSION - Use MongoDB Atlas Free Tier
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
    // FREE VERSION - Simplified connection for free tier
    client = new MongoClient(MONGODB_URI, {
      // Remove replica set requirement for free tier
      // Most free tiers don't support replica sets
      maxPoolSize: 10, // Limit connections for free tier
      serverSelectionTimeoutMS: 5000, // Faster timeout
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✅ Connected to MongoDB successfully (FREE VERSION)');
    console.log('📊 Database:', DB_NAME);
    console.log('🔗 Connection:', MONGODB_URI.includes('localhost') ? 'Local' : 'Atlas');
    
    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.log('💡 FREE TIER SETUP TIPS:');
    console.log('   1. Use MongoDB Atlas Free Tier (512MB)');
    console.log('   2. Or use local MongoDB installation');
    console.log('   3. Check your connection string');
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

// Database collections
export const getCollection = async (collectionName) => {
  const database = await getDatabase();
  return database.collection(collectionName);
};

// FREE VERSION - Simplified real-time subscription with polling
export const subscribeToProjectChanges = (onUpdate) => {
  console.log('🔄 Setting up project change subscription (FREE VERSION - Polling)');
  
  const interval = setInterval(async () => {
    try {
      const projectsCollection = await getCollection('projects');
      const recentProjects = await projectsCollection
        .find({ updatedAt: { $gte: new Date(Date.now() - 5000) } })
        .toArray();
      
      recentProjects.forEach(project => {
        onUpdate({ type: 'update', data: project });
      });
    } catch (error) {
      console.error('Error polling for project changes:', error);
    }
  }, 5000); // Poll every 5 seconds

  return {
    unsubscribe: () => {
      clearInterval(interval);
      console.log('🔄 Project change subscription stopped');
    }
  };
};

// FREE VERSION - Simplified user change subscription
export const subscribeToUserChanges = (userId, onUpdate) => {
  console.log('🔄 Setting up user change subscription (FREE VERSION - Polling)');
  
  const interval = setInterval(async () => {
    try {
      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ 
        _id: userId,
        updatedAt: { $gte: new Date(Date.now() - 5000) }
      });
      
      if (user) {
        onUpdate({ type: 'update', data: user });
      }
    } catch (error) {
      console.error('Error polling for user changes:', error);
    }
  }, 5000);

  return {
    unsubscribe: () => {
      clearInterval(interval);
      console.log('🔄 User change subscription stopped');
    }
  };
};

// FREE VERSION - Simplified comment change subscription
export const subscribeToCommentChanges = (projectId, onUpdate) => {
  console.log('🔄 Setting up comment change subscription (FREE VERSION - Polling)');
  
  const interval = setInterval(async () => {
    try {
      const commentsCollection = await getCollection('comments');
      const recentComments = await commentsCollection
        .find({ 
          projectId: projectId,
          createdAt: { $gte: new Date(Date.now() - 5000) }
        })
        .toArray();
      
      recentComments.forEach(comment => {
        onUpdate({ type: 'insert', data: comment });
      });
    } catch (error) {
      console.error('Error polling for comment changes:', error);
    }
  }, 5000);

  return {
    unsubscribe: () => {
      clearInterval(interval);
      console.log('🔄 Comment change subscription stopped');
    }
  };
};

// Advanced aggregation functions (FREE VERSION - Optimized for free tier)
export const getProjectStats = async (userId) => {
  try {
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

    return stats[0] || {
      totalProjects: 0,
      publicProjects: 0,
      totalViews: 0,
      totalLikes: 0,
      avgViews: 0
    };
  } catch (error) {
    console.error('Error getting project stats:', error);
    throw error;
  }
};

export const getTechnologyStats = async (userId) => {
  try {
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
      { $sort: { count: -1 } }
    ]).toArray();

    return techStats;
  } catch (error) {
    console.error('Error getting technology stats:', error);
    throw error;
  }
};

export const getProjectTimeline = async (userId) => {
  try {
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
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();

    return timeline;
  } catch (error) {
    console.error('Error getting project timeline:', error);
    throw error;
  }
};

// FREE VERSION - Simplified search functionality
export const searchProjects = async (query, filters = {}) => {
  try {
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
    
    return projects;
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
};

// Backup and restore functionality (FREE VERSION)
export const backupProjectData = async (projectData) => {
  try {
    const backupsCollection = await getCollection('project_backups');
    const result = await backupsCollection.insertOne({
      ...projectData,
      createdAt: new Date(),
      backupType: 'manual'
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
    const { _id, createdAt, backupType, ...projectData } = backup;
    
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

// Badge system (FREE VERSION)
export const fetchUserBadges = async (userId) => {
  try {
    const badgesCollection = await getCollection('badges');
    const badges = await badgesCollection
      .find({ userId: userId })
      .sort({ awardedAt: -1 })
      .toArray();
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
    return result;
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
};

// Notification system (FREE VERSION)
export const createNotification = async (notification) => {
  try {
    const notificationsCollection = await getCollection('notifications');
    const result = await notificationsCollection.insertOne({
      ...notification,
      createdAt: new Date(),
      isRead: false
    });
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
  try {
    const notificationsCollection = await getCollection('notifications');
    const notifications = await notificationsCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Follow system (FREE VERSION)
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
  try {
    const followersCollection = await getCollection('followers');
    const followers = await followersCollection
      .find({ followingId: userId })
      .toArray();
    return followers;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

export const getFollowing = async (userId) => {
  try {
    const followersCollection = await getCollection('followers');
    const following = await followersCollection
      .find({ followerId: userId })
      .toArray();
    return following;
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};

// FREE TIER SETUP GUIDE
export const showFreeTierSetupGuide = () => {
  console.log(`
=== FREE TIER SETUP GUIDE ===

🎯 MONGODB ATLAS FREE TIER (RECOMMENDED):
1. Go to mongodb.com/atlas
2. Create free account
3. Create new cluster (FREE tier - 512MB)
4. Get connection string
5. Add to .env.local:
   VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alx-showcase

🔧 LOCAL MONGODB (ALTERNATIVE):
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string:
   VITE_MONGODB_URI=mongodb://localhost:27017

📧 FREE EMAIL SERVICES:
1. Gmail SMTP (personal use)
2. Mailgun (5,000 emails/month)
3. SendGrid (100 emails/day)
4. Resend (3,000 emails/month)

💾 FREE STORAGE:
1. Cloudinary (25GB free)
2. Firebase Storage (5GB free)
3. AWS S3 (5GB free tier)

🚀 FREE HOSTING:
1. Vercel (unlimited)
2. Netlify (unlimited)
3. GitHub Pages (unlimited)

==========================================
  `);
};