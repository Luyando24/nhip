import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per window
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each user to 100 requests per minute
  keyGenerator: (req: Request) => req.user?.userId || req.ip || 'global',
  message: {
    success: false,
    error: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
