import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ReleaseGenerator.css';

const ReleaseGenerator = ({ projectId }) => {
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/releases/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ projectId, version, title })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error generating release');

      setContent(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="release-generator">
      <h3>Release Notes</h3>
      
      <form className="generator-form" onSubmit={handleGenerate}>
        <input 
          className="generator-input"
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
        />
        <input 
          className="generator-input"
          type="text" 
          placeholder="Version (1.0.0)" 
          value={version} 
          onChange={e => setVersion(e.target.value)} 
          required 
        />
        <button className="generator-btn" type="submit" disabled={loading}>
        {loading && <span className="spinner"></span>}
          {loading ? 'Generating...' : 'Create Release Notes'}
        </button>
        {loading && (
          <div className="loading-indicator">
          <p>AI is analyzing your commits...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        )}
      </form>

      {error && <p className="generator-error">{error}</p>}

      {content && (
        <div className="markdown-box">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ReleaseGenerator;