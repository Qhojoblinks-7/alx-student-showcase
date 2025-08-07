// MongoDB Schema for ALX Student Showcase
// This file defines the database structure and indexes

import { getDatabase } from './src/lib/mongodb.js';

export const initializeDatabase = async () => {
  try {
    const db = await getDatabase();
    
    // Create collections with validation
    await createCollections(db);
    
    // Create indexes for better performance
    await createIndexes(db);
    
    console.log('MongoDB database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

const createCollections = async (db) => {
  // Users collection
  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'username', 'createdAt'],
        properties: {
          email: { bsonType: 'string' },
          username: { bsonType: 'string' },
          fullName: { bsonType: 'string' },
          bio: { bsonType: 'string' },
          avatar: { bsonType: 'string' },
          githubUrl: { bsonType: 'string' },
          linkedinUrl: { bsonType: 'string' },
          websiteUrl: { bsonType: 'string' },
          location: { bsonType: 'string' },
          skills: { bsonType: 'array' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          lastLoginAt: { bsonType: 'date' },
          isVerified: { bsonType: 'bool' },
          role: { bsonType: 'string' }
        }
      }
    }
  });

  // Projects collection
  await db.createCollection('projects', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'userId', 'createdAt'],
        properties: {
          title: { bsonType: 'string' },
          description: { bsonType: 'string' },
          userId: { bsonType: 'string' },
          githubUrl: { bsonType: 'string' },
          liveUrl: { bsonType: 'string' },
          technologies: { bsonType: 'array' },
          images: { bsonType: 'array' },
          isPublic: { bsonType: 'bool' },
          likes: { bsonType: 'array' },
          views: { bsonType: 'int' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          status: { bsonType: 'string' },
          category: { bsonType: 'string' }
        }
      }
    }
  });

  // Badges collection
  await db.createCollection('badges', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'type', 'awardedAt'],
        properties: {
          userId: { bsonType: 'string' },
          type: { bsonType: 'string' },
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          icon: { bsonType: 'string' },
          awardedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Project backups collection
  await db.createCollection('project_backups', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['projectId', 'backupData', 'createdAt'],
        properties: {
          projectId: { bsonType: 'string' },
          backupData: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          reason: { bsonType: 'string' }
        }
      }
    }
  });

  // Comments collection
  await db.createCollection('comments', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['content', 'userId', 'projectId', 'createdAt'],
        properties: {
          content: { bsonType: 'string' },
          userId: { bsonType: 'string' },
          projectId: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          likes: { bsonType: 'array' }
        }
      }
    }
  });

  // Followers collection
  await db.createCollection('followers', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['followerId', 'followingId', 'createdAt'],
        properties: {
          followerId: { bsonType: 'string' },
          followingId: { bsonType: 'string' },
          createdAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Notifications collection
  await db.createCollection('notifications', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'type', 'createdAt'],
        properties: {
          userId: { bsonType: 'string' },
          type: { bsonType: 'string' },
          title: { bsonType: 'string' },
          message: { bsonType: 'string' },
          isRead: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          data: { bsonType: 'object' }
        }
      }
    }
  });
};

const createIndexes = async (db) => {
  // Users indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ createdAt: -1 });

  // Projects indexes
  await db.collection('projects').createIndex({ userId: 1 });
  await db.collection('projects').createIndex({ createdAt: -1 });
  await db.collection('projects').createIndex({ isPublic: 1 });
  await db.collection('projects').createIndex({ technologies: 1 });
  await db.collection('projects').createIndex({ category: 1 });
  await db.collection('projects').createIndex({ title: 'text', description: 'text' });

  // Badges indexes
  await db.collection('badges').createIndex({ userId: 1 });
  await db.collection('badges').createIndex({ type: 1 });
  await db.collection('badges').createIndex({ awardedAt: -1 });

  // Comments indexes
  await db.collection('comments').createIndex({ projectId: 1 });
  await db.collection('comments').createIndex({ userId: 1 });
  await db.collection('comments').createIndex({ createdAt: -1 });

  // Followers indexes
  await db.collection('followers').createIndex({ followerId: 1, followingId: 1 }, { unique: true });
  await db.collection('followers').createIndex({ followingId: 1 });
  await db.collection('followers').createIndex({ followerId: 1 });

  // Notifications indexes
  await db.collection('notifications').createIndex({ userId: 1 });
  await db.collection('notifications').createIndex({ isRead: 1 });
  await db.collection('notifications').createIndex({ createdAt: -1 });
};

// Sample data insertion
export const insertSampleData = async () => {
  try {
    const db = await getDatabase();
    
    // Insert sample users
    const usersCollection = db.collection('users');
    const sampleUsers = [
      {
        email: 'demo@example.com',
        username: 'demo_user',
        fullName: 'Demo User',
        bio: 'A passionate developer showcasing my projects',
        avatar: 'https://via.placeholder.com/150',
        githubUrl: 'https://github.com/demo_user',
        linkedinUrl: 'https://linkedin.com/in/demo_user',
        websiteUrl: 'https://demo-user.dev',
        location: 'Nairobi, Kenya',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: true,
        role: 'student'
      }
    ];

    for (const user of sampleUsers) {
      await usersCollection.updateOne(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true }
      );
    }

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};