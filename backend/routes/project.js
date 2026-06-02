import express from 'express';
import { isAuthenticated } from '../middlewares/authCheck.js';
import Project from '../models/Project.js';
const router = express.Router();

router.get('/projects', isAuthenticated, async (req, res) => {
  try {
    const projects = await Project.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
   }
});

router.post('/projects', isAuthenticated, async (req, res) => {
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

router.put('/projects/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { name, description, repoUrl } = req.body;
    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.projectId, userId: req.user._id },
      { name, description, repoUrl },
      { new: true, runValidators: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:projectId', isAuthenticated, async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.projectId, userId: req.user._id });
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;