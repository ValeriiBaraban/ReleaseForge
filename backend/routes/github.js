import express from 'express';
import { isAuthenticated } from '../middlewares/authCheck.js';
import { Octokit } from '@octokit/rest';
import  RawCommit from '../models/RawCommit.js';
import  Project from '../models/Project.js';



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

    const normalizedRepoUrl = `https://github.com/${owner}/${repoName}`;

    let project = await Project.findOne({ userId: req.user._id, repoUrl: normalizedRepoUrl });
    
    if (!project) {
      project = new Project({
        userId: req.user._id,
        name: repoName,
        repoUrl: normalizedRepoUrl,
        description: `Automated sync for ${owner}/${repoName}`
      });
      await project.save();
    }

    const { data: githubCommits } = await octokit.repos.listCommits({
      owner,
      repo: repoName,
      per_page: 25
    });

    const bulkOperations = githubCommits.map(commit => ({
      updateOne: {
        filter: { projectId: project._id, sha: commit.sha },
        update: {
          $setOnInsert: {
            projectId: project._id,
            sha: commit.sha,
            message: commit.commit.message,
            author: {
              name: commit.commit.author.name,
              email: commit.commit.author.email,
              date: commit.commit.author.date
            },
            githubRawData: commit,
            isProcessed: false
          }
        },
        upsert: true
      }
    }));

    if (bulkOperations.length > 0) {
      await RawCommit.bulkWrite(bulkOperations);
    }

    const savedCommits = await RawCommit.find({ projectId: project._id })
      .sort({ 'author.date': -1 })
      .limit(25);

    res.json(savedCommits);
  } catch (error) {
    console.error('GitHub API Error:', error);
    res.status(500).json({ error: 'Failed to fetch commits from GitHub' });
  }
});

export default router;
