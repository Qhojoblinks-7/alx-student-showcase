// Email Service for verification and password reset - FREE VERSION
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

      // For free version, we'll use a simple approach
      // In development, just log the verification URL
      const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;
      
      console.log('=== EMAIL VERIFICATION (FREE VERSION) ===');
      console.log('To:', email);
      console.log('Subject: Verify your email address');
      console.log('Verification URL:', verificationUrl);
      console.log('==========================================');

      // For production, you can use free email services like:
      // 1. Gmail SMTP (free for personal use)
      // 2. Mailgun (free tier: 5,000 emails/month)
      // 3. SendGrid (free tier: 100 emails/day)
      // 4. Resend (free tier: 3,000 emails/month)

      return { success: true, message: 'Verification email sent (check console for URL)' };
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
      
      console.log('=== PASSWORD RESET EMAIL (FREE VERSION) ===');
      console.log('To:', email);
      console.log('Subject: Reset your password');
      console.log('Reset URL:', resetUrl);
      console.log('==========================================');

      return { success: true, message: 'Password reset email sent (check console for URL)' };
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
      console.log('=== WELCOME EMAIL (FREE VERSION) ===');
      console.log('To:', user.email);
      console.log('Subject: Welcome to ALX Student Showcase!');
      console.log('Message: Welcome to the platform!');
      console.log('==========================================');

      return { success: true, message: 'Welcome email sent (check console)' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  static async sendProjectNotification(user, project, action) {
    try {
      console.log(`=== PROJECT ${action.toUpperCase()} NOTIFICATION (FREE VERSION) ===`);
      console.log('To:', user.email);
      console.log(`Subject: Project ${action} - ${project.title}`);
      console.log(`Message: Your project "${project.title}" has been ${action}.`);
      console.log('==========================================');

      return { success: true, message: 'Project notification sent (check console)' };
    } catch (error) {
      console.error('Error sending project notification:', error);
      throw error;
    }
  }

  static async sendCommentNotification(user, comment, project) {
    try {
      console.log('=== COMMENT NOTIFICATION (FREE VERSION) ===');
      console.log('To:', user.email);
      console.log('Subject: New comment on your project');
      console.log('Message: Someone commented on your project');
      console.log('==========================================');

      return { success: true, message: 'Comment notification sent (check console)' };
    } catch (error) {
      console.error('Error sending comment notification:', error);
      throw error;
    }
  }

  static async sendFollowNotification(user, follower) {
    try {
      console.log('=== FOLLOW NOTIFICATION (FREE VERSION) ===');
      console.log('To:', user.email);
      console.log('Subject: New follower');
      console.log('Message: Someone started following you!');
      console.log('==========================================');

      return { success: true, message: 'Follow notification sent (check console)' };
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

  // FREE EMAIL SERVICE INTEGRATION OPTIONS
  static async setupFreeEmailService() {
    console.log(`
=== FREE EMAIL SERVICE SETUP GUIDE ===

For production use, you can integrate with these FREE email services:

1. GMAIL SMTP (FREE for personal use):
   - Use your Gmail account
   - Enable 2-factor authentication
   - Generate app password
   - Configure SMTP settings

2. MAILGUN (FREE: 5,000 emails/month):
   - Sign up at mailgun.com
   - Verify your domain
   - Use their free tier

3. SENDGRID (FREE: 100 emails/day):
   - Sign up at sendgrid.com
   - Verify your email
   - Use their free tier

4. RESEND (FREE: 3,000 emails/month):
   - Sign up at resend.com
   - Verify your domain
   - Use their free tier

5. ELASTIC EMAIL (FREE: 100 emails/day):
   - Sign up at elasticemail.com
   - Verify your email
   - Use their free tier

For now, emails are logged to console for development.
==========================================
    `);
  }
}