import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

/**
 * ProjectProgressChart component displays the number of projects completed over time using a Line Chart.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.data - An array of objects, e.g., [{ month: 'Jan 23', count: 5 }].
 */
export function ProjectProgressChart({ data }) {
  return (
    <Card className="shadow-md rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Projects Completed Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" allowDecimals={false} /> {/* Ensure Y-axis shows whole numbers */}
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No project completion data available.</p>
        )}
      </CardContent>
    </Card>
  );
}

ProjectProgressChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    month: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  })).isRequired,
};
ProjectProgressChart.defaultProps = {
  data: [],
};