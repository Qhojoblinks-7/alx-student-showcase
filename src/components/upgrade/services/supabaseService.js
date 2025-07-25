// src/services/supabaseService.js

// Mock database to simulate Supabase behavior
let mockProjectsDb = [
  {
    id: 'proj1',
    name: 'Initial Portfolio Website',
    description: 'My first personal portfolio showcasing web development skills.',
    startDate: '2023-01-15T00:00:00.000Z',
    endDate: '2023-03-20T00:00:00.000Z',
    status: 'Completed',
    repositoryUrl: 'https://github.com/myuser/portfolio-v1',
    demoUrl: 'https://portfolio-v1.vercel.app',
    technologies: ['React', 'TailwindCSS', 'JavaScript'],
    tags: ['Frontend', 'Portfolio'],
    isFeatured: true,
    projectSummary: 'A basic portfolio website to display initial projects.',
    workLogSummary: 'Focused on fundamental React concepts and responsive design. Faced challenges with CSS animations.',
  },
  {
    id: 'proj2',
    name: 'E-commerce API Backend',
    description: 'A robust RESTful API for an e-commerce platform.',
    startDate: '2023-04-01T00:00:00.000Z',
    endDate: null,
    status: 'In Progress',
    repositoryUrl: 'https://github.com/myuser/ecommerce-api',
    demoUrl: null,
    technologies: ['Node.js', 'Express', 'MongoDB', 'Mongoose'],
    tags: ['Backend', 'API', 'E-commerce'],
    isFeatured: false,
    projectSummary: 'Developed a scalable backend for e-commerce, handling user authentication, product management, and order processing.',
    workLogSummary: 'Initial phase focused on database schema design and core API endpoints. Next steps involve payment gateway integration.',
  },
];

const supabaseService = {
  getProjects: async (userId, filters = {}) => {
    console.log(`Supabase Service: Fetching projects for user ${userId} with filters:`, filters);
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredProjects = [...mockProjectsDb]; // Deep copy for filtering
        // Apply filters if any
        if (filters.status) {
          filteredProjects = filteredProjects.filter(p => p.status === filters.status);
        }
        if (filters.isFeatured !== undefined) {
          filteredProjects = filteredProjects.filter(p => p.isFeatured === filters.isFeatured);
        }
        // Add more filter logic as needed
        resolve(filteredProjects);
      }, 1000);
    });
  },

  createProject: async (projectData) => {
    console.log('Supabase Service: Creating project', projectData);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProject = { ...projectData, id: `proj-${Date.now()}` }; // Simulate ID from DB
        mockProjectsDb.push(newProject);
        resolve(newProject);
      }, 800);
    });
  },

  updateProject: async (id, updatedProjectData) => {
    console.log(`Supabase Service: Updating project ${id}`, updatedProjectData);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockProjectsDb.findIndex(p => p.id === id);
        if (index > -1) {
          mockProjectsDb[index] = { ...mockProjectsDb[index], ...updatedProjectData };
          resolve(mockProjectsDb[index]);
        } else {
          reject(new Error('Project not found.'));
        }
      }, 800);
    });
  },

  deleteProject: async (projectId) => {
    console.log(`Supabase Service: Deleting project ${projectId}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = mockProjectsDb.length;
        mockProjectsDb = mockProjectsDb.filter(p => p.id !== projectId);
        if (mockProjectsDb.length < initialLength) {
          resolve({ id: projectId }); // Return ID of deleted project
        } else {
          reject(new Error('Project not found for deletion.'));
        }
      }, 800);
    });
  },
};

export default supabaseService;