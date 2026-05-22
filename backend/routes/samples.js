import express from 'express';
import { handleSampleSubmit } from '../controllers/sampleController.js';

const router = express.Router();

// POST /api/samples/
router.post('/', handleSampleSubmit);

export default router;