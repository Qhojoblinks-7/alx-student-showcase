// src/lib/github-commits-service.js

/**
 * @file GitHubCommitsService provides utilities for fetching and parsing GitHub commit data.
 * @module GitHubCommitsService
 */

// Placeholder for an actual API key if needed for higher rate limits or private repos.
// For public repositories, GitHub's unauthenticated rate limit is usually sufficient.
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Parses a GitHub repository URL to extract the username and repository name.
 * @param {string} url - The GitHub repository URL (e.g., "https://github.com/username/repo", "username/repo").
 * @returns {{username: string, repoName: string}|null} An object containing username and repoName, or null if invalid.
 */
function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Regular expression to match GitHub URLs or "username/repo" format
  const match = url.match(/(?:github\.com\/)?([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)(?:\.git)?\/?/i);

  if (match && match[1] && match[2]) {
    return {
      username: match[1],
      repoName: match[2],
    };
  }
  return null;
}

/**
 * Fetches commits for a given GitHub repository within a specified timeframe.
 * @param {string} username - The GitHub username.
 * @param {string} repoName - The GitHub repository name.
 * @param {number} days - The number of days back to fetch commits (e.g., 7 for last 7 days).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of commit objects.
 * @throws {Error} If the API request fails or returns an error.
 */
async function fetchCommits(username, repoName, days) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const isoSinceDate = sinceDate.toISOString();

  const url = `https://api.github.com/repos/${username}/${repoName}/commits?since=${isoSinceDate}`;

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (GITHUB_API_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_API_TOKEN}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const commits = await response.json();
    return commits;
  } catch (error) {
    console.error('Error fetching commits from GitHub:', error);
    throw error;
  }
}

/**
 * Categorizes a commit message based on common conventional commit prefixes.
 * @param {string} message - The commit message.
 * @returns {string} The category of the commit (e.g., 'feat', 'fix', 'refactor', 'docs', 'chore', 'other').
 */
function categorizeCommit(message) {
  const lowerCaseMessage = message.toLowerCase();
  if (lowerCaseMessage.startsWith('feat')) return 'features';
  if (lowerCaseMessage.startsWith('fix')) return 'fixes';
  if (lowerCaseMessage.startsWith('refactor')) return 'refactor';
  if (lowerCaseMessage.startsWith('docs')) return 'documentation';
  if (lowerCaseMessage.startsWith('chore')) return 'chores';
  if (lowerCaseMessage.startsWith('style')) return 'styles';
  if (lowerCaseMessage.startsWith('test')) return 'tests';
  if (lowerCaseMessage.startsWith('build')) return 'build';
  if (lowerCaseMessage.startsWith('ci')) return 'ci';
  if (lowerCaseMessage.startsWith('perf')) return 'performance';
  if (lowerCaseMessage.startsWith('revert')) return 'revert';
  return 'other';
}

/**
 * Analyzes a list of commits to generate a work log summary.
 * @param {Array<Object>} commits - An array of commit objects from GitHub API.
 * @param {number} timeframe - The number of days the commits cover.
 * @returns {{commitCount: number, timeframe: number, summary: Object, latestCommit: Object|null}} The work log summary.
 */
function generateWorkLogSummary(commits, timeframe) {
  const commitCount = commits.length;
  const categories = {
    features: 0,
    fixes: 0,
    refactor: 0,
    documentation: 0,
    chores: 0,
    styles: 0,
    tests: 0,
    build: 0,
    ci: 0,
    performance: 0,
    revert: 0,
    other: 0,
  };
  const areaCounts = {}; // To track most active development area

  let latestCommit = null;

  commits.forEach(commit => {
    const message = commit.commit.message;
    const category = categorizeCommit(message);
    categories[category]++;

    // Simple heuristic for active area: use the first word after the type, or the whole message
    const areaMatch = message.match(/^(feat|fix|refactor|docs|chore|style|test|build|ci|perf|revert)?(?:\(.+\))?:?\s*([^:\n]+)/i);
    if (areaMatch && areaMatch[2]) {
      const area = areaMatch[2].trim().split(' ')[0].toLowerCase(); // Take the first word after the type/scope
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    } else {
      // If no clear area, categorize by first few words of the message
      const generalArea = message.split(' ').slice(0, 2).join(' ').toLowerCase();
      if (generalArea) {
        areaCounts[generalArea] = (areaCounts[generalArea] || 0) + 1;
      }
    }

    // Find the latest commit
    const commitDate = new Date(commit.commit.author.date);
    if (!latestCommit || commitDate > new Date(latestCommit.date)) {
      latestCommit = {
        message: commit.commit.message,
        date: commit.commit.author.date,
        url: commit.html_url,
      };
    }
  });

  let mostActiveArea = 'various areas';
  let maxAreaCount = 0;
  for (const area in areaCounts) {
    if (areaCounts[area] > maxAreaCount) {
      maxAreaCount = areaCounts[area];
      mostActiveArea = area;
    }
  }

  return {
    commitCount,
    timeframe,
    summary: {
      categories,
      mostActiveArea,
    },
    latestCommit,
  };
}

/**
 * Generates a comprehensive work log for a GitHub repository.
 * @param {string} username - The GitHub username.
 * @param {string} repoName - The GitHub repository name.
 * @param {number} days - The number of days back to fetch commits.
 * @returns {Promise<{commitCount: number, timeframe: number, summary: Object, latestCommit: Object|null}|null>}
 * A promise that resolves to the work log summary, or null if no commits are found.
 */
async function generateWorkLog(username, repoName, days) {
  try {
    const commits = await fetchCommits(username, repoName, days);
    if (commits && commits.length > 0) {
      return generateWorkLogSummary(commits, days);
    }
    return null;
  } catch (error) {
    console.error('Failed to generate work log:', error);
    throw error;
  }
}

/**
 * Fetches recent commit messages for a given GitHub repository within a specified timeframe.
 * This function extracts only the commit messages from the fetched commits.
 * @param {string} username - The GitHub username.
 * @param {string} repoName - The GitHub repository name.
 * @param {number} days - The number of days back to fetch commits.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of commit messages.
 * @throws {Error} If the API request fails or returns an error.
 */
async function fetchRecentCommitMessages(username, repoName, days) {
  try {
    const commits = await fetchCommits(username, repoName, days);
    return commits.map(commit => commit.commit.message);
  } catch (error) {
    console.error('Failed to fetch recent commit messages:', error);
    throw error;
  }
}

export const GitHubCommitsService = {
  parseGitHubUrl,
  fetchCommits,
  generateWorkLog,
  fetchRecentCommitMessages, // Added the new function here
};
