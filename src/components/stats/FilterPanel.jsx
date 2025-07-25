// src/components/common/FilterPanel.jsx
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { XCircle, Search, Filter } from 'lucide-react'; // Icons for clear, search, and filter

/**
 * FilterPanel component provides a customizable interface for filtering data.
 * It supports text search, category selection, and technology selection.
 *
 * @param {object} props - The component props.
 * @param {object} props.filters - An object containing the current filter values.
 * e.g., { searchQuery: '', category: 'all', technology: 'all' }
 * @param {function} props.onFilterChange - Callback function triggered when filter values change.
 * Receives an object with the updated filter values.
 * @param {Array<string>} [props.categories] - Optional array of available category options.
 * @param {Array<string>} [props.technologies] - Optional array of available technology options.
 * @param {string} [props.className] - Optional Tailwind CSS classes for the main container.
 */
export const FilterPanel = ({
  filters,
  onFilterChange,
  categories = [],
  technologies = [],
  className = '',
}) => {
  // Local state to manage filter inputs before applying
  const [currentSearchQuery, setCurrentSearchQuery] = useState(filters.searchQuery || '');
  const [currentCategory, setCurrentCategory] = useState(filters.category || 'all');
  const [currentTechnology, setCurrentTechnology] = useState(filters.technology || 'all');

  // Effect to synchronize local state with external filters prop
  React.useEffect(() => {
    setCurrentSearchQuery(filters.searchQuery || '');
    setCurrentCategory(filters.category || 'all');
    setCurrentTechnology(filters.technology || 'all');
  }, [filters]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setCurrentSearchQuery(e.target.value);
  };

  // Handle category select change
  const handleCategoryChange = (value) => {
    setCurrentCategory(value);
  };

  // Handle technology select change
  const handleTechnologyChange = (value) => {
    setCurrentTechnology(value);
  };

  // Apply filters button click handler
  const handleApplyFilters = () => {
    onFilterChange({
      searchQuery: currentSearchQuery,
      category: currentCategory,
      technology: currentTechnology,
    });
  };

  // Clear all filters button click handler
  const handleClearFilters = () => {
    setCurrentSearchQuery('');
    setCurrentCategory('all');
    setCurrentTechnology('all');
    onFilterChange({
      searchQuery: '',
      category: 'all',
      technology: 'all',
    });
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {/* Search Input */}
      <div className="relative w-full sm:w-auto sm:flex-grow">
        <Input
          type="text"
          placeholder="Search projects..."
          value={currentSearchQuery}
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApplyFilters();
            }
          }}
          className="pr-8" // Add padding for the search icon
        />
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Category Select */}
      <Select value={currentCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select Category">
            {currentCategory === 'all' ? 'All Categories' : currentCategory}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Technology Select */}
      <Select value={currentTechnology} onValueChange={handleTechnologyChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select Technology">
            {currentTechnology === 'all' ? 'All Technologies' : currentTechnology}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Technologies</SelectItem>
          {technologies.map((tech) => (
            <SelectItem key={tech} value={tech}>
              {tech}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Apply Filters Button */}
      <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
        <Filter className="mr-2 h-4 w-4" /> Apply Filters
      </Button>

      {/* Clear Filters Button */}
      {(currentSearchQuery || currentCategory !== 'all' || currentTechnology !== 'all') && (
        <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">
          <XCircle className="mr-2 h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  );
};

export default FilterPanel;
