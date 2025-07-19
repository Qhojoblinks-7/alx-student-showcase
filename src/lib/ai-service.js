import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getProjectRecommendations = async (userPreferences) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'text-davinci-003',
        prompt: `Based on the following user preferences, suggest 3 project ideas: ${JSON.stringify(userPreferences)}`,
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].text.trim().split('\n');
  } catch (error) {
    console.error('Error fetching project recommendations:', error);
    throw error;
  }
};

export const generateProjectSummary = async (projectDetails) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'text-davinci-003',
        prompt: `Summarize the following project details: ${JSON.stringify(projectDetails)}`,
        max_tokens: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating project summary:', error);
    throw error;
  }
};
