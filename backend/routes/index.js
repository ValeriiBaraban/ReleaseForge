import express from 'express';
import sampleRoutes from './samples.js';
// import authRoutes  from './auth.js';
// import projectRoutes from './projects.js';
// import releaseRoutes from './releases.js';

const router = express.Router();


// router.use('/auth', authRoutes);
// router.use('/projects', projectRoutes);
// router.use('/releases', releaseRoutes);
router.use('/sample', sampleRoutes);


router.get('/health', (req, res) => {
  res.status(200).json({'status': 'OK', 'message': 'Backend is running', 'timestamp': new Date().toISOString()});
})

export default router;
