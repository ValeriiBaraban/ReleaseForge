import express from 'express';
import { isAuthenticated } from '../middlewares/authCheck.js';
import { Octokit } from '@octokit/rest';

const router = express.Router();

const parcedUrl = new URL(process.env.GITHUB_AUTH_URL);

router.get('/commits', isAuthenticated, async (req, res) => {
  const { repo } = req.query;

  if (!repo) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  try {
    const octokit = new Octokit({ auth: req.user.accessToken });
    const repoPath = repo.replace('https://github.com/', '').split('/');
    const owner = repoPath[0];
    const repoName = repoPath[1];

    if (!owner || !repoName) {
      return res.status(400).json({ error: 'Invalid repository format' });
    }

    const { data } = await octokit.repos.listCommits({
      owner,
      repo: repoName,
    });

    res.json(data);
  } catch (error) {
    console.error('GitHub API Error:', error);
    res.status(500).json({ error: 'Failed to fetch commits from GitHub' });
  }
});

export default router;
