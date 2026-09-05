import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { ApiError } from '../utils/apiError';
import { db } from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'relative' | 'patient' | 'hospital' | 'pharmacist' | 'driver' | 'admin';
    full_name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    // Fetch fresh user record
    const user = db.prepare('SELECT id, email, full_name, role FROM users WHERE id = ?').get(decoded.id) as any;
    if (!user) {
      return next(new ApiError(401, 'User associated with token no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token'));
  }
};

export const authorize = (...roles: Array<'relative' | 'patient' | 'hospital' | 'pharmacist' | 'driver' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized access'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role '${req.user.role}' is not authorized to perform this action`));
    }
    next();
  };
};
