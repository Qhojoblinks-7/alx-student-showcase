import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

/**
 * StatsSummaryCard component displays a single key metric in a card format.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the statistic (e.g., "Total Projects").
 * @param {string | number} props.value - The numerical or string value of the statistic.
 * @param {React.ReactNode} props.icon - A LucideReact icon component.
 * @param {string} [props.description] - An optional descriptive text for the statistic.
 * @param {string} [props.iconColorClass] - Tailwind CSS class for icon color (e.g., 'text-blue-500').
 */
export function StatsSummaryCard({ title, value, icon: Icon, description, iconColorClass = 'text-gray-500' }) {
  return (
    <Card className="shadow-md rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</CardTitle>
        {Icon && <Icon className={`h-5 w-5 ${iconColorClass}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

StatsSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired, // Expecting a React component for the icon
  description: PropTypes.string,
  iconColorClass: PropTypes.string,
};
StatsSummaryCard.defaultProps = {
  description: '',
  iconColorClass: 'text-gray-500',
};