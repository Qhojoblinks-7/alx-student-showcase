import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

// Define a set of appealing colors for the charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#A28DFF', '#FF6B6B', '#6D28D9'];

/**
 * TechnologyUsageChart component displays the top technologies used in projects using a Horizontal Bar Chart.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.data - An array of objects, e.g., [{ name: 'React', value: 8 }].
 */
export function TechnologyUsageChart({ data }) {
  return (
    <Card className="shadow-md rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Top Technologies Used</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis type="category" dataKey="name" stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                <LabelList dataKey="value" position="right" />
                {data.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No technology data available.</p>
        )}
      </CardContent>
    </Card>
  );
}

TechnologyUsageChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
};
TechnologyUsageChart.defaultProps = {
  data: [],
};