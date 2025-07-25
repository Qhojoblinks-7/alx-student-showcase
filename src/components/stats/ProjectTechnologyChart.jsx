// src/components/stats/ProjectTechnologyChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
// Import necessary Chart.js components and register them
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// Import Shadcn UI components for consistent styling
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// Corrected import path for TechIcon based on previous discussion
// If your TechIcon is actually in src/assets/icons, revert to:
// import TechIcon from '../../assets/icons/TechIcon';
// import TechIcon from '../icons/TechIcon'; // Assuming src/components/icons/TechIcon.jsx

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define default Chart.js options to match Shadcn UI aesthetic
// These options are merged with any specific options passed via props
const defaultChartOptions = {
  indexAxis: 'y', // Make it a horizontal bar chart for better label visibility
  responsive: true, // Chart resizes with its container
  maintainAspectRatio: false, // Allows flexible sizing within parent
  plugins: {
    title: {
      display: false, // Title is handled by Shadcn CardTitle
    },
    legend: {
      display: false, // Set to false, as we often handle legends externally or imply from labels
      // If you want a legend for the dataset (e.g., "Number of Projects"), keep display: true
      // and adjust its labels/position accordingly.
      // Custom label generation for embedding React components is not directly supported
      // within Chart.js canvas rendering.
    },
    tooltip: {
      // Customize tooltip to match Shadcn's popover style
      backgroundColor: 'hsl(var(--popover))',
      titleColor: 'hsl(var(--popover-foreground))',
      bodyColor: 'hsl(var(--popover-foreground))',
      borderColor: 'hsl(var(--border))',
      borderWidth: 1,
      borderRadius: 6, // Match Shadcn's rounded corners
      displayColors: true,
      padding: 10,
      boxPadding: 4,
      callbacks: {
        label: function(context) {
          // 'context.dataset.label' would be relevant if you had multiple datasets,
          // e.g., 'Projects Count'. For a single bar, it's often simpler.
          let label = `Count: ${context.parsed.x}`; // For horizontal bar, x is the value
          return label;
        },
        title: function(context) {
            // Title for the tooltip will be the technology name
            return context[0].label;
        }
      }
    },
  },
  scales: {
    x: { // This is now the value axis (counts) for horizontal bars
      beginAtZero: true,
      ticks: {
        color: 'hsl(var(--muted-foreground))', // Axis tick color
        font: {
          family: 'Inter, sans-serif',
        },
      },
      grid: {
        color: 'hsl(var(--border))', // Subtle grid lines
        borderColor: 'hsl(var(--border))',
      },
      title: {
        display: true,
        text: 'Number of Projects',
        color: 'hsl(var(--foreground))',
        font: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 'bold',
        },
      },
    },
    y: { // This is now the category axis (technologies) for horizontal bars
      ticks: {
        color: 'hsl(var(--muted-foreground))', // Axis tick color
        font: {
          family: 'Inter, sans-serif',
        },
        // IMPORTANT: Embedding React components (like TechIcon) directly into Chart.js
        // canvas labels is NOT possible. The Chart.js canvas is a pixel-based drawing surface.
        // To show icons next to labels, you would need to:
        // 1. Create a custom HTML legend outside the canvas where you can render React components.
        // 2. Use a different charting library that renders to SVG/HTML and supports React components (e.g., Nivo, Recharts).
        // For this component, the Y-axis labels will be text-only.
        callback: function(value, index, ticks) {
          return this.getLabelForValue(value); // Returns the technology name
        },
      },
      grid: {
        color: 'hsl(var(--border))', // Subtle grid lines
        borderColor: 'hsl(var(--border))',
      },
    },
  },
};

// Main functional component for the Project Technology Chart
export const ProjectTechnologyChart = ({ data, options }) => {
  // Merge default options with any provided specific options
  const chartOptions = { ...defaultChartOptions, ...options };

  // Example data structure for 'data' prop:
  // {
  //   labels: ['React', 'Python', 'JavaScript', 'Node.js'],
  //   datasets: [{
  //     label: 'Projects', // This label will appear in tooltip if legend.display is false
  //     data: [5, 7, 10, 3],
  //     backgroundColor: [
  //       'rgba(99, 179, 237, 0.8)', // Light Blue
  //       'rgba(255, 205, 86, 0.8)', // Yellow
  //       'rgba(255, 99, 132, 0.8)', // Red
  //       'rgba(75, 192, 192, 0.8)', // Green
  //     ],
  //     borderColor: [
  //       'rgba(99, 179, 237, 1)',
  //       'rgba(255, 205, 86, 1)',
  //       'rgba(255, 99, 132, 1)',
  //       'rgba(75, 192, 192, 1)',
  //     ],
  //     borderWidth: 1,
  //   }],
  // }


  return (
    <Card className="h-full flex flex-col"> {/* Ensure card takes full height */}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Technologies Used</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4"> {/* Use flex-grow to allow chart to fill space */}
        {data && data.labels && data.labels.length > 0 ? (
          <div className="relative h-64 md:h-80 lg:h-96"> {/* Responsive height for the chart container */}
            <Bar data={data} options={chartOptions} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No technology data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTechnologyChart;