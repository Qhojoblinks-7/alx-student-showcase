// src/components/ui/stats-summary-card.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card'; // Assuming shadcn/ui card component
import { LucideIcon } from 'lucide-react'; // Assuming lucide-react is installed

/**
 * A reusable card component to display summary statistics.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the statistic (e.g., "Total Projects").
 * @param {string | number} props.value - The main value to display (e.g., "15" or "Project A").
 * @param {string} [props.description] - Optional, a smaller descriptive text (e.g., "Last updated").
 * @param {LucideIcon} [props.icon] - Optional Lucide React icon component to display.
 */
const StatsSummaryCard = ({ title, value, description, icon: Icon }) => {
  return (
    <Card className="bg-gray-800 text-white border-gray-700 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-teal-400">{value}</div>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default StatsSummaryCard;