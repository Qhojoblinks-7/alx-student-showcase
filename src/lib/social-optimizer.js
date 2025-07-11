// Enhanced GitHub service for commit data and work logs
import { GitHubService } from './github-service.js';

export class GitHubCommitsService extends GitHubService {
  // Fetch recent commits for a repository
  static async fetchRepositoryCommits(username, repoName, limit = 10) {
    try {
      const response = await fetch(
        `${this.GITHUB_API_BASE}/repos/${username}/${repoName}/commits?per_page=${limit}`
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
      console.error('Error fetching commits:', error);
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
      console.error('Error generating work log:', error);
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
    
    // Build content components
    const components = {
      hook: customMessage || this.generateHook(project, 'twitter'),
      achievement: this.generateAchievement(project, workLog, 'twitter'),
      tech: this.generateTechStack(project.technologies, 'twitter'),
      progress: workLog ? this.generateProgress(workLog, 'twitter') : '',
      hashtags: this.generateHashtags(project, 'twitter'),
      url: project.live_url || project.github_url || ''
    };

    // Calculate available space
    const urlSpace = components.url ? limit.urlLength + 1 : 0; // +1 for space
    const hashtagSpace = components.hashtags.length + 1;
    const availableSpace = limit.maxLength - urlSpace - hashtagSpace;

    // Build content prioritizing by importance
    let content = '';
    
    // Priority 1: Hook/Achievement (most important)
    const mainContent = components.hook || components.achievement;
    if (mainContent.length <= availableSpace - 20) {
      content = mainContent;
    } else {
      content = this.truncateWithEllipsis(mainContent, availableSpace - 20);
    }

    // Priority 2: Add progress if there's space
    if (components.progress && (content.length + components.progress.length + 2) <= availableSpace) {
      content += '\n\n' + components.progress;
    }

    // Priority 3: Add tech if there's space  
    const remainingSpace = availableSpace - content.length;
    if (components.tech && remainingSpace > 20) {
      const techToAdd = this.truncateWithEllipsis(components.tech, remainingSpace - 2);
      content += '\n\n' + techToAdd;
    }

    // Add hashtags and URL
    const finalContent = [
      content.trim(),
      components.hashtags,
      components.url
    ].filter(Boolean).join('\n\n');

    return {
      content: finalContent,
      length: finalContent.length,
      components,
      optimized: true
    };
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