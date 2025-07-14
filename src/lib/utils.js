import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join Tailwind CSS classes and merge conflicting classes.
 * Uses 'clsx' for conditional class application and 'tailwind-merge' for resolving conflicts.
 *
 * @param {...(string | string[] | object | boolean | null | undefined)} inputs - A list of class names, arrays of class names, objects where keys are class names and values are booleans, or other falsy values.
 * @returns {string} The merged and resolved class string.
 */
export function cn(...inputs) {
  // clsx handles conditional class names (e.g., { 'bg-blue-500': isActive })
  // twMerge resolves conflicting Tailwind classes (e.g., 'p-4 p-6' becomes 'p-6')
  return twMerge(clsx(inputs));
}
