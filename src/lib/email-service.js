// Email Service for verification and password reset - OPTIMIZED FOR 1,800 USERS
import { getCollection } from './mongodb.js';
import { AuthService } from './auth-service.js';
import { OptimizationService } from './optimization-service.js';

export class EmailService {
  static async sendVerificationEmail(userId, email) {
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`email_${userId}`, 5, 60000)) {
        console.warn('⚠️ Rate limit exceeded for email sending');
        return { success: false, message: 'Rate limit exceeded' };
      }

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

      // Get optimal email service
      const emailService = OptimizationService.getOptimalEmailService();
      const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;
      
      // Send email based on service
      await this.sendEmailViaService(emailService, {
        to: email,
        subject: 'Verify your email address',
        html: this.getVerificationEmailTemplate(verificationUrl)
      });

      OptimizationService.trackOperation('email_verification', Date.now() - startTime);
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
    const startTime = Date.now();
    
    try {
      // Check rate limiting
      if (!OptimizationService.checkRateLimit(`reset_${email}`, 3, 300000)) { // 3 per 5 minutes
        console.warn('⚠️ Rate limit exceeded for password reset');
        return { success: false, message: 'Rate limit exceeded' };
      }

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

      // Get optimal email service
      const emailService = OptimizationService.getOptimalEmailService();
      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      // Send email based on service
      await this.sendEmailViaService(emailService, {
        to: email,
        subject: 'Reset your password',
        html: this.getPasswordResetEmailTemplate(resetUrl)
      });

      OptimizationService.trackOperation('password_reset', Date.now() - startTime);
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
    const startTime = Date.now();
    
    try {
      const emailService = OptimizationService.getOptimalEmailService();
      
      await this.sendEmailViaService(emailService, {
        to: user.email,
        subject: 'Welcome to ALX Student Showcase!',
        html: this.getWelcomeEmailTemplate(user)
      });

      OptimizationService.trackOperation('welcome_email', Date.now() - startTime);
      return { success: true, message: 'Welcome email sent' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  static async sendProjectNotification(user, project, action) {
    const startTime = Date.now();
    
    try {
      const emailService = OptimizationService.getOptimalEmailService();
      
      await this.sendEmailViaService(emailService, {
        to: user.email,
        subject: `Project ${action} - ${project.title}`,
        html: this.getProjectNotificationTemplate(user, project, action)
      });

      OptimizationService.trackOperation('project_notification', Date.now() - startTime);
      return { success: true, message: 'Project notification sent' };
    } catch (error) {
      console.error('Error sending project notification:', error);
      throw error;
    }
  }

  static async sendCommentNotification(user, comment, project) {
    const startTime = Date.now();
    
    try {
      const emailService = OptimizationService.getOptimalEmailService();
      
      await this.sendEmailViaService(emailService, {
        to: user.email,
        subject: `New comment on ${project.title}`,
        html: this.getCommentNotificationTemplate(user, comment, project)
      });

      OptimizationService.trackOperation('comment_notification', Date.now() - startTime);
      return { success: true, message: 'Comment notification sent' };
    } catch (error) {
      console.error('Error sending comment notification:', error);
      throw error;
    }
  }

  static async sendFollowNotification(user, follower) {
    const startTime = Date.now();
    
    try {
      const emailService = OptimizationService.getOptimalEmailService();
      
      await this.sendEmailViaService(emailService, {
        to: user.email,
        subject: `New follower: ${follower.fullName}`,
        html: this.getFollowNotificationTemplate(user, follower)
      });

      OptimizationService.trackOperation('follow_notification', Date.now() - startTime);
      return { success: true, message: 'Follow notification sent' };
    } catch (error) {
      console.error('Error sending follow notification:', error);
      throw error;
    }
  }

  // Email Service Router
  static async sendEmailViaService(service, emailData) {
    switch (service) {
      case 'mailgun':
        return await this.sendViaMailgun(emailData);
      case 'sendgrid':
        return await this.sendViaSendGrid(emailData);
      case 'resend':
        return await this.sendViaResend(emailData);
      case 'elastic':
        return await this.sendViaElasticEmail(emailData);
      case 'gmail':
        return await this.sendViaGmail(emailData);
      case 'console':
      default:
        return await this.sendViaConsole(emailData);
    }
  }

  // Service Implementations
  static async sendViaMailgun(emailData) {
    // Implementation for Mailgun
    console.log('📧 Mailgun:', emailData);
    return { success: true };
  }

  static async sendViaSendGrid(emailData) {
    // Implementation for SendGrid
    console.log('📧 SendGrid:', emailData);
    return { success: true };
  }

  static async sendViaResend(emailData) {
    // Implementation for Resend
    console.log('📧 Resend:', emailData);
    return { success: true };
  }

  static async sendViaElasticEmail(emailData) {
    // Implementation for Elastic Email
    console.log('📧 Elastic Email:', emailData);
    return { success: true };
  }

  static async sendViaGmail(emailData) {
    // Implementation for Gmail SMTP
    console.log('📧 Gmail SMTP:', emailData);
    return { success: true };
  }

  static async sendViaConsole(emailData) {
    console.log('=== EMAIL (CONSOLE) ===');
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Content:', emailData.html.substring(0, 200) + '...');
    console.log('=======================');
    return { success: true };
  }

  // Email Templates
  static getVerificationEmailTemplate(verificationUrl) {
    return `
      <h1>Welcome to ALX Student Showcase!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;
  }

  static getPasswordResetEmailTemplate(resetUrl) {
    return `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
  }

  static getWelcomeEmailTemplate(user) {
    return `
      <h1>Welcome ${user.fullName}!</h1>
      <p>Thank you for joining ALX Student Showcase.</p>
      <p>Start showcasing your projects and connecting with other developers!</p>
      <a href="${window.location.origin}/dashboard">Go to Dashboard</a>
    `;
  }

  static getProjectNotificationTemplate(user, project, action) {
    return `
      <h1>Project ${action}</h1>
      <p>Your project "${project.title}" has been ${action}.</p>
      <a href="${window.location.origin}/projects/${project._id}">View Project</a>
    `;
  }

  static getCommentNotificationTemplate(user, comment, project) {
    return `
      <h1>New Comment</h1>
      <p>Someone commented on your project "${project.title}":</p>
      <p>"${comment.content}"</p>
      <a href="${window.location.origin}/projects/${project._id}">View Comment</a>
    `;
  }

  static getFollowNotificationTemplate(user, follower) {
    return `
      <h1>New Follower</h1>
      <p>${follower.fullName} started following you!</p>
      <a href="${window.location.origin}/profile/${follower.username}">View Profile</a>
    `;
  }

  // Batch Email Sending for 1,800 Users
  static async sendBatchEmails(emails, template, batchSize = 50) {
    console.log(`📧 Sending ${emails.length} batch emails`);
    
    const batches = [];
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const emailService = OptimizationService.getOptimalEmailService();
      
      // Send batch emails
      for (const email of batch) {
        await this.sendEmailViaService(emailService, {
          to: email.to,
          subject: email.subject,
          html: template(email)
        });
        
        // Rate limiting
        await OptimizationService.delay(100);
      }
      
      // Batch delay
      await OptimizationService.delay(1000);
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

  // Performance Monitoring
  static getEmailStats() {
    const usage = OptimizationService.getResourceUsage();
    return {
      emailServices: usage.email,
      totalEmailsSent: Object.values(usage.email).reduce((sum, service) => sum + service.used, 0),
      remainingCapacity: Object.values(usage.email).reduce((sum, service) => sum + (service.limit - service.used), 0)
    };
  }
}