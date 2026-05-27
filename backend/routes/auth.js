import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/github',
  passport.authenticate('github', { scope: ['user:email', 'repo'] })
);

// router.get('/github/callback',
//   passport.authenticate('github', { failureRedirect: 'https://projectsummer.click/login' }),
//   (req, res) => {
//     res.redirect('https://projectsummer.click/dashboard');
//   }
// );

router.get("/github/callback", (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) {
      console.error('error passport', err);
      return res.status(500).json({ 
        message: 'console error passport', 
        error: err.message || err 
      });
    }
    if (!user) {
      console.error('No user found after authentication', info);
      return res.status(401).json({ 
        message: 'No user found after authentication', 
        info: info || 'No additional info' 
      });
    }req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('🔥 ОШИБКА СЕССИИ (req.logIn):', loginErr);
        return res.status(500).json({ message: 'Ошибка создания сессии', error: loginErr.message });
      }
      
      // Успех!
      return res.redirect('https://projectsummer.click/dashboard');
    });
  })(req, res, next);
});

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