import { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { ChevronDown, ChevronUp, XCircle } from 'lucide-react'; // Import icons for expand/collapse and reset

// Import Shadcn UI components
import { Input } from '../ui/input.jsx';
import { Button } from '../ui/button.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.jsx';
import { Label } from '../ui/label.jsx';

export function ProjectSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'recency',
    tags: '',
    technologies: '',
    category: 'all', // New filter: category
    difficulty_level: 'all', // New filter: difficulty_level
    is_public: 'all', // New filter: is_public (all, public, private)
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // State for collapsible filters

  const handleSearch = () => {
    onSearch({ query, ...filters });
  };

  const handleSortByChange = (value) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const handleTagsChange = (e) => {
    setFilters((prev) => ({ ...prev, tags: e.target.value }));
  };

  const handleTechnologiesChange = (e) => {
    setFilters((prev) => ({ ...prev, technologies: e.target.value }));
  };

  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
  };

  const handleDifficultyChange = (value) => {
    setFilters((prev) => ({ ...prev, difficulty_level: value }));
  };

  const handleIsPublicChange = (value) => {
    setFilters((prev) => ({ ...prev, is_public: value }));
  };

  const handleResetFilters = () => {
    setQuery('');
    setFilters({
      sortBy: 'recency',
      tags: '',
      technologies: '',
      category: 'all',
      difficulty_level: 'all',
      is_public: 'all',
    });
    onSearch({
      query: '',
      sortBy: 'recency',
      tags: '',
      technologies: '',
      category: 'all',
      difficulty_level: 'all',
      is_public: 'all',
    }); // Trigger search with reset filters
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
      {/* Basic Search Input and Sort By */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="search-query" className="sr-only">Search projects</Label>
          <Input
            id="search-query"
            type="text"
            placeholder="Search by project title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="sort-by" className="sr-only">Sort by</Label>
          <Select value={filters.sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recency">Sort by Recency</SelectItem>
              <SelectItem value="popularity">Sort by Popularity</SelectItem>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ease-in-out">
          <div>
            <Label htmlFor="filter-tags">Tags</Label>
            <Input
              id="filter-tags"
              type="text"
              placeholder="Filter by tags (e.g., frontend, AI)"
              value={filters.tags}
              onChange={handleTagsChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="filter-tech">Technologies</Label>
            <Input
              id="filter-tech"
              type="text"
              placeholder="Filter by technologies (e.g., React, Python)"
              value={filters.technologies}
              onChange={handleTechnologiesChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="filter-category">Category</Label>
            <Select value={filters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web">Web Application</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="backend">Backend/API</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="ai">AI/Machine Learning</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-difficulty">Difficulty Level</Label>
            <Select value={filters.difficulty_level} onValueChange={handleDifficultyChange}>
              <SelectTrigger id="filter-difficulty">
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"> {/* Make this span two columns */}
            <Label htmlFor="filter-visibility">Visibility</Label>
            <Select value={filters.is_public} onValueChange={handleIsPublicChange}>
              <SelectTrigger id="filter-visibility">
                <SelectValue placeholder="Select Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="public">Public Projects</SelectItem>
                <SelectItem value="private">Private Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={handleResetFilters} variant="outline" className="flex-1">
          <XCircle className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}

ProjectSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
};
