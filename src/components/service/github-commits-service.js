// src/lib/github-commits-service.js

const GITHUB_API_BASE_URL = 'https://api.github.com';

export const githubCommitsService = {
  /**
   * Parses a GitHub repository URL to extract the owner and repository name.
   * @param {string} url - The full GitHub repository URL.
   * @returns {{owner: string, repoName: string} | null} An object with owner and repoName, or null if invalid.
   */
  parseGitHubUrl: (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean); // Filter out empty strings

      if (urlObj.hostname !== 'github.com' || pathParts.length < 2) {
        return null;
      }

      const owner = pathParts[0];
      const repoName = pathParts[1];
      return { owner, repoName };
    } catch (error) {
      console.error("Error parsing GitHub URL:", error);
      return null;
    }
  },

  /**
   * Fetches commit data for a given GitHub repository.
   * @param {string} owner - The repository owner's username.
   * @param {string} repoName - The repository name.
   * @param {string} userAccessToken - The user's GitHub access token. Required for private repos and higher limits.
   * @param {string | null} sinceDate - Optional: ISO 8601 timestamp to only return commits after this date.
   * @param {string} branch - The branch to fetch commits from (default: 'main').
   * @param {number} perPage - Number of commits per page (default: 30, max: 100).
   * @returns {Promise<Array<object>>} An array of simplified commit objects.
   * @throws {Error} If the API request fails.
   */
  fetchRepositoryCommits: async (owner, repoName, userAccessToken, sinceDate = null, branch = 'main', perPage = 100) => {
    let url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repoName}/commits?sha=${branch}&per_page=${perPage}`;
    if (sinceDate) {
      url += `&since=${sinceDate}`;
    }

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (userAccessToken) { // Use the user's token if available
      headers['Authorization'] = `Bearer ${userAccessToken}`;
    } else {
      // For commit fetching, especially for private repos, a token is almost always needed.
      throw new Error('User access token is required to fetch commits.');
    }

    try {
      const response = await fetch(url, { headers });

      if (response.status === 404) {
        throw new Error(`Repository or branch not found: ${owner}/${repoName} (${branch})`);
      }
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json();
        throw new Error(`GitHub API Unauthorized/Permission error fetching commits: ${errorData.message || response.statusText}. Please check your token permissions or try again later.`);
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      // Map to a simplified structure for AI processing
      return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author?.name || commit.author?.login || 'Unknown',
          email: commit.commit.author?.email || null,
        },
        date: commit.commit.author?.date,
        html_url: commit.html_url,
      }));
    } catch (error) {
      console.error('Error fetching GitHub commits:', error.message);
      throw error;
    }
  },
};