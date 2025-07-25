import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

// Define a set of appealing colors for the charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#A28DFF', '#FF6B6B', '#6D28D9']; // Added more colors

/**
 * CategoryDistributionChart component displays the distribution of projects by category using a Pie Chart.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.data - An array of objects, e.g., [{ name: 'Web Dev', value: 10 }].
 */
export function CategoryDistributionChart({ data }) {
  return (
    <Card className="shadow-md rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Projects by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No category data available.</p>
        )}
      </CardContent>
    </Card>
  );
}

CategoryDistributionChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
};
CategoryDistributionChart.defaultProps = {
  data: [],
};