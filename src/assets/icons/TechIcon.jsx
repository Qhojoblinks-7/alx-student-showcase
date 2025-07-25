// src/components/icons/TechIcon.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { iconAssets, GenericTechIcon } from '.'; // Import from your central icon assets

/**
 * A utility component to render technology-specific SVG icons from local assets.
 * It maps common technology names to their corresponding SVG components.
 *
 * @param {object} props - Component props.
 * @param {string} props.techName - The name of the technology (e.g., 'React', 'Python', 'JavaScript').
 * @param {string} [props.className] - Tailwind CSS classes for styling the icon (e.g., 'h-5 w-5 text-blue-500').
 * @returns {React.ReactNode} The SVG icon or a fallback icon.
 */
const TechIcon = ({ techName, className = 'h-5 w-5' }) => {
  // Normalize techName for consistent lookup (lowercase, remove spaces)
  const normalizedTechName = techName.toLowerCase().replace(/[\s.-]/g, '');

  // Retrieve the icon component from the map
  const IconComponent = iconAssets[normalizedTechName];

  // If a specific icon is found, render it. Otherwise, render the generic fallback.
  if (IconComponent) {
    // For actual SVG imports, you might need to clone the element to add className
    // For Lucide React placeholders, we can directly render and pass className
    return React.cloneElement(IconComponent, { className });
  }

  // Fallback to a generic icon if no specific icon is found
  return <GenericTechIcon className={className} />;
};

TechIcon.propTypes = {
  techName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default TechIcon;