import { Router } from 'express';
import { getHospitals, getDoctors, createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/hospitals', getHospitals);
router.get('/doctors', getDoctors);
router.get('/', authenticate, getAppointments);
router.post('/', authenticate, createAppointment);
router.patch('/:id/status', authenticate, updateAppointmentStatus);

export default router;
