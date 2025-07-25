import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, XCircle, Filter } from 'lucide-react';

// Import Shadcn UI components
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

/**
 * StatsFilters component provides filtering options for the project statistics.
 *
 * @param {object} props - Component props.
 * @param {object} props.currentFilters - The currently active filter state.
 * @param {function} props.onApplyFilters - Callback function when filters are applied.
 * @param {function} props.onResetFilters - Callback function when filters are reset.
 */
export function StatsFilters({ currentFilters, onApplyFilters, onResetFilters }) {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Update local filters when currentFilters prop changes (e.g., from Redux reset)
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    // Reset local filters to initial state and then call parent reset
    const resetState = {
      timeframe: 'all',
      category: 'all',
      technology: 'all', // Note: Technology filtering is complex, currently for display
      difficulty_level: 'all',
      is_public: 'all',
    };
    setLocalFilters(resetState);
    onResetFilters(resetState); // Pass reset state to parent
  };

  // Define static options for selects
  const timeframeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_12_months', label: 'Last 12 Months' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'web', label: 'Web Application' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'backend', label: 'Backend/API' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'ai', label: 'AI/Machine Learning' },
    { value: 'devops', label: 'DevOps' },
    { value: 'other', label: 'Other' },
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const visibilityOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'public', label: 'Public Projects' },
    { value: 'private', label: 'Private Projects' },
  ];

  return (
    <Card className="shadow-md rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 space-y-4">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-500" /> Filter Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeframe-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe</Label>
            <Select value={localFilters.timeframe} onValueChange={(value) => handleFilterChange('timeframe', value)}>
              <SelectTrigger id="timeframe-filter">
                <SelectValue placeholder="Select Timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
            <Select value={localFilters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggle for Advanced Filters */}
        <Button
          variant="ghost"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full justify-between text-sm text-muted-foreground"
        >
          <span>Advanced Filters</span>
          {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Advanced Filters Section (Collapsible) */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ease-in-out">
            <div>
              <Label htmlFor="difficulty-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty Level</Label>
              <Select value={localFilters.difficulty_level} onValueChange={(value) => handleFilterChange('difficulty_level', value)}>
                <SelectTrigger id="difficulty-filter">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visibility-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</Label>
              <Select value={localFilters.is_public} onValueChange={(value) => handleFilterChange('is_public', value)}>
                <SelectTrigger id="visibility-filter">
                  <SelectValue placeholder="Select Visibility" />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Technology filter input - for display/future complex filtering */}
            <div className="sm:col-span-2">
              <Label htmlFor="technology-filter-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">Technology (for display only)</Label>
              <Input
                id="technology-filter-input"
                type="text"
                placeholder="e.g., React, Python (not active filter)"
                value={localFilters.technology === 'all' ? '' : localFilters.technology}
                onChange={(e) => handleFilterChange('technology', e.target.value || 'all')}
                className="mt-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                disabled // Disable as it's not actively filtering in backend for now
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <XCircle className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

StatsFilters.propTypes = {
  currentFilters: PropTypes.shape({
    timeframe: PropTypes.string,
    category: PropTypes.string,
    technology: PropTypes.string,
    difficulty_level: PropTypes.string,
    is_public: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};
