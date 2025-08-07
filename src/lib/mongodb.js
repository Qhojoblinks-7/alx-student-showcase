import { MongoClient } from 'mongodb';

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
    client = new MongoClient(MONGODB_URI, {
      // Enable change streams
      replicaSet: 'rs0', // Required for change streams in development
      // For production, use proper replica set configuration
    });
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Fallback to basic connection if replica set is not available
    try {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      console.log('Connected to MongoDB (basic mode)');
      return { client, db };
    } catch (fallbackError) {
      console.error('Failed to connect to MongoDB (fallback):', fallbackError);
      throw fallbackError;
    }
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

// Real-time subscription with MongoDB Change Streams
export const subscribeToProjectChanges = (onUpdate) => {
  const streamKey = 'projects-changes';
  
  // Close existing stream if any
  if (changeStreams.has(streamKey)) {
    changeStreams.get(streamKey).close();
  }

  const setupChangeStream = async () => {
    try {
      const projectsCollection = await getCollection('projects');
      
      // Create change stream for projects collection
      const changeStream = projectsCollection.watch([
        {
          $match: {
            'operationType': { $in: ['insert', 'update', 'delete'] }
          }
        }
      ]);

      changeStream.on('change', (change) => {
        console.log('Project change detected:', change);
        
        switch (change.operationType) {
          case 'insert':
            onUpdate({ type: 'insert', data: change.fullDocument });
            break;
          case 'update':
            onUpdate({ type: 'update', data: change.fullDocument, documentKey: change.documentKey });
            break;
          case 'delete':
            onUpdate({ type: 'delete', documentKey: change.documentKey });
            break;
        }
      });

      changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
        // Fallback to polling if change streams fail
        setTimeout(() => setupChangeStream(), 5000);
      });

      changeStreams.set(streamKey, changeStream);
      
      return {
        unsubscribe: () => {
          if (changeStreams.has(streamKey)) {
            changeStreams.get(streamKey).close();
            changeStreams.delete(streamKey);
          }
        }
      };
    } catch (error) {
      console.error('Failed to setup change stream, falling back to polling:', error);
      return fallbackToPolling(onUpdate);
    }
  };

  return setupChangeStream();
};

// Fallback polling mechanism
const fallbackToPolling = (onUpdate) => {
  console.log('Using polling fallback for real-time updates');
  
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
  }, 5000);

  return {
    unsubscribe: () => clearInterval(interval)
  };
};

// Subscribe to user profile changes
export const subscribeToUserChanges = (userId, onUpdate) => {
  const streamKey = `user-${userId}`;
  
  if (changeStreams.has(streamKey)) {
    changeStreams.get(streamKey).close();
  }

  const setupUserChangeStream = async () => {
    try {
      const usersCollection = await getCollection('users');
      
      const changeStream = usersCollection.watch([
        {
          $match: {
            'operationType': { $in: ['update'] },
            'documentKey._id': userId
          }
        }
      ]);

      changeStream.on('change', (change) => {
        console.log('User change detected:', change);
        onUpdate({ type: 'update', data: change.fullDocument });
      });

      changeStream.on('error', (error) => {
        console.error('User change stream error:', error);
        setTimeout(() => setupUserChangeStream(), 5000);
      });

      changeStreams.set(streamKey, changeStream);
      
      return {
        unsubscribe: () => {
          if (changeStreams.has(streamKey)) {
            changeStreams.get(streamKey).close();
            changeStreams.delete(streamKey);
          }
        }
      };
    } catch (error) {
      console.error('Failed to setup user change stream:', error);
      return { unsubscribe: () => {} };
    }
  };

  return setupUserChangeStream();
};

// Subscribe to comments changes
export const subscribeToCommentChanges = (projectId, onUpdate) => {
  const streamKey = `comments-${projectId}`;
  
  if (changeStreams.has(streamKey)) {
    changeStreams.get(streamKey).close();
  }

  const setupCommentChangeStream = async () => {
    try {
      const commentsCollection = await getCollection('comments');
      
      const changeStream = commentsCollection.watch([
        {
          $match: {
            'operationType': { $in: ['insert', 'update', 'delete'] },
            'fullDocument.projectId': projectId
          }
        }
      ]);

      changeStream.on('change', (change) => {
        console.log('Comment change detected:', change);
        onUpdate({ type: change.operationType, data: change.fullDocument });
      });

      changeStream.on('error', (error) => {
        console.error('Comment change stream error:', error);
        setTimeout(() => setupCommentChangeStream(), 5000);
      });

      changeStreams.set(streamKey, changeStream);
      
      return {
        unsubscribe: () => {
          if (changeStreams.has(streamKey)) {
            changeStreams.get(streamKey).close();
            changeStreams.delete(streamKey);
          }
        }
      };
    } catch (error) {
      console.error('Failed to setup comment change stream:', error);
      return { unsubscribe: () => {} };
    }
  };

  return setupCommentChangeStream();
};

// Advanced aggregation functions
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

// Search functionality with text search
export const searchProjects = async (query, filters = {}) => {
  try {
    const projectsCollection = await getCollection('projects');
    
    let searchQuery = {};
    
    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
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
      .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(filters.limit || 50)
      .toArray();
    
    return projects;
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
};

// Backup and restore functionality
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

// Badge system
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

// Notification system
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

// Follow system
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