#!/usr/bin/env node

// Database initialization script for MongoDB
import { initializeDatabase, insertSampleData } from './mongodb-schema.js';

console.log('🚀 Initializing MongoDB database...');

try {
  // Initialize database with collections and indexes
  await initializeDatabase();
  
  // Insert sample data
  await insertSampleData();
  
  console.log('✅ Database initialized successfully!');
  console.log('📊 Collections created: users, projects, badges, project_backups, comments, followers, notifications');
  console.log('🔍 Indexes created for optimal performance');
  console.log('📝 Sample data inserted');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}