// src/components/DashboardSummary.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusCircle, Loader2 } from 'lucide-react'; // Icons
import { Button } from './ui/button'; // Shadcn Button
import StatsSummaryCard from '../ui/stats-summary-card'; // Import the card component
import { toggleAddProjectModal } from '../store/slices/uiSlice';

// --- Placeholder for projectsSlice data structure ---
// In a real application, you would fetch this from your projectsSlice
// For now, let's simulate the data structure that DashboardSummary expects
const selectProjectsData = (state) => {
  // Assuming projects are in state.projects.allProjects
  // And assuming each project has a 'status' and 'updated_at' property
  return state.projects?.allProjects || [];
};
// --- End Placeholder ---

const DashboardSummary = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const projects = useSelector(selectProjectsData); // Get projects from placeholder

  // Calculate summary metrics
  const totalProjects = projects.length;
  const projectsInProgress = projects.filter(
    (project) => project.status === 'in_progress' || !project.completion_date
  ).length;

  const lastUpdatedProject = projects.length > 0
    ? [...projects].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))[0]
    : null;

  const handleAddProject = () => {
    dispatch(toggleAddProjectModal());
  };

  // Show a basic loading indicator if projects data is not yet available
  // In a real scenario, projectsSlice would have its own isLoading state
  if (!projects) { // This condition assumes `projects` might be null initially
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading summary...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-900 rounded-lg shadow-inner border border-gray-700">
      {/* Personalized Greeting */}
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-500 mb-6">
        Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
      </h1>

      {/* Summary Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mb-8">
        <StatsSummaryCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderKanban} // Using FolderKanban from LucideReact
        />
        <StatsSummaryCard
          title="Projects In Progress"
          value={projectsInProgress}
          icon={Loader2} // Using Loader2 as an example icon for in-progress
        />
        <StatsSummaryCard
          title="Last Updated Project"
          value={lastUpdatedProject ? lastUpdatedProject.title : 'N/A'}
          description={lastUpdatedProject ? `on ${new Date(lastUpdatedProject.updated_at || lastUpdatedProject.created_at).toLocaleDateString()}` : 'No projects yet'}
          icon={BarChart2} // Using BarChart2 as an example
        />
      </div>

      {/* Add New Project Button */}
      <div className="flex justify-start"> {/* Align button to start */}
        <Button
          onClick={handleAddProject}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors duration-300 flex items-center"
          size="lg" // Larger button
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Project
        </Button>
      </div>

      {/* Empty State for Projects (example - could be refined in ProjectList) */}
      {totalProjects === 0 && (
        <div className="mt-8 text-center text-gray-400 p-8 border border-dashed border-gray-700 rounded-lg">
          <p className="text-lg mb-4">You haven't added any projects yet.</p>
          <p>Click "Add New Project" to showcase your amazing work!</p>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;