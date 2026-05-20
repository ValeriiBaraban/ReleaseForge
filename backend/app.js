// backend/server.js (или index.js)

import sampleRoute from './routes/sample.js';
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import commitsRoute from './routes/sample.js';
import dotenv from 'dotenv';
dotenv.config(); 
const app = express();


app.use(cors({
  origin: process.env.CORS_ORIGIN || '*' 
}));

app.use(json()); 


const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

connect(MONGO_URI)
  .then(() => console.log('✅ Подключено к MongoDB Atlas'))
  .catch((err) => console.error('❌ Ошибка подключения к БД:', err));


// --- 3. МАРШРУТЫ (ROUTES) ---
// ВОТ СЮДА МЫ ВСТАВЛЯЕМ НАШУ СТРОКУ:
app.use('/api/sample', sampleRoute);
app.use('/api/commits', commitsRoute);
// (В будущем здесь появятся другие маршруты)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/projects', require('./routes/projects'));


// --- 4. ЗАПУСК СЕРВЕРА ---
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});