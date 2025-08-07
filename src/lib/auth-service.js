import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from './mongodb.js';

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
}