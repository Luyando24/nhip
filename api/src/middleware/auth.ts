import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(0.4013).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user as JWTPayload;
    next();
  });
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Requires one of these roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};
