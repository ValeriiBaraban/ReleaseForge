import express from 'express';
import { isAuthenticated } from '../middlewares/authCheck.js';
import Project from '../models/Project.js';
import RawCommit from '../models/RawCommit.js';
import { Release } from '../models/Release.js';
import classifyCommitsWithAI from '../services/aiService.js'; // <-- Импортируем твою функцию
import { filterCleanCommits } from '../services/commitFilter.js';

const router = express.Router();

router.post('/generate', isAuthenticated, async (req, res) => {
  const { projectId, version, title } = req.body;

  if (!projectId || !version || !title) {
    return res.status(400).json({ error: 'Project ID, title and version are required' });
  }

  try {
    const project = await Project.findOne({ _id: projectId, userId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const savedCommits = await RawCommit.find({ projectId: project._id }).sort({ 'author.date': -1 });
    const cleanCommits = filterCleanCommits(savedCommits);

    if (cleanCommits.length === 0) {
      return res.status(400).json({ error: 'No clean commits found to process for this release' });
    }

    // 1. Получаем строгий массив JSON от твоей схемы Gemini
    const aiResultArray = await classifyCommitsWithAI(cleanCommits);

    if (!aiResultArray || aiResultArray.length === 0) {
      return res.status(500).json({ error: 'AI returned empty result' });
    }

    // 2. Формируем красивый Markdown из полученного JSON-массива
    let formattedMarkdown = `## Релиз ${version} — ${title}\n\n`;

    const features = aiResultArray.filter(c => c.category === 'Feature');
    const fixes = aiResultArray.filter(c => c.category === 'Fix');
    const chores = aiResultArray.filter(c => c.category === 'Chore');

    if (features.length > 0) {
      formattedMarkdown += `### 🚀 Новые функции\n`;
      features.forEach(c => formattedMarkdown += `- ${c.cleanText} (${c.hash.substring(0, 7)})\n`);
      formattedMarkdown += `\n`;
    }
    if (fixes.length > 0) {
      formattedMarkdown += `### 🐛 Исправления ошибок\n`;
      fixes.forEach(c => formattedMarkdown += `- ${c.cleanText} (${c.hash.substring(0, 7)})\n`);
      formattedMarkdown += `\n`;
    }
    if (chores.length > 0) {
      formattedMarkdown += `### 💅 Техническое обслуживание\n`;
      chores.forEach(c => formattedMarkdown += `- ${c.cleanText} (${c.hash.substring(0, 7)})\n`);
    }

    // 3. Сохраняем в базу данных готовый текст
    const newRelease = new Release({
      projectId: project._id,
      version,
      title,
      changelogMarkdown: formattedMarkdown,
      includedCommits: cleanCommits.map(c => c.sha),
      status: 'published'
    });

    await newRelease.save();

    await RawCommit.updateMany(
      { projectId: project._id, sha: { $in: cleanCommits.map(c => c.sha) } },
      { $set: { isProcessed: true } }
    );

    res.status(201).json(newRelease);
  } catch (error) {
    console.error('Release Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate and save release' });
  }
});

router.get('/:projectId', isAuthenticated, async (req, res) => {
  try {
    const releases = await Release.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json(releases);
  } catch (error) {
    console.error('Fetch Releases Error:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

router.get('/release/:releaseId', isAuthenticated, async (req, res) => {
  try {
    const release = await Release.findById(req.params.releaseId).populate('projectId'); 
    if (!release) return res.status(404).json({ error: 'Release not found' });
    
    res.json(release);
  } catch (error) {
    console.error('Fetch Release Error:', error);
    res.status(500).json({ error: 'Failed to fetch release details' });
  }
});

export default router;