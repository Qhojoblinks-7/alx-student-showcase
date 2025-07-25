// src/lib/github-service.js

const GITHUB_API_BASE_URL = 'https://api.github.com';

/**
 * Provides core functionalities for interacting with the GitHub API.
 */
export const githubService = {

  /**
   * Fetches repositories for the authenticated user.
   * This function should be used with a user's personal GitHub access token.
   * @param {string} userAccessToken - The personal GitHub access token obtained via OAuth.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of simplified repository objects.
   * @throws {Error} If the API request fails (e.g., invalid token, rate limit).
   */
  fetchUserRepositories: async (userAccessToken) => {
    if (!userAccessToken) {
      throw new Error('GitHub access token is required to fetch user repositories.');
    }

    try {
      // Use /user/repos for the authenticated user
      const response = await fetch(`${GITHUB_API_BASE_URL}/user/repos?type=all&sort=updated&per_page=100`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${userAccessToken}`, // Use the passed userAccessToken
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized: Invalid or expired GitHub access token. Please re-connect your GitHub account.');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error fetching user repos: ${errorData.message || response.statusText}`);
      }

      const rawRepos = await response.json();

      // Simplify and normalize the repository objects
      const simplifiedRepos = rawRepos.map(repo => ({
        id: repo.id.toString(),
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
        },
        description: repo.description,
        default_branch: repo.default_branch,
        is_private: repo.private, // Added this field
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
      }));

      return simplifiedRepos;
    } catch (error) {
      console.error('Error fetching authenticated user GitHub repositories:', error.message);
      throw error;
    }
  },

  /**
   * Fetches basic repository details for a specific repository.
   * This might or might not need a user token, depending on if the repo is private.
   * For consistency, and to allow access to private repos, pass the token here.
   * @param {string} owner - The repository owner's username.
   * @param {string} repoName - The repository name.
   * @param {string} [userAccessToken] - Optional: The user's GitHub access token.
   * @returns {Promise<object>} A promise that resolves to a simplified repository object.
   * @throws {Error} If the API request fails.
   */
  fetchRepositoryInfo: async (owner, repoName, userAccessToken = null) => {
    if (!owner || !repoName) {
      throw new Error('Repository owner and name are required.');
    }
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
      };
      if (userAccessToken) {
        headers['Authorization'] = `Bearer ${userAccessToken}`;
      }

      const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repoName}`, { headers });

      if (response.status === 404) {
        throw new Error(`Repository "${owner}/${repoName}" not found.`);
      }
      if (response.status === 401 || response.status === 403) {
         const errorData = await response.json();
         throw new Error(`GitHub API Unauthorized/Permission error for repo info: ${errorData.message || response.statusText}.`);
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id.toString(),
        name: data.name,
        full_name: data.full_name,
        owner: { login: data.owner.login, avatar_url: data.owner.avatar_url },
        description: data.description,
        default_branch: data.default_branch,
        html_url: data.html_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        language: data.language,
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count,
        topics: data.topics || [],
        is_private: data.private,
      };
    } catch (error) {
      console.error('Error fetching GitHub repository info:', error.message);
      throw error;
    }
  },
};

/**
 * ALXProjectDetector: Analyzes GitHub repositories to suggest ALX project categories and technologies.
 * This remains unchanged and still operates on the simplified repo objects.
 */
export const ALXProjectDetector = {
  detectALXProjects: (repositories) => {
    if (!Array.isArray(repositories)) {
      throw new Error('Input must be an array of repositories.');
    }

    const keywordCategories = {
      'ALX Curriculum': ['alx', 'holberton', 'holbertonschool', '0x00', '0x01', '0x02', '0x03', '0x04', '0x05', '0x06', '0x07', '0x08', '0x09', '0x0A', '0x0B', '0x0C', '0x0D', '0x0E', '0x0F', '0x10', '0x11', '0x12', '0x13', '0x14'],
      'Web Development (Frontend)': ['web', 'frontend', 'react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript', 'ui', 'ux', 'bootstrap', 'tailwind', 'material-ui'],
      'Web Development (Backend)': ['backend', 'node', 'express', 'python', 'flask', 'django', 'php', 'laravel', 'ruby', 'rails', 'api', 'rest', 'graphql', 'server'],
      'Mobile Development': ['mobile', 'android', 'ios', 'flutter', 'react-native', 'kotlin', 'swift', 'xcode'],
      'Data Science & ML': ['data science', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'python', 'r', 'pandas', 'numpy', 'scipy', 'sklearn', 'tensorflow', 'pytorch', 'jupyter'],
      'Systems & Low-level Programming': ['c', 'c++', 'assembly', 'linux', 'unix', 'system programming', 'kernel', 'os', 'shell'],
      'Database Management': ['sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'database', 'db'],
      'DevOps & Cloud': ['devops', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'ansible'],
      'Cybersecurity': ['security', 'cybersecurity', 'hacking', 'penetration testing', 'vulnerability', 'encryption'],
      'Game Development': ['game', 'unity', 'unreal', 'gamedev'],
      'Blockchain': ['blockchain', 'ethereum', 'solidity', 'web3', 'cryptocurrency', 'dapp'],
      'General Programming': ['programming', 'algorithms', 'data structures', 'scripts', 'cli'],
    };

    const detectedProjects = repositories.map(repo => {
      let suggestedCategory = 'Uncategorized';
      let suggestedTechnologies = [];
      let confidenceScore = 0;
      let isALXProject = false;
      let aiSummary = null;

      const lowerCaseName = repo.name ? repo.name.toLowerCase() : '';
      const lowerCaseDescription = repo.description ? repo.description.toLowerCase() : '';
      const lowerCaseLanguage = repo.language ? repo.language.toLowerCase() : '';
      const lowerCaseTopics = (repo.topics || []).map(topic => topic.toLowerCase());

      // Check for ALX specific keywords first (highest priority)
      for (const keyword of keywordCategories['ALX Curriculum']) {
        if (lowerCaseName.includes(keyword) || lowerCaseDescription.includes(keyword) || lowerCaseTopics.includes(keyword)) {
          isALXProject = true;
          suggestedCategory = 'ALX Curriculum';
          confidenceScore = Math.min(100, confidenceScore + 30); // Boost confidence for ALX
          aiSummary = `This project appears to be directly related to the ALX curriculum, likely covering foundational ${repo.language || 'programming'} concepts.`;
          break; // Found an ALX keyword, so categorize as ALX and break
        }
      }

      // If not definitively ALX, try to infer other categories
      if (!isALXProject) {
        let bestMatchCategory = 'Uncategorized';
        let bestMatchScore = 0;

        for (const category in keywordCategories) {
          if (category === 'ALX Curriculum') continue; // Skip ALX if already checked

          let currentScore = 0;
          const keywords = keywordCategories[category];
          for (const keyword of keywords) {
            if (lowerCaseName.includes(keyword)) currentScore += 5;
            if (lowerCaseDescription.includes(keyword)) currentScore += 3;
            if (lowerCaseTopics.includes(keyword)) currentScore += 7; // Topics are strong indicators
            if (lowerCaseLanguage.includes(keyword)) currentScore += 10; // Language is a very strong indicator
          }

          if (currentScore > bestMatchScore) {
            bestMatchScore = currentScore;
            suggestedCategory = category;
          }
        }
        suggestedCategory = bestMatchCategory;
        confidenceScore = Math.min(100, confidenceScore + bestMatchScore);
        if (bestMatchCategory !== 'Uncategorized' && !aiSummary) {
          aiSummary = `This project seems to be a ${bestMatchCategory} project, focusing on ${repo.language || 'various'} technologies.`;
        }
      }

      // Infer technologies (can be multi-valued)
      // Start with the main language
      if (repo.language) {
        suggestedTechnologies.push(repo.language);
      }
      // Add technologies based on keywords, avoid duplicates
      for (const category in keywordCategories) {
        for (const keyword of keywordCategories[category]) {
          if ((lowerCaseName.includes(keyword) || lowerCaseDescription.includes(keyword) || lowerCaseTopics.includes(keyword)) &&
            !suggestedTechnologies.some(tech => tech.toLowerCase() === keyword)) {
            suggestedTechnologies.push(keyword.charAt(0).toUpperCase() + keyword.slice(1)); // Capitalize
          }
        }
      }
      suggestedTechnologies = [...new Set(suggestedTechnologies)].sort(); // Deduplicate and sort

      // Determine suggested difficulty (a simple heuristic)
      let suggestedDifficulty = 'Beginner';
      if (confidenceScore > 50 || repo.stargazers_count > 5 || repo.forks_count > 0 || isALXProject) {
        suggestedDifficulty = 'Intermediate';
      }
      if (confidenceScore > 80 || repo.stargazers_count > 20) {
        suggestedDifficulty = 'Advanced';
      }

      return {
        id: repo.id,
        github_id: repo.id,
        title: repo.name,
        description: repo.description,
        github_url: repo.html_url,
        is_public: !repo.is_private, // Use is_private from original repo
        is_alx_project: isALXProject,
        suggested_category: suggestedCategory,
        suggested_technologies: suggestedTechnologies,
        suggested_difficulty: suggestedDifficulty,
        confidence_score: confidenceScore,
        ai_summary: aiSummary || 'AI analysis suggests this project aligns with general development work.',
        // Include other original repo fields useful for display or further processing
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
      };
    });

    return detectedProjects;
  },
};