import { MongoClient } from 'mongodb';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = import.meta.env.VITE_MONGODB_DB_NAME || 'alx-showcase';

let client;
let db;

export const connectToDatabase = async () => {
  if (client && db) {
    return { client, db };
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
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

// Real-time subscription simulation (MongoDB doesn't have built-in real-time)
export const subscribeToProjectChanges = (onUpdate) => {
  // For MongoDB, we'll need to implement polling or use MongoDB Change Streams
  // For now, we'll return a mock subscription
  console.log('MongoDB: Real-time subscriptions require Change Streams or polling implementation');
  
  const interval = setInterval(async () => {
    // Poll for changes every 5 seconds
    try {
      const projectsCollection = await getCollection('projects');
      const recentProjects = await projectsCollection
        .find({ updatedAt: { $gte: new Date(Date.now() - 5000) } })
        .toArray();
      
      recentProjects.forEach(project => onUpdate(project));
    } catch (error) {
      console.error('Error polling for project changes:', error);
    }
  }, 5000);

  return {
    unsubscribe: () => clearInterval(interval)
  };
};

export const backupProjectData = async (projectData) => {
  try {
    const backupsCollection = await getCollection('project_backups');
    const result = await backupsCollection.insertOne({
      ...projectData,
      createdAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Error backing up project data:', error);
    throw error;
  }
};

export const fetchUserBadges = async (userId) => {
  try {
    const badgesCollection = await getCollection('badges');
    const badges = await badgesCollection
      .find({ userId: userId })
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