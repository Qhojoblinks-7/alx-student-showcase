// src/components/Dashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import ProjectList from '../ProjectList';
import DashboardStats from './DashboardStats';
import UserProfile from '../UserProfile';
// Import Shadcn Dialog for the "Add New Project" modal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import ProjectForm from './ProjectForm'; // Assume ProjectForm component for adding new projects
import { useDispatch } from 'react-redux';
import { setAddProjectModalOpen } from '../store/slices/uiSlice';


// Placeholder for ProjectForm (This would be a full form component)
const ProjectFormPlaceholder = () => {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-white">New Project Form</h3>
      <p className="text-gray-400">This is where the form to add or edit a project will go.</p>
      {/* Actual form inputs for title, description, status, etc. would be here */}
    </div>
  );
};


const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const isAddProjectModalOpen = useSelector((state) => state.ui.isAddProjectModalOpen);

  // --- Protected Route Logic (handled in App.jsx, but reiterating for clarity) ---
  // If user is not authenticated and not loading, redirect to signin.
  // The App.jsx's ProtectedRoute already handles this.
  if (!user && !isLoading) {
    return <Navigate to="/signin" replace />;
  }
  // Show a loading screen if auth state is still being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        Loading dashboard...
      </div>
    );
  }
  // --- End Protected Route Logic ---

  const handleCloseAddProjectModal = () => {
    dispatch(setAddProjectModalOpen(false));
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Routes>
            {/* Default route for /dashboard should redirect to /dashboard/projects */}
            <Route index element={<Navigate to="projects" replace />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="stats" element={<DashboardStats />} />
            <Route path="profile" element={<UserProfile />} />
            {/* Add more nested dashboard routes here */}
          </Routes>
        </main>
      </div>

      {/* Add Project Modal */}
      <Dialog open={isAddProjectModalOpen} onOpenChange={handleCloseAddProjectModal}>
        <DialogContent className="sm:max-w-[800px] bg-gray-900 text-white border-gray-700 p-0">
          <DialogHeader className="p-6 border-b border-gray-700">
            <DialogTitle className="text-2xl font-bold text-teal-400">Add New Project</DialogTitle>
          </DialogHeader>
          {/* Render the actual ProjectForm component here */}
          {/* For now, using a placeholder */}
          <ProjectFormPlaceholder />
          {/* <ProjectForm onClose={handleCloseAddProjectModal} /> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;