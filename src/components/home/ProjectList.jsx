// src/components/ProjectList.jsx
import React from 'react';
import DashboardSummary from './dashboard/DashboardSummary'; // Import DashboardSummary

const ProjectList = () => {
  // In a real application, this component would fetch and display a list of projects.
  // For now, it will include the DashboardSummary.

  return (
    <div className="space-y-8">
      <DashboardSummary />
      <div className="bg-gray-900 p-6 rounded-lg shadow-inner border border-gray-700 min-h-[300px]">
        <h2 className="text-2xl font-semibold text-white mb-4">Your Projects</h2>
        <p className="text-gray-400">
          This section will display a list of all your projects with options to view, edit, or delete them.
        </p>
        {/* Example: A simple project card placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <h3 className="font-semibold text-teal-400">Project Alpha</h3>
            <p className="text-sm text-gray-400">Status: In Progress</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <h3 className="font-semibold text-teal-400">Project Beta</h3>
            <p className="text-sm text-gray-400">Status: Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;