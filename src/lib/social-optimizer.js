// github-commits-service.js

// Import the base GitHubService to reuse authentication headers and possibly other utilities
// Assuming github-service.js is in the same directory or accessible via '@/lib/github-service.js'
// If you want to keep this entirely separate and not extend, you'd copy getHeaders() here.
import { GitHubService } from './github-service.js'; 

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN; // Ensure token is accessible

// Helper to get authentication headers
const getHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN && GITHUB_TOKEN.length > 0) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  return headers;
};

export class GitHubCommitsService {
  /**
   * Parses a GitHub repository URL to extract the owner and repository name.
   * Handles both full URLs and owner/repo format.
   * @param {string} repoUrl - The GitHub repository URL (e.g., 'https://github.com/owner/repo' or 'owner/repo').
   * @returns {{owner: string, repo: string}|null} An object with owner and repo, or null if invalid.
   */
  static parseGitHubUrl(repoUrl) {
    if (!repoUrl) return null;

    try {
      let owner, repo;
      const url = new URL(repoUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);

      if (pathParts.length >= 2) {
        owner = pathParts[0];
        repo = pathParts[1];
      } else {
        // Fallback for 'owner/repo' format if not a full URL
        const directParts = repoUrl.split('/');
        if (directParts.length === 2) {
          owner = directParts[0];
          repo = directParts[1];
        } else {
          return null;
        }
      }
      return { owner, repo: repo.replace(/\.git$/, '') }; // Remove .git suffix if present
    } catch (e) {
      // If it's not a valid URL, try splitting as 'owner/repo'
      const directParts = repoUrl.split('/');
      if (directParts.length === 2) {
        return { owner: directParts[0], repo: directParts[1].replace(/\.git$/, '') };
      }
      console.error('Invalid GitHub repository URL format:', repoUrl, e);
      return null;
    }
  }

  /**
   * Fetches recent commit data for a given GitHub repository.
   * This method now uses authentication headers.
   *
   * @param {string} githubUrl - The full GitHub repository URL (e.g., 'https://github.com/owner/repo').
   * @param {number} limit - The maximum number of commits to fetch (default: 10).
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of commit objects.
   */
  static async fetchRepositoryCommits(githubUrl, limit = 10) {
    const parsed = this.parseGitHubUrl(githubUrl);
    if (!parsed) {
      console.warn('Could not parse repository URL for commit fetching:', githubUrl);
      return [];
    }

    const { username, repoName } = parsed;

    if (!GITHUB_TOKEN) {
      console.error('GitHub Personal Access Token (VITE_GITHUB_TOKEN) is not set. Cannot fetch commits.');
      // Return an empty array or throw an error based on desired behavior
      throw new Error('GitHub token missing. Cannot fetch commits.');
    }

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${username}/${repoName}/commits?per_page=${limit}`,
        {
          headers: getHeaders(), // Use authentication headers
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository '${username}/${repoName}' not found or incorrect URL/permissions.`);
        }
        if (response.status === 401) {
          throw new Error('GitHub token invalid or insufficient permissions for this repository.');
        }
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded or forbidden. Ensure you have a valid GitHub PAT with `public_repo` scope.');
        }
        throw new Error(`Failed to fetch commits from GitHub: ${response.statusText || response.status}`);
      }

      const commits = await response.json();
      // Map to a simplified, consistent format
      return commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || 'Unknown', // Defensive check for author
        date: commit.commit.author?.date,
        url: commit.html_url
      }));
    } catch (error) {
      console.error(`Error fetching commits for ${username}/${repoName}:`, error.message ? String(error.message) : String(error));
      throw error; // Re-throw to allow calling function (e.g., Redux thunk) to handle
    }
  }

  // Removed generateWorkLog and analyzeCommits as they are now handled by OpenAI service
  // and SocialContentOptimizer (for internal content generation logic) respectively.
}
