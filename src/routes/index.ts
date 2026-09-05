import { Router } from 'express';
import authRoutes from './authRoutes';
import appointmentRoutes from './appointmentRoutes';
import medicineRoutes from './medicineRoutes';
import tripRoutes from './tripRoutes';
import prescriptionRoutes from './prescriptionRoutes';
import emergencyRoutes from './emergencyRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medicines', medicineRoutes);
router.use('/trips', tripRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'CareLink Health Management Platform',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
