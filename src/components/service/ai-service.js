// src/lib/ai-service.js

// Ensure your Gemini API key is securely loaded from environment variables.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set. AI services will not function.');
  // In a production environment, you might want to throw an error or disable AI features.
}

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash'; // Using the fast flash model

/**
 * AI Service for interacting with the Google Gemini API.
 */
export const aiService = {

  /**
   * Internal helper to call the Gemini API.
   * Handles common request structure, JSON schema, and error handling.
   * @param {string} prompt - The user prompt for the AI.
   * @param {object | null} schema - Optional JSON schema for structured output.
   * @returns {Promise<string | object>} The parsed text response or JSON object from the AI.
   * @throws {Error} If the API request fails or the response is invalid.
   */
  _callGeminiAPI: async (prompt, schema = null) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured.");
    }
    if (!prompt) {
      throw new Error("AI prompt cannot be empty.");
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: schema ? 0.0 : 0.7, // Lower temperature for structured output, higher for creative
        topP: 0.95, // Adjust for diversity
        topK: 60,   // Adjust for diversity
      },
    };

    if (schema) {
      requestBody.generationConfig.responseMimeType = "application/json";
      requestBody.generationConfig.responseSchema = schema;
    }

    try {
      const response = await fetch(
        `${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Gemini API error: ${errorMessage} (Code: ${response.status})`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
        const firstPart = data.candidates[0].content.parts[0];
        if (schema && firstPart.text) {
          try {
            return JSON.parse(firstPart.text);
          } catch (parseError) {
            console.error("Failed to parse AI JSON response:", firstPart.text, parseError);
            throw new Error("AI response was not valid JSON as expected by schema.");
          }
        } else if (firstPart.text) {
          return firstPart.text; // Return plain text for non-schema requests
        }
      }

      throw new Error("Invalid or empty response from Gemini API.");

    } catch (error) {
      console.error('Error calling Gemini API:', error.message);
      throw error;
    }
  },

  /**
   * Generates a concise 2-3 sentence summary of a project.
   * @param {object} projectDetails - Contains project properties like title, description, technologies, key_learnings, challenges.
   * @returns {Promise<string>} AI-generated summary.
   */
  generateProjectSummary: async (projectDetails) => {
    const { title, description, technologies, key_learnings, challenges_faced } = projectDetails;

    const prompt = `Generate a concise, engaging 2-3 sentence summary for the following project, highlighting its purpose, key technologies, and main outcomes:\n\n` +
                   `Project Title: "${title || 'N/A'}"\n` +
                   `Description: "${description || 'N/A'}"\n` +
                   `Technologies Used: ${technologies && technologies.length > 0 ? technologies.join(', ') : 'N/A'}\n` +
                   `Key Learnings: "${key_learnings || 'N/A'}"\n` +
                   `Challenges Faced: "${challenges_faced || 'N/A'}"\n\n` +
                   `The summary should be suitable for a portfolio or project showcase.`;

    return await aiService._callGeminiAPI(prompt);
  },

  /**
   * Generates a humanized work log entry summarizing recent commits.
   * @param {Array<object>} commits - Array of simplified commit objects ({ sha, message, author.name, date }).
   * @returns {Promise<string>} AI-generated work log.
   */
  generateWorkLogSummary: async (commits) => {
    if (!Array.isArray(commits) || commits.length === 0) {
      return "No commit data available to generate a work log summary.";
    }

    const commitList = commits.map(commit => {
      const authorName = commit.author?.name || 'Unknown';
      const date = commit.date ? new Date(commit.date).toLocaleDateString() : 'Unknown Date';
      return `- [${date}, ${authorName}] ${commit.message.split('\n')[0].trim()}`;
    }).join('\n');

    const prompt = `Generate a concise, human-readable work log summary based on the following Git commits. Focus on grouping related changes, highlighting key features, bug fixes, or significant progress. Write it as if you are reporting your personal progress. Avoid technical jargon where possible, or explain it briefly.\n\n` +
                   `Commits:\n${commitList}\n\n` +
                   `Provide a summary that is 3-5 paragraphs long, suitable for a project update or personal reflection.`;

    return await aiService._callGeminiAPI(prompt);
  },

  /**
   * Synthesizes user bio, skills, certifications, achievements, and project summaries into an overall portfolio summary.
   * This is the function that consolidates all user and project data for a high-level overview.
   * @param {object} userProfileDetails - Contains user bio, skills, social links, certifications, achievements, etc.
   * @param {Array<object>} projects - Array of user's project objects (with their summaries).
   * @returns {Promise<string>} AI-generated portfolio summary.
   */
  generateUserPortfolioSummary: async (userProfileDetails, projects) => {
    const { bio, skills, certifications, achievements, social_links } = userProfileDetails;

    const projectSummaries = projects.map(p => `- ${p.title}: ${p.ai_summary || p.description}`).join('\n');

    const prompt = `Synthesize the following user's profile and project data into a concise 2-3 sentence overall portfolio summary. Highlight the user's core strengths, key areas of expertise, and overall contribution as a developer/professional.\n\n` +
                   `User Bio: "${bio || 'N/A'}"\n` +
                   `Skills: ${skills && skills.length > 0 ? skills.join(', ') : 'N/A'}\n` +
                   `Certifications: ${certifications && certifications.length > 0 ? certifications.join(', ') : 'N/A'}\n` +
                   `Achievements: "${achievements || 'N/A'}"\n` +
                   `Projects Overview:\n${projectSummaries || 'N/A'}\n\n` +
                   `The summary should be impactful and suitable for a professional profile overview.`;

    return await aiService._callGeminiAPI(prompt);
  },

  /**
   * Suggests 2-3 project ideas/improvements based on user's profile and existing projects.
   * Returns a structured array of objects.
   * @param {Array<string>} userSkills - List of user's skills.
   * @param {string} userBio - User's biographical summary.
   * @param {Array<object>} userProjects - Array of user's project objects (with titles, descriptions, technologies).
   * @returns {Promise<Array<Object>>} Array of { title: string, reason: string }.
   */
  getProjectRecommendations: async (userSkills, userBio, userProjects) => {
    const projectList = userProjects.map(p => `- ${p.title} (${p.technologies ? p.technologies.join(', ') : 'No Tech'}): ${p.description}`).join('\n');

    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "A concise title for the project idea or improvement." },
          reason: { type: "string", description: "A brief explanation of why this project or improvement is recommended, relating to the user's profile or current projects." }
        },
        required: ["title", "reason"]
      },
      minItems: 2,
      maxItems: 3,
      description: "A list of 2-3 project ideas or improvements tailored to the user's profile and existing projects."
    };

    const prompt = `Based on the following user profile and their existing projects, suggest 2 to 3 new project ideas or improvements to existing projects. Focus on areas where they can expand their skills, apply existing knowledge in new domains, or fill identified gaps. Provide a title and a brief reason for each suggestion.\n\n` +
                   `User Skills: ${userSkills && userSkills.length > 0 ? userSkills.join(', ') : 'N/A'}\n` +
                   `User Bio: "${userBio || 'N/A'}"\n` +
                   `Existing Projects:\n${projectList || 'N/A'}\n\n` +
                   `Return the suggestions as a JSON array of objects, each with 'title' and 'reason' keys.`;

    return await aiService._callGeminiAPI(prompt, schema);
  },

  /**
   * Identifies potential skill gaps based on the user's current profile and projects, and suggests skills to learn.
   * Returns a structured array of strings.
   * @param {Array<string>} userSkills - List of user's skills.
   * @param {string} userBio - User's biographical summary.
   * @param {Array<object>} userProjects - Array of user's project objects (with titles, descriptions, technologies).
   * @returns {Promise<Array<string>>} List of suggested skill gaps.
   */
  getSkillGaps: async (userSkills, userBio, userProjects) => {
    const projectTechnologies = [...new Set(userProjects.flatMap(p => p.technologies || []))].join(', ');

    const schema = {
      type: "array",
      items: { type: "string", description: "A skill or technology that the user could learn or improve upon." },
      minItems: 2,
      maxItems: 5,
      description: "A list of 2-5 potential skill gaps identified from the user's profile and projects, with suggestions for career growth."
    };

    const prompt = `Based on the following user's skills, bio, and projects, identify 2 to 5 potential skill gaps or areas for growth that would enhance their profile and career trajectory. Suggest specific technologies or concepts they could learn.\n\n` +
                   `User Skills: ${userSkills && userSkills.length > 0 ? userSkills.join(', ') : 'N/A'}\n` +
                   `User Bio: "${userBio || 'N/A'}"\n` +
                   `Technologies used in projects: ${projectTechnologies || 'N/A'}\n\n` +
                   `Return the skill gaps as a JSON array of strings.`;

    return await aiService._callGeminiAPI(prompt, schema);
  },

  analyzeProjectForForm: async (projectDetails) => {
    const { title, description, technologies, key_learnings, challenges_faced } = projectDetails;
    const prompt = `Analyze the following project details and provide a structured JSON object with key insights. Include the project's main purpose, technologies used, key learnings, challenges faced, and any notable achievements. The output should be suitable for populating a project form or summary.\n\n` +
                   `Project Title: "${title || 'N/A'}"\n` +
                   `Description: "${description || 'N/A'}"\n` +
                   `Technologies Used: ${technologies && technologies.length > 0 ? technologies.join(', ') : 'N/A'}\n` +
                   `Key Learnings: "${key_learnings || 'N/A'}"\n` +
                   `Challenges Faced: "${challenges_faced || 'N/A'}"\n\n` +
                   `Return the analysis as a structured JSON object with keys: title, description, technologies, key_learnings, challenges_faced.`;
    const schema = {
      type: "object",
      properties: {
        title: { type: "string", description: "The project title." },
        description: { type: "string", description: "A brief description of the project."
        },
        technologies: { type: "array", items: { type: "string" }, description: "List of technologies used in the project." },
        key_learnings: { type: "string", description: "Key learnings from the project." },
        challenges_faced: { type: "string", description: "Challenges faced during the project." }
      },
      required: ["title", "description", "technologies", "key_learnings", "challenges_faced"],
      description: "Structured analysis of the project details."
    };
    return await aiService._callGeminiAPI(prompt, schema);
    },

  /**
   * Generates optimized content for various social media platforms.
   * @param {object} contentData - Object containing: projectName, projectDescription, projectTechnologies, projectUrl, workLog, rawCommits, customMessage.
   * @returns {Promise<object>} An object with optimized content for twitter, linkedin, facebook, discord.
   */
  generatePlatformContent: async (contentData) => {
    const { projectName, projectDescription, projectTechnologies, projectUrl, workLog, rawCommits, customMessage } = contentData;

    const schema = {
      type: "object",
      properties: {
        twitter: {
          type: "string",
          description: "A concise Tweet (max 280 characters, include hashtags, maybe an emoji).",
          maxLength: 280
        },
        linkedin: {
          type: "string",
          description: "A professional LinkedIn post (longer, more detail, call to action, relevant hashtags).",
        },
        facebook: {
          type: "string",
          description: "A friendly Facebook post (engaging, conversational, maybe a question, relevant hashtags).",
        },
        discord: {
          type: "string",
          description: "A casual Discord message (can be more technical, direct, less formal hashtags/mentions).",
        }
      },
      required: ["twitter", "linkedin", "facebook", "discord"]
    };

    const prompt = `Optimize the following project update and work log into suitable posts for different social media platforms (Twitter, LinkedIn, Facebook, Discord). Ensure each post is tailored to the platform's conventions (e.g., character limits for Twitter, professionalism for LinkedIn, community feel for Discord). Include relevant emojis, hashtags, and a clear call to action (e.g., link to project/profile) where appropriate.

Project Name: "${projectName || 'My Project'}"
Project Description: "${projectDescription || 'A software development project.'}"
Technologies Used: ${projectTechnologies && projectTechnologies.length > 0 ? projectTechnologies.join(', ') : 'N/A'}
Work Log Summary: "${workLog}"
Raw Commit Messages (for additional context if needed): ${rawCommits.join('; ').substring(0, 500)}...
Custom Message from User: "${customMessage || ''}"
Project URL (for call to action): ${projectUrl || 'YOUR_PROJECT_URL_HERE'}

Guidelines for each platform:
- Twitter: Max 280 characters. Use concise language, strong hashtags, and a link.
- LinkedIn: Professional tone, 2-3 paragraphs, highlight achievements/learnings, use relevant professional hashtags, include a call to action.
- Facebook: Conversational and engaging, can be slightly longer, encourage interaction (e.g., ask a question), use relevant hashtags.
- Discord: More casual, direct, can include more technical details, use relevant server-specific mentions/hashtags if applicable (or general relevant ones).

Provide the output as a JSON object with keys 'twitter', 'linkedin', 'facebook', 'discord'.`;

    return await aiService._callGeminiAPI(prompt, schema);
  }
};