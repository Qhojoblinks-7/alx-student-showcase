// Email Service for verification and password reset
import { getCollection } from './mongodb.js';
import { AuthService } from './auth-service.js';

export class EmailService {
  static async sendVerificationEmail(userId, email) {
    try {
      // Generate verification token
      const verificationToken = this.generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token in database
      const usersCollection = await getCollection('users');
      await usersCollection.updateOne(
        { _id: userId },
        {
          $set: {
            verificationToken: verificationToken,
            verificationTokenExpires: expiresAt,
            emailVerified: false
          }
        }
      );

      // In a real application, you would send an email here
      // For now, we'll simulate the email sending
      const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;
      
      console.log('Verification email would be sent to:', email);
      console.log('Verification URL:', verificationUrl);

      // For development, you can use a service like SendGrid, AWS SES, or Nodemailer
      // Example with a hypothetical email service:
      /*
      await emailProvider.send({
        to: email,
        subject: 'Verify your email address',
        html: `
          <h1>Welcome to ALX Student Showcase!</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `
      });
      */

      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  static async verifyEmail(token) {
    try {
      const usersCollection = await getCollection('users');
      
      // Find user with valid verification token
      const user = await usersCollection.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Mark email as verified and clear token
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            emailVerified: true,
            verifiedAt: new Date()
          },
          $unset: {
            verificationToken: "",
            verificationTokenExpires: ""
          }
        }
      );

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email) {
    try {
      const usersCollection = await getCollection('users');
      
      // Find user by email
      const user = await usersCollection.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return { success: true, message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = this.generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token in database
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetToken: resetToken,
            passwordResetExpires: expiresAt
          }
        }
      );

      // Generate reset URL
      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      console.log('Password reset email would be sent to:', email);
      console.log('Reset URL:', resetUrl);

      // In a real application, send the email here
      /*
      await emailProvider.send({
        to: email,
        subject: 'Reset your password',
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      */

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const usersCollection = await getCollection('users');
      
      // Find user with valid reset token
      const user = await usersCollection.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date()
          },
          $unset: {
            passwordResetToken: "",
            passwordResetExpires: ""
          }
        }
      );

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(user) {
    try {
      console.log('Welcome email would be sent to:', user.email);
      
      // In a real application, send welcome email
      /*
      await emailProvider.send({
        to: user.email,
        subject: 'Welcome to ALX Student Showcase!',
        html: `
          <h1>Welcome ${user.fullName}!</h1>
          <p>Thank you for joining ALX Student Showcase.</p>
          <p>Start showcasing your projects and connecting with other developers!</p>
          <a href="${window.location.origin}/dashboard">Go to Dashboard</a>
        `
      });
      */

      return { success: true, message: 'Welcome email sent' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  static async sendProjectNotification(user, project, action) {
    try {
      console.log(`Project ${action} notification would be sent to:`, user.email);
      
      // In a real application, send project notification
      /*
      await emailProvider.send({
        to: user.email,
        subject: `Project ${action} - ${project.title}`,
        html: `
          <h1>Project ${action}</h1>
          <p>Your project "${project.title}" has been ${action}.</p>
          <a href="${window.location.origin}/projects/${project._id}">View Project</a>
        `
      });
      */

      return { success: true, message: 'Project notification sent' };
    } catch (error) {
      console.error('Error sending project notification:', error);
      throw error;
    }
  }

  static async sendCommentNotification(user, comment, project) {
    try {
      console.log('Comment notification would be sent to:', user.email);
      
      // In a real application, send comment notification
      /*
      await emailProvider.send({
        to: user.email,
        subject: `New comment on ${project.title}`,
        html: `
          <h1>New Comment</h1>
          <p>Someone commented on your project "${project.title}":</p>
          <p>"${comment.content}"</p>
          <a href="${window.location.origin}/projects/${project._id}">View Comment</a>
        `
      });
      */

      return { success: true, message: 'Comment notification sent' };
    } catch (error) {
      console.error('Error sending comment notification:', error);
      throw error;
    }
  }

  static async sendFollowNotification(user, follower) {
    try {
      console.log('Follow notification would be sent to:', user.email);
      
      // In a real application, send follow notification
      /*
      await emailProvider.send({
        to: user.email,
        subject: `New follower: ${follower.fullName}`,
        html: `
          <h1>New Follower</h1>
          <p>${follower.fullName} started following you!</p>
          <a href="${window.location.origin}/profile/${follower.username}">View Profile</a>
        `
      });
      */

      return { success: true, message: 'Follow notification sent' };
    } catch (error) {
      console.error('Error sending follow notification:', error);
      throw error;
    }
  }

  static generateToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  static async isEmailVerified(userId) {
    try {
      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ _id: userId });
      return user?.emailVerified || false;
    } catch (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }
  }

  static async resendVerificationEmail(userId) {
    try {
      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ _id: userId });
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      return await this.sendVerificationEmail(userId, user.email);
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  }

  static async updateEmailPreferences(userId, preferences) {
    try {
      const usersCollection = await getCollection('users');
      await usersCollection.updateOne(
        { _id: userId },
        {
          $set: {
            emailPreferences: preferences,
            updatedAt: new Date()
          }
        }
      );

      return { success: true, message: 'Email preferences updated' };
    } catch (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    }
  }

  static async getEmailPreferences(userId) {
    try {
      const usersCollection = await getCollection('users');
      const user = await usersCollection.findOne({ _id: userId });
      return user?.emailPreferences || {
        projectUpdates: true,
        comments: true,
        followers: true,
        newsletter: false
      };
    } catch (error) {
      console.error('Error getting email preferences:', error);
      throw error;
    }
  }
}