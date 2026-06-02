import express from 'express';
import passport from 'passport';
import { isAuthenticated } from '../middlewares/authCheck.js';

const router = express.Router();

router.get('/github',
  passport.authenticate('github', { scope: ['user:email', 'repo'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/dashboard' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err); 

    req.session.destroy(() => {
      
      res.clearCookie('connect.sid', { path: '/' });
      
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

router.get('/current-user', isAuthenticated, (req, res) => {
  res.json(req.user);
});

export default router;