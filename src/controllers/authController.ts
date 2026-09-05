import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../config/db';
import { config } from '../config/env';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, full_name, role, phone, city, address } = req.body;

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const password_hash = await bcrypt.hash(password, 10);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, city, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, email, password_hash, full_name, role, phone || null, city || null, address || null);

    // Generate token
    const token = jwt.sign({ id, email, role }, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id, email, full_name, role, phone, city, address }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          city: user.city,
          address: user.address,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');

    const user = db.prepare('SELECT id, email, full_name, role, phone, city, address, created_at FROM users WHERE id = ?').get(req.user.id);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};
