import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import TechIcon from '../icons/TechIcon'; // Import TechIcon
import { shadcnChartColors } from '../../lib/chart-utils'; // Import colors

/**
 * Renders a Horizontal Bar chart showing the top N most frequently used technologies.
 * Includes a custom legend with TechIcons.
 *
 * @param {object} props - Component props.
 * @param {object} props.chartData - Data object for Chart.js.
 * @param {object} [props.chartOptions] - Options object for Chart.js.
 */
export const TechnologiesUsedChart = ({ chartData, chartOptions }) => {
  // Default options for Horizontal Bar chart, merged with global theme
  const defaultOptions = {
    indexAxis: 'y', // Make it a horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default Chart.js legend as we're creating a custom one
      },
      title: {
        display: true,
        text: 'Top Technologies Used',
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
        beginAtZero: true,
        grid: {
          drawOnChartArea: true, // Keep horizontal grid lines for readability
        },
        title: {
          display: true,
          text: 'Number of Projects',
          color: shadcnChartColors.mutedForeground,
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          drawOnChartArea: false, // Remove vertical grid lines
        },
      },
    },
    animation: {
      duration: 1000, // Animation duration
      easing: 'easeOutQuart', // Easing function
    },
  };

  // Merge provided options with defaults
  const options = { ...defaultOptions, ...chartOptions };

  // Apply default colors if not provided in chartData
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || shadcnChartColors.dataColors[0],
      borderColor: dataset.borderColor || shadcnChartColors.dataColors[0],
      borderWidth: 1,
      borderRadius: 4, // Apply border-radius to bars
    })),
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Technologies Used</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4">
        {chartData.labels.length > 0 ? (
          <>
            <div className="relative h-[350px] w-full mb-4"> {/* Fixed height for responsiveness */}
              <Bar data={data} options={options} />
            </div>
            {/* Custom HTML Legend with TechIcons */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex items-center space-x-2 text-muted-foreground">
                  {/* Small colored box for visual cue */}
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: data.datasets[0].backgroundColor }}
                  ></span>
                  <TechIcon techName={label} className="h-4 w-4 text-foreground" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center">No technologies to display yet.</p>
        )}
      </CardContent>
    </Card>
  );
};