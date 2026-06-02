import express from 'express';
import { isAuthenticated } from '../middlewares/authCheck.js';
import  Release  from '../models/Release.js';
import Project  from '../models/Project.js';
const router = express.Router();

router.get('/projects/:projectId/releases', async (req, res) => {
  try {
    const releases = await Release.find({ project: req.params.projectId }).sort({ createdAt: -1 });
    res.json(releases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

router.post('/projects/:projectId/releases', isAuthenticated, async (req, res) => { 
  try {
    const { version, title, changelogMarkdown, includedCommits, status, content } = req.body;
    const project = await Project.findOne({ _id: req.params.projectId, user: req.user._id });
    if (!project) return res.status(403).json({ error: 'Access denied' }); 
      
    const newRelease = new Release({
      project: req.params.projectId,
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

router.get('/releases/:releaseId', isAuthenticated, async (req, res) => {
  try {
    const release = await Release.findById(req.params.releaseId).populate('project');
    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json(release);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch release' });
  } 
});

router.put('/releases/:releaseId', isAuthenticated, async (req, res) => {
  try {
    const { version, title, changelogMarkdown, includedCommits, status, content } = req.body;
    const updatedRelease = await Release.findByIdAndUpdate(
      req.params.releaseId,
      
      { version, title, changelogMarkdown, includedCommits, status, content, publishDate: status === 'published' ? new Date() : null },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedRelease) return res.status(404).json({ error: 'Release not found' });
    res.json(updatedRelease);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update release' });
  }
});

router.delete('/releases/:releaseId', isAuthenticated, async (req, res) => {
  try {
    const deletedRelease = await Release.findByIdAndDelete(req.params.releaseId);
    if (!deletedRelease) return res.status(404).json({ error: 'Release not found' });
    res.json({ message: 'Release deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete release' });
  }
});

export default router;
