
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

app.get('/1', (req, res) => {
  res.send('!! API is running!');
});


const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

connect(MONGO_URI)
  .then(() => console.log('connected to db'))
  .catch((err) => console.error('error db:', err));



app.use('/api/sample', sampleRoute);
app.use('/api/commits', commitsRoute);
app.use('/', (req, res) => {
  res.send('API is running!');
});



app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});