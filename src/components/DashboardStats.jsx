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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
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
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overviewCards.map(({ title, icon, value, note }) => (
          <Card className="shadow-sm" key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories and Top Technologies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5" />
              Projects by Category
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution across project types
            </p>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryCounts).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <li key={category} className="flex items-center justify-between">
                      <span className="capitalize text-sm font-medium">
                        {category.replace(/-/g, ' ')}
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No categories found yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Technologies */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5" />
              Top Technologies
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Most frequently used technologies
            </p>
          </CardHeader>
          <CardContent>
            {topTechnologies.length > 0 ? (
              <ul className="space-y-2">
                {topTechnologies.map(({ name, count }, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{name}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No technologies found yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
