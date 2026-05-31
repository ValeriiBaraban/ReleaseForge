import React, { useState, useEffect } from "react";
import './ProjectStats.css';

console.log("Widget received projectId:", projectId);

const ProjectStats = ({ projectId }) => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/releases/stats/${projectId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => setError(err.message));
  }, [projectId]);

  if (error) return <div className="stats-error">Error: {error}</div>;
  if (!stats) return <div className="stats-loading">Loading stats...</div>;
  return (
    <div className="project-stats-container">
      <h3 className="stats-title">Project Impact</h3>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.totalReleases}</span>
            <span className="stat-label">Releases Generated</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">{stats.totalCommitUsed}</span>
            <span className="stat-label">Commits Processed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStats;