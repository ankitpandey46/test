import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../Utils/jwt';
import * as sessionService from '../Services/session';

export interface AuthRequest extends Request {
  userId?: number;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token' });
    return; // return void, not res
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return;
  }

  const session = await sessionService.findSessionByToken(token);
  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ message: 'Session expired or invalid' });
    return;
  }

  req.userId = payload.userId;
  next();
}
