// src/services/aiService.js

// Mock AI service for demonstration purposes
export const generateProjectSummary = async (name, description, technologies) => {
  console.log('AI Service: Generating project summary...');
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call delay
  return `This project, "${name}," is a ${technologies || 'software'} solution aimed at ${description.substring(0, 50)}... Its core features address [key features].`;
};

export const generateWorkLogSummary = async (name, description) => {
  console.log('AI Service: Generating work log summary...');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call delay
  return `Development of "${name}" involved [brief mention of phases, e.g., planning, design, implementation, testing]. Key challenges included [mention 1-2 challenges], which were overcome by [mention 1-2 solutions]. The team utilized [methodology, e.g., agile principles] to deliver a robust solution for ${description.substring(0, 50)}...`;
};