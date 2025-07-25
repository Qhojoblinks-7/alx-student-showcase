// src/components/stats/ProjectCategoryChart.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { shadcnChartColors } from '../../lib/chart-utils'; // Import colors

/**
 * Renders a Doughnut chart showing the distribution of projects by category.
 *
 * @param {object} props - Component props.
 * @param {object} props.chartData - Data object for Chart.js.
 * @param {object} [props.chartOptions] - Options object for Chart.js.
 */
export const ProjectCategoryChart = ({ chartData, chartOptions }) => {
  // Default options for Doughnut chart, merged with global theme
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to fill parent container
    plugins: {
      legend: {
        position: 'right', // Position legend to the right for better space usage
        labels: {
          padding: 20, // Padding between legend items
        },
      },
      title: {
        display: true,
        text: 'Projects by Category',
        color: shadcnChartColors.foreground,
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        // Tooltip styling is handled globally by applyChartTheme
      },
    },
    cutout: '70%', // Makes it a Doughnut chart
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Merge provided options with defaults
  const options = { ...defaultOptions, ...chartOptions };

  // Ensure data colors are applied dynamically
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || shadcnChartColors.dataColors.slice(0, chartData.labels.length),
      borderColor: dataset.borderColor || shadcnChartColors.background, // Border color for segments
      borderWidth: 2,
    })),
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Projects by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-4">
        {chartData.labels.length > 0 ? (
          <div className="relative h-[300px] w-full"> {/* Fixed height for responsiveness */}
            <Doughnut data={data} options={options} />
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No project categories to display yet.</p>
        )}
      </CardContent>
    </Card>
  );
};