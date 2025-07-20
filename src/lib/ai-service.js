// src/lib/ai-service.js
<<<<<<< HEAD
import axios from "https://cdn.jsdelivr.net/npm/axios@1.6.8/dist/axios.min.js";
=======
import axios from 'axios';
>>>>>>> 4f55a7184f9095bbe4d6a2908be37121f0923d9a
import { GitHubCommitsService } from './github-commits-service'; // Corrected import

const OPENAI_CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEFAULT_MODEL = 'gpt-3.5-turbo';

/**
 * Fetches project recommendations based on user preferences.
 * Uses the Chat Completions API for better performance and cost.
 *
 * @param {object} userPreferences - An object containing user's project preferences (e.g., { skills: ['React', 'Node.js'], difficulty: 'intermediate', interests: ['web development', 'AI'] }).
 * @returns {Promise<string[]>} A promise that resolves to an array of project idea strings.
 */
export const getProjectRecommendations = async (userPreferences) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API Key is not set. Please check your .env.local file.');
    throw new Error('OpenAI API Key is missing.');
  }

  try {
    const promptMessage = `As an ALX Software Engineering project recommender, suggest 3 concise and distinct project ideas. Focus on practical, buildable projects that align with the provided user preferences.
    User preferences: ${JSON.stringify(userPreferences, null, 2)}

    Format the output as a numbered list, one project idea per line. Ensure each idea is brief and clear.`;

    const response = await axios.post(
      OPENAI_CHAT_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for ALX Software Engineering students, specialized in generating practical project ideas.',
          },
          {
            role: 'user',
            content: promptMessage,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const rawText = response.data.choices[0].message.content.trim();
    return rawText.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(line => line.length > 0);
  } catch (error) {
    console.error('Error fetching project recommendations:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Generates a concise summary for a given project.
 * Uses the Chat Completions API for better performance and cost.
 *
 * @param {object} projectDetails - An object containing details of a project (e.g., { title: 'My Awesome App', description: 'A mobile app that does X.', technologies: ['React Native', 'Firebase'] }).
 * @returns {Promise<string>} A promise that resolves to a concise project summary string.
 */
export const generateProjectSummary = async (projectDetails) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API Key is not set. Please check your .env.local file.');
    throw new Error('OpenAI API Key is missing.');
  }

  try {
    const promptMessage = `Generate a concise, 2-3 sentence summary for the following ALX Software Engineering project. Focus on its purpose, key features, and main technologies used.
    Project Details: ${JSON.stringify(projectDetails, null, 2)}`;

    const response = await axios.post(
      OPENAI_CHAT_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specialized in summarizing software engineering projects for portfolios.',
          },
          {
            role: 'user',
            content: promptMessage,
          },
        ],
        max_tokens: 80,
        temperature: 0.5,
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating project summary:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Generates a detailed and humanized work log summary from a list of GitHub commit messages.
 * This function first fetches commits via GitHub API, then uses OpenAI to summarize them.
 *
 * @param {string} githubRepoUrl - The URL of the GitHub repository.
 * @param {number} [commitLimit=10] - The number of recent commits to fetch for summarization.
 * @returns {Promise<string>} A promise that resolves to a detailed, humanized work log summary string.
 */
export const generateWorkLogSummary = async (githubRepoUrl, commitLimit = 10) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API Key is not set. Please check your .env.local file.');
    throw new Error('OpenAI API Key is missing.');
  }

  try {
    // 1. Parse the GitHub URL to get username and repoName
    const githubInfo = GitHubCommitsService.parseGitHubUrl(githubRepoUrl);
    if (!githubInfo) {
      throw new Error('Invalid GitHub URL provided for work log generation.');
    }

    // 2. Fetch recent commit messages from GitHub using the correct service method
    const commitMessages = await GitHubCommitsService.fetchRecentCommitMessages(githubInfo.username, githubInfo.repoName, commitLimit);

    if (commitMessages.length === 0) {
      return 'No recent commit activity found to generate a work log.';
    }

    const commitsString = commitMessages.map((msg, index) => `- ${msg}`).join('\n'); // Use bullet points for input clarity

    const promptMessage = `As an ALX Software Engineering student reflecting on recent work, generate a detailed and humanized work log entry based on the following GitHub commit messages.

    Structure the work log with a brief introductory sentence, then describe the key developments and challenges overcome in a narrative style. Group related tasks and explain their impact. Aim for 3-5 sentences, making it sound like a personal update from a developer.

    Recent GitHub Commit Messages:
    ${commitsString}

    Work Log:`;

    // 3. Use OpenAI to summarize the commit messages
    const response = await axios.post(
      OPENAI_CHAT_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that helps ALX Software Engineering students articulate their recent development progress in a detailed, human-friendly, and professional work log format.',
          },
          {
            role: 'user',
            content: promptMessage,
          },
        ],
        max_tokens: 250, // Increased significantly for more detail (approx. 50-60 words per sentence * 5 sentences)
        temperature: 0.7, // Slightly higher to encourage more natural, narrative phrasing
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating work log summary:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 403 && error.response.data.message.includes('API rate limit exceeded')) {
      return 'GitHub API rate limit exceeded. Please try again later for work log generation.';
    } else if (error.message.includes('No recent commit activity')) {
        return error.message;
    }
    return 'Failed to generate work log. Please check the repository URL and your GitHub token.';
  }
};
