import { Router } from 'express';
import { createPrescription, getPrescriptions } from '../controllers/prescriptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getPrescriptions);
router.post('/', authenticate, createPrescription);

export default router;
