import express from 'express';
import Message from './models/Message.js';
import { sampleRoute, commitsRoute } from './routes/sample.js';
import { connect } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); 
const app = express();



app.use(cors({
  origin: process.env.CORS_ORIGIN || '*' 
}));

app.use(express.json()); 


const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  return console.error('MONGO_URI environment variable is not set. Please set it to connect to the database.');
  process.exit(1);
}



try {
  const decodedUri = Buffer.from(MONGO_URI, 'base64').toString('utf-8');
  connect(decodedUri)
    .then(() => console.log('Connected to the database using decoded URI'))
    .catch((err) => console.error('Database connection error with decoded URI:', err));
} catch (error) {
  console.error('Error decoding MONGO_URI:', error);
}

app.use('/api/sample', sampleRoute);
app.use('/api/commits', commitsRoute);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});