// github-service.js

// GitHub API service for fetching user repositories and project data
const GITHUB_API_BASE = 'https://api.github.com';
// Retrieve GitHub Token from environment variables
// Ensure this is correctly loaded by your build tool (e.g., Vite uses import.meta.env)
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Prepare headers for authenticated requests
const getHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };
  // Only add Authorization header if GITHUB_TOKEN is present and not empty
  if (GITHUB_TOKEN && GITHUB_TOKEN.length > 0) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  return headers;
};

export class GitHubService {
  // Fetch user repositories
  static async fetchUserRepositories(username) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`, {
        headers: getHeaders(), // Use authenticated headers
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('GitHub user not found. Please check the username.');
        }
        if (response.status === 403) {
          // Provide more specific message for 403
          throw new Error('GitHub API rate limit exceeded or forbidden. Please try again later. Ensure you have a valid GitHub Personal Access Token (PAT) with `public_repo` scope set in your VITE_GITHUB_TOKEN environment variable.');
        }
        throw new Error(`Failed to fetch repositories from GitHub: ${response.statusText || response.status}`);
      }

      const repos = await response.json();
      return repos;
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error.message ? String(error.message) : String(error));
      throw error;
    }
  }

  // Fetch repository README content
  static async fetchRepositoryReadme(username, repoName) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${repoName}/readme`, {
        headers: getHeaders(), // Use authenticated headers
      });
      
      if (!response.ok) {
        // If 404, it means no README, which is fine.
        // If 403, it means forbidden, so throw an error to be caught by generateProjectData.
        if (response.status === 403) {
          throw new Error(`Forbidden: Could not access README for ${username}/${repoName}. Check token permissions.`);
        }
        // For other non-OK statuses (e.g., 404), return null to indicate no README found.
        return null; 
      }

      const readmeData = await response.json();
      // Defensive check: Ensure readmeData and readmeData.content exist and are strings
      if (!readmeData || typeof readmeData.content !== 'string') {
        console.warn(`README content not found or not a string for ${username}/${repoName}. Returning null.`);
        return null;
      }
      // Decode base64 content
      const content = atob(readmeData.content.replace(/\n/g, ''));
      return content;
    } catch (error) {
      // Re-throw 403 errors, log others
      if (error.message.includes('Forbidden')) {
        throw error; // Propagate the specific 403 error
      }
      console.error(`Error fetching README for ${username}/${repoName}:`, error.message ? String(error.message) : String(error));
      return null;
    }
  }

  // Fetch repository languages
  static async fetchRepositoryLanguages(username, repoName) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${repoName}/languages`, {
        headers: getHeaders(), // Use authenticated headers
      });
      
      if (!response.ok) {
        // If 403, it means forbidden, so throw an error to be caught by generateProjectData.
        if (response.status === 403) {
          throw new Error(`Forbidden: Could not access languages for ${username}/${repoName}. Check token permissions.`);
        }
        console.error(`Error fetching languages for ${username}/${repoName}. Status: ${response.status}, Message: ${response.statusText || response.status}`);
        return {};
      }

      return await response.json();
    } catch (error) {
      // Re-throw 403 errors, log others
      if (error.message.includes('Forbidden')) {
        throw error; // Propagate the specific 403 error
      }
      console.error(`Error fetching languages for ${username}/${repoName}:`, error.message ? String(error.message) : String(error));
      return {};
    }
  }

  // Fetch repository contents to analyze structure (less critical for ALX detection, but useful)
  static async fetchRepositoryContents(username, repoName, path = '') {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${repoName}/contents/${path}`, {
        headers: getHeaders(), // Use authenticated headers
      });
      
      if (!response.ok) {
        // If 403, it means forbidden, so throw an error.
        if (response.status === 403) {
          throw new Error(`Forbidden: Could not access contents for ${username}/${repoName}/${path}. Check token permissions.`);
        }
        console.error(`Error fetching contents for ${username}/${repoName}/${path}. Status: ${response.status}, Message: ${response.statusText || response.status}`);
        return [];
      }

      return await response.json();
    } catch (error) {
      // Re-throw 403 errors, log others
      if (error.message.includes('Forbidden')) {
        throw error; // Propagate the specific 403 error
      }
      console.error(`Error fetching repository contents for ${username}/${repoName}/${path}:`, error.message ? String(error.message) : String(error));
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

  // Main detection method - now returns processed project data
  static async detectALXProjects(repositories, username) {
    const alxProjects = [];
    const skippedProjects = []; // To track projects that failed generation

    for (const repo of repositories) {
      const score = await this.calculateALXScore(repo, username);
      
      // Log the detection score for each repository
      console.log(`[detectALXProjects] Repo: ${repo.name}, ALX Score: ${score.score}, Is ALX Project: ${score.isALXProject}`);

      if (score.isALXProject) {
        try {
          // Pass alx_category and alx_confidence directly to generateProjectData
          const processedProject = await this.generateProjectData(
            repo, 
            username, 
            score.category, 
            score.confidence
          );
          if (processedProject) {
            // Add ALX specific scores to the processed project
            processedProject.alx_score = score.score;
            // alx_category and alx_confidence are now set inside generateProjectData
            processedProject.detected_features = score.features;
            alxProjects.push(processedProject);
            console.log(`[detectALXProjects] Successfully processed ALX project: ${processedProject.title} (ID: ${processedProject.id})`);
          } else {
            // If generateProjectData returns null (e.g., due to API error), skip
            skippedProjects.push({ repoName: repo.name, reason: 'Failed to generate project data' });
            console.warn(`[detectALXProjects] Skipped project ${repo.name}: Failed to generate project data.`);
          }
        } catch (error) {
          console.error(`Error processing ALX project ${repo.name}:`, error.message ? String(error.message) : String(error));
          skippedProjects.push({ repoName: repo.name, reason: error.message });
        }
      }
    }

    // Sort by confidence and last updated (using 'last_updated' from processed project)
    const sortedProjects = alxProjects.sort((a, b) => {
      if (a.alx_confidence !== b.alx_confidence) {
        return b.alx_confidence - a.alx_confidence;
      }
      return new Date(b.last_updated) - new Date(a.last_updated);
    });

    console.log("ALXProjectDetector.detectALXProjects returning:", { alxProjects: sortedProjects, skippedProjects });
    return { alxProjects: sortedProjects, skippedProjects }; // Return an object with both
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
  static async generateProjectData(repo, username, alxCategory, alxConfidence) {
    let readmeContent = null;
    let languagesData = {};

    try {
      // Log the repo and username being processed
      console.log(`[generateProjectData] Attempting to fetch data for repo: ${repo.name} by user: ${username}`);

      // Fetch README and languages independently, handling their potential null returns
      readmeContent = await GitHubService.fetchRepositoryReadme(username, repo.name);
      languagesData = await GitHubService.fetchRepositoryLanguages(username, repo.name);
      
      console.log(`[generateProjectData] Fetched for ${username}/${repo.name}:`);
      console.log(`  - readmeContent: ${readmeContent ? 'Available (length: ' + readmeContent.length + ')' : 'Null/Undefined'}`);
      console.log(`  - languagesData: ${Object.keys(languagesData).length > 0 ? 'Available (keys: ' + Object.keys(languagesData).join(', ') + ')' : 'Empty/Undefined'}`);

    } catch (error) {
      // This catch block will only be hit if fetchRepositoryReadme or fetchRepositoryLanguages
      // throw an error that's not handled internally (e.g., a 403 that's re-thrown).
      console.warn(`Skipping project ${repo.name} due to critical GitHub API access error during data fetching: ${error.message}`);
      return null; // Return null if critical error prevents even basic data fetching
    }

    // Continue processing even if readmeContent or languagesData are null/empty
    let description = repo.description || '';
    if (!description && typeof readmeContent === 'string') { // Explicitly check if readmeContent is a string
      console.log(`[generateProjectData] Processing README for ${repo.name}. readmeContent type: ${typeof readmeContent}, length: ${readmeContent.length}`);
      // Ensure readmeContent is a string before calling split
      const lines = (readmeContent || '').split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.length > 20 && !line.startsWith('#') && !line.startsWith('*')) {
          description = line.substring(0, 200) + (line.length > 200 ? '...' : '');
          console.log(`[generateProjectData] Extracted description from README for ${repo.name}: "${description}"`);
          break;
        }
      }
      if (!description) {
        console.warn(`[generateProjectData] Could not extract a suitable description from README for ${repo.name}.`);
      }
    } else if (!description && (readmeContent === null || readmeContent === undefined)) { // More robust check for null/undefined
        console.warn(`[generateProjectData] No description or README content available for ${username}/${repo.name}.`);
    } else if (typeof readmeContent !== 'string' && readmeContent !== null && readmeContent !== undefined) { // Log unexpected types
        console.error(`[generateProjectData] Unexpected readmeContent type for ${repo.name}: ${typeof readmeContent}. Value:`, readmeContent);
    }


    // Generate technologies array from languages
    console.log(`[generateProjectData] Processing languages for ${repo.name}. languagesData type: ${typeof languagesData}.`);
    const technologies = Object.keys(languagesData || {});
    console.log(`[generateProjectData] Generated technologies for ${repo.name}:`, technologies);
    
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

    const projectData = {
      id: repo.id, // Include the original GitHub repository ID
      title: this.generateTitle(repo.name), // Ensures title is always generated from repo.name
      description: description || `${repo.name} - ALX Software Engineering project`, // Fallback description
      technologies,
      tags: [], // Ensure tags is always an empty array by default
      github_url: repo.html_url,
      live_url: repo.homepage || '',
      // Use the alxCategory and alxConfidence passed as arguments
      category: categoryMap[alxCategory] || 'other', 
      original_repo_name: repo.name,
      alx_confidence: alxConfidence, 
      is_public: !repo.private, // Derive is_public from GitHub repo's private status
      last_updated: repo.updated_at
    };

    console.log(`[generateProjectData] Final project data for ${repo.name}:`, projectData);
    return projectData;
  }

  // Generate user-friendly title from repo name
  static generateTitle(repoName) {
    if (!repoName) return 'Untitled Project'; // Fallback for empty repoName

    return repoName
      .replace(/[-_]/g, ' ')
      .replace(/0x\d+/g, match => `${match.toUpperCase()} -`)
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }
}
