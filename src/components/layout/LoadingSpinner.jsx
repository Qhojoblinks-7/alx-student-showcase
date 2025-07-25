// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // Importing the Loader2 icon from lucide-react

/**
 * LoadingSpinner component displays a customizable loading spinner.
 * It uses the Loader2 icon from lucide-react and applies Tailwind CSS for styling.
 *
 * @param {object} props - The component props.
 * @param {string} [props.className] - Optional Tailwind CSS classes to apply to the spinner.
 * Defaults to a more prominent blue spinner: "h-8 w-8 text-blue-500".
 * @param {string} [props.message] - Optional message to display below the spinner.
 * Defaults to a slightly bolder text: "Loading data...".
 */
export const LoadingSpinner = ({ className = 'h-8 w-8 text-blue-500', message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {/* Loader2 icon with an animate-spin class for continuous rotation */}
      <Loader2 className={`animate-spin ${className}`} />
      {/* Optional message displayed below the spinner, now with font-medium for better visibility */}
      {message && (
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
