import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per IP
  message: 'Too many login attempts, please try again in 15 minutes.',
});

// Apply it ONLY to the login route
router.post('/login', loginLimiter, authController.loginUser);