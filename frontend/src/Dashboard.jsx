import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/current-user', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not auth');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => window.location.href = '/'); 
  }, []);

  if (!user) return <h2>Loading...</h2>;

  const handleLogout = () => {
    window.location.href = 'https://projectsummer.click/api/auth/logout';
  };

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        {user.avatar && (
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="dashboard-avatar"
          />
        )}
        <div className="dashboard-user-info">
          <h2>Welcome {user.displayName}!</h2>
          <p>@{user.username}</p>
        </div>
      </div>

      <div className="dashboard-details">
        <p><strong>Email:</strong> {user.email || 'Hidden in GitHub settings'}</p>
        <p><strong>GitHub ID:</strong> {user.githubId}</p>
        <p><strong>Status:</strong> Authorization successful</p>
      </div>

      <button 
        onClick={handleLogout}
        className="dashboard-logout-btn"
      >
        Logout
      </button>

    </div>
  );
}

export default Dashboard;