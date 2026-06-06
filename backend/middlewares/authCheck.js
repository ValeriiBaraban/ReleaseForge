export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  console.log('Auth check failed! Request session:', req.sessionID);
  console.log('User is authenticated:', req.isAuthenticated());
  console.log('Request headers:', req.headers);
  res.status(401).json({ message: 'log in first' });
};