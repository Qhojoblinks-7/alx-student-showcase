// src/lib/utils.js
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

export function toggleSidebar(){
  // This function can be used to toggle the sidebar state in a Redux store or context
  return (dispatch) => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };
}

/**
 * Generates a simple unique ID using a combination of timestamp and a random number.
 * This is suitable for client-side keys where true global uniqueness (UUID) is not strictly required,
 * but unique within a short session is sufficient. For database primary keys, a more robust UUID/ULID generator
 * or server-generated ID is recommended.
 * @returns {string} A unique ID string.
 */
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}