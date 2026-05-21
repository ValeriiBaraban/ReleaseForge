import express from 'express';
import Message from '../models/Message.js'; 

export const sampleRoute = express.Router();

sampleRoute.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Текст не может быть пустым' });
    }

    const newMessage = new Message({ text });
    await newMessage.save();

    await new Promise(resolve => setTimeout(resolve, 3000));

    res.status(200).json({
      success: true,
      message: `Текст "${text}" успешно сохранен в MongoDB. ID записи: ${newMessage._id}`,
      savedData: newMessage
    });

  } catch (error) {
    console.error('Ошибка при сохранении в БД:', error);
    res.status(500).json({ error: ' ошибка сервера при работе с БД' });
  }
});


export const commitsRoute = express.Router();

commitsRoute.get('/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Не удалось получить коммиты. Статус: ${response.status}` 
      });
    }

    const data = await response.json();
    const formattedCommits = data.map(commitObj => ({
      sha: commitObj.sha,
      author: commitObj.commit.author.name,
      message: commitObj.commit.message,
      date: commitObj.commit.author.date,
      url: commitObj.html_url
    }));

    res.status(200).json({
      success: true,
      repository: `${owner}/${repo}`,
      total_returned: formattedCommits.length,
      commits: formattedCommits
    });

  } catch (error) {
    console.error('Ошибка при получении коммитов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});