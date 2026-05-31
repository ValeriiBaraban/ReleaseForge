import React, {useState, useEffect } from "react";
import './ProjectStats.css';


const ProjectStats = ({projectId}) => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/releases/stats/${projectId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    featchStats();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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