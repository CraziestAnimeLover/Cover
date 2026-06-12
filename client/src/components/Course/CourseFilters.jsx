import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const CourseFilters = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    price: '',
    sortBy: 'newest'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      search: '',
      level: '',
      price: '',
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center space-x-2 btn-secondary"
        >
          <FiFilter />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-white rounded-xl shadow-sm p-6 space-y-5`}>
        <div className="flex justify-between items-center lg:hidden">
          <h3 className="font-semibold">Filters</h3>
          <button onClick={() => setIsOpen(false)}>
            <FiX />
          </button>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Search Courses</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title or instructor..."
              className="input pl-10"
            />
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Level</label>
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="input"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <select
            value={filters.price}
            onChange={(e) => handleFilterChange('price', e.target.value)}
            className="input"
          >
            <option value="">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="input"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.search || filters.level || filters.price || filters.sortBy !== 'newest') && (
          <button
            onClick={clearFilters}
            className="w-full text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </>
  );
};

export default CourseFilters;