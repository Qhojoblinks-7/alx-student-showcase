// src/components/DashboardSummary.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, Hourglass, RefreshCcw, PlusCircle } from 'lucide-react'; // Icons

// This assumes StatsSummaryCard is a small, reusable component for a single metric
// You might need to create this if it's not already from the Stats page spec.
const StatsSummaryCard = ({ title, value, description, icon: Icon }) => (
  <Card className="flex flex-col justify-between h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const DashboardSummary = ({ onAddProject }) => {
  const { projects, status, error } = useSelector((state) => state.projects);
  const user = useSelector((state) => state.auth.user);

  const totalProjects = projects.length;
  const projectsInProgress = projects.filter(
    (project) => project.status === 'In Progress' || project.status === 'Planning'
  ).length;

  // Find the last updated project
  const lastUpdatedProject = [...projects]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .find(Boolean); // Find the first non-null/undefined one

  // Format date for display
  const formatLastUpdatedDate = (project) => {
    if (!project) return 'N/A';
    const date = new Date(project.updated_at || project.created_at);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (status === 'loading' && projects.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatsSummaryCard title="Total Projects" value={<div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />} icon={FolderKanban} />
        <StatsSummaryCard title="Projects In Progress" value={<div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />} icon={Hourglass} />
        <StatsSummaryCard title="Last Updated Project" value={<div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />} icon={RefreshCcw} />
      </div>
    );
  }

  return (
    <div className="mb-8">
      {user && (
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Welcome back, {user.user_metadata?.full_name || user.email}!
        </h2>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatsSummaryCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
        />
        <StatsSummaryCard
          title="Projects In Progress"
          value={projectsInProgress}
          icon={Hourglass}
        />
        <StatsSummaryCard
          title="Last Updated Project"
          value={lastUpdatedProject?.title || "No projects"}
          description={formatLastUpdatedDate(lastUpdatedProject)}
          icon={RefreshCcw}
        />
      </div>

      <div className="flex justify-end mb-8"> {/* Adjusted for flex end */}
        <Button onClick={onAddProject} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Project
        </Button>
      </div>

      {/* Error display for summary if any */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
    </div>
  );
};

export default DashboardSummary;