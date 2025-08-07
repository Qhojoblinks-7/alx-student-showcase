import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from './mongodb.js';
import { GitHubOAuthService } from './github-oauth.js';
import { EmailService } from './email-service.js';
import { OptimizationService } from './optimization-service.js';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  static async signUp(email, password, userData) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`signup_${email}`, 3, 300000)) { // 3 per 5 minutes
        throw new Error('Too many signup attempts. Please try again later.');
      }

      const usersCollection = await getCollection('users');
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Optimize user data for storage
      const optimizedUserData = OptimizationService.optimizeUserData({
        email,
        username: userData.username,
        fullName: userData.fullName,
        bio: userData.bio,
        avatar: userData.avatar,
        githubUrl: userData.githubUrl,
        linkedinUrl: userData.linkedinUrl,
        websiteUrl: userData.websiteUrl,
        location: userData.location,
        skills: userData.skills,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: false,
        emailVerified: false,
        role: 'student'
      });

      // Insert user
      const result = await usersCollection.insertOne(optimizedUserData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = optimizedUserData;

      // Generate JWT token
      const token = jwt.sign(
        { userId: result.insertedId.toString(), email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(result.insertedId, email);
        await EmailService.sendWelcomeEmail({ ...userWithoutPassword, _id: result.insertedId });
      } catch (error) {
        console.error('Error sending verification email:', error);
      }

      OptimizationService.trackOperation('signup', Date.now() - startTime);
      return {
        user: { ...userWithoutPassword, _id: result.insertedId },
        token
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async signIn(email, password) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`signin_${email}`, 5, 300000)) { // 5 per 5 minutes
        throw new Error('Too many signin attempts. Please try again later.');
      }

      const usersCollection = await getCollection('users');
      
      // Find user by email
      const user = await usersCollection.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            lastLoginAt: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      OptimizationService.trackOperation('signin', Date.now() - startTime);
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const usersCollection = await getCollection('users');
      
      const user = await usersCollection.findOne({ _id: decoded.userId });
      if (!user) {
        return null;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  static async updateProfile(userId, updates) {
    const startTime = Date.now();
    
    try {
      // Optimize update data
      const optimizedUpdates = OptimizationService.optimizeUserData(updates);
      
      const usersCollection = await getCollection('users');
      
      const result = await usersCollection.updateOne(
        { _id: userId },
        {
          $set: {
            ...optimizedUpdates,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('User not found');
      }

      // Clear cache for this user
      OptimizationService.cache.delete(`user_${userId}`);
      OptimizationService.cache.delete(`profile_${userId}`);

      OptimizationService.trackOperation('update_profile', Date.now() - startTime);
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`password_change_${userId}`, 3, 300000)) {
        throw new Error('Too many password change attempts. Please try again later.');
      }

      const usersCollection = await getCollection('users');
      
      // Get user
      const user = await usersCollection.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await usersCollection.updateOne(
        { _id: userId },
        {
          $set: {
            password: hashedNewPassword,
            updatedAt: new Date()
          }
        }
      );

      OptimizationService.trackOperation('change_password', Date.now() - startTime);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  static async deleteAccount(userId, password) {
    const startTime = Date.now();
    
    try {
      const usersCollection = await getCollection('users');
      
      // Get user
      const user = await usersCollection.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Password is incorrect');
      }

      // Delete user and related data
      await usersCollection.deleteOne({ _id: userId });
      
      // Clear all user-related cache
      OptimizationService.cache.forEach((value, key) => {
        if (key.includes(userId)) {
          OptimizationService.cache.delete(key);
        }
      });

      OptimizationService.trackOperation('delete_account', Date.now() - startTime);
      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  static async getUserById(userId) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `user_${userId}`;
      const cached = OptimizationService.getCache(cacheKey);
      if (cached) {
        OptimizationService.performanceMetrics.cacheHits++;
        return cached;
      }
      
      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ _id: userId });
      
      if (!user) {
        return null;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Cache for 5 minutes
      OptimizationService.setCache(cacheKey, userWithoutPassword, 5);
      OptimizationService.performanceMetrics.cacheMisses++;
      
      OptimizationService.trackOperation('get_user', Date.now() - startTime);
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // GitHub OAuth methods
  static async signInWithGitHub(code) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit('github_oauth', 10, 60000)) {
        throw new Error('Too many GitHub OAuth attempts. Please try again later.');
      }

      // Exchange code for access token
      const accessToken = await GitHubOAuthService.exchangeCodeForToken(code);
      
      // Get user info from GitHub
      const githubUser = await GitHubOAuthService.getUserInfo(accessToken);
      const githubEmails = await GitHubOAuthService.getUserEmails(accessToken);
      
      // Find primary email
      const primaryEmail = githubEmails.find(email => email.primary) || githubEmails[0];
      
      if (!primaryEmail) {
        throw new Error('No email found for GitHub account');
      }

      const usersCollection = await getCollection('users');
      
      // Check if user already exists
      let user = await usersCollection.findOne({ email: primaryEmail.email });
      
      if (user) {
        // User exists, update GitHub info
        const optimizedUpdates = OptimizationService.optimizeUserData({
          githubUrl: githubUser.html_url,
          avatar: githubUser.avatar_url,
          githubUsername: githubUser.login,
          githubAccessToken: accessToken,
          lastLoginAt: new Date(),
          updatedAt: new Date()
        });
        
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: optimizedUpdates }
        );
        
        // Get updated user
        user = await usersCollection.findOne({ _id: user._id });
      } else {
        // Create new user
        const newUser = OptimizationService.optimizeUserData({
          email: primaryEmail.email,
          username: githubUser.login,
          fullName: githubUser.name || githubUser.login,
          bio: githubUser.bio || '',
          avatar: githubUser.avatar_url,
          githubUrl: githubUser.html_url,
          linkedinUrl: '',
          websiteUrl: githubUser.blog || '',
          location: githubUser.location || '',
          skills: [],
          password: '', // No password for OAuth users
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          isVerified: true,
          emailVerified: true,
          role: 'student',
          githubUsername: githubUser.login,
          githubAccessToken: accessToken
        });

        const result = await usersCollection.insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }

      // Remove sensitive data
      const { password, githubAccessToken, ...userWithoutSensitiveData } = user;
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      OptimizationService.trackOperation('github_oauth', Date.now() - startTime);
      return {
        user: userWithoutSensitiveData,
        token
      };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      throw error;
    }
  }

  static async linkGitHubAccount(userId, code) {
    const startTime = Date.now();
    
    try {
      // Exchange code for access token
      const accessToken = await GitHubOAuthService.exchangeCodeForToken(code);
      
      // Get user info from GitHub
      const githubUser = await GitHubOAuthService.getUserInfo(accessToken);
      
      const usersCollection = await getCollection('users');
      
      // Update user with GitHub info
      const optimizedUpdates = OptimizationService.optimizeUserData({
        githubUrl: githubUser.html_url,
        githubUsername: githubUser.login,
        githubAccessToken: accessToken,
        updatedAt: new Date()
      });
      
      await usersCollection.updateOne(
        { _id: userId },
        { $set: optimizedUpdates }
      );

      // Clear cache
      OptimizationService.cache.delete(`user_${userId}`);

      OptimizationService.trackOperation('link_github', Date.now() - startTime);
      return { success: true, message: 'GitHub account linked successfully' };
    } catch (error) {
      console.error('Error linking GitHub account:', error);
      throw error;
    }
  }

  static async unlinkGitHubAccount(userId) {
    const startTime = Date.now();
    
    try {
      const usersCollection = await getCollection('users');
      
      await usersCollection.updateOne(
        { _id: userId },
        {
          $unset: {
            githubAccessToken: "",
            githubUsername: ""
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      // Clear cache
      OptimizationService.cache.delete(`user_${userId}`);

      OptimizationService.trackOperation('unlink_github', Date.now() - startTime);
      return { success: true, message: 'GitHub account unlinked successfully' };
    } catch (error) {
      console.error('Error unlinking GitHub account:', error);
      throw error;
    }
  }

  // Email verification methods
  static async verifyEmail(token) {
    return await EmailService.verifyEmail(token);
  }

  static async resendVerificationEmail(userId) {
    return await EmailService.resendVerificationEmail(userId);
  }

  static async sendPasswordResetEmail(email) {
    return await EmailService.sendPasswordResetEmail(email);
  }

  static async resetPassword(token, newPassword) {
    return await EmailService.resetPassword(token, newPassword);
  }

  static async isEmailVerified(userId) {
    return await EmailService.isEmailVerified(userId);
  }

  // Performance monitoring
  static getAuthStats() {
    const performance = OptimizationService.getPerformanceReport();
    return {
      performance,
      rateLimits: OptimizationService.rateLimits.size,
      cacheStats: {
        size: OptimizationService.cache.size,
        hitRate: performance.cacheHitRate
      }
    };
  }
}