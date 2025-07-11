// GitHub API service for fetching user repositories and project data
const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubService {
  // Fetch user repositories
  static async fetchUserRepositories(username) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('GitHub user not found. Please check the username.');
        }
        throw new Error('Failed to fetch repositories from GitHub.');
      }

      const repos = await response.json();
      return repos;
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      throw error;
    }
  }

  // Fetch repository README content
  static async fetchRepositoryReadme(username, repoName) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${repoName}/readme`);
      
      if (!response.ok) {
        return null; // README not found
      }

      const readmeData = await response.json();
      // Decode base64 content
      const content = atob(readmeData.content.replace(/\n/g, ''));
      return content;
    } catch (error) {
      console.error('Error fetching README:', error);
      return null;
    }
  }

  // Fetch repository languages
  static async fetchRepositoryLanguages(username, repoName) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${repoName}/languages`);
      
      if (!response.ok) {
        return {};
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      return {};
    }
  }

  // Fetch repository contents to analyze structure
  static async fetchRepositoryContents(username, repoName, path = '') {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${repoName}/contents/${path}`);
      
      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository contents:', error);
      return [];
    }
  }
}

// ALX Project Detection Service
export class ALXProjectDetector {
  // ALX-specific patterns for project detection
  static ALX_PATTERNS = {
    // Repository name patterns
    namePatterns: [
      /^0x[0-9A-F]{2}-/i,           // 0x00-, 0x01-, etc.
      /^alx-/i,                     // alx-low_level_programming
      /^holberton/i,                // holberton-system_engineering
      /simple_shell/i,              // simple_shell project
      /printf/i,                    // printf project
      /monty/i,                     // monty interpreter
      /sorting_algorithms/i,         // sorting algorithms
      /binary_trees/i,              // binary trees
      /AirBnB_clone/i,              // AirBnB clone projects
    ],

    // Topic/tag patterns
    topicPatterns: [
      'alx-software-engineering',
      'holberton-school',
      'c-programming',
      'python-programming',
      'low-level-programming',
      'system-engineering',
      'higher-level-programming',
      'alx-backend',
      'alx-frontend',
      'devops',
    ],

    // Description keywords
    descriptionKeywords: [
      'alx',
      'holberton',
      'software engineering',
      'low level programming',
      'higher level programming',
      'system engineering',
      'devops',
      'backend',
      'frontend',
    ],

    // File patterns that indicate ALX projects
    filePatterns: [
      'holberton.h',
      'main.c',
      'README.md',
      'AUTHORS',
      '_putchar.c',
      'lists.h',
      'variadic_functions.h',
      'function_pointers.h',
      'dog.h',
      'search_algos.h',
    ],

    // Directory structure patterns
    directoryPatterns: [
      /^0x[0-9A-F]{2}-/i,           // 0x00-hello_world, etc.
      /^[0-9]+-/,                   // 1-compiler, 2-assembler, etc.
      /tests?/i,                    // tests directory
      /scripts?/i,                  // scripts directory
    ]
  };

  // Main detection method
  static async detectALXProjects(repositories, username) {
    const alxProjects = [];

    for (const repo of repositories) {
      const score = await this.calculateALXScore(repo, username);
      
      if (score.isALXProject) {
        alxProjects.push({
          ...repo,
          alx_score: score.score,
          alx_category: score.category,
          alx_confidence: score.confidence,
          detected_features: score.features
        });
      }
    }

    // Sort by confidence and last updated
    return alxProjects.sort((a, b) => {
      if (a.alx_confidence !== b.alx_confidence) {
        return b.alx_confidence - a.alx_confidence;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
  }

  // Calculate ALX project score
  static async calculateALXScore(repo, username) {
    let score = 0;
    let features = [];
    let category = 'other';
    
    // Check repository name
    const nameScore = this.checkNamePatterns(repo.name);
    score += nameScore.score;
    features.push(...nameScore.features);
    
    // Check topics
    const topicScore = this.checkTopics(repo.topics || []);
    score += topicScore.score;
    features.push(...topicScore.features);
    
    // Check description
    const descScore = this.checkDescription(repo.description || '');
    score += descScore.score;
    features.push(...descScore.features);
    
    // Determine category based on name and description
    category = this.determineCategory(repo.name, repo.description, repo.topics);
    
    // Bonus points for typical ALX characteristics
    if (repo.language === 'C') score += 2;
    if (repo.language === 'Python') score += 1.5;
    if (repo.size < 1000) score += 1; // ALX projects are usually small
    if (!repo.fork) score += 1; // Original work gets bonus
    
    const confidence = Math.min(score / 10, 1); // Normalize to 0-1
    const isALXProject = score >= 3; // Threshold for ALX project
    
    return {
      score,
      confidence,
      isALXProject,
      category,
      features: [...new Set(features)] // Remove duplicates
    };
  }

  // Check name patterns
  static checkNamePatterns(name) {
    let score = 0;
    let features = [];
    
    for (const pattern of this.ALX_PATTERNS.namePatterns) {
      if (pattern.test(name)) {
        score += 3;
        features.push(`Name matches ALX pattern: ${pattern.source}`);
        break; // Only count one name pattern match
      }
    }
    
    return { score, features };
  }

  // Check topics
  static checkTopics(topics) {
    let score = 0;
    let features = [];
    
    for (const topic of topics) {
      if (this.ALX_PATTERNS.topicPatterns.includes(topic.toLowerCase())) {
        score += 2;
        features.push(`Topic: ${topic}`);
      }
    }
    
    return { score, features };
  }

  // Check description
  static checkDescription(description) {
    let score = 0;
    let features = [];
    
    const lowerDesc = description.toLowerCase();
    for (const keyword of this.ALX_PATTERNS.descriptionKeywords) {
      if (lowerDesc.includes(keyword)) {
        score += 1;
        features.push(`Description contains: ${keyword}`);
      }
    }
    
    return { score, features };
  }

  // Determine project category
  static determineCategory(name, description = '', topics = []) {
    const nameAndDesc = (name + ' ' + description + ' ' + topics.join(' ')).toLowerCase();
    
    if (/0x0[0-6]|low.?level|system|unix|linux|shell|printf|malloc/i.test(nameAndDesc)) {
      return 'low-level';
    }
    if (/0x0[7-9]|0x1[0-5]|higher.?level|python|oop|object/i.test(nameAndDesc)) {
      return 'python';
    }
    if (/frontend|html|css|javascript|react|bootstrap/i.test(nameAndDesc)) {
      return 'frontend';
    }
    if (/backend|api|database|sql|mysql|flask|django/i.test(nameAndDesc)) {
      return 'backend';
    }
    if (/devops|deployment|docker|nginx|load.?balancer|monitoring/i.test(nameAndDesc)) {
      return 'devops';
    }
    if (/airbnb|clone|full.?stack/i.test(nameAndDesc)) {
      return 'fullstack';
    }
    if (/machine.?learning|ai|data/i.test(nameAndDesc)) {
      return 'ai-ml';
    }
    
    return 'general';
  }

  // Auto-generate project data from GitHub repo
  static async generateProjectData(repo, username) {
    // Fetch additional data
    const [readme, languages] = await Promise.all([
      GitHubService.fetchRepositoryReadme(username, repo.name),
      GitHubService.fetchRepositoryLanguages(username, repo.name)
    ]);

    // Extract description from README if repo description is empty
    let description = repo.description || '';
    if (!description && readme) {
      // Extract first paragraph from README
      const lines = readme.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.length > 20 && !line.startsWith('#') && !line.startsWith('*')) {
          description = line.substring(0, 200) + (line.length > 200 ? '...' : '');
          break;
        }
      }
    }

    // Generate technologies array from languages
    const technologies = Object.keys(languages || {});
    
    // Map ALX category to showcase category
    const categoryMap = {
      'low-level': 'backend',
      'python': 'backend', 
      'frontend': 'web',
      'backend': 'backend',
      'devops': 'devops',
      'fullstack': 'web',
      'ai-ml': 'ai',
      'general': 'other'
    };

    return {
      title: this.generateTitle(repo.name),
      description: description || `${repo.name} - ALX Software Engineering project`,
      technologies,
      github_url: repo.html_url,
      live_url: repo.homepage || '',
      category: categoryMap[repo.alx_category] || 'other',
      original_repo_name: repo.name,
      alx_confidence: repo.alx_confidence,
      last_updated: repo.updated_at
    };
  }

  // Generate user-friendly title from repo name
  static generateTitle(repoName) {
    return repoName
      .replace(/[-_]/g, ' ')
      .replace(/0x\d+/g, match => `${match.toUpperCase()} -`)
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }
}