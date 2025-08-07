import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from './mongodb.js';
import { GitHubOAuthService } from './github-oauth.js';
import { EmailService } from './email-service.js';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  static async signUp(userData) {
    try {
      const usersCollection = await getCollection('users');
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user document
      const newUser = {
        email: userData.email,
        username: userData.username,
        fullName: userData.fullName || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '',
        githubUrl: userData.githubUrl || '',
        linkedinUrl: userData.linkedinUrl || '',
        websiteUrl: userData.websiteUrl || '',
        location: userData.location || '',
        skills: userData.skills || [],
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: false,
        emailVerified: false,
        role: 'student'
      };

      const result = await usersCollection.insertOne(newUser);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: result.insertedId.toString(), email: newUser.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Send verification email
      try {
        await EmailService.sendVerificationEmail(result.insertedId, newUser.email);
        await EmailService.sendWelcomeEmail({ ...userWithoutPassword, _id: result.insertedId });
      } catch (error) {
        console.error('Error sending verification email:', error);
      }

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
    try {
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
        { $set: { lastLoginAt: new Date() } }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async getCurrentUser(token) {
    try {
      if (!token) {
        return null;
      }

      // Verify token
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
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async updateProfile(userId, updateData) {
    try {
      const usersCollection = await getCollection('users');
      
      const updateFields = {
        ...updateData,
        updatedAt: new Date()
      };

      // Remove sensitive fields that shouldn't be updated
      delete updateFields.password;
      delete updateFields.email;
      delete updateFields._id;

      const result = await usersCollection.updateOne(
        { _id: userId },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        throw new Error('User not found');
      }

      // Return updated user
      const updatedUser = await usersCollection.findOne({ _id: userId });
      const { password, ...userWithoutPassword } = updatedUser;
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const usersCollection = await getCollection('users');
      
      // Get user with password
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

      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  static async deleteAccount(userId, password) {
    try {
      const usersCollection = await getCollection('users');
      
      // Get user with password
      const user = await usersCollection.findOne({ _id: userId });
      
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Password is incorrect');
      }

      // Delete user
      await usersCollection.deleteOne({ _id: userId });

      return { message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // GitHub OAuth methods
  static async signInWithGitHub(code) {
    try {
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
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              githubUrl: githubUser.html_url,
              avatar: githubUser.avatar_url,
              githubUsername: githubUser.login,
              githubAccessToken: accessToken,
              lastLoginAt: new Date(),
              updatedAt: new Date()
            }
          }
        );
        
        // Get updated user
        user = await usersCollection.findOne({ _id: user._id });
      } else {
        // Create new user
        const newUser = {
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
        };

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
    try {
      // Exchange code for access token
      const accessToken = await GitHubOAuthService.exchangeCodeForToken(code);
      
      // Get user info from GitHub
      const githubUser = await GitHubOAuthService.getUserInfo(accessToken);
      
      const usersCollection = await getCollection('users');
      
      // Update user with GitHub info
      await usersCollection.updateOne(
        { _id: userId },
        {
          $set: {
            githubUrl: githubUser.html_url,
            githubUsername: githubUser.login,
            githubAccessToken: accessToken,
            updatedAt: new Date()
          }
        }
      );

      return { success: true, message: 'GitHub account linked successfully' };
    } catch (error) {
      console.error('Error linking GitHub account:', error);
      throw error;
    }
  }

  static async unlinkGitHubAccount(userId) {
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
}