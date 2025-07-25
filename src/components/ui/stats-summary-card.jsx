// src/components/ui/stats-summary-card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from './card'; // Assuming card.jsx is in ui folder

/**
 * Reusable Card component for displaying summary statistics.
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the statistic (e.g., "Total Projects").
 * @param {string|number} props.value - The numerical or string value of the statistic.
 * @param {string} [props.description] - An optional descriptive text for the statistic.
 * @param {React.ReactNode} [props.icon] - An optional Lucide React icon component to display.
 */
export function StatsSummaryCard({ title, value, description, icon }) {
  return (
    <Card className="flex flex-col justify-between p-4 shadow-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</CardTitle>
        {icon && <div className="text-gray-500 dark:text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

StatsSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
};

StatsSummaryCard.defaultProps = {
  description: '',
  icon: null,
};
export default StatsSummaryCard;