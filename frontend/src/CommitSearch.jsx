import { useState } from 'react';

export default function CommitSearch({ projectId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      //TODO: Use environment variable for API base URL

      
      //const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const API_BASE_URL = 'https://projectsummer.click';

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/commits/search?q=${query}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to perform search');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commit-search-container">
      <h3 className="commit-search-title">Commit Search</h3>
      
      <form onSubmit={handleSearch} className="commit-search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="For example: fix, button, update..."
          className="commit-search-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="commit-search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="commit-search-error">{error}</p>}

      {hasSearched && !loading && (
        <div className="commit-search-results-wrapper">
          <p className="commit-search-found-text">
            Found: {results.length}
          </p>
          
          {results.length === 0 ? (
            <p className="commit-search-empty">Nothing found for "{query}"</p>
          ) : (
            <ul className="commit-search-list">
              {results.map((commit) => (
                <li key={commit._id} className="commit-search-list-item">
                  <div className="commit-search-item-content">
                    <div>
                      <p className="commit-search-message">{commit.message}</p>
                      <p className="commit-search-meta">
                        {commit.author.name} • {new Date(commit.author.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="commit-search-badge">
                      Score: {commit.score?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}