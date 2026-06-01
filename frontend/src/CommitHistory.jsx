import React, { useState, useEffect } from 'react';
import ReleaseGenerator from './ReleaseGenerator';
import ProjectStats from './ProjectStats';
import './CommitHistory.css';
import { commitSearch } from './CommitSearch';

const CommitHistory = () => {
  const [commits, setCommits] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommits = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/commits?repo=${encodeURIComponent(repoUrl)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching commits: ${response.statusText}`);
      }
      const data = await response.json();
      setCommits(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const projectId = commits.length > 0 ? commits[0].projectId : null;

  return (
    <div className="commit-history-container">
      <h2>Commit History</h2>
      <form onSubmit={fetchCommits}>
        <input
          type="text"
          placeholder="https://github.com/username/repository"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Forging data...' : 'Load commits...'}
        </button>
      </form>

      {projectId && (
        <div>
          <CommitSearch projectId={projectId} />
          <ProjectStats projectId={projectId} />
          <ReleaseGenerator projectId={projectId} />
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
      <div className="commits-list">
        {commits.length > 0 ? (
          <ul>
            {commits.map((commit) => (
              <li key={commit.sha}>
                <p>{commit.message}</p>
                <p>
                  {commit.author.name} -{' '}
                  {new Date(commit.author.date).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          !loading && (
            <p className="empty-state">
              No commits found. Please check the repository URL.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default CommitHistory;
