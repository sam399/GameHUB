import React from 'react';
import { GameFilters as GameFiltersType } from '../../types';

interface GameFiltersProps {
  filters: GameFiltersType;
  onFiltersChange: (filters: GameFiltersType) => void;
}

const GameFilters: React.FC<GameFiltersProps> = ({ filters, onFiltersChange }) => {
  const genres = ['Action', 'Adventure', 'RPG', 'Strategy', 'Shooter', 'Sports', 'Racing', 'Puzzle'];
  const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];
  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'rating.average', label: 'Rating' },
    { value: 'price', label: 'Price' }
  ];

  const handleFilterChange = (key: keyof GameFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 12
    });
  };

  return (
    <div className="game-filters">
      <div className="filter-section">
        <h4>Search</h4>
        <input
          type="text"
          placeholder="Search games..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      <div className="filter-section">
        <h4>Genre</h4>
        <select
          value={filters.genre || ''}
          onChange={(e) => handleFilterChange('genre', e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h4>Platform</h4>
        <select
          value={filters.platform || ''}
          onChange={(e) => handleFilterChange('platform', e.target.value)}
        >
          <option value="">All Platforms</option>
          {platforms.map(platform => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h4>Sort By</h4>
        <select
          value={filters.sortBy || 'title'}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h4>Order</h4>
        <select
          value={filters.sortOrder || 'asc'}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <button className="clear-filters" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  );
};

export default GameFilters;