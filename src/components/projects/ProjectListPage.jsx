// src/components/projects/ProjectListPage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import DashboardSummary from '@/components/DashboardSummary';
import ProjectList from '@/components/projects/ProjectList'; // The detailed ProjectList
import { fetchProjects } from '@/store/slices/projectsSlice';
import { useAuth } from '@/hooks/selectors';

const ProjectListPage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const { projects, status, error } = useSelector((state) => state.projects);
  const { handleOpenProjectForm, handleOpenGitHubImportWizard } = useOutletContext(); // Get modal openers from context

  // Fetch projects when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user?.id && status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [isAuthenticated, user, dispatch, status]);

  return (
    <div className="flex flex-col gap-6">
      {/* DashboardSummary is now integrated within ProjectList, but can be here if preferred */}
      {/* <DashboardSummary onAddProject={handleOpenProjectForm} /> */}
      <ProjectList
        projects={projects}
        status={status}
        error={error}
        onEdit={handleOpenProjectForm}
        onShare={() => { /* Share logic handled in ProjectCard */ }}
        onTogglePublic={() => { /* Toggle logic handled in ProjectCard */ }}
        onDelete={() => { /* Delete logic handled in ProjectCard */ }}
      />
    </div>
  );
};

export default ProjectListPage;
