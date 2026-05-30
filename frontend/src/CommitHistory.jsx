import React, { useState, useEffect } from "react";

const CommitHistory = () => {
  const [commits, setCommits] = useState([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try { 
        const response = await fetch(`/api/github/commits?repo=${encodeURIComponent(repoUrl)}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          } 
        });

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

    if (repoUrl) {
      fetchCommits();
    }
  }, [repoUrl]);

  return (
    <div className="commit-history-container" >
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
      {error && <p className="error-message">{error}</p>}
      <div className="commits-list">
        {commits.length > 0 ? (
          <ul>
            {commits.map((commit) => (
              <li key={commit.sha}>
                <p>{commit.commit.message}</p>
                <p>{commit.commit.author.name} - {new Date(commit.commit.author.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (!loading && <p className="empty-state">No commits found. Please check the repository URL.</p>)}
      </div>
    </div>
  );
}