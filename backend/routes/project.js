import express from 'express';
import { isAuthenticated } from '../middlewares/authCheck.js';
import Project from '../models/Project.js';
import Release from '../models/Release.js';
import ChangeLog from '../models/ChangeLog.js';

const router = express.Router();


router.get('/', isAuthenticated, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description, repoUrl } = req.body;
    const newProject = new Project({
      userId: req.user._id,
      name,
      description,
      repoUrl
    });
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }   
});

router.put('/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { name, description, repoUrl } = req.body;
    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.projectId, userId: req.user._id },
      { name, description, repoUrl },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedProject) return res.status(404).json({ error: 'Project not found' });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:projectId', isAuthenticated, async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.projectId, userId: req.user._id });
    if (!deletedProject) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});


router.get('/:projectId/releases', async (req, res) => {
  try {
    const releases = await Release.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json(releases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

router.post('/:projectId/releases', isAuthenticated, async (req, res) => { 
  try {
    const { version, title, changelogMarkdown, includedCommits, status, content } = req.body;
    
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' }); 
      
    const newRelease = new Release({
      projectId: req.params.projectId,
      version,
      title,
      content,
      includedCommits,
      status: status || 'draft',
      publishDate: status === 'published' ? new Date() : null
    });
    const savedRelease = await newRelease.save();
    res.status(201).json(savedRelease);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create release' });
  }
});


router.get('/:projectId/commits/search', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    const { projectId } = req.params;

    if (!q || q.trim() === '') {
      return res.json({ results: [] });
    }

    // ИСПРАВЛЕНО: Ищем по ключу projectId
    const releases = await Release.find({ projectId: projectId });
    
    if (releases.length === 0) {
      return res.json({ results: [] });
    }

    const releaseIds = releases.map(release => release._id);
    
    const searchResults = await ChangeLog.find({
      release: { $in: releaseIds },
      $or: [
        { text: { $regex: q, $options: 'i' } },
        { originalCommitMessage: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json({ results: searchResults });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search commits' });
  }
});

export default router;