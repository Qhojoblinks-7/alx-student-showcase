// src/lib/social-optimizer.js

/**
 * @file SocialContentOptimizer provides utilities for optimizing content for various social media platforms.
 * @module SocialContentOptimizer
 */

/**
 * Generates platform-specific content for social media sharing.
 * It takes a project object, an AI-generated work log summary, and an optional custom message.
 * It also considers raw commits for internal analysis (e.g., to identify most active areas).
 */
class SocialContentOptimizerClass { // Using a class structure for better organization
  /**
   * Generates optimized content for various social media platforms.
   * @param {object} project - The project object (e.g., from your database).
   * @param {string} aiWorkLogSummaryText - The AI-generated humanized work log summary.
   * @param {Array<Object>} [rawCommits=[]] - Optional raw commit data for deeper analysis (e.g., for hashtags).
   * @param {string} [customMessage=''] - An optional custom message provided by the user.
   * @returns {object} An object with platform-specific content (e.g., { twitter: { content: '...', length: ... }, linkedin: { content: '...', length: ... } }).
   */
  generatePlatformContent(project, aiWorkLogSummaryText, rawCommits = [], customMessage = '') {
    const baseContent = customMessage || aiWorkLogSummaryText;
    const projectLink = project.live_url || project.github_url || '';
    const projectTitle = project.title || 'My ALX Project';
    const projectDescription = project.description || '';
    const projectTechnologies = project.technologies || [];

    // Basic hashtags from technologies and categories
    const relevantTags = [...projectTechnologies, project.category]
      .filter(Boolean)
      .map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`);

    // Add general ALX-related hashtags
    relevantTags.push('#ALXSE', '#SoftwareEngineering', '#TechPortfolio');

    // Deduplicate and limit hashtags
    const uniqueTags = [...new Set(relevantTags)].slice(0, 5).join(' '); // Limit to 5 hashtags

    // Function to truncate content and add ellipses if needed
    const truncate = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };

    // Twitter/X content (max 280 chars)
    let twitterContent = `${baseContent}\n\nCheck out "${projectTitle}" here: ${projectLink}\n${uniqueTags}`;
    if (twitterContent.length > 280) {
      const availableSpace = 280 - (projectLink.length + uniqueTags.length + 20); // 20 for "Check out "" here: " and newlines
      twitterContent = `${truncate(baseContent, availableSpace)}\n\nCheck out "${projectTitle}" here: ${projectLink}\n${uniqueTags}`;
    }

    // LinkedIn content (more professional, longer, up to 1300 chars)
    let linkedinContent = `🚀 Just wrapped up some exciting work on my latest ALX project, "${projectTitle}"!

${baseContent}

Key technologies used include: ${projectTechnologies.join(', ') || 'various tools'}.

Explore the project and its code: ${projectLink}

#${projectTitle.replace(/[^a-zA-Z0-9]/g, '')} ${uniqueTags}`;
    if (linkedinContent.length > 1300) {
      linkedinContent = truncate(linkedinContent, 1300);
    }


    // Facebook content (can be longer, up to 400 chars for good engagement)
    let facebookContent = `🎉 Project Update: "${projectTitle}"!

${baseContent}

I've been focusing on ${projectTechnologies.join(', ') || 'various aspects'} to bring this to life.

Check it out and let me know what you think!
Link: ${projectLink}
${uniqueTags}`;
    if (facebookContent.length > 400) {
      facebookContent = truncate(facebookContent, 400);
    }

    // Discord content (even longer, up to 2000 chars, supports Markdown)
    let discordContent = `**Project Update: __${projectTitle}__**
${projectDescription ? `\n_${projectDescription}_\n` : ''}
\`\`\`
${baseContent}
\`\`\`
**Technologies:** ${projectTechnologies.map(tech => `\`${tech}\``).join(', ') || 'N/A'}
**GitHub:** ${project.github_url || 'N/A'}
**Live Demo:** ${project.live_url || 'N/A'}
`;
    if (discordContent.length > 2000) {
      discordContent = truncate(discordContent, 2000);
    }


    return {
      twitter: { content: twitterContent, length: twitterContent.length, optimized: true },
      linkedin: { content: linkedinContent, length: linkedinContent.length, optimized: true },
      facebook: { content: facebookContent, length: facebookContent.length, optimized: true },
      discord: { content: discordContent, length: discordContent.length, optimized: true },
    };
  }
}

// Export an instance of the class as a named export
export const SocialContentOptimizer = new SocialContentOptimizerClass();
// If you need to use this as a default export, you can do so by uncommenting the line below
// export default SocialContentOptimizer;