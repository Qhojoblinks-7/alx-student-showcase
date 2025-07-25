// src/lib/github-service.js

/**
 * @typedef {object} GitHubRepo
 * @property {string} id - The unique ID of the repository.
 * @property {string} name - The name of the repository.
 * @property {string} description - The description of the repository.
 * @property {string} html_url - The URL to the repository on GitHub.
 * @property {string} language - The primary programming language of the repository.
 * @property {string[]} topics - An array of topics (keywords) associated with the repository.
 * @property {string} default_branch - The name of the default branch.
 * @property {boolean} private - Whether the repository is private.
 */

/**
 * @typedef {object} DetectedALXProject
 * @property {string} repoId - The ID of the original GitHub repository.
 * @property {string} name - The name of the repository.
 * @property {string} description - The description of the repository.
 * @property {string} url - The URL to the repository on GitHub.
 * @property {string} [category] - Suggested project category (e.g., "Web Development", "System Programming").
 * @property {string[]} [technologies] - Suggested technologies used in the project.
 * @property {number} confidenceScore - A score from 0-100 indicating confidence it's an ALX project.
 * @property {boolean} isALX - True if confidently detected as an ALX project.
 * @property {string} [suggestedName] - A cleaner suggested name for the project.
 * @property {string} [suggestedDescription] - A refined suggested description.
 */

const GITHUB_API_BASE_URL = 'https://api.github.com';

/**
 * GitHubService class for interacting with the GitHub API.
 */
class GitHubService {
  /**
   * Fetches public repositories for a given GitHub username.
   * Requires VITE_GITHUB_TOKEN in your .env file for authentication and higher rate limits.
   * @param {string} username - The GitHub username.
   * @returns {Promise<GitHubRepo[]>} - A promise that resolves to an array of GitHub repositories.
   * @throws {Error} - Throws an error if the API call fails or response is not OK.
   */
  async fetchUserRepositories(username) {
    const token = import.meta.env.VITE_GITHUB_TOKEN; // Ensure this is set in your .env.local or similar
    if (!token) {
      console.warn('VITE_GITHUB_TOKEN is not set. API requests might be rate-limited or fail for private repos.');
    }

    const headers = token ? { Authorization: `token ${token}` } : {};

    try {
      const response = await fetch(`${GITHUB_API_BASE_URL}/users/${username}/repos?per_page=100`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User "${username}" not found on GitHub.`);
        }
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      // Structure and filter relevant repo data
      return data.map(repo => ({
        id: repo.id.toString(), // Ensure ID is string for consistency
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        topics: repo.topics || [], // Topics might be null/undefined for some repos
        default_branch: repo.default_branch,
        private: repo.private,
      }));
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw error;
    }
  }

  // If fetching README.md content is needed for deeper analysis,
  // it would be another method here, but it's often rate-limited
  // and resource-intensive for a wizard. Sticking to metadata as per prompt.
  // async fetchReadmeContent(owner, repoName) { /* ... */ }
}

/**
 * ALXProjectDetector utility to analyze GitHub repositories and infer if they are ALX projects.
 */
class ALXProjectDetector {
  /**
   * Analyzes an array of GitHub repository objects to detect ALX projects.
   * @param {GitHubRepo[]} repositories - An array of structured GitHub repository objects.
   * @returns {DetectedALXProject[]} - An array of detected ALX project objects.
   */
  detectALXProjects(repositories) {
    const detectedProjects = [];

    const alxKeywords = ['alx', 'holberton', '0x', 'foundations', 'low_level_programming', 'higher_level_programming', 'sysadmin', 'devops', 'web_stack', 'data_structures', 'algorithm'];
    const languageKeywords = {
      'c': ['C', 'C programming', 'low_level_programming'],
      'python': ['Python', 'python scripting', 'higher_level_programming', 'data_structures'],
      'javascript': ['JavaScript', 'JS', 'frontend', 'web_stack'],
      'html/css': ['HTML', 'CSS', 'web design', 'frontend', 'web_stack'],
      'shell': ['Shell', 'Bash', 'scripting', 'sysadmin'],
      'devops': ['DevOps', 'CI/CD', 'sysadmin', 'automation'],
      'databases': ['SQL', 'MySQL', 'PostgreSQL', 'database'],
    };

    const categoryKeywords = {
      'Web Development': ['web', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'react', 'node'],
      'System Programming': ['c', 'low_level_programming', 'linux', 'unix', 'shell', 'system', 'kernel'],
      'Higher-Level Programming': ['python', 'javascript', 'data_structures', 'algorithms', 'oop'],
      'DevOps/SysAdmin': ['devops', 'sysadmin', 'bash', 'scripting', 'servers', 'nginx', 'apache'],
      'Data Structures & Algorithms': ['data_structures', 'algorithms', 'sorting', 'searching'],
    };

    repositories.forEach(repo => {
      let score = 0;
      const matchedKeywords = new Set();
      const detectedTechnologies = new Set();
      let detectedCategory = null;

      const lowerCaseName = repo.name ? repo.name.toLowerCase() : '';
      const lowerCaseDescription = repo.description ? repo.description.toLowerCase() : '';
      const lowerCaseTopics = repo.topics ? repo.topics.map(t => t.toLowerCase()) : [];
      const lowerCaseLanguage = repo.language ? repo.language.toLowerCase() : '';

      // Check for ALX-specific keywords in name and description
      alxKeywords.forEach(keyword => {
        if (lowerCaseName.includes(keyword) || lowerCaseDescription.includes(keyword) || lowerCaseTopics.includes(keyword)) {
          score += 20; // Strong indicator
          matchedKeywords.add(keyword);
        }
      });

      // Check for common ALX naming patterns
      if (lowerCaseName.startsWith('alx-') || lowerCaseName.includes('_holberton')) {
        score += 30; // Very strong indicator
        matchedKeywords.add('naming_convention');
      }

      // Check for specific languages frequently used in ALX
      if (lowerCaseLanguage === 'c') { score += 15; detectedTechnologies.add('C'); }
      if (lowerCaseLanguage === 'python') { score += 15; detectedTechnologies.add('Python'); }
      if (lowerCaseLanguage === 'javascript') { score += 10; detectedTechnologies.add('JavaScript'); }
      if (lowerCaseLanguage === 'html' || lowerCaseLanguage === 'css') { score += 5; detectedTechnologies.add('HTML/CSS'); }
      if (lowerCaseLanguage === 'shell') { score += 5; detectedTechnologies.add('Shell Script'); }

      // Infer technologies from description/topics
      for (const tech in languageKeywords) {
        if (languageKeywords[tech].some(keyword => lowerCaseDescription.includes(keyword) || lowerCaseTopics.includes(keyword) || lowerCaseName.includes(keyword))) {
          detectedTechnologies.add(tech.charAt(0).toUpperCase() + tech.slice(1)); // Capitalize first letter
          score += 5; // Moderate indicator
        }
      }

      // Infer category
      for (const category in categoryKeywords) {
        if (categoryKeywords[category].some(keyword => lowerCaseName.includes(keyword) || lowerCaseDescription.includes(keyword) || lowerCaseTopics.includes(keyword) || lowerCaseLanguage.includes(keyword))) {
          detectedCategory = category;
          score += 10; // Category match adds to score
          break; // Take the first strong category match
        }
      }

      // Adjust score to be within 0-100 range and normalize
      score = Math.min(100, Math.max(0, score)); // Cap at 100, floor at 0

      // A simple heuristic for ALX detection
      const isALX = score >= 50 || matchedKeywords.size >= 2;

      if (isALX) {
        // Suggest a cleaner name
        let suggestedName = repo.name;
        if (suggestedName.toLowerCase().startsWith('alx-')) {
          suggestedName = suggestedName.substring(4);
        }
        suggestedName = suggestedName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words

        // Suggest a refined description based on ALX context
        let suggestedDescription = repo.description || 'No description provided.';
        if (!suggestedDescription.toLowerCase().includes('alx')) {
          suggestedDescription = `An ALX-related project: ${suggestedDescription}`;
        }

        detectedProjects.push({
          repoId: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          category: detectedCategory,
          technologies: Array.from(detectedTechnologies),
          confidenceScore: score,
          isALX: isALX,
          suggestedName: suggestedName,
          suggestedDescription: suggestedDescription,
        });
      }
    });

    return detectedProjects;
  }
}

export const githubService = new GitHubService();
export const alxProjectDetector = new ALXProjectDetector();