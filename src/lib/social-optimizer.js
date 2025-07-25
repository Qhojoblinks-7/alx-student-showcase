// src/lib/social-optimizer.js

import { aiService } from "@/components/service/ai-service";


/**
 * Service for optimizing content for various social media platforms using AI.
 * This service acts as a wrapper around aiService specifically for social content generation.
 */
export const socialOptimizer = {
  /**
   * Generates optimized content for various social media platforms using the AI service.
   * @param {object} contentData - Object containing:
   * - projectName: string (Title of the project)
   * - projectDescription: string (Description of the project)
   * - projectTechnologies: Array<string> (Technologies used in the project)
   * - projectUrl: string (URL to the project/portfolio)
   * - workLog: string (The AI-generated humanized work log summary)
   * - rawCommits: Array<string> (Raw commit messages for deeper context)
   * - customMessage: string (Any additional custom message from the user)
   * @returns {Promise<object>} An object with optimized content for twitter, linkedin, facebook, discord.
   * @throws {Error} If AI generation fails.
   */
  generatePlatformContent: async (contentData) => {
    try { 
      aiService.validateContentData(contentData); // Validate the content data structure
      // Delegate the actual content generation to the aiService
      const optimizedContent = await aiService.generatePlatformContent(contentData);
      return optimizedContent;
    } catch (error) {
      console.error('Error optimizing social content:', error.message);
      throw new Error(`Failed to generate social content: ${error.message}`);
    }
  },

  // You could add other social media-specific utilities here if needed,
  // e.g., character counters, hashtag suggestions (if not done by AI), etc.
  /**
   * Validates the content data structure.
   * @param {object} contentData - The content data to validate.
   * @returns {boolean} True if valid, false otherwise.
   */
  validateContentData: (contentData) => {
    const requiredFields = [
      'projectName',
      'projectDescription',
      'projectTechnologies',
      'projectUrl',
      'workLog',
      'rawCommits',
      'customMessage'
    ];

    for (const field of requiredFields) {
      if (!contentData[field]) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    return true;
  }

};