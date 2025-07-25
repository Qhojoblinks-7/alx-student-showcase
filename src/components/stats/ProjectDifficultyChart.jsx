// src/components/stats/ProjectDifficultyChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2'; // Using Bar chart for clear comparison of categories
// Import necessary Chart.js components and register them
import {
  Chart as ChartJS,
  CategoryScale,    // For difficulty categories (e.g., Easy, Medium, Hard)
  LinearScale,      // For numerical values (e.g., project count)
  BarElement,       // For drawing the bars
  Title,            // For chart title (though handled by CardTitle)
  Tooltip,          // For interactive tooltips on hover
  Legend,           // For chart legend
} from 'chart.js';
// Import Shadcn UI components for consistent styling and structure
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Register the necessary Chart.js components for a bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define default Chart.js options to ensure consistency with Shadcn UI aesthetic.
// These options will be merged with any specific options passed via props.
const defaultChartOptions = {
  responsive: true, // Chart will resize responsively with its parent container
  maintainAspectRatio: false, // Allows the chart to take up flexible height within its parent
  plugins: {
    title: {
      display: false, // Chart title is managed by Shadcn's CardTitle component for better UI integration
    },
    legend: {
      display: true, // Display the legend (e.g., "Number of Projects")
      position: 'top', // Position the legend at the top of the chart
      labels: {
        // Customize legend text color to match Tailwind's foreground color
        color: 'hsl(var(--foreground))',
        font: {
          family: 'Inter, sans-serif', // Ensure consistent font family
        },
      },
    },
    tooltip: {
      // Customize tooltip appearance to match Shadcn's popover style
      backgroundColor: 'hsl(var(--popover))',
      titleColor: 'hsl(var(--popover-foreground))',
      bodyColor: 'hsl(var(--popover-foreground))',
      borderColor: 'hsl(var(--border))', // Subtle border color
      borderWidth: 1, // Add a thin border
      borderRadius: 6, // Match Shadcn's rounded corners
      displayColors: true, // Show color swatch in tooltip
      padding: 10, // Padding inside the tooltip
      boxPadding: 4, // Padding around the color box in tooltip
      callbacks: {
        // Custom callback for tooltip label to display value clearly
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y; // For bar chart, y is the value
          }
          return label;
        }
      }
    },
  },
  scales: {
    x: {
      // X-axis (difficulty categories) configuration
      ticks: {
        color: 'hsl(var(--muted-foreground))', // Axis tick color to match muted text
        font: {
          family: 'Inter, sans-serif', // Consistent font family
        },
      },
      grid: {
        color: 'hsl(var(--border))', // Subtle grid lines to match border color
        borderColor: 'hsl(var(--border))', // Border color for the grid
        drawOnChartArea: false, // Do not draw vertical grid lines on the chart area
      },
    },
    y: {
      // Y-axis (project count) configuration
      beginAtZero: true, // Start Y-axis from zero
      ticks: {
        color: 'hsl(var(--muted-foreground))', // Axis tick color
        font: {
          family: 'Inter, sans-serif', // Consistent font family
        },
        precision: 0, // Ensure integer ticks for counts
      },
      grid: {
        color: 'hsl(var(--border))', // Subtle grid lines
        borderColor: 'hsl(var(--border))', // Border color for the grid
      },
    },
  },
};

/**
 * ProjectDifficultyChart component displays a bar chart showing the distribution of projects by difficulty.
 * It integrates with react-chartjs-2 and is styled to match Shadcn UI's aesthetic.
 *
 * @param {object} props - The component props.
 * @param {object} props.data - The chart data object, typically containing labels (difficulty levels)
 * and datasets (e.g., project counts).
 * @param {object} [props.options] - Optional Chart.js options to override or extend default settings.
 */
export const ProjectDifficultyChart = ({ data, options }) => {
  // Merge default chart options with any provided specific options
  const chartOptions = { ...defaultChartOptions, ...options };

  return (
    // Card component from Shadcn UI acts as the container for the chart, ensuring consistent styling
    <Card className="h-full flex flex-col"> {/* Ensures the card takes full available height and uses flexbox for internal layout */}
      <CardHeader>
        {/* CardTitle provides the chart's main title, adhering to Shadcn typography */}
        <CardTitle className="text-xl font-semibold">Projects by Difficulty</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4"> {/* CardContent holds the chart, using flex-grow to fill available space */}
        {/* Conditional rendering: Display chart if data is available, otherwise show a message */}
        {data && data.labels && data.labels.length > 0 ? (
          <div className="relative h-64 md:h-80 lg:h-96"> {/* Responsive height for the chart canvas container */}
            {/* The Bar component from react-chartjs-2 renders the chart */}
            <Bar data={data} options={chartOptions} />
          </div>
        ) : (
          // Message displayed when no data is available for the chart
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No project difficulty data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDifficultyChart;
