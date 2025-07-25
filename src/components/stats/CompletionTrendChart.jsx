import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { shadcnChartColors } from '../../lib/chart-utils'; // Import colors

/**
 * Renders a Line chart showing the trend of project completion over time.
 *
 * @param {object} props - Component props.
 * @param {object} props.chartData - Data object for Chart.js.
 * @param {object} [props.chartOptions] - Options object for Chart.js.
 */
export const CompletionTrendChart = ({ chartData, chartOptions }) => {
  // Default options for Line chart, merged with global theme
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Often not needed for single line charts
      },
      title: {
        display: true,
        text: 'Projects Completed Over Time',
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
    scales: {
      x: {
        grid: {
          drawOnChartArea: false, // Remove vertical grid lines
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // Ensure whole numbers for project counts
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Merge provided options with defaults
  const options = { ...defaultOptions, ...chartOptions };

  // Apply default colors if not provided in chartData
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(dataset => ({
      ...dataset,
      borderColor: dataset.borderColor || shadcnChartColors.dataColors[0],
      backgroundColor: dataset.backgroundColor || shadcnChartColors.dataColors[0] + '40', // Semi-transparent fill
      pointBackgroundColor: dataset.pointBackgroundColor || shadcnChartColors.dataColors[0],
      pointBorderColor: dataset.pointBorderColor || shadcnChartColors.background,
      pointBorderWidth: 2,
      pointRadius: 5,
      fill: true, // Fill area under the line
      tension: 0.4, // Smooth curve
    })),
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Completion Trend</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-4">
        {chartData.labels.length > 0 ? (
          <div className="relative h-[350px] w-full"> {/* Fixed height for responsiveness */}
            <Line data={data} options={options} />
          </div>
        ) : (
          <p className="text-muted-foreground text-center">No project completion data to display yet.</p>
        )}
      </CardContent>
    </Card>
  );
};