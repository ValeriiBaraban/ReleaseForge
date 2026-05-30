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

// router.get("/github/callback", (req, res, next) => {
//   passport.authenticate("github", (err, user, info) => {
//     if (err) {
//       console.error('error passport1', err);
//       return res.status(500).json({ 
//         message: 'console error passport2', 
//         error: err.message || err 
//       });
//     }
//     if (!user) {
//       console.error('No user found after authentication', info);
//       return res.status(401).json({ 
//         message: 'No user found after authentication3', 
//         info: info || 'No additional info' 
//       });
//     }req.logIn(user, (loginErr) => {
//       if (loginErr) {
//         console.error('error session5 (req.logIn):', loginErr);
//         return res.status(500).json({ message: 'error session6 ', error: loginErr.message });
//       }
      
//       return res.redirect('/dashboard');
//     });
//   })(req, res, next);
// });

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.get('/current-user', isAuthenticated, (req, res) => {
  res.json(req.user);
});

export default router;