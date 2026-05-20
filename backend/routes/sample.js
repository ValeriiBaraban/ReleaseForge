import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Empty text' });
    }

    const newMessage = new Message({ text });
    await newMessage.save();

    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      message: `Server received and saved your text: "${text}"`,
      savedData: newMessage
    });

  } catch (error) {
    console.error('Error while saving:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const commitsRoute = express.Router();

//  /api/commits/facebook/react
commitsRoute.get('/:owner/:repo', async (req, res) => {
  try {
    // Достаем владельца и название репозитория из URL
    const { owner, repo } = req.params;
    
    console.log(`Запрашиваем коммиты для: ${owner}/${repo}...`);

    // Делаем запрос к публичному API GitHub
    // Если репозиторий большой, можно добавить параметр ?per_page=10, чтобы получить только последние 10
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`);
    
    // Если GitHub ответил ошибкой (например, репо не существует или он приватный)
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Не удалось получить коммиты. GitHub ответил статусом: ${response.status}` 
      });
    }

    const data = await response.json();

    // GitHub отдает ОЧЕНЬ много лишней информации. 
    // Оставляем только самую важную, чтобы фронтенду было легко это читать.
    const formattedCommits = data.map(commitObj => ({
      sha: commitObj.sha,                     // Уникальный ID коммита
      author: commitObj.commit.author.name,   // Имя автора
      message: commitObj.commit.message,      // Текст коммита
      date: commitObj.commit.author.date,     // Дата
      url: commitObj.html_url                 // Ссылка на сам коммит в GitHub
    }));

    res.status(200).json({
      success: true,
      repository: `${owner}/${repo}`,
      total_returned: formattedCommits.length,
      commits: formattedCommits
    });

  } catch (error) {
    console.error('❌ Ошибка при получении коммитов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера при обращении к GitHub' });
  }
});

export default commitsRoute;
