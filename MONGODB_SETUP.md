# MongoDB Setup Guide

This guide will help you set up MongoDB for the ALX Student Showcase application after migrating from Supabase.

## Prerequisites

1. **MongoDB Database**: You'll need a MongoDB database running. You can use:
   - MongoDB Atlas (cloud service)
   - Local MongoDB installation
   - Docker MongoDB container

2. **Node.js**: Ensure you have Node.js installed (version 16 or higher)

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# MongoDB Configuration
VITE_MONGODB_URI=mongodb://localhost:27017
VITE_MONGODB_DB_NAME=alx-showcase

# JWT Configuration
VITE_JWT_SECRET=your-super-secret-jwt-key-here

# Optional: MongoDB Atlas (if using cloud)
# VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alx-showcase?retryWrites=true&w=majority
```

## Database Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

Run the database initialization script to create collections and indexes:

```bash
npm run db:init
```

This will:
- Create all necessary collections (users, projects, badges, etc.)
- Set up database validation schemas
- Create indexes for optimal performance
- Insert sample data

### 3. Verify Setup

The initialization script will output success messages if everything is set up correctly.

## Database Schema

The application uses the following MongoDB collections:

### Users Collection
- `email` (string, unique)
- `username` (string, unique)
- `fullName` (string)
- `bio` (string)
- `avatar` (string)
- `githubUrl` (string)
- `linkedinUrl` (string)
- `websiteUrl` (string)
- `location` (string)
- `skills` (array)
- `password` (string, hashed)
- `createdAt` (date)
- `updatedAt` (date)
- `lastLoginAt` (date)
- `isVerified` (boolean)
- `role` (string)

### Projects Collection
- `title` (string)
- `description` (string)
- `userId` (string)
- `githubUrl` (string)
- `liveUrl` (string)
- `technologies` (array)
- `images` (array)
- `isPublic` (boolean)
- `likes` (array)
- `views` (number)
- `createdAt` (date)
- `updatedAt` (date)
- `status` (string)
- `category` (string)

### Badges Collection
- `userId` (string)
- `type` (string)
- `name` (string)
- `description` (string)
- `icon` (string)
- `awardedAt` (date)

### Other Collections
- `project_backups` - For project data backups
- `comments` - For project comments
- `followers` - For user following relationships
- `notifications` - For user notifications

## Authentication

The application now uses JWT-based authentication instead of Supabase Auth:

- **Sign Up**: Creates a new user with hashed password
- **Sign In**: Validates credentials and returns JWT token
- **Token Storage**: JWT tokens are stored in localStorage
- **Token Validation**: Tokens are verified on each request

## Migration Notes

### Key Changes from Supabase

1. **Authentication**: 
   - Supabase Auth → JWT + bcrypt
   - Session management via localStorage
   - No more OAuth (GitHub integration needs separate implementation)

2. **Database Operations**:
   - Supabase client → MongoDB native driver
   - SQL queries → MongoDB aggregation
   - Real-time subscriptions → Polling (can be upgraded to Change Streams)

3. **File Storage**:
   - Supabase Storage → AWS S3 (already implemented)
   - Avatar uploads still work with S3

### Features Status

✅ **Working**:
- User registration and login
- Project CRUD operations
- User profiles
- Statistics and analytics
- File uploads (S3)

⚠️ **Needs Implementation**:
- GitHub OAuth integration
- Real-time updates (can use MongoDB Change Streams)
- Email verification
- Password reset

## Troubleshooting

### Common Issues

1. **Connection Error**: 
   - Check MongoDB URI in environment variables
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Authentication Error**:
   - Check JWT secret in environment variables
   - Clear localStorage and try logging in again

3. **Database Initialization Error**:
   - Ensure MongoDB has write permissions
   - Check if collections already exist

### Development Tips

1. **Local MongoDB with Docker**:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **MongoDB Compass**: Use MongoDB Compass for database visualization

3. **Environment Variables**: Always restart the dev server after changing environment variables

## Production Deployment

For production deployment:

1. **Use MongoDB Atlas** or a managed MongoDB service
2. **Set strong JWT secret** in environment variables
3. **Enable MongoDB authentication** if using Atlas
4. **Set up proper indexes** for performance
5. **Configure backup strategies**

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check network connectivity

For additional help, refer to the MongoDB documentation or create an issue in the project repository.