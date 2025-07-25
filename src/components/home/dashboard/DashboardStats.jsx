// src/components/DashboardStats.jsx
import React from 'react';

const DashboardStats = () => {
  // This component will eventually display portfolio analytics.
  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-inner border border-gray-700 min-h-[400px]">
      <h2 className="text-2xl font-semibold text-white mb-4">Portfolio Statistics</h2>
      <p className="text-gray-400">
        This section will show detailed analytics about your projects and portfolio performance.
      </p>
      <div className="mt-6 p-4 border border-dashed border-gray-700 rounded-md text-gray-500 text-center">
        Charts and detailed metrics will go here.
      </div>
    </div>
  );
};

export default DashboardStats;