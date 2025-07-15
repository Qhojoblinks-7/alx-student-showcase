// src/components/DashboardStats.jsx
import React from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import {
  useAppSelector, // Corrected import path for useAppSelector
  selectProjectMetrics,
  useProjectsLoading,
} from '@/lib/redux-selectors.js'; // All Redux selectors and hooks should come from here
import {
  Folder, Globe, Lock, Code, Zap,
  Layers, Star,
} from 'lucide-react';

export function DashboardStats() {
  const projectMetrics = useAppSelector(selectProjectMetrics) || {};
  const { isLoading } = useAppSelector(useProjectsLoading);

  const {
    total = 0,
    public: publicCount = 0,
    private: privateCount = 0,
    technologies = 0,
    alxProjects = 0,
    categoryCounts = {},
    topTechnologies = [],
  } = projectMetrics;

  const overviewCards = [
    {
      title: 'Total Projects',
      icon: <Folder className="h-5 w-5 text-muted-foreground" />,
      value: total,
      note: 'Your complete showcase',
    },
    {
      title: 'Public Projects',
      icon: <Globe className="h-5 w-5 text-muted-foreground" />,
      value: publicCount,
      note: 'Visible to the community',
    },
    {
      title: 'Private Projects',
      icon: <Lock className="h-5 w-5 text-muted-foreground" />,
      value: privateCount,
      note: 'For your eyes only',
    },
    {
      title: 'Unique Technologies',
      icon: <Code className="h-5 w-5 text-muted-foreground" />,
      value: technologies,
      note: 'Distinct tech used',
    },
    {
      title: 'ALX Projects Detected',
      icon: <Zap className="h-5 w-5 text-muted-foreground" />,
      value: alxProjects,
      note: 'Auto-identified ALX work',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-0"> {/* Added padding for mobile */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="rounded-lg shadow-sm"> {/* Added rounded corners and shadow */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-0"> {/* Added padding for mobile */}
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewCards.map(({ title, icon, value, note }) => (
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg" key={title}> {/* Added hover effect and rounded corners */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</CardTitle> {/* Adjusted text color */}
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div> {/* Adjusted text color */}
              <p className="text-xs text-muted-foreground mt-1">{note}</p> {/* Added margin-top */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories and Top Technologies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <Card className="shadow-sm rounded-lg"> {/* Added rounded corners */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-200"> {/* Adjusted text color */}
              <Layers className="h-5 w-5 text-blue-500" /> {/* Added icon color */}
              Projects by Category
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution across project types
            </p>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryCounts).length > 0 ? (
              <ul className="space-y-3"> {/* Increased space-y */}
                {Object.entries(categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <li key={category} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"> {/* Added hover effect and padding */}
                      <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.replace(/-/g, ' ')}
                      </span>
                      <Badge variant="secondary" className="px-3 py-1 text-xs rounded-full">{count}</Badge> {/* Added padding and rounded-full */}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center"> {/* Centered and added padding */}
                No categories found yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Technologies */}
        <Card className="shadow-sm rounded-lg"> {/* Added rounded corners */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-200"> {/* Adjusted text color */}
              <Star className="h-5 w-5 text-yellow-500" /> {/* Added icon color */}
              Top Technologies
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Most frequently used technologies
            </p>
          </CardHeader>
          <CardContent>
            {topTechnologies.length > 0 ? (
              <ul className="space-y-3"> {/* Increased space-y */}
                {topTechnologies.map(({ name, count }, index) => (
                  <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"> {/* Added hover effect and padding */}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
                    <Badge variant="secondary" className="px-3 py-1 text-xs rounded-full">{count}</Badge> {/* Added padding and rounded-full */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center"> {/* Centered and added padding */}
                No technologies found yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
