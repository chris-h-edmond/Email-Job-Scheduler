import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    state?: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }
  (req as any).userId = req.session.userId;
  next();
}
