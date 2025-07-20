// src/lib/ai-service.js
// Removed: import axios from 'axios';
import { GitHubCommitsService } from './github-commits-service.js';

// IMPORTANT: These should be loaded securely from environment variables (e.g., .env.local)
// For local development, ensure VITE_OPENAI_API_KEY is set in your .env.local file.
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // Correctly load from environment
const OPENAI_CHAT_API_URL = 'https://api.openai.com/v1/chat/completions'; // OpenAI API endpoint
const DEFAULT_OPENAI_MODEL = 'gpt-3.5-turbo'; // Default model for OpenAI

/**
 * Fetches project recommendations based on user preferences.
 * Uses the OpenAI Chat Completions API.
 *
 * @param {object} userPreferences - An object containing user's project preferences (e.g., { skills: ['React', 'Node.js'], difficulty: 'intermediate', interests: ['web development', 'AI'] }).
 * @returns {Promise<string[]>} A promise that resolves to an array of project idea strings.
 */
export const getProjectRecommendations = async (userPreferences) => {
  if (!OPENAI_API_KEY) {
    console.error('AI Service: OpenAI API Key is not set. Please check your .env.local file.');
    throw new Error('AI Service: OpenAI API Key is missing.');
  }

  try {
    const promptMessage = `As an ALX Software Engineering project recommender, suggest 3 concise and distinct project ideas. Focus on practical, buildable projects that align with the provided user preferences.
    User preferences: ${JSON.stringify(userPreferences, null, 2)}

    Format the output as a numbered list, one project idea per line. Ensure each idea is brief and clear.`;

    const payload = {
      model: DEFAULT_OPENAI_MODEL,
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
    };

    const response = await fetch( // Switched to fetch API
      OPENAI_CHAT_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload), // Stringify the body for fetch
      }
    );

    if (!response.ok) { // Check for HTTP errors
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json(); // Parse response as JSON

    // Corrected response parsing for OpenAI API
    if (data && data.choices && data.choices.length > 0 &&
        data.choices[0].message && data.choices[0].message.content) {
      const rawText = data.choices[0].message.content.trim();
      return rawText.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(line => line.length > 0);
    } else {
      throw new Error("Invalid response structure from OpenAI API for recommendations.");
    }
  } catch (error) {
    console.error('AI Service: Error fetching project recommendations:', error.message);
    throw error;
  }
};

/**
 * Generates a concise summary for a given project.
 * Uses the OpenAI Chat Completions API.
 *
 * @param {object} projectDetails - An object containing details of a project (e.g., { title: 'My Awesome App', description: 'A mobile app that does X.', technologies: ['React Native', 'Firebase'] }).
 * @returns {Promise<string>} A promise that resolves to a concise project summary string.
 */
export const generateProjectSummary = async (projectDetails) => {
  if (!OPENAI_API_KEY) {
    console.error('AI Service: OpenAI API Key is not set. Please check your .env.local file.');
    throw new Error('AI Service: OpenAI API Key is missing.');
  }

  try {
    const promptMessage = `Generate a concise, 2-3 sentence summary for the following ALX Software Engineering project. Focus on its purpose, key features, and main technologies used.
    Project Details: ${JSON.stringify(projectDetails, null, 2)}`;

    const payload = {
      model: DEFAULT_OPENAI_MODEL,
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
    };

    const response = await fetch( // Switched to fetch API
      OPENAI_CHAT_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload), // Stringify the body for fetch
      }
    );

    if (!response.ok) { // Check for HTTP errors
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json(); // Parse response as JSON

    // Corrected response parsing for OpenAI API
    if (data && data.choices && data.choices.length > 0 &&
        data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response structure from OpenAI API for project summary.");
    }
  } catch (error) {
    console.error('AI Service: Error generating project summary:', error.message);
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
    console.error('AI Service: OpenAI API Key is not set. Please check your .env.local file.');
    throw new Error('AI Service: OpenAI API Key is missing.');
  }

  try {
    // 1. Fetch recent commit messages from GitHub using GitHubCommitsService
    const commitMessages = await GitHubCommitsService.fetchRecentCommitMessages(githubRepoUrl, commitLimit);

    if (commitMessages.length === 0) {
      return 'No recent commit activity found to generate a work log.';
    }

    const commitsString = commitMessages.map((msg, index) => `- ${msg}`).join('\n'); // Use bullet points for input clarity

    const promptMessage = `As an ALX Software Engineering student reflecting on recent work, generate a detailed and humanized work log entry based on the following GitHub commit messages.

    Structure the work log with a brief introductory sentence, then describe the key developments and challenges overcome in a narrative style. Group related tasks and explain their impact. Aim for 3-5 sentences, making it sound like a personal update from a developer.

    Recent GitHub Commit Messages:
    ${commitsString}

    Work Log:`;

    // 2. Use OpenAI to summarize the commit messages
    const payload = {
      model: DEFAULT_OPENAI_MODEL,
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
      max_tokens: 250, // Increased significantly for more detail
      temperature: 0.7, // Slightly higher to encourage more natural, narrative phrasing
      n: 1,
    };

    const response = await fetch( // Switched to fetch API
      OPENAI_CHAT_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload), // Stringify the body for fetch
      }
    );

    if (!response.ok) { // Check for HTTP errors
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json(); // Parse response as JSON

    if (data && data.choices && data.choices.length > 0 &&
        data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response structure from OpenAI API for work log summary.");
    }
  } catch (error) {
    console.error('AI Service: Error generating work log summary:', error.message);
    // Propagate specific error messages if they are user-friendly
    if (error.message && (error.message.includes('GitHub token missing') || error.message.includes('Repository not found') || error.message.includes('rate limit exceeded'))) {
      return `Failed to generate work log: ${error.message}`;
    }
    return 'Failed to generate work log. Please check the repository URL and your GitHub token.'; // Generic fallback
  }
};
