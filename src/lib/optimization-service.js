// Optimization Service for 1,800 Users - FREE VERSION
// This service manages resource allocation and service rotation for optimal performance

export class OptimizationService {
  static serviceUsage = {
    email: {
      mailgun: { limit: 5000, used: 0, priority: 1 },
      sendgrid: { limit: 3000, used: 0, priority: 2 },
      resend: { limit: 3000, used: 0, priority: 3 },
      elastic: { limit: 3000, used: 0, priority: 4 }
    },
    storage: {
      cloudinary: { storage: 25, used: 0, bandwidth: 25, priority: 1 },
      firebase: { storage: 5, used: 0, bandwidth: 1, priority: 2 },
      s3: { storage: 5, used: 0, requests: 20000, priority: 3 }
    },
    database: {
      currentUsage: 0,
      maxUsage: 450, // Keep 62MB buffer for 512MB limit
      optimizationLevel: 'high'
    }
  };

  // Email Service Rotation
  static getOptimalEmailService() {
    const emailServices = this.serviceUsage.email;
    const availableServices = Object.entries(emailServices)
      .filter(([_, service]) => service.used < service.limit)
      .sort((a, b) => a[1].priority - b[1].priority);

    if (availableServices.length === 0) {
      console.warn('⚠️ All email services at capacity, using console logging');
      return 'console';
    }

    const [serviceName, service] = availableServices[0];
    service.used += 1;
    
    console.log(`📧 Using ${serviceName} for email (${service.used}/${service.limit})`);
    return serviceName;
  }

  // Storage Service Rotation
  static getOptimalStorageService(fileSize) {
    const storageServices = this.serviceUsage.storage;
    const fileSizeGB = fileSize / (1024 * 1024 * 1024);
    
    const availableServices = Object.entries(storageServices)
      .filter(([_, service]) => {
        const hasStorage = (service.used + fileSizeGB) <= service.storage;
        const hasBandwidth = service.bandwidth ? true : true; // S3 uses requests
        return hasStorage && hasBandwidth;
      })
      .sort((a, b) => a[1].priority - b[1].priority);

    if (availableServices.length === 0) {
      console.warn('⚠️ All storage services at capacity');
      return null;
    }

    const [serviceName, service] = availableServices[0];
    service.used += fileSizeGB;
    
    console.log(`💾 Using ${serviceName} for storage (${service.used.toFixed(2)}GB/${service.storage}GB)`);
    return serviceName;
  }

  // Database Optimization
  static optimizeDatabaseOperation(operation, dataSize) {
    const dbUsage = this.serviceUsage.database;
    const estimatedUsage = dataSize / (1024 * 1024); // Convert to MB
    
    if (dbUsage.currentUsage + estimatedUsage > dbUsage.maxUsage) {
      console.warn('⚠️ Database approaching limit, optimizing operation');
      return this.optimizeDataForDatabase(dataSize);
    }
    
    dbUsage.currentUsage += estimatedUsage;
    return operation;
  }

  // Data Optimization for Database
  static optimizeDataForDatabase(data) {
    if (typeof data === 'object') {
      // Remove unnecessary fields
      const optimized = { ...data };
      delete optimized.tempData;
      delete optimized.debugInfo;
      delete optimized.metadata;
      
      // Truncate long strings
      Object.keys(optimized).forEach(key => {
        if (typeof optimized[key] === 'string' && optimized[key].length > 1000) {
          optimized[key] = optimized[key].substring(0, 1000) + '...';
        }
      });
      
      return optimized;
    }
    return data;
  }

  // User Data Optimization
  static optimizeUserData(userData) {
    return {
      _id: userData._id,
      email: userData.email,
      username: userData.username,
      fullName: userData.fullName?.substring(0, 100),
      bio: userData.bio?.substring(0, 500),
      avatar: userData.avatar,
      githubUrl: userData.githubUrl,
      linkedinUrl: userData.linkedinUrl,
      websiteUrl: userData.websiteUrl,
      location: userData.location?.substring(0, 100),
      skills: userData.skills?.slice(0, 10), // Limit to 10 skills
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: userData.lastLoginAt,
      isVerified: userData.isVerified,
      emailVerified: userData.emailVerified,
      role: userData.role
    };
  }

  // Project Data Optimization
  static optimizeProjectData(projectData) {
    return {
      _id: projectData._id,
      title: projectData.title?.substring(0, 200),
      description: projectData.description?.substring(0, 1000),
      userId: projectData.userId,
      githubUrl: projectData.githubUrl,
      liveUrl: projectData.liveUrl,
      technologies: projectData.technologies?.slice(0, 15), // Limit to 15 technologies
      images: projectData.images?.slice(0, 5), // Limit to 5 images
      isPublic: projectData.isPublic,
      likes: projectData.likes?.slice(0, 100), // Limit to 100 likes
      views: projectData.views || 0,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      status: projectData.status,
      category: projectData.category
    };
  }

  // Comment Data Optimization
  static optimizeCommentData(commentData) {
    return {
      _id: commentData._id,
      content: commentData.content?.substring(0, 500), // Limit comment length
      userId: commentData.userId,
      projectId: commentData.projectId,
      userInfo: {
        username: commentData.userInfo?.username,
        fullName: commentData.userInfo?.fullName?.substring(0, 50),
        avatar: commentData.userInfo?.avatar
      },
      likes: commentData.likes?.slice(0, 50), // Limit to 50 likes
      createdAt: commentData.createdAt,
      updatedAt: commentData.updatedAt
    };
  }

  // Image Optimization
  static optimizeImageUpload(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw optimized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob((blob) => {
          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          console.log(`🖼️ Image optimized: ${file.size} → ${optimizedFile.size} bytes`);
          resolve(optimizedFile);
        }, 'image/jpeg', 0.8); // 80% quality
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Batch Operations
  static async batchEmailSending(emails, batchSize = 50) {
    const batches = [];
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }
    
    console.log(`📧 Sending ${emails.length} emails in ${batches.length} batches`);
    
    for (const batch of batches) {
      const service = this.getOptimalEmailService();
      await this.sendBatchEmails(batch, service);
      await this.delay(1000); // Rate limiting
    }
  }

  static async sendBatchEmails(emails, service) {
    // Implementation would vary based on service
    console.log(`📧 Sending ${emails.length} emails via ${service}`);
  }

  // Caching Strategy
  static cache = new Map();
  static cacheExpiry = new Map();

  static setCache(key, data, expiryMinutes = 30) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + (expiryMinutes * 60 * 1000));
  }

  static getCache(key) {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(key);
    }
    
    // Clean up expired cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  // Rate Limiting
  static rateLimits = new Map();

  static checkRateLimit(key, limit, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }
    
    const requests = this.rateLimits.get(key);
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= limit) {
      return false; // Rate limited
    }
    
    validRequests.push(now);
    this.rateLimits.set(key, validRequests);
    return true; // Allowed
  }

  // Resource Monitoring
  static getResourceUsage() {
    return {
      email: this.serviceUsage.email,
      storage: this.serviceUsage.storage,
      database: this.serviceUsage.database,
      cache: {
        size: this.cache.size,
        memory: this.estimateCacheMemory()
      }
    };
  }

  static estimateCacheMemory() {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      totalSize += JSON.stringify(key).length;
      totalSize += JSON.stringify(value).length;
    }
    return totalSize;
  }

  // Performance Monitoring
  static performanceMetrics = {
    operations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0
  };

  static trackOperation(operation, duration) {
    this.performanceMetrics.operations++;
    this.performanceMetrics.averageResponseTime = 
      (this.performanceMetrics.averageResponseTime + duration) / 2;
  }

  static getPerformanceReport() {
    const cacheHitRate = this.performanceMetrics.operations > 0 
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.operations) * 100 
      : 0;
    
    return {
      ...this.performanceMetrics,
      cacheHitRate: `${cacheHitRate.toFixed(2)}%`,
      resourceUsage: this.getResourceUsage()
    };
  }

  // Utility Functions
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateOptimizedId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Cleanup and Maintenance
  static cleanup() {
    // Clean expired cache
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
    
    // Clean old rate limit data
    const windowMs = 60000; // 1 minute
    for (const [key, requests] of this.rateLimits) {
      const validRequests = requests.filter(time => time > (now - windowMs));
      if (validRequests.length === 0) {
        this.rateLimits.delete(key);
      } else {
        this.rateLimits.set(key, validRequests);
      }
    }
  }

  // Initialize optimization
  static initialize() {
    console.log('🚀 Initializing optimization service for 1,800 users');
    
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanup();
    }, 300000); // Every 5 minutes
    
    // Set up performance monitoring
    setInterval(() => {
      const report = this.getPerformanceReport();
      console.log('📊 Performance Report:', report);
    }, 600000); // Every 10 minutes
  }
}

// Initialize on import
OptimizationService.initialize();