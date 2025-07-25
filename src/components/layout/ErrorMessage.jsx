// src/components/common/ErrorMessage.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react'; // Importing AlertCircle icon from lucide-react

/**
 * ErrorMessage component displays a customizable error message with an icon.
 * It uses the AlertCircle icon from lucide-react and applies Tailwind CSS for styling.
 *
 * @param {object} props - The component props.
 * @param {string} [props.message] - The error message to display. (Required)
 * @param {string} [props.className] - Optional Tailwind CSS classes to apply to the error container.
 * Defaults to a red text with a subtle icon.
 */
export const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null; // Don't render if no message is provided

  return (
    <div className={`flex items-center space-x-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
};

export default ErrorMessage;
