// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

// Redux Slices & Thunks
import { fetchProjects } from '@/store/slices/projectsSlice';
import { fetchUserProfile } from '@/store/slices/profileSlice';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { openWizard, closeWizard, selectGithubState } from '@/store/slices/githubSlice'; // IMPORT selectGithubState!

// Custom Hooks & Selectors
import { useAuth } from '@/hooks/selectors';

// Components
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import ProjectForm from './projects/ProjectForm';
import GitHubImportWizard from './github/GitHubImportWizard';

// Placeholder components for routing targets
import ProjectListPage from '@/components/projects/ProjectListPage';
import DashboardStats from '@/components/stats/DashboardStats';
import UserProfile from '@/components/profile/UserProfile';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useAuth();
    const { status: projectsStatus, error: projectsError } = useSelector((state) => state.projects);
    const { status: profileStatus, error: profileError } = useSelector((state) => state.profile || {});

    // Retrieve isWizardOpen from githubSlice state
    const { isWizardOpen } = useSelector(selectGithubState);
    // Log the current state of isWizardOpen from Redux whenever Dashboard re-renders
    console.log('Dashboard: isWizardOpen from Redux state:', isWizardOpen);

    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const navigate = useNavigate();

    // Fetch initial data when user is available
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            if (projectsStatus === 'idle' || projectsStatus === 'failed') {
                dispatch(fetchProjects());
            }
            if (profileStatus === 'idle' || profileStatus === 'failed') {
                dispatch(fetchUserProfile(user.id));
            }
            if (window.location.pathname === '/dashboard' || window.location.pathname === '/dashboard/') {
                navigate('/dashboard/projects', { replace: true });
            }
        }
    }, [user, isAuthenticated, dispatch, projectsStatus, profileStatus, navigate]);

    // Handle errors from data fetches
    useEffect(() => {
        if (projectsError) {
            toast.error(`Projects Error: ${projectsError}`);
        }
        if (profileError) {
            toast.error(`Profile Error: ${profileError}`);
        }
    }, [projectsError, profileError]);

    const handleOpenProjectForm = (project = null) => {
        console.log('Dashboard: Opening Project Form modal.'); // Log for Project Form
        setEditingProject(project);
        setIsProjectFormOpen(true);
    };

    const handleCloseProjectForm = () => {
        console.log('Dashboard: Closing Project Form modal.'); // Log for Project Form
        setIsProjectFormOpen(false);
        setEditingProject(null);
    };

    // Define the open handler for the GitHub wizard that dispatches the Redux action
    const handleOpenGitHubImportWizard = () => {
        console.log('Dashboard: handleOpenGitHubImportWizard called. Dispatching openWizard() action.'); // Log for GitHub Wizard open
        dispatch(openWizard());
    };

    // Define the close handler for the GitHub wizard that dispatches the Redux action
    const handleCloseGitHubImportWizard = () => {
        console.log('Dashboard: handleCloseGitHubImportWizard called. Dispatching closeWizard() action.'); // Log for GitHub Wizard close
        dispatch(closeWizard());
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Dashboard Sidebar (for desktop and mobile Sheet) */}
            <DashboardSidebar
                onAddProject={handleOpenProjectForm}
                // Pass the Redux action for opening the GitHub wizard directly
                onImportGitHub={handleOpenGitHubImportWizard} // Pass the dedicated handler
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Dashboard Header */}
                <DashboardHeader
                    toggleSidebar={() => {
                        console.log('Dashboard: Toggling sidebar open.'); // Log for sidebar toggle
                        dispatch(setSidebarOpen(true));
                    }}
                    onAddProject={handleOpenProjectForm}
                    // Pass the Redux action for opening the GitHub wizard directly
                    onImportGitHub={handleOpenGitHubImportWizard} // Pass the dedicated handler
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {/* Outlet for nested routes. Pass context if needed by children. */}
                    <Outlet context={{ handleOpenProjectForm }} />
                </main>
            </div>

            {/* Project Form Modal - Centralized here to be controlled by Dashboard */}
            <ProjectForm
                open={isProjectFormOpen}
                onOpenChange={setIsProjectFormOpen}
                project={editingProject}
            />

            {/* GitHub Import Wizard Modal - Now entirely controlled by Redux state */}
            {/* Only render the wizard if isWizardOpen is true to prevent unnecessary mounting/rendering */}
            {isWizardOpen && ( // Conditionally render based on Redux state
                <GitHubImportWizard
                    isOpen={isWizardOpen} // Pass Redux state as prop
                    onClose={handleCloseGitHubImportWizard} // Pass handler that dispatches closeWizard
                />
            )}
        </div>
    );
};

export default Dashboard;