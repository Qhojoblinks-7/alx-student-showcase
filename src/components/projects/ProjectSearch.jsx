import { useState } from 'react';

export function ProjectSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'popularity',
    tags: '',
    technologies: '',
  });

  const handleSearch = () => {
    onSearch({ query, ...filters });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <select
        value={filters.sortBy}
        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        className="w-full p-2 border rounded"
      >
        <option value="popularity">Sort by Popularity</option>
        <option value="recency">Sort by Recency</option>
        <option value="relevance">Sort by Relevance</option>
      </select>
      <input
        type="text"
        placeholder="Filter by tags"
        value={filters.tags}
        onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Filter by technologies"
        value={filters.technologies}
        onChange={(e) => setFilters({ ...filters, technologies: e.target.value })}
        className="w-full p-2 border rounded"
      />
      <button onClick={handleSearch} className="w-full p-2 bg-blue-500 text-white rounded">
        Search
      </button>
    </div>
  );
}
