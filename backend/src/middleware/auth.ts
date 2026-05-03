import { Request, Response, NextFunction } from 'express';

// Placeholder auth middleware - replace with JWT verification in production
export function auth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token && process.env.NODE_ENV === 'production') {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  // In development, allow unauthenticated requests
  next();
}
