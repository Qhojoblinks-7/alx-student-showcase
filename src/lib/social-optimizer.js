// Enhanced GitHub service for commit data and work logs
import { GitHubService } from './github-service.js';

export class GitHubCommitsService extends GitHubService {
  // Fetch recent commits for a repository
  static async fetchRepositoryCommits(username, repoName, limit = 10) {
    const GITHUB_API_BASE = 'https://api.github.com';
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${username}/${repoName}/commits?per_page=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch commits');
      }

      const commits = await response.json();
      return commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      }));
    } catch (error) {
      // Explicitly convert error to string for robust logging
      console.error('Error fetching commits:', error.message ? String(error.message) : String(error));
      return [];
    }
  }

  // Get work summary from recent commits
  static async generateWorkLog(username, repoName, days = 7) {
    try {
      const commits = await this.fetchRepositoryCommits(username, repoName, 50);
      
      // Filter commits from the last N days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentCommits = commits.filter(commit => 
        new Date(commit.date) >= cutoffDate
      );

      if (recentCommits.length === 0) {
        return null;
      }

      // Analyze commit messages
      const workSummary = this.analyzeCommits(recentCommits);
      
      return {
        commitCount: recentCommits.length,
        timeframe: `${days} days`,
        summary: workSummary,
        latestCommit: recentCommits[0],
        commits: recentCommits.slice(0, 5) // Latest 5 commits
      };
    } catch (error) {
      // Explicitly convert error to string for robust logging
      console.error('Error generating work log:', error.message ? String(error.message) : String(error));
      return null;
    }
  }

  // Analyze commit messages to extract work patterns
  static analyzeCommits(commits) {
    const features = [];
    const fixes = [];
    const improvements = [];
    const categories = {
      features: 0,
      fixes: 0,
      docs: 0,
      tests: 0,
      refactor: 0,
      style: 0
    };

    commits.forEach(commit => {
      const message = commit.message.toLowerCase();
      
      // Categorize commits
      if (message.includes('add') || message.includes('implement') || message.includes('feat')) {
        features.push(commit.message);
        categories.features++;
      } else if (message.includes('fix') || message.includes('bug') || message.includes('resolve')) {
        fixes.push(commit.message);
        categories.fixes++;
      } else if (message.includes('improve') || message.includes('update') || message.includes('enhance')) {
        improvements.push(commit.message);
      } else if (message.includes('doc') || message.includes('readme')) {
        categories.docs++;
      } else if (message.includes('test')) {
        categories.tests++;
      } else if (message.includes('refactor') || message.includes('clean')) {
        categories.refactor++;
      } else if (message.includes('style') || message.includes('format')) {
        categories.style++;
      }
    });

    return {
      features: features.slice(0, 3),
      fixes: fixes.slice(0, 2),
      improvements: improvements.slice(0, 2),
      categories,
      mostActiveArea: Object.keys(categories).reduce((a, b) => 
        categories[a] > categories[b] ? a : b
      )
    };
  }

  // Extract GitHub username and repo name from GitHub URL
  static parseGitHubUrl(githubUrl) {
    if (!githubUrl) return null;
    
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    return {
      username: match[1],
      repoName: match[2].replace(/\.git$/, '')
    };
  }
}

// Platform-specific content optimization service
export class SocialContentOptimizer {
  // Platform specifications
  static PLATFORM_LIMITS = {
    twitter: {
      maxLength: 280,
      urlLength: 23, // Twitter auto-shortens URLs to 23 chars
      hashtagWeight: 1,
      priority: ['impact', 'tech', 'url'], // What to prioritize in short content
    },
    linkedin: {
      maxLength: 3000,
      optimalLength: 1300, // Sweet spot for engagement
      priority: ['story', 'impact', 'tech', 'url'],
    },
    facebook: {
      maxLength: 63206,
      optimalLength: 400, // Optimal for engagement
      priority: ['story', 'impact', 'visual', 'url'],
    },
    discord: {
      maxLength: 2000,
      priority: ['impact', 'tech', 'code', 'url'],
    }
  };

  // Generate optimized content for each platform
  static generatePlatformContent(project, workLog = null, customMessage = '') {
    const baseData = {
      project,
      workLog,
      customMessage,
      timestamp: new Date()
    };

    return {
      twitter: this.generateTwitterContent(baseData),
      linkedin: this.generateLinkedInContent(baseData),
      facebook: this.generateFacebookContent(baseData),
      discord: this.generateDiscordContent(baseData)
    };
  }

  // Twitter/X optimized content (280 chars max)
  static generateTwitterContent({ project, workLog, customMessage }) {
    const limit = this.PLATFORM_LIMITS.twitter;
    
    // Build content components with smart personalization
    const components = {
      hook: customMessage || this.generatePersonalizedHook(project, workLog, 'twitter'),
      achievement: this.generateAchievement(project, workLog, 'twitter'),
      tech: this.generateTechStack(project.technologies, 'twitter'),
      progress: workLog ? this.generateSmartProgress(workLog, 'twitter') : '',
      hashtags: this.generateSmartHashtags(project, workLog, 'twitter'),
      url: project.live_url || project.github_url || ''
    };

    // Calculate available space with smart URL handling
    const urlSpace = components.url ? limit.urlLength + 1 : 0; // +1 for space
    const hashtagSpace = components.hashtags.length + 1;
    const availableSpace = limit.maxLength - urlSpace - hashtagSpace;

    // Smart content building with multiple strategies
    let content = this.buildOptimalTwitterContent(components, availableSpace);

    // Add hashtags and URL
    const finalContent = [
      content.trim(),
      components.hashtags,
      components.url
    ].filter(Boolean).join('\n\n');

    // If still too long, apply aggressive compression
    if (finalContent.length > limit.maxLength) {
      return this.applyAggressiveTwitterCompression(components, limit);
    }

    return {
      content: finalContent,
      length: finalContent.length,
      components,
      optimized: true
    };
  }

  // Smart content building for Twitter with multiple strategies
  static buildOptimalTwitterContent(components, availableSpace) {
    // Strategy 1: Try full content
    let content = components.hook || components.achievement;
    
    // Strategy 2: If hook is too long, try abbreviated version
    if (content.length > availableSpace - 20) {
      const abbreviated = this.abbreviateText(content, availableSpace - 20);
      content = abbreviated;
    }

    // Strategy 3: Add progress if valuable and space allows
    if (components.progress) {
      const withProgress = content + '\n\n' + components.progress;
      if (withProgress.length <= availableSpace) {
        content = withProgress;
      }
    }

    // Strategy 4: Add condensed tech if space allows
    const remainingSpace = availableSpace - content.length;
    if (components.tech && remainingSpace > 15) {
      const condensedTech = this.condenseTechStack(components.tech, remainingSpace - 2);
      if (condensedTech) {
        content += '\n\n' + condensedTech;
      }
    }

    return content;
  }

  // Aggressive compression for Twitter when standard methods exceed limit
  static applyAggressiveTwitterCompression(components, limit) {
    const maxContentSpace = limit.maxLength - 50; // Reserve space for hashtags and URL
    
    // Ultra-compact format
    const parts = [];
    
    // Minimal hook
    const hook = this.getMinimalHook(components.hook);
    parts.push(hook);
    
    // Essential info only
    if (components.progress) {
      const minProgress = this.getMinimalProgress(components.progress);
      if (minProgress) parts.push(minProgress);
    }
    
    // Minimal tech (just top 2)
    if (components.tech) {
      const minTech = this.getMinimalTech(components.tech);
      if (minTech) parts.push(minTech);
    }
    
    let content = parts.join(' • ');
    
    // Final truncation if still too long
    if (content.length > maxContentSpace) {
      content = this.truncateWithEllipsis(content, maxContentSpace);
    }
    
    // Minimal hashtags
    const minHashtags = this.getMinimalHashtags(components.hashtags);
    
    const finalContent = [content, minHashtags, components.url].filter(Boolean).join('\n');
    
    return {
      content: finalContent,
      length: finalContent.length,
      components,
      optimized: true,
      compressed: true
    };
  }

  // Smart text abbreviation
  static abbreviateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    
    // Try to find natural break points
    const sentences = text.split(/[.!?]/);
    if (sentences[0] && sentences[0].length <= maxLength) {
      return sentences[0] + (sentences.length > 1 ? '...' : '');
    }
    
    // Remove less important words
    const words = text.split(' ');
    const importantWords = words.filter(word => 
      !['the', 'a', 'an', 'is', 'was', 'were', 'and', 'or', 'but', 'in', 'on', 'at', 'to'].includes(word.toLowerCase())
    );
    
    let abbreviated = importantWords.join(' ');
    if (abbreviated.length <= maxLength) return abbreviated;
    
    // Final truncation
    return this.truncateWithEllipsis(text, maxLength);
  }

  // Condensed tech stack for space-constrained platforms
  static condenseTechStack(tech, maxLength) {
    if (tech.length <= maxLength) return tech;
    
    // Extract just technology names, remove "Built with", "Tech:", etc.
    const cleanTech = tech.replace(/^(Tech:|Built with:|🛠️\s*)/i, '');
    if (cleanTech.length <= maxLength) return cleanTech;
    
    // Abbreviate common technologies
    const abbreviated = cleanTech
      .replace(/JavaScript/gi, 'JS')
      .replace(/TypeScript/gi, 'TS')
      .replace(/Python/gi, 'Python')
      .replace(/, /g, ','); // Remove spaces after commas
    
    if (abbreviated.length <= maxLength) return abbreviated;
    
    // Take only first 2-3 technologies
    const techs = abbreviated.split(',');
    return techs.slice(0, 2).join(',') + (techs.length > 2 ? '+' : '');
  }

  // Get minimal versions for aggressive compression
  static getMinimalHook(hook) {
    return hook
      .replace(/🚀 Just shipped /, '🚀 ')
      .replace(/✨ (.+) is now live!/, '✨ $1 live!')
      .replace(/🎉 Completed /, '🎉 ')
      .replace(/💻 New project alert: /, '💻 ');
  }

  static getMinimalProgress(progress) {
    // Extract just the essential numbers
    const match = progress.match(/(\d+)\s*(commits?)/i);
    if (match) {
      return `${match[1]}c`;
    }
    return null;
  }

  static getMinimalTech(tech) {
    const cleanTech = tech.replace(/^(Tech:|Built with:|🛠️\s*)/i, '');
    const techs = cleanTech.split(/[,\s]+/).filter(Boolean);
    return techs.slice(0, 2).join(',');
  }

  static getMinimalHashtags(hashtags) {
    const tags = hashtags.split(' ').filter(tag => tag.startsWith('#'));
    return tags.slice(0, 2).join(' '); // Only top 2 hashtags for ultra-compact
  }

  // LinkedIn optimized content
  static generateLinkedInContent({ project, workLog, customMessage }) {
    const hook = customMessage || this.generateHook(project, 'linkedin');
    const story = this.generateStory(project, workLog);
    const achievement = this.generateAchievement(project, workLog, 'linkedin');
    const tech = this.generateTechStack(project.technologies, 'linkedin');
    const progress = workLog ? this.generateProgress(workLog, 'linkedin') : '';
    const reflection = this.generateReflection(project, workLog);
    const hashtags = this.generateHashtags(project, 'linkedin');
    const url = project.live_url || project.github_url || '';

    const content = [
      hook,
      '',
      story,
      '',
      achievement,
      '',
      progress,
      '',
      tech,
      '',
      reflection,
      '',
      hashtags,
      '',
      url ? `🔗 ${url}` : ''
    ].filter(Boolean).join('\n');

    return {
      content,
      length: content.length,
      optimized: content.length <= this.PLATFORM_LIMITS.linkedin.optimalLength
    };
  }

  // Facebook optimized content
  static generateFacebookContent({ project, workLog, customMessage }) {
    const hook = customMessage || this.generateHook(project, 'facebook');
    const story = this.generateStory(project, workLog);
    const achievement = this.generateAchievement(project, workLog, 'facebook');
    const progress = workLog ? this.generateProgress(workLog, 'facebook') : '';
    const url = project.live_url || project.github_url || '';

    const content = [
      hook,
      '',
      story,
      '',
      achievement,
      '',
      progress,
      '',
      url ? `Check it out: ${url}` : ''
    ].filter(Boolean).join('\n');

    return {
      content,
      length: content.length,
      optimized: content.length <= this.PLATFORM_LIMITS.facebook.optimalLength
    };
  }

  // Discord optimized content
  static generateDiscordContent({ project, workLog, customMessage }) {
    const hook = customMessage || `🎉 **${project.title}** is live!`;
    const description = project.description;
    const tech = `**Tech Stack:** ${project.technologies?.join(', ') || 'Various technologies'}`;
    const progress = workLog ? this.generateProgress(workLog, 'discord') : '';
    const url = project.live_url || project.github_url || '';

    const content = [
      hook,
      '',
      description,
      '',
      tech,
      '',
      progress,
      '',
      url ? `🔗 ${url}` : ''
    ].filter(Boolean).join('\n');

    return {
      content,
      length: content.length,
      optimized: content.length <= this.PLATFORM_LIMITS.discord.maxLength
    };
  }

  // Content generators
  static generateHook(project, platform) {
    const hooks = {
      twitter: [
        `🚀 Just shipped ${project.title}!`,
        `✨ ${project.title} is now live!`,
        `🎉 Completed ${project.title}!`,
        `💻 New project alert: ${project.title}`
      ],
      linkedin: [
        `🚀 Excited to share my latest project: ${project.title}`,
        `✨ Just completed an amazing project during my ALX journey: ${project.title}`,
        `💻 Proud to present ${project.title} - another milestone in my software engineering journey`,
        `🎯 Project spotlight: ${project.title}`
      ],
      facebook: [
        `🚀 Just finished working on ${project.title} and I'm really excited to share it!`,
        `✨ Hey everyone! I just completed ${project.title} as part of my ALX Software Engineering program`,
        `💻 Sharing my latest coding project: ${project.title}`
      ]
    };

    const platformHooks = hooks[platform] || hooks.twitter;
    return platformHooks[Math.floor(Math.random() * platformHooks.length)];
  }

  // Personalized hook generation based on commit activity
  static generatePersonalizedHook(project, workLog, platform) {
    if (!workLog || !workLog.summary) {
      return this.generateHook(project, platform);
    }

    const { summary, commitCount, timeframe } = workLog;
    const { mostActiveArea, categories } = summary;

    // Personalize based on commit activity
    const personalizedHooks = {
      twitter: {
        features: [
          `🚀 ${project.title} packed with new features!`,
          `✨ Feature-rich ${project.title} is live!`,
          `🎉 ${project.title} with ${categories.features} new features!`
        ],
        fixes: [
          `🐛 ${project.title} now bug-free & polished!`,
          `✅ ${project.title} refined & ready!`,
          `🚀 ${project.title} optimized & shipped!`
        ],
        refactor: [
          `⚡ ${project.title} rebuilt & improved!`,
          `🔥 ${project.title} completely refactored!`,
          `✨ ${project.title} clean & optimized!`
        ],
        docs: [
          `📚 ${project.title} fully documented & live!`,
          `✨ ${project.title} with complete docs!`,
          `🚀 ${project.title} documented & ready!`
        ]
      }
    };

    const platformHooks = personalizedHooks[platform]?.[mostActiveArea];
    if (platformHooks) {
      return platformHooks[Math.floor(Math.random() * platformHooks.length)];
    }

    // Fallback with activity context
    if (commitCount > 10) {
      return `🔥 After ${commitCount} commits, ${project.title} is ready!`;
    } else if (commitCount > 5) {
      return `💪 ${commitCount} commits later, ${project.title} is live!`;
    }

    return this.generateHook(project, platform);
  }

  // Smart progress generation with context awareness
  static generateSmartProgress(workLog, platform) {
    if (!workLog || !workLog.summary) return '';

    const { categories, mostActiveArea } = workLog.summary;
    const { commitCount, timeframe } = workLog;
    
    if (platform === 'twitter') {
      // Ultra-compact for Twitter
      if (commitCount > 20) return `${commitCount}c in ${timeframe} �`;
      if (commitCount > 10) return `${commitCount}c ${timeframe} 💪`;
      if (commitCount > 5) return `${commitCount}c last ${timeframe}`;
      return `${commitCount}c`;
    }

    // More detailed for other platforms
    const highlights = [];
    if (categories.features > 0) highlights.push(`${categories.features} features`);
    if (categories.fixes > 0) highlights.push(`${categories.fixes} fixes`);
    if (categories.refactor > 0) highlights.push(`${categories.refactor} refactors`);

    if (highlights.length === 0) {
      return `📈 ${commitCount} commits in ${timeframe}`;
    }

    return `📈 ${commitCount} commits: ${highlights.join(', ')}`;
  }

  // Smart hashtag generation based on project and activity
  static generateSmartHashtags(project, workLog, platform) {
    const baseTags = ['#ALXStudents', '#SoftwareEngineering'];
    
    // Add technology-specific tags
    const techTags = project.technologies?.slice(0, 2).map(tech => 
      `#${this.normalizeTechTag(tech)}`
    ) || [];
    
    // Add activity-based tags
    const activityTags = [];
    if (workLog && workLog.summary) {
      const { mostActiveArea, categories } = workLog.summary;
      
      if (categories.features > 3) activityTags.push('#NewFeatures');
      if (categories.fixes > 2) activityTags.push('#BugFixes');
      if (categories.refactor > 2) activityTags.push('#CodeRefactor');
      if (mostActiveArea === 'features') activityTags.push('#FeatureDev');
    }
    
    // Category-specific tags
    const categoryTags = {
      'web': ['#WebDev'],
      'backend': ['#Backend'],
      'mobile': ['#MobileApp'],
      'ai': ['#MachineLearning'],
      'data': ['#DataScience'],
      'devops': ['#DevOps']
    };

    const projectTags = categoryTags[project.category]?.slice(0, 1) || [];
    
    let allTags = [...baseTags, ...techTags, ...activityTags, ...projectTags];

    // Platform-specific limits and optimization
    if (platform === 'twitter') {
      allTags = allTags.slice(0, 3); // Strict limit for Twitter
    } else if (platform === 'linkedin') {
      allTags = allTags.slice(0, 5);
      allTags.push('#Coding'); // LinkedIn loves this
    }

    return allTags.join(' ');
  }

  // Normalize technology names for hashtags
  static normalizeTechTag(tech) {
    const normalized = tech
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .replace(/JavaScript/gi, 'JavaScript')
      .replace(/TypeScript/gi, 'TypeScript')
      .replace(/React/gi, 'ReactJS')
      .replace(/Vue/gi, 'VueJS')
      .replace(/Node/gi, 'NodeJS');
    
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  static generateAchievement(project, workLog, platform) {
    if (!workLog) return '';

    const { commitCount, timeframe } = workLog;
    
    if (platform === 'twitter') {
      return `${commitCount} commits in ${timeframe}`;
    }
    
    return `📈 Development highlights: ${commitCount} commits over the past ${timeframe}`;
  }

  static generateProgress(workLog, platform) {
    if (!workLog || !workLog.summary) return '';

    const { categories, mostActiveArea } = workLog.summary;
    const total = Object.values(categories).reduce((a, b) => a + b, 0);

    if (platform === 'twitter') {
      return `Recent work: ${total} commits (${mostActiveArea} focus)`;
    }

    if (platform === 'discord') {
      return `**Recent Activity:** ${total} commits with focus on ${mostActiveArea}`;
    }

    const breakdown = Object.entries(categories)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');

    return `📊 Recent development activity: ${breakdown}`;
  }

  static generateStory(project, workLog) {
    const stories = [
      `This project challenged me to dive deep into ${project.technologies?.[0] || 'new technologies'} and I'm thrilled with the results.`,
      `Working on this project has been an incredible learning experience, especially exploring ${project.technologies?.slice(0, 2).join(' and ') || 'new technologies'}.`,
      `${project.title} represents hours of problem-solving, debugging, and creative thinking.`
    ];

    return stories[Math.floor(Math.random() * stories.length)];
  }

  static generateReflection(project, workLog) {
    const reflections = [
      `This project reinforced my passion for software engineering and problem-solving. Can't wait to tackle the next challenge! 💪`,
      `Every project teaches me something new. Grateful for the ALX program and the amazing learning journey. 🙏`,
      `Building projects like this reminds me why I love coding. The satisfaction of seeing your ideas come to life is unmatched! ✨`
    ];

    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  static generateTechStack(technologies, platform) {
    if (!technologies || technologies.length === 0) return '';

    if (platform === 'twitter') {
      // Limit to 3 most important technologies for Twitter
      const topTech = technologies.slice(0, 3);
      return `Tech: ${topTech.join(', ')}`;
    }

    return `🛠️ Built with: ${technologies.join(', ')}`;
  }

  static generateHashtags(project, platform) {
    const baseTags = ['#ALXStudents', '#SoftwareEngineering', '#Coding'];
    const techTags = project.technologies?.slice(0, 2).map(tech => 
      `#${tech.replace(/[^a-zA-Z0-9]/g, '')}`
    ) || [];
    
    const categoryTags = {
      'web': ['#WebDev', '#Frontend'],
      'backend': ['#Backend', '#API'],
      'mobile': ['#MobileApp', '#AppDev'],
      'ai': ['#MachineLearning', '#AI'],
      'data': ['#DataScience', '#Analytics'],
      'devops': ['#DevOps', '#Infrastructure']
    };

    const projectTags = categoryTags[project.category] || [];
    
    let allTags = [...baseTags, ...techTags, ...projectTags];

    // Platform-specific tag limits
    if (platform === 'twitter') {
      allTags = allTags.slice(0, 4); // Limit hashtags for Twitter
    } else if (platform === 'linkedin') {
      allTags = allTags.slice(0, 6);
    }

    return allTags.join(' ');
  }

  // Utility methods
  static truncateWithEllipsis(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Generate work log summary for sharing
  static generateWorkLogSummary(workLog) {
    if (!workLog) return '';

    const { commitCount, timeframe, summary } = workLog;
    const { features, fixes, mostActiveArea } = summary;

    let logText = `📈 Work Log (${timeframe}):\n`;
    logText += `• ${commitCount} commits\n`;
    
    if (features.length > 0) {
      logText += `• New features: ${features.length}\n`;
    }
    
    if (fixes.length > 0) {
      logText += `• Bug fixes: ${fixes.length}\n`;
    }
    
    logText += `• Primary focus: ${mostActiveArea}`;

    return logText;
  }
}