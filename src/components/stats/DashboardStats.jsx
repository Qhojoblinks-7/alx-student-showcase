// src/pages/DashboardStats.jsx

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../store/selectors';
import { fetchProjectStats, selectStatsData, selectStatsLoading, selectStatsError, setStatsFilters } from '../../store/slices/statsSlice';

// Import your UI components
import {StatsSummaryCard} from './store/slices/StatsSummaryCard'; // Assuming you have a StatsSummaryCard component
import { fetchProjects } from '../../store/slices/projectsSlice'; // Import fetchProjects if needed
import {ProjectCategoryChart} from './ProjectCategoryChart';
import {ProjectTechnologyChart} from './ProjectTechnologyChart';
import {ProjectsOverTimeChart} from './ProjectsOverTimeChart';
import {ProjectDifficultyChart} from './ProjectDifficultyChart';
import {ErrorMessage} from '../layout/ErrorMessage';     // Assuming you have an ErrorMessage component
import {FilterPanel} from './FilterPanel';   // Component for filters

// Import icons from lucide-react <--- ADD OR ENSURE THESE IMPORTS ARE PRESENT AND CORRECT
import { FolderDot, BarChart3, PieChart, Dumbbell, CalendarDays, Rocket, Layers } from 'lucide-react'; // Add all necessary icons here
import LoadingSpinner from '../layout/LoadingSpinner';

const DashboardStats = () => {
  const dispatch = useDispatch();
  const { user } = useAuth(); // Get authenticated user
  const statsData = useSelector(selectStatsData);
  const isLoading = useSelector(selectStatsLoading);
  const error = useSelector(selectStatsError);
  const filters = useSelector((state) => state.stats.filters); // Access filters directly from state

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchProjectStats({ userId: user.id, filters }));
    }
  }, [dispatch, user?.id, filters]);

  const handleFilterChange = (newFilters) => {
    dispatch(setStatsFilters(newFilters));
  };

  // Memoize data for charts to prevent unnecessary re-renders
  const memoizedCategoriesData = useMemo(() => statsData?.categoriesDistribution || [], [statsData?.categoriesDistribution]);
  const memoizedTechnologiesData = useMemo(() => statsData?.technologyUsage || [], [statsData?.technologyUsage]);
  const memoizedProjectsOverTimeData = useMemo(() => statsData?.projectsOverTime || [], [statsData?.projectsOverTime]);
  const memoizedDifficultyData = useMemo(() => statsData?.difficultyDistribution || [], [statsData?.difficultyDistribution]);


  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message="Please sign in to view your dashboard." />
      </div>
    );
  }

  if (isLoading && !statsData.totalProjects) { // Show loading spinner only if data hasn't loaded yet
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={`Error loading dashboard: ${error}`} />
      </div>
    );
  }

  // Check if statsData is available and has any meaningful project data
  const hasProjectData = statsData && statsData.totalProjects > 0;

  return (
    <>
      <Helmet>
        <title>Dashboard | ProjectFlow</title>
        <meta name="description" content="View your project statistics and insights on ProjectFlow." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

        {hasProjectData ? (
          <>
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsSummaryCard
                title="Total Projects"
                value={statsData.totalProjects}
                icon={<FolderDot className="h-6 w-6 text-blue-500" />}
              />
              <StatsSummaryCard
                title="Public Projects"
                value={statsData.publicProjects}
                icon={<Rocket className="h-6 w-6 text-green-500" />} // Example icon for public projects
              />
              <StatsSummaryCard
                title="Unique Technologies"
                value={statsData.technologyUsage.length}
                icon={<Layers className="h-6 w-6 text-purple-500" />} // Example icon for technologies
              />
              <StatsSummaryCard
                title="Unique Categories"
                value={statsData.categoriesDistribution.length}
                icon={<BarChart3 className="h-6 w-6 text-red-500" />} // Example icon for categories
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Projects by Category</h2>
                <ProjectCategoryChart data={memoizedCategoriesData} />
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Technology Usage</h2>
                <ProjectTechnologyChart data={memoizedTechnologiesData} />
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Projects Over Time</h2>
                <ProjectsOverTimeChart data={memoizedProjectsOverTimeData} />
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Project Difficulty Distribution</h2>
                <ProjectDifficultyChart data={memoizedDifficultyData} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No project data available for the selected filters.</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or adding new projects.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardStats;