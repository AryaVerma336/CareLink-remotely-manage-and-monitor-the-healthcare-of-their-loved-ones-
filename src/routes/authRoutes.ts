import { Router } from 'express';
import { z } from 'zod';
import { register, login, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(2),
    role: z.enum(['relative', 'patient', 'hospital', 'pharmacist', 'driver', 'admin']),
    phone: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
