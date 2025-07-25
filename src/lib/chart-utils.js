// src/lib/chart-utils.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js'; // Use standard import after installing chart.js

// Register necessary Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

// Define Shadcn-like colors for Chart.js styling
export const shadcnChartColors = {
  dataColors: [
    '#007bff', '#6f42c1', '#28a745', '#dc3545', '#ffc107',
    '#17a2b8', '#6c757d', '#fd7e14', '#e83e8c', '#6610f2'
  ],
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  border: 'hsl(var(--border))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
};

// Apply global Chart.js defaults for Shadcn aesthetic
export const applyChartTheme = () => {
  ChartJS.defaults.font.family = '"Inter", sans-serif';
  ChartJS.defaults.font.size = 14;
  ChartJS.defaults.color = shadcnChartColors.foreground;

  // Tooltip styling
  ChartJS.defaults.plugins.tooltip = {
    backgroundColor: shadcnChartColors.card,
    borderColor: shadcnChartColors.border,
    borderWidth: 1,
    titleColor: shadcnChartColors.cardForeground,
    bodyColor: shadcnChartColors.mutedForeground,
    cornerRadius: 6,
    padding: 12,
    displayColors: true,
    boxPadding: 4,
  };

  // Legend styling
  ChartJS.defaults.plugins.legend = {
    labels: {
      color: shadcnChartColors.foreground,
      boxWidth: 20,
      padding: 10,
      font: {
        size: 14,
      },
    },
  };

  // Axis scales
  ChartJS.defaults.scales.linear = {
    grid: {
      color: shadcnChartColors.border + '80',
    },
    ticks: {
      color: shadcnChartColors.mutedForeground,
      font: { size: 12 },
    },
    border: {
      color: shadcnChartColors.border,
    },
  };

  ChartJS.defaults.scales.category = {
    grid: {
      color: shadcnChartColors.border + '80',
    },
    ticks: {
      color: shadcnChartColors.mutedForeground,
      font: { size: 12 },
    },
    border: {
      color: shadcnChartColors.border,
    },
  };

  // Bar chart defaults
  ChartJS.defaults.elements.bar = {
    backgroundColor: shadcnChartColors.dataColors[0],
    borderColor: shadcnChartColors.dataColors[0],
    borderWidth: 1,
    borderRadius: 4,
  };

  // Line chart defaults
  ChartJS.defaults.elements.line = {
    borderColor: shadcnChartColors.dataColors[0],
    backgroundColor: shadcnChartColors.dataColors[0] + '40',
    borderWidth: 2,
    tension: 0.4,
  };

  ChartJS.defaults.elements.point = {
    radius: 3,
    backgroundColor: shadcnChartColors.dataColors[0],
  };
};
