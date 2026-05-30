import express from 'express';
import { isAuthenticated } from '../middlewares/authCheck.js';
import { Project, Release } from '../models';
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

export default router;