import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import './UserSearch.css';

const UserSearch = ({ onSearch, resultsCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      performSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    await onSearch(query);
    setIsSearching(false);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          className="search-input"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={handleClear}>
            ✕
          </button>
        )}
        {isSearching && <div className="search-spinner">⏳</div>}
      </div>
      {searchQuery && (
        <div className="search-results-info">
          Found <strong>{resultsCount}</strong> user{resultsCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default UserSearch;

