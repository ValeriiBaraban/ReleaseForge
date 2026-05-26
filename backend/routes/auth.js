import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/github',
  passport.authenticate('github', { scope: ['user:email', 'repo'] })
);

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: 'https://projectsummer.click/login' }),
  (req, res) => {
    res.redirect('https://projectsummer.click/dashboard'); 
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('https://projectsummer.click/login');
  });
});

router.get('/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

export default router;